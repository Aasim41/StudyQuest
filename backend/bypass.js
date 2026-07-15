const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function bypassOnboarding() {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    if (snapshot.empty) {
      console.log('No users found.');
      return;
    }

    let updatedCount = 0;
    for (const doc of snapshot.docs) {
      await usersRef.doc(doc.id).set({ onboardingComplete: true }, { merge: true });
      updatedCount++;
    }
    
    console.log(`Successfully bypassed onboarding for ${updatedCount} user(s)!`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

bypassOnboarding();
