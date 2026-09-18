import { go } from './hash.js'
import './site.css'

export function How({ signedIn }) {
  return (
    <div className="ex-site">
      <header className="ex-bar">
        <h1>Expires</h1>
      </header>
      <div className="ex-site-body">
        <h2 className="ex-site-title">How it works</h2>
        <ol className="ex-site-how">
          <li>Late papers sit as a mailed notice. Good thru is the date.</li>
          <li>The tray is what is due in 14, 30, or 60 days. Later is folded.</li>
          <li>Open a paper. Renew rolls the term and keeps the old date.</li>
          <li>Hold a late paper until a day and it leaves the late pile.</li>
          <li>Find matches the name or the plate.</li>
          <li>Download JSON if you want a file. Old JSON still loads.</li>
          <li>Print the notice or the due tray.</li>
        </ol>
        <div className="ex-site-actions">
          <button
            type="button"
            className="ex-primary"
            onClick={() => go(signedIn ? '/desk' : '/sign-in')}
          >
            Open the desk
          </button>
          <button type="button" className="ex-quiet" onClick={() => go('/')}>
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
