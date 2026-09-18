import { daysUntil, formatMailerDate, splitPapers } from '../lib/papers-json.js'
import { sampleBook } from '../lib/sample-papers.js'
import { go } from './hash.js'
import './site.css'

function lateLine(paper) {
  const days = daysUntil(paper.expires)
  if (days == null) return 'Needs a date'
  const n = Math.abs(days)
  if (n === 1) return 'Late by 1 day'
  return `Late by ${n} days`
}

function sampleLetter() {
  const book = sampleBook()
  const { late } = splitPapers(book.papers, new Date(), 30)
  return late[0] || book.papers[0]
}

export function Landing({ signedIn }) {
  const paper = sampleLetter()
  const title = paper?.name || 'Untitled paper'

  return (
    <div className="ex-site">
      <header className="ex-bar">
        <h1>Expires</h1>
      </header>
      <div className="ex-site-body">
        <p className="ex-site-lede">
          This keeps a list of plates, insurance, permits, and
          other papers that run out on a date. If one is already
          late, it shows up like a notice in the mail.
        </p>
        <div className="ex-site-actions">
          {signedIn ? (
            <button type="button" className="ex-primary" onClick={() => go('/desk')}>
              Back to your list
            </button>
          ) : (
            <button type="button" className="ex-primary" onClick={() => go('/sign-in')}>
              Open your list
            </button>
          )}
          <button type="button" className="ex-quiet" onClick={() => go('/how')}>
            How this works
          </button>
        </div>
        {paper ? (
          <div className="ex-site-frame" aria-hidden="true">
            <article className="ex-letter">
              <div className="ex-letter-open">
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
              </div>
            </article>
          </div>
        ) : null}
        <p className="ex-site-foot">http://127.0.0.1:48417/</p>
      </div>
    </div>
  )
}
