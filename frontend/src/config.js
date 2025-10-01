// Important: API configuration for production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://user-management-backend.onrender.com'  // Your backend URL from Render
  : 'http://localhost:5000';

export default API_BASE_URL;