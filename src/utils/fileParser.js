import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url'
import mammoth from 'mammoth'

async function loadPdfJs() {
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    return window.pdfjsLib
  }

  const existingScript = document.querySelector('script[data-pdfjs-loader]')
  if (existingScript) {
    await new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Failed to load PDF.js library')), { once: true })
    })
    return window.pdfjsLib
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/node_modules/pdfjs-dist/build/pdf.js'
    script.dataset.pdfjsLoader = 'true'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load PDF.js library'))
    document.head.appendChild(script)
  })

  return window.pdfjsLib
}

export class FileParseError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'FileParseError'
    this.code = code
  }
}

const MAX_FILE_SIZE_MB = 10
const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt']

function getExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx === -1 ? '' : filename.slice(idx).toLowerCase()
}

async function extractFromPdf(arrayBuffer) {
  const pdfData = new Uint8Array(arrayBuffer)
  const pdfjsLib = await loadPdfJs()
  if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
  }

  let doc
  try {
    doc = await pdfjsLib.getDocument({ data: pdfData }).promise
  } catch (err) {
    throw new FileParseError(
      'This PDF could not be opened. It may be corrupted, password-protected, or not a valid PDF file.',
      'PDF_LOAD_FAILED'
    )
  }

  let text = ''
  try {
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum)
      const content = await page.getTextContent()
      text += content.items.map((item) => item.str).join(' ') + '\n'
    }
  } catch (err) {
    throw new FileParseError(
      'We started reading this PDF but hit an error partway through. Try re-exporting it or pasting the text directly.',
      'PDF_EXTRACT_FAILED'
    )
  }

  if (!text.trim()) {
    throw new FileParseError(
      'No selectable text was found in this PDF. It looks like a scanned image rather than a text-based document - try pasting the resume text instead.',
      'PDF_NO_TEXT'
    )
  }

  return text
}

async function extractFromDocx(arrayBuffer) {
  let result
  try {
    result = await mammoth.extractRawText({ arrayBuffer })
  } catch (err) {
    throw new FileParseError(
      'This DOCX file could not be read. It may be corrupted or saved in an unsupported format (only modern .docx is supported, not .doc).',
      'DOCX_LOAD_FAILED'
    )
  }

  if (!result.value || !result.value.trim()) {
    throw new FileParseError('This DOCX file appears to be empty.', 'DOCX_NO_TEXT')
  }

  return result.value
}

async function extractFromTxt(file) {
  const text = await file.text()
  if (!text.trim()) {
    throw new FileParseError('This text file appears to be empty.', 'TXT_NO_TEXT')
  }
  return text
}

/**
 * Extracts plain text from an uploaded resume file.
 * @param {File} file
 * @returns {Promise<string>}
 * @throws {FileParseError}
 */
export async function extractTextFromFile(file) {
  if (!file) {
    throw new FileParseError('No file was provided.', 'NO_FILE')
  }

  const sizeMb = file.size / (1024 * 1024)
  if (sizeMb > MAX_FILE_SIZE_MB) {
    throw new FileParseError(`This file is ${sizeMb.toFixed(1)}MB - please upload something under ${MAX_FILE_SIZE_MB}MB.`, 'FILE_TOO_LARGE')
  }
  if (file.size === 0) {
    throw new FileParseError('This file is empty.', 'FILE_EMPTY')
  }

  const ext = getExtension(file.name)
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new FileParseError(
      `Unsupported file type "${ext || 'unknown'}". Upload a PDF, DOCX, or TXT file, or paste your resume text instead.`,
      'UNSUPPORTED_TYPE'
    )
  }

  try {
    if (ext === '.pdf') {
      const buffer = await file.arrayBuffer()
      return await extractFromPdf(buffer)
    }
    if (ext === '.docx') {
      const buffer = await file.arrayBuffer()
      return await extractFromDocx(buffer)
    }
    return await extractFromTxt(file)
  } catch (err) {
    if (err instanceof FileParseError) throw err
    // Catch-all so a truly unexpected failure (corrupt bytes, browser quirk)
    // never crashes the UI - the dropzone always gets a friendly message.
    throw new FileParseError(
      'Something went wrong reading this file. Try a different file or paste the text directly.',
      'UNKNOWN_PARSE_ERROR'
    )
  }
}
