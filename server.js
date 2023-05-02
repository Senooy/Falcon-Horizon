const express = require("express");
const app = express();
const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");
const { MongoClient } = require("mongodb");


app.use(express.json());

const uri = "mongodb+srv://nskhelifi:JvMIw2tmGjHUrA4w@cluster0.k2t4xjh.mongodb.net/?retryWrites=true&w=majority";


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    // Connectez le client au serveur (facultatif à partir de la version 4.7)
    await client.connect();
    // Envoi d'un ping pour confirmer une connexion réussie
    console.log("Connecté à la base de données MongoDB");
    const db = client.db("Cluster0");

    app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Utilisateur connecté avec l\'ID:', userId);

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      res.status(404).json({ message: 'Utilisateur introuvable' });
    } else {
      const userData = userDoc.data();
      res.status(200).json(userData);
    }
  } catch (error) {
    console.error('Erreur de récupération des données utilisateur', error);
    res.status(500).json({ message: 'Erreur de récupération des données utilisateur' });
  }
});

    
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const userId = userCredential.user.uid;

    const docRef = firebase.firestore().collection("users").doc(userId);
    const doc = await docRef.get();

    if (doc.exists) {
      const userData = doc.data();
      const insertedId = await insertUserIntoMongoDB(userData);
      const insertedUser = await findUserInMongoDB(insertedId);
      res.status(200).json({ message: `Utilisateur inséré avec succès avec l'ID : ${insertedId}`, user: insertedUser });
    } else {
      res.status(404).json({ message: "Aucun document correspondant trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la connexion ou de l'insertion de l'utilisateur", error });
  }
});


async function insertUserIntoMongoDB(userData) {
  try {
    await client.connect();
    const usersCollection = client.db("Cluster0").collection("falconDb");
    const result = await usersCollection.insertOne(userData);
    return result.insertedId;
  } catch (error) {
    console.log("Erreur lors de l'insertion de l'utilisateur :", error);
    return null;
  } finally {
    await client.close();
  }
}

async function findUserInMongoDB(userId) {
  try {
    await client.connect();
    const usersCollection = client.db("Cluster0").collection("falconDb");
    const user = await usersCollection.findOne({ _id: new MongoClient.ObjectId(userId) });
    return user;
  } catch (error) {
    console.log("Erreur lors de la recherche de l'utilisateur :", error);
    return null;
  } finally {
    await client.close();
  }
}

    
    

    // Ajoutez d'autres routes ici

  } finally {
    // Assure que le client se ferme lorsque vous terminez/erreur
    await client.close();
  }
}

run().catch(console.dir);

// API Salesforce
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
app.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`));

