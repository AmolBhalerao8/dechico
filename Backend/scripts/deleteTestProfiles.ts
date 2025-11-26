/**
 * Delete Test Profiles Script
 * Removes all test profiles from Firestore
 */

import { DatabaseGateway } from '../Database/databaseGateway';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

// Test profile emails to delete
const TEST_EMAILS = [
  'mike.johnson@csuchico.edu',
  'emma.davis@csuchico.edu',
  'carlos.martinez@csuchico.edu',
  'jessica.kim@csuchico.edu',
  'tyler.brown@csuchico.edu',
  'sophia.garcia@csuchico.edu',
  'alex.chen@csuchico.edu',
  'maya.patel@csuchico.edu',
];

async function deleteTestProfiles() {
  try {
    console.log('🗑️  Starting test profile deletion...\n');
    
    const db = DatabaseGateway.getFirestore();
    const usersRef = collection(db, USERS_COLLECTION);
    
    let deletedCount = 0;
    
    for (const email of TEST_EMAILS) {
      try {
        // Query for user with this email
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Delete each matching document
          for (const docSnapshot of querySnapshot.docs) {
            await deleteDoc(doc(db, USERS_COLLECTION, docSnapshot.id));
            console.log(`✅ Deleted: ${email} (ID: ${docSnapshot.id})`);
            deletedCount++;
          }
        } else {
          console.log(`⏭️  Not found: ${email}`);
        }
      } catch (error) {
        console.error(`❌ Error deleting ${email}:`, error);
      }
    }
    
    console.log(`\n🎉 Deletion complete! Deleted ${deletedCount} test profiles.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during deletion:', error);
    process.exit(1);
  }
}

// Run the deletion
deleteTestProfiles();
