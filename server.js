const express = require("express");
const axios = require("axios");
const qs = require("qs");
const cors = require("cors");
const { exec } = require("child_process")

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

app.get("/run-script", (req, res) => {
  exec("python allsales.py", (error, stdout, stderr) => {
    if (error) {
      console.log(`Erreur: ${error.message}`);
      res.status(500).send({ message: "Erreur lors de l'exécution du script Python." });
      return;
    }
    if (stderr) {
      console.log(`Erreur: ${stderr}`);
      res.status(500).send({ message: "Erreur lors de l'exécution du script Python." });
      return;
    }

    fs.readFile("all_sales.json", "utf8", (err, data) => {
      if (err) {
        console.log(`Erreur lors de la lecture du fichier: ${err}`);
        res.status(500).send({ message: "Erreur lors de la lecture du fichier all_sales.json." });
        return;
      }

      res.send(JSON.parse(data));
    });
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