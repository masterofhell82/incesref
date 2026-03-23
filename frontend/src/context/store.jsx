import { configureStore } from "@reduxjs/toolkit";
import Router from 'next/router';
import authReducer from "./features/authSlice";

const redirectMiddleware = store => next => action => {
    
    if (action.type === '/signin') {
        if (action.payload.token === '') {
            Router.push('/admin/dashboard');
        }
    }
    next(action);
};

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(redirectMiddleware),
});

export default store;
