import { useEffect, useState } from 'react'
import {
  addMonthsIso,
  daysUntil,
  dueBucket,
  formatExpire,
  formatMailerDate,
  normalizePaper,
  parseExpire,
  termMonthsOf,
} from './papers-json.js'
import './expires.css'

export function PaperPage({
  paper,
  mode,
  kinds = [],
  onSave,
  onKeep,
  onCancel,
  onRemove,
  onDuplicate,
}) {
  const isNew = mode === 'new'
  const [name, setName] = useState(paper.name || '')
  const [kind, setKind] = useState(paper.kind || '')
  const [expires, setExpires] = useState(paper.expires || '')
  const [where, setWhere] = useState(paper.where || '')
  const [issuer, setIssuer] = useState(paper.issuer || '')
  const [notes, setNotes] = useState(paper.notes || '')
  const [termMonths, setTermMonths] = useState(String(termMonthsOf(paper)))
  const [previousExpires, setPreviousExpires] = useState(paper.previousExpires || '')
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
      setMiss('Need an expire date.')
      return
    }
    if (!parsed.ok) {
      setMiss('Use a real date.')
      return
    }
    setMiss('')
    onSave(normalizePaper({
      ...paper,
      name,
      kind,
      expires: parsed.iso,
      where,
      issuer,
      notes,
      termMonths,
      previousExpires,
    }))
  }

  function renew() {
    const parsed = parseExpire(expires)
    if (!parsed.ok && parsed.reason === 'blank') {
      setMiss('Need an expire date.')
      return
    }
    if (!parsed.ok) {
      setMiss('Use a real date.')
      return
    }
    const months = termMonthsOf({ termMonths })
    const rolled = addMonthsIso(parsed.iso, months)
    if (!rolled.ok) {
      setMiss('Use a real date.')
      return
    }
    setMiss('')
    setExpires(rolled.iso)
    setPreviousExpires(parsed.iso)
    setTermMonths(String(months))
    if (!isNew && onKeep) {
      onKeep(normalizePaper({
        ...paper,
        name,
        kind,
        expires: rolled.iso,
        where,
        issuer,
        notes,
        termMonths: months,
        previousExpires: parsed.iso,
      }))
    }
  }

  const bucket = dueBucket(expires)
  const days = daysUntil(expires)

  return (
    <div className="ex ex-page">
      <button type="button" className="ex-quiet ex-back" onClick={onCancel}>
        All papers
      </button>
      <p className={`ex-page-flag ex-page-flag-${bucket}`}>
        {bucket === 'late'
          ? `${Math.abs(days)} days late`
          : bucket === 'soon'
            ? `Due in ${days} days`
            : formatExpire(expires) || 'No date'}
      </p>
      <h1>{isNew ? 'New paper' : name.trim() || 'Untitled paper'}</h1>
      {!isNew ? (
        <p className="ex-good-thru ex-good-thru-page">
          <span>Good thru</span>
          <strong>{formatMailerDate(expires) || '—'}</strong>
        </p>
      ) : null}
      {previousExpires ? (
        <p className="ex-was-thru">Was good thru {formatMailerDate(previousExpires) || previousExpires}</p>
      ) : null}

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
            list="ex-kinds-list"
            onChange={(event) => setKind(event.target.value)}
          />
          {kinds.length > 0 ? (
            <datalist id="ex-kinds-list">
              {kinds.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          ) : null}
        </label>
        <label className="ex-field">
          <span>Expire date</span>
          <input
            type="date"
            value={expires}
            onChange={(event) => setExpires(event.target.value)}
          />
        </label>
        <label className="ex-field">
          <span>Term (months)</span>
          <input
            inputMode="numeric"
            value={termMonths}
            onChange={(event) => setTermMonths(event.target.value)}
          />
        </label>
        <label className="ex-field">
          <span>Where it lives</span>
          <input
            value={where}
            onChange={(event) => setWhere(event.target.value)}
          />
        </label>
        <label className="ex-field">
          <span>Who to call</span>
          <input
            value={issuer}
            onChange={(event) => setIssuer(event.target.value)}
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
          <button type="button" className="ex-sheet" onClick={renew}>
            Renew
          </button>
          <button type="button" className="ex-secondary" onClick={onCancel}>
            Cancel
          </button>
          {onDuplicate ? (
            <button type="button" className="ex-secondary" onClick={onDuplicate}>
              Duplicate
            </button>
          ) : null}
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
