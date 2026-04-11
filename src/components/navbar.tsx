
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, LogOut, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const [isLogged, setIsLogged] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const logoImg = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';

  useEffect(() => {
    const userPhone = sessionStorage.getItem("pj_contas_customer_phone");
    if (userPhone) setIsLogged(true);

    // Salva a última página de compras visitada como origem para o botão de voltar do perfil
    if (pathname === "/" || pathname === "/revenda") {
      sessionStorage.setItem("pj_contas_shop_origin", pathname);
    }
  }, [pathname]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhone(e.target.value));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 14) {
      toast({ title: "Número Inválido", description: "Informe seu WhatsApp completo.", variant: "destructive" });
      return;
    }
    sessionStorage.setItem("pj_contas_customer_phone", phoneNumber);
    setIsLogged(true);
    setLoginOpen(false);
    toast({ title: "Bem-vindo!", description: "Você já pode acessar suas compras." });
    router.push("/perfil");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("pj_contas_customer_phone");
    setIsLogged(false);
    router.push("/");
    toast({ title: "Sessão Encerrada", description: "Até logo!" });
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-2xl border-b border-white/5 h-16">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
            <Image 
              src={logoImg} 
              alt="PJ CONTAS" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight">
            <span className="text-primary">PJ</span> <span className="text-white">CONTAS</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isLogged ? (
            <div className="flex items-center gap-2">
              <Link href="/perfil">
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-8 px-4 rounded-xl text-[10px] uppercase tracking-widest gap-2">
                  <User className="w-3.5 h-3.5" />
                  MEU PERFIL
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-red-500 h-8 w-8">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-8 px-6 rounded-xl text-[10px] uppercase tracking-widest">
                  ENTRAR
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/5 rounded-[2.5rem] max-w-sm">
                <DialogHeader className="text-center pt-6">
                  <DialogTitle className="font-headline text-3xl uppercase tracking-normal">Acesse sua Área</DialogTitle>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-2">Veja seus acessos e pedidos</p>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-6 pb-8 pt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Seu WhatsApp</Label>
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25D366]" />
                      <Input 
                        placeholder="(00) 00000-0000"
                        className="h-14 pl-12 bg-background border-white/5 rounded-xl font-bold"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">
                    ACESSAR AGORA
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </nav>
  );
}
