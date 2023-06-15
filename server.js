const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');

// API Salesforce
const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite la taille des fichiers à 10MB
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
app.post('/api/files/upload',function(req, res) {
     
  upload(req, res, function (err) {
         if (err instanceof multer.MulterError) {
             return res.status(500).json(err)
         } else if (err) {
             return res.status(500).json(err)
         }
    return res.status(200).send(req.file)

  })

});
// Route pour le téléchargement multiple de fichiers
app.post('/api/files/uploadMultiple', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('Aucun fichier n\'a été téléchargé.');
  }

  const uploadDir = path.join(__dirname, '/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let files = req.files.files;

  files.forEach(file => {
    file.mv(path.join(uploadDir, file.name), function(err) {
      if (err)
        return res.status(500).send(err);
    });
  });

  res.send('Fichiers téléchargés !');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Serveur en cours d'exécution sur le port ${PORT}`));