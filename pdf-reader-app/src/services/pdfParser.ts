import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// @ts-ignore - Vite worker import
import PdfJsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

// Bind worker (required for pdf.js in web bundlers)
GlobalWorkerOptions.workerPort = new PdfJsWorker();

// Heuristic helpers ---------------------------------------------------------
function isWordChar(ch: string): boolean {
  return /[A-Za-z0-9\p{L}]/u.test(ch);
}

function cleanLine(s: string): string {
  // Collapse spaces
  let out = s.replace(/\s+/g, ' ');
  // Remove dotted leaders (e.g., Table of Contents: . . . . . .)
  out = out.replace(/(?:\s?\.\s?){3,}/g, ' ');
  // Tighten spaces around punctuation
  out = out.replace(/\s+([,.;:!?])/g, '$1');
  out = out.replace(/([([\{])\s+/g, '$1');
  return out.trim();
}

function mergeHyphenatedLines(lines: string[]): string[] {
  const hyphenEndRe = /[A-Za-z\p{L}]-$/u;
  const lowercaseStartRe = /^[a-z\p{Ll}]/u;
  const merged: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    if (i < lines.length - 1 && hyphenEndRe.test(cur)) {
      const next = lines[i + 1];
      // If next line starts with a lowercase/letter, merge hyphenation
      if (lowercaseStartRe.test(next)) {
        merged.push(cur.replace(/-$/, '') + next.replace(/^\s+/, ''));
        i++; // skip next
        continue;
      }
    }
    merged.push(cur);
  }
  return merged;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuf = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuf });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    type Item = any; // pdf.js TextItem | TextMarkedContent
    const items = content.items as Item[];

    // Build lines using Y position heuristic and token spacing
    const lines: { y: number; text: string }[] = [];
    let currentY: number | null = null;
    let line = '';
    let prevToken: Item | null = null;

    const flushLine = () => {
      if (line.trim()) {
        lines.push({ y: currentY ?? 0, text: cleanLine(line) });
      }
      line = '';
      prevToken = null;
    };

    const sameLineEpsilon = 2.0; // points; tweak if needed

    for (const it of items) {
      const str: string = 'str' in it ? it.str : '';
      if (!str) continue;
      const tx: number = Array.isArray(it.transform) ? it.transform[4] : (it.transform?.e ?? 0);
      const ty: number = Array.isArray(it.transform) ? it.transform[5] : (it.transform?.f ?? 0);

      if (currentY === null) currentY = ty;

      // New line if Y changes beyond epsilon or item signals EOL
      const isNewLine = Math.abs((ty ?? 0) - (currentY ?? 0)) > sameLineEpsilon || it.hasEOL;
      if (isNewLine) {
        flushLine();
        currentY = ty;
      }

      // Decide if we need a space before appending this token
      const prevChar = line.slice(-1);
      const needSpace = () => {
        if (!line) return false;
        const first = str[0];
        if (!first) return false;
        // add space between two word-ish tokens
        return isWordChar(prevChar) && isWordChar(first);
      };

      if (needSpace()) line += ' ';
      line += str;
      prevToken = it;
    }
    flushLine();

    // Sort lines by Y descending (pdf origin bottom-left) to keep order stable
    lines.sort((a, b) => b.y - a.y);

    // Clean and merge hyphenated a-b\ncd => abcd
    const cleaned = mergeHyphenatedLines(lines.map(l => l.text));

    // Create page text: separate lines with newlines, add page break
    const pageText = cleaned.join('\n');
    pages.push(pageText);
  }

  // Separate pages with blank lines
  return pages.join('\n\n');
}