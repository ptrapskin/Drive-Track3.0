#!/usr/bin/env node

// Demo data creation script for Drive-Track
// Creates demo@test.com user with realistic driving session data

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  projectId: "drive-track-7027f",
  appId: "1:94983186341:web:8f5205b1df8a48ae66ea4c",
  storageBucket: "drive-track-7027f.firebasestorage.app",
  apiKey: "AIzaSyCjNqgaLkmO63zOlgU0XwPduuNOdDy1D7k",
  authDomain: "drive-track-7027f.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "94983186341"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const DEMO_EMAIL = 'demo@test.com';
const DEMO_PASSWORD = 'demo123456';

// Demo user profile
const demoProfile = {
  name: 'Demo Driver',
  email: DEMO_EMAIL,
  dateOfBirth: '2007-03-15', // 17 years old
  permitDate: '2024-08-01',
  totalHoursGoal: 50,
  nightHoursGoal: 10
};

// Generate realistic driving sessions over the past 3 months
const generateDemoSessions = () => {
  const sessions = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
  
  const roadTypes = ['Residential', 'Arterial', 'Highway'];
  const weather = ['Sunny', 'Cloudy', 'Rainy', 'Snowy'];
  const timeOfDay = ['Morning', 'Afternoon', 'Evening', 'Night'];
  
  // Create 35 sessions over 3 months (realistic for a learning driver)
  for (let i = 0; i < 35; i++) {
    // Random date between 3 months ago and now
    const sessionDate = new Date(
      threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime())
    );
    
    // Session duration: 20 min to 2 hours (realistic practice sessions)
    const duration = Math.floor(Math.random() * 6000) + 1200; // 20min - 2hrs in seconds
    
    // Miles based on duration (roughly 15-35 mph average)
    const avgSpeed = 20 + Math.random() * 15; // 20-35 mph
    const miles = parseFloat(((duration / 3600) * avgSpeed).toFixed(1));
    
    // Select random attributes with some realistic biases
    const selectedWeather = weather[Math.floor(Math.random() * weather.length)];
    const selectedTimeOfDay = timeOfDay[Math.floor(Math.random() * timeOfDay.length)];
    
    // Road types - start with mostly residential, progress to more variety
    let selectedRoadTypes;
    if (i < 10) {
      // Early sessions: mostly residential
      selectedRoadTypes = ['Residential'];
    } else if (i < 25) {
      // Middle sessions: residential + arterial
      selectedRoadTypes = Math.random() > 0.5 ? 
        ['Residential', 'Arterial'] : ['Residential'];
    } else {
      // Later sessions: all road types
      const numTypes = Math.floor(Math.random() * 3) + 1;
      selectedRoadTypes = roadTypes.slice(0, numTypes);
    }
    
    sessions.push({
      date: sessionDate.toISOString(),
      duration,
      miles,
      weather: selectedWeather,
      roadTypes: selectedRoadTypes,
      timeOfDay: selectedTimeOfDay
    });
  }
  
  // Sort sessions by date
  return sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Skills progress (mark some as completed based on progression)
const generateSkillsProgress = () => {
  const skills = [];
  
  // Based on the skills from skills-data.ts - simulate realistic progression
  const allSkills = [
    { id: 1, title: 'Pre-Drive Vehicle Check' },
    { id: 2, title: 'Proper Seating & Mirror Adjustment' },
    { id: 3, title: 'Starting & Stopping the Engine' },
    { id: 4, title: 'Checking Blind Spots' },
    { id: 5, title: 'Backing Up Straight' },
    { id: 6, title: 'Backing Up & Turning' },
    { id: 7, title: 'Parking on a Hill' },
    { id: 8, title: 'Angle Parking' },
    { id: 9, title: 'Perpendicular Parking' },
    { id: 10, title: 'Parallel Parking' },
    { id: 11, title: 'Pulling Away from a Curb' },
    { id: 12, title: 'Approaching Intersections' },
    { id: 13, title: 'Right Turns' },
    { id: 14, title: 'Left Turns' },
    { id: 15, title: 'Driving Straight' },
    { id: 16, title: 'Lane Changes' },
    { id: 17, title: 'Passing' },
    { id: 18, title: 'Being Passed' },
    { id: 19, title: 'U-Turns' },
    { id: 20, title: 'Following Distance' },
    { id: 21, title: 'Speed Control' },
    { id: 22, title: 'Curves' },
    { id: 23, title: 'Hills' },
    { id: 24, title: 'Narrow Roads' },
    { id: 25, title: 'Residential Areas' },
    { id: 26, title: 'Business/Shopping Areas' },
    { id: 27, title: 'Arterial Streets' },
    { id: 28, title: 'Freeways' },
    { id: 29, title: 'Night Driving' },
    { id: 30, title: 'Rain/Adverse Weather' }
  ];
  
  // Mark first 60% of skills as completed (realistic progression)
  const completedCount = Math.floor(allSkills.length * 0.6);
  
  allSkills.forEach((skill, index) => {
    skills.push({
      id: skill.id,
      completed: index < completedCount
    });
  });
  
  return skills;
};

async function createDemoUser() {
  try {
    console.log('🔥 Creating demo user account...');
    
    // Try to create user, or sign in if already exists
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
      console.log('✅ Demo user created successfully');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('📝 Demo user exists, signing in...');
        userCredential = await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
        console.log('✅ Signed in to existing demo user');
      } else {
        throw error;
      }
    }
    
    const userId = userCredential.user.uid;
    console.log('👤 Demo user ID:', userId);
    
    // Create user profile
    console.log('📋 Creating user profile...');
    await setDoc(doc(db, 'profiles', userId), demoProfile);
    console.log('✅ User profile created');
    
    // Generate and add demo sessions
    console.log('🚗 Generating demo driving sessions...');
    const sessions = generateDemoSessions();
    
    for (const session of sessions) {
      await addDoc(collection(db, 'profiles', userId, 'sessions'), session);
    }
    console.log(`✅ Created ${sessions.length} demo sessions`);
    
    // Add skills progress
    console.log('🎯 Creating skills progress...');
    const skills = generateSkillsProgress();
    
    for (const skill of skills) {
      await setDoc(doc(db, 'profiles', userId, 'skills', skill.id.toString()), skill);
    }
    console.log(`✅ Created ${skills.length} skills with progress`);
    
    // Calculate totals for summary
    const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0) / 3600;
    const totalMiles = sessions.reduce((sum, session) => sum + session.miles, 0);
    const nightSessions = sessions.filter(s => s.timeOfDay === 'Night').length;
    const completedSkills = skills.filter(s => s.completed).length;
    
    console.log('\n🎉 Demo data creation complete!');
    console.log('═══════════════════════════════════');
    console.log(`📧 Email: ${DEMO_EMAIL}`);
    console.log(`🔑 Password: ${DEMO_PASSWORD}`);
    console.log(`⏱️  Total Hours: ${totalHours.toFixed(1)}`);
    console.log(`📏 Total Miles: ${totalMiles.toFixed(1)}`);
    console.log(`🌙 Night Sessions: ${nightSessions}`);
    console.log(`✅ Skills Completed: ${completedSkills}/${skills.length}`);
    console.log(`📊 Sessions: ${sessions.length} over 3 months`);
    console.log('═══════════════════════════════════');
    console.log('\n🎬 Ready for App Store screenshots!');
    
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    process.exit(1);
  }
}

// Run the script
createDemoUser().then(() => {
  console.log('🏁 Script completed successfully');
  process.exit(0);
});
