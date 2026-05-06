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
                            <div class="flex-between">
                                <label for="password" class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">Senha</label>
                                <a href="#" id="forgot-password-link" style="font-size: 0.7rem; color: var(--text-dim); text-decoration: none;">Esqueci minha senha</a>
                            </div>
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
                            <a href="mailto:rickcgrj@gmail.com" style="text-decoration: none; color: var(--text-dim); transition: color 0.2s;" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-dim)'">Gostaria de saber mais sobre o aplicativo?</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        const form = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');
        const forgotPasswordLink = document.getElementById('forgot-password-link');

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

        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForgotPasswordModal();
        });
    }

    showForgotPasswordModal() {
        this.app.showModal('Recuperar Senha', `
            <div id="forgot-step-1">
                <p class="text-dim mb-6" style="font-size: 0.875rem;">Informe seus dados para validar sua identidade:</p>
                <div class="form-group">
                    <label>CPF</label>
                    <input type="text" id="forgot-cpf" class="input" placeholder="000.000.000-00">
                </div>
                <div class="form-group mt-4">
                    <label>Data de Nascimento</label>
                    <input type="date" id="forgot-birth" class="input">
                </div>
                <div class="flex-between mt-8">
                    <button class="btn btn-outline" onclick="window.App.closeModal()">Cancelar</button>
                    <button class="btn btn-primary" id="btn-validate-identity">Validar Dados</button>
                </div>
            </div>
            <div id="forgot-step-2" style="display: none;">
                <p class="text-dim mb-6" style="font-size: 0.875rem;">Dados validados! Agora defina sua nova senha:</p>
                <div class="form-group">
                    <label>Nova Senha</label>
                    <input type="password" id="new-password" class="input" placeholder="••••••••">
                </div>
                <div class="form-group mt-4">
                    <label>Confirmar Nova Senha</label>
                    <input type="password" id="confirm-password" class="input" placeholder="••••••••">
                </div>
                <div class="flex-between mt-8">
                    <button class="btn btn-outline" onclick="window.App.closeModal()">Cancelar</button>
                    <button class="btn btn-primary" id="btn-reset-password">Atualizar Senha</button>
                </div>
            </div>
        `);

        let validatedUserId = null;

        document.getElementById('btn-validate-identity').onclick = async (e) => {
            const cpf = document.getElementById('forgot-cpf').value;
            const birthDate = document.getElementById('forgot-birth').value;
            const btn = e.currentTarget;

            if (!cpf || !birthDate) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            btn.disabled = true;
            btn.innerText = 'Validando...';

            // Busca na tabela profiles
            const { data, error } = await this.app.auth.client
                .from('profiles')
                .select('id')
                .eq('cpf', cpf)
                .eq('birth_date', birthDate)
                .single();

            if (error || !data) {
                alert('Dados não encontrados. Verifique seu CPF e data de nascimento.');
                btn.disabled = false;
                btn.innerText = 'Validar Dados';
            } else {
                validatedUserId = data.id;
                document.getElementById('forgot-step-1').style.display = 'none';
                document.getElementById('forgot-step-2').style.display = 'block';
            }
        };

        document.getElementById('btn-reset-password').onclick = async (e) => {
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const btn = e.currentTarget;

            if (newPassword.length < 6) {
                alert('A senha deve ter pelo menos 6 caracteres.');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }

            btn.disabled = true;
            btn.innerText = 'Atualizando...';

            // Aqui chamamos a RPC ou o método de atualização
            // Como estamos no frontend e deslogados, precisamos de uma RPC com Security Definer
            const { data, error } = await this.app.auth.client.rpc('reset_password_admin', {
                p_user_id: validatedUserId,
                p_new_password: newPassword
            });

            if (error) {
                console.error('Erro ao resetar senha:', error);
                alert('Erro ao atualizar senha: ' + error.message);
                btn.disabled = false;
                btn.innerText = 'Atualizar Senha';
            } else {
                alert('Senha atualizada com sucesso! Você já pode fazer login.');
                this.app.closeModal();
            }
        };
    }
}
