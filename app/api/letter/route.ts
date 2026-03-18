import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, LetterData } from "@/lib/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisResult & { 
      patientName?: string;
      contactInfo?: string;
      dateOfBirth?: string;
    } = await req.json();
    const patientName = body.patientName || "Patient";
    const contactInfo = body.contactInfo || "";
    const dateOfBirth = body.dateOfBirth || "";

    if (!body || !body.denial) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const findingsSummary = body.findings
      .map(
        (f, i) =>
          `${i + 1}. ${f.title} (${f.impact} impact): ${f.description}`
      )
      .join("\n");

    const letterPrompt = `
You are a consumer rights attorney specializing in insurance appeals under ERISA law.

Write a formal ERISA appeal letter based on these exact details. Use professional legal language but keep it clear and direct. Do NOT use placeholder text like [Name] or [Date] — use the actual values provided below.

CLAIM DETAILS:
- Date: ${today}
- Claim Number: ${body.denial.claimNumber}
- Policy ID: ${body.denial.policyId}
- Denial Code: ${body.denial.denialCode}
- Denial Reason: ${body.denial.denialReason}
- Reviewing Physician: ${body.npi.name || body.denial.reviewerName || "the reviewing physician"}
- Physician NPI: ${body.npi.npi || body.denial.reviewerNPI || "on file"}
- Physician Specialty: ${body.npi.specialty || "an unverified specialty"}
- Specialty Mismatch: ${body.npi.specialtyMismatch}
${
  body.npi.mismatchReason || body.npi.specialtyMismatch
    ? `- Mismatch Detail: ${body.npi.mismatchReason || "The reviewer's specialty could not be verified against the requested procedure."}`
    : ""
}
- PATIENT NAME: ${patientName}
- CONTACT INFO: ${contactInfo}
- DATE OF BIRTH: ${dateOfBirth}

LEGAL GROUNDS FOR APPEAL:
${findingsSummary}

LETTER REQUIREMENTS:
1. Open with date and formal Re: line citing the claim number
2. First paragraph: cite ERISA Section 503 and 29 C.F.R. § 2560.503-1 as legal basis
3. If specialty mismatch exists: dedicate a full paragraph to the NPI audit finding, naming the doctor, their specialty, and why this constitutes an improper review
4. Include a paragraph on the policy contradiction and patient's right to covered benefits
5. Include a paragraph on right to full and fair review under ERISA Section 503 and ACA § 2719
6. Close with a formal demand paragraph requesting:
   (1) immediate reversal of denial
   (2) authorization of treatment
   (3) written response within 30 days
   (4) warning that non-response will trigger State Insurance Commissioner complaint
7. End with formal sign-off leaving space for patient name and contact info

FORMAT: Plain text only. No markdown. No bullet points in the letter itself. Professional paragraph format throughout. The letter should be 400-600 words. Do NOT include placeholder lines like [Insurance Company Name] or [Insurance Company Address] at the top. Use the patient name provided above instead of [Patient Name] placeholder. Start the letter directly with the date, then the RE: line, then the salutation.

Return ONLY the letter text. No preamble, no explanation, no "here is your letter" — just the letter itself starting with the date.
`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(letterPrompt);
    const letterText = result.response.text();

    const letterData: LetterData = {
      claimNumber: body.denial.claimNumber,
      date: today,
      recipientName: "To Whom It May Concern",
      findings: body.findings,
      npi: body.npi,
      policySection: "Section 4-6",
      letterText: letterText.trim(),
    };

    return NextResponse.json(letterData);
  } catch (error: any) {
    const is429 = error?.status === 429 || error?.message?.includes("429");

    if (is429) {
      return NextResponse.json(
        { error: "Service busy. Please try again in 30 seconds." },
        { status: 429 }
      );
    }

    console.error("Letter route error:", error);
    return NextResponse.json(
      { error: "Failed to generate letter" },
      { status: 500 }
    );
  }
}
