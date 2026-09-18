import { useEffect, useState } from 'react'
import { Workspace, normalizeBook, sampleBook } from './lib/index.js'
import { How } from './site/How.jsx'
import { Landing } from './site/Landing.jsx'
import { SignIn } from './site/SignIn.jsx'
import { go, pathFromHash } from './site/hash.js'
import { clearSession, readSession } from './site/session.js'
import './lib/expires.css'

const STORAGE_KEY = 'expires-book'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizeBook(JSON.parse(raw))
    return normalizeBook(sampleBook())
  } catch {
    return normalizeBook(sampleBook())
  }
}

function writeStored(book) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(book))
  } catch {
    // Demo still runs if storage is blocked.
  }
}

export default function App() {
  const [book, setBook] = useState(readStored)
  const [path, setPath] = useState(pathFromHash)
  const [session, setSession] = useState(readSession)

  useEffect(() => {
    function syncHash() {
      const next = pathFromHash()
      const raw = String(window.location.hash || '#/')
      if (!window.location.hash) {
        window.location.hash = '#/'
        return
      }
      if (raw !== `#${next}` && next === '/') {
        window.location.hash = '#/'
        return
      }
      setPath(next)
    }
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  useEffect(() => {
    if (path === '/desk' && !session.open) {
      go('/sign-in')
    }
  }, [path, session.open])

  function change(next) {
    const normalized = normalizeBook(next)
    setBook(normalized)
    writeStored(normalized)
  }

  function signedIn() {
    setSession(readSession())
  }

  function signOut() {
    clearSession()
    setSession({ open: false, shop: '' })
    go('/')
  }

  let page = <Landing signedIn={session.open} />
  if (path === '/desk' && !session.open) {
    page = (
      <SignIn
        book={book}
        onBook={change}
        onSignedIn={signedIn}
      />
    )
  } else if (path === '/desk') {
    page = (
      <Workspace
        value={book}
        onChange={change}
        onHow={() => go('/how')}
        onSignOut={signOut}
      />
    )
  } else if (path === '/sign-in') {
    page = (
      <SignIn
        book={book}
        signedIn={session.open}
        onBook={change}
        onSignedIn={signedIn}
      />
    )
  } else if (path === '/how') {
    page = <How signedIn={session.open} />
  }

  return <div key={path}>{page}</div>
}
