function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function newPaperId() {
  return uid('paper')
}

function pad(value) {
  return String(value).padStart(2, '0')
}

export function parseExpire(value) {
  const raw = String(value == null ? '' : value).trim()
  if (!raw) return { ok: false, reason: 'blank' }
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return { ok: false, reason: 'junk' }
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { ok: false, reason: 'junk' }
  }
  return { ok: true, date, iso: `${match[1]}-${match[2]}-${match[3]}` }
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function daysUntil(expireValue, now = new Date()) {
  const parsed = parseExpire(expireValue)
  if (!parsed.ok) return null
  const from = startOfDay(now)
  const to = startOfDay(parsed.date)
  return Math.round((to - from) / 86400000)
}

export function dueWindowOf(value) {
  const days = Number(value)
  if (days === 14 || days === 60) return days
  return 30
}

export function dueBucket(expireValue, now = new Date(), windowDays = 30) {
  const days = daysUntil(expireValue, now)
  if (days == null) return 'miss'
  if (days < 0) return 'late'
  const window = dueWindowOf(windowDays)
  if (days <= window) return 'soon'
  return 'later'
}

export function dueLabel(expireValue, now = new Date(), windowDays = 30) {
  const days = daysUntil(expireValue, now)
  if (days == null) return 'Needs a date'
  if (days < 0) {
    const late = Math.abs(days)
    return late === 1 ? 'Late by 1 day' : `Late by ${late} days`
  }
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days <= dueWindowOf(windowDays)) return `Due in ${days} days`
  return formatExpire(expireValue)
}

export function isHeld(paper, now = new Date()) {
  const days = daysUntil(paper && paper.holdUntil, now)
  return days != null && days >= 0
}

export function formatExpire(value) {
  const parsed = parseExpire(value)
  if (!parsed.ok) return ''
  return parsed.date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const MAILER_MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
]

export function formatMailerDate(value) {
  const parsed = parseExpire(value)
  if (!parsed.ok) return ''
  return `${MAILER_MONTHS[parsed.date.getMonth()]} ${parsed.date.getDate()}, ${parsed.date.getFullYear()}`
}

export function termMonthsOf(paper) {
  const months = Number(paper && paper.termMonths)
  if (!Number.isFinite(months) || months < 1) return 12
  return Math.round(months)
}

export function addMonthsIso(expireValue, months) {
  const parsed = parseExpire(expireValue)
  if (!parsed.ok) return { ok: false, reason: parsed.reason }
  const count = Number(months)
  if (!Number.isFinite(count) || count < 1) return { ok: false, reason: 'junk' }
  const src = parsed.date
  const day = src.getDate()
  const next = new Date(src.getFullYear(), src.getMonth() + Math.round(count), 1)
  const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  next.setDate(Math.min(day, last))
  return {
    ok: true,
    iso: `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`,
  }
}

export function renewPaper(paper) {
  const current = normalizePaper(paper)
  const rolled = addMonthsIso(current.expires, termMonthsOf(current))
  if (!rolled.ok) return rolled
  return {
    ok: true,
    paper: {
      ...current,
      previousExpires: current.expires,
      expires: rolled.iso,
    },
  }
}

function rankPaper(paper, now = new Date()) {
  const days = daysUntil(paper.expires, now)
  if (days == null) return -99999
  return days
}

export function splitPapers(papers, now = new Date(), windowDays = 30) {
  const late = []
  const soon = []
  const rest = []
  papers.forEach((paper) => {
    const bucket = dueBucket(paper.expires, now, windowDays)
    if (bucket === 'late' && isHeld(paper, now)) rest.push(paper)
    else if (bucket === 'later') rest.push(paper)
    else if (bucket === 'late') late.push(paper)
    else soon.push(paper)
  })
  late.sort((left, right) => rankPaper(left, now) - rankPaper(right, now) || left.name.localeCompare(right.name))
  soon.sort((left, right) => rankPaper(left, now) - rankPaper(right, now) || left.name.localeCompare(right.name))
  rest.sort((left, right) => rankPaper(left, now) - rankPaper(right, now) || left.name.localeCompare(right.name))
  return { late, soon, rest }
}

