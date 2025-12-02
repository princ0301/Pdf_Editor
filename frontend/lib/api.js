import axios from "axios";

// Get backend URL from env (fallback to localhost for dev)
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Final API base
const BASE = `${BASE_URL}/api/v1/pdf`;

export const uploadPDF = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  const res = await axios.post(`${BASE}/upload`, fd, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
