// src/Components/NewChat.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../assets/roboicon.jpg";
import { API_BASE_URL } from "../api/auth";

function NewChat() {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const FIELD_NAME = "file"; // backend expects "file"

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a valid PDF file.");
      return;
    }
    setPdfFile(file);
  };

  /** 🔹 Upload PDF */
  const uploadPdf = async (file, onProgress) => {
    const formData = new FormData();
    formData.append(FIELD_NAME, file, file.name);

    const access_token = localStorage.getItem("access_token");
    if (!access_token)
      throw new Error("Missing access token. Please log in again.");

    const res = await axios.post(`${API_BASE_URL}/pdf/upload`, formData, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });

    return res.data;
  };

  /** 🔹 Create chat session */
  const createSession = async (pdfId) => {
    const access_token = localStorage.getItem("access_token");
    if (!access_token)
      throw new Error("Missing access token. Please log in again.");

    const res = await axios.post(
      `${API_BASE_URL}/create/session`,
      { pdfId },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return res.data;
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      alert("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);

      // Step 1: Upload PDF
      const response = await uploadPdf(pdfFile, setProgress);
      const pdfObj = response?.data?.pdf || null;
      if (!pdfObj) throw new Error("Invalid response from server");

      const { id: pdf_id } = pdfObj;

      // Step 2: Create session for this PDF
      const sessionResponse = await createSession(pdf_id);
      const {
        session_id,
        pdf_id: pid,
        pdf_hash,
        pdf_name,
      } = sessionResponse?.data || {};

      if (!session_id) throw new Error("Session not created");

      // Step 3: Save in localStorage with session_id as key
      localStorage.setItem(
        "active_chat_session",
        JSON.stringify({ session_id, pdf_id: pid, pdf_hash, pdf_name })
      );

      // Step 4: Navigate to chat page
      navigate(`/chat/${session_id}`);
    } catch (err) {
      console.error("Upload error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (err?.message?.includes("Network Error")
          ? "Network/CORS error. Check server CORS settings."
          : err?.message) ||
        "Failed to upload and start chat.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (!pdfFile) {
      fileInputRef.current.click();
    } else {
      handleUpload();
    }
  };

  return (
    <div style={styles.container}>
      {/* Background overlay for better text readability */}
      <div style={styles.overlay}></div>

      {/* Content wrapper */}
      <div style={styles.contentWrapper}>
        <h2 style={styles.heading}>Start a New Chat</h2>

        {/* Hidden file input */}
        <input
          type="file"
          accept="application/pdf,.pdf"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {loading && (
          <div style={styles.loadingText}>Uploading… {progress}%</div>
        )}

        <button
          style={{
            ...styles.button,
            backgroundColor: loading ? "#6c757d" : "#2563eb",
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleButtonClick}
          disabled={loading}
        >
          {loading
            ? "Uploading..."
            : pdfFile
            ? "Upload and Start Chat"
            : "Select PDF"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    minHeight: "100vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(251, 191, 36, 0.7)", // Yellow overlay with transparency
    background:
      "linear-gradient(135deg, rgba(251, 191, 36, 0.8) 0%, rgba(245, 158, 11, 0.8) 50%, rgba(217, 119, 6, 0.8) 100%)",
    zIndex: 1,
  },
  contentWrapper: {
    position: "relative",
    zIndex: 2,
    padding: "3rem",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)",
    maxWidth: "500px",
    width: "90%",
  },
  heading: {
    fontSize: "2.5rem",
    marginBottom: "2rem",
    color: "#1f2937",
    fontWeight: "700",
    textAlign: "center",
  },
  loadingText: {
    marginTop: "1rem",
    fontSize: "1rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  button: {
    marginTop: "2rem",
    padding: "1rem 2rem",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
    minWidth: "200px",
  },
};

export default NewChat;
