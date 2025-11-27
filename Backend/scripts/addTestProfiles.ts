/**
 * Add Test Profiles Script
 * Creates fake profiles in Firestore for testing the dating feature
 */

import { adminDb, adminFieldValue } from '../config/firebaseAdmin';

const testProfiles = [
  {
    email: 'alex.wildcat@csuchico.edu',
    name: 'Alex Rivera',
    alias: 'wildcat_alex',
    age: 21,
    bio: 'CS major who loves hiking at Bidwell Park and late-night coding sessions at the library. Always down for Costco runs!',
    interests: 'Hiking, Programming, Photography, Coffee, Gaming',
    ethnicity: 'Hispanic',
    gender: 'Male',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    ],
    profileComplete: true,
  },
  {
    email: 'sarah.chico@csuchico.edu',
    name: 'Sarah Chen',
    alias: 'sarahc',
    age: 20,
    bio: 'Business major with a passion for sustainable fashion. Love exploring downtown Chico and trying new restaurants!',
    interests: 'Fashion, Sustainability, Food, Art, Yoga',
    ethnicity: 'Asian',
    gender: 'Female',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    ],
    profileComplete: true,
  },
  {
    email: 'mike.johnson@csuchico.edu',
    name: 'Mike Johnson',
    alias: 'mike_j',
    age: 22,
    bio: 'Engineering student and gym enthusiast. Looking for someone to explore NorCal with. Big fan of Jack\'s karaoke nights!',
    interests: 'Fitness, Travel, Music, Sports, Cooking',
    ethnicity: 'Caucasian',
    gender: 'Male',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    ],
    profileComplete: true,
  },
  {
    email: 'emma.davis@csuchico.edu',
    name: 'Emma Davis',
    alias: 'emmad',
    age: 19,
    bio: 'Psychology major who loves animals and volunteering. Always looking for new adventures and good vibes!',
    interests: 'Psychology, Animals, Volunteering, Reading, Nature',
    ethnicity: 'Caucasian',
    gender: 'Female',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
    ],
    profileComplete: true,
  },
  {
    email: 'carlos.martinez@csuchico.edu',
    name: 'Carlos Martinez',
    alias: 'carlos_m',
    age: 23,
    bio: 'Art major specializing in graphic design. Love skateboarding, street art, and finding hidden gems in Chico.',
    interests: 'Art, Design, Skateboarding, Music, Photography',
    ethnicity: 'Hispanic',
    gender: 'Male',
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400',
    ],
    profileComplete: true,
  },
  {
    email: 'jessica.kim@csuchico.edu',
    name: 'Jessica Kim',
    alias: 'jess_k',
    age: 21,
    bio: 'Biology major pre-med. Love studying at the BMU, bubble tea, and weekend trips to SF. Looking for study buddies and more!',
    interests: 'Science, Medicine, Bubble Tea, Travel, K-pop',
    ethnicity: 'Asian',
    gender: 'Female',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    ],
    profileComplete: true,
  },
  {
    email: 'tyler.brown@csuchico.edu',
    name: 'Tyler Brown',
    alias: 'tbrown',
    age: 20,
    bio: 'Communications major and aspiring filmmaker. Always have my camera ready. Let\'s make some memories!',
    interests: 'Film, Photography, Music, Writing, Coffee',
    ethnicity: 'African American',
    gender: 'Male',
    photos: [
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400',
      'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400',
    ],
    profileComplete: true,
  },
  {
    email: 'olivia.taylor@csuchico.edu',
    name: 'Olivia Taylor',
    alias: 'liv_t',
    age: 22,
    bio: 'Environmental Science major passionate about sustainability. Love camping, farmers markets, and good conversations.',
    interests: 'Environment, Camping, Sustainability, Cooking, Yoga',
    ethnicity: 'Caucasian',
    gender: 'Female',
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
    ],
    profileComplete: true,
  },
];

async function addTestProfiles() {
  console.log('🚀 Starting to add test profiles...\n');

  const usersRef = adminDb.collection('users');
  let successCount = 0;
  let errorCount = 0;

  for (const profile of testProfiles) {
    try {
      const docRef = await usersRef.add({
        ...profile,
        createdAt: adminFieldValue.serverTimestamp(),
        updatedAt: adminFieldValue.serverTimestamp(),
        lastLogin: adminFieldValue.serverTimestamp(),
      });

      console.log(`✅ Added: ${profile.name} (${profile.alias}) - ID: ${docRef.id}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error adding ${profile.name}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully added: ${successCount} profiles`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`\n🎉 Done! Test profiles are ready for swiping!`);
  console.log(`\n💡 Tip: Go to http://localhost:5173 and navigate to the Dating tab to see them!`);
}

// Run the script
addTestProfiles()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
