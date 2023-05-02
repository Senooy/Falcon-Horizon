const express = require("express");
const axios = require("axios");
const qs = require("qs");
const cors = require("cors");
const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

// API Salesforce
const app = express();
app.use(express.json());

// Route pour récupérer les données de l'utilisateur connecté
app.get("/api/user", async (req, res) => {
  // Vérifiez si un utilisateur est connecté
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    res.status(401).send("Aucun utilisateur connecté");
    return;
  }

  try {
    // Récupérez les données de l'utilisateur
    const userData = await getUserData(currentUser);
    res.json(userData);
    console.log(`ID Firebase de l'utilisateur : ${currentUser.uid}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des données de l'utilisateur" });
  }
});

// Fonction pour récupérer les données d'un utilisateur en utilisant son email
async function getUserData(user) {
  const db = firebase.firestore();
  const q = db.collection("users").where("email", "==", user.email);
  const querySnapshot = await q.get();
  if (querySnapshot.empty) {
    throw new Error("Aucun utilisateur correspondant trouvé dans la base de données");
  }
  const userData = querySnapshot.docs[0].data();
  return userData;
}


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
