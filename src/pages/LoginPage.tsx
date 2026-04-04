import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Mail, ShieldCheck, LogIn } from "lucide-react";
import logo from "@/assets/logo.svg";
import { useNavigate, useRouter } from "@tanstack/react-router";

const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const router = useRouter();


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        setTimeout(() => {
            const ok = login(email, password);
            if (!ok) {
                setError(true);
            } else {
                router.invalidate();
                navigate({ to: '/' });
            }
            setLoading(false);
        }, 600);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#121212] p-0 md:p-4">
            <main className="relative flex min-h-screen w-full max-w-md flex-col justify-center overflow-y-auto bg-[#F2EDE4] px-8 shadow-2xl md:min-h-[850px] md:rounded-[2rem]">

                <div className="pointer-events-none absolute left-0 top-0 h-64 w-full bg-gradient-to-b from-[#E8E0D3] to-transparent opacity-50 md:rounded-t-[2rem]" />

                <div className="relative z-10 w-full">
                    {/* Logo e Título */}
                    <div className="mb-12 text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-[#132245]/20 bg-[#132245]/10">
                            <img src={logo} alt="Massas São José" className="h-16 w-16 object-contain" />
                        </div>
                        <h1
                            className="mb-3 text-4xl leading-[1.1] tracking-tighter text-[#1E1C18]"
                            style={{ fontFamily: "'Libre Baskerville', serif" }}
                        >
                            Massas<br />São José
                        </h1>
                        <p className="text-sm tracking-wide text-[#C8B99A]">Acesso ao Sistema</p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 ml-1 block text-xs uppercase tracking-widest text-[#1E1C18]">
                                Usuário
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Mail className="h-[18px] w-[18px] text-[#C8B99A]" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="usuário"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border border-[#C8B99A]/30 bg-[#E8E0D3] p-4 pl-11 text-sm text-[#1E1C18] outline-none transition-all placeholder:text-[#C8B99A]/60 focus:border-[#132245] focus:ring-1 focus:ring-[#132245] focus:bg-white"
                                    style={{ fontWeight: 400 }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 ml-1 block text-xs uppercase tracking-widest text-[#1E1C18]">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Lock className="h-[18px] w-[18px] text-[#C8B99A]" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-[#C8B99A]/30 bg-[#E8E0D3] p-4 pl-11 text-sm text-[#1E1C18] outline-none transition-all placeholder:text-[#C8B99A]/60 focus:border-[#132245] focus:ring-1 focus:ring-[#132245] focus:bg-white"
                                    style={{ fontWeight: 400 }}
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-center text-sm text-red-600">
                                Email ou senha incorretos
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#132245] p-4 text-[#F2EDE4] shadow-sm transition-transform active:scale-[0.98] disabled:opacity-70"
                        >
                            <span className="text-base tracking-wide" style={{ fontWeight: 400 }}>
                                {loading ? "Entrando…" : "Entrar"}
                            </span>
                            {!loading && <LogIn className="h-[18px] w-[18px]" />}
                        </button>
                    </form>

                    {/* Rodapé */}
                    <div className="mt-12 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[#C8B99A]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <p className="text-xs tracking-wide">Acesso restrito e seguro</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
