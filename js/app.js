/**
 * Oss Manager - Main Application Logic
 */

import { AuthService } from './services/auth.service.js';
import { AcademyService } from './services/academy.service.js';
import { Router } from './router.js';

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.auth = new AuthService();
        this.academy = new AcademyService(this);
        this.router = new Router(this);
        this.currentPage = null;
        
        this.initTheme();
        this.init();
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.currentTheme = savedTheme;
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Dispatch event for components that need to react
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: this.currentTheme } }));
    }

    async init() {
        console.log("🚀 OSS Manager: Iniciando...");
        
        try {
            // Initialize Lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }

            // Check if library is loaded
            if (!window.supabase) {
                console.error("❌ Erro: window.supabase não encontrado.");
                throw new Error("A biblioteca Supabase não pôde ser carregada do CDN.");
            }

            console.log("🔑 OSS Manager: Verificando sessão...");
            await this.auth.init();
            
            console.log("🗺️ OSS Manager: Configurando rotas...");
            const currentHash = window.location.hash || '';
            
            // Explicitly handle initial route
            try {
                console.log("📍 Renderizando rota inicial:", currentHash || '#dashboard');
                await this.router.handleRouteChange(currentHash);
            } catch (routeError) {
                console.error("❌ Erro no Roteador:", routeError);
                // Fallback para dashboard se falhar
                if (currentHash !== '#dashboard') {
                    window.location.hash = '#dashboard';
                }
            }
            
            window.addEventListener('hashchange', () => {
                console.log("🔄 Hash alterado para:", window.location.hash);
                this.router.handleRouteChange(window.location.hash);
            });

            console.log("✅ OSS Manager: Inicialização concluída!");
        } catch (error) {
            console.error("🔥 ERRO FATAL:", error);
            this.appElement.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--error);">
                    <h2 class="font-heading">Falha no Carregamento</h2>
                    <p style="margin: 20px 0; color: var(--text-secondary);">${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Recarregar App</button>
                </div>
            `;
        }
    }

    render(content) {
        // Get current opacity for smooth transition
        const currentOpacity = parseFloat(getComputedStyle(this.appElement).opacity) || 1;
        
        // Start transition to fade out
        this.appElement.style.transition = 'opacity 0.2s ease-in-out';
        this.appElement.style.opacity = '0.5';
        
        // Wait for half transition then swap content while maintaining 0.5 opacity
        setTimeout(() => {
            // Inject new content while opacity is at 0.5 (no white flash)
            this.appElement.innerHTML = content;
            
            // Re-initialize icons after content is injected
            if (window.lucide) {
                window.lucide.createIcons();
            }
            
            // Complete fade in
            requestAnimationFrame(() => {
                this.appElement.style.transition = 'opacity 0.3s ease-in-out';
                this.appElement.style.opacity = '1';
            });
        }, 200);
    }

    showModal(title, content, className = '') {
        let modal = document.getElementById('global-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'global-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content ${className}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                    <h3 class="font-heading" id="modal-title" style="margin: 0;"></h3>
                    <button class="btn-icon" onclick="window.App.closeModal()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div id="modal-body"></div>
            </div>
        `;

        modal.querySelector('#modal-title').textContent = title;
        modal.querySelector('#modal-body').innerHTML = content;
        modal.style.display = 'flex';
        
        if (window.lucide) {
            window.lucide.createIcons({
                attrs: { 'stroke-width': 2 },
                portal: modal
            });
        }
    }

    closeModal() {
        const modal = document.getElementById('global-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Global App Instance
document.addEventListener('DOMContentLoaded', () => {
    window.App = new App();
    
    // Global listener for theme toggle
    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('#theme-toggle');
        if (toggle && window.App) {
            window.App.toggleTheme();
            window.App.router.handleRouteChange(window.location.hash);
        }
    });
});
