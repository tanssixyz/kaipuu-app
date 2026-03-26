import { useState } from "react"

export function About() {
  const [open, setOpen] = useState(true)

  return (
    <div className="about">
      <button
        className="about-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        what is kaipuu{open ? " ↑" : " ↓"}
      </button>

      {open && (
        <div className="about-body">
          <p>
            A kaipuu is a moment of longing marked on the chain.
          </p>
          <p>
            No message. No recipient. Nothing sent to anyone.
          </p>
          <p>
            You felt something. You marked it.
            The chain witnessed it and keeps it.
            The feeling would have passed.
            Now it won't be lost.
          </p>
          <p>
            Each kaipuu receives a unique colour —
            derived from the moment itself,
            permanent and unrepeatable.
          </p>
          <p className="about-etymology">
            from Finnish — <em>kaipuu</em>, a longing
            for something that cannot be named or recovered
          </p>
        </div>
      )}
    </div>
  )
}
