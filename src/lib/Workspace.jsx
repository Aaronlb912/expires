import { useEffect, useRef, useState } from 'react'
import { PaperPage } from './PaperPage.jsx'
import { sampleBook } from './sample-papers.js'
import {
  blankBook,
  blankPaper,
  daysUntil,
  downloadBook,
  dueWindowOf,
  duplicatePaper,
  formatMailerDate,
  groupByKind,
  kindsFrom,
  paperMatches,
  parseBookText,
  splitPapers,
} from './papers-json.js'
import './expires.css'

export function Workspace({ value, onChange, onHow, onSignOut }) {
  const undoTimer = useRef(null)
  const fileRef = useRef(null)
  const searchRef = useRef(null)
  const [openId, setOpenId] = useState('')
  const [draft, setDraft] = useState(null)
  const [undo, setUndo] = useState(null)
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('')
  const [showLater, setShowLater] = useState(false)
  const [loadMiss, setLoadMiss] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(value.title)
  const [selectedId, setSelectedId] = useState('')
  const [printNotice, setPrintNotice] = useState(false)

  const open = value.papers.find((paper) => paper.id === openId) || null
  const kinds = kindsFrom(value.papers)
  const windowDays = dueWindowOf(value.dueWindowDays)
  const visible = value.papers.filter((paper) => paperMatches(paper, query, kind))
  const { late, soon, rest } = splitPapers(visible, new Date(), windowDays)
  const queue = [...late, ...soon]

  useEffect(() => {
    if (!selectedId || !queue.some((paper) => paper.id === selectedId)) {
      setSelectedId(queue[0] ? queue[0].id : '')
    }
  }, [selectedId, late, soon])

  useEffect(() => {
    function onKey(event) {
      if (event.target.closest('input, textarea, select')) return
      if (event.key === 'n') {
        event.preventDefault()
        addPaper()
        return
      }
      if (event.key === '/') {
        event.preventDefault()
        searchRef.current?.focus()
        return
      }
      if (draft || open) return
      if (event.key === 'j' || event.key === 'ArrowDown') {
        event.preventDefault()
        moveSelection(1)
      }
      if (event.key === 'k' || event.key === 'ArrowUp') {
        event.preventDefault()
        moveSelection(-1)
      }
      if (event.key === 'Enter' && selectedId) {
        event.preventDefault()
        setOpenId(selectedId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function moveSelection(step) {
    if (queue.length === 0) return
    const index = queue.findIndex((paper) => paper.id === selectedId)
    const from = index < 0 ? 0 : index
    const next = queue[(from + step + queue.length) % queue.length]
    setSelectedId(next.id)
  }

  function setPapers(papers) {
    onChange({ ...value, papers })
  }

  function saveTitle() {
    const next = titleDraft.trim() || 'Papers'
    setTitleDraft(next)
    setEditingTitle(false)
    if (next !== value.title) onChange({ ...value, title: next })
  }

  function addPaper() {
    setUndo(null)
    setOpenId('')
    setLoadMiss('')
    setDraft(blankPaper())
  }

  function resetSample() {
    setUndo(null)
    setOpenId('')
    setDraft(null)
    setQuery('')
    setKind('')
    setLoadMiss('')
    onChange(sampleBook())
  }

  function startBlank() {
    setUndo(null)
    setOpenId('')
    setDraft(null)
    setQuery('')
    setKind('')
    setLoadMiss('')
    onChange(blankBook())
  }

  function savePaper(next, stay) {
    if (draft) {
      setPapers([...value.papers, next])
      setDraft(null)
      if (stay) setOpenId(next.id)
      return
    }
    setPapers(value.papers.map((paper) => (paper.id === next.id ? next : paper)))
    if (!stay) setOpenId('')
  }

  function cancelPaper() {
    setDraft(null)
    setOpenId('')
    setPrintNotice(false)
  }

  function armUndo(entry) {
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndo(entry)
    undoTimer.current = setTimeout(() => setUndo(null), 12000)
  }

  function removePaper(id) {
    const index = value.papers.findIndex((paper) => paper.id === id)
    if (index < 0) return
    const paper = value.papers[index]
    setPapers(value.papers.filter((item) => item.id !== id))
    setDraft(null)
    setOpenId('')
    armUndo({ paper, index })
  }

  function undoRemove() {
    if (!undo) return
    if (undoTimer.current) clearTimeout(undoTimer.current)
    const papers = [...value.papers]
    papers.splice(Math.min(undo.index, papers.length), 0, undo.paper)
    setPapers(papers)
    setUndo(null)
  }

  function copyPaper(paper) {
    setUndo(null)
    setOpenId('')
    setDraft(duplicatePaper(paper))
  }

  function setDueWindow(days) {
    onChange({ ...value, dueWindowDays: dueWindowOf(days) })
  }

  function printDesk() {
    setPrintNotice(false)
    window.print()
  }

  function printThisNotice() {
    setPrintNotice(true)
    window.setTimeout(() => window.print(), 40)
  }

  function onPickFile(event) {
    const file = event.target.files && event.target.files[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseBookText(String(reader.result || ''))
      if (!parsed.ok) {
        setLoadMiss('That file is not a papers JSON.')
        return
      }
      setLoadMiss('')
      setUndo(null)
      setOpenId('')
      setDraft(null)
      onChange(parsed.book)
    }
    reader.onerror = () => setLoadMiss('Could not read that file.')
    reader.readAsText(file)
  }

  if (draft || open) {
    const paper = draft || open
    return (
      <div className={printNotice ? 'ex-app is-print-notice' : 'ex-app'}>
        <header className="ex-bar">
          <h1>{value.title}</h1>
          <button type="button" className="ex-quiet ex-bar-back" onClick={cancelPaper}>
            Back to desk
          </button>
        </header>
        <PaperPage
          paper={paper}
          mode={draft ? 'new' : 'edit'}
          kinds={kinds}
          onSave={savePaper}
          onKeep={(next) => savePaper(next, true)}
          onCancel={cancelPaper}
          onRemove={draft ? undefined : () => removePaper(paper.id)}
          onDuplicate={draft ? undefined : () => copyPaper(paper)}
          onPrint={printThisNotice}
        />
      </div>
    )
  }

  const filteredEmpty = value.papers.length > 0 && visible.length === 0
  const filtering = Boolean(query || kind)
  const groupedSoon = kind ? [{ kind: '', papers: soon }] : groupByKind(soon)

  return (
    <div className="ex-app">
      <header className="ex-bar">
        {editingTitle ? (
          <input
            className="ex-bar-title-input"
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            onBlur={saveTitle}
            onKeyDown={(event) => {
              if (event.key === 'Enter') saveTitle()
              if (event.key === 'Escape') {
                setTitleDraft(value.title)
                setEditingTitle(false)
              }
            }}
            autoFocus
            aria-label="Book title"
          />
        ) : (
          <h1>
            <button
              type="button"
              className="ex-bar-title"
              onClick={() => {
                setTitleDraft(value.title)
                setEditingTitle(true)
              }}
            >
              {value.title}
            </button>
          </h1>
        )}
        <button type="button" className="ex-primary" onClick={addPaper}>
          Add paper
        </button>
        <details className="ex-file">
          <summary>File</summary>
          <div className="ex-file-panel">
            <button type="button" className="ex-quiet" onClick={printDesk}>
              Print due tray
            </button>
            <button type="button" className="ex-quiet" onClick={() => downloadBook(value)}>
              Download JSON
            </button>
            <button
              type="button"
              className="ex-quiet"
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              Load JSON
            </button>
            <button type="button" className="ex-quiet" onClick={startBlank}>
              Start blank
            </button>
            <button type="button" className="ex-quiet" onClick={resetSample}>
              Reset sample
            </button>
            {onHow ? (
              <button type="button" className="ex-quiet" onClick={onHow}>
                How it works
              </button>
            ) : null}
            {onSignOut ? (
              <button type="button" className="ex-quiet" onClick={onSignOut}>
                Sign out
              </button>
            ) : null}
          </div>
        </details>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={onPickFile}
        />
      </header>

      <div className="ex-tools">
        <input
          ref={searchRef}
          className="ex-find"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find name, plate, policy"
          aria-label="Find"
        />
        {kinds.length > 0 ? (
          <div className="ex-kinds" role="group" aria-label="Kind">
            <button
              type="button"
              className={kind === '' ? 'ex-kind is-on' : 'ex-kind'}
              onClick={() => setKind('')}
            >
              All
            </button>
            {kinds.map((item) => (
              <button
                key={item}
                type="button"
                className={kind.toLowerCase() === item.toLowerCase() ? 'ex-kind is-on' : 'ex-kind'}
                onClick={() => setKind(kind.toLowerCase() === item.toLowerCase() ? '' : item)}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {loadMiss ? <p className="ex-miss" role="alert">{loadMiss}</p> : null}

      {undo ? (
        <p className="ex-undo">
          Removed {undo.paper.name || 'a paper'}.
          <button type="button" className="ex-quiet" onClick={undoRemove}>
            Undo
          </button>
        </p>
      ) : null}

      <div className="ex-desk">
        {value.papers.length === 0 ? (
          <article className="ex-letter">
            <p className="ex-letter-mark">Renewal notice</p>
            <p className="ex-good-thru">
              <span>Good thru</span>
              <strong>—</strong>
            </p>
            <h2>Blank notice</h2>
            <p className="ex-letter-call">Add a paper when you have a date.</p>
            <div className="ex-letter-actions">
              <button type="button" className="ex-primary" onClick={addPaper}>
                Add paper
              </button>
            </div>
          </article>
        ) : filteredEmpty ? (
          <div className="ex-empty">
            <p>Nothing matches.</p>
            <button
              type="button"
              className="ex-secondary"
              onClick={() => {
                setQuery('')
                setKind('')
              }}
            >
              Clear find
            </button>
          </div>
        ) : (
          <>
            {late.length > 0 ? (
              <section className="ex-notices" aria-label="Late">
                {late.map((paper) => (
                  <Notice
                    key={paper.id}
                    paper={paper}
                    selected={paper.id === selectedId}
                    onOpen={() => setOpenId(paper.id)}
                  />
                ))}
              </section>
            ) : !filtering ? (
              <p className="ex-all-clear">Nothing late.</p>
            ) : null}

            {soon.length > 0 ? (
              <section className="ex-tray" aria-labelledby="ex-soon">
                <div className="ex-tray-head">
                  <h2 id="ex-soon">Due in {windowDays} days</h2>
                  <div className="ex-window" role="group" aria-label="Due window">
                    {[14, 30, 60].map((days) => (
                      <button
                        key={days}
                        type="button"
                        className={windowDays === days ? 'ex-window-btn is-on' : 'ex-window-btn'}
                        onClick={() => setDueWindow(days)}
                      >
                        {days}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ex-tray-cols" aria-hidden="true">
                  <span>Good thru</span>
                  <span>Paper</span>
                  <span>Days</span>
                </div>
                {groupedSoon.map((group) => (
                  <div key={group.kind || 'flat'} className="ex-tray-group">
                    {group.kind ? <h3>{group.kind}</h3> : null}
                    <DueTray
                      papers={group.papers}
                      selectedId={selectedId}
                      onOpen={setOpenId}
                    />
                  </div>
                ))}
              </section>
            ) : null}

            {rest.length > 0 ? (
              <section className="ex-later" aria-labelledby="ex-later">
                <h2 id="ex-later">
                  <button
                    type="button"
                    className="ex-later-toggle"
                    onClick={() => setShowLater((on) => !on)}
                  >
                    Later ({rest.length})
                  </button>
                </h2>
                {showLater || filtering ? (
                  <DueTray papers={rest} selectedId="" onOpen={setOpenId} />
                ) : null}
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

function lateLine(paper) {
  const days = daysUntil(paper.expires)
  if (days == null) return 'Needs a date'
  const n = Math.abs(days)
  if (n === 1) return 'Late by 1 day'
  return `Late by ${n} days`
}

function Notice({ paper, selected, onOpen }) {
  const title = paper.name || 'Untitled paper'
  return (
    <article className={selected ? 'ex-letter is-selected' : 'ex-letter'}>
      <button
        type="button"
        className="ex-letter-open"
        onClick={onOpen}
        aria-label={`Open ${title}, past due`}
      >
        <p className="ex-letter-mark">Renewal notice</p>
        <p className="ex-stamp">Past due</p>
        <p className="ex-good-thru">
          <span>Good thru</span>
          <strong>{formatMailerDate(paper.expires) || '—'}</strong>
        </p>
        <h2>{title}</h2>
        {paper.ref ? <p className="ex-letter-ref">{paper.ref}</p> : null}
        <p className="ex-letter-kind">{paper.kind || 'paper'}</p>
        {paper.issuer ? <p className="ex-letter-call">Call {paper.issuer}</p> : null}
        <p className="ex-letter-late">{lateLine(paper)}</p>
        {!paper.where ? (
          <p className="ex-letter-where">Where does this paper live?</p>
        ) : null}
      </button>
    </article>
  )
}

function DueTray({ papers, selectedId, onOpen }) {
  return (
    <ul className="ex-tray-rows">
      {papers.map((paper) => {
        const days = daysUntil(paper.expires)
        return (
          <li key={paper.id}>
            <button
              type="button"
              className={paper.id === selectedId ? 'ex-tray-row is-selected' : 'ex-tray-row'}
              onClick={() => onOpen(paper.id)}
            >
              <span className="ex-tray-date">{formatMailerDate(paper.expires) || '—'}</span>
              <span className="ex-tray-name">
                {paper.name || 'Untitled paper'}
                {paper.ref ? <em>{paper.ref}</em> : null}
              </span>
              <span className="ex-tray-days">
                {days == null ? '' : days < 0 ? `${Math.abs(days)} late` : `${days} days`}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
