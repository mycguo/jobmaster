/**
 * PostgreSQL Vector Store with pgvector
 * Migrated from Python storage/pg_vector_store.py
 */

import { prisma } from "@/lib/prisma"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { Document } from "@langchain/core/documents"

export interface VectorStoreOptions {
  collectionName?: string
  embeddingModel?: string
  userId?: string
  outputDimensionality?: number
}

export interface VectorMetadata {
  source?: string
  record_type?: string
  record_id?: string
  text?: string
  data?: any
  [key: string]: any
}

export class PgVectorStore {
  private userId: string
  private collectionName: string
  private embedding: GoogleGenerativeAIEmbeddings
  private maxDimensions = 2000

  constructor(options: VectorStoreOptions = {}) {
    this.userId = options.userId || "default_user"
    this.collectionName = options.collectionName || "personal_assistant"
    this.embedding = new GoogleGenerativeAIEmbeddings({
      modelName: options.embeddingModel || "models/gemini-embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
    })
  }

  /**
   * Add texts to the vector store
   */
  async addTexts(
    texts: string[],
    metadatas?: VectorMetadata[]
  ): Promise<string[]> {
    const ids: string[] = []

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i]
      const metadata = metadatas?.[i] || {}

      // Generate embedding
      const embedding = await this.embedding.embedQuery(text)
      const reducedEmbedding = await this.reduceDimensions(embedding)

      // Store in database using raw SQL (Prisma doesn't support vector type natively)
      const embeddingString = `[${reducedEmbedding.join(",")}]`
      const result = await prisma.$queryRawUnsafe<any[]>(
        `
        INSERT INTO vector_documents (user_id, collection_name, text, embedding, metadata)
        VALUES ($1, $2, $3, $4::vector, $5)
        RETURNING id
        `,
        this.userId,
        this.collectionName,
        text,
        embeddingString,
        JSON.stringify(metadata)
      )

      ids.push(result[0].id)
    }

    return ids
  }

  /**
   * Similarity search
   */
  async similaritySearch(
    query: string,
    k: number = 5,
    filter?: Record<string, any>
  ): Promise<Document[]> {
    // Generate query embedding
    const queryEmbedding = await this.embedding.embedQuery(query)
    const reducedQueryEmbedding = await this.reduceDimensions(queryEmbedding)

    // Build SQL query with cosine similarity
    // Note: This is a simplified version. In production, you'd use raw SQL or Prisma extensions
    const embeddingString = `[${reducedQueryEmbedding.join(",")}]`

    const results = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        id, 
        text, 
        metadata,
        1 - (embedding <=> $1::vector) as similarity
      FROM vector_documents
      WHERE user_id = $2 
        AND collection_name = $3
      ORDER BY embedding <=> $1::vector
      LIMIT $4
      `,
      embeddingString,
      this.userId,
      this.collectionName,
      k
    )

    // Convert to LangChain Documents
    return results.map(
      (row) =>
        new Document({
          pageContent: row.text,
          metadata: row.metadata,
        })
    )
  }

  /**
   * Delete documents by IDs
   */
  async delete(ids: string[]): Promise<void> {
    await prisma.vectorDocument.deleteMany({
      where: {
        id: { in: ids },
        userId: this.userId,
        collectionName: this.collectionName,
      },
    })
  }

  /**
   * Get document by record ID (from metadata)
   */
  async getByRecordId(
    recordType: string,
    recordId: string
  ): Promise<any | null> {
    const docs = await prisma.vectorDocument.findMany({
      where: {
        userId: this.userId,
        collectionName: this.collectionName,
        metadata: {
          path: ["record_type"],
          equals: recordType,
        } as any,
      },
    })

    // Filter by record_id (Prisma doesn't support nested JSON queries well)
    const doc = docs.find(
      (d: any) => d.metadata.record_id === recordId
    )

    return doc?.metadata?.data || null
  }

  /**
   * List records with filtering
   */
  async listRecords(
    recordType: string,
    filters?: Record<string, any>,
    sortBy?: string,
    reverse?: boolean,
    limit?: number
  ): Promise<any[]> {
    const docs = await prisma.vectorDocument.findMany({
      where: {
        userId: this.userId,
        collectionName: this.collectionName,
        metadata: {
          path: ["record_type"],
          equals: recordType,
        } as any,
      },
      take: limit || 1000,
      orderBy: {
        createdAt: reverse ? "desc" : "asc",
      },
    })

    // Extract data from metadata
    let results = docs.map((d: any) => d.metadata.data).filter(Boolean)

    // Apply filters (simple equality check)
    if (filters) {
      results = results.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          return item[key] === value
        })
      })
    }

    // Sort if specified
    if (sortBy && results.length > 0) {
      results.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        if (aVal < bVal) return reverse ? 1 : -1
        if (aVal > bVal) return reverse ? -1 : 1
        return 0
      })
    }

    return results
  }

  /**
   * Get collection stats
   */
  async getCollectionStats(): Promise<{
    totalDocuments: number
    byUser: Record<string, number>
  }> {
    const total = await prisma.vectorDocument.count({
      where: {
        userId: this.userId,
        collectionName: this.collectionName,
      },
    })

    return {
      totalDocuments: total,
      byUser: { [this.userId]: total },
    }
  }

  /**
   * Reduce dimensions using simple truncation
   * TODO: Implement PCA for better dimensionality reduction
   */
  private async reduceDimensions(
    embedding: number[]
  ): Promise<number[]> {
    if (embedding.length <= this.maxDimensions) {
      return embedding
    }
    // Simple truncation for now
    return embedding.slice(0, this.maxDimensions)
  }
}

