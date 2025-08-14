import React, { useEffect, useRef, useState } from 'react';
import { pdfjs } from 'react-pdf';
import HighlightedText from './HighlightedText';

const PdfViewer = ({ pdfFile, currentTextPosition }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
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

    return (
        <div>
            <div ref={pdfContainerRef}>
                {Array.from(new Array(numPages), (el, index) => (
                    <canvas key={`page_${index + 1}`} id={`page-${index + 1}`} />
                ))}
            </div>
            <HighlightedText currentTextPosition={currentTextPosition} />
        </div>
    );
};

export default PdfViewer;