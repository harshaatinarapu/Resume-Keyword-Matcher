# Gapless — Resume Keyword Matcher

Paste a job description, upload (or paste) a resume, and get a weighted
match score plus a breakdown of matched / missing / partially-matched
keywords, a frequency table, and actionable recommendations you can copy or
download.

Everything runs client-side — parsing, matching, and scoring all happen in
the browser. Nothing is uploaded to a server.

---

## 1. Setup

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). The app
opens on `/login` — use "Continue as guest" to skip auth entirely, or sign
up with any email/6+ character password (this is a mocked, client-only
auth layer backed by `localStorage`; see `src/hooks/useAuth.js`).

```bash
npm run build      # production build to dist/
npm run preview    # serve that build locally
```

---

## 2. Project structure

```
src/
├── pages/
│   ├── LoginPage.jsx          Split-screen auth (sign in / sign up / guest)
│   └── DashboardPage.jsx      Main analysis page - inputs, analyze button, results
│
├── components/
│   ├── dashboard/
│   │   ├── Header.jsx             Logo, avatar, logout
│   │   ├── ResumeInput.jsx         Drag-and-drop dropzone + paste-text toggle
│   │   ├── JobDescriptionInput.jsx Job title/company fields + JD textarea
│   │   ├── ResultsSection.jsx      Tabbed results container + export actions
│   │   ├── ScoreCard.jsx           Big score ring, red/yellow/green banding
│   │   ├── MetricsGrid.jsx         Matched / Missing / Density metric cards
│   │   ├── SkillBadgeList.jsx      Found / missing / partial skill badges
│   │   ├── FrequencyTable.jsx      Term-by-term JD vs. resume frequency table
│   │   └── Recommendations.jsx     Bulleted, prioritized suggestions
│   └── shared/
│       ├── Logo.jsx, LoadingSpinner.jsx, ErrorBanner.jsx
│
├── utils/
│   ├── KeywordAnalyzer.js     Extraction, matching, scoring, recommendations
│   ├── fileParser.js          PDF/DOCX/TXT -> plain text, with error handling
│   ├── skillsDatabase.js      Skill dictionaries + synonym table (data only)
│   └── reportExport.js        Builds the plain-text report; copy/download helpers
│
├── hooks/useAuth.js           Mock auth (localStorage-backed)
├── context/AuthContext.jsx    Shares one auth instance across the app
├── App.jsx                    Routes (/login, /dashboard) + auth gating
├── main.jsx, index.css
```

---

## 3. How matching works (`KeywordAnalyzer.js`)

1. **Normalize** both texts (lowercase, strip punctuation except the
   characters real skill names need: `. + # /`).
2. **Extract keywords**: scan for every skill in `skillsDatabase.js` and its
   known synonyms (longest phrases first, so "React Native" isn't swallowed
   by "React"), counting occurrences per canonical skill.
3. **Compare**:
   - **Exact match** — canonical skill found (via any synonym) in both docs.
   - **Partial / semantic match** — not an exact hit, but a JD skill is a
     close (Levenshtein-similarity ≥ 84%) match to something already in the
     resume: either a recognized-but-differently-phrased skill, or a raw
     word/phrase token (catches typos and plurals like "kubernete" or
     "dockers").
   - **Missing** — everything else.
4. **Score**: each JD skill is weighted by category (hard skill ×1, tool
   ×0.9, soft skill ×0.6) and its frequency in the JD (capped at 5×, so one
   very repeated term can't dominate the whole score). Exact matches get
   full weight, partial matches get 50% credit. Score = matched+partial
   weight ÷ total weight × 100.
5. **Frequency table** and **recommendations** are built from the same
   underlying match data.

This is a heuristic, dictionary-based matcher, not a trained NLP model — see
[Known limitations](#5-known-limitations--how-id-extend-this) below.

---

## 4. Edge cases handled

**File parsing (`fileParser.js`)**
- Empty file / file over 10MB / unsupported extension → rejected before
  parsing starts, with a specific message.
- Corrupted or password-protected PDF → caught, friendly message.
- Scanned/image-only PDF (no extractable text layer) → detected and flagged
  rather than silently returning an empty analysis.
- Corrupted `.docx` or legacy `.doc` (unsupported) → caught.
- Any unexpected parsing exception → caught by a catch-all so the UI never
  crashes; the dropzone always resolves to either text or a clear error.

**Analysis (`KeywordAnalyzer.js`)**
- Empty or whitespace-only resume/JD → `AnalyzerError` before any matching
  runs.
- Garbled/non-text content (e.g. a bad OCR dump) → flagged via an
  alphanumeric-density check rather than producing a nonsense 0% score.
- Extremely short input (fewer than 8 words) → flagged as too short to
  analyze meaningfully.
- Job description with no recognizable skills at all → flagged explicitly
  ("paste the full listing") instead of returning a misleading 0%.

**UI**
- Analyze button is disabled until both fields have content.
- `DashboardPage` catches `AnalyzerError` specifically (friendly message) vs.
  any other unexpected error (generic fallback) so a bug in the app doesn't
  look like bad resume advice.

---

## 5. Known limitations / how I'd extend this

- **Matching is dictionary + fuzzy-string based**, not true semantic/ML
  matching. It won't know that "led a team of 5 engineers" implies
  "leadership" unless "leadership" (or a listed synonym) appears literally.
  A production version could send both texts to an embeddings API and do
  cosine-similarity matching per skill for genuine semantic recall.
- **`skillsDatabase.js` is hand-curated** and tech/business-role leaning.
  Extend `HARD_SKILLS` / `SOFT_SKILLS` / `TOOLS` / `SYNONYMS` for other
  industries, or load them from a CMS.
- **No real backend** — auth is mocked in `localStorage` and nothing is
  persisted across devices. Swap `useAuth.js`'s `signIn`/`signUp` for real
  API calls; the `{ user, error }` return shape is designed to make that a
  one-file change.
- **PDF/DOCX parsing is client-side** (`pdfjs-dist` + `mammoth`), which
  keeps resumes off any server but means very large or unusually-formatted
  files may extract text in a different reading order than the visual
  layout suggests.

---

## 6. Tech stack

- React 18 + React Router
- Tailwind CSS
- `pdfjs-dist` (PDF text extraction, client-side)
- `mammoth` (DOCX text extraction, client-side)
- Vite
