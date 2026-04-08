
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ProductsProvider } from "@/context/products-context";
import { FirebaseClientProvider } from "@/firebase";
import { Suspense } from "react";
import { GlobalRefTracker } from "@/components/global-ref-tracker";

export const metadata: Metadata = {
  title: 'PJ CONTAS - Acessos Premium',
  description: 'Sua loja de streaming com entrega imediata e o melhor preço do Brasil.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <FirebaseClientProvider>
          <ProductsProvider>
            <Suspense fallback={null}>
              <GlobalRefTracker />
            </Suspense>
            {children}
            <Toaster />
          </ProductsProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
