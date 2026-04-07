
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Lock, Loader2, UserPlus, LogIn, AlertCircle } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/context/products-context";

export default function AffiliateAuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const { registerAffiliate, getAffiliateByEmail } = useProducts();
  const router = useRouter();
  const { toast } = useToast();
  const logoImg = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';

  useEffect(() => {
    const auth = sessionStorage.getItem("pj_contas_affiliate_user");
    if (auth) {
      router.push("/afiliado/dashboard");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (mode === 'register') {
        const existing = getAffiliateByEmail(formData.email);
        if (existing) {
          toast({ title: "Erro", description: "E-mail já cadastrado.", variant: "destructive" });
          setLoading(false);
          return;
        }
        registerAffiliate({
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          password: formData.password
        });
        toast({ title: "Sucesso!", description: "Cadastro realizado. Sua conta está em análise." });
        setMode('login');
      } else {
        const user = getAffiliateByEmail(formData.email);
        if (user && user.password === formData.password) {
          if (user.status === 'pending') {
            toast({ title: "Conta em Análise", description: "Aguarde a aprovação do administrador.", variant: "destructive" });
          } else if (user.status === 'rejected') {
            toast({ title: "Acesso Negado", description: "Seu cadastro foi recusado.", variant: "destructive" });
          } else {
            sessionStorage.setItem("pj_contas_affiliate_user", JSON.stringify(user));
            router.push("/afiliado/dashboard");
          }
        } else {
          toast({ title: "Erro", description: "E-mail ou senha incorretos.", variant: "destructive" });
        }
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 pt-20">
      <Card className="w-full max-w-md bg-card border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardHeader className="pt-12 pb-6 text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <Image src={logoImg} alt="Logo" fill className="object-contain" />
          </div>
          <CardTitle className="text-3xl font-headline tracking-normal">
            SISTEMA DE <span className="text-primary italic">AFILIADOS</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-2">
            {mode === 'login' ? 'Entre na sua conta' : 'Crie seu cadastro'}
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Nome Completo" 
                  className="pl-12 h-14 bg-background border-white/5 rounded-xl font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="email"
                placeholder="Seu E-mail" 
                className="pl-12 h-14 bg-background border-white/5 rounded-xl font-bold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            {mode === 'register' && (
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Seu WhatsApp" 
                  className="pl-12 h-14 bg-background border-white/5 rounded-xl font-bold"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  required
                />
              </div>
            )}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="Sua Senha" 
                className="pl-12 h-14 bg-background border-white/5 rounded-xl font-bold"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 mt-4"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? "Entrar Agora" : "Criar Cadastro"}
            </Button>

            <div className="text-center pt-4">
              <button 
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs text-muted-foreground hover:text-primary font-bold uppercase tracking-wider transition-colors"
              >
                {mode === 'login' ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça Login"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
