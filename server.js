const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10000000 },  // Limit the file size to 10MB
});

// API Salesforce
const app = express();
app.use(express.json());
app.use(cors());

// Cachez vos clés API, elles ne devraient jamais être codées en dur.
const token_url = process.env.TOKEN_URL;
const token_payload = {
  grant_type: 'password',
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
};

app.get('/api/salesforce_data', async (req, res) => {
  try {
    const { data } = await axios.post(token_url, qs.stringify(token_payload), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const salesDataUrl = `https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/${req.query.salesCode}/Sales__r`;
    const { data: salesData } = await axios.get(salesDataUrl, {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    res.json(salesData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des données.' });
  }
});

// Serve les fichiers statiques de l'application React
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Route pour servir la page principale de l'application React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Route pour le téléchargement de fichiers
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ file: req.file });
  } else {
    res.status(500).json({ message: 'Une erreur est survenue lors de l\'upload du fichier.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Serveur en cours d'exécution sur le port ${PORT}`));
