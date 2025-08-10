import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/auth";

export async function registerUser(userData) {
  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export const fetchProfile = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch profile";
  }
};