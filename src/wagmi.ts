import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { base } from "viem/chains"
import { http } from "wagmi"

const DATA_SUFFIX = "0x62635f687a6a6176646e340b0080218021802180218021802180218021" as `0x${string}`

const appUrl = typeof window !== "undefined"
  ? window.location.origin
  : "https://kaipuu.space"

export const config = getDefaultConfig({
  appName: "Kaipuu",
  appDescription: "Mark a moment of longing. Your kaipuu will not be lost.",
  appUrl,
  appIcon: "https://kaipuu.space/favicon.svg",
  projectId: "6ba1bf292b158f48a08b2056365fcd65",
  chains: [base],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
  dataSuffix: DATA_SUFFIX,
  ssr: false,
})
