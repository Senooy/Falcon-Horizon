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
    axios.post('/api/files/upload', formData);
  };

  // Si l'utilisateur n'est pas un administrateur, ne pas rendre le composant
  if (!user || !user.profileData || !user.profileData.admin) {
    return null;
  }

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Télécharger</button>
    </div>
  );
};

export default FileUpload;
