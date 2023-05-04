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

// Ajoutez la route pour exécuter le script Python
app.post('/api/regenerate-json', (req, res) => {
  const pythonScript = spawn('python', ['/public/allsales.py']);
  
  pythonScript.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  
  pythonScript.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  pythonScript.on('close', (code) => {
    console.log(`Python script exited with code ${code}`);
    res.sendStatus(code === 0 ? 200 : 500);
  });
});


app.use(cors(corsOptions));

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