const express = require("express");
const axios = require("axios");
const qs = require("qs");
const cors = require("cors")
const fs = require("fs");


// API Salesforce
const app = express();
app.use(express.json());


app.use(cors({
  origin: ['http://localhost:3000', 'http://app.falconmarketing.fr']
}));

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

// Récupère les ID des vendeurs
async function get_vendor_ids(access_token) {
  const url = "https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/listviews/00B0O00000AkAHTUA3/results";
  const { data } = await axios.get(url, { headers: { "Authorization": `Bearer ${access_token}` } });
  let vendor_ids = [];
  for (let record of data.records) {
    for (let column of record.columns) {
      if (column.fieldNameOrPath === "Id") {
        vendor_ids.push(column.value);
      }
    }
  }
  return vendor_ids;
}

// Récupère toutes les ventes pour chaque ID de vendeur
async function get_all_sales(access_token, vendor_ids) {
  let all_sales = [];
  for (let vendor_id of vendor_ids) {
    const sales_url = `https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/${vendor_id}/Sales__r`;
    const { data: sales_data } = await axios.get(sales_url, { headers: { "Authorization": `Bearer ${access_token}` } });
    all_sales = [...all_sales, ...sales_data.records];
  }
  return all_sales;
}

app.get("/api/all_sales", async (req, res) => {
  try {
    const { data } = await axios.post(token_url, qs.stringify(token_payload), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const vendor_ids = await get_vendor_ids(data.access_token);
    const all_sales = await get_all_sales(data.access_token, vendor_ids);

    fs.writeFile("all_sales.json", JSON.stringify(all_sales, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Une erreur est survenue lors de la rédaction du fichier." });
      } else {
        console.log("Toutes les ventes ont été compilées dans all_sales.json");
        res.json(all_sales); // On n'envoie la réponse qu'une seule fois
      }
    });    
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Une erreur est survenue lors de la récupération des données." });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));