export class SettingsPage {
    constructor(app) {
        this.app = app;
        this.academies = [];
    }

    async render() {
        const user = await this.app.auth.getUser();
        const theme = this.app.currentTheme;
        
        if (!user.is_admin) {
            window.location.hash = '#dashboard';
            return '';
        }

        const res = await this.app.academy.getAcademies();
        this.academies = res.data || [];

        const academy = this.academies.find(a => a.is_primary) || this.academies[0] || {};

        return `
            <div class="layout-container">
                <aside class="sidebar" style="padding-top: 2rem;">
                    <div class="mb-12" style="display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 0 1rem; text-align: center;">
                        <div id="sidebar-logo-container" style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.3); border: 3px solid var(--border); position: relative;">
                            ${academy.logo_url ? `
                                <img src="${academy.logo_url}" 
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
                        <h2 class="font-heading" style="font-size: 1rem; letter-spacing: 0.1em; color: var(--text-primary); text-transform: uppercase;">${academy.name || 'Academia Edson França'}</h2>
                    </div>

                    <nav class="nav-list" style="flex: 1;">
                        <a href="#dashboard" class="nav-item animate-in stagger-1">
                            <i data-lucide="layout-dashboard" size="18"></i> 
                            <span>Dashboard</span>
                        </a>
                        <a href="#membros" class="nav-item animate-in stagger-2">
                            <i data-lucide="users" size="18"></i> 
                            <span>Membros</span>
                        </a>
                        <a href="#aulas" class="nav-item animate-in stagger-3">
                            <i data-lucide="calendar" size="18"></i> 
                            <span>Minhas Aulas</span>
                        </a>
                        <a href="#financeiro" class="nav-item animate-in stagger-1">
                            <i data-lucide="dollar-sign" size="18"></i> 
                            <span>Financeiro</span>
                        </a>
                        <a href="#configuracoes" class="nav-item active animate-in stagger-2">
                            <i data-lucide="settings" size="18"></i> 
                            <span>Configurações</span>
                        </a>
                        <a href="#perfil" class="nav-item animate-in stagger-3">
                            <i data-lucide="user" size="18"></i> 
                            <span>Perfil</span>
                        </a>
                        <a href="#instrutores" class="nav-item">
                            <i data-lucide="graduation-cap" size="18"></i> 
                            <span>Instrutores</span>
                        </a>
                        <a href="#tuf" class="nav-item">
                            <i data-lucide="swords" size="18"></i> 
                            <span>TUF</span>
                        </a>
                    </nav>

                    </nav>

                    <div style="border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding: 0 0.5rem;">
                             <img src="${user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`}" 
                                  class="avatar-belt belt-${(user.current_belt || 'white belt').replace(' ', '-')}"
                                  style="width: 42px; height: 42px;">
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

                <main class="main-content" style="max-width: 100%;">
                    <header class="flex-between mb-8 animate-in" style="align-items: flex-start;">
                        <div>
                            <h1 class="font-heading font-xl">Configurações</h1>
                            <p class="text-graphite hide-mobile">Gerencie as informações principais da sua unidade.</p>
                        </div>
                        <div class="hide-mobile">
                            ${this.app.renderLanguageAndThemeControls()}
                        </div>
                    </header>

                    <div class="grid" style="grid-template-columns: var(--grid-main, 1.2fr 1fr); gap: 2rem;">
                        <!-- Academy Info Card -->
                        <div class="card animate-in stagger-1" style="padding: 2rem; border-radius: 16px; background: var(--bg-surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2.5rem;">
                                <div>
                                    <h3 class="font-heading" style="font-size: 1rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 800; color: var(--text-primary);">Informações Gerais</h3>
                                    <p class="text-dim" style="font-size: 0.8125rem; margin-top: 0.25rem;">Dados cadastrais da unidade.</p>
                                </div>
                                <button class="btn btn-primary btn-save-row" data-id="${academy.id}" style="height: 44px; padding: 0 1.75rem; background: var(--inverse-bg); color: var(--inverse-text); font-weight: 700; font-size: 0.8rem; letter-spacing: 0.05em; border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.2s;">
                                    SALVAR
                                </button>
                            </div>

                            <form id="academy-details-form" data-id="${academy.id}" style="display: flex; flex-direction: column; gap: 1.5rem;">
                                <div class="form-group">
                                    <label style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; display: block; color: var(--text-dim);">Nome da Academia</label>
                                    <input type="text" class="grid-input font-bold" value="${academy.name || 'Academia Edson França'}" data-field="name" style="height: 52px; font-size: 1rem; padding: 0 1.25rem; border-radius: 10px;">
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; display: block; color: var(--text-dim);">Endereço Completo</label>
                                    <input type="text" class="grid-input" value="${academy.address || ''}" data-field="address" placeholder="Rua, Número, Bairro, Cidade..." style="height: 52px; padding: 0 1.25rem; border-radius: 10px;">
                                </div>
                                <div class="grid" style="grid-template-columns: var(--grid-cols-mobile, 1fr 1fr); gap: 1.5rem;">
                                    <div class="form-group">
                                        <label style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; display: block; color: var(--text-dim);">Contato</label>
                                        <input type="text" class="grid-input" value="${academy.phone || ''}" data-field="phone" placeholder="(00) 00000-0000" style="height: 52px; padding: 0 1.25rem; border-radius: 10px;">
                                    </div>
                                    <div class="form-group">
                                        <label style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; display: block; color: var(--text-dim);">Logo da Academia</label>
                                        <div style="display: flex; align-items: center; gap: 1rem;">
                                            <div id="logo-preview-container" style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden; background: var(--bg-elevated); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center;">
                                                ${academy.logo_url ? `<img src="${academy.logo_url}" style="width: 100%; height: 100%; object-fit: contain;">` : `<i data-lucide="image" style="color: var(--text-dim);"></i>`}
                                            </div>
                                            <div style="flex: 1;">
                                                <input type="file" id="academy-logo-upload" accept="image/*" style="display: none;" onchange="window.App.currentPage.handleLogoUpload(this)">
                                                <button type="button" class="btn" onclick="document.getElementById('academy-logo-upload').click()" style="height: 44px; padding: 0 1.5rem; font-size: 0.8rem; background: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border); border-radius: 10px;">
                                                    <i data-lucide="upload" size="16" style="margin-right: 0.5rem;"></i>Selecionar Imagem
                                                </button>
                                                <input type="hidden" id="logo-url-hidden" data-field="logo_url" value="${academy.logo_url || ''}">
                                                <p id="logo-upload-status" style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.5rem;"></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <!-- Management Cards -->
                        <div style="display: flex; flex-direction: column; gap: 2rem;">
                            <div class="card animate-in stagger-2" style="padding: 2rem; border-radius: 16px; border: 1px solid var(--border); background: var(--bg-surface); display: flex; flex-direction: column; gap: 1.25rem; position: relative; overflow: hidden;">
                                <div style="position: absolute; right: -20px; top: -20px; opacity: 0.03;">
                                    <i data-lucide="calendar" size="120"></i>
                                </div>
                                <h3 class="font-heading" style="font-size: 1rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 800; color: var(--text-primary);">Grade de Horários</h3>
                                <p class="text-dim" style="font-size: 0.85rem; line-height: 1.6;">Configure os dias e horários das aulas semanais.</p>
                                <button class="btn btn-outline btn-config-academy" data-id="${academy.id}" style="height: 52px; border-radius: 10px; font-weight: 700; margin-top: 1rem; border: 2px dashed var(--border); background: var(--bg-elevated); color: var(--text-primary); gap: 0.75rem;">
                                    <i data-lucide="calendar" size="18"></i> GRADE SEMANAL
                                </button>
                            </div>

                            <div class="card animate-in stagger-3" style="padding: 2rem; border-radius: 16px; border: 1px solid var(--border); background: var(--bg-surface); display: flex; flex-direction: column; gap: 1.25rem; position: relative; overflow: hidden;">
                                <div style="position: absolute; right: -20px; top: -20px; opacity: 0.03;">
                                    <i data-lucide="award" size="120"></i>
                                </div>
                                <h3 class="font-heading" style="font-size: 1rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 800; color: var(--text-primary);">Planos de Membro</h3>
                                <p class="text-dim" style="font-size: 0.85rem; line-height: 1.6;">Gerencie valores de mensalidades e benefícios.</p>
                                <button class="btn btn-outline" id="btn-manage-plans" style="height: 52px; border-radius: 10px; font-weight: 700; margin-top: 1rem; border: 2px dashed var(--border); background: var(--bg-elevated); color: var(--text-primary); gap: 0.75rem;">
                                    <i data-lucide="award" size="18"></i> GERENCIAR PLANOS
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <!-- Bottom Navigation (Mobile Only) -->
                <nav class="bottom-nav">
                    <a href="#dashboard" class="bottom-nav-item">
                        <i data-lucide="layout-dashboard"></i>
                        <span>Início</span>
                    </a>
                    <a href="#membros" class="bottom-nav-item">
                        <i data-lucide="users"></i>
                        <span>Membros</span>
                    </a>
                    <a href="#aulas" class="bottom-nav-item">
                        <i data-lucide="calendar"></i>
                        <span>Aulas</span>
                    </a>
                    <a href="#perfil" class="bottom-nav-item">
                        <i data-lucide="user"></i>
                        <span>Perfil</span>
                    </a>
                    <a href="#configuracoes" class="bottom-nav-item active">
                        <i data-lucide="settings"></i>
                        <span>Ajustes</span>
                    </a>
                </nav>

                <div class="hide-mobile" style="position: fixed; bottom: 1rem; right: 1.5rem; font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; pointer-events: none; opacity: 0.5;">
                    OSS BJJ Manager • v1.0
                </div>
            </div>
            
            <style>
                @media (max-width: 1024px) {
                    .layout-container { --grid-main: 1fr; --grid-cols-mobile: 1fr; }
                }
            </style> </div>
            </div>

            <style>
                .grid-table th {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    background: var(--bg-surface);
                    padding: 1.25rem 1rem;
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: var(--text-dim);
                    font-weight: 800;
                    text-align: left;
                    border-bottom: 2px solid var(--border);
                }
                .grid-table td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border);
                    vertical-align: middle;
                    transition: all 0.3s ease;
                }
                .grid-row {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .grid-row:hover {
                    background: var(--bg-elevated);
                }
                .grid-input, .grid-select {
                    background: var(--bg-input);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    padding: 0.75rem 1rem;
                    width: 100%;
                    border-radius: 10px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                }
                .grid-select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 0.75rem center;
                    background-size: 1rem;
                    padding-right: 2.5rem;
                }
                .grid-input:hover, .grid-select:hover {
                    border-color: var(--border-bright);
                    background: var(--bg-surface);
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
                }
                .grid-input:focus, .grid-select:focus {
                    background: var(--bg-surface);
                    border-color: var(--primary);
                    outline: none;
                    box-shadow: 0 0 0 4px hsla(var(--h), 100%, 65%, 0.12), inset 0 2px 4px rgba(0,0,0,0.02);
                }
                .btn-save-row:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
                    filter: brightness(1.1);
                }
                .btn-save-row:active {
                    transform: translateY(0);
                }
                .card {
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
                }
                .card:hover {
                    box-shadow: var(--shadow-md);
                }
                .btn-outline:hover {
                    background: var(--bg-surface) !important;
                    border-color: var(--primary) !important;
                    color: var(--primary) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
            </style>
            <div id="status-message" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;"></div>
        `;
    }

    renderScheduleRow(cls) {
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return `
            <tr class="schedule-row grid-row" data-id="${cls.id}">
                <td style="padding: 0.5rem 1rem;">
                    <select class="grid-select" data-field="day_of_week">
                        ${days.map((d, i) => `<option value="${i}" ${cls.day_of_week == i ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </td>
                <td style="padding: 0.5rem 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="time" class="grid-input" value="${cls.start_time.substring(0, 5)}" data-field="start_time" style="width: 85px; padding: 0.25rem 0.5rem;">
                        <span class="text-dim" style="font-size: 0.7rem;">às</span>
                        <input type="time" class="grid-input" value="${cls.end_time ? cls.end_time.substring(0, 5) : ''}" data-field="end_time" style="width: 85px; padding: 0.25rem 0.5rem;">
                    </div>
                </td>
                <td style="padding: 0.5rem 1rem;">
                    <select class="grid-select" data-field="type">
                        <option value="gi" ${cls.type == 'gi' ? 'selected' : ''}>GI (Kimono)</option>
                        <option value="nogi" ${cls.type == 'nogi' ? 'selected' : ''}>NO-GI</option>
                    </select>
                </td>
                <td style="padding: 0.5rem 1rem; text-align: center;">
                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button class="btn-icon btn-save-schedule" data-id="${cls.id}" title="Salvar">
                            <i data-lucide="check" size="16"></i>
                        </button>
                        <button class="btn-icon btn-delete-class" data-id="${cls.id}" title="Remover">
                            <i data-lucide="trash-2" size="16" style="color: var(--error);"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    afterRender() {
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('logout-btn').onclick = () => this.app.auth.logout();
        
        const themeToggle = document.getElementById('theme-toggle-global');
        if (themeToggle) {
            themeToggle.onclick = () => {
                this.app.toggleTheme();
                this.app.router.handleRouteChange(window.location.hash);
            };
        }

        // Manage Plans
        document.getElementById('btn-manage-plans').onclick = () => {
            this.showPlansModal();
        };

        // Single Academy Save Logic
        const saveBtn = document.querySelector('.btn-save-row');
        const form = document.getElementById('academy-details-form');
        const academyId = form?.dataset.id;

        if (saveBtn && form) {
            const inputs = form.querySelectorAll('.grid-input');
            inputs.forEach(input => {
                input.oninput = () => {
                    saveBtn.classList.add('active'); // Could add a visible state here
                };
            });

            saveBtn.onclick = async (e) => {
                e.preventDefault();
                const updates = {};
                form.querySelectorAll('[data-field]').forEach(el => {
                    updates[el.dataset.field] = el.value;
                });

                const originalHtml = saveBtn.innerHTML;
                saveBtn.innerHTML = '<div class="spinner-small" style="border-top-color: white;"></div>';
                saveBtn.style.pointerEvents = 'none';

                const res = await this.app.academy.updateAcademy(academyId, updates);
                if (res.success) {
                    saveBtn.innerHTML = 'SALVO COM SUCESSO!';
                    saveBtn.style.background = 'var(--success)';
                    
                    // Instant update for sidebar if this is the user's academy
                    const currentUser = await this.app.auth.getUser();
                    if (currentUser.academy_id === academyId) {
                        const logoContainer = document.getElementById('sidebar-logo-container');
                        if (logoContainer && updates.logo_url) {
                            logoContainer.innerHTML = `<img src="${updates.logo_url}" style="width: 100%; height: 100%; object-fit: contain;">`;
                        }
                    }

                    setTimeout(() => {
                        saveBtn.innerHTML = originalHtml;
                        saveBtn.style.background = '';
                        saveBtn.style.pointerEvents = 'auto';
                    }, 2000);
                } else {
                    saveBtn.innerHTML = 'ERRO AO SALVAR';
                    saveBtn.style.background = 'var(--error)';
                    setTimeout(() => {
                        saveBtn.innerHTML = originalHtml;
                        saveBtn.style.background = '';
                        saveBtn.style.pointerEvents = 'auto';
                    }, 2000);
                    alert('Erro ao salvar: ' + res.error);
                }
            };
        }

        // Manage Schedule
        const configBtn = document.querySelector('.btn-config-academy');
        if (configBtn) {
            configBtn.onclick = () => {
                const acc = this.academies.find(a => a.id === academyId) || this.academies[0];
                this.showAdvancedConfigModal(acc);
            };
        }
    }

    showAdvancedConfigModal(academy) {
        this.app.showModal(`Configurações Avançadas: ${academy.name}`, `
            <div style="display: flex; flex-direction: column; gap: 1.5rem; padding: 0.5rem; min-width: 950px; max-height: 85vh; overflow-y: auto;">
                <!-- Schedule Section -->
                <div>
                    <h4 class="font-heading mb-4" style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-dim); font-weight: 800;">Grade de Horários (Semanal)</h4>
                    
                    <!-- Quick Add Form (Spacious) -->
                    <div style="background: var(--bg-elevated); padding: 1.25rem 1.5rem; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 1.5rem;">
                        <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.5fr 160px; gap: 1rem; align-items: end;">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem; display: block; color: var(--text-dim);">Dia da Semana</label>
                                <select id="new-class-day" class="grid-select" style="height: 40px; font-size: 0.9rem; width: 100%; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary);">
                                    <option value="1">Segunda-feira</option>
                                    <option value="2">Terça-feira</option>
                                    <option value="3">Quarta-feira</option>
                                    <option value="4">Quinta-feira</option>
                                    <option value="5">Sexta-feira</option>
                                    <option value="6">Sábado</option>
                                    <option value="0">Domingo</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem; display: block; color: var(--text-dim);">Horário Início</label>
                                <input type="time" id="new-class-start" class="grid-input" style="height: 40px; font-size: 0.9rem; padding: 0 0.75rem; width: 100%; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary);">
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem; display: block; color: var(--text-dim);">Horário Término</label>
                                <input type="time" id="new-class-end" class="grid-input" style="height: 40px; font-size: 0.9rem; padding: 0 0.75rem; width: 100%; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary);">
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem; display: block; color: var(--text-dim);">Modalidade</label>
                                <select id="new-class-type" class="grid-select" style="height: 40px; font-size: 0.9rem; width: 100%; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary);">
                                    <option value="gi">GI (Kimono)</option>
                                    <option value="nogi">NO-GI</option>
                                </select>
                            </div>
                            <button type="button" class="btn" id="btn-add-schedule" style="height: 40px; width: 100%; font-size: 0.75rem; font-weight: 800; background: var(--inverse-bg); color: var(--inverse-text); margin: 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border: none; border-radius: 8px; cursor: pointer;">
                                <i data-lucide="plus" size="18"></i> ADICIONAR
                            </button>
                        </div>
                    </div>

                    <!-- Schedule Table (Spacious) -->
                    <div style="border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: var(--bg-surface); max-height: 300px; overflow-y: auto;">
                        <table class="grid-table" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: var(--bg-elevated); border-bottom: 2px solid var(--border); position: sticky; top: 0; z-index: 10;">
                                    <th style="padding: 1rem; font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); text-align: left; width: 25%;">DIA DA SEMANA</th>
                                    <th style="padding: 1rem; font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); text-align: left; width: 35%;">INTERVALO DE HORÁRIO</th>
                                    <th style="padding: 1rem; font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); text-align: left; width: 25%;">MODALIDADE</th>
                                    <th style="padding: 1rem; font-size: 0.7rem; text-transform: uppercase; color: var(--text-dim); text-align: center; width: 15%;">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody id="academy-schedule-list-body">
                                <!-- Loaded via JS -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Admin Actions -->
                <div style="border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 0.5rem;">
                    <h4 class="font-heading mb-4" style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-dim); font-weight: 800;">Gestão de Membros</h4>
                    <button class="btn btn-outline btn-full" id="btn-manage-members-fast" style="font-size: 0.8rem; height: 48px; border-style: dashed; border-width: 2px; justify-content: center; gap: 1rem; letter-spacing: 0.05em;">
                        <i data-lucide="users" size="20"></i> 
                        <span style="font-weight: 800;">GERENCIAR MEMBROS DESTA UNIDADE</span>
                    </button>
                </div>

                <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 0.5rem;">
                    <button class="btn btn-secondary" onclick="window.App.closeModal()" style="min-width: 160px; height: 44px; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.1em;">VOLTAR</button>
                </div>
            </div>
        `, 'modal-large');

        this.loadAcademySchedule(academy.id);

        document.getElementById('btn-add-schedule').onclick = async () => {
            const day = document.getElementById('new-class-day').value;
            const start = document.getElementById('new-class-start').value;
            const end = document.getElementById('new-class-end').value;
            const type = document.getElementById('new-class-type').value;

            if (!start || !end) return alert('Defina os horários de início e término');

            const res = await this.app.academy.createClass({
                academy_id: academy.id,
                day_of_week: parseInt(day),
                start_time: start + ':00',
                end_time: end + ':00',
                type: type,
                title: `Treino de ${type.toUpperCase()}`,
                coach_id: this.app.auth.currentUser.id,
                active: true
            });

            if (res.success) {
                this.loadAcademySchedule(academy.id);
            } else {
                alert('Erro ao salvar horário: ' + res.error);
            }
        };

        document.getElementById('btn-manage-members-fast').onclick = () => {
            this.app.closeModal();
            window.location.hash = '#membros';
        };
    }

    async loadAcademySchedule(academyId) {
        const body = document.getElementById('academy-schedule-list-body');
        const res = await this.app.academy.getClassesByAcademy(academyId);
        
        if (!res.success) {
            body.innerHTML = '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--error);">Erro ao carregar grade.</td></tr>';
            return;
        }

        if (res.data.length === 0) {
            body.innerHTML = '<tr><td colspan="4" style="padding: 3rem; text-align: center; color: var(--text-dim); font-style: italic;">Nenhum horário cadastrado. Adicione um acima.</td></tr>';
        } else {
            body.innerHTML = res.data.map(cls => this.renderScheduleRow(cls)).join('');
            
            if (window.lucide) window.lucide.createIcons();

            // Attach events to schedule rows
            body.querySelectorAll('.schedule-row').forEach(row => {
                const id = row.dataset.id;
                const saveBtn = row.querySelector('.btn-save-schedule');
                const deleteBtn = row.querySelector('.btn-delete-class');
                const inputs = row.querySelectorAll('.grid-input, .grid-select');

                inputs.forEach(input => {
                    input.addEventListener('input', () => row.classList.add('dirty'));
                });

                saveBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const updates = {};
                    row.querySelectorAll('[data-field]').forEach(el => {
                        let val = el.value;
                        if (el.dataset.field === 'start_time' || el.dataset.field === 'end_time') {
                            val = val + ':00';
                        }
                        updates[el.dataset.field] = val;
                    });

                    saveBtn.innerHTML = '<div class="spinner-small"></div>';
                    const resSave = await this.app.academy.updateClass(id, updates);
                    
                    if (resSave.success) {
                        row.classList.remove('dirty');
                        saveBtn.innerHTML = '<i data-lucide="check" size="16"></i>';
                        if (window.lucide) window.lucide.createIcons();
                        
                        // Feedback visual
                        const originalBg = row.style.background;
                        row.style.background = 'hsla(142, 70%, 45%, 0.1)';
                        setTimeout(() => row.style.background = originalBg, 800);
                    } else {
                        alert('Erro ao salvar: ' + resSave.error);
                        saveBtn.innerHTML = '<i data-lucide="check" size="16"></i>';
                        if (window.lucide) window.lucide.createIcons();
                    }
                });

                deleteBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm('Deseja remover este horário da grade oficial?')) {
                        row.style.opacity = '0.5';
                        const delRes = await this.app.academy.deleteClass(id);
                        if (delRes.success) {
                            row.style.transform = 'scale(0.98) translateX(-10px)';
                            setTimeout(() => this.loadAcademySchedule(academyId), 200);
                        } else {
                            row.style.opacity = '1';
                            alert('Erro ao remover: ' + delRes.error);
                        }
                    }
                });
            });
        }
    }

    showMessage(text, type) {
        const msg = document.getElementById('status-message');
        msg.innerHTML = `<span class="badge ${type === 'success' ? 'badge-success' : 'badge-error'}" style="padding: 1rem; border-radius: 4px; background: var(--bg-surface); border: 1px solid var(--border); box-shadow: var(--shadow-md); font-weight: 700;">${text}</span>`;
        setTimeout(() => msg.innerHTML = '', 3000);
    }

    async handleLogoUpload(input) {
        if (!input.files || !input.files[0]) return;

        const file = input.files[0];
        const statusEl = document.getElementById('logo-upload-status');
        const previewContainer = document.getElementById('logo-preview-container');
        const hiddenInput = document.getElementById('logo-url-hidden');

        const form = document.getElementById('academy-details-form');
        const academyId = form?.dataset.id;

        statusEl.textContent = 'Redimensionando e carregando...';
        statusEl.style.color = 'var(--primary)';

        try {
            const result = await this.app.auth.resizeAndUploadImage(file, 1080, 1080, 'avatars', 'logos', academyId);

            if (result.success) {
                hiddenInput.value = result.url;
                previewContainer.innerHTML = `<img src="${result.url}" style="width: 100%; height: 100%; object-fit: contain;">`;
                statusEl.textContent = 'Salvando automaticamente...';
                statusEl.style.color = 'var(--primary)';

                const res = await this.app.academy.updateAcademy(academyId, { logo_url: result.url });

                if (res.success) {
                    statusEl.textContent = 'Logo atualizado com sucesso!';
                    statusEl.style.color = 'var(--success)';

                    const logoContainer = document.getElementById('sidebar-logo-container');
                    if (logoContainer) {
                        logoContainer.innerHTML = `<img src="${result.url}" style="width: 100%; height: 100%; object-fit: contain;">`;
                    }
                } else {
                    statusEl.textContent = 'Erro ao salvar: ' + res.error;
                    statusEl.style.color = 'var(--error)';
                }
            } else {
                statusEl.textContent = 'Erro: ' + result.error;
                statusEl.style.color = 'var(--error)';
            }
        } catch (e) {
            statusEl.textContent = 'Erro: ' + e.message;
            statusEl.style.color = 'var(--error)';
        }
    }

    async showPlansModal() {
        const { data: plans } = await this.app.academy.getPlans();
        
        const content = `
            <div style="display: flex; flex-direction: column; gap: 1.5rem; min-width: 800px;">
                <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                    <h3 class="font-heading" style="font-size: 1.25rem;">Manutenção de Planos</h3>
                    <button class="btn btn-primary" id="btn-new-plan" style="height: 38px; font-size: 0.75rem; background: var(--inverse-bg); color: var(--inverse-text);">+ NOVO PLANO</button>
                </header>

                <div style="max-height: 400px; overflow-y: auto;">
                    <table class="grid-table" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--bg-elevated); border-bottom: 2px solid var(--border);">
                                <th style="padding: 1rem; text-align: left; font-size: 0.7rem; color: var(--text-dim);">NOME DO PLANO</th>
                                <th style="padding: 1rem; text-align: left; font-size: 0.7rem; color: var(--text-dim);">FAIXA ETÁRIA</th>
                                <th style="padding: 1rem; text-align: left; font-size: 0.7rem; color: var(--text-dim);">PAGAMENTO</th>
                                <th style="padding: 1rem; text-align: right; font-size: 0.7rem; color: var(--text-dim);">VALOR</th>
                                <th style="padding: 1rem; text-align: center; font-size: 0.7rem; color: var(--text-dim);">AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${plans.map(p => `
                                <tr>
                                    <td style="padding: 1rem; font-weight: 700;">${p.name}</td>
                                    <td style="padding: 1rem; font-size: 0.85rem;">${p.age_range || '-'}</td>
                                    <td style="padding: 1rem; font-size: 0.85rem; text-transform: uppercase;">${p.payment_type}</td>
                                    <td style="padding: 1rem; text-align: right; font-weight: 800;">R$ ${p.price.toFixed(2)}</td>
                                    <td style="padding: 1rem; text-align: center;">
                                        ${p.id.startsWith('p') ? `<span style="font-size: 0.6rem; color: var(--text-dim);">SISTEMA</span>` : `
                                            <button class="btn-icon delete-plan" data-id="${p.id}" title="Excluir">
                                                <i data-lucide="trash-2" size="16" style="color: var(--error);"></i>
                                            </button>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 1rem;">
                    <button class="btn btn-secondary" onclick="window.App.closeModal()">FECHAR</button>
                </div>
            </div>
        `;

        this.app.showModal('Gerenciar Planos', content, 'modal-large');
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('btn-new-plan').onclick = () => {
            alert('Funcionalidade de criação de planos customizados em desenvolvimento. Utilize os planos padrão do sistema por enquanto.');
        };
    }
}
