"use client";

import { useEffect, useRef, useState } from "react";

const pdfWorkerUrl = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function PdfViewer({ url }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [pdfDoc, setPdfDoc] = useState(null);
  const canvasRefs = useRef([]);

  // Load PDF.js library
  useEffect(() => {
    const loadScript = async () => {
      if (window.pdfjsLib) return;
      
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadScript().catch(err => {
      console.error("Failed to load PDF.js:", err);
      setError("Failed to load PDF library");
    });
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!url || !window.pdfjsLib) return;

    let isMounted = true;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Loading PDF from:", url);

        const loadingTask = window.pdfjsLib.getDocument({
          url: url,
          withCredentials: false,
        });
        
        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;

        console.log("PDF loaded, pages:", pdf.numPages);
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        if (isMounted) {
          setError(err.message || "Failed to load PDF");
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
    };
  }, [url]);

  // Render pages when PDF or scale changes
  useEffect(() => {
    if (!pdfDoc) return;

    let isMounted = true;

    const renderPages = async () => {
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        if (!isMounted) return;

        try {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          const canvas = canvasRefs.current[pageNum - 1];
          
          if (!canvas || !isMounted) continue;

          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };

          await page.render(renderContext).promise;
          console.log(`Rendered page ${pageNum}`);
        } catch (err) {
          console.error(`Error rendering page ${pageNum}:`, err);
        }
      }
    };

    renderPages();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, scale]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const handleResetZoom = () => setScale(1.5);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200">
        <strong className="block mb-2">Error loading PDF</strong>
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-2 text-gray-600">URL: {url}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-gray-50 rounded">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600 font-medium">Loading PDF...</p>
          <p className="mt-1 text-xs text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Zoom Controls */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <button
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-700"
          title="Zoom Out"
        >
          −
        </button>
        <span className="text-sm font-medium text-gray-700 min-w-[70px] text-center bg-white px-3 py-2 border border-gray-200 rounded">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={scale >= 3}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-700"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleResetZoom}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          Reset
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-600 bg-white px-3 py-2 border border-gray-200 rounded">
            {numPages} page{numPages !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* PDF Pages */}
      <div ref={containerRef} className="space-y-6">
        {Array.from({ length: numPages }, (_, i) => (
          <div key={i} className="border border-gray-300 rounded-lg shadow-sm overflow-hidden bg-white">
            <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
              Page {i + 1} of {numPages}
            </div>
            <div className="p-4 bg-gray-50 flex justify-center">
              <canvas
                ref={(el) => (canvasRefs.current[i] = el)}
                className="bg-white shadow-sm max-w-full h-auto"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}