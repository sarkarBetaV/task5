// Important: Use your EXACT backend URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://user-management-backend-7fow.onrender.com'  // Your exact backend URL
  : 'http://localhost:5000';

export default API_BASE_URL;