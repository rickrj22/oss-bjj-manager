export class FinancePage {
    constructor(app) {
        this.app = app;
    }

    async render() {
        const user = await this.app.auth.getUser();
        const theme = this.app.currentTheme;
        const [records, stats, sidebarAcad] = await Promise.all([
            this.app.academy.getFinancialRecords(),
            user.is_admin ? this.app.academy.getDetailedFinanceData() : Promise.resolve(null),
            this.app.academy.getSidebarData()
        ]);
        this.sidebarAcad = sidebarAcad || user.academy || {};
        
        // Calculate status for student view
        const latestRecord = records[0];
        const isUpToDate = latestRecord ? latestRecord.status === 'paid' : true;

        if (user.is_admin && stats) {
            return `
                <div class="layout-container">
                    <aside class="sidebar" style="padding-top: 2rem;">
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
                        <nav class="nav-list" style="flex: 1;">
                            <a href="#dashboard" class="nav-item"><i data-lucide="layout-dashboard" size="18"></i> <span>Dashboard</span></a>
                            <a href="#membros" class="nav-item"><i data-lucide="users" size="18"></i> <span>Membros</span></a>
                            <a href="#aulas" class="nav-item"><i data-lucide="calendar" size="18"></i> <span>Minhas Aulas</span></a>
                            <a href="#financeiro" class="nav-item active"><i data-lucide="dollar-sign" size="18"></i> <span>Financeiro</span></a>
                            <a href="#configuracoes" class="nav-item"><i data-lucide="settings" size="18"></i> <span>Configurações</span></a>
                            <a href="#perfil" class="nav-item"><i data-lucide="user" size="18"></i> <span>Perfil</span></a>
                        </nav>
                        <div id="theme-toggle" class="theme-toggle">
                            <i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}"></i>
                            <span>${theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                        </div>
                        <div style="border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 1.5rem;">
                            <button id="logout-btn" class="btn-secondary btn-full" style="height: 42px; gap: 0.75rem;">
                                <i data-lucide="log-out" size="18"></i> <span>Sair</span>
                            </button>
                        </div>
                    </aside>

                    <main class="main-content">
                        <header class="flex-between mb-8 animate-in">
                            <div>
                                <h1 class="font-heading font-xl" style="font-weight: 800; font-size: 2.5rem; margin-bottom: 0.5rem;">Gestão Financeira</h1>
                                <p class="text-graphite" style="font-size: 1.1rem; opacity: 0.8;">Visão geral de recebimentos, inadimplência e saúde financeira da unidade.</p>
                            </div>
                            <div style="display: flex; gap: 1rem;">
                                <button class="btn btn-secondary" id="btn-report" style="height: 48px; gap: 0.75rem; font-weight: 700; border-radius: 8px;">
                                    <i data-lucide="file-text" size="20"></i> RELATÓRIO
                                </button>
                                <button class="btn btn-primary" id="btn-inform-payment" style="height: 48px; gap: 0.75rem; background: var(--inverse-bg); color: var(--inverse-text); border: none; font-weight: 700; border-radius: 8px; min-width: 220px;">
                                    <i data-lucide="plus-circle" size="20"></i> INFORMAR PAGAMENTO
                                </button>
                            </div>
                        </header>

                        <!-- KPI Cards -->
                        <div class="grid grid-cols-3 mb-8" style="gap: 1.5rem;">
                            <div class="card" style="padding: 1.5rem; border: 1px solid var(--border); background: var(--bg-surface); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                                    <div style="background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 0.75rem; border-radius: 10px;">
                                        <i data-lucide="users" size="24"></i>
                                    </div>
                                    <span style="font-size: 0.7rem; font-weight: 800; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 0.25rem 0.5rem; border-radius: 4px;">ATIVOS</span>
                                </div>
                                <h3 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 0.25rem;">${stats.activeMembers.length}</h3>
                                <p style="font-size: 0.8rem; color: var(--text-dim);">Alunos com mensalidades em dia ou atraso < 30 dias.</p>
                            </div>

                            <div class="card" style="padding: 1.5rem; border: 1px solid var(--border); background: var(--bg-surface); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                                    <div style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 0.75rem; border-radius: 10px;">
                                        <i data-lucide="user-x" size="24"></i>
                                    </div>
                                    <span style="font-size: 0.7rem; font-weight: 800; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 0.25rem 0.5rem; border-radius: 4px;">INATIVOS/PENDENTES</span>
                                </div>
                                <h3 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 0.25rem;">${stats.inactiveMembers.length}</h3>
                                <p style="font-size: 0.8rem; color: var(--text-dim);">Alunos sem plano ou com atraso > 30 dias.</p>
                            </div>

                            <div class="card" style="padding: 1.5rem; border: 1px solid var(--border); background: var(--bg-surface); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                                    <div style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 0.75rem; border-radius: 10px;">
                                        <i data-lucide="trending-up" size="24"></i>
                                    </div>
                                    <span style="font-size: 0.7rem; font-weight: 800; color: #3b82f6; background: rgba(59, 130, 246, 0.1); padding: 0.25rem 0.5rem; border-radius: 4px;">PREVISÃO (15 DIAS)</span>
                                </div>
                                <h3 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 0.25rem;">R$ ${stats.revenueForecast.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                                <p style="font-size: 0.8rem; color: var(--text-dim);">Pagamentos programados para vencer em breve.</p>
                            </div>
                        </div>

                        <!-- Data Sections -->
                        <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 2rem;">
                            <!-- Upcoming Payments -->
                            <div class="card" style="padding: 2rem; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-surface);">
                                <h3 class="font-heading mb-6" style="font-size: 1.25rem; display: flex; align-items: center; gap: 0.75rem;">
                                    <i data-lucide="clock" size="20" style="color: #3b82f6;"></i> À Vencer (Próximos 15 dias)
                                </h3>
                                <div style="max-height: 400px; overflow-y: auto;">
                                    ${stats.upcomingPayments.length > 0 ? stats.upcomingPayments.map(p => `
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border);">
                                            <div>
                                                <p style="font-weight: 700; font-size: 0.9rem;">${p.full_name}</p>
                                                <p style="font-size: 0.75rem; color: var(--text-dim);">Vence em ${new Date(p.due_date).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            <p style="font-weight: 800; color: var(--text-primary);">R$ ${p.amount.toFixed(2)}</p>
                                        </div>
                                    `).join('') : '<p class="text-dim" style="padding: 2rem; text-align: center; font-style: italic;">Nenhum pagamento programado.</p>'}
                                </div>
                            </div>

                            <!-- Overdue/Inactive Members -->
                            <div class="card" style="padding: 2rem; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-surface);">
                                <h3 class="font-heading mb-6" style="font-size: 1.25rem; display: flex; align-items: center; gap: 0.75rem;">
                                    <i data-lucide="alert-circle" size="20" style="color: #ef4444;"></i> Alunos Inativos / Pendentes
                                </h3>
                                <div style="max-height: 400px; overflow-y: auto;">
                                    ${stats.inactiveMembers.length > 0 ? stats.inactiveMembers.map(m => `
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border);">
                                            <div>
                                                <p style="font-weight: 700; font-size: 0.9rem;">${m.full_name}</p>
                                                <p style="font-size: 0.75rem; color: var(--text-dim);">${m.plan_name}</p>
                                            </div>
                                            <span style="font-size: 0.65rem; font-weight: 800; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 0.25rem 0.5rem; border-radius: 4px;">${m.reason || 'Pendente'}</span>
                                        </div>
                                    `).join('') : '<p class="text-dim" style="padding: 2rem; text-align: center; font-style: italic;">Nenhum aluno inativo detectado.</p>'}
                                </div>
                            </div>
                        </div>

                        <!-- All History -->
                        <div class="card mt-8" style="padding: 2rem; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-surface);">
                            <h3 class="font-heading mb-8" style="font-size: 1.25rem;">Histórico Geral de Recebimentos</h3>
                            <div style="overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                                            <th style="padding: 1rem 0; font-size: 0.75rem; text-transform: uppercase; font-weight: 800;" class="text-dim">DATA DO PAGAMENTO</th>
                                            <th style="padding: 1rem 0; font-size: 0.75rem; text-transform: uppercase; font-weight: 800;" class="text-dim">MEMBRO</th>
                                            <th style="padding: 1rem 0; font-size: 0.75rem; text-transform: uppercase; font-weight: 800;" class="text-dim">VALOR</th>
                                            <th style="padding: 1rem 0; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; text-align: right;" class="text-dim">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${records.length > 0 ? records.slice(0, 20).map(r => `
                                            <tr style="border-bottom: 1px solid var(--border);">
                                                <td style="padding: 1rem 0; font-size: 0.9rem;">${(r.payment_date || r.due_date || r.created_at).split('T')[0].split('-').reverse().join('/')}</td>
                                                <td style="padding: 1rem 0; font-size: 0.9rem; font-weight: 600;">${r.profiles?.full_name || 'Usuário'}</td>
                                                <td style="padding: 1rem 0; font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">R$ ${r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                <td style="padding: 1rem 0; text-align: right;">
                                                    <span class="badge ${r.status === 'paid' ? 'badge-success' : 'badge-error'}" style="font-size: 0.65rem; padding: 0.35rem 0.75rem;">
                                                        ${r.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('') : '<tr><td colspan="4" class="text-dim" style="padding: 4rem; text-align: center; font-style: italic;">Nenhum pagamento registrado.</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                </div>
            `;
        }

        return `
            <div class="layout-container">
                <aside class="sidebar" style="padding-top: 2rem;">
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
                            <a href="#financeiro" class="nav-item active animate-in stagger-1">
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
                        <span>${this.app.currentTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                    </div>

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

                <main class="main-content">
                    <header class="flex-between mb-8 animate-in">
                        <div>
                            <h1 class="font-heading font-xl">Financeiro</h1>
                            <p class="text-graphite">Gerencie sua assinatura e histórico de pagamentos.</p>
                        </div>
                        <button class="btn btn-primary" id="pix-btn" style="height: 42px; gap: 0.5rem;">
                            <i data-lucide="qr-code" size="18"></i> PAGAR VIA PIX
                        </button>
                    </header>

                    <div class="grid" style="grid-template-columns: 1fr; gap: 2rem;">
                        <div class="card animate-in stagger-1">
                            <h3 class="font-heading font-large mb-6">Minha Assinatura</h3>
                            <div class="flex-between" style="padding: 1.5rem; background: var(--bg-elevated); border-radius: 12px; border: 1px solid var(--border);">
                                <div>
                                    <p style="font-weight: 800; font-size: 1.25rem; color: var(--text-primary);">Plano Ativo</p>
                                    <p class="text-dim mt-2" style="font-size: 0.85rem;">
                                        ${latestRecord ? `Vencimento: <strong>${latestRecord.due_date.split('T')[0].split('-').reverse().join('/')}</strong>` : 'Nenhuma mensalidade pendente'}
                                    </p>
                                </div>
                                <div style="text-align: right;">
                                    <p class="font-heading" style="font-size: 2rem; color: var(--text-primary);">R$ ${latestRecord ? latestRecord.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</p>
                                    <span class="badge ${isUpToDate ? 'badge-success' : 'badge-error'} mt-3" style="padding: 0.5rem 1rem;">
                                        ${isUpToDate ? 'PAGAMENTO EM DIA' : 'PENDENTE'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="card animate-in stagger-2">
                            <h3 class="font-heading font-large mb-8">Histórico de Pagamentos</h3>
                            <div style="overflow-x: auto;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                                            <th style="padding: 1rem 0; font-size: 0.75rem; text-transform: uppercase; font-weight: 800;" class="text-dim">DATA DO PAGAMENTO</th>
                                            <th style="padding: 1rem 0; font-size: 0.75rem; text-transform: uppercase; font-weight: 800;" class="text-dim">VALOR</th>
                                            <th style="padding: 1rem 0; font-size: 0.75rem; text-transform: uppercase; font-weight: 800;" class="text-dim">MÉTODO</th>
                                            <th style="padding: 1rem 0; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; text-align: right;" class="text-dim">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${records.length > 0 
                                            ? records.map(r => this.renderPaymentRow(r)).join('')
                                            : '<tr><td colspan="4" class="text-dim" style="padding: 4rem; text-align: center; font-style: italic;">Nenhum registro encontrado.</td></tr>'
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
                <div style="position: fixed; bottom: 1rem; right: 1.5rem; font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; pointer-events: none; opacity: 0.5;">
                    OSS BJJ Manager • v1.0
                </div>
            </div>
        `;
    }

    renderPaymentRow(r) {
        return `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1.5rem 0; font-size: 0.9rem;">${(r.payment_date || r.due_date || r.created_at).split('T')[0].split('-').reverse().join('/')}</td>
                <td style="padding: 1.5rem 0; font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">R$ ${r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="padding: 1.5rem 0; color: var(--text-secondary); font-size: 0.85rem;">${r.payment_method || 'Boleto/PIX'}</td>
                <td style="padding: 1.5rem 0; text-align: right;">
                    <span class="badge ${r.status === 'paid' ? 'badge-success' : 'badge-error'}" style="font-size: 0.65rem; padding: 0.35rem 0.75rem;">
                        ${r.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                    </span>
                </td>
            </tr>
        `;
    }

    afterRender() {
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('logout-btn').onclick = () => this.app.auth.logout();
        document.getElementById('theme-toggle').onclick = () => {
            this.app.toggleTheme();
            this.app.router.handleRouteChange(window.location.hash);
        };

        const pixBtn = document.getElementById('pix-btn');
        if (pixBtn) {
            pixBtn.onclick = () => alert('Gerando QR Code PIX...');
        }

        const informBtn = document.getElementById('btn-inform-payment');
        if (informBtn) {
            informBtn.onclick = () => this.showInformPaymentModal();
        }

        const reportBtn = document.getElementById('btn-report');
        if (reportBtn) {
            reportBtn.onclick = () => this.showReportModal();
        }
    }

    async showInformPaymentModal() {
        const members = await this.app.academy.getAcademyMembers();
        const plans = await this.app.academy.getPlans();
        const planMap = (plans.data || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

        const lbl = 'font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; color: var(--text-dim); margin-bottom: 0.5rem; display: block;';
        const inp = 'height: 48px; font-size: 0.9rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; width: 100%;';

        const content = `
            <div style="padding: 0.5rem; min-width: 600px; max-width: 100%;">
                <form id="inform-payment-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1.5rem;">
                        <div class="form-group">
                            <label style="${lbl}">Selecionar Aluno</label>
                            <select id="pay-user-id" class="input" style="${inp}" required>
                                <option value="">Selecione o aluno...</option>
                                ${members.map(m => `<option value="${m.id}" data-amount="${planMap[m.plan_id]?.price || 0}">${m.full_name} (${planMap[m.plan_id]?.name || 'S/ Plano'})</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label style="${lbl}">Valor Pago (R$)</label>
                            <input type="number" id="pay-amount" class="input" style="${inp}" step="0.01" required>
                        </div>

                        <div class="form-group" style="grid-column: span 2;">
                            <label style="${lbl}">Código da Transação PIX (E2E ID)</label>
                            <input type="text" id="pay-pix-code" class="input" style="${inp}" placeholder="Insira o ID da transação ou código do comprovante" required>
                        </div>

                        <div class="form-group" style="grid-column: span 2;">
                            <label style="${lbl}">Data do Pagamento</label>
                            <input type="date" id="pay-date" class="input" style="${inp}" value="${new Date().toLocaleDateString('en-CA')}" required>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 2rem;">
                        <button type="button" class="btn-secondary" style="height: 48px; font-weight: 800; letter-spacing: 0.05em; min-width: 0;" onclick="window.App.closeModal()">CANCELAR</button>
                        <button type="submit" class="btn" style="height: 48px; background: var(--inverse-bg); color: var(--inverse-text); font-weight: 800; letter-spacing: 0.05em; border: none; border-radius: 8px; min-width: 0;">CONFIRMAR</button>
                    </div>
                </form>
            </div>
        `;

        this.app.showModal('Informar Pagamento Realizado', content, 'modal-medium');

        const userSelect = document.getElementById('pay-user-id');
        const amountInput = document.getElementById('pay-amount');

        userSelect.onchange = () => {
            const selected = userSelect.options[userSelect.selectedIndex];
            amountInput.value = selected.dataset.amount || 0;
        };

        document.getElementById('inform-payment-form').onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                userId: userSelect.value,
                amount: parseFloat(amountInput.value),
                transactionCode: document.getElementById('pay-pix-code').value,
                paymentDate: document.getElementById('pay-date').value,
                method: 'PIX'
            };

            const res = await this.app.academy.recordPayment(data);
            if (res.success) {
                this.app.closeModal();
                this.app.router.handleRouteChange(window.location.hash);
            } else {
                alert('Erro ao registrar pagamento: ' + res.error);
            }
        };
    }

    async showReportModal() {
        const lbl = 'font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; color: var(--text-dim); margin-bottom: 0.5rem; display: block;';
        const inp = 'height: 48px; font-size: 0.9rem; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; width: 100%;';
        
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        const content = `
            <div style="padding: 1rem; min-width: 900px; max-width: 100%;">
                <div style="display: flex; gap: 1.5rem; margin-bottom: 2.5rem; align-items: flex-end;">
                    <div style="flex: 1;">
                        <label style="${lbl}">Mês de Referência</label>
                        <input type="month" id="report-month" class="input" style="${inp}" value="${currentMonth}">
                    </div>
                    <button id="btn-generate-report" class="btn" style="height: 48px; background: var(--inverse-bg); color: var(--inverse-text); font-weight: 800; border-radius: 8px; width: 160px;">
                        GERAR
                    </button>
                    <button id="btn-export-excel" class="btn-secondary" style="height: 48px; font-weight: 800; border-radius: 8px; width: 180px; display: none; gap: 0.5rem; align-items: center; justify-content: center;">
                        <i data-lucide="download" size="18"></i> EXPORTAR EXCEL
                    </button>
                </div>
                
                <div id="report-results" style="display: none;">
                    <div class="grid grid-cols-3" style="gap: 1rem; margin-bottom: 2rem;">
                        <div class="card" style="padding: 1.5rem 1rem; border: 1px solid var(--border); background: var(--bg-elevated); border-radius: 8px; text-align: center;">
                            <p style="font-size: 0.75rem; color: var(--text-dim); font-weight: 800; margin-bottom: 0.5rem;">TOTAL RECEBIDO</p>
                            <h3 id="rep-total-paid" style="font-size: 1.5rem; color: #22c55e;">R$ 0,00</h3>
                        </div>
                        <div class="card" style="padding: 1.5rem 1rem; border: 1px solid var(--border); background: var(--bg-elevated); border-radius: 8px; text-align: center;">
                            <p style="font-size: 0.75rem; color: var(--text-dim); font-weight: 800; margin-bottom: 0.5rem;">TOTAL EM ABERTO</p>
                            <h3 id="rep-total-open" style="font-size: 1.5rem; color: #ef4444;">R$ 0,00</h3>
                        </div>
                        <div class="card" style="padding: 1.5rem 1rem; border: 1px solid var(--border); background: var(--bg-elevated); border-radius: 8px; text-align: center;">
                            <p style="font-size: 0.75rem; color: var(--text-dim); font-weight: 800; margin-bottom: 0.5rem;">TAXA DE RECEBIMENTO</p>
                            <h3 id="rep-rate" style="font-size: 1.5rem; color: var(--text-primary);">0%</h3>
                        </div>
                    </div>

                    <div style="max-height: 500px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead style="position: sticky; top: 0; background: var(--bg-surface);">
                                <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                                    <th style="padding: 1rem; font-size: 0.75rem; font-weight: 800;" class="text-dim">MEMBRO</th>
                                    <th style="padding: 1rem; font-size: 0.75rem; font-weight: 800;" class="text-dim">VALOR</th>
                                    <th style="padding: 1rem; font-size: 0.75rem; font-weight: 800; text-align: right;" class="text-dim">STATUS</th>
                                </tr>
                            </thead>
                            <tbody id="report-table-body">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        this.app.showModal('Relatório Consolidado', content, 'modal-large');
        if (window.lucide) window.lucide.createIcons();
        
        document.getElementById('btn-generate-report').onclick = async () => {
            const monthVal = document.getElementById('report-month').value;
            if (!monthVal) return;
            
            const [year, month] = monthVal.split('-');
            await this.generateReportData(parseInt(year), parseInt(month));
        };
    }

    async generateReportData(year, month) {
        document.getElementById('report-results').style.display = 'block';
        document.getElementById('report-table-body').innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem;">Processando dados...</td></tr>';
        
        const members = await this.app.academy.getAcademyMembers();
        const plansResponse = await this.app.academy.getPlans();
        const plans = plansResponse.data || [];
        const records = await this.app.academy.getFinancialRecords(); 
        
        let totalPaid = 0;
        let totalOpen = 0;
        let rows = [];
        
        const targetCycle = `${year}-${month.toString().padStart(2, '0')}`;

        members.forEach(m => {
            if (m.is_active === false) return;
            
            const plan = plans.find(p => p.id === m.plan_id);
            const dueDay = m.payment_due_date || 10;
            
            // Verifica se existe um pagamento para o ciclo/mês selecionado
            const paidRecord = records.find(r => {
                if (r.user_id !== m.id || r.status !== 'paid') return false;
                const dateStr = (r.due_date || r.payment_date || r.created_at).substring(0, 7);
                return dateStr === targetCycle;
            });
            
            if (paidRecord) {
                totalPaid += paidRecord.amount;
                rows.push({
                    name: m.full_name,
                    amount: paidRecord.amount,
                    status: 'PAGO',
                    statusClass: 'badge-success'
                });
            } else if (plan && plan.price > 0) {
                totalOpen += plan.price;
                const dueDateStr = `${dueDay.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                rows.push({
                    name: m.full_name,
                    amount: plan.price,
                    status: `EM ABERTO (${dueDateStr})`,
                    statusClass: 'badge-error'
                });
            }
        });
        
        // Render KPIs
        document.getElementById('rep-total-paid').innerText = `R$ ${totalPaid.toLocaleString('pt-BR', {minimumFractionDigits:2})}`;
        document.getElementById('rep-total-open').innerText = `R$ ${totalOpen.toLocaleString('pt-BR', {minimumFractionDigits:2})}`;
        
        const total = totalPaid + totalOpen;
        const rate = total > 0 ? Math.round((totalPaid / total) * 100) : 0;
        document.getElementById('rep-rate').innerText = `${rate}%`;
        
        // Render Tabela
        if (rows.length === 0) {
            document.getElementById('report-table-body').innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-dim); font-style: italic;">Nenhum dado encontrado para este mês.</td></tr>';
        } else {
            rows.sort((a, b) => a.name.localeCompare(b.name));
            
            document.getElementById('report-table-body').innerHTML = rows.map(r => `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem; font-weight: 600; font-size: 0.9rem;">${r.name}</td>
                    <td style="padding: 1rem; font-weight: 700; font-size: 0.9rem;">R$ ${r.amount.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                    <td style="padding: 1rem; text-align: right;">
                        <span class="badge ${r.statusClass}" style="font-size: 0.65rem; padding: 0.35rem 0.75rem;">${r.status}</span>
                    </td>
                </tr>
            `).join('');
            
            const exportBtn = document.getElementById('btn-export-excel');
            if (exportBtn) {
                exportBtn.style.display = 'inline-flex';
                exportBtn.style.alignItems = 'center';
                exportBtn.style.justifyContent = 'center';
                exportBtn.onclick = () => this.exportToCsv(rows, year, month);
            }
        }
    }

    exportToCsv(rows, year, month) {
        const headers = ['Membro', 'Valor (R$)', 'Status'];
        const csvContent = [
            headers.join(';'),
            ...rows.map(r => `${r.name};"${r.amount.toFixed(2).replace('.', ',')}";"${r.status}"`)
        ].join('\n');

        // \uFEFF is the UTF-8 BOM to ensure Excel reads accents correctly
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Relatorio_Mensalidades_${year}_${month.toString().padStart(2, '0')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
