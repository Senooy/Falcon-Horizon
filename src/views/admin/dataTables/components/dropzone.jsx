import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function DropzoneComponent() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      setSelectedFiles(acceptedFiles);
      setUploadStatus(null);
    },
  });

  const handleUploadClick = async () => {
    try {
      const formData = new FormData();
  
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
  
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log(response);
      setUploadStatus('success');
    } catch (error) {
      setErrorMessage("Une erreur est survenue lors de l'envoi du fichier.");
      setUploadStatus('error');
    }
  };
  

  return (
    <div>
      <div {...getRootProps()} style={{ border: '2px dashed black', padding: '20px', marginTop: '10px' }}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Relâchez les fichiers pour les déposer ici</p>
        ) : (
          <p>Glissez-déposez des fichiers ici ou cliquez pour sélectionner des fichiers</p>
        )}
      </div>
      <button onClick={handleUploadClick} disabled={selectedFiles.length === 0}>
        Envoyer les fichiers
      </button>
      {uploadStatus === 'success' && <p style={{ color: 'green' }}>Le fichier a été téléchargé avec succès.</p>}
      {uploadStatus === 'error' && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}

export default DropzoneComponent;
