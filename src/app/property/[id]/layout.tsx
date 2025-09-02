import { Metadata } from 'next';
import { generatePropertyMetadata } from './metadata';

interface PropertyLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return generatePropertyMetadata(id);
}

export default function PropertyLayout({ children }: PropertyLayoutProps) {
  return <>{children}</>;
}
