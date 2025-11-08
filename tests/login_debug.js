const axios = require('axios');
(async function(){
  try{
    const res = await axios.post('http://localhost:5000/api/auth/login', { email: 'admin@example.com', password: 'admin123' });
    console.log('OK', res.data);
  } catch(err) {
    console.error('ERR message:', err.message);
    if (err.response) {
      console.error('status:', err.response.status);
      console.error('data:', err.response.data);
    }
    console.error(err.stack);
  }
})();
