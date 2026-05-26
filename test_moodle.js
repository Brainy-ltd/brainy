/**
 * Moodle Integration REST API Test Script
 * 
 * Instructions:
 * 1. Start the server in one terminal: npm run dev
 * 2. Run this test script in another terminal: node test_moodle.js
 */

const PORT = 3000;

async function runTest() {
  console.log("====================================================");
  console.log("🧪 TESTING MOODLE INTEGRATION REST API HANDSHAKE");
  console.log("====================================================");
  console.log(`Connecting to local server at http://localhost:${PORT}...`);

  try {
    const response = await fetch(`http://localhost:${PORT}/api/moodle/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useSandbox: true })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log("\n✅ CONNECTION SUCCESSFUL!");
    console.log(`Source:  ${data.source}`);
    console.log(`Message: ${data.message}`);
    console.log("\n📦 SYNCHRONIZED COURSE DATA RECEIVED FROM REST API:");
    
    data.courses.forEach((course, index) => {
      console.log(`\n--- Course #${index + 1} ---`);
      console.log(`📚 Title:      \x1b[33m${course.title}\x1b[0m`);
      console.log(`🔑 Code:       ${course.code}`);
      console.log(`👨‍🏫 Instructor: ${course.instructor}`);
      console.log(`📈 Progress:   ${course.progress}% (${course.completedLessons}/${course.lessonsCount} lessons)`);
      console.log(`📝 Grade:      ${course.grade} (${course.gradePercentage}%)`);
      console.log(`📋 Details:    ${course.description}`);
    });

    console.log("\n====================================================");
    console.log("🎉 Test completed successfully! Moodle integration is active.");
    console.log("====================================================");

  } catch (error) {
    console.error("\n❌ TEST CONNECTION FAILED!");
    console.error(error.message);
    console.log("\n💡 Troubleshooting:");
    console.log("1. Make sure your local server is running: npm run dev");
    console.log("2. Ensure port 3000 is not blocked or in use by other processes.");
    console.log("====================================================");
  }
}

runTest();
