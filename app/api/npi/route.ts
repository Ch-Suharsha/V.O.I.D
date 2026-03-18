import { NextRequest, NextResponse } from "next/server";
import { NPIResult } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const npi = searchParams.get("npi");

    if (!npi || npi.length !== 10) {
      return NextResponse.json(
        { error: "Valid 10-digit NPI required" },
        { status: 400 }
      );
    }

    // Call the NPPES free government API
    const url = `https://npiregistry.cms.hhs.gov/api/?number=${npi}&version=2.1`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({
        npi,
        name: "Unknown",
        specialty: "Unknown",
        taxonomyCode: "",
        specialtyMismatch: false,
      } as NPIResult);
    }

    // Extract the data
    const result = data.results[0];
    const taxonomies = result.taxonomies || [];
    const primaryTaxonomy =
      taxonomies.find((t: any) => t.primary === true) || taxonomies[0] || {};

    const name = result.basic
      ? `${result.basic.first_name || ""} ${result.basic.last_name || ""}`.trim()
      : "Unknown";

    const specialty = primaryTaxonomy.desc || "Unknown";
    const taxonomyCode = primaryTaxonomy.code || "";

    // Specialty mismatch detection
    // Note: ADULT_PROCEDURES defined in axiom but not used in provided logic for mismatch flag
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const ADULT_PROCEDURES = [
      "spine",
      "lumbar",
      "mri",
      "orthopedic",
      "cardiology",
      "oncology",
      "neurology",
    ];

    const PEDIATRIC_SPECIALTIES = ["pediatric", "children", "adolescent"];

    const specialtyLower = specialty.toLowerCase();
    const isPediatric = PEDIATRIC_SPECIALTIES.some((p) =>
      specialtyLower.includes(p)
    );

    const specialtyMismatch = isPediatric;

    const mismatchReason = specialtyMismatch
      ? `${name} specializes in ${specialty}. Reviewing an adult procedure falls outside this specialty's clinical scope.`
      : undefined;

    return NextResponse.json({
      npi,
      name,
      specialty,
      taxonomyCode,
      specialtyMismatch,
      mismatchReason,
    } as NPIResult);
  } catch (error) {
    console.error("NPI route error:", error);
    return NextResponse.json(
      { error: "NPI lookup failed" },
      { status: 500 }
    );
  }
}
