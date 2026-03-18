"use client"

import { useState, useRef } from "react"
import { Nav } from "@/components/Nav"
import { useWipe } from "@/lib/hooks/useWipe"
import { ROUTES, API, STORAGE_KEYS } from "@/lib/constants"
import { AnalysisResult } from "@/lib/types"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingTest, setLoadingTest] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const wipe = useWipe()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const loadTestFile = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoadingTest(true)
    try {
      const res = await fetch("/appeal.pdf")
      const blob = await res.blob()
      const file = new File([blob], "appeal.pdf", { type: "application/pdf" })
      setSelectedFile(file)
      setError(null)
    } catch (err) {
      console.error("Failed to load test file:", err)
    } finally {
      setLoadingTest(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      const res = await fetch(API.ANALYZE, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Analysis failed")
      }
      const data: AnalysisResult = await res.json()
      sessionStorage.setItem(STORAGE_KEYS.ANALYSIS_RESULT, JSON.stringify(data))
      wipe(ROUTES.PROCESSING)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      )
      setLoading(false)
    }
  }

  const hasFile = !!selectedFile

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: "#F6F3ED" }}>
      <Nav currentStep={0} />

      <main
        className="flex-1 w-full mx-auto flex flex-col items-center justify-center"
        style={{ maxWidth: "480px", padding: "40px 32px" }}
      >
        <div className="w-full flex flex-col items-center">
          <div
            className="uppercase font-mono"
            style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#8C8577", marginBottom: "10px" }}
          >
            Step 01 — Intake
          </div>

          <p style={{
            fontSize: "10px",
            letterSpacing: "0.08em",
            color: "#8C8577",
            textAlign: "center",
            maxWidth: "360px",
            margin: "0 auto 16px",
            fontFamily: "var(--font-mono)"
          }}>
            We audit the reviewing doctor's credentials 
            against the US government registry in real time.
          </p>

          {/* ── Drop zone ── */}
          <div
            onClick={() => !loading && !hasFile && fileInputRef.current?.click()}
            className="w-full flex flex-col items-center"
            style={{
              border: hasFile ? "1.5px solid rgba(184,154,106,0.7)" : "1px dashed rgba(184,154,106,0.38)",
              borderRadius: "16px",
              padding: "44px 32px 32px",
              backgroundColor: hasFile ? "rgba(184,154,106,0.08)" : "rgba(184,154,106,0.04)",
              cursor: loading ? "not-allowed" : hasFile ? "default" : "pointer",
              transition: "background-color 0.35s ease, border-color 0.35s ease",
              pointerEvents: loading ? "none" : "auto",
            }}
            onMouseEnter={(e) => {
              if (loading || hasFile) return
              e.currentTarget.style.borderColor = "#B89A6A"
              e.currentTarget.style.backgroundColor = "rgba(184,154,106,0.08)"
            }}
            onMouseLeave={(e) => {
              if (loading || hasFile) return
              e.currentTarget.style.borderColor = "rgba(184,154,106,0.38)"
              e.currentTarget.style.backgroundColor = "rgba(184,154,106,0.04)"
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.tiff"
              style={{ display: "none" }}
            />

            {/* Icon */}
            <div
              className="flex items-center justify-center"
              style={{
                width: "48px",
                height: "48px",
                border: `1.5px solid ${hasFile ? "rgba(184,154,106,0.8)" : "rgba(184,154,106,0.38)"}`,
                borderRadius: "12px",
                backgroundColor: hasFile ? "rgba(184,154,106,0.15)" : "#EDE9E0",
                transition: "all 0.35s ease",
                marginBottom: "14px",
              }}
            >
              {hasFile ? (
                <svg width="22" height="22" viewBox="0 0 24 24" stroke="#B89A6A" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" stroke="#B89A6A" fill="none" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
            </div>

            {/* Title */}
            <h1
              className="font-display text-center"
              style={{ fontSize: "22px", letterSpacing: "0.04em", color: "#0C0C0E", marginBottom: "6px" }}
            >
              {hasFile ? "File ready" : "Drop your denial letter here"}
            </h1>

            {/* Subtitle or filename */}
            {hasFile ? (
              <div className="flex items-center" style={{ gap: "8px", marginBottom: "20px" }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "11px",
                    color: "#7A6448",
                    letterSpacing: "0.06em",
                    maxWidth: "260px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedFile.name.length > 40
                    ? selectedFile.name.substring(0, 37) + "..."
                    : selectedFile.name}
                </span>
                <button
                  onClick={clearFile}
                  className="flex items-center justify-center hover:opacity-70 transition-opacity"
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(184,154,106,0.3)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "#7A6448",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <p
                className="font-mono text-center"
                style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#8C8577", marginBottom: "20px" }}
              >
                or click to browse files
              </p>
            )}

            {/* Load test PDF — only shown when no file */}
            {!hasFile && (
              <button
                onClick={loadTestFile}
                disabled={loadingTest}
                className="font-mono flex items-center justify-center"
                style={{
                  gap: "6px",
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "7px 16px",
                  backgroundColor: "rgba(184,154,106,0.1)",
                  border: "1px solid rgba(184,154,106,0.35)",
                  borderRadius: "6px",
                  color: "#8C8577",
                  cursor: loadingTest ? "wait" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: loadingTest ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (loadingTest) return
                  e.currentTarget.style.backgroundColor = "rgba(184,154,106,0.18)"
                  e.currentTarget.style.color = "#7A6448"
                }}
                onMouseLeave={(e) => {
                  if (loadingTest) return
                  e.currentTarget.style.backgroundColor = "rgba(184,154,106,0.1)"
                  e.currentTarget.style.color = "#8C8577"
                }}
              >
                {loadingTest ? (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin" style={{ flexShrink: 0 }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Use sample denial PDF
                  </>
                )}
              </button>
            )}

            {/* Change file — only shown when file IS selected */}
            {hasFile && (
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                className="font-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(184,154,106,0.35)",
                  borderRadius: "6px",
                  color: "#8C8577",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(184,154,106,0.1)" }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent" }}
              >
                Change file
              </button>
            )}
          </div>

          {/* Format badges */}
          <div
            className="flex items-center justify-center"
            style={{ gap: "8px", marginTop: "20px", marginBottom: "24px" }}
          >
            {["PDF", "JPG", "PNG", "TIFF"].map((ext) => (
              <span
                key={ext}
                className="font-mono uppercase"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  padding: "4px 10px",
                  border: "1px solid rgba(184,154,106,0.38)",
                  borderRadius: "4px",
                  color: "#8C8577",
                }}
              >
                {ext}
              </span>
            ))}
          </div>

          {/* Begin Analysis */}
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || loading}
            className="w-full relative overflow-hidden"
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
              cursor: !selectedFile || loading ? "not-allowed" : "pointer",
              transition: "all 0.25s ease",
              opacity: !selectedFile || loading ? 0.4 : 1,
            }}
            onMouseEnter={(e) => {
              if (!selectedFile || loading) return
              e.currentTarget.style.backgroundColor = "#1e1e22"
              e.currentTarget.style.letterSpacing = "0.24em"
            }}
            onMouseLeave={(e) => {
              if (!selectedFile || loading) return
              e.currentTarget.style.backgroundColor = "#0C0C0E"
              e.currentTarget.style.letterSpacing = "0.18em"
            }}
            onMouseDown={(e) => {
              if (!selectedFile || loading) return
              e.currentTarget.style.transform = "scale(0.99)"
            }}
            onMouseUp={(e) => {
              if (!selectedFile || loading) return
              e.currentTarget.style.transform = "scale(1)"
            }}
          >
            {loading ? <span className="animate-pulse">Analyzing...</span> : "Begin Analysis"}
          </button>
          
          <p style={{
            fontSize: "9px",
            letterSpacing: "0.1em",
            color: "#8C8577",
            textAlign: "center",
            marginTop: "12px",
            fontFamily: "var(--font-mono)"
          }}>
            Your document is processed securely and never 
            stored. We do not retain any personal or 
            medical information.
          </p>

          {error && (
            <div className="font-mono mt-3" style={{ fontSize: "10px", color: "#7A3535" }}>
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
