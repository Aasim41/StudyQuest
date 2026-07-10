const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

db.collection('test').doc('testDoc').set({ hello: 'world' })
  .then(() => {
    console.log('SUCCESS_DB_WRITE');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAIL_DB_WRITE:', err);
    process.exit(1);
  });
