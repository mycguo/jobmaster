import pdf from "pdf-parse"
import mammoth from "mammoth"

interface ExtractedResume {
  text: string
  fileType: string
}

const TEXT_ENCODINGS = ["utf-8", "utf8", "latin1"]

export async function extractTextFromFile(file: File): Promise<ExtractedResume> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const name = (file.name || "resume").toLowerCase()
  const type = (file.type || "").toLowerCase()

  if (name.endsWith(".pdf") || type.includes("pdf")) {
    return handlePdf(buffer)
  }

  if (name.endsWith(".docx") || type.includes("wordprocessingml")) {
    return handleDocx(buffer)
  }

  if (name.endsWith(".txt") || type.includes("text")) {
    return handleTxt(buffer)
  }

  throw new Error("Unsupported file format. Please upload PDF, DOCX, or TXT files")
}

async function handlePdf(buffer: Buffer): Promise<ExtractedResume> {
  const data = await pdf(buffer)
  const text = cleanupText(data.text)
  if (!text.trim()) {
    throw new Error("Could not extract text from PDF. Please try a different file")
  }
  return { text, fileType: "pdf" }
}

async function handleDocx(buffer: Buffer): Promise<ExtractedResume> {
  const { value } = await mammoth.extractRawText({ buffer })
  const text = cleanupText(value)
  if (!text.trim()) {
    throw new Error("Could not extract text from DOCX file")
  }
  return { text, fileType: "docx" }
}

async function handleTxt(buffer: Buffer): Promise<ExtractedResume> {
  for (const encoding of TEXT_ENCODINGS) {
    try {
      const text = cleanupText(buffer.toString(encoding as BufferEncoding))
      if (text.trim()) {
        return { text, fileType: "txt" }
      }
    } catch (error) {
      continue
    }
  }
  throw new Error("Unable to read text file. Please ensure it is UTF-8 encoded")
}

function cleanupText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\s+$/g, "").trim()
}

