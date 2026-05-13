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
            <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 600px; max-width: 95vw;">
                <div style="max-height: 70vh; overflow-y: auto; padding: 0.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
                    <div>
                        <label style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; color: var(--text-dim); margin-bottom: 0.75rem; display: block;">Nome do Torneio</label>
                        <input type="text" id="tuf-name" class="input" placeholder="Ex: Copa Interna Verão 2024" style="height: 52px; font-size: 1rem;">
                    </div>

                    <div>
                        <label style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; color: var(--text-dim); margin-bottom: 0.75rem; display: block;">Selecionar Participantes</label>
                        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden;">
                            <div style="max-height: 320px; overflow-y: auto;">
                                ${members.map(m => `
                                    <label style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s;" class="participant-select-item">
                                        <input type="checkbox" class="tuf-participant-checkbox" value="${m.id}" data-name="${m.full_name}" data-avatar="${m.avatar_url || ''}" data-belt="${m.current_belt || 'white belt'}" data-stripes="${m.current_stripes || 0}" style="width: 18px; height: 18px;">
                                        ${this.renderAvatarWithStripes(m, 36)}
                                        <div style="flex: 1;">
                                            <p style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary);">${m.full_name}</p>
                                            <p style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em;">${m.role}</p>
                                        </div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <p style="font-size: 0.75rem; color: var(--text-dim); margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="info" size="14"></i> Selecione pelo menos 2 participantes para gerar as chaves.
                        </p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
                    <button class="btn btn-secondary" onclick="window.App.closeModal()" style="height: 52px; font-weight: 800; letter-spacing: 0.05em;">CANCELAR</button>
                    <button class="btn btn-primary" id="btn-create-bracket" style="height: 52px; background: var(--inverse-bg); color: var(--inverse-text); font-weight: 800; letter-spacing: 0.05em; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">GERAR CHAVEAMENTO</button>
                </div>
            </div>
            <style>
                .participant-select-item:hover {
                    background: var(--bg-elevated);
                }
                .participant-select-item:last-child {
                    border-bottom: none;
                }
            </style>
        `;

        this.app.showModal('Configurar Novo TUF', content);
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('btn-create-bracket').onclick = () => {
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

    renderTournament() {
        const container = document.getElementById('tuf-container');
        if (!container || !this.tournament) return;

        container.innerHTML = `
            <div class="card" style="padding: 2rem; border-radius: 24px; background: var(--bg-surface); border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3rem;">
                    <div>
                        <h2 class="font-heading" style="font-size: 1.75rem;">${this.tournament.name}</h2>
                        <p class="text-dim">Clique em "Definir Vencedor" para avançar o atleta no chaveamento.</p>
                    </div>
                    <button class="btn-secondary" onclick="window.App.currentPage.resetTuf()" style="height: 40px; font-size: 0.7rem; font-weight: 800;">REINICIAR</button>
                </div>

                <div class="tuf-bracket-wrapper">
                    ${this.tournament.rounds.map((round, rIndex) => `
                        <div class="round-column">
                            <h4 class="round-title">${round.name}</h4>
                            ${round.matches.map((match, mIndex) => `
                                <div class="match-card" id="match-${rIndex}-${mIndex}">
                                    <div class="match-participant ${match.winner && match.winner.id === match.p1?.id ? 'winner' : ''}">
                                        ${match.p1 ? `
                                            ${this.renderAvatarWithStripes(match.p1, 32)}
                                            <span class="participant-name">${match.p1.full_name}</span>
                                            ${!match.winner && (this.user.is_admin || this.user.role === 'professor') ? `<button class="btn-winner" onclick="window.App.currentPage.setWinner(${rIndex}, ${mIndex}, 1)">VENCEU</button>` : ''}
                                        ` : `<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-elevated); border: 1px dashed var(--border);"></div><span class="text-dim" style="font-size: 0.8rem; font-style: italic;">Aguardando...</span>`}
                                    </div>
                                    <div class="match-participant ${match.winner && match.winner.id === match.p2?.id ? 'winner' : ''}">
                                        ${match.p2 ? `
                                            ${this.renderAvatarWithStripes(match.p2, 32)}
                                            <span class="participant-name">${match.p2.full_name}</span>
                                            ${!match.winner && (this.user.is_admin || this.user.role === 'professor') ? `<button class="btn-winner" onclick="window.App.currentPage.setWinner(${rIndex}, ${mIndex}, 2)">VENCEU</button>` : ''}
                                        ` : `<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-elevated); border: 1px dashed var(--border);"></div><span class="text-dim" style="font-size: 0.8rem; font-style: italic;">Aguardando...</span>`}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
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
            alert(`🎉 ${winner.full_name} é o grande campeão do TUF!`);
        }

        this.renderTournament();
    }

    resetTuf() {
        if (confirm('Tem certeza que deseja apagar o chaveamento atual?')) {
            this.tournament = null;
            this.app.router.handleRouteChange(window.location.hash);
        }
    }
}
