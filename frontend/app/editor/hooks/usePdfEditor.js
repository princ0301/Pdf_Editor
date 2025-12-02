"use client";
import { useState } from "react";
import { uploadPDF, findText, replaceText, getPdfUrl } from "../../../lib/api";

export default function usePdfEditor() {
  const [fileId, setFileId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [hits, setHits] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [selectedHit, setSelectedHit] = useState(null);

  async function handleUpload(file) {
    const data = await uploadPDF(file);
    setFileId(data.file_id);
    setPdfUrl(getPdfUrl(data.file_id));
  }

  async function searchText(query) {
    const result = await findText(fileId, pageNum, query);
    setHits(result.hits || []);
  }

  async function applyReplace(query, newValue) {
    if (selectedHit === null) return;
    await replaceText(fileId, {
      page_num: pageNum,
      hit_index: selectedHit,
      old_text: query,
      new_text: newValue,
    });
 
    // Reload PDF with cache buster
    setPdfUrl(getPdfUrl(fileId));
    
    // Clear selection and results
    setSelectedHit(null);
    setHits([]);
  }

  return {
    pdfUrl,
    hits,
    fileId,
    pageNum,
    selectedHit,
    setPageNum,
    setSelectedHit,
    handleUpload,
    searchText,
    applyReplace,
  };
}