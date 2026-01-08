import React, { createContext, useState, useEffect } from 'react';
import API from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await API.get('/auth/me');
                setUser(res.data);
            } catch (err) {
                // Not authenticated
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (identifier, password) => {
        const res = await API.post('/auth/login', { identifier, password });
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (userData) => {
        // userData includes username, email, password
        await API.post('/auth/register', userData);
    };

    const logout = async () => {
        try {
            await API.post('/auth/logout');
        } catch (error) {
            console.error("Logout failed", error);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin: user?.isAdmin || user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};
