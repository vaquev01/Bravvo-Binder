import React, { useState } from 'react';
import { User, Mail, Briefcase, Building, Zap, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { storageService } from '../../services/storageService';

export function RegisterScreen({ onRegisterSuccess, onBackToLogin }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.target);
        const clientName = formData.get('clientName');
        const email = formData.get('email');
        const username = formData.get('username');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validações básicas
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            setLoading(false);
            return;
        }

        // Verificar se usuário já existe
        const existingCredentials = JSON.parse(localStorage.getItem('bravvo_client_credentials') || '{}');
        if (existingCredentials[username]) {
            setError('Este nome de usuário já está em uso.');
            setLoading(false);
            return;
        }

        try {
            // Gerar ID único para o cliente
            const clientId = `C${Date.now().toString(36).toUpperCase()}`;

            // Criar dados iniciais do cliente usando o template do storageService
            const clientData = storageService.normalizeClientData({
                id: clientId,
                clientName: clientName,
                email: email,
                username: username,
                createdAt: new Date().toISOString()
            });

            // Salvar dados do cliente
            storageService.saveClientData(clientData);

            // Salvar credenciais do cliente (em produção, usar hash)
            const credentials = JSON.parse(localStorage.getItem('bravvo_client_credentials') || '{}');
            credentials[username] = {
                clientId,
                password,
                email,
                clientName
            };
            localStorage.setItem('bravvo_client_credentials', JSON.stringify(credentials));

            // Callback de sucesso
            onRegisterSuccess(clientId, { username, clientName, email });
        } catch (err) {
            console.error('Erro ao criar conta:', err);
            setError('Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-white/20">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[color:var(--brand-accent)]/10 blur-[150px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[color:var(--brand-accent)]/5 blur-[120px] rounded-full"></div>
            <div className="absolute inset-0 opacity-20 mix-blend-soft-light bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:3px_3px]" />

            <div className="relative z-10 w-full max-w-md">
                <div className="card-elevated rounded-xl p-8 shadow-2xl relative overflow-hidden group signature-top-bar">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[color:var(--brand-accent)]/5 blur-3xl rounded-full group-hover:bg-[color:var(--brand-accent)]/10 transition-colors"></div>

                    <button
                        onClick={onBackToLogin}
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft size={14} />
                        Voltar ao Login
                    </button>

                    <h3 className="text-title mb-2">Criar Nova Conta</h3>
                    <p className="text-xs text-gray-400 mb-6">Preencha os dados para começar a usar o Bravvo</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        <div className="space-y-1">
                            <label className="input-label">Nome da Empresa/Marca</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-2.5 text-gray-600" size={16} />
                                <input
                                    name="clientName"
                                    type="text"
                                    placeholder="Ex: Minha Empresa Ltda"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="input-label">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-gray-600" size={16} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="input-label">Usuário</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-gray-600" size={16} />
                                <input
                                    name="username"
                                    type="text"
                                    placeholder="Escolha um nome de usuário"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="input-label">Senha</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-2.5 text-gray-600" size={16} />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="input-label">Confirmar Senha</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-2.5 text-gray-600" size={16} />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Repita a senha"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full mt-4 disabled:opacity-50"
                        >
                            <Zap size={16} className="text-white" />
                            {loading ? 'Criando...' : 'Criar Conta'}
                        </button>
                    </form>

                    <div className="pt-6 text-center">
                        <p className="text-[10px] text-gray-600">
                            Já tem uma conta?{' '}
                            <button
                                onClick={onBackToLogin}
                                className="text-[var(--brand-accent)] hover:text-white transition-colors font-semibold"
                            >
                                Fazer Login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
