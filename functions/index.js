const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setAdminRole = functions.https.onCall((data, context) => {
  // Vérifiez si l'utilisateur actuel est autorisé à définir le rôle d'administrateur

  return admin.auth().getUserByEmail(data.email).then(user => {
    return admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
    });
  }).then(() => {
    return {
      message: `L'utilisateur ${data.email} a été défini en tant qu'administrateur.`,
    }
  }).catch(err => {
    return err;
  });
});
