import { LoginPage } from './pages/login.page.js';
import { RegisterPage } from './pages/register.page.js';
import { DashboardPage } from './pages/dashboard.page.js';
import { ProfilePage } from './pages/profile.page.js';
import { FinancePage } from './pages/finance.page.js';
import { MembersPage } from './pages/members.page.js';
import { SettingsPage } from './pages/settings.page.js';
import { ClassesPage } from './pages/classes.page.js';

export class Router {
    constructor(app) {
        this.app = app;
        this.routes = {
            '': ClassesPage,
            '#login': LoginPage,
            '#register': RegisterPage,
            '#dashboard': DashboardPage,
            '#aulas': ClassesPage,
            '#perfil': ProfilePage,
            '#financeiro': FinancePage,
            '#membros': MembersPage,
            '#configuracoes': SettingsPage
        };
    }

    async handleRouteChange(hash) {
        // Security Check: If not logged in and not on login/register page, redirect to login
        const user = await this.app.auth.getUser();
        const isPublicPage = hash === '#login' || hash === '#register';

        if (!user && !isPublicPage) {
            window.location.hash = '#login';
            return;
        }

        // RBAC: If student tries to access admin pages, redirect to classes
        const adminPages = ['#dashboard', '#financeiro', '#configuracoes'];
        if (user && !user.is_admin && adminPages.includes(hash)) {
            window.location.hash = '#aulas';
            return;
        }

        // Default route for students is #aulas
        let routeHash = hash;
        if (!hash && user) {
            routeHash = user.is_admin ? '#dashboard' : '#aulas';
        }

        const PageClass = this.routes[routeHash] || (user?.is_admin ? DashboardPage : ClassesPage);
        
        const page = new PageClass(this.app);
        const html = await page.render();
        this.app.render(html);
        
        if (page.afterRender) {
            page.afterRender();
        }
    }
}
