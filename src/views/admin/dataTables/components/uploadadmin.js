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

      const response = await axios.post("/upload", formData, {
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
    <div>
      <h2>Document Uploader</h2>
      <div>
        <label htmlFor="seller-select">Select Seller:</label>
        <select id="seller-select" value={selectedSeller} onChange={handleSellerChange}>
          <option value="">Select a seller</option>
          {user?.profileData?.salesCode && (
            <option value={user.profileData.salesCode}>{user.profileData.salesCode}</option>
          )}
        </select>
      </div>
      <div>
        <label htmlFor="file-input">Select Files:</label>
        <input
          type="file"
          id="file-input"
          multiple
          onChange={handleFileChange}
        />
      </div>
      <button onClick={handleUpload} disabled={!selectedSeller || selectedFiles.length === 0}>
        Upload Files
      </button>
    </div>
  );
};

export default DocumentUploader;
