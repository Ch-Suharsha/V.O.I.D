"use client"

export function StepDots({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center" style={{ gap: "8px" }}>
      {[0, 1, 2, 3].map((step) => {
        const isActive = step === currentStep
        return (
          <div
            key={step}
            style={{
              height: "6px",
              width: isActive ? "20px" : "6px",
              backgroundColor: isActive ? "#B89A6A" : "#C8C2B5",
              borderRadius: isActive ? "3px" : "50%",
              transition: "all 0.4s ease",
            }}
          />
        )
      })}
    </div>
  )
}
