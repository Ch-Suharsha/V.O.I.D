import { Cormorant_Garamond, DM_Mono } from "next/font/google"
import { WipeTransition } from "@/components/WipeTransition"
import "./globals.css"

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
})

const monoFont = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${displayFont.variable} ${monoFont.variable}`}>
      <body
        style={{
          background: "#F6F3ED",
          fontFamily: "var(--font-mono)",
          color: "#0C0C0E",
          margin: 0,
        }}
      >
        <WipeTransition />
        {children}
      </body>
    </html>
  )
}
