export function pathFromHash() {
  const raw = String(window.location.hash || '#/').replace(/^#/, '')
  const path = raw.split('?')[0] || '/'
  if (path === '/sign-in') return '/sign-in'
  if (path === '/how') return '/how'
  if (path === '/desk') return '/desk'
  if (path === '/' || path === '') return '/'
  return '/'
}

export function go(path) {
  const next = path.startsWith('/') ? path : `/${path}`
  if (window.location.hash === `#${next}`) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = next
}
