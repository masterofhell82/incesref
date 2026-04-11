'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { notification, Form, Input, Button, message } from 'antd';
import { getLogin } from '@/Services/EndPoints';
import { post } from '@/Services/HttpRequest';
import bg165944 from '@/app/assets/imgs/165944.jpg';
import bg165796 from '@/app/assets/imgs/165796.jpg';
import bg165859 from '@/app/assets/imgs/165859.jpg';

//Redux
import { useDispatch } from 'react-redux';
import { setLogin } from '@/context/features/authSlice';

import { AiOutlineUser } from 'react-icons/ai';

import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';

const listBg = [
  bg165944.src,
  bg165796.src,
  bg165859.src,
];

const SignInForm = () => {
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const [background, setBackground] = useState(listBg[0]);

  useEffect(() => {
    setBackground(listBg[Math.floor(Math.random() * listBg.length)]);
  }, []);

  const handleLogin = async (values: { username: string; password: string }) => {
    const { username, password } = values;

    try {
      if (username !== '' || password !== '') {
        const response = await post(getLogin, JSON.stringify({ username, password }));

        const { created_at, updated_at, ...personRest } = response.person; // eslint-disable-line @typescript-eslint/no-unused-vars

        const valueAuth = {
          username: response.username,
          token: response.token,
          person: personRest,
          rol: response.rol,
        };

        const cookieString = `session=${response.token}; path=/; max-age=${180 * 60}`;
        const auth = `authorization=${response.token.split(' ')[1]};`;

        // Establece la cookie en el lado del cliente
        document.cookie = cookieString;
        document.cookie = auth;

        if (typeof window !== 'undefined') {
          localStorage.setItem('authorization', response.token);
          sessionStorage.setItem('parameters', JSON.stringify(valueAuth));
          // Redirige al usuario al dashboard
          window.location.href = '/admin';
          //dispatch(setLayout(valueLayout));
          dispatch(setLogin(valueAuth));
        }
      } else {
        message.error('Please fill in all fields.');
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null) {
        const err = error as { status?: number; response?: { status?: number } };
        if (err.status === 401 || err.response?.status === 401) {
          message.error('Usuario o contraseña inválidos.');
          return;
        }
      }
      message.error('Ocurrió un error inesperado.');
    }
  };

  const handleLoginFailed = (errorInfo: unknown) => {
    console.error('Login failed:', errorInfo);
    api.error({
      message: 'Error',
      description: 'Please fill in all fields.',
    });
    return false;
  };

  return (
    <>
      {contextHolder}
      <div
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
        }}
      />
      <div className="3xl:w-1/4 3xl:p-14 mx-auto mt-40 flex w-full sm:w-[450px]  flex-col rounded-2xl bg-[#ffffffee] p-8 shadow-xl md:w-1/2 md:p-10 xl:w-2/6 2xl:w-[450px] 2xl:p-12">
        <div className="flex flex-row gap-3 pb-4">
          <div>
            <Image src="/images/logo/logo3.svg" alt="Logo" width={150} height={0} />
          </div>
          <div className="mt-2 flex flex-col justify-center align-middle">
            <h1 className="text-2xl font-light text-gray-900">Iniciar sesión</h1>
            <p className="text-sm text-gray-500">Bienvenido de nuevo</p>
          </div>
        </div>
        <Form
          size="large"
          style={{ maxWidth: 600 }}
          layout="vertical"
          autoComplete="off"
          onFinish={handleLogin}
          onFinishFailed={handleLoginFailed}
        >
          <Form.Item
            name="username"
            label="Usuario"
            rules={[{ required: true }]}
            className="mb-2 block text-sm font-medium text-[#111827]"
          >
            <Input suffix={<AiOutlineUser />} />
          </Form.Item>
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true }]}
            className="mb-2 block pb-6 text-sm font-medium text-[#111827]"
          >
            <Input.Password
              name="password"
              placeholder="••••••••••"
              autoComplete="new-password"
              iconRender={(visible) => (visible ? <FaRegEye /> : <FaRegEyeSlash />)}
              className="w-full"
            />
          </Form.Item>
          <Form.Item label={null} className="w-full">
            <Button htmlType="submit" color="cyan" variant="solid" className="btn-primary w-full">
              Login
            </Button>
          </Form.Item>
        </Form>
        <div className="relative flex items-center py-8">
          <div className="grow border-[1px] border-t border-gray-200"></div>
          <div className="grow border-[1px] border-t border-gray-200"></div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
