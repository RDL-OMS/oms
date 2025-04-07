import axios from 'axios';

const API_URL = 'http://localhost:5000/api/projects/owner/dashboard';

const getDashboardData = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  try {
    const response = await axios.get(API_URL, config);
    const data1=response.data;
    return data1.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export default {
  getDashboardData,
};