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
                    <header class="flex-between mb-12 animate-in">
                        <div>
                            <h1 class="font-heading font-xl">TUF Tournament</h1>
                            <p class="text-graphite">Chaveamento de lutas e gestão de competições internas.</p>
                        </div>
                        ${this.user.is_admin || this.user.role === 'professor' ? `
                            <button class="btn btn-primary" id="btn-new-tuf" style="height: 48px; gap: 0.75rem; background: var(--inverse-bg); color: var(--inverse-text); border: none; font-weight: 700; border-radius: 8px;">
                                <i data-lucide="plus-circle" size="20"></i> NOVO CHAVEAMENTO
                            </button>
                        ` : ''}
                    </header>

                    <div id="tuf-container" class="animate-in stagger-2">
                        <div style="text-align: center; padding: 6rem 2rem; background: var(--bg-surface); border-radius: 24px; border: 2px dashed var(--border);">
                            <div style="width: 80px; height: 80px; background: var(--bg-elevated); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                                <i data-lucide="swords" size="40" class="text-dim" style="opacity: 0.5;"></i>
                            </div>
                            <h3 class="font-heading" style="font-size: 1.5rem; margin-bottom: 0.5rem;">Nenhum TUF Ativo</h3>
                            <p class="text-dim" style="max-width: 400px; margin: 0 auto 2rem;">Inicie um novo chaveamento para começar a gerenciar as lutas da academia.</p>
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

            <style>
                .tuf-bracket-wrapper {
                    display: flex;
                    gap: 3rem;
                    padding: 2rem;
                    overflow-x: auto;
                    min-height: 600px;
                    align-items: center;
                }

                .round-column {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    gap: 2rem;
                    min-width: 280px;
                }

                .match-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                    transition: transform 0.2s;
                }

                .match-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .match-participant {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid var(--border);
                    position: relative;
                }

                .match-participant:last-child {
                    border-bottom: none;
                }

                .match-participant.winner {
                    background: rgba(34, 197, 94, 0.05);
                }

                .match-participant.winner::after {
                    content: '🏆';
                    position: absolute;
                    right: 1rem;
                    font-size: 0.8rem;
                }

                .participant-name {
                    font-size: 0.85rem;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .btn-winner {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.65rem;
                    font-weight: 800;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-left: auto;
                }

                .btn-winner:hover {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                .round-title {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    font-weight: 900;
                    color: var(--text-dim);
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .bracket-connector {
                    position: absolute;
                    border: 2px solid var(--border);
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
        if (window.lucide) window.lucide.createIcons();

        const btnNewTuf = document.getElementById('btn-new-tuf');
        if (btnNewTuf) {
            btnNewTuf.onclick = () => this.showNewTournamentModal();
        }

        document.getElementById('logout-btn').onclick = () => this.app.auth.logout();
        document.getElementById('theme-toggle').onclick = () => {
            this.app.toggleTheme();
            this.app.router.handleRouteChange(window.location.hash);
        };
    }

    async showNewTournamentModal() {
        const members = await this.app.academy.getAcademyMembers();
        
        const content = `
            <div class="tuf-modal-content">
                <div class="tuf-modal-scrollable">
                    <div class="form-group">
                        <label class="tuf-label">NOME DO TORNEIO</label>
                        <input type="text" id="tuf-name" class="tuf-input" placeholder="Ex: Copa Interna Verão 2024">
                    </div>

                    <div class="form-group">
                        <label class="tuf-label">SELECIONAR PARTICIPANTES</label>
                        <div class="tuf-participants-container">
                            <div class="tuf-participants-grid">
                                ${members.map(m => `
                                    <label class="tuf-participant-item">
                                        <div class="tuf-participant-check">
                                            <input type="checkbox" class="tuf-participant-checkbox" value="${m.id}" data-name="${m.full_name}" data-avatar="${m.avatar_url || ''}" data-belt="${m.current_belt || 'white belt'}" data-stripes="${m.current_stripes || 0}">
                                        </div>
                                        <div class="tuf-participant-avatar">
                                            ${this.renderAvatarWithStripes(m, 36)}
                                        </div>
                                        <div class="tuf-participant-info">
                                            <p class="name">${m.full_name}</p>
                                            <p class="role">${m.role.toUpperCase()}</p>
                                        </div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="tuf-info-alert">
                        <i data-lucide="info" size="18"></i>
                        <span>Selecione pelo menos 2 participantes. O sistema gerará automaticamente as lutas e as folgas (byes).</span>
                    </div>
                </div>

                <div class="tuf-modal-actions">
                    <button class="tuf-btn btn-secondary" onclick="window.App.closeModal()">CANCELAR</button>
                    <button class="tuf-btn btn-primary" id="btn-create-bracket">GERAR CHAVEAMENTO</button>
                </div>
            </div>

            <style>
                .tuf-modal-content {
                    width: 850px;
                    max-width: 95vw;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    padding: 0.5rem;
                }

                .tuf-modal-scrollable {
                    max-height: 65vh;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .tuf-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    font-weight: 800;
                    color: #999;
                    margin-bottom: 1rem;
                    display: block;
                }

                .tuf-input {
                    width: 100%;
                    height: 56px;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 0 1.5rem;
                    font-size: 1.1rem;
                    background: var(--bg-surface);
                    color: var(--text-primary);
                    transition: border-color 0.2s;
                }

                .tuf-input:focus {
                    border-color: var(--primary);
                    outline: none;
                }

                .tuf-participants-container {
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                    background: var(--bg-surface);
                }

                .tuf-participants-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    max-height: 400px;
                    overflow-y: auto;
                    background: var(--border);
                    gap: 1px;
                }

                .tuf-participant-item {
                    display: grid !important;
                    grid-template-columns: 30px 50px 1fr !important;
                    align-items: center !important;
                    padding: 1.25rem !important;
                    background: var(--bg-surface) !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                    gap: 1rem !important;
                    border: none !important;
                    margin: 0 !important;
                    height: auto !important;
                    text-align: left !important;
                }

                .tuf-participant-item:hover {
                    background: var(--bg-elevated) !important;
                }

                .tuf-participant-check {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 30px !important;
                    height: 100% !important;
                }

                .tuf-participant-avatar {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 50px !important;
                    height: 100% !important;
                }

                .tuf-participant-checkbox {
                    width: 20px !important;
                    height: 20px !important;
                    cursor: pointer !important;
                    margin: 0 !important;
                    position: static !important;
                }

                .tuf-participant-info {
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: center !important;
                    gap: 2px !important;
                    min-width: 0 !important;
                }

                .tuf-participant-info .name {
                    font-size: 0.85rem !important;
                    font-weight: 700 !important;
                    color: var(--text-primary) !important;
                    line-height: 1.2 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    white-space: normal !important;
                }

                .tuf-participant-info .role {
                    font-size: 0.65rem !important;
                    color: var(--text-dim) !important;
                    font-weight: 700 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                }

                .tuf-info-alert {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: #f1f3f9;
                    border-radius: 12px;
                    color: #777;
                    font-size: 0.85rem;
                    line-height: 1.4;
                }
                
                [data-theme="dark"] .tuf-info-alert {
                    background: #1e222a;
                    color: #aaa;
                }

                .tuf-modal-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--border);
                }

                .tuf-btn {
                    height: 56px;
                    border-radius: 12px;
                    font-weight: 900;
                    font-size: 0.9rem;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-secondary {
                    background: #000;
                    color: #fff;
                }

                .btn-primary {
                    background: #000;
                    color: #fff;
                }

                .tuf-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                @media (max-width: 768px) {
                    .tuf-participants-grid {
                        grid-template-columns: 1fr;
                    }
                    .tuf-modal-actions {
                        grid-template-columns: 1fr;
                    }
                    .tuf-modal-content {
                        width: 100%;
                    }
                }
            </style>
        `;

        this.app.showModal('Configurar Novo TUF', content, 'modal-large');
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('btn-create-bracket').onclick = async () => {
            const name = document.getElementById('tuf-name').value;
            const selected = Array.from(document.querySelectorAll('.tuf-participant-checkbox:checked')).map(cb => ({
                id: cb.value,
                full_name: cb.dataset.name,
                avatar_url: cb.dataset.avatar,
                current_belt: cb.dataset.belt,
                current_stripes: parseInt(cb.dataset.stripes)
            }));

            if (!name) return alert('Por favor, dê um nome ao torneio.');
            if (selected.length < 2) return alert('Selecione pelo menos 2 participantes.');

            const btn = document.getElementById('btn-create-bracket');
            const originalText = btn.innerText;
            btn.innerText = 'SALVANDO...';
            btn.disabled = true;

            // Log and Save Tournament
            const saveRes = await this.app.academy.saveTournament(name, selected, this.user.id);
            
            if (!saveRes.success) {
                alert(`Erro: ${saveRes.error}`);
                btn.innerText = originalText;
                btn.disabled = false;
                return;
            }

            // Increment participations
            this.app.academy.incrementTufParticipations(selected.map(s => s.id));

            this.createBracket(name, selected);
            this.app.closeModal();
        };
    }

    createBracket(name, participants) {
        // Shuffle participants
        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        
        const n = shuffled.length;
        const p = Math.pow(2, Math.ceil(Math.log2(n))); // Next power of 2
        const byes = p - n;

        // Round 1
        const r1Matches = [];
        const r2Waiters = [];

        // Distribute byes
        for (let i = 0; i < byes; i++) {
            r2Waiters.push(shuffled.pop());
        }

        // Create R1 matches with remaining
        while (shuffled.length > 0) {
            r1Matches.push({
                id: `r1-m${r1Matches.length}`,
                p1: shuffled.pop(),
                p2: shuffled.pop(),
                winner: null
            });
        }

        const totalRounds = Math.log2(p);
        const rounds = [];
        
        // Add Round 1
        rounds.push({
            name: n > 8 ? 'Primeira Fase' : (n > 4 ? 'Quartas de Final' : 'Semi-Final'),
            matches: r1Matches
        });

        // Pre-create subsequent rounds
        let currentLevelMatches = p / 4; // R2 matches count
        for (let r = 2; r <= totalRounds; r++) {
            const matches = [];
            for (let m = 0; m < currentLevelMatches; m++) {
                matches.push({
                    id: `r${r}-m${m}`,
                    p1: (r === 2 && r2Waiters.length > 0) ? r2Waiters.pop() : null, // Fill with byes in R2 if any
                    p2: (r === 2 && r2Waiters.length > 0) ? r2Waiters.pop() : null,
                    winner: null
                });
            }
            rounds.push({
                name: r === totalRounds ? 'Grande Final' : (r === totalRounds - 1 ? 'Semi-Final' : `Rodada ${r}`),
                matches: matches
            });
            currentLevelMatches /= 2;
        }

        this.tournament = { name, rounds };
        this.renderTournament();
    }

    async setWinner(roundIndex, matchIndex, participantNum) {
        const match = this.tournament.rounds[roundIndex].matches[matchIndex];
        const winner = participantNum === 1 ? match.p1 : match.p2;
        const loser = participantNum === 1 ? match.p2 : match.p1;
        
        match.winner = winner;

        // Increment matches count for both
        this.app.academy.incrementTufMatches([winner.id, loser.id]);

        // Advance to next round
        const nextRound = this.tournament.rounds[roundIndex + 1];
        if (nextRound) {
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const nextMatch = nextRound.matches[nextMatchIndex];
            
            if (matchIndex % 2 === 0) {
                if (nextMatch.p1) nextMatch.p2 = winner;
                else nextMatch.p1 = winner;
            } else {
                if (nextMatch.p2) nextMatch.p1 = winner;
                else nextMatch.p2 = winner;
            }
        } else {
            // This was the final!
            this.app.academy.incrementTufChampionships(winner.id);
            this.tournament.champion = winner;
            this.celebrateChampion();
        }

        this.renderTournament();
    }

    celebrateChampion() {
        // Load confetti if not present
        if (!window.confetti) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
            script.onload = () => this.fireConfetti();
            document.head.appendChild(script);
        } else {
            this.fireConfetti();
        }
    }

    fireConfetti() {
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

    renderTournament() {
        const container = document.getElementById('tuf-container');
        if (!container || !this.tournament) return;

        container.innerHTML = `
            <div class="card" style="padding: 2.5rem; border-radius: 24px; background: var(--bg-surface); border: 1px solid var(--border); box-shadow: var(--shadow-lg);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4rem;">
                    <div>
                        <h2 class="font-heading" style="font-size: 2rem; letter-spacing: -0.02em; margin-bottom: 0.5rem;">${this.tournament.name}</h2>
                        <p style="color: var(--text-dim); font-size: 0.9rem;">Gerencie o progresso e defina os vencedores para avançar no chaveamento.</p>
                    </div>
                    <button class="btn-reset" onclick="window.App.currentPage.resetTuf()">
                        <i data-lucide="rotate-ccw" size="14"></i> REINICIAR
                    </button>
                </div>

                <div class="tuf-bracket-wrapper">
                    ${this.tournament.rounds.map((round, rIndex) => `
                        <div class="round-column">
                            <h4 class="round-title">${round.name}</h4>
                            <div class="matches-list">
                                ${round.matches.map((match, mIndex) => `
                                    <div class="match-card ${match.winner ? 'match-completed' : ''}" id="match-${rIndex}-${mIndex}">
                                        <div class="match-participant ${match.winner && match.winner.id === match.p1?.id ? 'winner' : (match.winner ? 'loser' : '')}">
                                            ${match.p1 ? `
                                                ${this.renderAvatarWithStripes(match.p1, 36)}
                                                <span class="participant-name">${match.p1.full_name}</span>
                                                ${!match.winner && (this.user.is_admin || this.user.role === 'professor') ? `<button class="btn-winner" onclick="window.App.currentPage.setWinner(${rIndex}, ${mIndex}, 1)">VENCEU</button>` : ''}
                                                ${match.winner && match.winner.id === match.p1.id ? '<i data-lucide="trophy" class="win-icon"></i>' : ''}
                                            ` : `<div class="empty-slot"><i data-lucide="help-circle" size="14"></i></div><span class="text-dim italic">Aguardando...</span>`}
                                        </div>
                                        <div class="match-participant ${match.winner && match.winner.id === match.p2?.id ? 'winner' : (match.winner ? 'loser' : '')}">
                                            ${match.p2 ? `
                                                ${this.renderAvatarWithStripes(match.p2, 36)}
                                                <span class="participant-name">${match.p2.full_name}</span>
                                                ${!match.winner && (this.user.is_admin || this.user.role === 'professor') ? `<button class="btn-winner" onclick="window.App.currentPage.setWinner(${rIndex}, ${mIndex}, 2)">VENCEU</button>` : ''}
                                                ${match.winner && match.winner.id === match.p2.id ? '<i data-lucide="trophy" class="win-icon"></i>' : ''}
                                            ` : `<div class="empty-slot"><i data-lucide="help-circle" size="14"></i></div><span class="text-dim italic">Aguardando...</span>`}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}

                    <!-- CAMPEÃO SPOTLIGHT -->
                    <div class="round-column champion-column">
                        <h4 class="round-title" style="color: var(--primary);">CAMPEÃO</h4>
                        <div class="champion-spotlight ${this.tournament.champion ? 'is-active' : ''}">
                            ${this.tournament.champion ? `
                                <div class="champion-card animate-in">
                                    <div class="trophy-badge">
                                        <i data-lucide="trophy" size="32"></i>
                                    </div>
                                    ${this.renderAvatarWithStripes(this.tournament.champion, 80)}
                                    <h3 class="champion-name">${this.tournament.champion.full_name}</h3>
                                    <p class="champion-title">GRANDE CAMPEÃO</p>
                                </div>
                            ` : `
                                <div class="champion-placeholder">
                                    <i data-lucide="crown" size="48" style="opacity: 0.1; margin-bottom: 1rem;"></i>
                                    <p>Aguardando Final</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .tuf-bracket-wrapper {
                    display: flex;
                    gap: 3rem;
                    overflow-x: auto;
                    padding: 1rem 0 3rem 0;
                    align-items: flex-start;
                }

                .round-column {
                    flex-shrink: 0;
                    width: 320px;
                }

                .round-title {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    font-weight: 800;
                    color: var(--text-dim);
                    margin-bottom: 2.5rem;
                    text-align: center;
                }

                .matches-list {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    justify-content: space-around;
                    height: 100%;
                }

                .match-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    transition: all 0.3s;
                }

                .match-completed {
                    opacity: 0.9;
                }

                .match-participant {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    position: relative;
                    transition: all 0.3s;
                }

                .match-participant:first-child {
                    border-bottom: 1px solid var(--border);
                }

                .participant-name {
                    font-size: 0.85rem;
                    font-weight: 700;
                    flex: 1;
                    color: var(--text-primary);
                }

                .winner {
                    background: rgba(255, 215, 0, 0.05);
                }

                .winner .participant-name {
                    color: var(--primary);
                }

                .loser {
                    opacity: 0.4;
                    filter: grayscale(1);
                }

                .btn-winner {
                    font-size: 0.6rem;
                    font-weight: 800;
                    background: #000;
                    color: #fff;
                    border: none;
                    padding: 0.5rem 0.75rem;
                    border-radius: 6px;
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.2s;
                }

                .match-participant:hover .btn-winner {
                    opacity: 1;
                }

                .win-icon {
                    color: #FFD700;
                    width: 16px;
                    height: 16px;
                }

                .empty-slot {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 2px dashed var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-dim);
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

                /* CHAMPION SPOTLIGHT */
                .champion-column {
                    width: 380px;
                }

                .champion-spotlight {
                    height: 100%;
                    min-height: 400px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px dashed var(--border);
                    border-radius: 24px;
                    transition: all 0.5s;
                }

                .champion-spotlight.is-active {
                    background: linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,255,255,0) 100%);
                    border: 2px solid #FFD700;
                    box-shadow: 0 0 40px rgba(255,215,0,0.1);
                }

                .champion-card {
                    text-align: center;
                    padding: 3rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }

                .trophy-badge {
                    background: #FFD700;
                    color: #000;
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 24px rgba(255,215,0,0.4);
                    margin-bottom: 1rem;
                    animation: trophy-bounce 1s infinite alternate;
                }

                @keyframes trophy-bounce {
                    from { transform: translateY(0); }
                    to { transform: translateY(-10px); }
                }

                .champion-name {
                    font-size: 1.5rem;
                    font-weight: 900;
                    letter-spacing: -0.03em;
                    margin: 0;
                }

                .champion-title {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.4em;
                    font-weight: 800;
                    color: #FFD700;
                }

                .champion-placeholder {
                    text-align: center;
                    color: var(--text-dim);
                }

                .animate-in {
                    animation: scale-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes scale-up {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            </style>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    resetTuf() {
        if (confirm('Tem certeza que deseja apagar o chaveamento atual?')) {
            this.tournament = null;
            this.app.router.handleRouteChange(window.location.hash);
        }
    }
}
