export const ROUTES = {
  HOME: "/",
  PROCESSING: "/processing",
  FINDINGS: "/findings",
  LETTER: "/letter",
} as const

export const API = {
  ANALYZE: "/api/analyze",
  NPI: "/api/npi",
  LETTER: "/api/letter",
  NPPES_BASE: "https://npiregistry.cms.hhs.gov/api",
} as const

export const FINDING_LABELS = {
  npi_mismatch: "Specialty mismatch — NPI audit",
  policy_contradiction: "Policy contradiction",
  erisa_grounds: "ERISA Section 503 grounds",
} as const

export const STORAGE_KEYS = {
  ANALYSIS_RESULT: "void_analysis_result",
  LETTER_DATA: "void_letter_data",
} as const
