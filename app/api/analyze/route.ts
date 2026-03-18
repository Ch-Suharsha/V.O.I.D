import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, DenialData, Finding, NPIResult } from "@/lib/types";
import { API, FINDING_LABELS } from "@/lib/constants";
import { lookupNPI } from "@/lib/npiLookup";

export async function POST(req: NextRequest) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in .env.local");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type as
      | "application/pdf"
      | "image/jpeg"
      | "image/png"
      | "image/tiff";

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const extractionPrompt = `
You are a medical insurance denial letter analyzer.
Extract the following information from this document
and return ONLY a valid JSON object with no markdown,
no code blocks, no explanation — raw JSON only.

Required fields:
{
  "claimNumber": "the claim number or CLM-UNKNOWN",
  "policyId": "the policy ID or POL-UNKNOWN", 
  "denialCode": "the denial code e.g. CO-197",
  "denialReason": "brief reason for denial",
  "reviewerName": "full name of reviewing doctor",
  "reviewerNPI": "10-digit NPI number or empty string",
  "rawText": "first 500 chars of the document text"
}

If a field cannot be found, use the default value shown.
Return only the JSON object.
`;

    const result = await model.generateContent([
      extractionPrompt,
      { inlineData: { mimeType, data: base64 } },
    ]);

    const responseText = result.response.text();

    let denialData: DenialData;
    try {
      const cleaned = responseText
        .replace(/\`\`\`json/g, "")
        .replace(/\`\`\`/g, "")
        .trim();
      denialData = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to extract denial data from document" },
        { status: 422 }
      );
    }

    let npiResult: NPIResult = {
      npi: denialData.reviewerNPI || "",
      name: denialData.reviewerName,
      specialty: "Unknown",
      taxonomyCode: "",
      specialtyMismatch: false,
    };

    console.log("NPI from denial:", denialData.reviewerNPI)
    console.log("NPI length:", denialData.reviewerNPI?.length)

    if (denialData.reviewerNPI && denialData.reviewerNPI.length === 10) {
      console.log("Calling NPI lookup directly...")
      try {
        npiResult = await lookupNPI(denialData.reviewerNPI)
        console.log("NPI result:", JSON.stringify(npiResult))
      } catch (err) {
        console.error("NPI lookup error:", err)
      }
    } else {
      console.log("NPI check failed — not calling lookup")
    }

    const findings: Finding[] = [];

    if (npiResult.specialtyMismatch) {
      findings.push({
        id: "f1",
        type: "npi_mismatch",
        title: FINDING_LABELS.npi_mismatch,
        description: npiResult.mismatchReason ||
          `${npiResult.name} (${npiResult.specialty}) reviewed a claim outside their specialty.`,
        impact: "high",
      });
    }

    findings.push({
      id: "f2",
      type: "policy_contradiction",
      title: FINDING_LABELS.policy_contradiction,
      description: `Denial code ${denialData.denialCode} (${denialData.denialReason}) may contradict your Evidence of Coverage. Review Section 4-6 of your policy document.`,
      impact: "medium",
    });

    findings.push({
      id: "f3",
      type: "erisa_grounds",
      title: FINDING_LABELS.erisa_grounds,
      description: "Under ERISA Section 503, you are entitled to a full and fair review. The denial notice must provide sufficient clinical reasoning.",
      impact: "low",
    });

    const strengthScore = Math.min(
      100,
      60 +
      (npiResult.specialtyMismatch ? 27 : 0) +
      (denialData.reviewerNPI ? 10 : 0) +
      findings.length * 3
    );

    const analysisResult: AnalysisResult = {
      denial: denialData,
      npi: npiResult,
      findings,
      strengthScore,
    };

    return NextResponse.json(analysisResult);
  } catch (error: unknown) {
    console.error("Analyze route error:", error);
    // Surface quota/rate-limit errors clearly to the client
    const status = (error as { status?: number })?.status;
    if (status === 429) {
      return NextResponse.json(
        { error: "Analysis service is busy. Please try again in 30 seconds." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
