"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Nav } from "@/components/Nav"
import { useWipe } from "@/lib/hooks/useWipe"
import { ROUTES, STORAGE_KEYS } from "@/lib/constants"
import { AnalysisResult } from "@/lib/types"

const STEPS = [
  {
    id: 1,
    name: "OCR extraction",
    detail: "Reading denial letter...",
    doneDetail: "Denial code CO-197 identified",
    duration: 1200,
  },
  {
    id: 2,
    name: "NPI registry lookup",
    detail: "Checking reviewer specialty...",
    doneDetail: "Pediatrician flagged — specialty mismatch",
    duration: 1800,
  },
  {
    id: 3,
    name: "Policy contradiction scan",
    detail: "Searching EOC document...",
    doneDetail: "Contradiction in Section 4.2 found",
    duration: 1600,
  },
  {
    id: 4,
    name: "ERISA argument synthesis",
    detail: "Generating legal grounds...",
    doneDetail: "3 ERISA grounds identified",
    duration: 1400,
  },
]

export default function ProcessingPage() {
  const router = useRouter()
  const wipe = useWipe()
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [hasValidData, setHasValidData] = useState<boolean>(false)

  // 1. Initial validity check
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const rawData = sessionStorage.getItem(STORAGE_KEYS.ANALYSIS_RESULT)
    if (!rawData) {
      router.replace(ROUTES.HOME)
      return
    }
    
    setHasValidData(true)
  }, [router])

  // 2. Sequential animation driver based on currentStep state
  useEffect(() => {
    if (!hasValidData) return

    let isMounted = true

    const stepIndex = currentStep - 1
    
    // Check if we have finished all steps
    if (stepIndex >= STEPS.length) {
      const timer = setTimeout(() => {
        if (isMounted) wipe(ROUTES.FINDINGS)
      }, 600)
      return () => clearTimeout(timer)
    }

    const step = STEPS[stepIndex]

    // Run the timer for the active step
    const timer = setTimeout(() => {
      if (!isMounted) return
      
      // Mark current as done
      setCompletedSteps(prev => {
        if (!prev.includes(step.id)) return [...prev, step.id]
        return prev
      })
      
      // Trigger the next step (this will re-fire this useEffect)
      setCurrentStep(step.id + 1)
      
    }, step.duration)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [currentStep, hasValidData, wipe])

  if (!hasValidData) return null

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: "#F6F3ED" }}
    >
      <style>
        {`
          @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(184,154,106,0.3); }
            50% { box-shadow: 0 0 0 5px rgba(184,154,106,0); }
            100% { box-shadow: 0 0 0 0 rgba(184,154,106,0); }
          }
        `}
      </style>

      <Nav currentStep={1} />

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
          Step 02 — Autopsy
        </div>

        <h1
          className="font-display"
          style={{
            fontSize: "28px",
            letterSpacing: "0.06em",
            color: "#0C0C0E",
            marginBottom: "6px",
            lineHeight: 1.2,
          }}
        >
          Dissecting <br />
          <em
            style={{
              color: "#B89A6A",
              fontStyle: "italic",
            }}
          >
            your denial
          </em>
        </h1>

        <div
          className="font-mono"
          style={{
            fontSize: "11px",
            color: "#8C8577",
            letterSpacing: "0.1em",
            marginBottom: "36px",
          }}
        >
          This takes about 8 seconds
        </div>

        <div className="flex flex-col w-full">
          {STEPS.map((step) => {
            const isDone = completedSteps.includes(step.id)
            const isRunning = currentStep === step.id && !isDone
            const isQueued = !isDone && !isRunning

            return (
              <div
                key={step.id}
                style={{
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(184,154,106,0.18)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  opacity: isDone || isRunning ? 1 : 0.35,
                  transition: "opacity 0.6s ease",
                }}
              >
                <div
                  className="flex items-center justify-center font-mono flex-shrink-0"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    fontSize: "11px",
                    ...(isDone
                      ? {
                          backgroundColor: "#0C0C0E",
                          border: "1px solid #0C0C0E",
                          color: "#F6F3ED",
                        }
                      : isRunning
                      ? {
                          border: "1px solid #B89A6A",
                          color: "#B89A6A",
                          backgroundColor: "transparent",
                          animation: "pulse-ring 1.2s infinite",
                        }
                      : {
                          border: "1px solid rgba(184,154,106,0.38)",
                          color: "#8C8577",
                          backgroundColor: "transparent",
                        }),
                  }}
                >
                  {isDone ? "✓" : step.id}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div
                    className="font-mono pb-0.5 truncate"
                    style={{
                      fontSize: "12px",
                      letterSpacing: "0.06em",
                      color: "#0C0C0E",
                      marginBottom: "2px",
                    }}
                  >
                    {step.name}
                  </div>
                  <div
                    className="font-mono truncate"
                    style={{
                      fontSize: "10px",
                      color: "#8C8577",
                    }}
                  >
                    {isDone
                      ? step.doneDetail
                      : isRunning
                      ? step.detail
                      : "Waiting..."}
                  </div>
                </div>

                <div
                  className="font-mono uppercase flex-shrink-0"
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.14em",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    ...(isDone
                      ? {
                          backgroundColor: "rgba(42,84,64,0.12)",
                          color: "#2A5440",
                        }
                      : isRunning
                      ? {
                          backgroundColor: "rgba(184,154,106,0.12)",
                          color: "#7A6448",
                        }
                      : {
                          backgroundColor: "rgba(184,154,106,0.05)",
                          color: "#C8C2B5",
                        }),
                  }}
                >
                  {isDone ? "Done" : isRunning ? "Running" : "Queued"}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
