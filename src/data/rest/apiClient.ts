import Constants from "expo-constants";
import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = Constants.expoConfig?.extra?.API_URL;

const getHeaders = async () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore auth errors if not logged in
  }

  return headers;
};

export const apiClient = {
  post: async (url: string, data: any) => {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },
  get: async (url: string) => {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },
}

