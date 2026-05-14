export class RegisterPage {
    constructor(app) {
        this.app = app;
    }

    async render() {
        const t = (key) => this.app.i18n.t(key);
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div style="margin-bottom: 2.5rem; text-align: center;">
                        <h1 class="font-heading" style="font-size: 1.5rem; letter-spacing: 0.2em; font-weight: 800;">${t('register_title')}</h1>
                        <p class="text-graphite" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; margin-top: 0.25rem;">${t('register_subtitle')}</p>
                    </div>

                    <div style="position: absolute; top: 1.5rem; right: 1.5rem; z-index: 100;">
                        ${this.app.renderLanguageAndThemeControls()}
                    </div>

                    <form id="register-form">
                        <div class="mb-4">
                            <label class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">${t('full_name')}</label>
                            <input type="text" id="full-name" class="input" placeholder="${t('name_placeholder')}" required>
                        </div>

                        <div class="mb-4">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                                <label class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">E-mail</label>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="checkbox" id="no-email" style="width: 14px; height: 14px; accent-color: var(--primary);">
                                    <label for="no-email" style="font-size: 0.65rem; color: var(--text-dim); cursor: pointer;">${t('no_email')}</label>
                                </div>
                            </div>
                            <input type="email" id="email" class="input" placeholder="${t('email_placeholder')}" required>
                        </div>

                        <div class="grid grid-cols-2" style="gap: 1rem;">
                            <div class="mb-4">
                                <label class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">${t('cpf_label_required')}</label>
                                <input type="text" id="cpf" class="input" placeholder="000.000.000-00" required>
                            </div>
                            <div class="mb-4">
                                <label class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">${t('phone')}</label>
                                <input type="tel" id="phone" class="input" placeholder="${t('phone_placeholder')}" required>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">${t('birth_date_label')}</label>
                            <input type="date" id="birth-date" class="input" required>
                        </div>

                        <div id="responsible-field" class="mb-4" style="display: none;">
                            <label class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">${t('responsible_name_label')}</label>
                            <input type="text" id="responsible-name" class="input" placeholder="${t('responsible_name_placeholder')}">
                        </div>

                        <div class="mb-4">
                            <label class="font-heading" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); letter-spacing: 0.05em;">${t('password')}</label>
                            <input type="password" id="password" class="input" placeholder="••••••••" required>
                        </div>

                        <button type="submit" class="btn btn-primary btn-full mt-4" id="register-btn">
                            ${t('register_btn')}
                        </button>
                    </form>

                    <p style="text-align: center; margin-top: 2rem; font-size: 0.875rem; color: var(--text-secondary);">
                        ${t('has_account')} <a href="#login" style="color: var(--text-primary); font-weight: 600; text-decoration: none;">${t('login_link')}</a>
                    </p>
                </div>
            </div>
        `;
    }

    afterRender() {
        const t = (key) => this.app.i18n.t(key);
        const form = document.getElementById('register-form');
        const registerBtn = document.getElementById('register-btn');
        const noEmailCheck = document.getElementById('no-email');
        const emailInput = document.getElementById('email');
        const themeToggle = document.getElementById('theme-toggle-global');

        if (window.lucide) window.lucide.createIcons();

        if (themeToggle) {
            themeToggle.onclick = () => {
                this.app.toggleTheme();
                this.app.router.handleRouteChange(window.location.hash);
            };
        }

        if (noEmailCheck && emailInput) {
            noEmailCheck.addEventListener('change', (e) => {
                if (e.target.checked) {
                    emailInput.value = '';
                    emailInput.required = false;
                    emailInput.disabled = true;
                    emailInput.placeholder = t('internal_email_notice');
                } else {
                    emailInput.required = true;
                    emailInput.disabled = false;
                    emailInput.placeholder = t('email_placeholder');
                }
            });
        }

        // --- Menor de Idade ---
        const birthDateInput = document.getElementById('birth-date');
        const responsibleField = document.getElementById('responsible-field');
        const responsibleNameInput = document.getElementById('responsible-name');

        const checkMinor = (birthDate) => {
            if (!birthDate) {
                if (responsibleField) responsibleField.style.display = 'none';
                return;
            }
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            if (age < 18) {
                if (responsibleField) responsibleField.style.display = 'block';
            } else {
                if (responsibleField) responsibleField.style.display = 'none';
                if (responsibleNameInput) responsibleNameInput.value = '';
            }
        };

        if (birthDateInput) {
            birthDateInput.addEventListener('change', (e) => checkMinor(e.target.value));
        }

        // --- Verificar Duplicados ---
        const checkDuplicates = async (cpf, email) => {
            const cleanCpf = cpf.replace(/\D/g, '');
            const client = window.supabase;

            const { data: existingCpf, error: cpfError } = await client
                .from('profiles')
                .select('id')
                .eq('cpf', cleanCpf)
                .maybeSingle();

            if (existingCpf) {
                return { duplicate: true, field: 'cpf' };
            }

            if (email && !email.includes('@ossbjj.com.br')) {
                const { data: existingEmail, error: emailError } = await client
                    .from('profiles')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();

                if (existingEmail) {
                    return { duplicate: true, field: 'email' };
                }
            }

            return { duplicate: false };
        };

        // --- CPF Utilities ---
        const maskCPF = (value) => {
            return value
                .replace(/\D/g, '')
                .slice(0, 11)
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        };

        const validateCPF = (cpf) => {
            cpf = cpf.replace(/[^\d]/g, '');
            if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
            for (let t = 9; t < 11; t++) {
                let d = 0;
                for (let i = 0; i < t; i++) {
                    d += cpf[i] * ((t + 1) - i);
                }
                d = ((10 * d) % 11) % 10;
                if (parseInt(cpf[t]) !== d) return false;
            }
            return true;
        };

        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.maxLength = 14;
            cpfInput.addEventListener('input', (e) => {
                e.target.value = maskCPF(e.target.value);
            });
            cpfInput.addEventListener('blur', (e) => {
                const val = e.target.value;
                if (val && !validateCPF(val)) {
                    cpfInput.style.borderColor = 'var(--error, #ef4444)';
                    cpfInput.setCustomValidity('CPF inválido');
                    cpfInput.reportValidity();
                } else {
                    cpfInput.style.borderColor = '';
                    cpfInput.setCustomValidity('');
                }
            });
        }
        // --- Fim CPF ---

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const cpfVal = document.getElementById('cpf').value;
                if (!validateCPF(cpfVal)) {
                    alert('CPF inválido! Por favor, verifique o número digitado.');
                    document.getElementById('cpf').focus();
                    return;
                }

                const fullName = document.getElementById('full-name').value;
                let email = document.getElementById('email').value;
                const cpf = cpfVal;
                const phone = document.getElementById('phone').value;
                const birthDate = document.getElementById('birth-date').value;
                const password = document.getElementById('password').value;
                const responsibleName = document.getElementById('responsible-name')?.value || null;

                const dupCheck = await checkDuplicates(cpf, email);
                if (dupCheck.duplicate) {
                    if (dupCheck.field === 'cpf') {
                        alert('CPF já cadastrado no sistema. Não é possível criar uma nova conta com este CPF.');
                    } else {
                        alert('E-mail já cadastrado no sistema. Por favor, utilize outro e-mail ou faça login.');
                    }
                    registerBtn.disabled = false;
                    registerBtn.innerText = 'Cadastrar';
                    return;
                }

                if (noEmailCheck.checked) {
                    // Gera um e-mail dummy baseado no CPF (limpo de pontos e traços)
                    const cleanCpf = cpf.replace(/\D/g, '');
                    email = `${cleanCpf}@ossbjj.com.br`;
                } else if (!email) {
                    alert('Por favor, informe seu e-mail ou marque que não possui.');
                    return;
                }

                registerBtn.disabled = true;
                registerBtn.innerText = 'Processando...';

                // Fetch the default academy (single academy architecture)
                // We use a more direct approach to ensure we get the ID even with RLS
                const { data: academies, error: acadError } = await this.app.academy.getAcademies();
                
                console.log("📝 Register: Buscando academia...", { academies, acadError });
                
                let academyId = (academies && academies.length > 0) ? academies[0].id : null;

                // Fallback: If list is empty but we have a known primary (common in single-tenant)
                if (!academyId) {
                    console.warn("⚠️ Lista de academias vazia. Verifique RLS ou dados iniciais.");
                    alert('Erro ao identificar a academia. Por favor, entre em contato com o suporte ou tente novamente em instantes.');
                    registerBtn.disabled = false;
                    registerBtn.innerText = 'Cadastrar';
                    return;
                }

                const result = await this.app.auth.signUp(email, password, fullName, academyId, { 
                    cpf, 
                    phone,
                    birth_date: birthDate,
                    current_belt: 'white belt',
                    current_stripes: 0,
                    responsible_name: responsibleName
                });

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
