import React, { useState, useEffect } from 'react';
import { extractTextFromPdf } from '../services/pdfParser';
import { speak, pause, resume, cancel } from '../services/aiReader';

export default function PdfViewer() {
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [books, setBooks] = useState<string[]>([]);
    const [selectedBook, setSelectedBook] = useState<string | null>(null);

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
            setError('File is empty or not fully downloaded. Please make sure the file is available locally.');
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
            const t = await extractTextFromPdf(f);
            setText(t);
            window.dispatchEvent(new CustomEvent('reader:text', { detail: t }));
            if (!t || t.trim().length === 0) {
                setError('No text could be extracted from this PDF. It may be scanned images or protected.');
            }
        } catch (err) {
            setError('Failed to extract text from the file.');
        } finally {
            setLoading(false);
        }
    }

    // Simple XOR "encryption" for demo (not secure for real secrets)
    function xorEncrypt(str: string, key = 'bookkey') {
        return btoa(Array.from(str).map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join(''));
    }
    function xorDecrypt(str: string, key = 'bookkey') {
        return atob(str).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');
    }

    // Save PDF file to localStorage (base64 + xor)
    function uploadBook() {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = (e.target?.result as string).split(',')[1];
            const encrypted = xorEncrypt(base64);
            localStorage.setItem('book_' + file.name, encrypted);
            setBooks([...new Set([...books, file.name])]);
            setError(null);
            alert('Book uploaded and saved!');
        };
        reader.readAsDataURL(file);
    }

    // Load book list from localStorage
    useEffect(() => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('book_')).map(k => k.replace('book_', ''));
        setBooks(keys);
    }, []);

    // Load and extract text from a saved book
    async function loadBook(name: string) {
        setError(null);
        setText('');
        setSelectedBook(name);
        const encrypted = localStorage.getItem('book_' + name);
        if (!encrypted) return setError('Book not found in storage.');
        try {
            const base64 = xorDecrypt(encrypted);
            const byteChars = atob(base64);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const file = new File([blob], name, { type: 'application/pdf' });
            setLoading(true);
            const t = await extractTextFromPdf(file);
            setText(t);
            window.dispatchEvent(new CustomEvent('reader:text', { detail: t }));
            if (!t || t.trim().length === 0) {
                setError('No text could be extracted from this PDF. It may be scanned images or protected.');
            }
        } catch (err) {
            setError('Failed to load or extract text from the book.');
        } finally {
            setLoading(false);
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
            <div style={{ marginTop: 12 }}>
                <b>Uploaded Books:</b>
                {books.length === 0 && <span style={{ marginLeft: 8, color: '#aaa' }}>No books uploaded yet.</span>}
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', gap: 12 }}>
                    {books.map(name => (
                        <li key={name}>
                            <button style={{ background: selectedBook === name ? '#7986cb' : '#23263a', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer' }} onClick={() => loadBook(name)}>{name}</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}