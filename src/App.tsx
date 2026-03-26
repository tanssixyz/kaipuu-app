import { ConnectButton } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { Mark } from "./components/Mark"
import { About } from "./components/About"

export default function App() {
  return (
    <div className="app">
      <header>
        <span className="wordmark">kaipuu</span>
        <ConnectButton
          showBalance={false}
          chainStatus="none"
          accountStatus="avatar"
        />
      </header>

      <main>
        <Mark />
      </main>

      <footer>
        <About />
        <div className="footer-links">
          <a
            href="https://basescan.org/address/0x77b7277A6f737A5166193511388e096f0Bd41093"
            target="_blank"
            rel="noreferrer"
          >
            contract
          </a>
          <span>·</span>
          <a href="https://kaarna.xyz" target="_blank" rel="noreferrer">
            kaarna
          </a>
        </div>
        <p className="footer-disclaimer">
          experimental · transactions are permanent · no data collected
        </p>
      </footer>
    </div>
  )
}
