const SESSION_KEY = 'expires-session'
const PIN_KEY = 'expires-pins'

export const PELL = 'Pell Street Motors'

export function readSession() {
  try {
    const raw = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (raw && raw.open && String(raw.shop || '').trim()) {
      return { open: true, shop: String(raw.shop).trim() }
    }
  } catch {
    // Demo still runs if storage is blocked.
  }
  return { open: false, shop: '' }
}

export function writeSession(session) {
  try {
    if (!session || !session.open) {
      localStorage.removeItem(SESSION_KEY)
      return
    }
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ open: true, shop: String(session.shop || '').trim() }),
    )
  } catch {
    // Demo still runs if storage is blocked.
  }
}

export function readPins() {
  try {
    const raw = JSON.parse(localStorage.getItem(PIN_KEY) || '{}')
    if (raw && typeof raw === 'object') return raw
  } catch {
    // ignore
  }
  return {}
}

export function pinFor(shop) {
  const name = String(shop || '').trim()
  const pin = readPins()[name]
  return pin == null ? '' : String(pin)
}

export function savePin(shop, pin) {
  const name = String(shop || '').trim()
  if (!name) return
  const next = { ...readPins() }
  const value = String(pin || '').trim()
  if (value) next[name] = value
  else delete next[name]
  try {
    localStorage.setItem(PIN_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export function clearSession() {
  writeSession(null)
}
