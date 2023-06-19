const express = require('express');
const axios = require('axios');
const qs = require('qs');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

// API Salesforce
const app = express();
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(express.json());
app.use(cors());
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
}));

const token_url = 'https://login.salesforce.com/services/oauth2/token';
const token_payload = {
  grant_type: 'password',
  client_id: '3MVG9I5UQ_0k_hTlxl9SwXkHaaX5kX0qAYQOq8c.PkG5DFWIFEwsrzI496JZ.GmBIIHFqnwDc75JvefLHSe.7',
  client_secret: '352231377BC938C6935CBC9E243BF1180120947E65594D9EC35A6F230E3DFAA4',
  username: 'falcon@api.circet',
  password: 'Yfauconapi59-HJ4GRqJAcl9stoSszZ1sa1g1',
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

// Retrieve vendor IDs
const getVendorIdsAndNames = async (access_token) => {
  const url = "https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/listviews/00B0O00000AkAHTUA3/results";
  const data = await getSalesforceData(access_token, url);
  const vendorIdsAndNames = {};

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
    if (id && name) {
      vendorIdsAndNames[id] = name;
    }
  }

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

    fs.writeFileSync("public/all_sales.json", JSON.stringify(allSales, null, 2));

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
    res.status(500).json({ message: 'An error occurred while retrieving data.' });
  }
});

app.use('/public/uploads', express.static(path.join(__dirname, '/public/uploads')));

app.post('/api/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const uploadDir = path.join(__dirname, '/public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let file = req.files.file;
  file.mv(path.join(uploadDir, file.name), function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});

app.get('/api/files', (req, res) => {
  const uploadDir = path.join(__dirname, '/public/uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('An error occurred while retrieving files.');
    }
    res.json(files);
  });
});

app.get('/api/files/:name', (req, res) => {
  const filePath = path.join(__dirname, '/public/uploads', req.params.name);
  res.sendFile(filePath);
});

app.post('/api/files/uploadMultiple', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
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

  res.send('Files uploaded!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
