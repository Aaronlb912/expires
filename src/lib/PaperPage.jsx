import { useEffect, useState } from 'react'
import { normalizePaper, parseExpire } from './papers-json.js'
import './expires.css'

export function PaperPage({ paper, mode, onSave, onCancel, onRemove }) {
  const isNew = mode === 'new'
  const [name, setName] = useState(paper.name || '')
  const [kind, setKind] = useState(paper.kind || '')
  const [expires, setExpires] = useState(paper.expires || '')
  const [where, setWhere] = useState(paper.where || '')
  const [notes, setNotes] = useState(paper.notes || '')
  const [miss, setMiss] = useState('')

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function save(event) {
    event.preventDefault()
    if (!name.trim()) {
      setMiss('Need a name.')
      return
    }
    const parsed = parseExpire(expires)
    if (!parsed.ok && parsed.reason === 'blank') {
      setMiss('Need an expire date (YYYY-MM-DD).')
      return
    }
    if (!parsed.ok) {
      setMiss('That date is junk. Use YYYY-MM-DD.')
      return
    }
    setMiss('')
    onSave(normalizePaper({
      ...paper,
      name,
      kind,
      expires: parsed.iso,
      where,
      notes,
    }))
  }

  const heading = isNew ? 'New paper' : name.trim() || 'Untitled paper'

  return (
    <div className="ex ex-page">
      <p className="ex-kicker">{isNew ? 'Add a paper' : 'Open a paper'}</p>
      <h1>{heading}</h1>
      <p className="ex-note">Escape goes back without saving.</p>

      {miss ? <p className="ex-miss" role="alert">{miss}</p> : null}

      <form className="ex-form" onSubmit={save}>
        <label className="ex-field">
          <span>Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </label>
        <label className="ex-field">
          <span>Kind</span>
          <input
            value={kind}
            placeholder="warranty, plates, permit, insurance, domain"
            onChange={(event) => setKind(event.target.value)}
          />
        </label>
        <label className="ex-field">
          <span>Expire date</span>
          <input
            value={expires}
            placeholder="YYYY-MM-DD"
            onChange={(event) => setExpires(event.target.value)}
          />
        </label>
        <label className="ex-field">
          <span>Where it lives</span>
          <input
            value={where}
            placeholder="Desk drawer, glove box, file cabinet"
            onChange={(event) => setWhere(event.target.value)}
          />
        </label>
        <label className="ex-field">
          <span>Notes</span>
          <textarea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <div className="ex-actions">
          <button type="submit">Save</button>
          <button type="button" className="ex-secondary" onClick={onCancel}>
            Cancel
          </button>
          {onRemove ? (
            <button type="button" className="ex-quiet" onClick={onRemove}>
              Remove
            </button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
