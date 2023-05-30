const express = require("express");
const axios = require("axios");
const qs = require("qs");
const cors = require("cors")
const { spawn } = require('child_process');

// API Salesforce
const app = express();
app.use(express.json());


app.use(cors())

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

// Configuring Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination folder where files will be saved
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    // Set the filename to the original file name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.array("files"), (req, res) => {
  // Handle the uploaded files
  console.log(req.body); // Contains the seller information
  console.log(req.files); // Contains the uploaded files

  // You can perform additional processing or save the files to the desired location on your VPS
  
  res.json({ message: "Files uploaded successfully." });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));