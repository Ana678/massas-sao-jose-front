import NewClientPage from '@/pages/NewClientPage';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/clients/new')({
    component: NewClientPage,
});
