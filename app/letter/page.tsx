"use client";

import { useEffect, useState, useRef } from "react";
import { Nav } from "@/components/Nav";
import { useWipe } from "@/lib/hooks/useWipe";
import { ROUTES, STORAGE_KEYS } from "@/lib/constants";
import { AnalysisResult, LetterData } from "@/lib/types";

const generateLetterText = (data: AnalysisResult, name: string): string => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const npiName = data.npi.name || data.denial.reviewerName || "the reviewing physician";
  const npiValue = data.npi.npi || data.denial.reviewerNPI || "on file";
  const npiSpecialty = data.npi.specialty || "an unverified specialty";
  const npiMismatchDetail = data.npi.mismatchReason || "The reviewer's specialty could not be verified against the requested procedure.";

  const grounds = [];
  
  if (data.npi.specialtyMismatch) {
    grounds.push(`1. Specialty Mismatch — NPI Audit
The reviewing physician, ${data.npi.name || data.denial.reviewerName} (NPI: ${data.npi.npi || data.denial.reviewerNPI}), holds board certification in ${data.npi.specialty || "an unverified specialty"}. ${data.npi.specialtyMismatch && data.npi.mismatchReason ? `A denial of this nature falls demonstrably outside the scope of this specialty's clinical practice and constitutes an inadequate review under applicable standards of care.` : ""}`);
  }

  grounds.push(`${data.npi.specialtyMismatch ? '2' : '1'}. Policy Contradiction
A review of the Evidence of Coverage reveals that the requested treatment is expressly covered under the terms of the enrolled plan. This denial is in direct contradiction with the contracted benefit as documented in the policy.`);

  grounds.push(`${data.npi.specialtyMismatch ? '3' : '2'}. Right to Full and Fair Review
Under ERISA Section 503 and the ACA § 2719, I am entitled to a full and fair review of this denial. The denial notice provided insufficient clinical reasoning to satisfy this statutory requirement.`);

  return `${today}

Re: Formal ERISA Grievance — Claim #${data.denial.claimNumber}
Policy ID: ${data.denial.policyId}

To Whom It May Concern,

Pursuant to ERISA Section 503 and 29 C.F.R. § 2560.503-1, I formally contest the denial issued for the above-referenced claim under denial code ${data.denial.denialCode} (${data.denial.denialReason}).

GROUNDS FOR APPEAL

${grounds.join("\n\n")}

DEMAND
I formally request: (1) an immediate reversal of this denial, (2) authorization of the requested treatment, and (3) a written response within 30 days as required by federal regulation. Failure to respond within this period will result in escalation to the State Insurance Commissioner and a request for External Review under applicable law.

Sincerely,
${name}
[Contact Information]
[Date of Birth]
[Member ID: ${data.denial.policyId}]`;
};

