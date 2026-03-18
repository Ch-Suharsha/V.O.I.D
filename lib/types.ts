export interface DenialData {
  claimNumber: string
  policyId: string
  denialCode: string
  denialReason: string
  reviewerName: string
  reviewerNPI: string
  rawText: string
}

export interface NPIResult {
  npi: string
  name: string
  specialty: string
  taxonomyCode: string
  specialtyMismatch: boolean
  mismatchReason?: string
}

export interface Finding {
  id: string
  type: "npi_mismatch" | "policy_contradiction" | "erisa_grounds"
  title: string
  description: string
  impact: "high" | "medium" | "low"
}

export interface AnalysisResult {
  denial: DenialData
  npi: NPIResult
  findings: Finding[]
  strengthScore: number
}

export interface LetterData {
  claimNumber: string
  date: string
  recipientName: string
  findings: Finding[]
  npi: NPIResult
  policySection?: string
  letterText: string
}
