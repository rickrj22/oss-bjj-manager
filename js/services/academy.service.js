export class AcademyService {
    constructor(app) {
        this.app = app;
    }

    get client() {
        return this.app.auth.client;
    }

    getLocalDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    async getTodaysClasses(customAcademyId = null) {
        const user = await this.app.auth.getUser();
        
        // If a specific academy is requested, use it; otherwise use the user's default
        const academyId = customAcademyId || user.academy_id;
        if (!academyId) return [];

        const today = new Date().getDay();
        const dateStr = this.getLocalDateString();
        
        const beltOrder = { 
            'black belt': 17, 'brown belt': 16, 'purple belt': 15, 'blue belt': 14,
            'green black belt': 13, 'green belt': 12, 'green white belt': 11,
            'orange black belt': 10, 'orange belt': 9, 'orange white belt': 8,
            'yellow black belt': 7, 'yellow belt': 6, 'yellow white belt': 5,
            'grey black belt': 4, 'grey belt': 3, 'grey white belt': 2,
            'white belt': 1 
        };

        const { data, error } = await this.client
            .from('classes')
            .select(`
                *,
                coach:profiles!classes_coach_id_fkey(id, full_name, avatar_url, current_belt, current_stripes),
                technique:daily_techniques(
                    technique, 
                    date,
                    professor:profiles(id, full_name, avatar_url, current_belt, current_stripes)
                ),
                attendees:attendance(
                    id,
                    status,
                    check_in_date,
                    user:profiles(id, full_name, avatar_url, current_belt, current_stripes, role)
                )
            `)
            .eq('academy_id', academyId)
            .eq('active', true)
            .eq('day_of_week', today)
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Error fetching classes:', error);
            return [];
        }

        return data.map(c => {
            const techObj = c.technique?.find(t => t.date === dateStr);
            const teacherId = techObj?.professor?.id;

            const attendeeMap = new Map();
            (c.attendees || []).forEach(a => {
                if (a.check_in_date === dateStr && !attendeeMap.has(a.user.id)) {
                    attendeeMap.set(a.user.id, {
                        attendanceId: a.id,
                        id: a.user.id,
                        name: a.user.full_name,
                        avatar: a.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.user.full_name)}&background=random`,
                        belt: (a.user.current_belt || 'white belt').toLowerCase(),
                        stripes: a.user.current_stripes || 0,
                        role: a.user.role,
                        status: a.status || 'pending'
                    });
                }
            });

            const sortedAttendees = Array.from(attendeeMap.values()).sort((a, b) => {
                // Priority 1: Technician of the day
                const isA = a.id === teacherId;
                const isB = b.id === teacherId;
                if (isA && !isB) return -1;
                if (!isA && isB) return 1;

                // Priority 2: Belt Hierarchy
                const orderA = beltOrder[a.belt] || 0;
                const orderB = beltOrder[b.belt] || 0;
                if (orderA !== orderB) return orderB - orderA;

                // Priority 3: Stripes
                return b.stripes - a.stripes;
            });

            return {
                id: c.id,
                title: c.title,
                coach: c.coach ? c.coach.full_name : 'A definir',
                time: c.start_time.substring(0, 5) + (c.end_time ? ' às ' + c.end_time.substring(0, 5) : ''),
                type: c.type || 'gi',
                technique: techObj ? {
                    text: techObj.technique,
                    professor: techObj.professor
                } : null,
                attendees: sortedAttendees
            };
        });
    }

    async getSidebarData() {
        const { data: academies } = await this.getAcademies();
        const primary = (academies || []).find(a => a.is_primary) || (academies || [])[0] || null;
        return primary;
    }

    async getDashboardStats() {
        console.log("📊 AcademyService: Calculando estatísticas...");
        try {
            // Alunos Ativos vs Inativos e Planos (usando getPlans para pegar fallbacks se necessário)
            const [profilesRes, plansRes, paymentsRes] = await Promise.all([
                this.client.from('profiles').select('*'),
                this.getPlans(),
                this.client.from('financial_records').select('*')
            ]);
            
            if (profilesRes.error) throw profilesRes.error;

            const safeProfiles = profilesRes.data || [];
            const plans = plansRes.data || [];
            const safePayments = paymentsRes.data || [];
            
            const activeProfiles = safeProfiles.filter(p => p.is_active);
            const activeCount = activeProfiles.length;
            const inactiveCount = safeProfiles.length - activeCount;

            // Financeiro do Mês Atual
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const targetCycle = `${year}-${month.toString().padStart(2, '0')}`;
            
            let paidRevenue = 0;
            let pendingRevenue = 0;

            activeProfiles.forEach(member => {
                const paidRecord = safePayments.find(r => {
                    if (r.user_id !== member.id || r.status !== 'paid') return false;
                    const dateStr = (r.due_date || r.payment_date || r.created_at).substring(0, 7);
                    return dateStr === targetCycle;
                });
                
                if (paidRecord) {
                    paidRevenue += Number(paidRecord.amount || 0);
                } else {
                    const plan = plans.find(p => p.id === member.plan_id);
                    if (plan && plan.price > 0) {
                        pendingRevenue += Number(plan.price);
                    }
                }
            });
            
            const totalPotential = paidRevenue + pendingRevenue;
            const percent = totalPotential > 0 ? Math.round((paidRevenue / totalPotential) * 100) : 0;

            return {
                students: { active: activeCount, inactive: inactiveCount },
                finance: { paid: paidRevenue, pending: pendingRevenue, percent }
            };
        } catch (e) {
            console.error("❌ Erro em getDashboardStats:", e);
            return {
                students: { active: 0, inactive: 0 },
                finance: { paid: 0, pending: 0, percent: 0 }
            };
        }
    }

    async getTopStudents() {
        // Busca os 5 alunos com mais presenças no mês atual
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { data, error } = await this.client
            .from('attendance')
            .select('user_id, user:profiles(full_name, avatar_url, current_belt)')
            .eq('status', 'confirmed')
            .gte('attended_at', firstDay);

        if (error || !data) return [];

        const counts = data.reduce((acc, curr) => {
            const id = curr.user_id;
            if (!acc[id]) acc[id] = { 
                name: curr.user.full_name, 
                avatar: curr.user.avatar_url, 
                belt: curr.user.current_belt,
                count: 0 
            };
            acc[id].count++;
            return acc;
        }, {});

        return Object.values(counts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(s => ({
                ...s,
                avatar: s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`
            }));
    }

    async getAnnouncements() {
        const { data } = await this.client
            .from('announcements')
            .select(`*, author:profiles(full_name)`)
            .order('created_at', { ascending: false })
            .limit(3);
        return data || [];
    }

    async getUserStats(userId) {
        try {
            // 1. Fetch primary data in parallel
            const [attendanceRes, historyRes, teachingRes, profileRes] = await Promise.all([
                this.client.from('attendance').select('*').eq('user_id', userId).eq('status', 'confirmed').order('check_in_date', { ascending: true }),
                this.client.from('graduation_history').select('*').eq('profile_id', userId).order('promoted_at', { ascending: true }),
                this.client.from('daily_techniques').select('*', { count: 'exact', head: true }).eq('professor_id', userId),
                this.client.from('profiles').select('created_at, current_belt, current_stripes').eq('id', userId).single()
            ]);

            const allAttendance = attendanceRes.data || [];
            const beltHistory = historyRes.data || [];
            const profile = profileRes.data;
            const totalTrainings = allAttendance.length;
            const classesTaught = teachingRes.count || 0;

            const historyByBelt = [];
            
            if (beltHistory.length > 0) {
                for (let i = 0; i < beltHistory.length; i++) {
                    const current = beltHistory[i];
                    const next = beltHistory[i + 1];
                    const startDate = new Date(current.promoted_at);
                    const endDate = next ? new Date(next.promoted_at) : new Date();

                    const count = allAttendance.filter(a => {
                        const d = new Date(a.check_in_date);
                        return d >= startDate && (!next || d < endDate);
                    }).length;

                    let eventLabel = 'Graduação';
                    if (i === 0) {
                        eventLabel = 'Início';
                    } else {
                        const previous = beltHistory[i - 1];
                        if (current.belt === previous.belt) {
                            eventLabel = 'Ganho de grau';
                        }
                    }

                    historyByBelt.push({
                        belt: current.belt,
                        stripes: current.stripes || 0,
                        count: count,
                        hours: count * 1.5,
                        date: current.promoted_at,
                        notes: eventLabel
                    });
                }
            } else if (profile) {
                // Fallback para alunos antigos sem histórico: Criar um ponto de "Início" virtual
                historyByBelt.push({
                    belt: profile.current_belt || 'white belt',
                    stripes: profile.current_stripes || 0,
                    count: totalTrainings,
                    hours: totalTrainings * 1.5,
                    date: profile.created_at,
                    notes: 'Início'
                });
            }

            // Calculate current belt progress
            let trainingsInCurrentBelt = totalTrainings;
            if (beltHistory.length > 0) {
                const last = beltHistory[beltHistory.length - 1];
                const lastDate = new Date(last.promoted_at);
                trainingsInCurrentBelt = allAttendance.filter(a => new Date(a.check_in_date) >= lastDate).length;
            }

            return {
                totalTrainings,
                totalHours: totalTrainings * 1.5,
                classesTaught,
                trainingsInCurrentBelt,
                historyByBelt: historyByBelt.reverse(),
                isReadyForStripe: (trainingsInCurrentBelt % 50) >= 40,
                isReadyForBelt: trainingsInCurrentBelt >= 200
            };
        } catch (e) {
            console.error("❌ Error in getUserStats:", e);
            return { totalTrainings: 0, totalHours: 0, classesTaught: 0, trainingsInCurrentBelt: 0, historyByBelt: [] };
        }
    }

    async saveDailyTechnique(classId, technique) {
        const user = await this.app.auth.getUser();
        const date = this.getLocalDateString();

        const { error } = await this.client
            .from('daily_techniques')
            .upsert({
                class_id: classId,
                technique: technique,
                date: date,
                professor_id: user.id
            });

        if (!error) {
            // Realiza check-in automático para quem definiu a técnica
            await this.checkIn(classId);
        }

        return { success: !error, error: error?.message };
    }

    async deleteDailyTechnique(classId) {
        const date = this.getLocalDateString();
        const { error } = await this.client
            .from('daily_techniques')
            .delete()
            .eq('class_id', classId)
            .eq('date', date);

        return { success: !error, error: error?.message };
    }

    async createAnnouncement(content) {
        const user = await this.app.auth.getUser();
        const { error } = await this.client
            .from('announcements')
            .insert({
                content: content,
                author_id: user.id,
                academy_id: user.academy_id
            });

        return { success: !error, error: error?.message };
    }

    async checkIn(classId) {
        const user = await this.app.auth.getUser();
        
        // Block check-in if not active OR if payment is overdue
        const paymentOverdue = await this.checkUserPaymentStatus(user.id);

        if (!user.is_active || paymentOverdue) {
            return { 
                success: false, 
                error: paymentOverdue ? 
                    'Check-in bloqueado: Sua mensalidade está atrasada. Procure a secretaria.' :
                    'Check-in bloqueado: Sua conta está inativa. Procure a secretaria.'
            };
        }

        const { error } = await this.client
            .from('attendance')
            .insert({
                user_id: user.id,
                class_id: classId,
                check_in_date: this.getLocalDateString(),
                status: 'confirmed'
            });

        if (error && error.code !== '23505') { 
            console.error('Error recording check-in:', error);
            return { success: false, error: 'Erro ao registrar check-in.' };
        }

        return { success: true };
    }

    async confirmAttendance(classId, userId, customDate = null, attendanceId = null) {
        let query = this.client.from('attendance').update({ status: 'confirmed' });
        
        if (attendanceId) {
            query = query.eq('id', attendanceId);
        } else {
            const date = customDate || this.getLocalDateString();
            query = query.eq('class_id', classId).eq('user_id', userId).eq('check_in_date', date);
        }

        const { error } = await query;
        return { success: !error, error: error?.message };
    }

    async unconfirmAttendance(classId, userId, customDate = null, attendanceId = null) {
        let query = this.client.from('attendance').delete();
        
        if (attendanceId) {
            query = query.eq('id', attendanceId);
        } else {
            const date = customDate || this.getLocalDateString();
            query = query.eq('class_id', classId).eq('user_id', userId).eq('check_in_date', date);
        }

        const { error } = await query;
        if (error) console.error('Error deleting attendance:', error);
        return { success: !error, error: error?.message };
    }

    async getDetailedFinanceData() {
        const user = await this.app.auth.getUser();
        if (!user.is_admin) return null;

        // Use consistent member fetching
        const members = await this.getAcademyMembers();
        const { data: plans } = await this.getPlans();
        const planMap = (plans || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

        const { data: records } = await this.client
            .from('financial_records')
            .select('*')
            .order('due_date', { ascending: false });

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const fifteenDaysFromNow = new Date(now.getTime() + (15 * 24 * 60 * 60 * 1000));

        const stats = {
            activeMembers: [],
            inactiveMembers: [],
            upcomingPayments: [],
            revenueForecast: 0,
            overdueRevenue: 0
        };

        members.forEach(m => {
            const plan = planMap[m.plan_id];
            const memberRecords = (records || []).filter(r => r.user_id === m.id);
            const unpaidRecords = memberRecords.filter(r => r.status === 'unpaid');
            const latestUnpaid = unpaidRecords.length > 0 ? unpaidRecords[0] : null;
            
            let isOverdueLong = false;
            if (latestUnpaid) {
                const dueDate = new Date(latestUnpaid.due_date);
                if (dueDate < thirtyDaysAgo) isOverdueLong = true;
            }

            // A student is inactive if: No Plan OR Explicitly Inactive OR Overdue > 30 days
            const isInactive = !m.plan_id || isOverdueLong || !m.is_active;

            if (isInactive) {
                stats.inactiveMembers.push({ 
                    ...m, 
                    plan_name: plan?.name || 'S/ Plano',
                    reason: !m.plan_id ? 'Sem Plano' : (isOverdueLong ? 'Atraso > 30d' : 'Inativo')
                });
            } else {
                stats.activeMembers.push({ ...m, plan_name: plan?.name || 'S/ Plano' });
                
                // Forecast logic
                if (plan && plan.price > 0) {
                    // 1. Check if they have an existing unpaid record due soon
                    const existingUpcoming = unpaidRecords.find(r => {
                        const d = new Date(r.due_date);
                        return d >= now && d <= fifteenDaysFromNow;
                    });

                    if (existingUpcoming) {
                        stats.upcomingPayments.push({ ...m, amount: plan.price, due_date: existingUpcoming.due_date });
                        stats.revenueForecast += plan.price;
                    } else {
                        // 2. If no upcoming record, check if their 'payment_due_date' falls in the next 15 days
                        // and they haven't paid this month's yet
                        const dueDay = m.payment_due_date || 10;
                        let forecastDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
                        
                        // If the date passed this month, look at next month
                        if (forecastDate < now) {
                            forecastDate = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
                        }

                        if (forecastDate <= fifteenDaysFromNow) {
                            // Check if they already have a PAID record for this cycle to avoid double counting
                            const alreadyPaid = memberRecords.some(r => {
                                const d = new Date(r.due_date);
                                return r.status === 'paid' && d.getMonth() === forecastDate.getMonth() && d.getFullYear() === forecastDate.getFullYear();
                            });

                            if (!alreadyPaid) {
                                stats.upcomingPayments.push({ ...m, amount: plan.price, due_date: forecastDate.toISOString() });
                                stats.revenueForecast += plan.price;
                            }
                        }
                    }
                }
            }
        });

        return stats;
    }

    async recordPayment(paymentData) {
        const user = await this.app.auth.getUser();
        
        // 1. Get the academy_id from the student being paid
        const { data: studentProfile } = await this.client
            .from('profiles')
            .select('academy_id')
            .eq('id', paymentData.userId)
            .single();
            
        const academyId = studentProfile?.academy_id || user.academy_id;

        const { error } = await this.client
            .from('financial_records')
            .insert([{
                user_id: paymentData.userId,
                amount: paymentData.amount,
                status: 'paid',
                payment_method: paymentData.method || 'PIX',
                transaction_code: paymentData.transactionCode,
                payment_date: paymentData.paymentDate,
                due_date: paymentData.paymentDate,
                academy_id: academyId
            }]);
        
        return { success: !error, error: error?.message };
    }

    async cancelCheckIn(classId) {
        const user = await this.app.auth.getUser();
        const { error } = await this.client
            .from('attendance')
            .delete()
            .eq('user_id', user.id)
            .eq('class_id', classId);

        if (error) {
            console.error('Error cancelling check-in:', error);
            return { success: false, error: 'Erro ao cancelar check-in.' };
        }

        return { success: true };
    }

    async getAcademyMembers() {
        const user = await this.app.auth.getUser();
        let query = this.client.from('profiles').select('*');
            
        if (!user.is_admin) {
            query = query.eq('academy_id', user.academy_id);
        }

        const { data: members, error } = await query.order('full_name', { ascending: true });
        if (error) return [];

        // Try to fetch user_academies
        let userAcademiesMap = {};
        if (members.length > 0) {
            const { data: uaData, error: uaError } = await this.client
                .from('user_academies')
                .select('user_id, academy_id, academies(name)')
                .in('user_id', members.map(m => m.id));

            if (!uaError && uaData) {
                uaData.forEach(ua => {
                    if (!userAcademiesMap[ua.user_id]) userAcademiesMap[ua.user_id] = [];
                    userAcademiesMap[ua.user_id].push({
                        id: ua.academy_id,
                        name: ua.academies?.name || 'Academia'
                    });
                });
            }
        }

        const { data: allAcads } = await this.client.from('academies').select('id, name');
        const acadMap = (allAcads || []).reduce((acc, curr) => { acc[curr.id] = curr.name; return acc; }, {});

        // Para cada membro, buscar estatística básica de graduação
        const membersWithStats = await Promise.all(members.map(async (m) => {
            const { data: lastGrad } = await this.client
                .from('graduation_history')
                .select('promoted_at')
                .eq('profile_id', m.id)
                .order('promoted_at', { ascending: false })
                .limit(1);
            
            const startDate = lastGrad && lastGrad[0] ? lastGrad[0].promoted_at : '2000-01-01';
            
            const { count } = await this.client
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', m.id)
                .gte('check_in_date', startDate);
            
            let linkedAcademies = userAcademiesMap[m.id];
            if (!linkedAcademies && m.academy_id) {
                linkedAcademies = [{ id: m.academy_id, name: acadMap[m.academy_id] || 'Academia Padrão' }];
            }

            return {
                ...m,
                linkedAcademies: linkedAcademies || [],
                trainingsSinceGrad: count || 0,
                isReadyForStripe: (count % 50) >= 40,
                isReadyForBelt: count >= 200 && m.current_stripes >= 4
            };
        }));

        return membersWithStats;
    }

    async createNewMember(memberData) {
        try {
            const currentUser = await this.app.auth.getUser();
            let newUserId = null;
            let authCreated = false;

            // 1. Attempt to create auth user via signUp
            const { data: signUpData, error: signUpError } = await this.client.auth.signUp({
                email: memberData.email,
                password: memberData.password,
                options: {
                    data: {
                        full_name: memberData.full_name,
                        academy_id: memberData.academy_id,
                        current_belt: memberData.current_belt || 'white belt',
                        current_stripes: memberData.current_stripes || 0
                    },
                    // Skip email confirmation redirect — allows auto-confirm if
                    // "Enable email confirmations" is OFF in Supabase dashboard
                    emailRedirectTo: undefined
                }
            });

            if (signUpError) {
                const msg = (signUpError.message || '').toLowerCase();
                // If rate-limited, fall back to creating just a profile row
                if (msg.includes('rate limit') || msg.includes('rate_limit') || signUpError.status === 429) {
                    console.warn('⚠️ Rate limit atingido no Supabase Auth. Criando perfil sem conta de login...');
                    // Generate a random UUID for the profile-only member
                    newUserId = crypto.randomUUID();
                    authCreated = false;
                } else {
                    return { success: false, error: signUpError.message };
                }
            } else {
                newUserId = signUpData.user?.id;
                authCreated = true;
            }

            if (!newUserId) return { success: false, error: 'Não foi possível obter o ID do novo usuário.' };

            // 2. Update or insert the profile row
            const profilePayload = {
                full_name: memberData.full_name,
                email: memberData.email,
                cpf: memberData.cpf || null,
                phone: memberData.phone || null,
                birth_date: memberData.birth_date || null,
                current_belt: memberData.current_belt || 'white belt',
                current_stripes: memberData.current_stripes || 0,
                role: memberData.role || 'student',
                is_admin: memberData.is_admin || false,
                is_active: true,
                academy_id: memberData.academy_id
            };

            if (authCreated) {
                // Auth trigger may have created the profile — try update first
                const { error: profileError } = await this.client
                    .from('profiles')
                    .update(profilePayload)
                    .eq('id', newUserId);

                if (profileError) {
                    console.warn('⚠️ Profile update failed, tentando insert:', profileError.message);
                    const { error: insertError } = await this.client
                        .from('profiles')
                        .insert([{ id: newUserId, ...profilePayload, created_at: new Date() }]);
                    
                    if (insertError) return { success: false, error: insertError.message };
                }
            } else {
                // No auth account — insert profile directly
                const { error: insertError } = await this.client
                    .from('profiles')
                    .insert([{ id: newUserId, ...profilePayload, created_at: new Date() }]);

                if (insertError) return { success: false, error: 'Erro ao criar perfil: ' + insertError.message };
            }

            // 3. Record initial graduation history
            await this.client.from('graduation_history').insert({
                profile_id: newUserId,
                belt: profilePayload.current_belt,
                stripes: profilePayload.current_stripes,
                promoted_at: new Date()
            });

            // 4. Link the user to the academy via user_academies
            if (memberData.academy_id) {
                const { error: linkError } = await this.client
                    .from('user_academies')
                    .insert({ user_id: newUserId, academy_id: memberData.academy_id });
                
                if (linkError) {
                    console.warn('⚠️ Erro ao vincular academia:', linkError.message);
                }
            }

            // 4. Restore the current admin session (signUp may have changed the active session)
            const { data: { session } } = await this.client.auth.getSession();
            if (!session || session.user?.id !== currentUser.id) {
                console.warn('⚠️ Sessão alterada após signUp. O admin pode precisar fazer login novamente.');
            }

            const result = { success: true, data: { id: newUserId } };

            // If profile-only (no auth), warn the admin
            if (!authCreated) {
                result.warning = 'Membro criado apenas como perfil (sem conta de login) devido ao limite de e-mails do Supabase. Para habilitar o login, desative a confirmação de e-mail no painel do Supabase ou aguarde ~1 hora e recadastre.';
            }

            return result;
        } catch (e) {
            console.error('❌ Erro ao criar membro:', e);
            return { success: false, error: e.message };
        }
    }

    async updateUserRole(userId, role, isAdmin) {
        const { error } = await this.client
            .from('profiles')
            .update({ 
                role: role, 
                is_admin: isAdmin,
                updated_at: new Date()
            })
            .eq('id', userId);

        if (error) return { success: false, error: error.message };
        return { success: true };
    }

    async addAcademyToUser(userId, academyId) {
        const { error } = await this.client
            .from('user_academies')
            .insert({ user_id: userId, academy_id: academyId });
        
        if (error) return { success: false, error: error.message };
        return { success: true };
    }

    async removeAcademyFromUser(userId, academyId) {
        const { error } = await this.client
            .from('user_academies')
            .delete()
            .eq('user_id', userId)
            .eq('academy_id', academyId);
        
        if (error) return { success: false, error: error.message };
        return { success: true };
    }

    async getFinancialRecords() {
        const user = await this.app.auth.getUser();
        
        // 1. Simples fetch de registros (sem order para evitar erros de cache/schema)
        let query = this.client.from('financial_records').select('*');
        
        if (!user.is_admin) {
            query = query.eq('user_id', user.id);
        }
        // Administradores veem todos os registros (sem filtro de academy_id para evitar esconder registros de outras unidades/alunos)

        const { data: records, error } = await query;

        if (error || !records) {
            console.error('Error fetching financial records:', error);
            return [];
        }

        // 2. Sort manual (mais seguro)
        records.sort((a, b) => new Date(b.due_date || b.created_at) - new Date(a.due_date || a.created_at));

        // 3. Fetch de perfis para nomes
        const userIds = [...new Set(records.map(r => r.user_id))];
        if (userIds.length > 0) {
            const { data: profiles } = await this.client
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);
            
            const profileMap = (profiles || []).reduce((acc, p) => { acc[p.id] = p.full_name; return acc; }, {});
            
            return records.map(r => ({
                ...r,
                profiles: { full_name: profileMap[r.user_id] || 'Usuário' }
            }));
        }

        return records.map(r => ({ ...r, profiles: { full_name: 'Usuário' } }));
    }

    async getGraduationHistory(studentId) {
        const { data, error } = await this.client
            .from('graduation_history')
            .select(`*, professor:profiles!graduation_history_professor_id_fkey(full_name, avatar_url, current_belt, current_stripes)`)
            .eq('profile_id', studentId)
            .order('promoted_at', { ascending: false });

        if (error) {
            console.error('Error fetching graduation history:', error);
            return [];
        }
        return data || [];
    }

    async updateGraduation(studentId, belt, stripes, notes) {
        const user = await this.app.auth.getUser();
        
        const { error: profileError } = await this.client
            .from('profiles')
            .update({ 
                current_belt: belt, 
                current_stripes: stripes,
                updated_at: new Date()
            })
            .eq('id', studentId);

        if (profileError) return { success: false, error: profileError.message };

        const { error: historyError } = await this.client
            .from('graduation_history')
            .insert({
                profile_id: studentId,
                belt: belt,
                stripes: stripes,
                notes: notes,
                professor_id: user.id,
                promoted_at: new Date()
            });

        if (historyError) {
            console.warn('History not recorded:', historyError.message);
            // I'll try belt/stripes if belt_to/stripes_to fail, but better to be consistent
        }

        return { success: true };
    }

    async createClass(classData) {
        const { error } = await this.client
            .from('classes')
            .insert(classData);
        return { success: !error, error: error?.message };
    }

    async getAcademies() {
        const { data, error } = await this.client.from('academies').select('*').order('name');
        return { success: !error, data, error: error?.message };
    }

    async updateMember(userId, updates) {
        // 1. Get current data to check for graduation changes
        const { data: current, error: fetchError } = await this.client
            .from('profiles')
            .select('current_belt, current_stripes')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error("❌ Erro ao buscar dados atuais do membro:", fetchError);
        }

        const { error } = await this.client
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (!error && current) {
            // Comparação robusta (ignora espaços e case)
            const oldBelt = (current.current_belt || '').trim().toLowerCase();
            const newBelt = (updates.current_belt || '').trim().toLowerCase();
            const oldStripes = parseInt(current.current_stripes || 0);
            const newStripes = updates.current_stripes !== undefined ? parseInt(updates.current_stripes) : oldStripes;

            const beltChanged = newBelt && newBelt !== oldBelt;
            const stripesChanged = newStripes !== oldStripes;

            console.log("🎓 Auditoria de Graduação:", { 
                old: `${oldBelt} (${oldStripes}º)`, 
                new: `${newBelt} (${newStripes}º)`,
                beltChanged, 
                stripesChanged 
            });

            if (beltChanged || stripesChanged) {
                const user = await this.app.auth.getUser();
                const histEntry = {
                    profile_id: userId,
                    belt: updates.current_belt, // Usa exatamente o valor que o profiles aceitou
                    stripes: newStripes,
                    professor_id: user.id,
                    promoted_at: new Date().toISOString()
                };

                const { error: histError } = await this.client
                    .from('graduation_history')
                    .insert(histEntry);

                if (histError) {
                    console.error("❌ Erro ao gravar histórico:", histError);
                    alert("Erro ao gravar histórico: " + histError.message);
                } else {
                    console.log("✅ Histórico gravado com sucesso:", histEntry);
                }
            }
        }

        return { success: !error, error: error?.message };
    }

    async deleteMember(userId) {
        const { error } = await this.client
            .from('profiles')
            .delete()
            .eq('id', userId);
        return { success: !error, error: error?.message };
    }

    async updateUserRole(memberId, role, isAdmin) {
        const { error } = await this.client
            .from('profiles')
            .update({ role, is_admin: isAdmin })
            .eq('id', memberId);
        return { success: !error, error: error?.message };
    }

    async updateMemberAcademy(memberId, academyId) {
        const { error } = await this.client
            .from('profiles')
            .update({ academy_id: academyId })
            .eq('id', memberId);
        return { success: !error, error: error?.message };
    }

    async createAcademy(data) {
        const { error } = await this.client.from('academies').insert(data);
        return { success: !error, error: error?.message };
    }

    async updateAcademy(id, data) {
        const { error } = await this.client.from('academies').update(data).eq('id', id);
        return { success: !error, error: error?.message };
    }

    async getClassesByAcademy(academyId) {
        const { data, error } = await this.client
            .from('classes')
            .select('*')
            .eq('academy_id', academyId)
            .eq('active', true)
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true });
        return { success: !error, data, error: error?.message };
    }

    async deleteClass(classId) {
        const { data, error } = await this.client
            .from('classes')
            .update({ active: false })
            .eq('id', classId)
            .select();
        
        if (error) return { success: false, error: error.message };
        if (!data || data.length === 0) return { success: false, error: "Registro não encontrado ou sem permissão" };
        
        return { success: true };
    }

    async updateClass(classId, updates) {
        const { error } = await this.client
            .from('classes')
            .update(updates)
            .eq('id', classId);
        return { success: !error, error: error?.message };
    }

    // --- PLAN MANAGEMENT ---

    async getPlans() {
        const { data, error } = await this.client.from('plans').select('*').order('price');
        
        // Fallback plans if table doesn't exist or is empty
        const fallbackPlans = [
            { id: 'p1', name: 'Kids Faixa Branca', age_range: '04 - 15 anos', payment_type: 'Mensal', price: 70.00 },
            { id: 'p2', name: 'Kids Faixa Verde', age_range: '04 - 15 anos', payment_type: 'Trimestral', price: 190.00 },
            { id: 'p3', name: 'Faixa Branca', age_range: '+ 16 anos', payment_type: 'Mensal', price: 100.00 },
            { id: 'p4', name: 'Faixa Roxa', age_range: '+ 16 anos', payment_type: 'Trimestral', price: 250.00 },
            { id: 'p5', name: 'Faixa Preta', age_range: '+ 16 anos', payment_type: 'Anual', price: 900.00 },
            { id: 'p6', name: 'Faixa Coral', age_range: 'Mestre', payment_type: 'Especial', price: 0, is_master: true }
        ];

        if (error || !data || data.length === 0) return { success: true, data: fallbackPlans };
        return { success: true, data };
    }

    async createPlan(planData) {
        const { error } = await this.client.from('plans').insert(planData);
        return { success: !error, error: error?.message };
    }

    async updatePlan(id, updates) {
        const { error } = await this.client.from('plans').update(updates).eq('id', id);
        return { success: !error, error: error?.message };
    }

    async deletePlan(id) {
        const { error } = await this.client.from('plans').delete().eq('id', id);
        return { success: !error, error: error?.message };
    }

    async checkUserPaymentStatus(userId) {
        // Find user profile
        const { data: user } = await this.client.from('profiles').select('plan_id, payment_due_date').eq('id', userId).single();
        if (!user) return false;

        // "Faixa Coral" (p6) or Master plans are exempt
        if (user.plan_id === 'p6') return false;

        // Basic overdue logic: Check if current date is past due date in financial_records
        // For simplicity, we check if there's a record for the current month that is UNPAID and past its due date
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { data: unpaidRecords } = await this.client
            .from('financial_records')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'unpaid')
            .lt('due_date', now.toISOString());

        return unpaidRecords && unpaidRecords.length > 0;
    }

    async getAcademyActiveMembersWithPhone(academyId) {
        const { data, error } = await this.client
            .from('profiles')
            .select('full_name, phone')
            .eq('academy_id', academyId)
            .eq('is_active', true)
            .not('phone', 'is', null);

        if (error) {
            console.error('Error fetching members with phone:', error);
            return [];
        }

        return data.filter(m => m.phone && m.phone.trim().length >= 8);
    }
}
