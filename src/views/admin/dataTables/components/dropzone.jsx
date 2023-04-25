import React from 'react';
import { useDropzone } from 'react-dropzone';

function DropzoneComponent() {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      // Gérer les fichiers déposés ici
      console.log(acceptedFiles);
    },
  });

  return (
    <div {...getRootProps()} style={{ border: '2px dashed black', padding: '20px', marginTop: '10px' }}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Relâchez les fichiers pour les déposer ici</p>
      ) : (
        <p>Glissez-déposez des fichiers ici ou cliquez pour sélectionner des fichiers</p>
      )}
    </div>
  );
}

export default DropzoneComponent;
