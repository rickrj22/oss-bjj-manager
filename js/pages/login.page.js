export class LoginPage {
    constructor(app) {
        this.app = app;
    }

    async render() {
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div style="margin-bottom: 3rem;">
                        <h1 class="font-heading" style="font-size: 1.5rem; letter-spacing: 0.2em; font-weight: 800; margin-bottom: 0.5rem;">OSS</h1>
                        <p class="text-graphite" style="font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;">Academy Management</p>
                    </div>

                    <form id="login-form">
                        <div class="form-group">
                            <label for="email" class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">E-mail</label>
                            <input type="email" id="email" class="input" placeholder="seu@email.com" required>
                        </div>
                        <div class="form-group" style="margin-top: 1.5rem;">
                            <label for="password" class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">Senha</label>
                            <input type="password" id="password" class="input" placeholder="••••••••" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-full mt-8" id="login-btn">
                            Entrar no Tatame
                        </button>
                    </form>

                    <p style="text-align: center; margin-top: 2rem; font-size: 0.875rem; color: var(--text-secondary);">
                        Ainda não tem conta? <a href="#register" style="color: var(--text-primary); font-weight: 600; text-decoration: none;">Cadastrar-se</a>
                    </p>

                    <div style="margin-top: 3rem; text-align: center;">
                        <p class="text-dim" style="font-size: 0.75rem;">
                            Problemas no acesso? <a href="#" style="text-decoration: underline; color: var(--text-primary);">Suporte</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        const form = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            loginBtn.disabled = true;
            loginBtn.innerText = 'Autenticando...';

            const result = await this.app.auth.login(email, password);
            if (result.success) {
                window.location.hash = '#dashboard';
            } else {
                alert('Erro na autenticação: ' + result.error);
                loginBtn.disabled = false;
                loginBtn.innerText = 'Entrar no Tatame';
            }
        });
    }
}
