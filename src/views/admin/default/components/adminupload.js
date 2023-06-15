import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const AdminUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmation, setConfirmation] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    // Faites quelque chose avec les fichiers acceptés
    const file = acceptedFiles[0];
    setSelectedFile(file);
    setConfirmation(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleConfirmation = () => {
    setConfirmation(true);
    // Envoyer le fichier au serveur ici si nécessaire
    // Utilisez l'état "selectedFile" pour accéder au fichier sélectionné
    console.log('Fichier sélectionné :', selectedFile);
  };

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Déposez les fichiers ici ...</p>
      ) : (
        <p>
          Glissez et déposez des fichiers ici, ou cliquez pour sélectionner des fichiers
        </p>
      )}
      {selectedFile && !confirmation && (
        <button onClick={handleConfirmation}>Confirmer l'envoi du fichier</button>
      )}
      {confirmation && <p>Confirmez l'envoi du fichier : {selectedFile.name}</p>}
    </div>
  );
};

export default AdminUpload;
