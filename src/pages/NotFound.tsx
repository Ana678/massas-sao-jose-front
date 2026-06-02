import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import Logo from "@/assets/logo.svg?react";

export default function NotFound () {

    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);

    return (


        <div className="flex items-center justify-center min-h-screen bg-app-bg p-0 md:p-4">
            <main className="w-full max-w-md bg-background min-h-screen relative overflow-y-auto no-scrollbar md:rounded-[2rem] shadow-2xl flex flex-col pb-24">
                <div className="flex flex-col gap-4 items-center justify-center m-auto">
                    <Logo className="h-18 w-18 object-contain" />
                    <div className="flex flex-col text-center">
                        <h1 className="mb-4 text-4xl font-bold tracking-tight leading-tight font-display text-primary">404</h1>
                        <p className="mb-4 text-lg text-muted-foreground">Oops... Essa Página não existe!</p>
                        <Link to="/" className="text-primary bg-primary/5 p-2 rounded-xl transition-colors hover:bg-primary/10 font-normal">
                            Ir para página inicial
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};
