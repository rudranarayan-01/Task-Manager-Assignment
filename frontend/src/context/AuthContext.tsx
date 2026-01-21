"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AuthContextType {
    user: any | null;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = getCookie('accessToken');
        if (token) {
            // In a real app, you might call /auth/me here to get user details
            setUser({ loggedIn: true });
        }
        setIsLoading(false);
    }, []);

    const login = (accessToken: string, refreshToken: string) => {
        setCookie('accessToken', accessToken, { maxAge: 60 * 15 }); // 15 mins
        setCookie('refreshToken', refreshToken, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
        setUser({ loggedIn: true });
        router.push('/dashboard');
    };

    const logout = () => {
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};