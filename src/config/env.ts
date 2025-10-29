// Environment configuration
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://drishti-backend-kd7n.onrender.com',
  APP_NAME: 'Drishti.io',
  APP_VERSION: '1.0.0',
} as const;

