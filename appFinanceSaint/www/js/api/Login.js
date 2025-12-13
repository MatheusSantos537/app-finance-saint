import { Preferences } from '@capacitor/preferences';

import { authFetch, API_URL } from "./config.js";
// Configuração

let userDt = async () => await Preferences.get({key:`userData`});

export async function getCurrentUser() {
     let raw = await userDt();
     console.log(raw);
     const parsed = JSON.parse(raw.value)
     return { ...parsed}
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
        /*
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userData', JSON.stringify(data.userData));*/
        
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
            value:JSON.stringify(data),
        });

        const saved = await Preferences.get({key:`userData`});
        console.log(`SAVED AT DEVICE: `,JSON.parse( saved.value))

        
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
// Login.js - Correção
export async function refreshAccessToken() {

    let refreshToken = await Preferences.get({key:`refreshToken`});

    // Adicionei uma validação extra aqui
    if (!refreshToken || !refreshToken.value) {
        console.log("Sem refresh token salvo");
        logout();
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/users/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refreshToken.value })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Token renovado com sucesso!');

            // CORREÇÃO: Remova a linha que atualiza o refreshToken, 
            // pois seu backend mantém o mesmo refreshToken até ele expirar (30 dias).
            
            // Apenas atualize o Access Token
            await Preferences.set({key:'accessToken', value: data.accessToken});
            
            return data.accessToken;
        } else {
            console.log(`falha ao tentar renovar token: status ${response.status}`);
            const resp = await response.json();
            console.log(`resp`, resp);
            logout();
            return null;
        }
    } catch (error) {
        console.error(`REFRESH TOKEN ERROR`, error);
        logout();
        return null;
    }
}
/**
 * Função de Logout
 */
export async function logout() {
    //localStorage.clear();
        let refreshToken = await Preferences.get({key:`refreshToken`});
        if(!refreshToken)return console.log(`token refresh null`)

    await Preferences.remove({ key: 'refreshToken' });
       await Preferences.remove({ key: 'accessToken' });
       await Preferences.remove({ key: 'userData' });
        

        try {
        const response = await fetch(`${API_URL}/users/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken:refreshToken.value })
        });

        if (response.ok) {
            const data = await response.text();
            console.log('logout!',data);
            window.location.reload();
            
            return true
        } else {
            console.log(`falha ao tentar logout token`);
            const resp = await response.json();
            console.log(`resp`,resp);
           
            return false;
        }

        
      

    } catch (error) {
        console.error(`logout TOKEN`,error)
        
        return null;
    }

    
    user = {};
    window.location.href = window.location.href; // Redireciona para login
}
 

 
export async function getLocalToken(){
    const token = await Preferences.get({key:`accessToken`});
    if(!token.value || token.value  ==`` ){
        console.log(token.value)
        return false
    }
    console.log(`token valido`,token)
    return true
}