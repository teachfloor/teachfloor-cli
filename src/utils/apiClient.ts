import axios from 'axios'
import { getOrganization, getToken } from './configUtils.js'

/**
 * Create an Axios instance
 */
const apiClient = axios.create({
  baseURL: `${process.env.API_URL}/cli-api/v0`,
  timeout: 10000,
})

/**
 * Add a request interceptor to include the token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const organization = getOrganization()
    if (organization) {
      config.headers['teachfloor-organization'] = organization
    }

    config.headers.Accept = 'application/json'

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

/**
 * Optionally handle global response errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
)

export default apiClient
