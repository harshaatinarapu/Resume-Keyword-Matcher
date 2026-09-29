// Categorized skill/tool vocabulary used for keyword extraction, plus a
// synonym map used for partial/semantic matching (e.g. "JS" <-> "JavaScript").
// This is intentionally data, not logic, so you can extend it (or load it
// from a CMS / API) without touching KeywordAnalyzer.js.

export const HARD_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang',
  'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'sql', 'nosql', 'html',
  'css', 'sass', 'react', 'react native', 'vue', 'angular', 'next.js',
  'node.js', 'express', 'django', 'flask', 'spring boot', 'graphql', 'rest api',
  'redux', 'tailwind css', 'webpack', 'vite', 'jquery',
  'machine learning', 'deep learning', 'nlp', 'computer vision',
  'data analysis', 'data engineering', 'data visualization', 'pandas',
  'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'power bi', 'tableau',
  'excel', 'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes',
  'terraform', 'ansible', 'ci/cd', 'jenkins', 'github actions', 'git',
  'linux', 'bash', 'microservices', 'devops', 'sre', 'agile', 'scrum',
  'kanban', 'jira', 'confluence', 'postgresql', 'mysql', 'mongodb', 'redis',
  'elasticsearch', 'kafka', 'rabbitmq', 'graph databases', 'firebase',
  'figma', 'sketch', 'adobe xd', 'ui/ux design', 'wireframing',
  'a/b testing', 'seo', 'sem', 'google analytics', 'salesforce', 'hubspot',
  'project management', 'product management', 'stakeholder management',
  'financial modeling', 'budgeting', 'forecasting', 'gaap', 'quickbooks',
  'sap', 'erp', 'supply chain management', 'six sigma', 'lean manufacturing',
]

export const SOFT_SKILLS = [
  'communication', 'leadership', 'teamwork', 'collaboration',
  'problem solving', 'critical thinking', 'adaptability', 'time management',
  'attention to detail', 'creativity', 'conflict resolution',
  'decision making', 'emotional intelligence', 'negotiation',
  'public speaking', 'mentoring', 'coaching', 'strategic planning',
  'cross-functional collaboration', 'client relationship management',
  'analytical thinking', 'organization', 'multitasking', 'ownership',
]

export const TOOLS = [
  'slack', 'notion', 'asana', 'trello', 'zoom', 'microsoft office',
  'google workspace', 'zendesk', 'intercom', 'postman', 'vs code',
  'intellij', 'xcode', 'android studio', 'photoshop', 'illustrator',
  'premiere pro', 'canva', 'airtable', 'looker', 'mixpanel', 'segment',
  'datadog', 'new relic', 'grafana', 'prometheus',
]

// Canonical skill -> list of alternate surface forms it should also match.
// Used both to normalize resume/JD text and to detect "partial / semantic"
// matches (present under a different name rather than truly missing).
export const SYNONYMS = {
  // Note: deliberately no bare "js"/"ts"/"cv" abbreviations here. Short
  // abbreviations like these produce false positives against compound terms
  // (".js" inside "Node.js"/"React.js" reads as a standalone token once
  // punctuation is stripped) or genuinely ambiguous terms ("CV" as in
  // curriculum vitae vs. computer vision). Favor precision over recall for
  // anything under ~3 characters.
  'javascript': ['ecmascript'],
  'node.js': ['node', 'nodejs'],
  'react': ['react.js', 'reactjs'],
  'react native': ['rn'],
  'vue': ['vue.js', 'vuejs'],
  'next.js': ['nextjs', 'next js'],
  'postgresql': ['postgres', 'psql'],
  'mongodb': ['mongo'],
  'machine learning': ['ml'],
  'deep learning': ['dl'],
  'nlp': ['natural language processing'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'continuous delivery'],
  'ui/ux design': ['ui design', 'ux design', 'ui/ux', 'user experience design', 'user interface design'],
  'aws': ['amazon web services'],
  'gcp': ['google cloud platform'],
  'google cloud': ['gcp', 'google cloud platform'],
  'sql': ['structured query language'],
  'rest api': ['restful api', 'rest apis', 'restful apis'],
  'a/b testing': ['ab testing', 'split testing'],
  'seo': ['search engine optimization'],
  'sem': ['search engine marketing', 'paid search'],
  'project management': ['project management professional', 'pmp'],
  'six sigma': ['lean six sigma'],
  'communication': ['verbal communication', 'written communication'],
  'cross-functional collaboration': ['cross functional teams', 'cross-functional teams'],
  'problem solving': ['problem-solving'],
  'time management': ['prioritization'],
}

export const ALL_SKILLS = [...HARD_SKILLS, ...SOFT_SKILLS, ...TOOLS]

export function categoryOf(skill) {
  if (HARD_SKILLS.includes(skill)) return 'hard'
  if (SOFT_SKILLS.includes(skill)) return 'soft'
  if (TOOLS.includes(skill)) return 'tool'
  return 'hard'
}
