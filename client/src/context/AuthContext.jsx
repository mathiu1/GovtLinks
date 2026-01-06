import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import API from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    setUser(decoded);
                    // Optionally fetch full user profile here
                }
            } catch (err) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const res = await API.post('/auth/login', { username, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        setUser({ ...user, ...jwtDecode(token) });
        return user;
    };

    const register = async (username, password) => {
        await API.post('/auth/register', { username, password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin: user?.isAdmin || user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};
