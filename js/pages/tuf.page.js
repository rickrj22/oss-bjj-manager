export class TUFPage {
    constructor(app) {
        this.app = app;
        this.tournament = null; // Current active tournament
    }

    async render() {
        this.user = await this.app.auth.getUser();
        const theme = this.app.currentTheme;

        const sidebarAcad = await this.app.academy.getSidebarData();
        this.sidebarAcad = sidebarAcad || this.user.academy || {};

        return `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap');
            </style>
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
                            <a href="#dashboard" class="nav-item">
                                <i data-lucide="layout-dashboard" size="18"></i> 
                                <span>Dashboard</span>
                            </a>
                        ` : ''}
                        ${this.user.role === 'professor' || this.user.is_admin ? `
                            <a href="#membros" class="nav-item">
                                <i data-lucide="users" size="18"></i> 
                                <span>Membros</span>
                            </a>
                        ` : ''}
                        <a href="#aulas" class="nav-item">
                            <i data-lucide="calendar" size="18"></i> 
                            <span>Minhas Aulas</span>
                        </a>
                        ${this.user.is_admin ? `
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
                        <a href="#tuf" class="nav-item active">
                            <i data-lucide="swords" size="18"></i> 
                            <span>TUF</span>
                        </a>
                    </nav>

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
                            <span>Sair</span>
                        </button>
                    </div>
                </aside>

                <main class="main-content">
                    <header class="flex-between mb-12 animate-in" style="align-items: flex-start;">
                        <div>
                            <h1 class="font-heading font-xl">TUF Tournament</h1>
                            <p class="text-graphite">Chaveamento de lutas e gestão de competições internas.</p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <div class="hide-mobile">
                                ${this.app.renderLanguageAndThemeControls()}
                            </div>
                            ${this.user.is_admin || this.user.role === 'professor' ? `
                                <button class="btn btn-primary" id="btn-new-tuf" style="height: 48px; gap: 0.75rem; background: var(--inverse-bg); color: var(--inverse-text); border: none; font-weight: 700; border-radius: 8px;">
                                    <i data-lucide="plus-circle" size="20"></i> NOVO EVENTO
                                </button>
                            ` : ''}
                        </div>
                    </header>

                    <div id="tuf-container" class="animate-in stagger-2">
                        <div style="text-align: center; padding: 6rem 2rem; background: var(--bg-surface); border-radius: 24px; border: 2px dashed var(--border);">
                            <div style="width: 80px; height: 80px; background: var(--bg-elevated); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                                <i data-lucide="loader-2" size="40" class="text-dim animate-spin" style="opacity: 0.5;"></i>
                            </div>
                            <h3 class="font-heading" style="font-size: 1.5rem; margin-bottom: 0.5rem;">Carregando...</h3>
                        </div>
                    </div>
                </main>

                <!-- Bottom Navigation (Mobile Only) -->
                <nav class="bottom-nav">
                    <a href="#dashboard" class="bottom-nav-item">
                        <i data-lucide="layout-dashboard"></i>
                        <span>Início</span>
                    </a>
                    <a href="#tuf" class="bottom-nav-item active">
                        <i data-lucide="swords"></i>
                        <span>TUF</span>
                    </a>
                    <a href="#perfil" class="bottom-nav-item">
                        <i data-lucide="user"></i>
                        <span>Perfil</span>
                    </a>
                </nav>
            </div>
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

    async afterRender() {
        if (window.lucide) window.lucide.createIcons();

        const btnNewTuf = document.getElementById('btn-new-tuf');
        if (btnNewTuf) {
            btnNewTuf.onclick = () => this.showNewTournamentModal();
        }

        document.getElementById('logout-btn').onclick = () => this.app.auth.logout();
        
        const themeToggle = document.getElementById('theme-toggle-global');
        if (themeToggle) {
            themeToggle.onclick = () => {
                this.app.toggleTheme();
                this.app.router.handleRouteChange(window.location.hash);
            };
        }

        await this.loadActiveTournament();
    }

    async loadActiveTournament() {
        try {
            const { data: tournaments, error } = await this.app.academy.client
                .from('tournaments')
                .select('*')
                .eq('academy_id', this.sidebarAcad.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (tournaments && tournaments.length > 0) {
                const t = tournaments[0];
                this.tournament = {
                    id: t.id,
                    name: t.name,
                    participants: t.participants,
                    matches: t.participants.matches || []
                };
                this.renderTournament();
            } else {
                this.renderEmptyState();
            }
        } catch (e) {
            console.error('Error loading tournament:', e);
            this.renderEmptyState();
        }
    }

    renderEmptyState() {
        const container = document.getElementById('tuf-container');
        if (!container) return;
        container.innerHTML = `
            <div style="text-align: center; padding: 6rem 2rem; background: var(--bg-surface); border-radius: 24px; border: 2px dashed var(--border);">
                <div style="width: 80px; height: 80px; background: var(--bg-elevated); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                    <i data-lucide="swords" size="40" class="text-dim" style="opacity: 0.5;"></i>
                </div>
                <h3 class="font-heading" style="font-size: 1.5rem; margin-bottom: 0.5rem;">Nenhum TUF Ativo</h3>
                <p class="text-dim" style="max-width: 400px; margin: 0 auto 2rem;">Inicie um novo evento para começar a gerenciar as lutas da academia.</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }

    async showNewTournamentModal() {
        const members = await this.app.academy.getAcademyMembers();
        let availableMembers = [...members].filter(m => m.is_active);
        let selectedForMatch = [];
        let createdMatches = [];

        const renderModal = () => {
            const content = `
                <div class="tuf-creation-layout">
                    <div class="tuf-creation-sidebar">
                        <div class="form-group mb-6">
                            <label class="tuf-label">NOME DO EVENTO</label>
                            <input type="text" id="tuf-name-input" class="tuf-input" placeholder="Ex: TUF #01" value="${this.lastTournamentName || ''}">
                        </div>

                        <label class="tuf-label">ATLETAS DISPONÍVEIS (${availableMembers.length})</label>
                        <div class="tuf-members-list">
                            ${availableMembers.map(m => `
                                <div class="tuf-member-card ${selectedForMatch.find(s => s.id === m.id) ? 'selected' : ''}" 
                                     onclick="window.App.currentPage.toggleAthleteSelection('${m.id}')">
                                    ${this.renderAvatarWithStripes(m, 32)}
                                    <div class="info">
                                        <p class="name">${m.full_name}</p>
                                        <p class="meta">${(m.current_belt || 'white belt').toUpperCase()}</p>
                                    </div>
                                    ${selectedForMatch.find(s => s.id === m.id) ? '<i data-lucide="check-circle" class="check-icon"></i>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="tuf-creation-main">
                        <label class="tuf-label">LUTAS CASADAS (${createdMatches.length})</label>
                        <div class="tuf-matches-builder">
                            ${createdMatches.length === 0 ? `
                                <div class="empty-builder">
                                    <i data-lucide="swords" size="32"></i>
                                    <p>Selecione 2 atletas ao lado para criar uma luta.</p>
                                </div>
                            ` : createdMatches.map((match, idx) => `
                                <div class="builder-match-card">
                                    <div class="match-idx">LUTA ${idx + 1}</div>
                                    <div class="match-pair">
                                        <div class="athlete">
                                            ${this.renderAvatarWithStripes(match.p1, 32)}
                                            <span>${match.p1.full_name}</span>
                                        </div>
                                        <div class="vs">VS</div>
                                        <div class="athlete">
                                            ${this.renderAvatarWithStripes(match.p2, 32)}
                                            <span>${match.p2.full_name}</span>
                                        </div>
                                    </div>
                                    <button class="btn-remove-match" onclick="window.App.currentPage.removeCreatedMatch(${idx})">
                                        <i data-lucide="trash-2" size="16"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>

                        <div class="tuf-modal-actions mt-8">
                            <button class="tuf-btn btn-secondary" onclick="window.App.closeModal()">CANCELAR</button>
                            <button class="tuf-btn btn-primary" id="btn-save-tuf">INICIAR EVENTO</button>
                        </div>
                    </div>
                </div>

                <style>
                    .tuf-creation-layout {
                        display: grid;
                        grid-template-columns: 350px 1fr;
                        gap: 2rem;
                        height: 70vh;
                        padding: 0.5rem;
                    }

                    .tuf-creation-sidebar {
                        display: flex;
                        flex-direction: column;
                        border-right: 1px solid var(--border);
                        padding-right: 1.5rem;
                        overflow: hidden;
                    }

                    .tuf-members-list {
                        flex: 1;
                        overflow-y: auto;
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                        padding-right: 0.5rem;
                    }

                    .tuf-member-card {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        padding: 0.75rem;
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                        position: relative;
                        background: var(--bg-surface);
                    }

                    .tuf-member-card:hover {
                        border-color: var(--primary);
                        background: var(--bg-elevated);
                    }

                    .tuf-member-card.selected {
                        border-color: var(--primary);
                        background: rgba(34, 91, 255, 0.1);
                    }

                    .tuf-member-card .info .name {
                        font-size: 0.85rem;
                        font-weight: 700;
                    }

                    .tuf-member-card .info .meta {
                        font-size: 0.65rem;
                        color: var(--text-dim);
                        font-weight: 800;
                    }

                    .check-icon {
                        position: absolute;
                        right: 1rem;
                        color: var(--primary);
                        width: 18px;
                    }

                    .tuf-creation-main {
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    }

                    .tuf-matches-builder {
                        flex: 1;
                        overflow-y: auto;
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        padding-right: 0.5rem;
                        background: var(--bg-elevated);
                        border-radius: 16px;
                        padding: 1.5rem;
                        border: 1px dashed var(--border);
                    }

                    .empty-builder {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        color: var(--text-dim);
                        gap: 1rem;
                        text-align: center;
                    }

                    .builder-match-card {
                        background: var(--bg-surface);
                        border: 1px solid var(--border);
                        border-radius: 16px;
                        padding: 1rem;
                        display: flex;
                        align-items: center;
                        gap: 1.5rem;
                        position: relative;
                        box-shadow: var(--shadow-sm);
                    }

                    .match-idx {
                        font-size: 0.65rem;
                        font-weight: 900;
                        background: var(--inverse-bg);
                        color: var(--inverse-text);
                        padding: 0.25rem 0.5rem;
                        border-radius: 4px;
                        transform: rotate(-90deg);
                        margin-left: -1rem;
                    }

                    .match-pair {
                        display: flex;
                        align-items: center;
                        gap: 1.5rem;
                        flex: 1;
                        justify-content: center;
                    }

                    .athlete {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 0.5rem;
                        width: 120px;
                        text-align: center;
                    }

                    .athlete span {
                        font-size: 0.75rem;
                        font-weight: 700;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        width: 100%;
                    }

                    .vs {
                        font-family: 'Black Ops One', cursive, sans-serif;
                        font-style: italic;
                        font-weight: 900;
                        color: var(--primary);
                        font-size: 1.2rem;
                        opacity: 0.5;
                    }

                    .btn-remove-match {
                        background: none;
                        border: none;
                        color: var(--text-dim);
                        cursor: pointer;
                        padding: 0.5rem;
                        transition: color 0.2s;
                    }

                    .btn-remove-match:hover {
                        color: #ff4444;
                    }

                    .tuf-label {
                        font-size: 0.7rem;
                        text-transform: uppercase;
                        letter-spacing: 0.2em;
                        font-weight: 900;
                        color: var(--text-dim);
                        margin-bottom: 1rem;
                        display: block;
                    }

                    .tuf-input {
                        width: 100%;
                        height: 48px;
                        background: var(--bg-surface);
                        border: 1px solid var(--border);
                        border-radius: 8px;
                        padding: 0 1rem;
                        font-size: 0.9rem;
                        color: var(--text-primary);
                    }

                    .tuf-modal-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 1rem;
                    }

                    .tuf-btn {
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        cursor: pointer;
                        border: none;
                    }

                    .btn-primary {
                        background: var(--inverse-bg);
                        color: var(--inverse-text);
                    }

                    .btn-secondary {
                        background: var(--bg-elevated);
                        color: var(--text-primary);
                    }

                    @media (max-width: 900px) {
                        .tuf-creation-layout {
                            grid-template-columns: 1fr;
                            height: auto;
                        }
                        .tuf-creation-sidebar {
                            border-right: none;
                            border-bottom: 1px solid var(--border);
                            padding-right: 0;
                            padding-bottom: 2rem;
                        }
                    }
                </style>
            `;

            this.app.showModal('Organizar Lutas Casadas', content, 'modal-large');
            if (window.lucide) window.lucide.createIcons();

            // Store methods globally for the modal
            this.toggleAthleteSelection = (id) => {
                const athlete = availableMembers.find(m => m.id === id);
                if (!athlete) return;

                if (selectedForMatch.find(s => s.id === id)) {
                    selectedForMatch = selectedForMatch.filter(s => s.id !== id);
                } else {
                    if (selectedForMatch.length < 2) {
                        selectedForMatch.push(athlete);
                    }
                }

                if (selectedForMatch.length === 2) {
                    const p1 = selectedForMatch[0];
                    const p2 = selectedForMatch[1];
                    createdMatches.push({
                        id: `match-${Date.now()}`,
                        p1,
                        p2,
                        winner: null
                    });
                    // Remove from available
                    availableMembers = availableMembers.filter(m => m.id !== p1.id && m.id !== p2.id);
                    selectedForMatch = [];
                }
                
                this.lastTournamentName = document.getElementById('tuf-name-input')?.value || '';
                renderModal();
            };

            this.removeCreatedMatch = (idx) => {
                const match = createdMatches[idx];
                availableMembers.push(match.p1, match.p2);
                availableMembers.sort((a, b) => a.full_name.localeCompare(b.full_name));
                createdMatches.splice(idx, 1);
                this.lastTournamentName = document.getElementById('tuf-name-input')?.value || '';
                renderModal();
            };

            const btnSave = document.getElementById('btn-save-tuf');
            if (btnSave) {
                btnSave.onclick = async () => {
                    const name = document.getElementById('tuf-name-input').value;
                    if (!name) return alert('Dê um nome ao evento.');
                    if (createdMatches.length === 0) return alert('Crie pelo menos uma luta.');

                    btnSave.disabled = true;
                    btnSave.innerText = 'INICIANDO...';

                    // Prepare participants data (including matches)
                    const participants = {
                        all: members.filter(m => createdMatches.some(match => match.p1.id === m.id || match.p2.id === m.id)),
                        matches: createdMatches
                    };

                    const res = await this.app.academy.saveTournament(name, participants, this.user.id);
                    if (res.success) {
                        // Increment participations for all involved athletes
                        const athleteIds = participants.all.map(a => a.id);
                        await this.app.academy.incrementTufParticipations(athleteIds);
                        
                        this.app.closeModal();
                        await this.loadActiveTournament();
                    } else {
                        alert(res.error);
                        btnSave.disabled = false;
                        btnSave.innerText = 'INICIAR EVENTO';
                    }
                };
            }
        };

        renderModal();
    }

    async setWinner(matchId, participantNum) {
        if (!this.tournament) return;
        
        const match = this.tournament.matches.find(m => m.id === matchId);
        if (!match) return;

        const winner = participantNum === 1 ? match.p1 : match.p2;
        const loser = participantNum === 1 ? match.p2 : match.p1;
        
        match.winner = winner;

        // Update in DB
        const { error } = await this.app.academy.client
            .from('tournaments')
            .update({ 
                participants: { 
                    ...this.tournament.participants,
                    matches: this.tournament.matches 
                } 
            })
            .eq('id', this.tournament.id);

        if (error) {
            alert('Erro ao salvar vencedor: ' + error.message);
            return;
        }

        // Stats
        this.app.academy.incrementTufMatches([winner.id, loser.id]);
        this.app.academy.incrementTufChampionships(winner.id);

        this.renderTournament();
        this.fireConfetti();
    }

    renderTournament() {
        const container = document.getElementById('tuf-container');
        if (!container || !this.tournament) return;

        container.innerHTML = `
            <div class="card" style="padding: 2.5rem; border-radius: 24px; background: var(--bg-surface); border: 1px solid var(--border); box-shadow: var(--shadow-lg);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3rem;">
                    <div>
                        <h2 class="font-heading" style="font-size: 2.5rem; letter-spacing: -0.04em; margin-bottom: 0.5rem; text-transform: uppercase;">${this.tournament.name}</h2>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span class="badge" style="background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: 800; font-size: 0.7rem;">LUTAS CASADAS</span>
                            <p style="color: var(--text-dim); font-size: 0.9rem;">Defina os vencedores para encerrar os confrontos.</p>
                        </div>
                    </div>
                    <button class="btn-reset" onclick="window.App.currentPage.resetTuf()">
                        <i data-lucide="rotate-ccw" size="14"></i> NOVO EVENTO
                    </button>
                </div>

                <div class="tuf-matches-grid">
                    ${this.tournament.matches.map((match, idx) => `
                        <div class="tuf-match-card ${match.winner ? 'completed' : ''}">
                            <div class="match-header">
                                <span class="match-number">#${idx + 1}</span>
                                ${match.winner ? '<span class="status-done">FINALIZADA</span>' : '<span class="status-live">EM ANDAMENTO</span>'}
                            </div>
                            
                            <div class="match-body">
                                <div class="athlete-slot ${match.winner && match.winner.id === match.p1.id ? 'winner' : (match.winner ? 'loser' : '')}">
                                    ${this.renderAvatarWithStripes(match.p1, 64)}
                                    <div class="athlete-info">
                                        <p class="name">${match.p1.full_name}</p>
                                        <p class="belt">${(match.p1.current_belt || 'white belt').toUpperCase()}</p>
                                    </div>
                                    ${!match.winner && (this.user.is_admin || this.user.role === 'professor') ? `
                                        <button class="btn-declare-winner" onclick="window.App.currentPage.setWinner('${match.id}', 1)">VENCEU</button>
                                    ` : ''}
                                    ${match.winner && match.winner.id === match.p1.id ? '<i data-lucide="trophy" class="win-trophy"></i>' : ''}
                                </div>

                                <div class="vs-divider">VS</div>

                                <div class="athlete-slot ${match.winner && match.winner.id === match.p2.id ? 'winner' : (match.winner ? 'loser' : '')}">
                                    ${this.renderAvatarWithStripes(match.p2, 64)}
                                    <div class="athlete-info">
                                        <p class="name">${match.p2.full_name}</p>
                                        <p class="belt">${(match.p2.current_belt || 'white belt').toUpperCase()}</p>
                                    </div>
                                    ${!match.winner && (this.user.is_admin || this.user.role === 'professor') ? `
                                        <button class="btn-declare-winner" onclick="window.App.currentPage.setWinner('${match.id}', 2)">VENCEU</button>
                                    ` : ''}
                                    ${match.winner && match.winner.id === match.p2.id ? '<i data-lucide="trophy" class="win-trophy"></i>' : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <style>
                .tuf-matches-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 2rem;
                }

                .tuf-match-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .tuf-match-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-xl);
                    border-color: var(--primary);
                }

                .tuf-match-card.completed {
                    opacity: 0.9;
                    background: var(--bg-elevated);
                }

                .match-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .match-number {
                    font-family: 'Black Ops One', cursive;
                    font-size: 1.2rem;
                    color: var(--primary);
                    opacity: 0.3;
                }

                .status-live {
                    font-size: 0.65rem;
                    font-weight: 900;
                    color: #22c55e;
                    background: rgba(34, 197, 94, 0.1);
                    padding: 0.25rem 0.75rem;
                    border-radius: 100px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-live::before {
                    content: '';
                    width: 6px;
                    height: 6px;
                    background: #22c55e;
                    border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .status-done {
                    font-size: 0.65rem;
                    font-weight: 900;
                    color: var(--text-dim);
                    background: var(--border);
                    padding: 0.25rem 0.75rem;
                    border-radius: 100px;
                }

                .match-body {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    gap: 1rem;
                }

                .athlete-slot {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    text-align: center;
                    padding: 1rem;
                    border-radius: 16px;
                    transition: all 0.2s;
                    position: relative;
                }

                .athlete-slot.winner {
                    background: rgba(34, 197, 94, 0.05);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }

                .athlete-slot.loser {
                    opacity: 0.4;
                    filter: grayscale(1);
                }

                .athlete-info .name {
                    font-weight: 800;
                    font-size: 0.95rem;
                    margin-bottom: 0.25rem;
                }

                .athlete-info .belt {
                    font-size: 0.6rem;
                    font-weight: 900;
                    color: var(--text-dim);
                    letter-spacing: 0.05em;
                }

                .vs-divider {
                    font-family: 'Black Ops One', cursive;
                    font-size: 1.5rem;
                    color: var(--primary);
                    opacity: 0.15;
                    font-style: italic;
                }

                .btn-declare-winner {
                    background: var(--inverse-bg);
                    color: var(--inverse-text);
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-transform: uppercase;
                }

                .btn-declare-winner:hover {
                    background: var(--primary);
                    transform: scale(1.05);
                }

                .win-trophy {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    color: #fbbf24;
                    width: 20px;
                }

                .btn-reset {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-reset:hover {
                    background: var(--bg-elevated);
                    color: #ef4444;
                }

                @media (max-width: 600px) {
                    .tuf-matches-grid {
                        grid-template-columns: 1fr;
                    }
                    .match-body {
                        grid-template-columns: 1fr;
                    }
                    .vs-divider {
                        transform: rotate(90deg);
                        margin: 0.5rem 0;
                    }
                }
            </style>
        `;
        if (window.lucide) window.lucide.createIcons();
    }

    async resetTuf() {
        if (!confirm('Tem certeza que deseja encerrar este TUF e criar um novo?')) return;
        
        if (this.tournament && this.tournament.id) {
            await this.app.academy.client
                .from('tournaments')
                .update({ status: 'completed' })
                .eq('id', this.tournament.id);
        }

        this.tournament = null;
        this.showNewTournamentModal();
    }

    fireConfetti() {
        if (!window.confetti) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
            script.onload = () => this.executeConfetti();
            document.head.appendChild(script);
        } else {
            this.executeConfetti();
        }
    }

    executeConfetti() {
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
            window.confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FFD700', '#B8860B', '#000000']
            });
            window.confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FFD700', '#B8860B', '#000000']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }
}
