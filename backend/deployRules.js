const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const source = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

admin.securityRules().releaseFirestoreRulesetFromSource(source)
  .then(() => {
    console.log('Rules updated successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error updating rules:', err);
    process.exit(1);
  });
