export class DashboardPage {
    constructor(app) {
        this.app = app;
    }

    async render() {
        this.user = await this.app.auth.getUser();
        const theme = this.app.currentTheme;
        
        this.app.dashboardState = this.app.dashboardState || {};
        const { data: academies } = await this.app.academy.getAcademies();
        this.academies = academies || [];
        
        if (!this.app.dashboardState.selectedAcademyId) {
            const primary = this.academies.find(a => a.is_primary);
            this.app.dashboardState.selectedAcademyId = primary ? primary.id : this.user.academy_id;
        }

        const [classes, stats, topStudents, announcements, sidebarAcad] = await Promise.all([
            this.app.academy.getTodaysClasses(this.app.dashboardState.selectedAcademyId),
            this.app.academy.getDashboardStats(),
            this.app.academy.getTopStudents(),
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
                            <a href="#dashboard" class="nav-item active animate-in stagger-1">
                                <i data-lucide="layout-dashboard" size="18"></i> 
                                <span>Dashboard</span>
                            </a>
                        ` : ''}
                        ${this.user.role === 'professor' || this.user.is_admin ? `
                            <a href="#membros" class="nav-item animate-in stagger-2">
                                <i data-lucide="users" size="18"></i> 
                                <span>Membros</span>
                            </a>
                        ` : ''}
                        <a href="#aulas" class="nav-item animate-in stagger-3">
                            <i data-lucide="calendar" size="18"></i> 
                            <span>Minhas Aulas</span>
                        </a>
                        ${this.user.is_admin ? `
                            <a href="#financeiro" class="nav-item animate-in stagger-1">
                                <i data-lucide="dollar-sign" size="18"></i> 
                                <span>Financeiro</span>
                            </a>
                            <a href="#configuracoes" class="nav-item animate-in stagger-2">
                                <i data-lucide="settings" size="18"></i> 
                                <span>Configurações</span>
                            </a>
                        ` : ''}
                        <a href="#perfil" class="nav-item animate-in stagger-3">
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
                             ${this.renderAvatarWithStripes(this.user, 42)}
                            <div>
                                <p style="font-size: 0.8125rem; font-weight: 600;">${this.user.full_name}</p>
                                <p style="font-size: 0.6875rem; color: var(--text-dim); text-transform: uppercase;">${this.user.role}</p>
                            </div>
                        </div>
                        <button id="logout-btn" class="btn-secondary btn-full" style="height: 42px; gap: 0.75rem;">
                            <i data-lucide="log-out" size="18"></i> 
                            <span>Sair</span>
                        </button>
                    </div>
                </aside>

                <main class="main-content">
                    <header class="flex-between mb-8">
                        <div>
                            <h1 class="font-heading font-xl">Dashboard</h1>
                            <p class="text-graphite hide-mobile">Bem-vindo ao centro de comando da sua Academia.</p>
                        </div>
                    </header>

                    <!-- Stats Grid -->
                    <div class="grid grid-cols-3 mb-8">
                        <!-- Alunos -->
                        <div class="card animate-in stagger-1">
                            <p class="text-dim" style="font-size: 0.7rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Alunos Ativos</p>
                            <div class="flex-between mt-3">
                                <h2 class="font-heading font-xl" style="font-size: 2.25rem; line-height: 1;">${stats.students.active}</h2>
                                <div style="display: flex; flex-direction: column; gap: 6px;">
                                    <button class="stat-btn active-list-btn">Ativos: ${stats.students.active}</button>
                                    <button class="stat-btn inactive-list-btn">Inativos: ${stats.students.inactive}</button>
                                </div>
                            </div>
                        </div>

                        <!-- Frequência -->
                        <div class="card animate-in stagger-2">
                            <p class="text-dim" style="font-size: 0.7rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Frequência Média</p>
                            <div class="avatar-stack" style="margin-top: 1.5rem;">
                                 ${topStudents.map(s => this.renderAvatarWithStripes(s, 36, true)).join('')}
                                ${topStudents.length === 0 ? '<span class="text-dim" style="font-size: 0.8rem;">Sem dados...</span>' : ''}
                            </div>
                            <p class="text-dim mt-4" style="font-size: 0.6rem; font-weight: 500;">Top 5 frequentes</p>
                        </div>

                        <!-- Financeiro -->
                        <div class="card animate-in stagger-3">
                            <p class="text-dim" style="font-size: 0.7rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Receita Mensal</p>
                            <div class="flex-between mt-3">
                                <div>
                                    <p style="font-size: 1rem; font-weight: 800; color: var(--success);">R$ ${stats.finance.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    <p style="font-size: 0.65rem; color: var(--error); font-weight: 600;">Pendente: R$ ${stats.finance.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <h2 class="font-heading" style="font-size: 1.5rem;">${stats.finance.percent}%</h2>
                            </div>
                            <div class="progress-container" style="height: 4px; margin-top: 1rem;">
                                <div class="progress-fill" style="width: ${stats.finance.percent}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="grid" style="grid-template-columns: var(--grid-main, 2fr 1fr); gap: 2rem;">
                        <!-- Agenda -->
                        <div class="card animate-in stagger-2">
                            <div class="flex-between mb-8" style="border-bottom: 1px solid var(--border); padding-bottom: 1.25rem;">
                                <div>
                                    <h3 class="font-heading font-large">Agenda de Hoje</h3>
                                    <p class="text-dim" style="font-size: 0.85rem; text-transform: capitalize;">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                </div>
                                <div style="display: flex; gap: 0.75rem; align-items: center;">
                                    <button class="btn btn-outline" id="btn-global-checkin">
                                        <i data-lucide="check-square" size="16"></i> <span class="hide-mobile">REALIZAR CHECK-IN</span>
                                    </button>
                                    ${this.user.is_admin || this.user.role === 'professor' ? `
                                        <button class="btn btn-primary" id="btn-add-technique">
                                            <i data-lucide="plus" size="16"></i> <span class="hide-mobile">DEFINIR TÉCNICA</span>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="classes-list" style="display: flex; flex-direction: column; gap: 1.5rem;">
                                ${classes.length > 0 
                                    ? classes.map(c => this.renderClassItem(c, this.user, dateStr)).join('')
                                    : `
                                        <div style="text-align: center; padding: 3rem; background: var(--bg-elevated); border-radius: 12px; border: 1px dashed var(--border);">
                                            <i data-lucide="calendar-off" size="48" class="text-dim mb-4"></i>
                                            <p class="text-dim">Nenhuma aula agendada para hoje.</p>
                                        </div>
                                    `
                                }
                            </div>
                        </div>

                        <!-- Comunicados -->
                        <div class="card animate-in stagger-3">
                            <div class="flex-between mb-6">
                                <h3 class="font-heading font-large">Comunicados</h3>
                                ${this.user.is_admin || this.user.role === 'professor' ? `
                                    <button class="btn" id="btn-new-announcement" style="min-width: 80px; height: 36px; font-size: 0.75rem;">Novo</button>
                                ` : ''}
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                                ${announcements.length > 0 ? announcements.map(a => `
                                    <div class="announcement-item" style="padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); last-child { border: 0 };">
                                        <div class="flex-between mb-3">
                                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                                <p class="text-dim" style="font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${a.author.full_name}</p>
                                                <span style="color: var(--border); font-size: 0.7rem;">•</span>
                                                <p class="text-dim" style="font-size: 0.7rem; font-weight: 500;">${new Date(a.created_at).toLocaleDateString()}</p>
                                            </div>
                                            ${this.user.is_admin || this.user.role === 'professor' ? `
                                                <div style="display: flex; gap: 0.5rem;">
                                                    <button class="btn-icon btn-edit-announcement" data-id="${a.id}" data-content="${a.content.replace(/"/g, '&quot;')}" title="Editar Comunicado" style="color: var(--text-dim); background: var(--bg-elevated); border-radius: 6px; padding: 0.4rem; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
                                                        <i data-lucide="edit-3" size="14"></i>
                                                    </button>
                                                    <button class="btn-icon btn-delete-announcement" data-id="${a.id}" title="Excluir Comunicado" style="color: var(--error); background: hsla(0, 72%, 51%, 0.08); border-radius: 6px; padding: 0.4rem; border: 1px solid hsla(0, 72%, 51%, 0.2); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
                                                        <i data-lucide="trash-2" size="14"></i>
                                                    </button>
                                                </div>
                                            ` : ''}
                                        </div>
                                        <p style="font-weight: 500; font-size: 0.9375rem; line-height: 1.6; color: var(--text-primary);">${a.content}</p>
                                    </div>
                                `).join('') : '<p class="text-dim" style="font-size: 0.875rem; font-style: italic;">Nenhum comunicado recente.</p>'}
                            </div>
                        </div>
                    </div>
                </main>

                <!-- Bottom Navigation (Mobile Only) -->
                <nav class="bottom-nav">
                    ${this.user.is_admin ? `
                        <a href="#dashboard" class="bottom-nav-item active">
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
            
            <!-- Modals -->
            <div id="modal-container"></div>
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
            <div style="padding-bottom: 2rem; border-bottom: 1px solid var(--border);">
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
${c.attendees.length === 0 ? '<p class="text-dim" style="font-size: 0.8125rem; font-style: italic; padding: 0.5rem;">Nenhum check-in confirmado.</p>' : ''}
                </div>
        `;
    }

    afterRender() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.app.auth.logout());

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.app.toggleTheme();
                this.app.router.handleRouteChange(window.location.hash);
            });
        }

        const academySelect = document.getElementById('dashboard-academy-select');
        if (academySelect) {
            academySelect.addEventListener('change', (e) => {
                this.app.dashboardState.selectedAcademyId = e.target.value;
                this.app.router.handleRouteChange(window.location.hash);
            });
        }

        // Global Check-in
        const globalCheckinBtn = document.getElementById('btn-global-checkin');
        if (globalCheckinBtn) {
            globalCheckinBtn.addEventListener('click', async () => {
                let classes = await this.app.academy.getTodaysClasses(this.app.dashboardState.selectedAcademyId);
                
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
                            <button class="btn btn-primary" id="modal-confirm-checkin">Confirmar Presença</button>
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

        // Cancelar Check-in (botão do aluno em registros pendentes)
        document.querySelectorAll('.btn-cancel-checkin').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.currentTarget;
                const classId = button.dataset.classId;
                const attendanceId = button.dataset.attendanceId;

                let res;
                if (attendanceId) {
                    res = await this.app.academy.unconfirmAttendance(null, null, null, attendanceId);
                } else {
                    res = await this.app.academy.cancelCheckIn(classId);
                }

                if (res.success) this.app.router.handleRouteChange(window.location.hash);
            });
        });

        // Modal de Técnica
        const addTechBtn = document.getElementById('btn-add-technique');
        if (addTechBtn) {
            addTechBtn.addEventListener('click', async () => {
                let classes = await this.app.academy.getTodaysClasses(this.app.dashboardState.selectedAcademyId);
                
                if (classes.length === 0) {
                    alert('Não há aulas agendadas para hoje nesta unidade.');
                    return;
                }

                this.app.showModal('Definir Técnica', `
                    <div class="form-group">
                        <label>Data</label>
                        <input type="text" class="input" value="${new Date().toLocaleDateString('pt-BR')}" readonly style="background: var(--bg-dim);">
                    </div>
                    <div class="form-group">
                        <label>Aula (Horário Disponível)</label>
                        <select class="input" id="tech-class-id">
                            ${classes.map(c => `<option value="${c.id}">${c.title} (${c.time})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Descrição da Técnica</label>
                        <textarea class="input" id="tech-content" style="height: 80px;" placeholder="Ex: Passagem de guarda toureando"></textarea>
                    </div>
                    <div class="flex-between mt-6">
                        <button class="btn btn-outline" onclick="window.App.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" id="modal-save-tech">Salvar Técnica</button>
                    </div>
                `);

                document.getElementById('modal-save-tech').onclick = async () => {
                    const classId = document.getElementById('tech-class-id').value;
                    const tech = document.getElementById('tech-content').value;
                    if (tech) {
                        const res = await this.app.academy.saveDailyTechnique(classId, tech);
                        if (res.success) {
                            this.app.closeModal();
                            this.app.router.handleRouteChange(window.location.hash);
                        }
                    }
                };
            });
        }

        // Modal de Comunicado
        const newAnnouncementBtn = document.getElementById('btn-new-announcement');
        if (newAnnouncementBtn) {
            newAnnouncementBtn.addEventListener('click', () => {
                this.app.showModal('Novo Comunicado', `
                    <div class="form-group">
                        <label>Mensagem</label>
                        <textarea class="input" id="ann-content" style="height: 100px;" placeholder="Digite o aviso para todos os alunos..."></textarea>
                    </div>
                    <div class="flex-between mt-6">
                        <button class="btn btn-outline" onclick="window.App.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" id="modal-pub-ann">Publicar</button>
                    </div>
                `);

                document.getElementById('modal-pub-ann').onclick = async () => {
                    const content = document.getElementById('ann-content').value;
                    if (content) {
                        const res = await this.app.academy.createAnnouncement(content);
                        if (res.success) {
                            this.app.closeModal();
                            this.showWhatsAppDispatcher(content);
                            this.app.router.handleRouteChange(window.location.hash);
                        }
                    }
                };
            });
        }

        // Editar Comunicado
        document.querySelectorAll('.btn-edit-announcement').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const content = btn.dataset.content;

                this.app.showModal('Editar Comunicado', `
                    <div class="form-group">
                        <label>Mensagem</label>
                        <textarea class="input" id="edit-ann-content" style="height: 100px;">${content}</textarea>
                    </div>
                    <div class="flex-between mt-6">
                        <button class="btn btn-outline" onclick="window.App.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" id="modal-save-ann">Salvar Alterações</button>
                    </div>
                `);

                document.getElementById('modal-save-ann').onclick = async () => {
                    const newContent = document.getElementById('edit-ann-content').value;
                    if (newContent) {
                        const res = await this.app.academy.updateAnnouncement(id, newContent);
                        if (res.success) {
                            this.app.closeModal();
                            this.app.router.handleRouteChange(window.location.hash);
                        }
                    }
                };
            });
        });

        // Excluir Comunicado
        document.querySelectorAll('.btn-delete-announcement').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Deseja realmente excluir este comunicado?')) {
                    const id = btn.dataset.id;
                    const res = await this.app.academy.deleteAnnouncement(id);
                    if (res.success) {
                        this.app.router.handleRouteChange(window.location.hash);
                    } else {
                        alert('Erro ao excluir: ' + res.error);
                    }
                }
            });
        });

        // Remover Técnica
        document.querySelectorAll('.btn-delete-technique').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const classId = e.currentTarget.dataset.classId;
                if (confirm('Deseja realmente remover a técnica desta aula?')) {
                    const res = await this.app.academy.deleteDailyTechnique(classId);
                    if (res.success) {
                        this.app.router.handleRouteChange(window.location.hash);
                    } else {
                        alert('Erro ao remover técnica: ' + res.error);
                    }
                }
            });
        });

        // Confirmar Presença
        document.querySelectorAll('.btn-confirm-attendance').forEach(btn => {
            btn.addEventListener('click', async (e) => {
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
                    // Alerta detalhado para depuração
                    alert('Erro na Confirmação!\n\nDetalhes: ' + (res.error || 'O banco de dados recusou a alteração. Verifique se o seu papel (role) no sistema permite confirmar presenças.'));
                    this.app.router.handleRouteChange(window.location.hash);
                }
            });
        });

        // Cancelar Check-in (admin/prof) — exclui a linha da tabela
        document.querySelectorAll('.btn-unconfirm-attendance').forEach(btn => {
            btn.addEventListener('click', async (e) => {
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
            });
        });

        // Lucide
        if (window.lucide) window.lucide.createIcons();
    }

    async showAnnouncementDispatcher(message) {
        const membersEmail = await this.app.academy.getAcademyActiveMembersWithEmail(this.app.dashboardState.selectedAcademyId);
        
        this.app.showModal('Centro de Transmissão', `
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <!-- Mensagem -->
                <div style="padding: 1.25rem; background: var(--bg-elevated); border-radius: 12px; border: 1px solid var(--border); box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                    <p style="font-size: 0.65rem; color: var(--primary); text-transform: uppercase; font-weight: 800; margin-bottom: 0.75rem; letter-spacing: 0.1em;">Mensagem do Comunicado</p>
                    <p style="font-size: 0.9375rem; line-height: 1.6; color: var(--text-primary);">${message}</p>
                </div>

                <!-- Canal: E-mail -->
                <div style="background: hsla(var(--h), 100%, 65%, 0.05); padding: 1.5rem; border-radius: 12px; border: 1px solid hsla(var(--h), 100%, 65%, 0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <i data-lucide="mail" size="18" style="color: var(--primary);"></i>
                                <h4 style="font-size: 1rem; font-weight: 800;">Disparo via E-mail</h4>
                            </div>
                            <p style="font-size: 0.75rem; color: var(--text-dim);">${membersEmail.length} alunos cadastrados receberão este comunicado.</p>
                        </div>
                        <button class="btn btn-primary" id="btn-send-email-all" style="height: 46px; padding: 0 2rem; font-weight: 700; gap: 0.75rem; box-shadow: var(--shadow-sm);">
                            <i data-lucide="send" size="18"></i> DISPARAR AGORA
                        </button>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; padding-top: 1rem; border-top: 1px solid hsla(var(--h), 100%, 65%, 0.1);">
                        <p style="font-size: 0.7rem; color: var(--primary); font-weight: 600; display: flex; align-items: center; gap: 0.35rem;">
                            <i data-lucide="shield-check" size="14"></i> Cópia Oculta (BCC)
                        </p>
                        <p style="font-size: 0.7rem; color: var(--primary); font-weight: 600; display: flex; align-items: center; gap: 0.35rem;">
                            <i data-lucide="zap" size="14"></i> Entrega Imediata
                        </p>
                    </div>
                </div>

                <!-- Lista de Destinatários -->
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-surface);">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--bg-elevated); border-bottom: 1px solid var(--border);">
                                <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em;">Aluno</th>
                                <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em;">E-mail</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${membersEmail.map(m => `
                                <tr style="border-bottom: 1px solid var(--border); font-size: 0.8125rem;">
                                    <td style="padding: 0.75rem 1rem; font-weight: 600;">${m.full_name}</td>
                                    <td style="padding: 0.75rem 1rem; color: var(--text-dim);">${m.email}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                    <button class="btn btn-secondary" onclick="window.App.closeModal()" style="font-weight: 700;">CANCELAR</button>
                </div>
            </div>
        `, 'modal-large');

        if (window.lucide) window.lucide.createIcons();

        // Email Dispatch Logic
        const sendEmailBtn = document.getElementById('btn-send-email-all');
        if (sendEmailBtn) {
            sendEmailBtn.onclick = async () => {
                const recipients = membersEmail.map(m => m.email);
                if (recipients.length === 0) {
                    alert('Nenhum aluno com e-mail cadastrado.');
                    return;
                }

                sendEmailBtn.disabled = true;
                sendEmailBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin" size="18"></i> ENVIANDO...';
                if (window.lucide) window.lucide.createIcons();

                const res = await this.app.academy.sendBulkEmail(recipients, 'Comunicado Academia OSS', message);
                
                if (res.success) {
                    sendEmailBtn.style.background = 'var(--success)';
                    sendEmailBtn.style.borderColor = 'var(--success)';
                    sendEmailBtn.innerHTML = '<i data-lucide="check-circle" size="18"></i> ENVIADO COM SUCESSO!';
                    if (window.lucide) window.lucide.createIcons();
                    setTimeout(() => this.app.closeModal(), 2000);
                } else {
                    alert('Erro ao enviar e-mails: ' + res.error);
                    sendEmailBtn.disabled = false;
                    sendEmailBtn.innerHTML = '<i data-lucide="send" size="18"></i> DISPARAR NOVAMENTE';
                    if (window.lucide) window.lucide.createIcons();
                }
            };
        }
    }

    renderAvatarWithStripes(data, size, isStacked = false) {
        const belt = (data.current_belt || data.belt || 'white belt');
        const beltColor = (() => {
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
        })();
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
            <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; ${isStacked ? 'margin-left: -12px;' : ''}" title="${data.full_name || data.name} ${stripes > 0 ? `(${stripes}º Grau)` : ''}">
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
}
