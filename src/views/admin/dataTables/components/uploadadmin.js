import React, { useState, useContext } from "react";
import { AuthContext } from "contexts/AuthContext";
import axios from "axios";

const DocumentUploader = () => {
  const { user } = useContext(AuthContext);
  const [selectedSeller, setSelectedSeller] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleSellerChange = (event) => {
    setSelectedSeller(event.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("seller", selectedSeller);
      for (const file of selectedFiles) {
        formData.append("files", file);
      }

      const response = await axios.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Files uploaded successfully.", response.data);
    } catch (error) {
      console.log("Error uploading files:", error);
    }
  };

  return (
    <div style={{ fontFamily: "Roboto, sans-serif", color: "#313131" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Document Uploader</h2>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="seller-select" style={{ display: "block", marginBottom: "5px" }}>
          Select Seller:
        </label>
        <select
          id="seller-select"
          value={selectedSeller}
          onChange={handleSellerChange}
          style={{ width: "100%", padding: "10px", borderRadius: "5px", borderColor: "#B8B8B8" }}
        >
          <option value="">Select a seller</option>
          {user?.profileData?.salesCode && (
            <option value={user.profileData.salesCode}>
              {user.profileData.salesCode}
            </option>
          )}
        </select>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="file-input" style={{ display: "block", marginBottom: "5px" }}>
          Select Files:
        </label>
        <input
          type="file"
          id="file-input"
          multiple
          onChange={handleFileChange}
          style={{ width: "100%", padding: "10px", borderRadius: "5px", borderColor: "#B8B8B8" }}
        />
      </div>
      <button
        onClick={handleUpload}
        disabled={!selectedSeller || selectedFiles.length === 0}
        style={{ backgroundColor: "#007BFF", color: "#fff", padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer" }}
      >
        Upload Files
      </button>
    </div>
  );
};

export default DocumentUploader;
