import { GoogleGenerativeAI } from "@google/generative-ai"

// Only models confirmed available on free tier
// gemini-2.0-flash and gemini-2.0-flash-lite have 0/0 quota
// on this account so they are excluded
const MODEL_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
]

/**
 * Executes a Gemini request with automatic fallback to secondary models on 429/404 errors.
 */
export async function generateWithFallback(
  apiKey: string,
  prompt: string | any[],
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey)
  
  let lastError: Error | null = null

  for (const modelName of MODEL_CHAIN) {
    try {
      console.log(`Trying model: ${modelName}`)
      const model = genAI.getGenerativeModel({ 
        model: modelName 
      })
      
      const result = typeof prompt === "string"
        ? await model.generateContent(prompt)
        : await model.generateContent(prompt as any[])
      
      console.log(`Success with model: ${modelName}`)
      return result.response.text()
      
    } catch (error: any) {
      const is429 = 
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("quota") ||
        error?.message?.includes("Too Many Requests")
      
      const is404 =
        error?.status === 404 ||
        error?.message?.includes("not found")
      
      if (is429 || is404) {
        console.log(
          `Model ${modelName} unavailable (${is429 ? "quota" : "not found"}), trying next...`
        )
        lastError = error
        continue
      }
      
      throw error
    }
  }
  
  throw lastError || new Error("All models exhausted")
}
