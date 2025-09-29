// src/api/policies.js
import axios from "axios";

export const getPolicies = async () => {
  const res = await axios.get("/api/policies");
  return res.data;
};

export const getPolicyById = async (id) => {
  const res = await axios.get(`/api/policies/${id}`);
  return res.data;
};

export const updatePolicy = async (id, updates) => {
  const res = await axios.put(`/api/policies/${id}`, updates);
  return res.data;
};

export const deletePolicy = async (id) => {
  const res = await axios.delete(`/api/policies/${id}`);
  return res.data;
};

export const uploadPolicy = async (file, userId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const res = await axios.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
