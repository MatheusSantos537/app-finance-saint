export const LoginView = `
    <main class="main-content container flex-center">
        <form id="loginForm" class="login-form">
            <h1 class="form-title">Bem-vindo(a)!</h1>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="text" id="email" class="form-input" required>
            </div>
            <div class="form-group">
                <label for="password">Senha</label>
                <input type="password" id="password" class="form-input" required>
            </div>
            <button type="submit" class="btn btn-primary">Entrar</button>
        </form>
    </main>
`;