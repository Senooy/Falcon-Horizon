const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs'); // Ajout de l'importation du module fs

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
  password: 'Liliamendes_07Qv7tpjrZcp8gs4XWQBhDy5W29',
};

// Get Salesforce access token
const getSalesforceAccessToken = async () => {
  const response = await axios.post(
    token_url,
    new URLSearchParams(token_payload),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
};

// Retrieve Salesforce data
const getSalesforceData = async (access_token, url) => {
  const response = await axios.get(url, {
    headers: {
      "Authorization": `Bearer ${access_token}`,
    },
  });
  return response.data;
};

// Créer un tableau pour stocker les URLs
const urls = [
  "https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/listviews/00B0O00000AkAHTUA3/results",
  "https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/listviews/00B0O00000B00wQUAR/results",
  "https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/listviews/00B0O000009lGVqUAM/results",
  "https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/listviews/00B0O00000Ak6lHUAR/results",
  "https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/listviews/00B0O00000Ak8GnUAJ/results",
  "https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/listviews/00B3Y00000Ay7uMUAR/results",
  "https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/listviews/00B0O00000Ak6lGUAR/results",
  // Ajouter plus d'URLs ici

];

// Retrieve vendor IDs
const getVendorIdsAndNames = async (access_token) => {
  const vendorIdsAndNames = {};

  for (const url of urls) {
    const data = await getSalesforceData(access_token, url);

    for (const record of data.records) {
      let id = null;
      let name = null;
      for (const column of record.columns) {
        if (column.fieldNameOrPath === "Id") {
          id = column.value;
        } else if (column.fieldNameOrPath === "Name") {
          name = column.value;
        }
      }
      // Ajouter uniquement l'identifiant du fournisseur s'il n'existe pas déjà
      if (id && name && !vendorIdsAndNames.hasOwnProperty(id)) {
        vendorIdsAndNames[id] = name;
      }
    }
  }
  
  // Ajouter manuellement des identifiants de fournisseur ici
  vendorIdsAndNames["003AM0000025x19YAA"] = "Matthieu SLOSZEK";
  vendorIdsAndNames["003AM000002VmTUYA0"] = "Rilès ZENOUD";
  // Ajouter autant d'identifiants que vous le souhaitez

  return vendorIdsAndNames;
};


// Retrieve all sales for each vendor ID and add the vendor name to each sale
const getAllSales = async (access_token, vendorIdsAndNames) => {
  const allSales = [];

  for (const [vendorId, vendorName] of Object.entries(vendorIdsAndNames)) {
    const salesUrl = `https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/${vendorId}/Sales__r`;
    const salesData = await getSalesforceData(access_token, salesUrl);
    for (const sale of salesData.records) {
      // Add the vendor name to the sale
      sale.VendorName__c = vendorName;
    }
    allSales.push(...salesData.records);
  }
 
  return allSales;
};


// Main route
app.get('/api/sales', async (req, res) => {
  try {
    const access_token = await getSalesforceAccessToken();
    const vendorIdsAndNames = await getVendorIdsAndNames(access_token);
    const allSales = await getAllSales(access_token, vendorIdsAndNames);

    // Compile data into a single JSON file
    fs.writeFileSync("public/all_sales.json", JSON.stringify(allSales, null, 2));

    // Return the sales data as response
    res.json(allSales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});


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

app.use('/public/uploads', express.static(path.join(__dirname, '/public/uploads')));

// Route pour le téléchargement de fichiers
app.post('/api/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('Aucun fichier n\'a été téléchargé.');
  }

  const uploadDir = path.join(__dirname, '/public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let file = req.files.file;
  file.mv(path.join(uploadDir, file.name), function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('Fichier téléchargé !');
  });
});

// Route pour récupérer la liste des fichiers
app.get('/api/files', (req, res) => {
  const uploadDir = path.join(__dirname, '/public/uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Une erreur est survenue lors de la récupération des fichiers.');
    }
    res.json(files);
  });
});

// Route pour servir un fichier spécifique
app.get('/api/files/:name', (req, res) => {
  const filePath = path.join(__dirname, '/public/uploads', req.params.name);
  res.sendFile(filePath);
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

// Fonction récursive pour exécuter la route toutes les 3 minutes
const runSalesRoute = async () => {
  try {
    await axios.get('http://localhost:3001/api/sales');
    console.log('Sales data updated successfully');
  } catch (error) {
    console.error('Error updating sales data:', error);
  }

  setTimeout(runSalesRoute, 3 * 60 * 1000); // Exécute la fonction toutes les 3 minutes
};

// Lancer la fonction récursive au démarrage du serveur
runSalesRoute();
