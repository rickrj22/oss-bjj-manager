export class InstructorsPage {
    constructor(app) {
        this.app = app;
    }

    async render() {
        this.user = await this.app.auth.getUser();
        const theme = this.app.currentTheme;

        const [instructors, sidebarAcad] = await Promise.all([
            this.app.academy.getInstructors(),
            this.app.academy.getSidebarData()
        ]);

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
                        <a href="#instrutores" class="nav-item active animate-in stagger-1">
                            <i data-lucide="graduation-cap" size="18"></i> 
                            <span>Instrutores</span>
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
                    <header class="mb-12 animate-in">
                        <h1 class="font-heading font-xl">Instrutores</h1>
                        <p class="text-graphite">Conheça os responsáveis pela evolução técnica da nossa academia.</p>
                    </header>

                    <div class="instructors-grid animate-in stagger-2">
                        ${instructors
                            .sort((a, b) => this.getRankWeight(b) - this.getRankWeight(a))
                            .map(instructor => `
                            <div class="instructor-card">
                                <img src="${instructor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.full_name)}&background=random&size=512`}" 
                                     alt="${instructor.full_name}" 
                                     class="instructor-img">
                                <div class="instructor-overlay"></div>
                                <div class="instructor-info">
                                    <h3 class="instructor-name">${instructor.full_name}</h3>
                                    <div class="instructor-belt-info">
                                        <span class="instructor-belt">${(instructor.current_belt || 'black belt').toUpperCase()}</span>
                                        ${instructor.current_stripes ? `<span class="instructor-stripes">${instructor.current_stripes}º GRAU</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        ${instructors.length === 0 ? `
                            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; background: var(--bg-surface); border-radius: 12px; border: 1px dashed var(--border);">
                                <i data-lucide="users" size="48" class="text-dim mb-4" style="opacity: 0.3;"></i>
                                <p class="text-dim">Nenhum instrutor cadastrado no momento.</p>
                            </div>
                        ` : ''}
                    </div>
                </main>

                <!-- Bottom Navigation (Mobile Only) -->
                <nav class="bottom-nav">
                    ${this.user.is_admin ? `
                        <a href="#dashboard" class="bottom-nav-item">
                            <i data-lucide="layout-dashboard"></i>
                            <span>Início</span>
                        </a>
                    ` : ''}
                    <a href="#aulas" class="bottom-nav-item">
                        <i data-lucide="calendar"></i>
                        <span>Aulas</span>
                    </a>
                    <a href="#instrutores" class="bottom-nav-item active">
                        <i data-lucide="graduation-cap"></i>
                        <span>Professores</span>
                    </a>
                    <a href="#perfil" class="bottom-nav-item">
                        <i data-lucide="user"></i>
                        <span>Perfil</span>
                    </a>
                </nav>

                <div class="hide-mobile" style="position: fixed; bottom: 1rem; right: 1.5rem; font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; pointer-events: none; opacity: 0.5;">
                    OSS BJJ Manager • v1.0
                </div>
            </div>

            <style>
                .instructors-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1px; /* Artofjiujitsu style gap */
                    background: var(--border);
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .instructor-card {
                    position: relative;
                    height: 500px;
                    overflow: hidden;
                    cursor: pointer;
                    background: #000;
                }

                .instructor-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.8s cubic-bezier(0.2, 1, 0.3, 1), opacity 0.5s ease;
                    opacity: 0.85;
                }

                .instructor-card:hover .instructor-img {
                    transform: scale(1.05);
                    opacity: 1;
                }

                .instructor-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%);
                    transition: opacity 0.3s ease;
                }

                .instructor-info {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 2rem;
                    text-align: center;
                    z-index: 2;
                }

                .instructor-name {
                    font-family: var(--font-heading);
                    font-size: 1.75rem;
                    color: #fff;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 0.5rem;
                    font-weight: 900;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                    transition: transform 0.5s cubic-bezier(0.2, 1, 0.3, 1);
                }

                .instructor-card:hover .instructor-name {
                    transform: translateY(-5px);
                }

                .instructor-belt-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    opacity: 0.8;
                    transition: all 0.5s ease;
                }

                .instructor-card:hover .instructor-belt-info {
                    opacity: 1;
                    transform: translateY(-5px);
                }

                .instructor-belt {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: 0.2em;
                }

                .instructor-stripes {
                    font-size: 0.65rem;
                    color: var(--primary);
                    font-weight: 900;
                    letter-spacing: 0.15em;
                }

                @media (max-width: 768px) {
                    .instructors-grid {
                        grid-template-columns: 1fr;
                    }
                    .instructor-card {
                        height: 400px;
                    }
                }
            </style>
        `;
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

    getRankWeight(data) {
        const belt = (data.current_belt || data.belt || 'white belt').toLowerCase();
        const stripes = Number(data.current_stripes || data.stripes || 0);
        
        const beltOrder = [
            'white belt',
            'grey white belt', 'grey belt', 'grey black belt',
            'yellow white belt', 'yellow belt', 'yellow black belt',
            'orange white belt', 'orange belt', 'orange black belt',
            'green white belt', 'green belt', 'green black belt',
            'blue belt', 'purple belt', 'brown belt', 'black belt'
        ];
        
        const beltWeight = beltOrder.indexOf(belt);
        return (beltWeight * 10) + stripes;
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

        if (window.lucide) window.lucide.createIcons();
    }
}
