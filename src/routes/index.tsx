import { createFileRoute } from '@tanstack/react-router';
import RoutesPage from '@/pages/RoutesPage';

export const Route = createFileRoute('/')({
    component: RoutesPage,
});