export function groupByKind(papers) {
  const groups = []
  const seen = new Map()
  papers.forEach((paper) => {
    const label = String(paper.kind || 'paper').trim() || 'paper'
    const key = label.toLowerCase()
    if (!seen.has(key)) {
      const group = { kind: label, papers: [] }
      seen.set(key, group)
      groups.push(group)
    }
    seen.get(key).papers.push(paper)
  })
  groups.sort((left, right) => left.kind.localeCompare(right.kind))
  return groups
}

export function kindsFrom(papers) {
  const seen = []
  papers.forEach((paper) => {
    const kind = String(paper.kind || '').trim()
    if (!kind) return
    if (seen.some((item) => item.toLowerCase() === kind.toLowerCase())) return
    seen.push(kind)
  })
  return seen.sort((left, right) => left.localeCompare(right))
}

export function paperMatches(paper, query, kind) {
  if (kind && String(paper.kind || '').toLowerCase() !== kind.toLowerCase()) {
    return false
  }
  const needle = String(query || '').trim().toLowerCase()
  if (!needle) return true
  const hay = [paper.name, paper.kind, paper.where, paper.issuer, paper.notes, paper.ref]
    .join(' ')
    .toLowerCase()
  return hay.includes(needle)
}

export function duplicatePaper(paper) {
  const copy = normalizePaper(paper)
  copy.id = newPaperId()
  copy.name = copy.name ? `${copy.name} (copy)` : ''
  return copy
}

export function parseBookText(text) {
  try {
    return { ok: true, book: normalizeBook(JSON.parse(text)) }
  } catch {
    return { ok: false, reason: 'junk' }
  }
}

export function parseCost(value) {
  if (value === '' || value == null) return { ok: true, value: '' }
  const raw = String(value).trim()
  if (!raw) return { ok: true, value: '' }
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return { ok: false, reason: 'junk' }
  return { ok: true, value: n }
}

function asCost(value) {
  const parsed = parseCost(value)
  if (parsed.ok) return parsed.value
  return String(value).trim()
}

export function normalizePaper(paper, index = 0) {
  const raw = paper && typeof paper === 'object' ? paper : {}
  const expires = raw.expires ?? raw.expire ?? raw.expireDate ?? raw.date ?? ''
  return {
    id: String(raw.id || `paper-${index + 1}`),
    name: String(raw.name ?? raw.title ?? '').trim(),
    kind: String(raw.kind ?? raw.type ?? '').trim(),
    expires: String(expires).trim(),
    where: String(raw.where ?? raw.location ?? raw.file ?? '').trim(),
    issuer: String(raw.issuer ?? raw.who ?? raw.vendor ?? '').trim(),
    notes: String(raw.notes ?? '').trim(),
    ref: String(raw.ref ?? raw.plate ?? raw.policy ?? '').trim(),
    termMonths: termMonthsOf(raw),
    previousExpires: String(raw.previousExpires ?? '').trim(),
    holdUntil: String(raw.holdUntil ?? '').trim(),
    cost: asCost(raw.cost),
  }
}

export function blankPaper() {
  return {
    id: newPaperId(),
    name: '',
    kind: '',
    expires: '',
    where: '',
    issuer: '',
    notes: '',
    ref: '',
    termMonths: 12,
    previousExpires: '',
    holdUntil: '',
    cost: '',
  }
}

export function blankBook() {
  return {
    title: 'Papers',
    papers: [],
    dueWindowDays: 30,
  }
}

export function normalizeBook(data) {
  const raw = data && typeof data === 'object' ? data : {}
  if (Array.isArray(raw.papers) || Array.isArray(raw.items) || raw.kind === 'expires') {
    const list = Array.isArray(raw.papers) ? raw.papers : Array.isArray(raw.items) ? raw.items : []
    return {
      title: String(raw.title || '').trim() || 'Papers',
      papers: list.map((paper, index) => normalizePaper(paper, index)),
      dueWindowDays: dueWindowOf(raw.dueWindowDays),
    }
  }
  if (raw.name || raw.expires || raw.expire || raw.date) {
    return {
      title: 'Papers',
      papers: [normalizePaper(raw, 0)],
      dueWindowDays: 30,
    }
  }
  return blankBook()
}

function download(filename, text, type) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function fileName(title) {
  const slug = String(title || 'papers')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'papers'
  return `${slug}.json`
}

export function downloadBook(book) {
  download(
    fileName(book.title),
    `${JSON.stringify(normalizeBook(book), null, 2)}\n`,
    'application/json',
  )
}
