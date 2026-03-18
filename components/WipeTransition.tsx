"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Global state to trigger wipe from anywhere
let triggerWipeGlobal: ((href: string) => void) | null = null

export function WipeTransition() {
  const router = useRouter()
  const [isWiping, setIsWiping] = useState(false)
  const [isRetracting, setIsRetracting] = useState(false)

  useEffect(() => {
    triggerWipeGlobal = (href: string) => {
      setIsWiping(true)
      setIsRetracting(false)

      setTimeout(() => {
        router.push(href)
      }, 300)

      setTimeout(() => {
        setIsRetracting(true)
      }, 325)

      setTimeout(() => {
        setIsWiping(false)
        setIsRetracting(false)
      }, 650)
    }

    return () => {
      triggerWipeGlobal = null
    }
  }, [router])

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#0C0C0E",
        zIndex: 9999,
        pointerEvents: "none",
        transform: `scaleY(${isWiping ? 1 : 0})`,
        transformOrigin: isRetracting ? "bottom" : "top",
        transition: "transform 650ms cubic-bezier(0.76, 0, 0.24, 1)",
      }}
    />
  )
}

export function triggerWipe(href: string) {
  if (triggerWipeGlobal) {
    triggerWipeGlobal(href)
  }
}
