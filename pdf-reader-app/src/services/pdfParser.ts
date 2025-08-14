import { PDFDocument } from 'pdf-lib';

export async function parsePdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const textContent = await extractTextFromPdf(pdfDoc);
    return textContent;
}

async function extractTextFromPdf(pdfDoc: PDFDocument): Promise<string> {
    let text = '';
    const pages = pdfDoc.getPages();

    for (const page of pages) {
        const { text: pageText } = await page.getTextContent();
        text += pageText + '\n';
    }

    return text;
}