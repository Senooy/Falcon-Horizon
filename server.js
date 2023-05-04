const express = require("express");
const axios = require("axios");
const qs = require("qs");
const cors = require("cors")
const { spawn } = require('child_process');

// API Salesforce
const app = express();
app.use(express.json());

const allowedOrigins = ["http://app.falconmarketing.fr", "http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

async function getSalesforceAccessToken() {
  const form = new FormData();
  for (const key in token_payload) {
    form.append(key, token_payload[key]);
  }

  const response = await axios.post(token_url, form, {
    headers: form.getHeaders(),
  });

  return response.data.access_token;
}

async function getSalesforceData(access_token, url) {
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  return response.data;
}

async function getVendorIds(access_token) {
  const url = 'https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/listviews/00B0O00000AkAHTUA3/results';
  const data = await getSalesforceData(access_token, url);
  const vendor_ids = [];

  for (const record of data.records) {
    for (const column of record.columns) {
      if (column.fieldNameOrPath === 'Id') {
        vendor_ids.push(column.value);
      }
    }
  }

  return vendor_ids;
}

async function getAllSales(access_token, vendor_ids) {
  const all_sales = [];

  for (const vendor_id of vendor_ids) {
    const sales_url = `https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/${vendor_id}/Sales__r`;
    const sales_data = await getSalesforceData(access_token, sales_url);
    all_sales.push(...sales_data.records);
  }

  return all_sales;
}

app.get('/api/all_sales', async (req, res) => {
  try {
    const access_token = await getSalesforceAccessToken();
    const vendor_ids = await getVendorIds(access_token);
    const all_sales = await getAllSales(access_token, vendor_ids);

    res.json(all_sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


const token_url = "https://login.salesforce.com/services/oauth2/token";
const token_payload = {
  grant_type: "password",
  client_id: "3MVG9I5UQ_0k_hTlxl9SwXkHaaX5kX0qAYQOq8c.PkG5DFWIFEwsrzI496JZ.GmBIIHFqnwDc75JvefLHSe.7",
  client_secret: "352231377BC938C6935CBC9E243BF1180120947E65594D9EC35A6F230E3DFAA4",
  username: "falcon@api.circet",
  password: "Yfauconapi59-HJ4GRqJAcl9stoSszZ1sa1g1",
};

app.get("/api/salesforce_data", async (req, res) => {
  try {
    const { data } = await axios.post(token_url, qs.stringify(token_payload), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
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
    res.status(500).json({ message: "Une erreur est survenue lors de la récupération des données." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));