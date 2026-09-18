import { useEffect, useRef, useState } from 'react'
import { PaperPage } from './PaperPage.jsx'
import { sampleBook } from './sample-papers.js'
import {
  blankBook,
  blankPaper,
  daysUntil,
  downloadBook,
  dueBucket,
  duplicatePaper,
  formatExpire,
  formatMailerDate,
  kindsFrom,
  paperMatches,
  parseBookText,
  splitPapers,
} from './papers-json.js'
import './expires.css'

export function Workspace({ value, onChange }) {
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

  const open = value.papers.find((paper) => paper.id === openId) || null
  const kinds = kindsFrom(value.papers)
  const visible = value.papers.filter((paper) => paperMatches(paper, query, kind))
  const { late, soon, rest } = splitPapers(visible)

  useEffect(() => {
    function onKey(event) {
      if (event.target.closest('input, textarea, select')) return
      if (event.key === 'n') {
        event.preventDefault()
        addPaper()
      }
      if (event.key === '/') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
      <PaperPage
        paper={paper}
        mode={draft ? 'new' : 'edit'}
        kinds={kinds}
        onSave={savePaper}
        onKeep={(next) => savePaper(next, true)}
        onCancel={cancelPaper}
        onRemove={draft ? undefined : () => removePaper(paper.id)}
        onDuplicate={draft ? undefined : () => copyPaper(paper)}
      />
    )
  }

  const filteredEmpty = value.papers.length > 0 && visible.length === 0
  const filtering = Boolean(query || kind)

  return (
    <div className="ex">
      <header className="ex-mast">
        {editingTitle ? (
          <input
            className="ex-title-input"
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
              className="ex-title-btn"
              onClick={() => {
                setTitleDraft(value.title)
                setEditingTitle(true)
              }}
            >
              {value.title}
            </button>
          </h1>
        )}
        <div className="ex-mast-actions">
          <button type="button" onClick={addPaper}>
            Add paper
          </button>
          <details className="ex-more">
            <summary>More</summary>
            <div className="ex-more-panel">
              <button type="button" className="ex-quiet" onClick={() => window.print()}>
                Print
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
            </div>
          </details>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={onPickFile}
          />
        </div>
      </header>

      {loadMiss ? <p className="ex-miss" role="alert">{loadMiss}</p> : null}

      {undo ? (
        <p className="ex-undo">
          Removed {undo.paper.name || 'a paper'}.
          <button type="button" className="ex-quiet" onClick={undoRemove}>
            Undo
          </button>
        </p>
      ) : null}

      {value.papers.length === 0 ? (
        <div className="ex-empty">
          <p>No papers in this book.</p>
          <button type="button" onClick={addPaper}>
            Add paper
          </button>
        </div>
      ) : (
        <>
          <div className="ex-find">
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a paper"
              aria-label="Find"
            />
            {kinds.length > 0 ? (
              <div className="ex-kinds" role="group" aria-label="Kind">
                <button
                  type="button"
                  className={kind === '' ? 'ex-chip is-on' : 'ex-chip'}
                  onClick={() => setKind('')}
                >
                  All
                </button>
                {kinds.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={kind.toLowerCase() === item.toLowerCase() ? 'ex-chip is-on' : 'ex-chip'}
                    onClick={() => setKind(kind.toLowerCase() === item.toLowerCase() ? '' : item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {filteredEmpty ? (
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
                      onOpen={() => setOpenId(paper.id)}
                    />
                  ))}
                </section>
              ) : !filtering ? (
                <p className="ex-all-clear">Nothing late.</p>
              ) : null}

              {soon.length > 0 ? (
                <section className="ex-due-list" aria-labelledby="ex-soon">
                  <h2 id="ex-soon">Due in 30 days</h2>
                  <DueTable papers={soon} onOpen={setOpenId} />
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
                    <DueTable papers={rest} onOpen={setOpenId} />
                  ) : null}
                </section>
              ) : null}
            </>
          )}
        </>
      )}
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

function Notice({ paper, onOpen }) {
  const title = paper.name || 'Untitled paper'
  return (
    <article className="ex-letter">
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
      </button>
    </article>
  )
}

function DueTable({ papers, onOpen }) {
  return (
    <ul className="ex-rows">
      {papers.map((paper) => (
        <li key={paper.id}>
          <button type="button" className="ex-row" onClick={() => onOpen(paper.id)}>
            <span className="ex-row-name">{paper.name || 'Untitled paper'}</span>
            <span className="ex-row-kind">{paper.kind}</span>
            <span className="ex-row-date">{formatExpire(paper.expires)}</span>
            <span className="ex-row-wait">
              {dueBucket(paper.expires) === 'soon' ? `${daysUntil(paper.expires)} days` : ''}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
