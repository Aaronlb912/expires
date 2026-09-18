import { useEffect, useState } from 'react'
import {
  addMonthsIso,
  daysUntil,
  dueBucket,
  formatMailerDate,
  normalizePaper,
  parseCost,
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
  onPrint,
}) {
  const isNew = mode === 'new'
  const [name, setName] = useState(paper.name || '')
  const [kind, setKind] = useState(paper.kind || '')
  const [expires, setExpires] = useState(paper.expires || '')
  const [ref, setRef] = useState(paper.ref || '')
  const [where, setWhere] = useState(paper.where || '')
  const [issuer, setIssuer] = useState(paper.issuer || '')
  const [notes, setNotes] = useState(paper.notes || '')
  const [termMonths, setTermMonths] = useState(String(termMonthsOf(paper)))
  const [previousExpires, setPreviousExpires] = useState(paper.previousExpires || '')
  const [holdUntil, setHoldUntil] = useState(paper.holdUntil || '')
  const [cost, setCost] = useState(paper.cost === '' || paper.cost == null ? '' : String(paper.cost))
  const [miss, setMiss] = useState('')
  const [missField, setMissField] = useState('')

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function packed() {
    return normalizePaper({
      ...paper,
      name,
      kind,
      expires,
      ref,
      where,
      issuer,
      notes,
      termMonths,
      previousExpires,
      holdUntil,
      cost,
    })
  }

  function save(event) {
    event.preventDefault()
    if (!name.trim()) {
      setMiss('Please type a name.')
      setMissField('name')
      return
    }
    const parsed = parseExpire(expires)
    if (!parsed.ok && parsed.reason === 'blank') {
      setMiss('Please pick the date it runs out.')
      setMissField('expires')
      return
    }
    if (!parsed.ok) {
      setMiss('That does not look like a real date.')
      setMissField('expires')
      return
    }
    const priced = parseCost(cost)
    if (!priced.ok) {
      setMiss('Cost has to be a number.')
      setMissField('cost')
      return
    }
    if (holdUntil) {
      const hold = parseExpire(holdUntil)
      if (!hold.ok) {
        setMiss('Hold until needs a real date.')
        setMissField('hold')
        return
      }
    }
    setMiss('')
    setMissField('')
    onSave(normalizePaper({
      ...packed(),
      expires: parsed.iso,
      cost: priced.value,
    }))
  }

  function renew() {
    const parsed = parseExpire(expires)
    if (!parsed.ok && parsed.reason === 'blank') {
      setMiss('Please pick the date it runs out.')
      setMissField('expires')
      return
    }
    if (!parsed.ok) {
      setMiss('That does not look like a real date.')
      setMissField('expires')
      return
    }
    const months = termMonthsOf({ termMonths })
    const rolled = addMonthsIso(parsed.iso, months)
    if (!rolled.ok) {
      setMiss('That does not look like a real date.')
      setMissField('expires')
      return
    }
    setMiss('')
    setMissField('')
    setExpires(rolled.iso)
    setPreviousExpires(parsed.iso)
    setTermMonths(String(months))
    if (!isNew && onKeep) {
      onKeep(normalizePaper({
        ...packed(),
        expires: rolled.iso,
        previousExpires: parsed.iso,
        termMonths: months,
      }))
    }
  }

  const bucket = dueBucket(expires)
  const days = daysUntil(expires)
  const late = bucket === 'late'
  const needWhere = late && !where.trim()

  return (
    <div className="ex-card">
      <div className="ex-card-nav">
        <button type="button" className="ex-quiet" onClick={onCancel}>
          Back to your list
        </button>
        {onPrint && !isNew ? (
          <button type="button" className="ex-quiet" onClick={onPrint}>
            Print this notice
          </button>
        ) : null}
      </div>

      <form className="ex-card-form" onSubmit={save}>
        <p className="ex-card-mark">{late ? 'Renewal notice' : 'Registration'}</p>
        {late ? <p className="ex-stamp">Past due</p> : null}

        <label className={missField === 'expires' ? 'ex-good-field is-miss' : 'ex-good-field'}>
          <span>Good thru</span>
          <strong aria-hidden="true">{formatMailerDate(expires) || '—'}</strong>
          <input
            type="date"
            value={expires}
            onChange={(event) => setExpires(event.target.value)}
          />
        </label>
        {previousExpires ? (
          <p className="ex-was-thru">Was good thru {formatMailerDate(previousExpires) || previousExpires}</p>
        ) : null}
        <p className="ex-card-flag">
          {late
            ? `${Math.abs(days)} days late`
            : bucket === 'soon'
              ? `Due in ${days} days`
              : formatMailerDate(expires) || 'No date'}
        </p>

        {miss ? <p className="ex-miss" role="alert">{miss}</p> : null}

        <div className="ex-card-grid">
          <label className={missField === 'name' ? 'ex-field is-miss' : 'ex-field'}>
            <span>Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </label>
          <label className="ex-field">
            <span>Plate / policy</span>
            <input
              value={ref}
              onChange={(event) => setRef(event.target.value)}
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
            <span>Who to call</span>
            <input
              value={issuer}
              onChange={(event) => setIssuer(event.target.value)}
            />
          </label>
          <label className={needWhere ? 'ex-field is-miss' : 'ex-field'}>
            <span>{needWhere ? 'Where does this paper live?' : 'Where it lives'}</span>
            <input
              value={where}
              onChange={(event) => setWhere(event.target.value)}
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
          <label className={missField === 'cost' ? 'ex-field is-miss' : 'ex-field'}>
            <span>Cost to renew</span>
            <input
              inputMode="decimal"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
          </label>
          {late ? (
            <label className={missField === 'hold' ? 'ex-field is-miss' : 'ex-field'}>
              <span>Hold until</span>
              <input
                type="date"
                value={holdUntil}
                onChange={(event) => setHoldUntil(event.target.value)}
              />
              {holdUntil ? (
                <button
                  type="button"
                  className="ex-quiet ex-clear-hold"
                  onClick={() => {
                    setHoldUntil('')
                    if (!isNew && onKeep) {
                      onKeep(normalizePaper({ ...packed(), holdUntil: '' }))
                    }
                  }}
                >
                  Clear hold
                </button>
              ) : null}
            </label>
          ) : null}
          <label className="ex-field ex-field-notes">
            <span>Notes</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </div>

        <div className="ex-actions">
          <button type="submit" className="ex-primary">Save</button>
          <button type="button" className="ex-sheet" onClick={renew}>
            Renew
          </button>
          <button type="button" className="ex-secondary" onClick={onCancel}>
            Cancel
          </button>
          {onDuplicate ? (
            <button type="button" className="ex-quiet" onClick={onDuplicate}>
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
