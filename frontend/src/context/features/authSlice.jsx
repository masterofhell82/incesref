import UserInfoCard from '@/components/user-profile/UserInfoCard';
import { createSlice } from '@reduxjs/toolkit';

const initialUser = {
    userId: null,
    username: '',
    token: '',
    person: {},
    rol: '',
};

export const authSlice = createSlice({
    name: 'Auth',
    initialState: initialUser,
    reducers: {
        setLogin: (state, action) => {
            state.userId = action.payload.userId;
            state.username = action.payload.username;
            state.token = action.payload.token;
            state.person = action.payload.person;
            state.rol = action.payload.rol || ''; // Ensure rol is set, defaulting to an empty string if not provided
        },
        setLogout: (state) => {
            state.userId = null;
            state.username = '';
            state.token = '';
            state.person = {};
            state.rol = '';
        }
    }
});

export const { setLogin, setLogout } = authSlice.actions;

export default authSlice.reducer;
