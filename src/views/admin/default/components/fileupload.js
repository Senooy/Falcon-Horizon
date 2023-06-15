import { useState } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import axios from 'axios';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await axios.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setUploadStatus('Le fichier a été téléchargé avec succès !');
        console.log(response.data);
      } catch (error) {
        setUploadStatus('Une erreur s\'est produite lors du téléchargement du fichier.');
        console.error(error);
      }
    } else {
      setUploadStatus('Aucun fichier sélectionné.');
    }
  };

  return (
    <Box>
      <input type="file" onChange={handleFileChange} />
      <Button colorScheme="blue" onClick={handleUpload}>
        Envoyer
      </Button>
      {selectedFile && (
        <Text mt={2}>Fichier sélectionné : {selectedFile.name}</Text>
      )}
      {uploadStatus && <Text mt={2}>{uploadStatus}</Text>}
    </Box>
  );
};

export default FileUpload;
