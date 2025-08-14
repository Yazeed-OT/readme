import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// @ts-ignore - vite worker import
import PdfJsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

// Bind worker (required for pdf.js with Vite)
GlobalWorkerOptions.workerPort = new PdfJsWorker();

export async function parsePdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const textContent = await extractTextFromPdf(pdfDoc);
    return textContent;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuf = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuf });
  const pdf = await loadingTask.promise;
  const parts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items
      .map((it: any) => ('str' in it ? it.str : ''))
      .join(' ');
    parts.push(text);
  }
  return parts.join('\n\n');
}