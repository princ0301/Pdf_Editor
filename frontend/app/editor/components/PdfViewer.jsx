"use client";

import { useState } from "react";

export default function PdfViewer({ url }) {
  const [scale, setScale] = useState(150);

  const handleZoomIn = () => setScale(s => Math.min(s + 25, 300));
  const handleZoomOut = () => setScale(s => Math.max(s - 25, 50));
  const handleResetZoom = () => setScale(150);

  if (!url) {
    return (
      <div className="flex items-center justify-center p-12 bg-gray-50 rounded border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No PDF loaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zoom Controls */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <button
          onClick={handleZoomOut}
          disabled={scale <= 50}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-700"
          title="Zoom Out"
        >
          −
        </button>
        <span className="text-sm font-medium text-gray-700 min-w-[70px] text-center bg-white px-3 py-2 border border-gray-200 rounded">
          {scale}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={scale >= 300}
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
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Open in New Tab
        </a>
      </div>

      {/* PDF Embed - Fast and Simple */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
        <iframe
          src={url}
          className="w-full bg-gray-100"
          style={{ 
            height: '800px',
            transform: `scale(${scale / 100})`,
            transformOrigin: 'top center',
            width: `${10000 / scale}%`,
            margin: '0 auto'
          }}
          title="PDF Viewer"
        />
      </div>
    </div>
  );
}