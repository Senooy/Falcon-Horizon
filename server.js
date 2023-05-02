const express = require("express");
const axios = require("axios");
const qs = require("qs");
const cors = require("cors");


// API Salesforce
const app = express();
app.use(cors());

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const userId = userCredential.user.uid;

    const docRef = firebase.firestore().collection("users").doc(userId);
    const doc = await docRef.get();

    if (doc.exists) {
      const userData = doc.data();
      const isAdmin = userData.isAdmin;
      res.status(200).json({ message: `Utilisateur connecté avec l'ID : ${userId}`, isAdmin: isAdmin });
    } else {
      res.status(404).json({ message: "Aucun document correspondant trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la connexion de l'utilisateur", error });
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
