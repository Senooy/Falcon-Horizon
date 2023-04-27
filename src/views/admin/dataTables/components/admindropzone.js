import { AuthContext } from 'contexts/AuthContext';
import React, { useState, useEffect, useContext } from 'react';
import DropzoneComponent from './dropzone';

function AdminDropzone() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Accédez au contexte AuthContext pour récupérer l'instance de Firestore
  const { firestore } = useContext(AuthContext);

  useEffect(() => {
    // Remplacez 'userId' par l'ID de l'utilisateur actuellement connecté
    const userId = 'userId';

    const userRef = firestore.collection('users').doc(userId);
    userRef.get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        setIsAdmin(userData.isAdmin);
      } else {
        console.log('Aucun utilisateur correspondant !');
      }
      setLoading(false);
    }).catch((error) => {
      console.log("Erreur lors de la récupération de l'utilisateur :", error);
      setLoading(false);
    });
  }, [firestore]); // Ajoutez firestore comme dépendance pour éviter les problèmes liés à la portée des variables

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      {isAdmin ? (
        <DropzoneComponent />
      ) : (
        <p>Vous n'avez pas les autorisations pour accéder à cette fonctionnalité.</p>
      )}
    </div>
  );
}

export default AdminDropzone;
