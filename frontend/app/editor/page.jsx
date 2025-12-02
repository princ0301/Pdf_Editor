"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import usePdfEditor from "./hooks/usePdfEditor";

const PdfViewer = dynamic(() => import("./components/PdfViewer"), {
  ssr: false,
});

export default function EditorPage() {
  const {
    pdfUrl,
    hits,
    fileId,
    pageNum,
    selectedHit,
    setSelectedHit,
    handleUpload,
    searchText,
    applyReplace,
  } = usePdfEditor();

  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [searching, setSearching] = useState(false);
  const [replacing, setReplacing] = useState(false);

  const onFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await handleUpload(file);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload PDF: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const onSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      await searchText(searchQuery);
    } catch (err) {
      console.error("Search error:", err);
      alert("Failed to search: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  const onReplace = async () => {
    if (!replaceValue.trim() || selectedHit === null) return;

    try {
      setReplacing(true);
      await applyReplace(searchQuery, replaceValue);
      
      // Clear form and show success
      setSearchQuery("");
      setReplaceValue("");
      alert("✓ Text replaced successfully! The PDF has been updated.");
    } catch (err) {
      console.error("Replace error:", err);
      alert("Failed to replace text: " + err.message);
    } finally {
      setReplacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">PDF Editor</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Upload PDF
              </h2>
              <input
                type="file"
                accept=".pdf"
                onChange={onFileSelect}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {uploading && (
                <p className="mt-2 text-sm text-blue-600">Uploading...</p>
              )}
              {fileId && (
                <p className="mt-2 text-sm text-green-600">✓ PDF loaded</p>
              )}
            </div>

            {/* Search & Replace Section */}
            {fileId && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Search & Replace
                </h2>

                {/* Search Input */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Text
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && onSearch()}
                      placeholder="Enter text to find..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={onSearch}
                    disabled={searching || !searchQuery.trim()}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md
                      hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                      font-medium transition-colors"
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>

                {/* Results */}
                {hits.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Found {hits.length} match(es) on page {pageNum}:
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {hits.map((hit, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedHit(idx)}
                          className={`p-3 border rounded cursor-pointer transition-colors ${
                            selectedHit === idx
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            Match {idx + 1}
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {hit.span_text || hit.text || JSON.stringify(hit)}
                          </p>
                          <div className="mt-1 text-xs text-green-600">
                            Found: "{hit.found_text}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Replace Input */}
                {selectedHit !== null && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Replace With
                      </label>
                      <input
                        type="text"
                        value={replaceValue}
                        onChange={(e) => setReplaceValue(e.target.value)}
                        placeholder="Enter replacement text..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md
                          focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={onReplace}
                      disabled={replacing || !replaceValue.trim()}
                      className="w-full py-2 px-4 bg-green-600 text-white rounded-md
                        hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                        font-medium transition-colors"
                    >
                      {replacing ? "Replacing..." : "Replace Selected"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            {!fileId && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  How to use:
                </h3>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Upload a PDF file</li>
                  <li>Search for text you want to replace</li>
                  <li>Select a match from the results</li>
                  <li>Enter replacement text and apply</li>
                </ol>
              </div>
            )}
          </div>

          {/* Right Panel - PDF Viewer */}
          <div className="lg:col-span-2">
            {pdfUrl ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    PDF Preview (Page {pageNum})
                  </h2>
                </div>
                <div className="overflow-auto">
                  <PdfViewer url={pdfUrl} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No PDF loaded
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Upload a PDF file to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}