import { setLogin } from '@/context/features/authSlice';
import { getLogin } from './EndPoints';
import { post } from './HttpRequest';
import { useDispatch } from 'react-redux';

export const loginDefault = async (
  username = '',
  password = '',
  dispatch: ReturnType<typeof useDispatch>
) => {
  try {
    const response = await post(getLogin, JSON.stringify({ username, password }));

    const valueAuth = {
      username: response.username,
      token: response.token,
    };

    if (response.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('authorization', response.token);
        sessionStorage.setItem('parameters', JSON.stringify(valueAuth));
        dispatch(setLogin(valueAuth));
      }
    }
    return true;
  } catch (e) {
    console.error('An error occurred =>' + e);
    return false;
  }
};

export const isAuthenticated = (value = '', isLocal = true) => {
  const local = typeof window !== 'undefined' ? localStorage.getItem('authorization') : value;
  const session = typeof window !== 'undefined' ? sessionStorage.getItem('parameters') : null;

  if (isLocal && local === null && session === null) {
    return false;
  }

  if (!isLocal && local === null) {
    return false;
  }

  return true;
};

export const verifyTokenUser = async (token: string) => {
  try {

    const url = `${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/verifytoken`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({ token }),
    });
    if (response.status === 401) {
      console.error('Token is invalid or expired. Logging out.');
      logout();
    } else if (!response.ok) {
      console.error('Error verifying token:', response.statusText);
      return false;
    }

    return true;
  } catch (e: unknown) {
    console.error('Error verifying token:', e);
    return false;
  }
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.clear();
    localStorage.clear();
    // Función para borrar una cookie específica
    const deleteCookie = (name: string) => {
      document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    deleteCookie('session');
    deleteCookie('authorization');
    window.location.href = '/signin';
  }
};
