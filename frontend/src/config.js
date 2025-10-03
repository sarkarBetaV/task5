const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://user-management-backend-e2dl.onrender.com'  // NEW URL
  : 'http://localhost:5000';

export default API_BASE_URL;