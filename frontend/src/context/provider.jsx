'use client';

import { useEffect } from 'react';
import { Provider } from "react-redux";
import store from "./store";
import { setLogin } from './features/authSlice';

export const Providers = ({ children }) => {
    useEffect(() => {
        const session = sessionStorage.getItem('parameters');

        if (!session) {
            return;
        }

        try {
            store.dispatch(setLogin(JSON.parse(session)));
        } catch {
            sessionStorage.removeItem('parameters');
        }
    }, []);

    return <Provider store={store}>{children}</Provider>;
};
