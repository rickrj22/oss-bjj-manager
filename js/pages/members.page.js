export class MembersPage {
    constructor(app) {
        this.app = app;
        this.members = [];
        this.filters = {};
        this.editingId = null;
    }

    async render() {
        this.user = await this.app.auth.getUser();
        const user = this.user;
        const [members, sidebarAcad, academiesRes, plansRes] = await Promise.all([
            this.app.academy.getAcademyMembers(),
            this.app.academy.getSidebarData(),
            this.app.academy.getAcademies(),
            this.app.academy.getPlans()
        ]);
        this.members = members;
        this.sidebarAcad = sidebarAcad || user.academy || {};
        this.allAcademies = academiesRes.data || [];
        this.plans = plansRes.data || [];
        
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
                        ${user.is_admin ? `
                            <a href="#dashboard" class="nav-item">
                                <i data-lucide="layout-dashboard" size="18"></i> 
                                <span>Dashboard</span>
                            </a>
                        ` : ''}
                        ${user.role === 'professor' || user.is_admin ? `
                            <a href="#membros" class="nav-item active">
                                <i data-lucide="users" size="18"></i> 
                                <span>Membros</span>
                            </a>
                        ` : ''}
                        <a href="#aulas" class="nav-item">
                            <i data-lucide="calendar" size="18"></i> 
                            <span>Minhas Aulas</span>
                        </a>
                        ${user.is_admin ? `
                            <a href="#financeiro" class="nav-item">
                                <i data-lucide="dollar-sign" size="18"></i> 
                                <span>Financeiro</span>
                            </a>
                            <a href="#configuracoes" class="nav-item">
                                <i data-lucide="settings" size="18"></i> 
                                <span>Configurações</span>
                            </a>
                        ` : ''}
                        <a href="#perfil" class="nav-item">
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

                    <div id="theme-toggle" class="theme-toggle">
                        <i data-lucide="${this.app.currentTheme === 'dark' ? 'sun' : 'moon'}"></i>
                        <span>${this.app.currentTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
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
                            <i data-lucide="log-out" size="18"></i> <span>Sair</span>
                        </button>
                    </div>
                </aside>

                <main class="main-content" style="max-width: 100%;">
                    <header class="flex-between mb-8 animate-in">
                        <div>
                            <h1 class="font-heading font-xl" style="font-weight: 800; font-size: 2.25rem; margin-bottom: 0.5rem;">Membros</h1>
                            <p class="text-graphite hide-mobile" style="font-size: 1.1rem; opacity: 0.8;">Gestão de membros da sua academia.</p>
                        </div>
                        <button class="btn btn-primary" id="btn-add-member" style="height: 48px; gap: 0.75rem; background: var(--inverse-bg); color: var(--inverse-text); border: none; font-weight: 700; border-radius: 8px; min-width: auto; padding: 0 1.5rem;">
                            <i data-lucide="user-plus" size="20"></i> <span class="hide-mobile">NOVO MEMBRO</span>
                        </button>
                    </header>

                    <div class="card animate-in stagger-2" style="padding: 0; overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-surface); box-shadow: 0 4px 20px rgba(0,0,0,0.05); -webkit-overflow-scrolling: touch;">
                        <table class="grid-table" style="width: 100%; border-collapse: collapse; min-width: 1000px;">
                            <thead>
                                <tr style="background: var(--bg-elevated); border-bottom: 2px solid var(--border);">
                                    <th style="width: 280px; padding: 1.25rem 1rem;">
                                        <div class="th-filter" data-col="membro">MEMBRO <i data-lucide="chevron-down" size="14"></i></div>
                                        <input type="text" class="column-filter-input" data-col="membro" placeholder="Filtrar...">
                                    </th>
                                    <th style="width: 220px;">
                                        <div class="th-filter" data-col="email">EMAIL <i data-lucide="chevron-down" size="14"></i></div>
                                        <input type="text" class="column-filter-input" data-col="email" placeholder="Filtrar...">
                                    </th>
                                    <th style="width: 150px;" class="hide-mobile">
                                        <div class="th-filter" data-col="cpf">CPF <i data-lucide="chevron-down" size="14"></i></div>
                                        <input type="text" class="column-filter-input" data-col="cpf" placeholder="Filtrar...">
                                    </th>
                                    <th style="width: 150px;" class="hide-mobile">
                                        <div class="th-filter" data-col="telefone">TELEFONE <i data-lucide="chevron-down" size="14"></i></div>
                                        <input type="text" class="column-filter-input" data-col="telefone" placeholder="Filtrar...">
                                    </th>
                                    <th style="width: 200px;">
                                        <div class="th-filter" data-col="faixa">FAIXA <i data-lucide="chevron-down" size="14"></i></div>
                                        <input type="text" class="column-filter-input" data-col="faixa" placeholder="Filtrar...">
                                    </th>
                                    <th style="width: 100px;">
                                        <div class="th-filter" data-col="graus">GRAUS <i data-lucide="chevron-down" size="14"></i></div>
                                        <input type="text" class="column-filter-input" data-col="graus" placeholder="Filtrar...">
                                    </th>
                                    <th style="width: 130px;">
                                        <div class="th-filter" data-col="cargo">CARGO <i data-lucide="chevron-down" size="14"></i></div>
                                        <input type="text" class="column-filter-input" data-col="cargo" placeholder="Filtrar...">
                                    </th>
                                    <th style="width: 100px;">
                                        <div class="th-filter" data-col="admin">ADMIN <i data-lucide="chevron-down" size="14"></i></div>
                                        <input type="text" class="column-filter-input" data-col="admin" placeholder="Filtrar...">
                                    </th>
                                    <th style="width: 200px;">
                                        <div class="th-filter" data-col="plano">PLANO <i data-lucide="chevron-down" size="14"></i></div>
                                        <input type="text" class="column-filter-input" data-col="plano" placeholder="Filtrar...">
                                    </th>
                                    <th style="text-align: center; width: 80px;">EXCLUIR</th>
                                </tr>
                            </thead>
                            <tbody id="members-list">
                                ${this.members.map(member => this.renderGridRow(member, user)).join('')}
                            </tbody>
                        </table>
                    </div>
                </main>

                <!-- Bottom Navigation (Mobile Only) -->
                <nav class="bottom-nav">
                    ${this.user.is_admin ? `
                        <a href="#dashboard" class="bottom-nav-item">
                            <i data-lucide="layout-dashboard"></i>
                            <span>Início</span>
                        </a>
                        <a href="#membros" class="bottom-nav-item active">
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
            </div>   </div>

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
                .th-filter {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .th-filter:hover {
                    color: var(--primary);
                }
                .th-filter i {
                    opacity: 0.5;
                }
                .grid-table td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border);
                    vertical-align: middle;
                    font-size: 0.875rem;
                    color: var(--text-primary);
                }
                .grid-row {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .grid-row:hover {
                    background: var(--bg-elevated);
                }
                .spreadsheet-cell {
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    background: var(--bg-elevated);
                    border: 1px solid transparent;
                    width: fit-content;
                    min-width: 120px;
                    transition: all 0.2s;
                }
                .btn-edit-member, .btn-delete-member {
                    color: var(--text-dim);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: var(--bg-elevated);
                }
                .btn-edit-member:hover {
                    color: var(--primary);
                    background: var(--bg-surface);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-sm);
                }
                .btn-delete-member:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
                }
                .badge-admin {
                    font-size: 0.6rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 6px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .badge-admin.sim { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
                .badge-admin.nao { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
                .column-filter-input {
                    display: none;
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    margin-top: 0.75rem;
                    font-size: 0.75rem;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    color: var(--text-primary);
                    transition: all 0.2s;
                }
                .column-filter-input.active {
                    display: block;
                    animation: slideDown 0.2s ease-out;
                }
                .column-filter-input:focus {
                    border-color: var(--primary);
                    background: var(--bg-surface);
                    outline: none;
                    box-shadow: 0 0 0 3px hsla(var(--h), 100%, 65%, 0.1);
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* SIDE DRAWER STYLES */
                .drawer-overlay {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                .drawer-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                .side-drawer {
                    position: fixed;
                    top: 0;
                    right: -450px;
                    width: 450px;
                    height: 100%;
                    background: var(--bg-surface);
                    box-shadow: -10px 0 30px rgba(0,0,0,0.2);
                    z-index: 1001;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .side-drawer.active {
                    right: 0;
                }
                .drawer-header {
                    padding: 2rem;
                    background: var(--bg-elevated);
                    border-bottom: 1px solid var(--border);
                    position: relative;
                }
                .drawer-close {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    cursor: pointer;
                    color: var(--text-dim);
                    transition: color 0.2s;
                }
                .drawer-close:hover { color: var(--primary); }
                .drawer-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem;
                }
                .drawer-section {
                    margin-bottom: 2.5rem;
                }
                .drawer-section-title {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    font-weight: 900;
                    color: var(--primary);
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .drawer-info-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .info-label {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    color: var(--text-dim);
                    font-weight: 800;
                }
                .info-value {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                @media (max-width: 500px) {
                    .side-drawer { width: 100%; right: -100%; }
                }

                .clickable-row {
                    cursor: pointer;
                }
            </style>

            <div id="drawer-overlay" class="drawer-overlay"></div>
            <div id="side-drawer" class="side-drawer">
                <div class="drawer-header" id="drawer-header-content"></div>
                <div class="drawer-content" id="drawer-body-content"></div>
            </div>
        `;
    }

    renderGridRow(member, currentUser) {
        const canEdit = currentUser.is_admin || (currentUser.role === 'professor' && member.role === 'student');
        
        return `
            <tr id="row-${member.id}" class="grid-row clickable-row" onclick="window.App.currentPage.showMemberDrawer('${member.id}')">
                <td>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        ${this.renderAvatarWithStripes(member, 40)}
                        <div>
                            <p style="font-weight: 700; color: var(--text-primary);">${member.full_name}</p>
                            <div style="display: flex; gap: 0.25rem; margin-top: 0.2rem;">
                                ${member.isReadyForStripe ? `<span style="font-size: 0.6rem; color: #22c55e; font-weight: 800;">• APTO GRAU</span>` : ''}
                                ${member.isReadyForBelt ? `<span style="font-size: 0.6rem; color: var(--primary); font-weight: 800;">• APTO FAIXA</span>` : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="spreadsheet-cell" style="background: transparent;">${member.email || '-'}</div>
                </td>
                <td>
                    <div class="spreadsheet-cell" style="background: transparent;">${member.cpf || '-'}</div>
                </td>
                <td>
                    <div class="spreadsheet-cell" style="background: transparent;">${member.phone || '-'}</div>
                </td>
                <td>
                    <div class="spreadsheet-cell" style="background: transparent; font-weight: 600;">
                        ${(member.current_belt || 'white belt').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </div>
                </td>
                <td>
                    <div class="spreadsheet-cell" style="background: transparent; text-align: center; min-width: 50px;">${member.current_stripes || 0}º</div>
                </td>
                <td>
                    <div class="spreadsheet-cell" style="background: transparent; font-weight: 800; letter-spacing: 0.05em;">${(member.role || 'student').toUpperCase()}</div>
                </td>
                <td>
                    <span class="badge-admin ${member.is_admin ? 'sim' : 'nao'}">${member.is_admin ? 'SIM' : 'NÃO'}</span>
                </td>

                <td>
                    <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                        <span style="font-weight: 800; font-size: 0.75rem; color: var(--primary);">${(this.plans.find(p => p.id === member.plan_id)?.name || 'S/ PLANO').toUpperCase()}</span>
                        <span style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase;">Vencimento: Dia ${member.payment_due_date || '-'}</span>
                    </div>
                </td>
                <td style="text-align: center;">
                    <div style="display: flex; justify-content: center; gap: 0.5rem;">
                        <div class="btn-delete-member" data-id="${member.id}" data-name="${member.full_name}" title="Excluir Membro" onclick="event.stopPropagation()">
                            <i data-lucide="trash-2" size="18"></i>
                        </div>
                    </div>
                </td>
            </tr>
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

    async showMemberDrawer(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (!member) return;

        const overlay = document.getElementById('drawer-overlay');
        const drawer = document.getElementById('side-drawer');
        const header = document.getElementById('drawer-header-content');
        const body = document.getElementById('drawer-body-content');

        header.innerHTML = `
            <div class="drawer-close" onclick="window.App.currentPage.closeDrawer()">
                <i data-lucide="x" size="24"></i>
            </div>
            <div style="display: flex; align-items: center; gap: 1.5rem;">
                ${this.renderAvatarWithStripes(member, 80)}
                <div>
                    <h2 class="font-heading" style="font-size: 1.5rem; margin-bottom: 0.5rem;">${member.full_name}</h2>
                    <div style="display: flex; gap: 0.5rem;">
                        <span class="badge-admin ${member.is_active ? 'sim' : 'nao'}" style="font-size: 0.55rem;">${member.is_active ? 'ATIVO' : 'INATIVO'}</span>
                        ${member.is_admin ? '<span class="badge-admin sim" style="font-size: 0.55rem;">ADMIN</span>' : ''}
                    </div>
                </div>
            </div>
        `;

        body.innerHTML = `
            <div class="drawer-section">
                <div class="drawer-section-title"><i data-lucide="user" size="14"></i> Dados Pessoais</div>
                <div class="drawer-info-grid">
                    <div class="info-item">
                        <span class="info-label">E-mail</span>
                        <span class="info-value">${member.email || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">CPF</span>
                        <span class="info-value">${member.cpf || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Telefone</span>
                        <span class="info-value">${member.phone || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Data de Nascimento</span>
                        <span class="info-value">${member.birth_date ? new Date(member.birth_date).toLocaleDateString() : '-'}</span>
                    </div>
                </div>
            </div>

            <div class="drawer-section">
                <div class="drawer-section-title"><i data-lucide="award" size="14"></i> Graduação</div>
                <div class="drawer-info-grid" style="grid-template-columns: 1fr 1fr;">
                    <div class="info-item">
                        <span class="info-label">Faixa Atual</span>
                        <span class="info-value">${(member.current_belt || 'white belt').toUpperCase()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Graus</span>
                        <span class="info-value">${member.current_stripes || 0}º Grau</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Treinos no Grau</span>
                        <span class="info-value">${member.trainingsSinceGrad || 0} aulas</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status</span>
                        <span class="info-value" style="color: ${member.isReadyForBelt ? 'var(--primary)' : (member.isReadyForStripe ? '#22c55e' : 'var(--text-dim)')}">
                            ${member.isReadyForBelt ? 'PRONTO P/ FAIXA' : (member.isReadyForStripe ? 'PRONTO P/ GRAU' : 'Em evolução')}
                        </span>
                    </div>
                </div>
            </div>

            <div class="drawer-section">
                <div class="drawer-section-title"><i data-lucide="dollar-sign" size="14"></i> Financeiro</div>
                <div class="drawer-info-grid">
                    <div class="info-item">
                        <span class="info-label">Plano Atual</span>
                        <span class="info-value">${(this.plans.find(p => p.id === member.plan_id)?.name || 'Sem Plano').toUpperCase()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Vencimento</span>
                        <span class="info-value">Todo dia ${member.payment_due_date || '-'}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 3rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <button class="btn btn-primary" onclick="window.App.currentPage.closeDrawer(); window.App.currentPage.showEditMemberModal('${member.id}')" style="height: 48px; background: var(--inverse-bg); color: var(--inverse-text); border: none; font-weight: 700; border-radius: 8px;">
                    <i data-lucide="edit-3" size="18"></i> EDITAR
                </button>
                <button class="btn-secondary" onclick="window.App.currentPage.closeDrawer()" style="height: 48px; border-radius: 8px; font-weight: 700;">FECHAR</button>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        
        overlay.classList.add('active');
        drawer.classList.add('active');

        overlay.onclick = () => this.closeDrawer();
    }

    closeDrawer() {
        const overlay = document.getElementById('drawer-overlay');
        const drawer = document.getElementById('side-drawer');
        if (overlay) overlay.classList.remove('active');
        if (drawer) drawer.classList.remove('active');
    }

    async showEditMemberModal(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (!member) return;

        const allBelts = [
            'white belt', 'grey white belt', 'grey belt', 'grey black belt',
            'yellow white belt', 'yellow belt', 'yellow black belt',
            'orange white belt', 'orange belt', 'orange black belt',
            'green white belt', 'green belt', 'green black belt',
            'blue belt', 'purple belt', 'brown belt', 'black belt'
        ];

        const lbl = 'font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; color: var(--text-dim); margin-bottom: 0.5rem; display: block;';
        const inp = 'height: 48px; font-size: 0.9rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px;';

        const content = `
            <form id="edit-member-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.25rem;">
                    <div style="grid-column: span 2;">
                        <label style="${lbl}">Nome Completo</label>
                        <input type="text" id="edit-name" class="input" style="${inp}" value="${member.full_name}" required>
                    </div>
                    <div>
                        <label style="${lbl}">E-mail</label>
                        <input type="email" id="edit-email" class="input" style="${inp}" value="${member.email || ''}" required>
                    </div>
                    <div>
                        <label style="${lbl}">CPF</label>
                        <input type="text" id="edit-cpf" class="input" style="${inp}" value="${member.cpf || ''}" required>
                    </div>
                    <div>
                        <label style="${lbl}">Data de Nascimento</label>
                        <input type="date" id="edit-birth-date" class="input" style="${inp}" value="${member.birth_date || ''}">
                    </div>
                    <div>
                        <label style="${lbl}">Telefone</label>
                        <input type="tel" id="edit-phone" class="input" style="${inp}" value="${member.phone || ''}">
                    </div>
                    <div>
                        <label style="${lbl}">Faixa</label>
                        <select id="edit-belt" class="input" style="${inp}">
                            ${allBelts.map(b => `<option value="${b}" ${member.current_belt === b ? 'selected' : ''}>${b.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="${lbl}">Graus</label>
                        <select id="edit-stripes" class="input" style="${inp}">
                            ${[0, 1, 2, 3, 4].map(s => `<option value="${s}" ${member.current_stripes == s ? 'selected' : ''}>${s}º Grau</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="${lbl}">Cargo</label>
                        <select id="edit-role" class="input" style="${inp}">
                            <option value="student" ${member.role === 'student' ? 'selected' : ''}>Aluno</option>
                            <option value="professor" ${member.role === 'professor' ? 'selected' : ''}>Professor</option>
                        </select>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem; background: var(--bg-elevated); padding: 0 1rem; border-radius: 8px; border: 1px solid var(--border); height: 48px; align-self: flex-end;">
                        <input type="checkbox" id="edit-admin" ${member.is_admin ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary);">
                        <label for="edit-admin" style="font-weight: 700; font-size: 0.85rem; cursor: pointer;">Administrador</label>
                    </div>
                    <div>
                        <label style="${lbl}">Plano de Membro</label>
                        <select id="edit-plan" class="input" style="${inp}">
                            <option value="">Selecione um plano...</option>
                            ${this.plans.map(p => `<option value="${p.id}" ${member.plan_id === p.id ? 'selected' : ''}>${p.name} (${p.payment_type})</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="${lbl}">Dia de Vencimento</label>
                        <input type="number" id="edit-due-date" class="input" style="${inp}" min="1" max="31" value="${member.payment_due_date || 10}">
                    </div>
                </div>
                <div style="background: var(--bg-elevated); padding: 1rem; border-radius: 8px; border: 1px solid var(--border); margin-top: 1rem;">
                    <h5 style="${lbl} margin-bottom: 0.75rem;">Histórico de Graduação</h5>
                    <div id="edit-grad-history" style="max-height: 200px; overflow-y: auto; padding-right: 0.5rem;">
                        <div class="spinner-small"></div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button type="button" class="btn-secondary btn-full" style="height: 46px; min-width: auto;" onclick="window.App.closeModal()">CANCELAR</button>
                    <button type="submit" class="btn btn-primary btn-full" style="height: 46px; min-width: auto; background: var(--inverse-bg); color: var(--inverse-text);">SALVAR</button>
                </div>
            </form>
        `;

        this.app.showModal('Editar Membro', content, 'modal-large');
        if (window.lucide) window.lucide.createIcons();

        // Load graduation history asynchronously
        this.app.academy.getGraduationHistory(memberId).then(history => {
            const container = document.getElementById('edit-grad-history');
            if (!container) return;
            if (history.length === 0) {
                container.innerHTML = '<p style="font-size: 0.8rem; color: var(--text-dim);">Nenhuma graduação registrada.</p>';
                return;
            }
            container.innerHTML = history.map(log => `
                <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <span style="font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">
                            ${(log.belt || 'white belt').toUpperCase()}
                        </span>
                        <p style="font-size: 0.8rem; margin-top: 0.25rem;">${log.notes || '-'}</p>
                    </div>
                    <span style="font-size: 0.7rem; color: var(--text-dim);">${new Date(log.promoted_at).toLocaleDateString()}</span>
                </div>
            `).join('');
        });

        // Bind CPF mask and validation on the edit form
        this._bindCpfField('edit-cpf');

        document.getElementById('edit-member-form').onsubmit = async (e) => {
            e.preventDefault();

            const cpfVal = document.getElementById('edit-cpf').value;
            if (!this._validateCPF(cpfVal)) {
                alert('CPF inválido! Por favor, verifique o número digitado.');
                document.getElementById('edit-cpf').focus();
                return;
            }

            const updates = {
                full_name: document.getElementById('edit-name').value,
                email: document.getElementById('edit-email').value,
                cpf: cpfVal,
                phone: document.getElementById('edit-phone').value,
                current_belt: document.getElementById('edit-belt').value,
                current_stripes: parseInt(document.getElementById('edit-stripes').value),
                role: document.getElementById('edit-role').value,
                is_admin: document.getElementById('edit-admin').checked,
                plan_id: document.getElementById('edit-plan').value || null,
                payment_due_date: parseInt(document.getElementById('edit-due-date').value) || null,
                birth_date: document.getElementById('edit-birth-date').value || null
            };

            const res = await this.app.academy.updateMember(memberId, updates);
            if (res.success) {
                this.app.closeModal();
                this.app.router.handleRouteChange(window.location.hash);
            } else {
                alert('Erro ao salvar: ' + res.error);
            }
        };
    }

    afterRender() {
        if (window.lucide) window.lucide.createIcons();

        // Column Filter Toggle Logic
        document.querySelectorAll('.th-filter').forEach(th => {
            th.onclick = (e) => {
                e.stopPropagation();
                const input = th.parentElement.querySelector('.column-filter-input');
                const col = th.dataset.col;
                
                // Close other filters
                document.querySelectorAll('.column-filter-input').forEach(inp => {
                    if (inp !== input) inp.classList.remove('active');
                });
                
                input.classList.toggle('active');
                if (input.classList.contains('active')) input.focus();
            };
        });

        // Column Filter Input Logic
        document.querySelectorAll('.column-filter-input').forEach(input => {
            input.onclick = (e) => e.stopPropagation();
            input.oninput = (e) => {
                const col = input.dataset.col;
                this.filters[col] = e.target.value.toLowerCase();
                this.applyFilters();
            };
        });

        // Delete Button Logic
        document.querySelectorAll('.btn-delete-member').forEach(btn => {
            btn.onclick = async () => {
                const memberId = btn.dataset.id;
                const memberName = btn.dataset.name;
                
                if (confirm(`Tem certeza que deseja excluir permanentemente o membro "${memberName}"?\nEsta ação não poderá ser desfeita.`)) {
                    const res = await this.app.academy.deleteMember(memberId);
                    if (res.success) {
                        this.app.router.handleRouteChange(window.location.hash);
                    } else {
                        alert('Erro ao excluir membro: ' + res.error);
                    }
                }
            };
        });

        // Theme Toggle
        document.getElementById('theme-toggle').onclick = () => {
            this.app.toggleTheme();
            this.app.router.handleRouteChange(window.location.hash);
        };

        // Logout
        document.getElementById('logout-btn').onclick = () => this.app.auth.logout();

        // Add Member Button
        const addMemberBtn = document.getElementById('btn-add-member');
        if (addMemberBtn) {
            addMemberBtn.onclick = () => this.showAddMemberModal();
        }
    }

    applyFilters() {
        const rows = document.querySelectorAll('.grid-row');
        rows.forEach(row => {
            let visible = true;
            Object.keys(this.filters).forEach(col => {
                const query = this.filters[col];
                if (!query) return;

                let cellText = '';
                // Map columns to cell content
                if (col === 'membro') cellText = row.querySelector('p').innerText;
                else if (col === 'email') cellText = row.cells[1].innerText;
                else if (col === 'cpf') cellText = row.cells[2].innerText;
                else if (col === 'telefone') cellText = row.cells[3].innerText;
                else if (col === 'faixa') cellText = row.cells[4].innerText;
                else if (col === 'graus') cellText = row.cells[5].innerText;
                else if (col === 'cargo') cellText = row.cells[6].innerText;
                else if (col === 'admin') cellText = row.cells[7].innerText;
                else if (col === 'plano') cellText = row.cells[8].innerText;

                if (!cellText.toLowerCase().includes(query)) {
                    visible = false;
                }
            });
            row.style.display = visible ? '' : 'none';
        });
    }

    showAddMemberModal() {
        const allBelts = [
            'white belt', 'grey white belt', 'grey belt', 'grey black belt',
            'yellow white belt', 'yellow belt', 'yellow black belt',
            'orange white belt', 'orange belt', 'orange black belt',
            'green white belt', 'green belt', 'green black belt',
            'blue belt', 'purple belt', 'brown belt', 'black belt'
        ];

        const lbl = 'font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; color: var(--text-dim); margin-bottom: 0.5rem; display: block;';
        const inp = 'height: 48px; font-size: 0.9rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px;';

        const content = `
            <form id="add-member-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.25rem;">
                    <div style="grid-column: span 2;">
                        <label style="${lbl}">Nome Completo *</label>
                        <input type="text" id="new-name" class="input" style="${inp}" placeholder="Ex: Jean Jacques Machado" required>
                    </div>
                    <div>
                        <label style="${lbl}">E-mail *</label>
                        <input type="email" id="new-email" class="input" style="${inp}" placeholder="email@exemplo.com" required>
                    </div>
                    <div>
                        <label style="${lbl}">CPF *</label>
                        <input type="text" id="new-cpf" class="input" style="${inp}" placeholder="000.000.000-00" required>
                    </div>
                    <div>
                        <label style="${lbl}">Data de Nascimento</label>
                        <input type="date" id="new-birth-date" class="input" style="${inp}">
                    </div>
                    <div>
                        <label style="${lbl}">Telefone</label>
                        <input type="tel" id="new-phone" class="input" style="${inp}" placeholder="(00) 00000-0000">
                    </div>
                    <div>
                        <label style="${lbl}">Senha Inicial *</label>
                        <input type="password" id="new-password" class="input" style="${inp}" placeholder="Mín. 6 caracteres" minlength="6" required>
                    </div>

                    <div>
                        <label style="${lbl}">Faixa</label>
                        <select id="new-belt" class="input" style="${inp}">
                            ${allBelts.map(b => `<option value="${b}">${b.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="${lbl}">Cargo</label>
                        <select id="new-role" class="input" style="${inp}">
                            <option value="student">Aluno</option>
                            <option value="professor">Professor</option>
                        </select>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem; background: var(--bg-elevated); padding: 0 1rem; border-radius: 8px; border: 1px solid var(--border); height: 48px;">
                        <input type="checkbox" id="new-admin" style="width: 18px; height: 18px; accent-color: var(--primary);">
                        <label for="new-admin" style="font-weight: 700; font-size: 0.85rem; cursor: pointer;">Administrador</label>
                    </div>
                </div>

                <div id="add-member-error" style="display: none; padding: 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; color: #ef4444; font-weight: 600; font-size: 0.85rem;"></div>

                <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                    <button type="button" class="btn-secondary btn-full" style="height: 46px; min-width: auto;" onclick="window.App.closeModal()">CANCELAR</button>
                    <button type="submit" id="btn-submit-member" class="btn btn-primary btn-full" style="height: 46px; min-width: auto; background: var(--inverse-bg); color: var(--inverse-text);">CRIAR</button>
                </div>
            </form>
        `;
        
        this.app.showModal('Novo Membro', content, 'modal-large');

        // Bind CPF mask and validation on the new member form
        this._bindCpfField('new-cpf');
        
        document.getElementById('add-member-form').onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('btn-submit-member');
            const errorDiv = document.getElementById('add-member-error');
            errorDiv.style.display = 'none';

            const cpfVal = document.getElementById('new-cpf').value;
            if (!this._validateCPF(cpfVal)) {
                errorDiv.textContent = '❌ CPF inválido! Por favor, verifique o número digitado.';
                errorDiv.style.display = 'block';
                document.getElementById('new-cpf').focus();
                return;
            }
            
            submitBtn.innerHTML = '<div class="spinner-small" style="border-top-color: white;"></div>';
            submitBtn.style.pointerEvents = 'none';

            const data = {
                full_name: document.getElementById('new-name').value,
                email: document.getElementById('new-email').value,
                cpf: cpfVal,
                phone: document.getElementById('new-phone').value,
                password: document.getElementById('new-password').value,
                academy_id: this.user.academy_id,
                current_belt: document.getElementById('new-belt').value,
                role: document.getElementById('new-role').value,
                is_admin: document.getElementById('new-admin').checked,
                birth_date: document.getElementById('new-birth-date').value || null
            };

            const res = await this.app.academy.createNewMember(data);
            if (res.success) {
                this.app.closeModal();
                this.app.router.handleRouteChange(window.location.hash);
            } else {
                errorDiv.textContent = '❌ ' + res.error;
                errorDiv.style.display = 'block';
                submitBtn.innerHTML = 'CRIAR MEMBRO';
                submitBtn.style.pointerEvents = 'auto';
            }
        };
    }

    // --- CPF Helpers ---
    _maskCPF(value) {
        return value
            .replace(/\D/g, '')
            .slice(0, 11)
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    _validateCPF(cpf) {
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
    }

    _bindCpfField(inputId) {
        const el = document.getElementById(inputId);
        if (!el) return;
        el.maxLength = 14;
        el.placeholder = '000.000.000-00';
        el.addEventListener('input', (e) => {
            e.target.value = this._maskCPF(e.target.value);
        });
        el.addEventListener('blur', (e) => {
            const val = e.target.value;
            if (val && !this._validateCPF(val)) {
                el.style.borderColor = '#ef4444';
                el.setCustomValidity('CPF inválido');
                el.reportValidity();
            } else {
                el.style.borderColor = '';
                el.setCustomValidity('');
            }
        });
    }
}
