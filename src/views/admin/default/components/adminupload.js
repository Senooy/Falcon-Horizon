import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

const AdminUpload = () => {
  const onDrop = useCallback(acceptedFiles => {
    // Faites quelque chose avec les fichiers acceptés
    const file = acceptedFiles[0]
    const formData = new FormData()
    formData.append('file', file)
    fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Déposez les fichiers ici ...</p> :
          <p>Glissez et déposez des fichiers ici, ou cliquez pour sélectionner des fichiers</p>
      }
    </div>
  )
}


export default AdminUpload;
