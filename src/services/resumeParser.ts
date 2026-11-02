import mammoth from 'mammoth'
import * as pdfjs from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

function normalizeText(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim()
}

async function extractPdfText(file: File) {
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  })

  try {
    const document = await loadingTask.promise
    const pages: string[] = []

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item) => {
          if (!('str' in item) || typeof item.str !== 'string') {
            return ''
          }

          return `${item.str}${item.hasEOL ? '\n' : ' '}`
        })
        .join('')

      pages.push(pageText)
    }

    return normalizeText(pages.join('\n'))
  } finally {
    await loadingTask.destroy()
  }
}

async function extractDocxText(file: File) {
  const result = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  })

  return normalizeText(result.value)
}

export async function extractResumeText(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase()

  try {
    let text: string

    if (extension === 'pdf') {
      text = await extractPdfText(file)
    } else if (extension === 'docx') {
      text = await extractDocxText(file)
    } else {
      throw new Error('Choose a PDF or DOCX file to extract text.')
    }

    if (!text) {
      throw new Error(
        'No readable text was found in this resume. Scanned PDFs may need OCR; try a text-based PDF or DOCX.',
      )
    }

    return text
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('No readable text')) {
      throw error
    }

    if (error instanceof Error && error.message.startsWith('Choose a PDF')) {
      throw error
    }

    throw new Error(
      'We couldn’t read this document. It may be damaged, encrypted, or unreadable. Try another PDF or DOCX file.',
    )
  }
}
