const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10000000 },  // Limite la taille des fichiers à 10MB
});

// API Salesforce
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http:/app.falconmarketing.fr'  // remplacez par l'URL de votre client
}));

const token_url = 'https://login.salesforce.com/services/oauth2/token';
const token_payload = {
  grant_type: 'password',
  client_id: '3MVG9I5UQ_0k_hTlxl9SwXkHaaX5kX0qAYQOq8c.PkG5DFWIFEwsrzI496JZ.GmBIIHFqnwDc75JvefLHSe.7',
  client_secret: '352231377BC938C6935CBC9E243BF1180120947E65594D9EC35A6F230E3DFAA4',
  username: 'falcon@api.circet',
  password: 'Yfauconapi59-HJ4GRqJAcl9stoSszZ1sa1g1',
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

// Route pour le téléchargement de fichiers
app.post('/api/files/upload', (req, res) => {
  upload.single('file')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Une erreur Multer s'est produite lors de l'upload.
      console.error(err);
      return res.status(500).json({ message: 'Une erreur Multer s\'est produite lors de l\'upload.' });
    } else if (err) {
      // Une erreur inconnue s'est produite lors de l'upload.
      console.error(err);
      return res.status(500).json({ message: 'Une erreur inconnue s\'est produite lors de l\'upload.' });
    }

    // Si tout s'est bien passé, procédez comme d'habitude.
    res.json({ file: req.file });
  });
});

// Serve les fichiers statiques de l'application React
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Route pour servir la page principale de l'application React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Serveur en cours d'exécution sur le port ${PORT}`));
