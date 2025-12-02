import { Preferences } from '@capacitor/preferences';

import { authFetch, API_URL } from "./config.js";
// Configuração

let user = {};

export function getCurrentUser() {
    return user;
}
 
/**
 * Função para fazer Login e salvar os tokens
 */
export async function login(email, senha) {
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao fazer login');
        }

        //  SALVAR NO LOCAL STORAGE
        
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userData', JSON.stringify(data.userData));
        Preferences.set({
            key:'accessToken',
            value:data.accessToken,
        });
        Preferences.set({
            key:'refreshToken',
            value:data.refreshToken,
        });
        Preferences.set({
            key:'userData',
            value:JSON.stringify(data.userData),
        });

        user = {...data};
        console.log(data,`USER`)

        return data;

    } catch (error) {
        console.error('Erro no login:', error);
        throw error;
    }
}

/**
 * Função interna para tentar renovar o token
 */
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) return null;

    try {
        const response = await fetch(`${API_URL}/users/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Token renovado com sucesso!');
            localStorage.setItem('accessToken', data.accessToken);
            return data.accessToken;
        } else {
            // Se o refresh falhar (  passou de 30 dias), faz logout
            logout();
            return null;
        }
    } catch (error) {
        logout();
        return null;
    }
}

/**
 * Função de Logout
 */
export function logout() {
    localStorage.clear();
    user = {};
    window.location.href = window.location.href; // Redireciona para login
}
 

 
document.addEventListener(`DOMContentLoaded`, async()=>{
//let dt = await login({email:"teste@gmail.com",password:"56498&$&#@ac"});
//console.dir(dt);
});     