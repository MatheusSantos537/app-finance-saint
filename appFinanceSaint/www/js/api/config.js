 
import { refreshAccessToken } from "./Login.js";

export const API_URL = 'http://localhost:3000/api';
/**
 * authFetch 
 * 
 */

export async function authFetch(endpoint, options = {}) {
    // 1. Configura os Headers padrão
    let token = localStorage.getItem('accessToken');
    
    
    options.headers = options.headers || {};
    
    if (!options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
    }

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;

   
    let response = await fetch(url, options);

    if (response.status === 401) {
        console.log('Token expirou. Tentando renovar...');

        const newToken = await refreshAccessToken();

        // Se renovou, tenta a requisição original de novo
        if (newToken) {
            options.headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, options);
        } else {
            throw new Error('Sessão expirada. Faça login novamente.');
        }
    }

    return response;
}
 