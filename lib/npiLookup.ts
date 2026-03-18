import { NPIResult } from "./types"
import { API } from "./constants"

export async function lookupNPI(
  npi: string
): Promise<NPIResult> {
  const url = `${API.NPPES_BASE}?number=${npi}&version=2.1`
  
  const res = await fetch(url)
  const data = await res.json()
  
  console.log("NPPES raw response:", JSON.stringify(data, null, 2))

  if (!data.results || data.results.length === 0) {
    return {
      npi,
      name: "Unknown",
      specialty: "Unknown",
      taxonomyCode: "",
      specialtyMismatch: false,
    }
  }

  const result = data.results[0]
  
  // Defensive name extraction
  const basic = result.basic || {}
  const firstName = basic.first_name 
    || basic.authorized_official_first_name 
    || ""
  const lastName = basic.last_name 
    || basic.authorized_official_last_name 
    || ""
  const name = `${firstName} ${lastName}`.trim() 
    || basic.organization_name 
    || "Unknown"

  // Defensive taxonomy extraction
  const taxonomies = result.taxonomies 
    || result.taxonomy_groups 
    || []
  const primaryTaxonomy = taxonomies.find(
    (t: any) => t.primary === true 
      || t.primary === "Y"
  ) || taxonomies[0] || {}

  const specialty = primaryTaxonomy.desc 
    || primaryTaxonomy.taxonomy_description
    || primaryTaxonomy.classification
    || "Unknown"

  const taxonomyCode = primaryTaxonomy.code || ""

  const PEDIATRIC_SPECIALTIES = [
    "pediatric", "children", "adolescent"
  ]

  const specialtyLower = specialty.toLowerCase()
  const specialtyMismatch = PEDIATRIC_SPECIALTIES
    .some(p => specialtyLower.includes(p))

  const mismatchReason = specialtyMismatch
    ? `${name} specializes in ${specialty}. Reviewing an adult procedure falls outside this specialty's clinical scope.`
    : undefined

  return {
    npi,
    name,
    specialty,
    taxonomyCode,
    specialtyMismatch,
    mismatchReason,
  }
}
