import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

export class AuthService {
    constructor() {
        console.log("🛠️ AuthService: Inicializando Client...");
        try {
            this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            this.currentUser = null;
            this.onAuthStateChangeCallback = null;

            // Listen for auth changes
            this.client.auth.onAuthStateChange(async (event, session) => {
                console.log("🔔 Auth Event:", event);
                if (session) {
                    try {
                        console.log("🔄 Atualizando perfil para:", session.user.id);
                        await this._refreshUserProfile(session.user.id);
                    } catch (e) {
                        console.error("⚠️ Erro ao atualizar perfil no evento auth:", e);
                    }
                } else {
                    this.currentUser = null;
                }
                if (this.onAuthStateChangeCallback) this.onAuthStateChangeCallback(event, session);
            });
        } catch (e) {
            console.error("❌ AuthService: Falha crítica ao criar client:", e);
        }
    }

    async init() {
        console.log("🔍 AuthService: Recuperando sessão...");
        try {
            // Aumentamos para 15 segundos para dar mais fôlego à conexão
            const sessionPromise = this.client.auth.getSession();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout ao buscar sessão")), 15000));
            
            const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
            if (error) throw error;
            
            if (session) {
                console.log("👤 AuthService: Sessão ativa encontrada para", session.user.email);
                await this._refreshUserProfile(session.user.id);
            } else {
                console.log("🚪 AuthService: Nenhuma sessão ativa.");
            }
        } catch (e) {
            console.error("❌ AuthService: Erro ou Timeout ao buscar sessão:", e);
            // Fallback: Tentamos ver se o listener já capturou o usuário
            if (this.currentUser) {
                console.log("✅ Recuperação via fallback de evento bem sucedida.");
            } else {
                this.currentUser = null;
            }
        }
        return this.currentUser;
    }
    async _refreshUserProfile(userId) {
        try {
            console.log("📡 Buscando dados da tabela profiles...");
            
            // Adicionamos um timeout de 5 segundos também na busca do perfil
            const fetchPromise = this.client
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout ao buscar perfil")), 5000));

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
                
            if (error) {
                console.warn("⚠️ Perfil não encontrado ou timeout:", error.message);
                // Se falhar o perfil, mantemos o que temos ou um padrão para não travar o app
                if (!this.currentUser) {
                    this.currentUser = { id: userId, full_name: 'Usuário', role: 'student' };
                }
                return;
            }

            if (data) {
                this.currentUser = { ...data };
                
                // Tentativa segura de carregar dados da academia
                try {
                    const { data: academyData } = await this.client
                        .from('academies')
                        .select('id, name, logo_url')
                        .eq('id', data.academy_id)
                        .single();
                    
                    if (academyData) this.currentUser.academy = academyData;
                } catch (e) {
                    console.warn("⚠️ Falha ao buscar identidade visual:", e.message);
                }
                
                console.log("✅ Perfil carregado com sucesso.");
            }
        } catch (e) {
            console.error("❌ Erro ou Timeout ao ler profiles:", e);
            // NÃO setamos this.currentUser aqui para permitir nova tentativa no próximo getUser()
        }
    }

    async getUser() {
        // Se já temos o usuário VÁLIDO, retornamos imediatamente
        if (this.currentUser && this.currentUser.full_name !== 'Erro de Carregamento') {
            return this.currentUser;
        }
        
        // Se não temos ou o que temos é um erro, tentamos carregar
        try {
            const { data: { session } } = await this.client.auth.getSession();
            if (session) {
                await this._refreshUserProfile(session.user.id);
            }
        } catch (e) {
            console.warn("⚠️ Falha ao obter usuário em getUser");
        }
        
        return this.currentUser;
    }

    async login(email, password) {
        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password
        });

        if (error) return { success: false, error: error.message };
        
        await this._refreshUserProfile(data.user.id);
        return { success: true, user: this.currentUser };
    }

    async signUp(email, password, fullName, academyId, metadata = {}) {
        const { data, error } = await this.client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    academy_id: academyId,
                    ...metadata
                }
            }
        });

        if (error) return { success: false, error: error.message };
        return { success: true, data };
    }

    async logout() {
        await this.client.auth.signOut();
        this.currentUser = null;
        window.location.hash = '#login';
    }

    async updateProfile(updates) {
        try {
            const user = await this.getUser();
            if (!user) throw new Error("Usuário não identificado.");

            // 1. Se o e-mail mudou, atualizamos no Auth do Supabase
            if (updates.email && updates.email !== this.currentUser.email) {
                const { error: authError } = await this.client.auth.updateUser({ email: updates.email });
                if (authError) throw authError;
                console.log("📧 E-mail de autenticação atualizado (pendente confirmação).");
            }

            // 2. Atualizamos os dados na tabela profiles
            // Removemos o e-mail do objeto de update se ele for o e-mail de login (opcional, dependendo do schema)
            const { error: profileError } = await this.client
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 3. Atualizamos o estado local
            await this._refreshUserProfile(user.id);
            return { success: true };
        } catch (e) {
            console.error("❌ Erro ao atualizar perfil:", e);
            return { success: false, error: e.message };
        }
    }

    onAuthStateChange(callback) {
        this.onAuthStateChangeCallback = callback;
    }

async uploadImage(file, bucket = 'avatars', folder = 'avatars') {
        try {
            const user = await this.getUser();
            if (!user) throw new Error("Usuário não identificado.");

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            const { data, error } = await this.client.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type || 'image/jpeg'
                });

            if (error) throw error;

            // Gera URL de assinatura válida por 1 hora (3600 segundos)
            const { data: signedData, error: signError } = await this.client.storage
                .from(bucket)
                .createSignedUrl(filePath, 3600);

            if (signError) throw signError;

            return { success: true, url: signedData.signedUrl };
        } catch (e) {
            console.error("❌ Erro ao fazer upload:", e);
            return { success: false, error: e.message };
        }
    }
}
    }

    async getSignedUrl(filePath) {
        try {
            // Remove o prefixo do bucket se existir
            const cleanPath = filePath.replace('avatars/', '');
            
            const { data, error } = await this.client.storage
                .from('avatars')
                .createSignedUrl(cleanPath, 3600);

            if (error) throw error;
            return data.signedUrl;
        } catch (e) {
            console.error("❌ Erro ao gerar URL:", e);
            return null;
        }
    }

    async resizeAndUploadImage(file, maxWidth = 1080, maxHeight = 1080, bucket = 'avatars', folder = 'avatars') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = async () => {
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(async (blob) => {
                        const resizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });

                        const result = await this.uploadImage(resizedFile, bucket, folder);
                        resolve(result);
                    }, 'image/jpeg', 0.85);
                };
                img.onerror = () => reject(new Error("Erro ao carregar imagem"));
            };
            reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
        });
    }
}
