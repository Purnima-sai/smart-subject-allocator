const axios = require('axios');
(async function(){
  try{
    const res = await axios.post('http://localhost:5000/api/auth/login', { 
      email: 'student@example.com', 
      password: 'student123' 
    });
    console.log('✓ Student login successful!');
    console.log('Token:', res.data.token.substring(0, 50) + '...');
    console.log('User:', res.data.user);
  } catch(err) {
    console.error('✗ Login failed');
    console.error('Error message:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
  }
})();
