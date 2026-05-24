import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import Logo from "@/assets/logo.svg?react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import InputWithIcon from "@/components/form/InputWithIcon";
import FormSubmitButton from "@/components/form/FormSubmitButton";

const LoginPage = () => {
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) return;

        router.invalidate();
        navigate({ to: '/', replace: true });
    }, [isAuthenticated, router, navigate]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        const ok = login(email, password);
        if (!ok) {
            setError(true);
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#121212] p-0 md:p-4">
            <main className="relative flex min-h-screen w-full max-w-md flex-col justify-center overflow-y-auto bg-[#F2EDE4] px-8 shadow-2xl md:rounded-[2rem]">

                <div className="h-5 w-full bg-accent absolute top-0 left-0 z-50"></div>

                <div className="pointer-events-none absolute left-0 top-0 h-64 w-full bg-gradient-to-b from-[#E8E0D3] to-transparent opacity-50" />

                <div className="relative z-10 w-full mb-12 flex flex-col justify-center gap-3 items-center">

                    <Logo className="h-24 w-24 object-contain" />
                    <p className="text-sm tracking-wide text-primary">Acesso ao Sistema</p>

                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <InputWithIcon
                        icon={Mail}
                        type="text"
                        placeholder="usuário"
                        value={email}
                        onChange={setEmail}
                        label="Usuário"
                        required
                        className="text-[#1E1C18]"
                    />

                    <InputWithIcon
                        icon={Lock}
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={setPassword}
                        label="Senha"
                        required
                        className="text-[#1E1C18]"
                    />

                    {error && (
                        <p className="text-center text-sm text-red-600">
                            Email ou senha incorretos
                        </p>
                    )}

                    <FormSubmitButton
                        onClick={() => handleSubmit(new Event('submit') as any)}
                        loading={loading}
                        disabled={loading}
                        variant="primary"
                        fullWidth
                        className="mt-8 bg-[#132245] text-[#F2EDE4] rounded-xl"
                    >
                        Entrar
                    </FormSubmitButton>
                </form>

                {/* Rodapé */}
                <div className="mt-12 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[#C8B99A]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <p className="text-xs tracking-wide">Acesso restrito e seguro</p>
                    </div>
                </div>

                <div className="h-5 w-full bg-accent absolute bottom-0 left-0 z-50"></div>
            </main>
        </div>
    );
};

export default LoginPage;
