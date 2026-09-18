import { go } from './hash.js'
import './site.css'

export function How({ signedIn }) {
  return (
    <div className="ex-site">
      <header className="ex-bar">
        <h1>Expires</h1>
      </header>
      <div className="ex-site-body">
        <h2 className="ex-site-title">How this works</h2>
        <ol className="ex-site-how">
          <li>
            If a paper is already past its date, it sits here like
            a notice in the mail. The big date is when it was good
            through.
          </li>
          <li>
            Under that is what is coming due. You can look 14, 30,
            or 60 days ahead. Older papers are under Later, folded
            up so they are not in the way.
          </li>
          <li>
            Click a paper to open it. Renew moves the date forward
            by the usual term (a year, unless you change it) and
            keeps the old date on the card so you can see what it
            used to be.
          </li>
          <li>
            If a late paper is not your problem this week, set Hold
            until a day. Until then it waits under Later.
          </li>
          <li>Find looks at the name, the plate, or the policy number.</li>
          <li>
            You can download a file of the list, or open one you
            saved. Older files still work.
          </li>
          <li>
            Print the late notice, or print the due list. The menus
            hide so you get the paper, not the extra buttons.
          </li>
        </ol>
        <div className="ex-site-actions">
          <button
            type="button"
            className="ex-primary"
            onClick={() => go(signedIn ? '/desk' : '/sign-in')}
          >
            Open your list
          </button>
          <button type="button" className="ex-quiet" onClick={() => go('/')}>
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