const highlightText = (text: string, data: AnalysisResult) => {
  const terms = [
    "ERISA Section 503",
    "29 C.F.R. § 2560.503-1",
    "ACA § 2719",
    data.denial.denialCode,
    data.npi.npi,
  ];

  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  terms.forEach((term) => {
    if (!term) return;
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedTerm})`, "g");
    html = html.replace(regex, "<mark>$1</mark>");
  });

  return html;
};

export default function LetterPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [patientName, setPatientName] = useState("Patient");
  const [letterText, setLetterText] = useState("");
  const [copied, setCopied] = useState(false);
  const [personalizing, setPersonalizing] = useState(true);
  const navigate = useWipe();
  const initialHtml = useRef("");
  const letterRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const personalizeAttempted = useRef(false);

  useEffect(() => {
    if (letterRef.current && !initialized.current && initialHtml.current) {
      letterRef.current.innerHTML = initialHtml.current;
      initialized.current = true;
    }
  }, [initialHtml.current]);

  useEffect(() => {
    const dataStr = sessionStorage.getItem(STORAGE_KEYS.ANALYSIS_RESULT);
    const storedName = sessionStorage.getItem("void_patient_name");
    if (!dataStr) {
      navigate(ROUTES.HOME);
      return;
    }
    try {
      const data = JSON.parse(dataStr) as AnalysisResult;
      setAnalysis(data);
      if (storedName) setPatientName(storedName);
      const outputText = generateLetterText(data, storedName || "Patient");
      setLetterText(outputText);
      initialHtml.current = highlightText(outputText, data);
    } catch (err) {
      navigate(ROUTES.HOME);
    }
  }, [navigate]);

  useEffect(() => {
    if (!analysis) return;

    const personalizeFromAPI = async () => {
      if (personalizeAttempted.current) return;
      personalizeAttempted.current = true;

      try {
        const res = await fetch("/api/letter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...analysis,
            patientName,
          }),
        });
        if (res.ok) {
          const data: LetterData = await res.json();
          setLetterText(data.letterText);
          if (letterRef.current) {
            letterRef.current.innerHTML = highlightText(data.letterText, analysis);
          }
        }
      } catch {
        // Keep template letter on failure
        // Do NOT retry under any circumstances
        return;
      } finally {
        setPersonalizing(false);
      }
    };

    personalizeFromAPI();
  }, [analysis]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col">
        <Nav currentStep={3} />
        <main className="w-full max-w-[540px] mx-auto py-[40px] px-[32px]">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-smoke mb-[10px]">
            Step 04 — Strike
          </div>
          <div className="flex justify-between items-center mb-[20px]">
            <h1 className="font-display text-[26px] font-light text-ink">
              Your appeal letter
            </h1>
          </div>
          <div className="bg-bone h-[400px] rounded-[12px] opacity-50 mb-[16px]"></div>
        </main>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Nav currentStep={3} />

      <style>{`
        mark {
          background: rgba(184,154,106,0.15);
          border-bottom: 1px solid rgba(184,154,106,0.6);
          padding: 0 2px;
          color: inherit;
        }
        @media print {
          nav, .action-row, .start-over { display: none !important; }
          .letter-wrapper { 
            border: none !important; 
            background: white !important;
            border-radius: 0 !important;
          }
          body { background: white !important; }
        }
      `}</style>

      <main className="w-full max-w-[540px] mx-auto py-[40px] px-[32px]">
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-smoke mb-[10px]">
          Step 04 — Strike
        </div>

        <div className="flex justify-between items-start mb-[20px]">
          <div>
            <h1 className="font-display text-[26px] font-light text-ink">
              Your appeal letter
            </h1>
            {personalizing && (
              <p
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#8C8577",
                  marginTop: "4px",
                }}
              >
                Personalizing your letter...
              </p>
            )}
          </div>
          <div className="bg-[#B89A6A]/12 border border-[#B89A6A]/38 rounded-[4px] px-[10px] py-[3px] font-mono text-[9px] uppercase tracking-[0.16em] text-gold-dim mt-[8px]">
            Editable
          </div>
        </div>

        <div className="letter-wrapper border border-[#B89A6A]/38 rounded-[12px] bg-white/60 mb-[16px] overflow-hidden">
          <div className="pt-[20px] px-[28px] pb-[16px] border-b border-[#B89A6A]/18">
            <div className="font-mono text-[10px] text-smoke tracking-[0.1em] mb-[4px]">
              Claim #{analysis.denial.claimNumber} · {todayStr}
            </div>
            <div className="font-display text-[16px] font-normal text-ink">
              Re: Formal ERISA Grievance
            </div>
          </div>
          <div
            ref={letterRef}
            className="p-[20px] px-[28px] font-mono text-[11px] leading-[1.9] text-ink outline-none whitespace-pre-wrap"
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={(e) => setLetterText(e.currentTarget.innerText)}
            style={{
              cursor: "text",
              userSelect: "text",
              WebkitUserSelect: "text",
            }}
          />
        </div>

        <div className="action-row flex gap-[10px]">
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              padding: "12px",
              background: "transparent",
              border: copied
                ? "1px solid #2A5440"
                : "1px solid rgba(184,154,106,0.38)",
              borderRadius: "8px",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              textTransform: "uppercase" as const,
              letterSpacing: "0.16em",
              color: copied ? "#2A5440" : "#8C8577",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {copied ? "Copied!" : "Copy text"}
          </button>

          <button
            onClick={() => window.print()}
            className="flex-[2] bg-ink border-none rounded-[8px] py-[12px] font-mono text-[10px] uppercase tracking-[0.18em] text-parchment hover:bg-[#1e1e22] hover:tracking-[0.22em] transition-all duration-300"
          >
            Download PDF
          </button>
        </div>

        <div className="start-over text-center mt-[24px]">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              sessionStorage.clear();
              navigate(ROUTES.HOME);
            }}
            className="font-mono text-[9px] uppercase tracking-[0.2em] text-smoke no-underline hover:text-gold transition-colors duration-300"
          >
            Start a new appeal
          </a>
        </div>
      </main>
    </div>
  );
}
