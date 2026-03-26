import { deriveColour } from "../lib/colour"

interface Props {
  colour: ReturnType<typeof deriveColour>
  size?: "sm" | "lg"
}

export function ColourSwatch({ colour, size = "lg" }: Props) {
  return (
    <div
      className={`swatch ${size === "sm" ? "swatch-sm" : "swatch-lg"}`}
      style={{ background: colour.css }}
    />
  )
}
