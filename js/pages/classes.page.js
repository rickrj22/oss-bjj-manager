export class ClassesPage {
    constructor(app) {
        this.app = app;
    }

    async render() {
        this.user = await this.app.auth.getUser();
        const theme = this.app.currentTheme;

        this.app.classesState = this.app.classesState || {};
        const { data: academies } = await this.app.academy.getAcademies();
        this.academies = academies || [];
        
        if (!this.app.classesState.selectedAcademyId) {
            const primary = this.academies.find(a => a.is_primary);
            this.app.classesState.selectedAcademyId = primary ? primary.id : this.user.academy_id;
        }

        // Fetching data
        const [classes, stats, announcements, sidebarAcad] = await Promise.all([
            this.app.academy.getTodaysClasses(this.app.classesState.selectedAcademyId),
            this.app.academy.getUserStats(this.user.id),
            this.app.academy.getAnnouncements(),
            this.app.academy.getSidebarData()
        ]);
        const dateStr = this.app.academy.getLocalDateString();
        this.sidebarAcad = sidebarAcad || this.user.academy || {};

        return `
            <div class="layout-container">
                <aside class="sidebar" style="padding-top: 2rem;">
                    <div class="mb-12" style="display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 0 1rem; text-align: center;">
                        <div id="sidebar-logo-container" style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.3); border: 3px solid var(--border); position: relative;">
                            ${this.sidebarAcad.logo_url ? `
                                <img src="${this.sidebarAcad.logo_url}" 
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
                        <h2 class="font-heading" style="font-size: 1rem; letter-spacing: 0.1em; color: var(--text-primary); text-transform: uppercase;">${this.sidebarAcad.name || 'Academia Edson França'}</h2>
                    </div>

                    <nav class="nav-list" style="flex: 1;">
                        ${this.user.is_admin ? `
                            <a href="#dashboard" class="nav-item animate-in stagger-1">
                                <i data-lucide="layout-dashboard" size="18"></i> 
                                <span>${this.app.i18n.t('menu_dashboard')}</span>
                            </a>
                        ` : ''}
                        ${this.user.role === 'professor' || this.user.is_admin ? `
                            <a href="#membros" class="nav-item animate-in stagger-2">
                                <i data-lucide="users" size="18"></i> 
                                <span>${this.app.i18n.t('menu_members')}</span>
                            </a>
                        ` : ''}
                        <a href="#aulas" class="nav-item active animate-in stagger-3">
                            <i data-lucide="calendar" size="18"></i> 
                            <span>${this.app.i18n.t('menu_classes')}</span>
                        </a>
                        ${this.user.is_admin ? `
                            <a href="#financeiro" class="nav-item animate-in stagger-1">
                                <i data-lucide="dollar-sign" size="18"></i> 
                                <span>${this.app.i18n.t('menu_finance')}</span>
                            </a>
                            <a href="#configuracoes" class="nav-item animate-in stagger-2">
                                <i data-lucide="settings" size="18"></i> 
                                <span>${this.app.i18n.t('menu_settings')}</span>
                            </a>
                        ` : ''}
                        <a href="#perfil" class="nav-item animate-in stagger-3">
                            <i data-lucide="user" size="18"></i> 
                            <span>${this.app.i18n.t('menu_profile')}</span>
                        </a>
                        <a href="#instrutores" class="nav-item animate-in stagger-1">
                            <i data-lucide="graduation-cap" size="18"></i> 
                            <span>${this.app.i18n.t('menu_instructors')}</span>
                        </a>
                        <a href="#tuf" class="nav-item animate-in stagger-2">
                            <i data-lucide="swords" size="18"></i> 
                            <span>${this.app.i18n.t('menu_tuf')}</span>
                        </a>
                    </nav>

                    <div style="border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding: 0 0.5rem;">
                             ${this.renderAvatarWithStripes(this.user, 42)}
                            <div>
                                <p style="font-size: 0.8125rem; font-weight: 600;">${this.user.full_name}</p>
                                <p style="font-size: 0.6875rem; color: var(--text-dim); text-transform: uppercase;">${this.user.role}</p>
                            </div>
                        </div>
                        <button id="logout-btn" class="btn-secondary btn-full" style="height: 42px; gap: 0.75rem;">
                            <i data-lucide="log-out" size="18"></i> 
                            <span>${this.app.i18n.t('menu_logout')}</span>
                        </button>
                    </div>
                </aside>

                <main class="main-content">
                    <header class="mb-8 animate-in" style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h1 class="font-heading font-xl">${this.app.i18n.t('menu_classes')}</h1>
                            <p class="text-graphite">${this.app.i18n.t('classes_subtitle')}</p>
                        </div>
                        <div class="hide-mobile">
                            ${this.app.renderLanguageAndThemeControls()}
                        </div>
                    </header>

                    <div class="grid" style="grid-template-columns: var(--grid-main, 2fr 1fr); gap: 2rem;">
                        <div style="display: flex; flex-direction: column; gap: 2rem;">
                            <!-- Agenda Section -->
                            <div class="card animate-in stagger-1">
                                <div class="flex-between mb-8" style="border-bottom: 1px solid var(--border); padding-bottom: 1.25rem;">
                                    <div>
                                        <h3 class="font-heading font-large">${this.app.i18n.t('today_schedule')}</h3>
                                        <p class="text-dim" style="font-size: 0.85rem; text-transform: capitalize;">${new Date().toLocaleDateString(this.app.i18n.currentLang, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                    </div>
                                    <div style="display: flex; gap: 0.75rem; align-items: center;">
                                        <button class="btn btn-outline" id="btn-global-checkin">
                                            <i data-lucide="check-square" size="16"></i> <span class="hide-mobile">${this.app.i18n.t('realize_checkin')}</span>
                                        </button>
                                        ${this.user.is_admin || this.user.role === 'professor' ? `
                                            <button class="btn btn-primary" id="btn-add-technique">
                                                <i data-lucide="plus" size="16"></i> <span class="hide-mobile">${this.app.i18n.t('define_technique')}</span>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>

                                <div class="classes-list" style="display: flex; flex-direction: column; gap: 1.5rem;">
                                    ${classes.length === 0 ? `
                                        <div style="text-align: center; padding: 3rem; background: var(--bg-elevated); border-radius: 12px; border: 1px dashed var(--border);">
                                            <i data-lucide="calendar-off" size="48" class="text-dim mb-4"></i>
                                            <p class="text-dim">Nenhuma aula agendada para hoje.</p>
                                        </div>
                                    ` : classes.map(c => this.renderClassItem(c, this.user, dateStr)).join('')}
                                </div>
                            </div>

                            <!-- History Summary Section -->
                            <div class="card animate-in stagger-2">
                                <h3 class="font-heading mb-6" style="font-size: 1rem;">${this.app.i18n.t('history_belt_title')}</h3>
                                <div class="grid ${this.user.is_admin || this.user.role === 'professor' ? 'grid-cols-3' : 'grid-cols-2'}" style="text-align: center; gap: 1rem;">
                                    <div style="padding: 1.5rem 1rem; background: var(--bg-elevated); border-radius: 12px; border: 1px solid var(--border);">
                                        <p class="text-dim mb-2" style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase;">Horas concluídas</p>
                                        <p class="font-heading" style="font-size: 1.75rem; color: var(--primary);">${stats.totalHours}</p>
                                    </div>
                                    <div style="padding: 1.5rem 1rem; background: var(--bg-elevated); border-radius: 12px; border: 1px solid var(--border);">
                                        <p class="text-dim mb-2" style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase;">Qtd de treinos</p>
                                        <p class="font-heading" style="font-size: 1.75rem; color: var(--text-primary);">${stats.trainingsInCurrentBelt}</p>
                                    </div>
                                    ${this.user.is_admin || this.user.role === 'professor' ? `
                                        <div style="padding: 1.5rem 1rem; background: var(--bg-elevated); border-radius: 12px; border: 1px solid var(--border);">
                                            <p class="text-dim mb-2" style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase;">Aulas ministradas</p>
                                            <p class="font-heading" style="font-size: 1.75rem; color: var(--text-primary);">${stats.classesTaught}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 2rem;">
                            <!-- Announcements Section -->
                            <div class="card animate-in stagger-3">
                                <div class="flex-between mb-6">
                                    <h3 class="font-heading font-large">Comunicados</h3>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                                    ${announcements.length === 0 ? `
                                        <p class="text-dim" style="font-size: 0.85rem; font-style: italic;">Nenhum comunicado recente.</p>
                                    ` : announcements.map(a => `
                                        <div style="padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); last-child { border: 0 };">
                                            <p style="font-weight: 500; font-size: 0.9375rem; line-height: 1.6; color: var(--text-primary);">${a.content}</p>
                                            <div class="flex-between mt-3">
                                                <p class="text-dim" style="font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${a.author?.full_name}</p>
                                                <p class="text-dim" style="font-size: 0.7rem; font-weight: 500;">${new Date(a.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Total History Card (High Fidelity) -->
                            <div class="card animate-in stagger-1">
                                <h3 class="font-heading mb-6" style="font-size: 1rem;">Histórico de aulas (Total)</h3>
                                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                                    ${stats.historyByBelt.length === 0 ? `
                                        <div style="padding: 2rem; background: var(--bg-elevated); border-radius: 12px; border: 1px solid var(--border); text-align: center;">
                                            <p class="text-dim" style="font-size: 0.85rem;">Check-ins acumulados</p>
                                            <p class="font-heading" style="font-size: 2.5rem; color: var(--text-primary);">${stats.totalTrainings}</p>
                                        </div>
                                    ` : stats.historyByBelt.map(h => `
                                        <div style="padding: 1.5rem; background: var(--bg-elevated); border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
                                            <div style="flex: 1; min-width: 140px;">
                                                <p style="font-weight: 800; font-size: 0.8125rem; text-transform: uppercase; margin-bottom: 0.75rem; color: var(--text-primary);">${h.belt}</p>
                                                <!-- Belt Graphic -->
                                                <div style="width: 140px; height: 18px; background: ${this.getBeltColor(h.belt)}; border-radius: 3px; position: relative; border: 1px solid rgba(0,0,0,0.1); overflow: hidden;">
                                                    <div style="position: absolute; right: 20px; top: 0; bottom: 0; width: 35px; background: #1a1a1a;"></div>
                                                </div>
                                            </div>
                                            
                                            <div style="display: flex; gap: 1.5rem; text-align: center; flex: 1; justify-content: flex-end;">
                                                <div>
                                                    <p class="text-dim mb-1" style="font-size: 0.55rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Horas</p>
                                                    <p class="font-heading" style="font-size: 1.25rem; color: var(--primary); line-height: 1;">${h.hours}</p>
                                                </div>
                                                <div>
                                                    <p class="text-dim mb-1" style="font-size: 0.55rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Treinos</p>
                                                    <p class="font-heading" style="font-size: 1.25rem; color: var(--text-primary); line-height: 1;">${h.count}</p>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <!-- Bottom Navigation (Mobile Only) -->
                <nav class="bottom-nav">
                    ${this.user.is_admin ? `
                        <a href="#dashboard" class="bottom-nav-item">
                            <i data-lucide="layout-dashboard"></i>
                            <span>Início</span>
                        </a>
                        <a href="#membros" class="bottom-nav-item">
                            <i data-lucide="users"></i>
                            <span>Membros</span>
                        </a>
                    ` : ''}
                    <a href="#aulas" class="bottom-nav-item active">
                        <i data-lucide="calendar"></i>
                        <span>Aulas</span>
                    </a>
                    <a href="#perfil" class="bottom-nav-item">
                        <i data-lucide="user"></i>
                        <span>Perfil</span>
                    </a>
                    ${this.user.is_admin ? `
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
                }
            </style>
            <div id="status-message" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;"></div>
        `;
    }

    renderClassItem(c, user, dateStr) {
        const beltColors = {
            'white belt': '#ffffff',
            'blue belt': '#0055ff',
            'purple belt': '#8800ff',
            'brown belt': '#5d3a1a',
            'black belt': '#1a1a1a'
        };

        return `
            <div style="padding-bottom: 2rem; border-bottom: 1px solid var(--border); last-child { border: 0 };">
                <div class="flex-between mb-4">
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span class="badge badge-graphite" style="font-size: 0.6rem; letter-spacing: 0.05em;">${c.type.toUpperCase()}</span>
                            <span class="text-dim" style="font-size: 0.75rem; font-weight: 600;">${c.time}</span>
                        </div>
                        <h4 style="font-weight: 800; font-size: 1.25rem; margin-top: 0.25rem; color: var(--text);">${c.title}</h4>
                        <p class="text-dim" style="font-size: 0.8125rem;">Responsável: <strong>${c.coach}</strong></p>
                    </div>
                </div>

                <!-- Técnica do Dia -->
                <div style="margin: 1.5rem 0; display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem; background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); position: relative;">
                    <div style="position: absolute; left: 0; top: 20%; bottom: 20%; width: 4px; background: var(--primary); border-radius: 0 4px 4px 0;"></div>
                    
                    ${c.technique?.professor ? `
                        ${this.renderAvatarWithStripes(c.technique.professor, 52)}
                    ` : `
                        <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--bg-elevated); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="book-open" size="24" class="text-dim"></i>
                        </div>
                    `}
                    
                    <div style="flex: 1;">
                        <p style="font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: var(--primary); letter-spacing: 0.1em; margin-bottom: 0.25rem;">Técnica do Dia</p>
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
                            <h5 style="font-size: 1.125rem; font-weight: 700; color: var(--text-primary); line-height: 1.3;">
                                ${c.technique?.text || '<span class="text-dim" style="font-weight: 500; font-style: italic;">Ainda não definida para esta aula.</span>'}
                            </h5>
                            ${(this.user.is_admin || this.user.role === 'professor') && c.technique ? `
                                <button class="btn-icon btn-delete-technique" data-class-id="${c.id}" title="Remover Técnica" style="color: var(--error); background: hsla(0, 72%, 51%, 0.08); border-radius: 8px; padding: 0.5rem; transition: all 0.2s; border: 1px solid hsla(0, 72%, 51%, 0.2);">
                                    <i data-lucide="trash-2" size="18"></i>
                                </button>
                            ` : ''}
                        </div>
                        ${c.technique?.professor ? `
                            <p style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.5rem; font-weight: 500;">
                                Definida por <span style="font-weight: 700; color: var(--text-secondary);">${c.technique.professor.full_name}</span>
                            </p>
                        ` : ''}
                    </div>
                </div>

                <!-- Check-ins realizados -->
                <div class="checkins-container">
                    <p class="checkins-title">Check-ins realizados:</p>
                    ${c.attendees.map(a => `
                        <div class="checkin-item">
                            <div class="checkin-item-info">
                                ${this.renderAvatarWithStripes(a, 48)}
                                <div>
                                    <p class="checkin-item-name">${a.name}</p>
                                    <p class="checkin-item-belt">
                                        ${a.belt} ${a.stripes > 0 ? `• ${a.stripes}º Grau` : ''}
                                    </p>
                                </div>
                            </div>
                            ${a.status === 'confirmed' ? `
                                <div class="checkin-item-actions">
                                    <div style="color: var(--success); display: flex; align-items: center; gap: 0.5rem;" title="Presença Confirmada">
                                        <i data-lucide="check-circle-2" size="28" style="stroke-width: 2.5px; fill: hsla(142, 72%, 29%, 0.1);"></i>
                                    </div>
                                    ${(user.is_admin || user.role === 'professor' || user.role === 'admin') ? `
                                        <button class="btn-unconfirm-attendance" 
                                                data-attendance-id="${a.attendanceId}"
                                                data-class-id="${c.id}" 
                                                data-user-id="${a.id}" 
                                                data-date="${dateStr}" 
                                                title="Cancelar Check-in" 
                                                style="background: var(--bg-elevated); border: 1px solid var(--border); cursor: pointer; color: var(--error); border-radius: 6px; display: flex; align-items: center; justify-content: center; padding: 6px; transition: all 0.2s;">
                                            <i data-lucide="x" size="16"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            ` : `
                                <div class="checkin-item-actions">
                                    <span style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #f59e0b; background: hsla(38, 92%, 50%, 0.1); border: 1px solid hsla(38, 92%, 50%, 0.3); border-radius: 4px; padding: 2px 8px;">Pendente</span>
                                    ${(user.is_admin || user.role === 'professor' || user.role === 'admin') ? `
                                        <button class="btn-confirm-attendance" 
                                                data-attendance-id="${a.attendanceId}"
                                                data-class-id="${c.id}" 
                                                data-user-id="${a.id}" 
                                                data-date="${dateStr}" 
                                                title="Confirmar Presença" 
                                                style="background: none; border: none; cursor: pointer; color: var(--success); display: flex; align-items: center; justify-content: center; transition: transform 0.2s; padding: 0;">
                                            <i data-lucide="check-circle-2" size="28" style="stroke-width: 2.5px;"></i>
                                        </button>
                                    ` : ''}
                                    
                                    ${(a.id === user.id || user.is_admin || user.role === 'professor') ? `
                                        <button class="btn btn-cancel-checkin" data-class-id="${c.id}" data-attendance-id="${a.attendanceId}" style="min-width: 140px; height: 36px; font-size: 0.75rem;">
                                            Cancelar Check-in
                                        </button>
                                    ` : ''}
                                </div>
                            `}
                        </div>
                    `).join('')}
                    ${c.attendees.length === 0 ? '<p class="text-dim" style="font-size: 0.8125rem; font-style: italic; padding: 0.5rem;">Nenhum check-in realizado.</p>' : ''}
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
            'yellow black belt': '#EAB308',
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

    renderAvatarWithStripes(data, size) {
        const belt = (data.current_belt || data.belt || 'white belt');
        const beltColor = this.getBeltColor(belt);
        const stripes = Number(data.current_stripes || data.stripes || 0);
        const avatarUrl = data.avatar_url || data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name || data.name)}&background=random`;
        
        const barHeight = Math.max(6, Math.floor(size * 0.15)); 
        const barWidth = size * 1.5;
        const tipWidth = barWidth * 0.35;
        const borderThickness = Math.max(3, Math.floor(size * 0.06));
        
        // BJJ Tradition: Black belts have a red tip (tarja), others have black
        const isBlackBelt = belt?.toLowerCase() === 'black belt';
        const tipColor = isBlackBelt ? '#d32f2f' : '#111';
        
        let stripesHtml = '';
        for(let i=0; i<stripes; i++) {
            stripesHtml += `<div style="background: #fff; width: ${Math.max(2, Math.floor(barHeight*0.25))}px; height: 100%;"></div>`;
        }

        return `
            <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
                <img src="${avatarUrl}" 
                     style="width: ${size}px; height: ${size}px; border-radius: 50%; border: ${borderThickness}px solid ${beltColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.2); object-fit: cover; background: var(--bg-surface);">
                
                <div style="position: absolute; bottom: -${barHeight/3}px; left: 50%; transform: translateX(-50%); width: ${barWidth}px; height: ${barHeight}px; background: ${beltColor}; border-radius: 2px; display: flex; justify-content: flex-end; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 1px solid rgba(0,0,0,0.2); z-index: 2;">
                    <div style="width: ${tipWidth}px; background: ${tipColor}; display: flex; align-items: center; justify-content: space-evenly; padding: 0 2%;">
                        ${stripesHtml}
                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        if (window.lucide) window.lucide.createIcons();

        // Check-in
        document.querySelectorAll('.btn-checkin').forEach(btn => {
            btn.onclick = async () => {
                const res = await this.app.academy.checkIn(btn.dataset.id);
                if (res.success) {
                    this.showMessage('✅ Check-in realizado!', 'success');
                    this.app.router.handleRouteChange(window.location.hash);
                } else {
                    this.showMessage('❌ ' + res.error, 'error');
                }
            };
        });

        // Confirmar Presença
        document.querySelectorAll('.btn-confirm-attendance').forEach(btn => {
            btn.onclick = async (e) => {
                const button = e.currentTarget;
                const attendanceId = button.dataset.attendanceId;
                const classId = button.dataset.classId;
                const userId = button.dataset.userId;
                const date = button.dataset.date;
                const container = button.parentElement;
                
                // Feedback visual imediato e bloqueio de cliques
                button.style.pointerEvents = 'none';
                button.style.opacity = '0.5';
                button.innerHTML = '<i data-lucide="loader-2" class="animate-spin" size="24"></i>';
                if (window.lucide) window.lucide.createIcons();

                const res = await this.app.academy.confirmAttendance(classId, userId, date, attendanceId);
                if (res.success) {
                    container.innerHTML = `
                        <div style="color: var(--success); display: flex; align-items: center; gap: 0.5rem;" class="animate-in fade-in">
                            <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Confirmado!</span>
                            <i data-lucide="check-circle-2" size="28" style="stroke-width: 2.5px; fill: hsla(142, 72%, 29%, 0.1);"></i>
                        </div>
                    `;
                    if (window.lucide) window.lucide.createIcons();
                    setTimeout(() => this.app.router.handleRouteChange(window.location.hash), 1200);
                } else {
                    alert('Erro ao confirmar presença: ' + res.error);
                    this.app.router.handleRouteChange(window.location.hash);
                }
            };
        });

        // Cancelar Check-in (admin/prof) — exclui a linha da tabela
        document.querySelectorAll('.btn-unconfirm-attendance').forEach(btn => {
            btn.onclick = async (e) => {
                if (confirm('Deseja realmente cancelar o check-in deste aluno? A presença será removida.')) {
                    const button = e.currentTarget;
                    const attendanceId = button.dataset.attendanceId;
                    const classId = button.dataset.classId;
                    const userId = button.dataset.userId;
                    const date = button.dataset.date;
                    
                    const res = await this.app.academy.unconfirmAttendance(classId, userId, date, attendanceId);
                    if (res.success) this.app.router.handleRouteChange(window.location.hash);
                    else alert('Erro ao cancelar: ' + res.error);
                }
            };
        });

        // Cancelar Check-in (botão do aluno em registros pendentes)
        document.querySelectorAll('.btn-cancel-checkin').forEach(btn => {
            btn.onclick = async (e) => {
                const button = e.target.closest('button');
                const classId = button.dataset.classId;
                const attendanceId = button.dataset.attendanceId;

                // Se temos um attendanceId, deletamos pelo ID diretamente (mais preciso)
                let res;
                if (attendanceId) {
                    res = await this.app.academy.unconfirmAttendance(null, null, null, attendanceId);
                } else {
                    res = await this.app.academy.cancelCheckIn(classId);
                }

                if (res.success) {
                    this.showMessage('⚠️ Check-in cancelado.', 'success');
                    this.app.router.handleRouteChange(window.location.hash);
                }
            };
        });

        // Delete Technique
        document.querySelectorAll('.btn-delete-technique').forEach(btn => {
            btn.onclick = async (e) => {
                if (confirm('Deseja remover a técnica definida para esta aula?')) {
                    const classId = e.currentTarget.dataset.classId;
                    const res = await this.app.academy.deleteDailyTechnique(classId);
                    if (res.success) this.app.router.handleRouteChange(window.location.hash);
                    else alert(res.error);
                }
            };
        });

        // Announcement
        const newAnnBtn = document.getElementById('btn-new-announcement');
        if (newAnnBtn) {
            newAnnBtn.onclick = () => this.showAnnouncementModal();
        }

        // Logout
        document.getElementById('logout-btn').onclick = () => this.app.auth.logout();

        // Theme Toggle
        const themeToggle = document.getElementById('theme-toggle-global');
        if (themeToggle) {
            themeToggle.onclick = () => {
                this.app.toggleTheme();
                this.app.router.handleRouteChange(window.location.hash);
            };
        }

        const academySelect = document.getElementById('classes-academy-select');
        if (academySelect) {
            academySelect.addEventListener('change', (e) => {
                this.app.classesState.selectedAcademyId = e.target.value;
                this.app.router.handleRouteChange(window.location.hash);
            });
        }

        // Global Check-in
        const globalCheckinBtn = document.getElementById('btn-global-checkin');
        if (globalCheckinBtn) {
            globalCheckinBtn.addEventListener('click', async () => {
                let classes = await this.app.academy.getTodaysClasses(this.app.classesState.selectedAcademyId);
                
                if (classes.length === 0) {
                    alert('Não há aulas agendadas para hoje nesta unidade. O check-in não é possível.');
                    return;
                }

                if (classes.length === 1) {
                    const res = await this.app.academy.checkIn(classes[0].id);
                    if (res.success) this.app.router.handleRouteChange(window.location.hash);
                    else alert(res.error);
                } else {
                    this.app.showModal('Realizar Check-in', `
                        <p class="mb-4 text-dim">Selecione para qual aula deseja confirmar sua presença:</p>
                        <div class="form-group">
                            <select class="input" id="checkin-class-id">
                                ${classes.map(c => `<option value="${c.id}">${c.title} (${c.time})</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex-between mt-6">
                            <button class="btn btn-outline" onclick="window.App.closeModal()">Cancelar</button>
                            <button class="btn btn-primary" id="modal-confirm-checkin">Realizar Check-in</button>
                        </div>
                    `);
                    
                    document.getElementById('modal-confirm-checkin').onclick = async () => {
                        const classId = document.getElementById('checkin-class-id').value;
                        const res = await this.app.academy.checkIn(classId);
                        if (res.success) {
                            this.app.closeModal();
                            this.app.router.handleRouteChange(window.location.hash);
                        } else alert(res.error);
                    };
                }
            });
        }

        // Modal de Técnica
        const addTechBtn = document.getElementById('btn-add-technique');
        if (addTechBtn) {
            addTechBtn.addEventListener('click', async () => {
                let classes = await this.app.academy.getTodaysClasses(this.app.classesState.selectedAcademyId);
                
                if (classes.length === 0) {
                    alert('Não há aulas agendadas para hoje nesta unidade.');
                    return;
                }

                this.app.showModal('Definir Técnica', `
                    <p class="mb-4 text-dim">Selecione a aula para definir a técnica:</p>
                    <div class="form-group">
                        <select class="input" id="tech-class-id">
                            ${classes.map(c => `<option value="${c.id}">${c.title} (${c.time})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group mt-4">
                        <label>Nome da Técnica</label>
                        <input type="text" id="tech-name" class="input" placeholder="Ex: Passagem de Guarda Toureada" required>
                    </div>
                    <div class="flex-between mt-6">
                        <button class="btn btn-outline" onclick="window.App.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" id="modal-confirm-tech">Salvar Técnica</button>
                    </div>
                `);
                
                document.getElementById('modal-confirm-tech').onclick = async () => {
                    const classId = document.getElementById('tech-class-id').value;
                    const techName = document.getElementById('tech-name').value;
                    if (!techName) return alert("Digite o nome da técnica.");

                    const res = await this.app.academy.saveDailyTechnique(classId, techName);
                    if (res.success) {
                        this.app.closeModal();
                        this.app.router.handleRouteChange(window.location.hash);
                    } else alert(res.error);
                };
            });
        }
    }

    showAnnouncementModal() {
        const content = `
            <form id="ann-form">
                <div class="form-group">
                    <label>Conteúdo do Comunicado</label>
                    <textarea id="ann-content" class="input" style="min-height: 120px; padding: 1rem;" placeholder="Digite o aviso para os alunos..." required></textarea>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="button" class="btn btn-outline btn-full" onclick="window.App.closeModal()">CANCELAR</button>
                    <button type="submit" class="btn btn-primary btn-full">POSTAR COMUNICADO</button>
                </div>
            </form>
        `;
        this.app.showModal('Novo Comunicado', content);
        document.getElementById('ann-form').onsubmit = async (e) => {
            e.preventDefault();
            const res = await this.app.academy.createAnnouncement(document.getElementById('ann-content').value);
            if (res.success) {
                this.app.closeModal();
                this.app.router.handleRouteChange(window.location.hash);
            }
        };
    }

    showTechniqueModal(classId) {
        const content = `
            <form id="tech-form">
                <div class="form-group">
                    <label>Nome da Técnica</label>
                    <input type="text" id="tech-name" class="input" placeholder="Ex: Passagem de Guarda Toureada" required>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="button" class="btn btn-outline btn-full" onclick="window.App.closeModal()">CANCELAR</button>
                    <button type="submit" class="btn btn-primary btn-full">DEFINIR TÉCNICA</button>
                </div>
            </form>
        `;
        this.app.showModal('Definir Técnica do Dia', content);
        document.getElementById('tech-form').onsubmit = async (e) => {
            e.preventDefault();
            const res = await this.app.academy.saveDailyTechnique(classId, document.getElementById('tech-name').value);
            if (res.success) {
                this.app.closeModal();
                this.app.router.handleRouteChange(window.location.hash);
            }
        };
    }

    showMessage(text, type) {
        const msg = document.getElementById('status-message');
        msg.innerHTML = `<span class="badge ${type === 'success' ? 'badge-success' : 'badge-error'}" style="padding: 1rem; border-radius: 4px; background: var(--bg-surface); border: 1px solid var(--border); box-shadow: var(--shadow-md);">${text}</span>`;
        setTimeout(() => this.app.router.handleRouteChange(window.location.hash), 2000);
    }
}
