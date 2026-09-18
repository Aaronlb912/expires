function isoFromToday(days) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function sampleBook() {
  return {
    title: 'Pell Street Motors',
    dueWindowDays: 30,
    papers: [
      {
        id: 'paper-liability',
        name: 'Garage liability',
        kind: 'insurance',
        expires: isoFromToday(12),
        where: 'Desk drawer, left',
        issuer: 'Westfield Mutual',
        ref: 'WFM-4418',
        termMonths: 12,
        notes: 'Rita Alvarez. rita@pellstreet.example. Call if the binder is out.',
      },
      {
        id: 'paper-plates',
        name: 'Dealer plates, truck 4',
        kind: 'plates',
        expires: isoFromToday(-18),
        where: 'Glove box',
        issuer: 'County clerk',
        ref: 'DLR 4',
        termMonths: 12,
        notes: 'Dale Pruitt keeps the extra set on the hook by the lift. Already late.',
      },
      {
        id: 'paper-permit',
        name: 'Front lot sign permit',
        kind: 'permit',
        expires: isoFromToday(6),
        where: 'File cabinet, second drawer',
        issuer: 'City hall, signs desk',
        ref: 'SGN-19-084',
        termMonths: 12,
        notes: 'City hall copy. Ask Rita if the sticker is missing.',
      },
      {
        id: 'paper-domain',
        name: 'pellstreetmotors.example',
        kind: 'domain',
        expires: isoFromToday(126),
        where: 'Shop PC, registrar bookmark',
        issuer: 'Registrar on the shop PC',
        ref: 'pellstreetmotors.example',
        termMonths: 12,
        notes: 'Login is Dale. Email dale@pellstreet.example.',
      },
      {
        id: 'paper-warranty',
        name: 'Air compressor warranty',
        kind: 'warranty',
        expires: isoFromToday(248),
        where: 'Box on the parts shelf',
        issuer: 'Harbor tool, used lot',
        ref: '',
        termMonths: 12,
        notes: 'Bought used. Receipt is in the same box.',
      },
    ],
  }
}

export function sampleEmptyBook() {
  return {
    title: 'Pell Street Motors',
    papers: [],
    dueWindowDays: 30,
  }
}
