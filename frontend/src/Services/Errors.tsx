import axios from 'axios';
import { logout } from './Authentications';

export const handleError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
      Unauthorized();
    }
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw error.response.data.error || 'Recurso no encontrado';
    }
    return error;
};

export const Unauthorized = () => {
  logout();
};
