export class ProfilePage {
    constructor(app) {
        this.app = app;
    }

    async render() {
        const user = await this.app.auth.getUser();
        const theme = this.app.currentTheme;
        const canEditGraduation = user.is_admin || user.role === 'professor';

        let linkedAcademies = [];
        const { data: uaData } = await this.app.academy.client
            .from('user_academies')
            .select('academies(name)')
            .eq('user_id', user.id);
            
        if (uaData && uaData.length > 0) {
            linkedAcademies = uaData.map(ua => ua.academies.name);
        } else if (user.academy_id) {
            const { data } = await this.app.academy.client.from('academies').select('name').eq('id', user.academy_id).single();
            if (data) linkedAcademies = [data.name];
        }

        if (linkedAcademies.length === 0) {
            linkedAcademies = ['Sem academia vinculada'];
        }

        const history = await this.app.academy.getGraduationHistory(user.id);

        const allBelts = [
            'white belt',
            'grey white belt', 'grey belt', 'grey black belt',
            'yellow white belt', 'yellow belt', 'yellow black belt',
            'orange white belt', 'orange belt', 'orange black belt',
            'green white belt', 'green belt', 'green black belt',
            'blue belt', 'purple belt', 'brown belt', 'black belt'
        ];

        return `
            <div class="layout-container">
                <aside class="sidebar" style="padding-top: 2rem;">
                    <div class="mb-12" style="display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 0 1rem; text-align: center;">
                        <div id="sidebar-logo-container" style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.3); border: 3px solid var(--border); position: relative;">
                            ${user.academy?.logo_url ? `
                                <img src="${user.academy.logo_url}" 
                                     style="width: 100%; height: 100%; object-fit: contain;" 
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; background: var(--inverse-bg);">
                                    <i data-lucide="image" style="color: var(--text-dim); opacity: 0.5;"></i>
                                </div>
                            ` : `
                                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--inverse-bg);">
                                    <i data-lucide="shield" style="color: var(--primary);"></i>
                                </div>
                            `}
                        </div>
                        <h2 class="font-heading" style="font-size: 1rem; letter-spacing: 0.1em; color: var(--text-primary); text-transform: uppercase;">${user.academy?.name || 'Academia Edson França'}</h2>
                    </div>

                    <nav class="nav-list" style="flex: 1;">
                        ${user.is_admin ? `
                            <a href="#dashboard" class="nav-item animate-in stagger-1">
                                <i data-lucide="layout-dashboard" size="18"></i> 
                                <span>Dashboard</span>
                            </a>
                        ` : ''}
                        ${user.role === 'professor' || user.is_admin ? `
                            <a href="#membros" class="nav-item animate-in stagger-2">
                                <i data-lucide="users" size="18"></i> 
                                <span>Membros</span>
                            </a>
                        ` : ''}
                        <a href="#aulas" class="nav-item animate-in stagger-3">
                            <i data-lucide="calendar" size="18"></i> 
                            <span>Minhas Aulas</span>
                        </a>
                        ${user.is_admin ? `
                            <a href="#financeiro" class="nav-item animate-in stagger-1">
                                <i data-lucide="dollar-sign" size="18"></i> 
                                <span>Financeiro</span>
                            </a>
                            <a href="#configuracoes" class="nav-item animate-in stagger-2">
                                <i data-lucide="settings" size="18"></i> 
                                <span>Configurações</span>
                            </a>
                        ` : ''}
                        <a href="#perfil" class="nav-item active animate-in stagger-3">
                            <i data-lucide="user" size="18"></i> 
                            <span>Perfil</span>
                        </a>
                    </nav>

                    <div id="theme-toggle" class="theme-toggle">
                        <i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}"></i>
                        <span>${theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                    </div>

                    <div style="border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding: 0 0.5rem;">
                             ${this.renderAvatarWithStripes(user, 42)}
                            <div>
                                <p style="font-size: 0.8125rem; font-weight: 600;">${user.full_name}</p>
                                <p style="font-size: 0.6875rem; color: var(--text-dim); text-transform: uppercase;">${user.role}</p>
                            </div>
                        </div>
                        <button id="logout-btn" class="btn-secondary btn-full" style="height: 42px; gap: 0.75rem;">
                            <i data-lucide="log-out" size="18"></i> 
                            <span>Sair</span>
                        </button>
                    </div>
                </aside>

                <style>
                    .editable-field {
                        background: var(--bg-surface) !important;
                        border: 1px solid var(--border) !important;
                        border-radius: 6px !important;
                        transition: all 0.2s;
                        color: var(--text-primary) !important;
                    }
                    .editable-field:focus {
                        border-color: var(--primary) !important;
                        box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
                    }
                    .readonly-field {
                        background: var(--bg-elevated) !important;
                        border: 1px solid transparent !important;
                        color: var(--text-dim) !important;
                        cursor: not-allowed !important;
                        border-radius: 6px !important;
                    }
                </styl                <main class="main-content" style="padding: 2rem;">
                    <div class="grid" style="grid-template-columns: var(--grid-main, 1.8fr 1fr); gap: 2rem; max-width: 1200px; margin: 0 auto;">
                        
                        <!-- Coluna Esquerda: Formulários e Timeline -->
                        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                            
                            <!-- Identidade e Contato -->
                            <div>
                                <h3 class="font-heading mb-3" style="font-size: 1.15rem;">Identidade e Contato</h3>
                                <form id="profile-form">
                                    <div class="grid grid-cols-2" style="gap: 0.75rem 1rem;">
                                        <div class="form-group" style="grid-column: span 2;">
                                            <label style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--text-dim); margin-bottom: 0.25rem; display: block;">Nome Completo</label>
                                            <input type="text" class="input editable-field" id="prof-name" value="${user.full_name || ''}" style="height: 42px; font-size: 0.85rem;">
                                        </div>
                                        <div class="form-group" style="grid-column: span var(--span-all, 1);">
                                            <label style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--text-dim); margin-bottom: 0.25rem; display: block;">E-mail (Login Oficial)</label>
                                            <input type="email" class="input editable-field" id="prof-email" value="${user.email || ''}" style="height: 42px; font-size: 0.85rem;">
                                        </div>
                                        <div class="form-group" style="grid-column: span var(--span-all, 1);">
                                            <label style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--text-dim); margin-bottom: 0.25rem; display: block;">Telefone</label>
                                            <input type="tel" class="input editable-field" id="prof-phone" value="${user.phone || ''}" style="height: 42px; font-size: 0.85rem;">
                                        </div>
                                        <div class="form-group" style="grid-column: span var(--span-all, 1);">
                                            <label style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--text-dim); margin-bottom: 0.25rem; display: block;">Data de Nascimento</label>
                                            <input type="date" class="input editable-field" id="prof-birth" value="${user.birth_date || ''}" style="height: 42px; font-size: 0.85rem;">
                                        </div>
                                        <div class="form-group" style="grid-column: span var(--span-all, 1);">
                                            <label style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--text-dim); margin-bottom: 0.25rem; display: block;">URL da Foto de Perfil</label>
                                            <input type="text" class="input editable-field" id="prof-avatar" value="${user.avatar_url || ''}" style="height: 42px; font-size: 0.85rem;">
                                        </div>
                                        <div class="form-group" style="grid-column: span var(--span-all, 1);">
                                            <label style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--text-dim); margin-bottom: 0.25rem; display: block;">Dia de Vencimento</label>
                                            <input type="text" class="input readonly-field" value="${user.payment_due_date ? 'Dia ' + user.payment_due_date : 'Não definido'}" readonly style="height: 42px; font-size: 0.85rem;">
                                        </div>
                                    </div>
                                    <div class="mt-3">
                                        <button type="submit" id="btn-save-profile" class="btn" style="background: black; color: white; border-radius: 4px; padding: 0.6rem 1.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border: none; display: none;">
                                            Salvar Alterações
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <!-- Graduação Oficial -->
                            <div>
                                <h3 class="font-heading mb-3" style="font-size: 1.15rem;">Graduação Oficial</h3>
                                <form id="graduation-form">
                                    <div class="grid grid-cols-2" style="gap: 0.75rem 1rem;">
                                        <div class="form-group" style="grid-column: span 2;">
                                            <label style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--text-dim); margin-bottom: 0.25rem; display: block;">Cor da Faixa</label>
                                            <select class="input ${canEditGraduation ? 'editable-field' : 'readonly-field'}" id="prof-belt" ${!canEditGraduation ? 'disabled' : ''} style="height: 42px; font-size: 0.85rem; padding: 0 1rem;">
                                                ${allBelts.map(b => `<option value="${b}" ${user.current_belt === b ? 'selected' : ''}>${b.toUpperCase()}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div class="form-group" style="grid-column: span 2;">
                                            <label style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--text-dim); margin-bottom: 0.25rem; display: block;">Graus Atuais</label>
                                            <select class="input ${canEditGraduation ? 'editable-field' : 'readonly-field'}" id="prof-stripes" ${!canEditGraduation ? 'disabled' : ''} style="height: 42px; font-size: 0.85rem; padding: 0 1rem;">
                                                ${[0, 1, 2, 3, 4].map(s => `<option value="${s}" ${user.current_stripes == s ? 'selected' : ''}>${s}º GRAU</option>`).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    ${canEditGraduation ? `
                                        <div class="mt-4">
                                            <button type="submit" class="btn" style="background: black; color: white; border-radius: 4px; padding: 0.6rem 1.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; border: none;">
                                                Confirmar Graduação
                                            </button>
                                        </div>
                                    ` : ''}
                                </form>
                            </div>

                            <!-- Timeline -->
                            <div style="margin-top: 0.5rem;">
                                <h4 class="font-heading mb-4" style="font-size: 0.85rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em;">Histórico (Timeline)</h4>
                                ${history.length === 0 ? '<p class="text-dim" style="font-size: 0.85rem; font-style: italic;">Nenhum histórico de graduação registrado no sistema.</p>' : `
                                    <div style="display: flex; flex-direction: column; gap: 1rem; padding-left: 1.5rem; border-left: 2px solid var(--border);">
                                        ${history.map(log => `
                                            <div style="position: relative;">
                                                <div style="position: absolute; left: -1.8rem; top: 0.2rem; width: 10px; height: 10px; border-radius: 50%; background: var(--text-primary);"></div>
                                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                                    <div>
                                                        <p style="font-weight: 700; font-size: 0.85rem;">${(log.belt || '').toUpperCase()} • ${log.stripes}º Grau</p>
                                                        <p class="text-dim" style="font-size: 0.75rem;">Por ${log.professor?.full_name || '---'}</p>
                                                    </div>
                                                    <span class="text-dim" style="font-size: 0.75rem; font-family: monospace;">${new Date(log.promoted_at).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                `}
                            </div>
                        </div>

                        <!-- Coluna Direita: Card Profile -->
                        <div style="display: flex; flex-direction: column; gap: 2rem;">
                            
                            <div class="card" style="text-align: center; padding: 2.5rem 1.5rem; border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                                <div style="display: flex; justify-content: center; margin-bottom: 1.5rem;">
                                     ${this.renderAvatarWithStripes(user, 120)}
                                </div>
                                <h2 class="font-heading" style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem;">${user.full_name}</h2>
                                <p class="text-dim mb-4" style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;">${user.role}</p>
                                
                                <p class="font-heading" style="font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800;">${user.current_belt || 'white belt'}</p>
                                <p class="text-dim" style="font-size: 0.75rem;">${user.current_stripes || 0}º Grau Confirmado</p>
                            </div>


                        </div>
                    </div>
                </main>

                <!-- Bottom Navigation (Mobile Only) -->
                <nav class="bottom-nav">
                    ${user.is_admin ? `
                        <a href="#dashboard" class="bottom-nav-item">
                            <i data-lucide="layout-dashboard"></i>
                            <span>Início</span>
                        </a>
                        <a href="#membros" class="bottom-nav-item">
                            <i data-lucide="users"></i>
                            <span>Membros</span>
                        </a>
                    ` : ''}
                    <a href="#aulas" class="bottom-nav-item">
                        <i data-lucide="calendar"></i>
                        <span>Aulas</span>
                    </a>
                    <a href="#perfil" class="bottom-nav-item active">
                        <i data-lucide="user"></i>
                        <span>Perfil</span>
                    </a>
                    ${user.is_admin ? `
                        <a href="#configuracoes" class="bottom-nav-item">
                            <i data-lucide="settings"></i>
                            <span>Ajustes</span>
                        </a>
                    ` : ''}
                </nav>

                <div class="hide-mobile" style="position: fixed; bottom: 1rem; right: 1.5rem; font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; pointer-events: none; opacity: 0.5;">
                    OSS BJJ Manager • v1.0
                </div>
            </div>
            
            <style>
                @media (max-width: 1024px) {
                    .layout-container { --grid-main: 1fr; }
                    .layout-container { --span-all: 2; }
                }
            </style>/div>
            </div>
            <div id="status-message" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;"></div>
        `;
    }

    renderAvatarWithStripes(user, size) {
        const belt = (user.current_belt || 'white belt');
        const beltColor = this.getBeltColor(belt);
        const stripes = Number(user.current_stripes || 0);
        
        const barHeight = Math.max(6, Math.floor(size * 0.15)); 
        const barWidth = size * 1.5;
        const tipWidth = barWidth * 0.35;
        const borderThickness = Math.max(3, Math.floor(size * 0.06));
        
        let stripesHtml = '';
        for(let i=0; i<stripes; i++) {
            stripesHtml += `<div style="background: #fff; width: ${Math.max(2, Math.floor(barHeight*0.25))}px; height: 100%;"></div>`;
        }

        return `
            <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
                <img src="${user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`}" 
                     style="width: ${size}px; height: ${size}px; border-radius: 50%; border: ${borderThickness}px solid ${beltColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.2); object-fit: cover; background: var(--bg-surface);">
                
                <div style="position: absolute; bottom: -${barHeight/3}px; left: 50%; transform: translateX(-50%); width: ${barWidth}px; height: ${barHeight}px; background: ${beltColor}; border-radius: 2px; display: flex; justify-content: flex-end; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 1px solid rgba(0,0,0,0.2); z-index: 2;">
                    <div style="width: ${tipWidth}px; background: #111; display: flex; align-items: center; justify-content: space-evenly; padding: 0 2%;">
                        ${stripesHtml}
                    </div>
                </div>
            </div>
        `;
    }

    renderBeltGraphic(beltName, stripes) {
        const belt = beltName?.toLowerCase() || 'white belt';
        const color = this.getBeltColor(belt);
        
        return `
            <div style="width: 100%; height: 36px; background: ${color}; border-radius: 4px; border: 1px solid rgba(0,0,0,0.2); position: relative; display: flex; align-items: center; justify-content: flex-end; padding-right: 20px; overflow: hidden;">
                <div style="background: #000; width: 60px; height: 100%; position: relative; display: flex; align-items: center; justify-content: space-around; padding: 0 8px;">
                    ${Array(Number(stripes || 0)).fill(0).map(() => `
                        <div style="background: #fff; width: 4px; height: 100%;"></div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getBeltColor(belt) {
        const colors = {
            'white belt': '#ffffff',
            'grey white belt': '#E5E7EB',
            'grey belt': '#9CA3AF',
            'grey black belt': '#4B5563',
            'yellow white belt': '#FEF08A',
            'yellow belt': '#FDE047',
            'yellow black belt': '#CA8A04',
            'orange white belt': '#FED7AA',
            'orange belt': '#FB923C',
            'orange black belt': '#EA580C',
            'green white belt': '#BBF7D0',
            'green belt': '#4ADE80',
            'green black belt': '#16A34A',
            'blue belt': '#2E5BFF',
            'purple belt': '#8b5cf6',
            'brown belt': '#78350f',
            'black belt': '#1a1a1a'
        };
        return colors[belt?.toLowerCase()] || '#fff';
    }

    afterRender() {
        if (window.lucide) window.lucide.createIcons();

        // Logout
        document.getElementById('logout-btn').onclick = () => this.app.auth.logout();

        // Theme Toggle
        document.getElementById('theme-toggle').onclick = () => {
            this.app.toggleTheme();
            this.app.router.handleRouteChange(window.location.hash);
        };

        // Profile Form Behavior
        const form = document.getElementById('profile-form');
        const saveBtn = document.getElementById('btn-save-profile');
        const inputs = form.querySelectorAll('input');

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (saveBtn) saveBtn.style.display = 'inline-block';
            });
        });

        if (saveBtn) {
            saveBtn.onclick = async (e) => {
                e.preventDefault();
                const originalContent = saveBtn.innerHTML;
                saveBtn.innerHTML = '<div class="spinner-small" style="border-top-color: white;"></div>';
                saveBtn.style.pointerEvents = 'none';

                const updates = {
                    full_name: document.getElementById('prof-name').value,
                    email: document.getElementById('prof-email').value,
                    birth_date: document.getElementById('prof-birth').value,
                    phone: document.getElementById('prof-phone').value,
                    avatar_url: document.getElementById('prof-avatar').value
                };

                const res = await this.app.auth.updateProfile(updates);
                
                if (res.success) {
                    this.showMessage('✅ Perfil atualizado com sucesso!', 'success');
                    saveBtn.style.display = 'none';
                    saveBtn.innerHTML = originalContent;
                    saveBtn.style.pointerEvents = 'auto';
                    this.app.router.handleRouteChange(window.location.hash);
                } else {
                    saveBtn.innerHTML = originalContent;
                    saveBtn.style.pointerEvents = 'auto';
                    this.showMessage('❌ Erro: ' + res.error, 'error');
                }
            };
        }

        // Graduation Form
        const gradForm = document.getElementById('graduation-form');
        if (gradForm) {
            gradForm.onsubmit = async (e) => {
                e.preventDefault();
                const belt = document.getElementById('prof-belt').value;
                const stripes = document.getElementById('prof-stripes').value;
                
                const user = await this.app.auth.getUser();
                const res = await this.app.academy.updateGraduation(user.id, belt, stripes, 'Auto-atualização via Perfil');
                
                if (res.success) {
                    this.showMessage('🎓 Graduação atualizada!', 'success');
                    setTimeout(() => this.app.router.handleRouteChange(window.location.hash), 1500);
                } else {
                    this.showMessage('❌ Erro: ' + res.error, 'error');
                }
            };
        }
    }

    showMessage(text, type) {
        const msg = document.getElementById('status-message');
        msg.innerHTML = `<span class="badge ${type === 'success' ? 'badge-success' : 'badge-error'}" style="padding: 1rem; border-radius: 4px; background: var(--bg-surface); opacity: 0; transition: opacity 0.3s;">${text}</span>`;
        setTimeout(() => msg.firstChild.style.opacity = '1', 10);
        setTimeout(() => msg.firstChild.style.opacity = '0', 3000);
    }
}
