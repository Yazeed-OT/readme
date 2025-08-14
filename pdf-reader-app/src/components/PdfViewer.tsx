import React, { useEffect, useRef, useState } from 'react';
import { pdfjs } from 'react-pdf';
import HighlightedText from './HighlightedText';
import { extractTextFromPdf } from '../services/pdfParser';
import { speak, pause, resume, cancel } from '../services/aiReader';

const PdfViewer = ({ pdfFile, currentTextPosition }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const pdfContainerRef = useRef(null);

    useEffect(() => {
        const loadPdf = async () => {
            if (pdfFile) {
                const loadingTask = pdfjs.getDocument(pdfFile);
                loadingTask.promise.then((pdf) => {
                    setNumPages(pdf.numPages);
                });
            }
        };
        loadPdf();
    }, [pdfFile]);

    const renderPage = (pageNum) => {
        const loadingTask = pdfjs.getDocument(pdfFile);
        loadingTask.promise.then((pdf) => {
            pdf.getPage(pageNum).then((page) => {
                const viewport = page.getViewport({ scale: 1 });
                const canvas = pdfContainerRef.current.querySelector(`#page-${pageNum}`);
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                page.render(renderContext);
            });
        });
    };

    useEffect(() => {
        if (numPages) {
            renderPage(pageNumber);
        }
    }, [numPages, pageNumber]);

    async function onFile(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        setLoading(true);
        try {
            const t = await extractTextFromPdf(f);
            setText(t);
            window.dispatchEvent(new CustomEvent('reader:text', { detail: t }));
        } finally {
            setLoading(false);
        }
    }

    function onRead() {
        const settings = window.voiceSettings ?? { rate: 1, pitch: 1 };
        speak(text, settings);
    }

    return (
        <div>
            <div ref={pdfContainerRef}>
                {Array.from(new Array(numPages), (el, index) => (
                    <canvas key={`page_${index + 1}`} id={`page-${index + 1}`} />
                ))}
            </div>
            <HighlightedText currentTextPosition={currentTextPosition} />
            <div className="controls">
                <input type="file" accept="application/pdf" onChange={onFile} />
                <button onClick={onRead} disabled={!text || loading}>Read</button>
                <button onClick={pause}>Pause</button>
                <button onClick={resume}>Resume</button>
                <button onClick={cancel}>Stop</button>
                {loading && <span className="small">Extracting text…</span>}
            </div>
        </div>
    );
};

export default PdfViewer;