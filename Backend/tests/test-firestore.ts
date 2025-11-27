import { adminDb } from "../config/firebaseAdmin";

async function testFirestore() {
  try {
    console.log('Testing Firestore connection...\n');

    // Try to write a test document
    console.log('\nAttempting to write test document...');
    const docRef = await adminDb.collection("test_collection").add({
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
