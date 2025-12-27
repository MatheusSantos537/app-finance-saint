 
import { Preferences } from "@capacitor/preferences";
import { refreshAccessToken } from "./Login.js";
import { Loader } from "../utils/loader.js";
const load = new Loader();
export const API_URL = 'http://localhost:3000/api';
// export const API_URL = 'https://finance-saint.onrender.com/api';
/**
 * authFetch 
 * 
 */

export async function authFetch(endpoint, options = {}) {
    
    try {
        load.show();
          // 1. Configura os Headers padrão
    let token = await Preferences.get({key:'accessToken'});
    
    
    options.headers = options.headers || {};
    
    if (!options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
    }

    if (token && token.value) {
        options.headers['Authorization'] = `Bearer ${token.value}`;
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
        
    } catch (error) {
        console.error(error);
    } finally{
        load.hide();
    }
   
}
 