import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from 'contexts/AuthContext';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
  };

  const onFileUpload = () => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    axios
      .post('/api/files/upload', formData)
      .then((response) => {
        console.log(response.data); // Afficher la réponse du serveur
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error); // Afficher l'erreur en cas d'échec de la requête
        setError('Une erreur s\'est produite lors du téléchargement du fichier.');
        setIsLoading(false);
      });
  };

  // Si l'utilisateur n'est pas un administrateur, ne pas rendre le composant
  if (!user || !user.profileData || !user.profileData.admin) {
    return null;
  }

  return (
    <div>
      <div
        style={{
          border: '2px dashed #ddd',
          borderRadius: '5px',
          padding: '1rem',
          textAlign: 'center',
          marginBottom: '1rem',
        }}
      >
        {file ? (
          <div>
            <strong>Nom du fichier :</strong> {file.name}
          </div>
        ) : (
          <div>
            <strong>Glissez et déposez le fichier ici ou</strong>
            <br />
            <label htmlFor="fileInput">
              <strong>cliquez pour sélectionner un fichier</strong>
            </label>
            <input
              type="file"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={onFileChange}
            />
          </div>
        )}
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {file && (
        <button
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            opacity: isLoading ? 0.5 : 1,
            pointerEvents: isLoading ? 'none' : 'auto',
          }}
          onClick={onFileUpload}
        >
          {isLoading ? 'Chargement...' : 'Télécharger'}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
