import ClientDetailPage from '@/pages/ClientDetailPage';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/clients/$id')({
    component: RouteComponent,
})

function RouteComponent() {

    const { id } = Route.useParams();

    return <ClientDetailPage id={id} />
}
