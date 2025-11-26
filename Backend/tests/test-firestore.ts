import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseConfig } from "../Database/firebaseConfig";

async function testFirestore() {
  try {
    console.log('Testing Firestore connection...\n');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✓ Firebase app initialized');
    
    // Get Firestore instance
    const db = getFirestore(app);
    console.log('✓ Firestore instance created');
    
    // Try to write a test document
    console.log('\nAttempting to write test document...');
    const docRef = await addDoc(collection(db, "test_collection"), {
      test: "Hello from DeChico",
      timestamp: new Date().toISOString()
    });
    
    console.log('✓ Document written successfully!');
    console.log('Document ID:', docRef.id);
    console.log('\n✅ Firestore is working correctly!');
    
  } catch (error: any) {
    console.error('\n❌ Firestore Error:', error.message);
    console.error('Error code:', error.code);
    console.error('\nFull error:', error);
  }
}

testFirestore();
