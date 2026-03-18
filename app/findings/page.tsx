"use client"

import { useEffect, useState } from "react"
import { Nav } from "@/components/Nav"
import { useWipe } from "@/lib/hooks/useWipe"
import { ROUTES, STORAGE_KEYS } from "@/lib/constants"
import { AnalysisResult, Finding } from "@/lib/types"

export default function FindingsPage() {
  const wipe = useWipe()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [barWidth, setBarWidth] = useState<number>(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    const rawData = sessionStorage.getItem(STORAGE_KEYS.ANALYSIS_RESULT)
    if (!rawData) {
      window.location.replace(ROUTES.HOME)
      return
    }

    try {
      const data: AnalysisResult = JSON.parse(rawData)
      setAnalysis(data)

      // Trigger animation after a slight delay to ensure render completes
      const timer = setTimeout(() => {
        setBarWidth(data.strengthScore)
      }, 100)

      return () => clearTimeout(timer)
    } catch {
      window.location.replace(ROUTES.HOME)
    }
  }, [])

  const getImpactColors = (impact: Finding["impact"]) => {
    switch (impact) {
      case "high":
        return {
          dotBg: "#7A3535",
          pillBg: "rgba(122,53,53,0.1)",
          pillText: "#7A3535",
          label: "High",
        }
      case "medium":
        return {
          dotBg: "#8B6A2E",
          pillBg: "rgba(139,106,46,0.1)",
          pillText: "#7A5E28",
          label: "Medium",
        }
      case "low":
        return {
          dotBg: "#2A5440",
          pillBg: "rgba(42,84,64,0.1)",
          pillText: "#2A5440",
          label: "Grounds",
        }
    }
  }

  const handleGenerateLetter = () => {
    wipe(ROUTES.LETTER)
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: "#F6F3ED" }}
    >
      <Nav currentStep={2} />

      <main
        className="flex-1 w-full mx-auto flex flex-col"
        style={{
          maxWidth: "480px",
          padding: "40px 32px",
        }}
      >
        <div
          className="uppercase font-mono"
          style={{
            fontSize: "9px",
            letterSpacing: "0.3em",
            color: "#8C8577",
            marginBottom: "10px",
          }}
        >
          Step 03 — Intelligence
        </div>

        {!analysis ? (
          <>
            <div
              style={{
                height: "26px",
                width: "60%",
                backgroundColor: "#EDE9E0",
                marginBottom: "4px",
                borderRadius: "4px",
                opacity: 0.5,
              }}
            />
            <div
              style={{
                height: "10px",
                width: "40%",
                backgroundColor: "#EDE9E0",
                marginBottom: "24px",
                borderRadius: "4px",
                opacity: 0.5,
              }}
            />

            <div
              style={{
                height: "80px",
                backgroundColor: "#EDE9E0",
                marginBottom: "20px",
                borderRadius: "10px",
                opacity: 0.5,
              }}
            />

            <div className="flex flex-col gap-2.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: "72px",
                    backgroundColor: "#EDE9E0",
                    borderRadius: "10px",
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <h1
              className="font-display"
              style={{
                fontSize: "26px",
                color: "#0C0C0E",
                marginBottom: "4px",
                lineHeight: 1.2,
              }}
            >
              {analysis.findings.length} grounds for your appeal
            </h1>

            <div
              className="font-mono uppercase"
              style={{
                fontSize: "10px",
                color: "#8C8577",
                letterSpacing: "0.12em",
                marginBottom: "24px",
              }}
            >
              Ranked by legal impact
            </div>

            {/* STRENGTH BAR CARD */}
            <div
              style={{
                backgroundColor: "#EDE9E0",
                border: "1px solid rgba(184,154,106,0.18)",
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "20px",
              }}
            >
              <div className="flex justify-between items-baseline mb-2.5">
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.16em",
                    color: "#8C8577",
                  }}
                >
                  Appeal strength
                </span>
                <span
                  className="font-display"
                  style={{
                    fontSize: "32px",
                    color: "#0C0C0E",
                    lineHeight: 1,
                  }}
                >
                  {analysis.strengthScore}
                  <em
                    className="font-mono"
                    style={{
                      fontSize: "16px",
                      color: "#B89A6A",
                      fontStyle: "normal",
                      marginLeft: "1px",
                    }}
                  >
                    %
                  </em>
                </span>
              </div>
              
              {/* Bar track and fill inside the card */}
              <div
                className="w-full relative overflow-hidden mt-2.5"
                style={{
                  height: "3px",
                  backgroundColor: "rgba(184,154,106,0.38)",
                  borderRadius: "2px",
                }}
              >
                <div
                  className="absolute top-0 left-0 h-full"
                  style={{
                    borderRadius: "2px",
                    background: "linear-gradient(90deg, #7A6448, #D4B98A)",
                    width: `${barWidth}%`,
                    transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </div>
            </div>

            {/* FINDING CARDS */}
            <div className="flex flex-col mb-10 pb-4">
              {analysis.findings.map((finding) => {
                const colors = getImpactColors(finding.impact)
                return (
                  <div
                    key={finding.id}
                    className="group"
                    style={{
                      border: "1px solid rgba(184,154,106,0.18)",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      display: "flex",
                      gap: "14px",
                      alignItems: "flex-start",
                      backgroundColor: "rgba(255,255,255,0.5)",
                      marginBottom: "10px",
                      transition: "border-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(184,154,106,0.38)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(184,154,106,0.18)"
                    }}
                  >
                    <div
                      className="flex-shrink-0"
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: colors.dotBg,
                        marginTop: "4px",
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div
                        className="font-mono truncate"
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.1em",
                          color: "#0C0C0E",
                          marginBottom: "3px",
                        }}
                      >
                        {finding.title}
                      </div>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: "10px",
                          color: "#8C8577",
                          lineHeight: 1.6,
                        }}
                      >
                        {finding.description}
                      </div>
                    </div>

                    <div
                      className="flex-shrink-0 font-mono uppercase"
                      style={{
                        fontSize: "9px",
                        letterSpacing: "0.14em",
                        padding: "2px 7px",
                        borderRadius: "3px",
                        backgroundColor: colors.pillBg,
                        color: colors.pillText,
                        lineHeight: 1.2,
                      }}
                    >
                      {colors.label}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA BUTTON */}
            <button
              onClick={handleGenerateLetter}
              className="w-full relative overflow-hidden mt-auto"
              style={{
                padding: "14px",
                backgroundColor: "#0C0C0E",
                color: "#F6F3ED",
                border: "none",
                borderRadius: "10px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1e1e22"
                e.currentTarget.style.letterSpacing = "0.24em"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0C0C0E"
                e.currentTarget.style.letterSpacing = "0.18em"
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.99)"
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)"
              }}
            >
              Generate ERISA Letter
            </button>
          </>
        )}
      </main>
    </div>
  )
}
