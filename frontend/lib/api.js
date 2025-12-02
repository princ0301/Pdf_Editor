import axios from "axios";

// const BASE = "http://localhost:8000/api/v1/pdf";
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const uploadPDF = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  const res = await axios.post(`${BASE}/upload`, fd);
  return res.data;
};

export const findText = async (fileId, pageNum, query) => {
  const res = await axios.get(`${BASE}/${fileId}/find`, {
    params: { page_num: pageNum, query },
  });
  return res.data;
};

export const replaceText = async (fileId, payload) => {
  const res = await axios.post(`${BASE}/${fileId}/replace`, payload);
  return res.data;
};

export const getPdfUrl = (fileId) => 
  `${BASE}/${fileId}/download?t=${Date.now()}`;