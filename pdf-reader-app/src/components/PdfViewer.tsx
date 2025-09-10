import React, { useState, useEffect } from 'react';
import { extractTextFromPdf } from '../services/pdfParser';
import { speak, pause, resume, cancel } from '../services/aiReader';
import { saveBook, listBooks, getBook, deleteBook } from '../services/storage';
import type { StoredBookMeta } from '../services/storage';

export default function PdfViewer() {
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [books, setBooks] = useState<StoredBookMeta[]>([]);
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ page: number; total: number } | null>(null);

    async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
        setError(null);
        setFileInfo(null);
        setText('');
        setFile(null);
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setFileInfo(`Selected: ${f.name} | Type: ${f.type || 'unknown'} | Size: ${f.size} bytes`);
        if (f.size === 0) {
            setError('This file looks like a cloud-only placeholder (0 bytes). In OneDrive, right-click the file → "Always keep on this device", wait for the download to complete, then select it again.');
            return;
        }
        const ext = f.name.split('.').pop()?.toLowerCase();
        const isPdf = ext === 'pdf' || f.type === 'application/pdf';
        if (!isPdf) {
            setError('Only PDF files are supported at this time.');
            return;
        }
        setLoading(true);
        try {
            const t = await extractTextFromPdf(f, setProgress);
            setText(t);
            window.dispatchEvent(new CustomEvent('reader:text', { detail: t }));
            if (!t || t.trim().length === 0) {
                setError('No text could be extracted from this PDF. It may be scanned images or protected.');
            }
        } catch (err) {
            setError('Failed to extract text from the file.');
        } finally {
            setLoading(false);
            setProgress(null);
        }
    }

    // Save PDF to IndexedDB
    async function uploadBook() {
        if (!file) return;
        await saveBook(file.name, file);
        setBooks(await listBooks());
        setError(null);
        alert('Book uploaded and saved!');
    }

    // Load book list from localStorage
    useEffect(() => {
        (async () => setBooks(await listBooks()))();
    }, []);

    // Load and extract text from a saved book
    async function loadBook(name: string) {
        setError(null);
        setText('');
        setSelectedBook(name);
        const stored = await getBook(name);
        if (!stored) return setError('Book not found in storage.');
        try {
            setLoading(true);
            const t = await extractTextFromPdf(stored, setProgress);
            setText(t);
            window.dispatchEvent(new CustomEvent('reader:text', { detail: t }));
            if (!t || t.trim().length === 0) {
                setError('No text could be extracted from this PDF. It may be scanned images or protected.');
            }
        } catch (err) {
            setError('Failed to load or extract text from the book.');
        } finally {
            setLoading(false);
            setProgress(null);
        }
    }

    async function removeBook(name: string) {
        await deleteBook(name);
        setBooks(await listBooks());
        if (selectedBook === name) {
            setSelectedBook(null);
            setText('');
        }
    }

    function onRead() {
        const settings = window.voiceSettings ?? { rate: 1, pitch: 1 };
        speak(text, settings);
    }

    return (
        <div className="controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <input type="file" accept=".pdf,application/pdf" onChange={onFile} />
                <button onClick={uploadBook} disabled={!file}>Upload</button>
                <button onClick={onRead} disabled={!text || loading}>Read</button>
                <button onClick={pause}>Pause</button>
                <button onClick={resume}>Resume</button>
                <button onClick={cancel}>Stop</button>
            </div>
            {fileInfo && <span className="small" style={{ color: '#90caf9' }}>{fileInfo}</span>}
            {loading && <span className="small" style={{ color: '#ffd54f' }}>Extracting text…</span>}
            {error && <span className="error" style={{ color: '#e57373' }}>{error}</span>}
            {!loading && !error && text && <span className="small" style={{ color: '#81c784' }}>Text extracted successfully!</span>}
            <div style={{ marginTop: 12, width: '100%' }}>
                <b>My Books:</b>
                {books.length === 0 && <span style={{ marginLeft: 8, color: '#aaa' }}>No books uploaded yet.</span>}
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {books.map(meta => (
                        <li key={meta.id}>
                            <button style={{ background: selectedBook === meta.id ? '#7986cb' : '#23263a', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer' }} onClick={() => loadBook(meta.id)} title={`${(meta.size/1048576).toFixed(2)} MB`}>{meta.name}</button>
                            <button style={{ marginLeft: 6, background: '#b71c1c', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }} onClick={() => removeBook(meta.id)} aria-label={`Delete ${meta.name}`}>×</button>
                        </li>
                    ))}
                </ul>
            </div>

            {progress && (
              <div className="progress-bar" aria-live="polite">
                <div className="bar"><div className="bar-inner" style={{ width: `${(progress.page/progress.total)*100}%` }}></div></div>
                <span>{Math.round((progress.page/progress.total)*100)}% read</span>
              </div>
            )}
        </div>
    );
}