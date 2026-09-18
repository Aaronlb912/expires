import { useState } from 'react'
import { Workspace, normalizeBook, sampleBook } from './lib/index.js'

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

  function change(next) {
    const normalized = normalizeBook(next)
    setBook(normalized)
    writeStored(normalized)
  }

  return <Workspace value={book} onChange={change} />
}
