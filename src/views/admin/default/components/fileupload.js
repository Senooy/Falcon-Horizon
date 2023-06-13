import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from 'contexts/AuthContext';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const { user } = useContext(AuthContext);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onFileUpload = () => {
    const formData = new FormData();
    formData.append('file', file);
    axios.post('/api/files/upload', formData)
      .then(response => {
        console.log(response.data); // Afficher la réponse du serveur
      })
      .catch(error => {
        console.error(error); // Afficher l'erreur en cas d'échec de la requête
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
            <strong>Nom du fichier:</strong> {file.name}
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
      {file && (
        <button onClick={onFileUpload}>Télécharger</button>
      )}
    </div>
  );
};

export default FileUpload;
