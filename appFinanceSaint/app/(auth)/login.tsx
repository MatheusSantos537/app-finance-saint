import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

// 1. Componente Funcional (O Padrão de Mercado)
const LoginScreen = () => {
    
    // 2. Gerenciamento de Estado (useState Hook)
    // O Hook useState permite criar variáveis que, ao serem alteradas, 
    // forçam a tela a ser atualizada (re-renderizada).
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 3. Função de Login (Event Handling)
    const handleLogin = () => {
        // --- LÓGICA DE NEGÓCIO SIMPLES (Exemplo) ---
        if (email.length > 5 && password.length >= 6) {
            // Em um app real, aqui você faria a chamada a uma API
            Alert.alert('Sucesso', `Bem-vindo, ${email}!`);
            // E faria a navegação para a tela principal...
        } else {
            Alert.alert('Erro', 'Verifique seu e-mail e senha.');
        }
    };

    return (
        // O View principal utiliza o estilo 'container'
        <View style={styles.container}>
            <Text style={styles.title}>Acesse sua conta</Text>

            {/* Campo de E-mail */}
            <TextInput
                style={styles.input}
                placeholder="E-mail"
                keyboardType="email-address" // Teclado otimizado
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail} // Funções de atualização simples
            />

            {/* Campo de Senha */}
            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry={true} // Oculta a senha
                value={password}
                onChangeText={setPassword}
            />

            {/* Botão de Login (TouchableOpacity: Customizável e Profissional) */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>ENTRAR</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                 <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
            </TouchableOpacity>
        </View>
    );
};

// 4. Folha de Estilos (StyleSheet)
const styles = StyleSheet.create({
    container: {
        flex: 1, // Garante que ocupe a tela inteira
        justifyContent: 'center', // Centraliza itens na vertical
        alignItems: 'center', // Centraliza itens na horizontal
        backgroundColor: '#f0f4f7', // Fundo claro
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700', // Bold
        marginBottom: 40,
        color: '#1a1a1a',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#dcdcdc',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#007aff', // Cor primária (azul iOS/padrão)
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 25,
        // Propriedade para sombra no Android (profissional)
        elevation: 5, 
        // Propriedades para sombra no iOS (profissional)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        color: '#007aff',
        fontSize: 14,
        fontWeight: '500',
    }
});

export default LoginScreen;