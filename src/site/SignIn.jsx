import { useState } from 'react'
import { blankBook, normalizeBook } from '../lib/papers-json.js'
import { sampleBook } from '../lib/sample-papers.js'
import { go } from './hash.js'
import { PELL, pinFor, savePin, writeSession } from './session.js'
import './site.css'

export function SignIn({ book, signedIn, onBook, onSignedIn }) {
  const [shop, setShop] = useState(book.title && book.title !== 'Papers' ? book.title : '')
  const [pin, setPin] = useState('')
  const [miss, setMiss] = useState('')

  function openSession(name, nextBook) {
    const title = String(name || '').trim()
    writeSession({ open: true, shop: title })
    onBook(nextBook)
    onSignedIn()
    go('/desk')
  }

  function checkPin(name) {
    const stored = pinFor(name)
    if (!stored) return true
    if (String(pin).trim() === stored) return true
    setMiss('That PIN does not match.')
    return false
  }

  function openNamed() {
    const name = shop.trim()
    if (!name) {
      setMiss('Please type a name for this list.')
      return
    }
    if (!checkPin(name)) return
    savePin(name, pin)
    if (book.title === name) {
      openSession(name, book)
      return
    }
    openSession(name, normalizeBook({ ...blankBook(), title: name }))
  }

  function openPell() {
    setMiss('')
    savePin(PELL, '')
    if (book.title === PELL && book.papers && book.papers.length > 0) {
      openSession(PELL, book)
      return
    }
    if (!book.papers || book.papers.length === 0) {
      openSession(PELL, normalizeBook(sampleBook()))
      return
    }
    if (book.title === PELL) {
      openSession(PELL, book)
      return
    }
    openSession(PELL, normalizeBook(sampleBook()))
  }

  function startBlank() {
    const name = shop.trim()
    if (!name) {
      setMiss('Please type a name for this list.')
      return
    }
    savePin(name, pin)
    openSession(name, normalizeBook({ ...blankBook(), title: name }))
  }

  return (
    <div className="ex-site">
      <header className="ex-bar">
        <h1>Expires</h1>
      </header>
      <div className="ex-site-body">
        <h2 className="ex-site-title">Open your list</h2>
        <p className="ex-site-lede">
          This stays in this browser. There is no sign-up and no
          email. Name the shop or household so you can find it
          again.
        </p>
        <form
          className="ex-site-form"
          onSubmit={(event) => {
            event.preventDefault()
            openNamed()
          }}
        >
          <label>
            <span>Shop or household name</span>
            <input
              value={shop}
              onChange={(event) => setShop(event.target.value)}
              autoComplete="organization"
            />
          </label>
          <label>
            <span>PIN (optional, this computer only)</span>
            <input
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              autoComplete="off"
            />
          </label>
          {miss ? (
            <p className="ex-miss" role="alert">
              {miss}
            </p>
          ) : null}
          <div className="ex-site-actions">
            <button type="submit" className="ex-primary">
              Open this list
            </button>
            <button type="button" className="ex-secondary" onClick={openPell}>
              Open the Pell Street Motors sample
            </button>
            <button type="button" className="ex-quiet" onClick={startBlank}>
              Start with an empty list
            </button>
          </div>
        </form>
        {signedIn ? (
          <p className="ex-site-resume">
            <button type="button" className="ex-quiet" onClick={() => go('/desk')}>
              Back to your list
            </button>
          </p>
        ) : null}
        <p className="ex-site-nav">
          <button type="button" className="ex-quiet" onClick={() => go('/')}>
            Back
          </button>
        </p>
      </div>
    </div>
  )
}
