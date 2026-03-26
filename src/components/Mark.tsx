import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { decodeEventLog } from "viem"
import { KAIPUU_ADDRESS, ACTIVE_CHAIN } from "../constants"
import KaipuuABI from "../abi/Kaipuu.json"
import { deriveColour, formatTimestamp } from "../lib/colour"

type Phase = "idle" | "confirming" | "confirmed"

interface MarkResult {
  markId: bigint
  timestamp: bigint
  marker: `0x${string}`
}

export function Mark() {
  const { address, isConnected, chain } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [phase, setPhase] = useState<Phase>("idle")
  const [result, setResult] = useState<MarkResult | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const { writeContract, isPending } = useWriteContract()

  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  })

  useEffect(() => {
    if (!receipt || !address) return
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: KaipuuABI as Parameters<typeof decodeEventLog>[0]["abi"],
          data: log.data,
          topics: log.topics,
          eventName: "Marked",
        })
        const args = decoded.args as { id: bigint; marker: `0x${string}`; timestamp: bigint }
        setResult({ markId: args.id, timestamp: args.timestamp, marker: address })
        setPhase("confirmed")
        return
      } catch {
        // not the Marked event
      }
    }
  }, [receipt, address])

  const handleMark = () => {
    if (!isConnected) { openConnectModal?.(); return }
    writeContract(
      {
        address: KAIPUU_ADDRESS,
        abi: KaipuuABI as Parameters<typeof writeContract>[0]["abi"],
        functionName: "mark",
        chainId: ACTIVE_CHAIN.id,
      },
      {
        onSuccess: (hash) => { setTxHash(hash); setPhase("confirming") },
        onError: () => setPhase("idle"),
      }
    )
  }

  const onReset = () => { setPhase("idle"); setResult(null); setTxHash(undefined) }

  if (phase === "confirmed" && result) {
    const colour = deriveColour(result.markId, result.timestamp, result.marker)
    return <Confirmed result={result} colour={colour} onReset={onReset} txHash={txHash} />
  }

  const isWaiting = isPending || isConfirming

  return (
    <div className="card">
      <div className="card-body">
        <p className="card-label">kaipuu</p>
        <p className="card-desc">
          a longing that passes before you can name it.<br />
          mark this moment and the chain keeps it.
          nothing is sent to anyone.
        </p>
        {!isConnected ? (
          <button className="btn" onClick={() => openConnectModal?.()}>connect wallet</button>
        ) : chain?.id !== ACTIVE_CHAIN.id ? (
          <p className="chain-warning">switch to {ACTIVE_CHAIN.name}</p>
        ) : (
          <button className="btn" onClick={handleMark} disabled={isWaiting}>
            {isPending ? "confirm in wallet..." : isConfirming ? "marking..." : "mark this moment"}
          </button>
        )}
      </div>
    </div>
  )
}

function Confirmed({
  result, colour, onReset, txHash,
}: {
  result: MarkResult
  colour: ReturnType<typeof deriveColour>
  onReset: () => void
  txHash?: `0x${string}`
}) {
  return (
    <div className="card">
      <div style={{ width: "100%", height: "80px", background: colour.css }} />
      <div className="card-body">
        <p className="card-label">marked</p>
        <p className="card-phrase">your kaipuu will not be lost</p>

        <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#9ca3af", margin: 0 }}>
          {formatTimestamp(result.timestamp)}
        </p>

        <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#9ca3af", margin: 0 }}>
          kaipuu #{result.markId.toString()}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "9px", height: "9px",
            borderRadius: "50%",
            background: colour.css,
            flexShrink: 0,
          }} />
          <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#f3f4f6", margin: 0 }}>
            the colour of your kaipuu is {colour.hex}
          </p>
        </div>

        {txHash && (
          <a
            href={`${ACTIVE_CHAIN.blockExplorers?.default.url}/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontFamily: "monospace", fontSize: "12px", color: "#6b7280" }}
          >
            view on basescan →
          </a>
        )}

        <MintOption markId={result.markId} colour={colour} />
        <button className="btn-ghost" onClick={onReset}>mark again</button>
      </div>
    </div>
  )
}

function MintOption({
  markId, colour,
}: {
  markId: bigint
  colour: ReturnType<typeof deriveColour>
}) {
  const [mintPhase, setMintPhase] = useState<"idle" | "confirming" | "done">("idle")
  const { writeContract, isPending } = useWriteContract()
  const [mintTxHash, setMintTxHash] = useState<`0x${string}` | undefined>()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: mintTxHash,
    query: { enabled: !!mintTxHash },
  })

  useEffect(() => { if (isSuccess) setMintPhase("done") }, [isSuccess])

  const handleMint = () => {
    setMintPhase("confirming")
    writeContract(
      {
        address: KAIPUU_ADDRESS,
        abi: KaipuuABI as Parameters<typeof writeContract>[0]["abi"],
        functionName: "mint",
        args: [markId],
        chainId: ACTIVE_CHAIN.id,
      },
      {
        onSuccess: (hash) => setMintTxHash(hash),
        onError: () => setMintPhase("idle"),
      }
    )
  }

  if (mintPhase === "done") {
    return (
      <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#6b7280", margin: 0 }}>
        kaipuu #{markId.toString()} held in your wallet
      </p>
    )
  }

  const isWaiting = isPending || isConfirming

  return (
    <div className="mint-option">
      <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: colour.css, flexShrink: 0 }} />
      <div className="mint-text">
        <p className="mint-label">keep this kaipuu</p>
        <p className="mint-desc">
          mint a soulbound token — the colour, the word, the timestamp.
          non-transferable. yours alone.
        </p>
        <button className="btn-secondary" onClick={handleMint} disabled={isWaiting}>
          {isPending ? "confirm in wallet..." : isConfirming ? "minting..." : "mint token"}
        </button>
      </div>
    </div>
  )
}
