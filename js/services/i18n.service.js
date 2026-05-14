
export const translations = {
    pt: {
        login_title: "OSS",
        login_subtitle: "Academy Management",
        email_or_cpf: "E-mail ou CPF",
        password: "Senha",
        forgot_password: "Esqueci minha senha",
        login_btn: "Entrar no Tatame",
        no_account: "Ainda não tem conta?",
        register_link: "Cadastrar-se",
        learn_more: "Gostaria de saber mais sobre o aplicativo?",
        
        register_title: "OSS",
        register_subtitle: "Junte-se ao Tatame",
        full_name: "Nome Completo",
        no_email: "Não possui e-mail",
        phone: "Telefone",
        register_btn: "Cadastrar",
        has_account: "Já tem uma conta?",
        login_link: "Entrar",
        
        theme_light: "Modo Claro",
        theme_dark: "Modo Escuro"
    },
    en: {
        login_title: "OSS",
        login_subtitle: "Academy Management",
        email_or_cpf: "Email or Tax ID (CPF)",
        password: "Password",
        forgot_password: "Forgot password?",
        login_btn: "Enter the Mats",
        no_account: "Don't have an account?",
        register_link: "Sign Up",
        learn_more: "Would you like to know more about the app?",
        
        register_title: "OSS",
        register_subtitle: "Join the Mats",
        full_name: "Full Name",
        no_email: "No email address",
        phone: "Phone",
        register_btn: "Sign Up",
        has_account: "Already have an account?",
        login_link: "Login",
        
        theme_light: "Light Mode",
        theme_dark: "Dark Mode"
    },
    es: {
        login_title: "OSS",
        login_subtitle: "Academy Management",
        email_or_cpf: "Email o CPF",
        password: "Contraseña",
        forgot_password: "¿Olvidaste tu contraseña?",
        login_btn: "Entrar al Tatami",
        no_account: "¿Aún no tienes cuenta?",
        register_link: "Registrarse",
        learn_more: "¿Te gustaría saber más sobre la aplicación?",
        
        register_title: "OSS",
        register_subtitle: "Únete al Tatami",
        full_name: "Nombre Completo",
        no_email: "No tengo correo electrónico",
        phone: "Teléfono",
        register_btn: "Registrarse",
        has_account: "¿Ya tienes una cuenta?",
        login_link: "Entrar",
        
        theme_light: "Modo Claro",
        theme_dark: "Modo Oscuro"
    }
};

export class I18nService {
    constructor() {
        this.currentLang = localStorage.getItem('oss_bjj_lang') || 'pt';
        this.strings = translations[this.currentLang];
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            this.strings = translations[lang];
            localStorage.setItem('oss_bjj_lang', lang);
        }
    }

    t(key) {
        return this.strings[key] || key;
    }
}
