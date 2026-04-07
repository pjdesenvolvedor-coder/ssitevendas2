
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Menu,
  Loader2,
  Boxes,
  Briefcase,
  Users,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Afiliados', href: '/admin/affiliates', icon: Users },
  { label: 'Pagamentos', href: '/admin/payments', icon: Wallet },
  { label: 'Produtos', href: '/admin/products', icon: Package },
  { label: 'Estoque', href: '/admin/stock', icon: Boxes },
  { label: 'Produtos (Revenda)', href: '/admin/products-revenda', icon: Briefcase },
  { label: 'Estoque (Revenda)', href: '/admin/stock-revenda', icon: Boxes },
  { label: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Configurações', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  
  const logoImg = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';

  useEffect(() => {
    const auth = sessionStorage.getItem("pj_contas_admin_auth");
    if (auth !== "true") {
      router.push("/adm");
    } else {
      setIsAuth(true);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("pj_contas_admin_auth");
    router.push("/");
  };

  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-white/5">
      <div className="p-8 border-b border-white/5 flex items-center gap-3">
        <div className="relative w-8 h-8">
          <Image src={logoImg} alt="Logo" fill className="object-contain" />
        </div>
        <span className="text-2xl font-headline font-bold tracking-normal">
          <span className="text-primary">PJ</span> <span className="text-white">CONTAS</span>
        </span>
      </div>
      
      <nav className="flex-1 p-6 space-y-2 mt-4 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <Button 
                variant={isActive ? "default" : "ghost"} 
                className={cn(
                  "w-full justify-start gap-4 py-6 rounded-2xl transition-all",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-bold uppercase tracking-widest text-[10px]">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-4 py-6 rounded-2xl text-muted-foreground hover:text-red-500 hover:bg-red-500/5"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold uppercase tracking-widest text-[10px]">Sair do Painel</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden lg:block w-72 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-6 right-6 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card border-white/10 w-14 h-14 rounded-2xl shadow-xl">
              <Menu className="w-8 h-8 text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-none w-80 bg-background">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu Administrativo</SheetTitle>
              <SheetDescription>Navegação principal do painel administrativo</SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 p-6 md:p-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
