import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GatePage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/map/${slug}`);
}
