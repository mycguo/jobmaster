/**
 * Embeddings configuration
 * Migrated from Python LangChain embeddings
 */

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"

export const createEmbeddings = (outputDimensionality: number = 1536) => {
  return new GoogleGenerativeAIEmbeddings({
    modelName: "models/gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
  })
}

export const embeddings = createEmbeddings()

