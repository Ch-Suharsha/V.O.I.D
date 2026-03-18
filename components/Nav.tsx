"use client"

import { StepDots } from "./StepDots"

export function Nav({ currentStep = 0 }: { currentStep?: number }) {
  return (
    <nav
      className="flex items-center justify-between w-full"
      style={{
        padding: "20px 32px",
        borderBottom: "1px solid rgba(184, 154, 106, 0.18)",
      }}
    >
      <div
        className="font-display font-light uppercase"
        style={{
          fontSize: "22px",
          letterSpacing: "0.22em",
          color: "#0C0C0E",
        }}
      >
        V<span style={{ color: "#B89A6A" }}>.</span>O<span style={{ color: "#B89A6A" }}>.</span>I<span style={{ color: "#B89A6A" }}>.</span>D
      </div>
      <StepDots currentStep={currentStep} />
    </nav>
  )
}
