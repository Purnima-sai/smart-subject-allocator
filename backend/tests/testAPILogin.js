const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testing Backend Login API...\n');
    
    const testCredentials = {
      email: 'student19@college.edu',
      password: 'HWlpKBAx'
    };

    console.log('Test Credentials:');
    console.log('  Email:', testCredentials.email);
    console.log('  Password:', testCredentials.password);
    console.log('\nAttempting login...\n');

    const response = await axios.post('http://localhost:5000/api/auth/login', testCredentials);
    
    console.log('✅ Login Successful!');
    console.log('═══════════════════════════════════════');
    console.log('Token:', response.data.token);
    console.log('\nUser Info:');
    console.log('  ID:', response.data.user.id);
    console.log('  Name:', response.data.user.name);
    console.log('  Email:', response.data.user.email);
    console.log('  Role:', response.data.user.role);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Login Failed!');
    console.error('═══════════════════════════════════════');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message || error.response.data);
    } else {
      console.error('Error:', error.message);
      console.error('\n💡 Make sure the backend server is running on port 5000');
      console.error('   Run: npm run dev (in backend directory)');
    }
    console.error('═══════════════════════════════════════\n');
  }
}

testLogin();
