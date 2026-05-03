export class RegisterPage {
    constructor(app) {
        this.app = app;
    }

    async render() {
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div style="margin-bottom: 2.5rem; text-align: center;">
                        <h1 class="font-heading" style="font-size: 1.5rem; letter-spacing: 0.2em; font-weight: 800;">OSS</h1>
                        <p class="text-graphite" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; margin-top: 0.25rem;">Junte-se ao Tatame</p>
                    </div>

                    <form id="register-form">
                        <div class="mb-4">
                            <label class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">Nome Completo</label>
                            <input type="text" id="full-name" class="input" placeholder="Seu nome" required>
                        </div>

                        <div class="mb-4">
                            <label class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">E-mail</label>
                            <input type="email" id="email" class="input" placeholder="exemplo@email.com" required>
                        </div>

                        <div class="mb-4">
                            <label class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">Senha</label>
                            <input type="password" id="password" class="input" placeholder="••••••••" required>
                        </div>

                        <button type="submit" class="btn btn-primary btn-full mt-4" id="register-btn">
                            Cadastrar
                        </button>
                    </form>

                    <p style="text-align: center; margin-top: 2rem; font-size: 0.875rem; color: var(--text-secondary);">
                        Já tem uma conta? <a href="#login" style="color: var(--text-primary); font-weight: 600; text-decoration: none;">Entrar</a>
                    </p>
                </div>
            </div>
        `;
    }

    afterRender() {
        const form = document.getElementById('register-form');
        const registerBtn = document.getElementById('register-btn');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const fullName = document.getElementById('full-name').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                registerBtn.disabled = true;
                registerBtn.innerText = 'Processando...';

                // Fetch the default academy (single academy architecture)
                const { data: academies } = await this.app.academy.getAcademies();
                const academyId = (academies && academies.length > 0) ? academies[0].id : null;

                if (!academyId) {
                    alert('Erro: Nenhuma academia configurada no sistema.');
                    registerBtn.disabled = false;
                    registerBtn.innerText = 'Cadastrar';
                    return;
                }

                const result = await this.app.auth.signUp(email, password, fullName, academyId);

                if (result.success) {
                    alert('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
                    window.location.hash = '#login';
                } else {
                    alert('Erro ao cadastrar: ' + result.error);
                    registerBtn.disabled = false;
                    registerBtn.innerText = 'Cadastrar';
                }
            });
        }
    }
}
