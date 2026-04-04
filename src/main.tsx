import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './index.css'

// Import o routeTree gerado
import { routeTree } from './routeTree.gen'

// Inicia o router
const router = createRouter({
    routeTree,
    basepath: '/massas-sao-jose-front',
    context: {
        auth: undefined!, // Isso será preenchido pelo InnerApp
    },
})

// Registro para segurança de tipos
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

function InnerApp() {
    const auth = useAuth()
    // Passamos o estado de autenticação real para o contexto do router
    return <RouterProvider router={router} context={{ auth }} />
}

const rootElement = document.getElementById('root')!

// Forma correta e simplificada de renderizar no React 18:
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <AuthProvider>
                <InnerApp />
            </AuthProvider>
        </StrictMode>,
    )
}
