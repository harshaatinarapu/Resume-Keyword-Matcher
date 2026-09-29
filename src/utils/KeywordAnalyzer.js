import { ALL_SKILLS, SYNONYMS, categoryOf } from './skillsDatabase.js'

/**
 * Thrown for problems with the *content* being analyzed (empty, unreadable,
 * too generic) as opposed to bugs. DashboardPage catches this specifically
 * so it can show a friendly, actionable message instead of a stack trace.
 */
export class AnalyzerError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'AnalyzerError'
    this.code = code
  }
}

const CATEGORY_WEIGHT = { hard: 1, tool: 0.9, soft: 0.6 }
const PARTIAL_CREDIT = 0.5 // a "semantic/partial" match counts for half of an exact one
const FUZZY_THRESHOLD = 0.84 // similarity ratio (0-1) above which two strings count as a partial match

// --- Text normalization -----------------------------------------------

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .replace(/[^a-z0-9\.\+\#\/\s'-]/g, ' ') // keep chars used by skills like c++, c#, ci/cd, node.js
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Build a flat list of [variantString, canonicalSkill] pairs, longest first,
// so multi-word phrases ("react native") are matched before their shorter
// substrings ("react").
function buildVariantIndex() {
  const pairs = []
  for (const skill of ALL_SKILLS) {
    pairs.push([skill, skill])
    for (const variant of SYNONYMS[skill] || []) {
      pairs.push([variant, skill])
    }
  }
  return pairs.sort((a, b) => b[0].length - a[0].length)
}

const VARIANT_INDEX = buildVariantIndex()

/**
 * Scans normalized text for every known skill/variant and returns a map of
 * canonicalSkill -> { count, category, matchedForms: Set<string> }.
 */
export function extractKeywords(rawText) {
  const text = normalize(rawText)
  const found = new Map()

  for (const [variant, canonical] of VARIANT_INDEX) {
    const pattern = new RegExp(`(?<![a-z0-9])${escapeRegExp(variant)}(?![a-z0-9])`, 'g')
    const matches = text.match(pattern)
    if (!matches || matches.length === 0) continue

    const entry = found.get(canonical) || {
      count: 0,
      category: categoryOf(canonical),
      matchedForms: new Set(),
    }
    entry.count += matches.length
    entry.matchedForms.add(variant)
    found.set(canonical, entry)
  }

  return found
}

// --- Fuzzy matching for partial / semantic detection --------------------

function levenshtein(a, b) {
  const m = a.length, n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  return dp[m][n]
}

function similarity(a, b) {
  const distance = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length) || 1
  return 1 - distance / maxLen
}

// Unigrams + adjacent bigrams from the resume text, used as fuzzy-match
// candidates so a typo or plural ("dockers", "kubernete") can still surface
// as a partial match instead of silently falling through to "missing".
function extractCandidateTokens(rawText) {
  const words = normalize(rawText)
    .split(' ')
    .filter((w) => w.length >= 3)

  const candidates = new Set(words)
  for (let i = 0; i < words.length - 1; i++) {
    candidates.add(`${words[i]} ${words[i + 1]}`)
  }
  return candidates
}

// --- Content sanity checks ----------------------------------------------

function assertUsableText(text, label) {
  if (!text || !text.trim()) {
    throw new AnalyzerError(`Your ${label} is empty. Add some text before analyzing.`, 'EMPTY_INPUT')
  }
  const alnum = (text.match(/[a-z0-9]/gi) || []).length
  if (alnum / text.length < 0.35) {
    throw new AnalyzerError(
      `Your ${label} looks garbled rather than readable text - this often happens with scanned or image-based PDFs. Try pasting the text directly instead.`,
      'UNREADABLE_TEXT'
    )
  }
  if (text.trim().split(/\s+/).length < 8) {
    throw new AnalyzerError(`Your ${label} looks too short to analyze meaningfully. Add more detail.`, 'TOO_SHORT')
  }
}

// --- Main analysis --------------------------------------------------------

/**
 * @param {string} resumeText  Plain text extracted from the resume.
 * @param {string} jdText      Plain text of the job description.
 * @returns {object} Full analysis result consumed by the results dashboard.
 */
export function analyze(resumeText, jdText) {
  assertUsableText(resumeText, 'resume')
  assertUsableText(jdText, 'job description')

  const resumeMap = extractKeywords(resumeText)
  const jdMap = extractKeywords(jdText)

  if (jdMap.size === 0) {
    throw new AnalyzerError(
      "We couldn't recognize any specific skills, tools, or qualifications in that job description. Paste the full listing, including the requirements/qualifications section.",
      'NO_JD_KEYWORDS'
    )
  }

  const matched = []
  const missing = []
  const partial = []

  // Candidates a missing JD skill can be fuzzy-matched against: skills the
  // resume already exactly matched (e.g. a JD phrase worded slightly
  // differently) plus raw word/phrase tokens (catches typos and plurals
  // that never made it into resumeMap at all).
  const resumeCandidates = new Set([
    ...resumeMap.keys(),
    ...extractCandidateTokens(resumeText),
  ])

  for (const [skill, jdEntry] of jdMap) {
    if (resumeMap.has(skill)) {
      matched.push({
        skill,
        category: jdEntry.category,
        jdCount: jdEntry.count,
        resumeCount: resumeMap.get(skill).count,
      })
      continue
    }

    // Not an exact/synonym hit - look for a close spelling/phrasing match
    // already present in the resume (e.g. "leadership skill" vs "leadership",
    // or a typo like "kubernete" for "kubernetes").
    let bestMatch = null
    let bestScore = 0
    for (const candidate of resumeCandidates) {
      // Skip comparisons where length differs too much to plausibly be a
      // typo/plural of each other - keeps this fast and avoids nonsense
      // matches between a short skill and an unrelated long phrase.
      if (Math.abs(candidate.length - skill.length) > 3) continue
      const score = similarity(skill, candidate)
      if (score > bestScore) {
        bestScore = score
        bestMatch = candidate
      }
    }

    if (bestMatch && bestScore >= FUZZY_THRESHOLD) {
      partial.push({
        skill,
        category: jdEntry.category,
        jdCount: jdEntry.count,
        resumeCount: resumeMap.get(bestMatch)?.count || 0,
        matchedAs: bestMatch,
        confidence: Math.round(bestScore * 100),
      })
    } else {
      missing.push({ skill, category: jdEntry.category, jdCount: jdEntry.count, resumeCount: 0 })
    }
  }

  // Sort each bucket so the most important (highest JD frequency) items lead.
  const byJdCount = (a, b) => b.jdCount - a.jdCount
  matched.sort(byJdCount)
  partial.sort(byJdCount)
  missing.sort(byJdCount)

  const score = calculateScore(matched, partial, missing)
  const frequencyTable = buildFrequencyTable(jdMap, resumeMap)
  const recommendations = buildRecommendations(missing, partial)

  return {
    score,
    matched,
    partial,
    missing,
    frequencyTable,
    recommendations,
    totals: {
      jdKeywords: jdMap.size,
      matchedCount: matched.length,
      partialCount: partial.length,
      missingCount: missing.length,
    },
  }
}

function calculateScore(matched, partial, missing) {
  const weight = (item) => (CATEGORY_WEIGHT[item.category] ?? 1) * Math.min(item.jdCount, 5)

  const matchedWeight = matched.reduce((sum, m) => sum + weight(m), 0)
  const partialWeight = partial.reduce((sum, m) => sum + weight(m) * PARTIAL_CREDIT, 0)
  const missingWeight = missing.reduce((sum, m) => sum + weight(m), 0)

  const totalWeight = matchedWeight + partialWeight + missingWeight
  if (totalWeight === 0) return 0

  const raw = ((matchedWeight + partialWeight) / totalWeight) * 100
  return Math.max(0, Math.min(100, Math.round(raw)))
}

function buildFrequencyTable(jdMap, resumeMap) {
  return Array.from(jdMap.entries())
    .map(([skill, jdEntry]) => ({
      skill,
      category: jdEntry.category,
      jdCount: jdEntry.count,
      resumeCount: resumeMap.get(skill)?.count || 0,
    }))
    .sort((a, b) => b.jdCount - a.jdCount)
}

function titleCase(skill) {
  return skill.replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildRecommendations(missing, partial) {
  const recs = []

  for (const item of missing.slice(0, 8)) {
    const timesText = item.jdCount > 1 ? `${item.jdCount} times` : 'once'
    recs.push(
      `Add "${titleCase(item.skill)}" - it appears ${timesText} in the job description but isn't in your resume. Work it into a relevant experience or project bullet, not just a skills list.`
    )
  }

  for (const item of partial.slice(0, 5)) {
    recs.push(
      `You mention "${titleCase(item.matchedAs)}", but the listing uses "${titleCase(item.skill)}". Match its exact phrasing somewhere so keyword scanners reliably pick it up.`
    )
  }

  if (recs.length === 0) {
    recs.push('Your resume already covers the key terms in this job description well. Consider reordering bullets so the strongest matches appear near the top.')
  }

  return recs
}
