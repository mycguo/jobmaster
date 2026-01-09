/**
 * LangChain chains and prompts
 * Migrated from Python app.py and AI modules
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { PromptTemplate } from "@langchain/core/prompts"
import { createStuffDocumentsChain } from "langchain/chains/combine_documents"

/**
 * Get chat chain for answering questions with context
 */
export async function getChatChain() {
  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-2.5-flash",
    temperature: 0.0,
    apiKey: process.env.GOOGLE_API_KEY,
  })

  const promptTemplate = `
    Answer the questions based on the provided context honestly.
    
    The context may include:
    - Local knowledge base information
    - Web search results (if available)
    
    When web search results are included, cite the source URLs when relevant.
    If information conflicts between local knowledge and web results, prioritize more recent web information for time-sensitive queries.

    Context:\n {context} \n
    Questions: \n {questions} \n

    Provide a comprehensive answer. If web search results are included, mention source URLs when referencing them.
    Answers:
  `

  const prompt = PromptTemplate.fromTemplate(promptTemplate)

  return await createStuffDocumentsChain({
    llm: model,
    prompt,
    documentVariableName: "context",
  })
}

/**
 * Get model for general tasks
 */
export function getModel(temperature: number = 0.0) {
  return new ChatGoogleGenerativeAI({
    modelName: "gemini-2.5-flash",
    temperature,
    apiKey: process.env.GOOGLE_API_KEY,
  })
}

