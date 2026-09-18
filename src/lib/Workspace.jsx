import { useRef, useState } from 'react'
import { PaperPage } from './PaperPage.jsx'
import { sampleBook } from './sample-papers.js'
import {
  blankPaper,
  downloadBook,
  dueBucket,
  dueLabel,
  normalizeBook,
  splitPapers,
} from './papers-json.js'
import './expires.css'

export function Workspace({ value, onChange }) {
  const undoTimer = useRef(null)
  const [openId, setOpenId] = useState('')
  const [draft, setDraft] = useState(null)
  const [undo, setUndo] = useState(null)
  const open = value.papers.find((paper) => paper.id === openId) || null
  const { soon, rest } = splitPapers(value.papers)

  function setPapers(papers) {
    onChange({ ...value, papers })
  }

  function addPaper() {
    setUndo(null)
    setOpenId('')
    setDraft(blankPaper())
  }

  function resetSample() {
    setUndo(null)
    setOpenId('')
    setDraft(null)
    onChange(normalizeBook(sampleBook()))
  }

  function savePaper(next) {
    if (draft) {
      setPapers([...value.papers, next])
      setDraft(null)
      return
    }
    setPapers(value.papers.map((paper) => (paper.id === next.id ? next : paper)))
    setOpenId('')
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

  if (draft || open) {
    const paper = draft || open
    return (
      <PaperPage
        paper={paper}
        mode={draft ? 'new' : 'edit'}
        onSave={savePaper}
        onCancel={cancelPaper}
        onRemove={draft ? undefined : () => removePaper(paper.id)}
      />
    )
  }

  return (
    <div className="ex">
      <header className="ex-top">
        <div>
          <p className="ex-kicker">Expires</p>
          <h1>{value.title}</h1>
          <p className="ex-note">
            Papers that die on a date. Due in 30 days is at the top.
            Names are fake. Emails end in .example.
          </p>
        </div>
        <div className="ex-actions">
          <button type="button" onClick={addPaper}>
            Add a paper
          </button>
          <button type="button" className="ex-secondary" onClick={resetSample}>
            Reset sample
          </button>
          <button type="button" className="ex-secondary" onClick={() => downloadBook(value)}>
            Download JSON
          </button>
        </div>
      </header>

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
          <p>No papers yet.</p>
          <p>Add one, or reset the Pell Street Motors sample.</p>
          <button type="button" onClick={addPaper}>
            Add a paper
          </button>
        </div>
      ) : (
        <>
          <section className="ex-section" aria-labelledby="ex-soon">
            <h2 id="ex-soon">Due in 30 days</h2>
            {soon.length === 0 ? (
              <p className="ex-quiet-note">Nothing due in the next 30 days.</p>
            ) : (
              <ul className="ex-list">
                {soon.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onOpen={() => setOpenId(paper.id)}
                    onRemove={() => removePaper(paper.id)}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="ex-section" aria-labelledby="ex-later">
            <h2 id="ex-later">Later</h2>
            {rest.length === 0 ? (
              <p className="ex-quiet-note">Nothing further out.</p>
            ) : (
              <ul className="ex-list">
                {rest.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onOpen={() => setOpenId(paper.id)}
                    onRemove={() => removePaper(paper.id)}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function PaperCard({ paper, onOpen, onRemove }) {
  const bucket = dueBucket(paper.expires)
  return (
    <li className={`ex-card ex-card-${bucket}`}>
      <button type="button" className="ex-card-open" onClick={onOpen}>
        <span className="ex-stamp">{dueLabel(paper.expires)}</span>
        <strong>{paper.name || 'Untitled paper'}</strong>
        <span className="ex-card-meta">
          {paper.kind || 'paper'}
          {paper.where ? ` · ${paper.where}` : ''}
        </span>
      </button>
      <button type="button" className="ex-quiet" onClick={onRemove}>
        Remove
      </button>
    </li>
  )
}
