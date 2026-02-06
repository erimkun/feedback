import { redirect } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function FeedbackRedirect({ params }: PageProps) {
    const { id } = await params;
    // Eski /feedback/xxx linklerini /anket/xxx'e yönlendir
    redirect(`/anket/${id}`);
}
