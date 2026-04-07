
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Link as LinkIcon, 
  Wallet, 
  Copy, 
  CheckCircle2, 
  LogOut, 
  Zap, 
  ExternalLink,
  History,
  TrendingUp,
  User,
  Star,
  Shield,
  Trophy,
  Diamond,
  Sparkles,
  ArrowUpRight,
  Clock,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Affiliate, Commission, WithdrawalRequest } from "@/lib/types";
import { useProducts } from "@/context/products-context";
import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase 
} from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function AffiliateDashboard() {
  const [user, setUser] = useState<Affiliate | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'wallet' | 'career'>('links');
  const [copied, setCopied] = useState<string | null>(null);
  const [pixForm, setPixForm] = useState({
    pixType: "",
    pixKey: "",
    pixName: ""
  });
  const [isSavingPix, setIsSavingPix] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { affiliates, updateAffiliatePix, requestWithdrawal, withdrawals } = useProducts();
  const db = useFirestore();

  useEffect(() => {
    const stored = sessionStorage.getItem("pj_contas_affiliate_user");
    if (!stored) {
      router.push("/afiliado");
    } else {
      const parsed = JSON.parse(stored);
      const freshUser = affiliates.find(a => a.id === parsed.id);
      if (freshUser) {
        setUser(freshUser);
        setPixForm({
          pixType: freshUser.pixType || "",
          pixKey: freshUser.pixKey || "",
          pixName: freshUser.pixName || ""
        });
      }
      else setUser(parsed);
    }
  }, [router, affiliates]);

  const commQuery = useMemoFirebase(() => {
    if (!db || !user?.id) return null;
    return query(collection(db, 'commissions'), where('affiliateId', '==', user.id));
  }, [db, user?.id]);

  const { data: commissions } = useCollection<Commission>(commQuery);

  const myWithdrawals = useMemo(() => {
    return withdrawals.filter(w => w.affiliateId === user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [withdrawals, user?.id]);

  const handleLogout = () => {
    sessionStorage.removeItem("pj_contas_affiliate_user");
    router.push("/afiliado");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({ title: "Link Copiado!", description: "Agora é só compartilhar." });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSavePix = () => {
    if (!user) return;
    if (!pixForm.pixType || !pixForm.pixKey || !pixForm.pixName) {
      toast({ title: "Campos Incompletos", description: "Preencha todos os dados do PIX.", variant: "destructive" });
      return;
    }
    setIsSavingPix(true);
    updateAffiliatePix(user.id, pixForm);
    toast({ title: "PIX Salvo", description: "Dados atualizados com sucesso." });
    setTimeout(() => setIsSavingPix(false), 800);
  };

  const handleWithdraw = () => {
    if (!user) return;
    if (user.balance < 0.01) {
      toast({ title: "Saldo Insuficiente", description: "O valor mínimo para saque é R$ 0,01.", variant: "destructive" });
      return;
    }
    if (!user.pixKey) {
      toast({ title: "PIX Não Configurado", description: "Salve seus dados PIX antes de sacar.", variant: "destructive" });
      return;
    }
    requestWithdrawal(user.id, user.balance);
    toast({ title: "Saque Solicitado", description: "Seu pedido de pagamento está em análise (Até 24h)." });
  };

  // Lógica PJ ELITE
  const careerLevels = [
    { name: "BRONZE", min: 0, rate: 10, icon: Star, color: "text-orange-400" },
    { name: "PRATA", min: 80, rate: 14, icon: Shield, color: "text-slate-300" },
    { name: "OURO", min: 150, rate: 18, icon: Trophy, color: "text-yellow-400" },
    { name: "PJ ELITE", min: 280, rate: 20, icon: Diamond, color: "text-primary" },
  ];

  const currentVolume = user?.totalSalesVolume || 0;
  
  const currentLevel = useMemo(() => {
    return [...careerLevels].reverse().find(l => currentVolume >= l.min) || careerLevels[0];
  }, [currentVolume]);

  const nextLevel = useMemo(() => {
    return careerLevels.find(l => currentVolume < l.min);
  }, [currentVolume]);

  const progress = useMemo(() => {
    if (!nextLevel) return 100;
    const prevMin = careerLevels.find((l, i) => careerLevels[i+1]?.name === nextLevel.name)?.min || 0;
    const totalNeeded = nextLevel.min - prevMin;
    const currentProgress = currentVolume - prevMin;
    return Math.min(100, Math.max(0, (currentProgress / totalNeeded) * 100));
  }, [currentVolume, nextLevel]);

  if (!user) return null;

  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const links = [
    { title: "Site Principal (Varejo)", url: `${domain}/?ref=${user.id}`, id: 'retail' },
    { title: "Catálogo de Revenda", url: `${domain}/revenda?ref=${user.id}`, id: 'revenda' },
  ];

  return (
    <div className="min-h-screen bg-background p-6 pt-24 md:p-12 md:pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={cn("w-16 h-16 rounded-3xl bg-card flex items-center justify-center border border-white/5 shadow-2xl transition-colors", currentLevel.color)}>
              <currentLevel.icon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-headline font-bold uppercase tracking-normal">Olá, {user.name}</h1>
                <Badge className={cn("text-[8px] border-none font-bold tracking-widest bg-card", currentLevel.color)}>
                  NÍVEL {currentLevel.name}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Painel de Afiliado PJ CONTAS</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-red-500 rounded-xl gap-2 font-bold uppercase tracking-widest text-[10px]">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>

        {/* Mensagem Motivacional */}
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 duration-700 shadow-lg shadow-primary/5">
          <Sparkles className="w-5 h-5 text-primary animate-pulse shrink-0" />
          <p className="text-sm md:text-base font-bold italic text-white text-center leading-relaxed">
            "O difícil não é vender, é não sentir o prazer do dinheiro caindo!"
          </p>
          <Sparkles className="w-5 h-5 text-primary animate-pulse shrink-0" />
        </div>

        {/* Menu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('links')}
            className={cn(
              "p-6 rounded-[2rem] border transition-all text-left flex items-center justify-between",
              activeTab === 'links' ? 'bg-primary border-primary shadow-2xl shadow-primary/20' : 'bg-card border-white/5 hover:border-primary/20'
            )}
          >
            <div className="space-y-1">
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", activeTab === 'links' ? 'text-white/70' : 'text-muted-foreground')}>Divulgação</span>
              <h3 className={cn("text-xl font-headline font-bold uppercase", activeTab === 'links' ? 'text-white' : 'text-foreground')}>Links</h3>
            </div>
            <LinkIcon className={cn("w-6 h-6", activeTab === 'links' ? 'text-white' : 'text-primary')} />
          </button>
          
          <button 
            onClick={() => setActiveTab('wallet')}
            className={cn(
              "p-6 rounded-[2rem] border transition-all text-left flex items-center justify-between",
              activeTab === 'wallet' ? 'bg-primary border-primary shadow-2xl shadow-primary/20' : 'bg-card border-white/5 hover:border-primary/20'
            )}
          >
            <div className="space-y-1">
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", activeTab === 'wallet' ? 'text-white/70' : 'text-muted-foreground')}>Ganhos</span>
              <h3 className={cn("text-xl font-headline font-bold uppercase", activeTab === 'wallet' ? 'text-white' : 'text-foreground')}>Carteira</h3>
            </div>
            <Wallet className={cn("w-6 h-6", activeTab === 'wallet' ? 'text-white' : 'text-primary')} />
          </button>

          <button 
            onClick={() => setActiveTab('career')}
            className={cn(
              "p-6 rounded-[2rem] border transition-all text-left flex items-center justify-between relative overflow-hidden",
              activeTab === 'career' ? 'bg-primary border-primary shadow-2xl shadow-primary/20' : 'bg-card border-white/5 hover:border-primary/20'
            )}
          >
            <div className="space-y-1 z-10">
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", activeTab === 'career' ? 'text-white/70' : 'text-muted-foreground')}>PJ ELITE</span>
              <h3 className={cn("text-xl font-headline font-bold uppercase", activeTab === 'career' ? 'text-white' : 'text-foreground')}>Carreira</h3>
            </div>
            <Trophy className={cn("w-6 h-6 z-10", activeTab === 'career' ? 'text-white' : 'text-primary')} />
            {activeTab === 'career' && <div className="absolute -right-4 -bottom-4 opacity-20"><Zap className="w-24 h-24 text-white" /></div>}
          </button>
        </div>

        {activeTab === 'links' && (
          <div className="grid gap-6">
            {links.map((link) => (
              <Card key={link.id} className="bg-card border-white/5 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">{link.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="bg-background border border-white/10 rounded-xl p-4 text-xs font-mono break-all text-muted-foreground">
                      {link.url}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyToClipboard(link.url, link.id)}
                        className="flex-1 bg-primary hover:bg-primary/90 rounded-xl h-12 font-bold uppercase tracking-widest text-xs gap-2"
                      >
                        {copied === link.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied === link.id ? "Copiado!" : "Copiar Link"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(link.url, '_blank')}
                        className="h-12 w-12 rounded-xl border-white/10"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="space-y-8">
            <Card className="bg-primary border-none rounded-[2rem] shadow-2xl shadow-primary/30 p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">Saldo Disponível</span>
                <h2 className="text-5xl md:text-6xl font-headline font-bold text-white">R$ {user.balance?.toFixed(2) || "0.00"}</h2>
                <div className="mt-6 flex flex-col gap-4 w-full max-w-xs">
                  <Button 
                    disabled={user.balance < 0.01}
                    onClick={handleWithdraw}
                    className="h-14 bg-white text-primary hover:bg-white/90 rounded-2xl font-bold uppercase tracking-widest text-xs gap-2 shadow-xl"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Solicitar Saque
                  </Button>
                  <p className="text-[9px] text-white/60 uppercase font-bold tracking-widest">
                    Mínimo para saque: R$ 0,01
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Dados PIX */}
              <Card className="bg-card/50 border-white/5 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">Dados de Recebimento</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Tipo de Chave</Label>
                    <Select value={pixForm.pixType} onValueChange={(v) => setPixForm({...pixForm, pixType: v})}>
                      <SelectTrigger className="h-12 bg-background border-white/5 rounded-xl">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10">
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="telefone">Telefone</SelectItem>
                        <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Sua Chave PIX</Label>
                    <Input 
                      placeholder="Insira sua chave" 
                      className="h-12 bg-background border-white/5 rounded-xl font-bold"
                      value={pixForm.pixKey}
                      onChange={(e) => setPixForm({...pixForm, pixKey: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nome do Favorecido</Label>
                    <Input 
                      placeholder="Nome completo na conta bancária" 
                      className="h-12 bg-background border-white/5 rounded-xl font-bold"
                      value={pixForm.pixName}
                      onChange={(e) => setPixForm({...pixForm, pixName: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={handleSavePix}
                    className="w-full h-12 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 transition-all mt-4"
                  >
                    {isSavingPix ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Dados PIX
                  </Button>
                </CardContent>
              </Card>

              {/* Histórico de Saques */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Últimos Saques</h3>
                </div>
                {myWithdrawals.length > 0 ? (
                  <div className="grid gap-3">
                    {myWithdrawals.map((w) => (
                      <Card key={w.id} className="bg-card/50 border-white/5 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{new Date(w.createdAt).toLocaleDateString()}</span>
                            <h4 className="text-sm font-bold uppercase">R$ {w.amount.toFixed(2)}</h4>
                          </div>
                          <Badge className={cn(
                            "text-[8px] border-none font-bold tracking-widest uppercase",
                            w.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                            w.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                          )}>
                            {w.status === 'pending' ? 'PENDENTE' : w.status === 'paid' ? 'PAGO' : 'RECUSADO'}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-card/20 rounded-[2rem] border border-dashed border-white/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nenhum saque solicitado.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'career' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-card/50 border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Status da Jornada</span>
                    <h3 className="text-3xl font-headline font-bold uppercase">PLANO PJ ELITE</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-headline font-bold text-white">R$ {currentVolume.toFixed(2)}</span>
                    <p className="text-[8px] text-muted-foreground font-bold uppercase">Volume Total de Vendas</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground">NÍVEL ATUAL: <span className="text-white">{currentLevel.name}</span></span>
                    {nextLevel && (
                      <span className="text-muted-foreground">PRÓXIMO: <span className="text-primary">{nextLevel.name}</span></span>
                    )}
                  </div>
                  <Progress value={progress} className="h-4 rounded-full bg-white/5 border border-white/10" />
                  {nextLevel ? (
                    <p className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Faltam <span className="text-primary font-bold">R$ {(nextLevel.min - currentVolume).toFixed(2)}</span> em vendas para você subir de nível!
                    </p>
                  ) : (
                    <p className="text-center text-[10px] text-primary font-bold uppercase tracking-wider animate-pulse">
                      VOCÊ ATINGIU O NÍVEL MÁXIMO! BEM-VINDO À ELITE PJ CONTAS.
                    </p>
                  )}
                </div>
              </div>
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {careerLevels.map((level, idx) => {
                const isReached = currentVolume >= level.min;
                const isCurrent = currentLevel.name === level.name;
                return (
                  <Card key={idx} className={cn(
                    "relative overflow-hidden transition-all duration-300 rounded-[2rem] border p-6",
                    isReached ? "bg-primary/5 border-primary/20" : "bg-card/30 border-white/5 opacity-50 grayscale"
                  )}>
                    {isReached && (
                      <div className="absolute top-4 right-4 bg-primary/20 p-1.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className={cn("p-4 rounded-2xl bg-card border border-white/5", level.color)}>
                        <level.icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline text-xl uppercase font-bold">{level.name}</h4>
                          {isCurrent && <Badge className="bg-primary text-white text-[8px] h-4">VOCÊ</Badge>}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Venda R$ {level.min.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-sm font-bold text-green-500">{level.rate}% Comissões</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
