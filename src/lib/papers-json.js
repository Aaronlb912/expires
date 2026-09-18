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

export function dueBucket(expireValue, now = new Date()) {
  const days = daysUntil(expireValue, now)
  if (days == null) return 'miss'
  if (days < 0) return 'late'
  if (days <= 30) return 'soon'
  return 'later'
}

export function dueLabel(expireValue, now = new Date()) {
  const days = daysUntil(expireValue, now)
  if (days == null) return 'Needs a date'
  if (days < 0) {
    const late = Math.abs(days)
    return late === 1 ? 'Late by 1 day' : `Late by ${late} days`
  }
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days <= 30) return `Due in ${days} days`
  return parseExpire(expireValue).iso
}

export function splitPapers(papers, now = new Date()) {
  const soon = []
  const rest = []
  papers.forEach((paper) => {
    const bucket = dueBucket(paper.expires, now)
    if (bucket === 'later') rest.push(paper)
    else soon.push(paper)
  })
  function rank(paper) {
    const days = daysUntil(paper.expires, now)
    if (days == null) return -99999
    return days
  }
  soon.sort((left, right) => rank(left) - rank(right) || left.name.localeCompare(right.name))
  rest.sort((left, right) => rank(left) - rank(right) || left.name.localeCompare(right.name))
  return { soon, rest }
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
    notes: String(raw.notes ?? '').trim(),
  }
}

export function blankPaper() {
  return {
    id: newPaperId(),
    name: '',
    kind: '',
    expires: '',
    where: '',
    notes: '',
  }
}

export function blankBook() {
  return {
    title: 'Papers',
    papers: [],
  }
}

export function normalizeBook(data) {
  const raw = data && typeof data === 'object' ? data : {}
  if (Array.isArray(raw.papers) || Array.isArray(raw.items) || raw.kind === 'expires') {
    const list = Array.isArray(raw.papers) ? raw.papers : Array.isArray(raw.items) ? raw.items : []
    return {
      title: String(raw.title || '').trim() || 'Papers',
      papers: list.map((paper, index) => normalizePaper(paper, index)),
    }
  }
  if (raw.name || raw.expires || raw.expire || raw.date) {
    return {
      title: 'Papers',
      papers: [normalizePaper(raw, 0)],
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
