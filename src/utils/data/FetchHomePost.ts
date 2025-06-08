import axios, { AxiosError } from 'axios';
import { getToken } from '../Cookie';

interface ApiResponse<T> {
     posts: T;
     hasMore: boolean;
     page: number;
}

export const fetchHomePosts = async (API_URL: string) => {
     try {
          const token = getToken()
          const response = await fetch(API_URL, {
               cache: 'default',
               headers: {
                    "Authorization": `Bearer ${token}`
               }
          });
          
          if (!response.ok) {
               throw new Error('Failed to fetch posts');
          }

          const data = await response.json();
          return data as ApiResponse<any>;
     } catch (error) {
          if (error instanceof AxiosError) {
               if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    throw new Error(error.response.data.message || 'Failed to fetch posts');
               } else if (error.request) {
                    // The request was made but no response was received
                    throw new Error('No response received from server');
               }
          }
          // Something happened in setting up the request that triggered an Error
          throw new Error('Error fetching posts');
     }
};
