import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container-custom flex-1 py-8">{children}</main>
      <Footer />
    </div>
  );
}
