
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const logoImg = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Delay para simular processamento e melhorar UX mobile
    setTimeout(() => {
      if (password === "Ae@1234Br") {
        sessionStorage.setItem("pj_contas_admin_auth", "true");
        toast({ 
          title: "Acesso Autorizado", 
          description: "Bem-vindo ao painel PJ CONTAS.",
        });
        router.push("/admin");
      } else {
        setLoading(false);
        toast({ 
          title: "Senha Incorreta", 
          description: "O acesso foi negado. Verifique a senha e tente novamente.", 
          variant: "destructive" 
        });
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-card border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <CardHeader className="pt-12 pb-6 text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <Image src={logoImg} alt="Logo" fill className="object-contain" />
          </div>
          <CardTitle className="text-3xl font-headline tracking-normal">
            <span className="text-primary">PJ</span> <span className="text-white">CONTAS</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-2">Área Restrita</p>
        </CardHeader>
        <CardContent className="px-8 pb-12">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="Senha de Acesso" 
                  className="pl-12 h-14 bg-background border-white/5 rounded-xl text-center font-bold tracking-[0.3em]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ACESSAR PAINEL"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
