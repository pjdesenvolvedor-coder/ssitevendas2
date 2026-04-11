
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  ShoppingBag, 
  MessageSquare, 
  Copy, 
  Zap,
  Mail,
  Lock,
  Monitor,
  Key,
  ShieldCheck,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Order } from "@/lib/types";

export default function CustomerProfilePage() {
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();

  useEffect(() => {
    const phone = sessionStorage.getItem("pj_contas_customer_phone");
    if (!phone) {
      router.push("/");
    } else {
      setCustomerPhone(phone);
    }
  }, [router]);

  // Busca as ordens DIRETAMENTE do banco de dados filtrando pelo número do cliente
  // Isso garante que o histórico seja acessível de qualquer dispositivo ao logar
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !customerPhone) return null;
    return query(
      collection(db, 'orders'), 
      where('customerPhone', '==', customerPhone),
      orderBy('date', 'desc')
    );
  }, [db, customerPhone]);

  const { data: customerOrders, isLoading } = useCollection<Order>(ordersQuery);

  const copyToClipboard = (text: string) => {
    if (!text || text === "Pendente de envio") return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Informação copiada com sucesso." });
  };

  if (!customerPhone) return null;

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 max-w-3xl">
        <div className="mb-10 text-center">
          <Badge className="bg-primary/10 text-primary border-none font-bold mb-4 px-4 py-1">ÁREA DO CLIENTE</Badge>
          <h1 className="text-4xl md:text-5xl font-headline font-bold uppercase tracking-tight">Minhas Compras</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">{customerPhone}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Sincronizando com a Nuvem...</p>
          </div>
        ) : customerOrders && customerOrders.length > 0 ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {customerOrders.map((order) => (
              <Card key={order.id} className="bg-card/50 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
                <CardHeader className="bg-primary/5 border-b border-white/5 py-4 px-8 flex flex-row items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pedido</span>
                    <span className="font-mono text-xs font-bold text-primary">{order.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data da Compra</span>
                    <span className="block text-xs font-bold text-white">
                      {new Date(order.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="bg-background/50 border border-white/10 rounded-2xl overflow-hidden group hover:border-primary/30 transition-colors">
                      <div className="bg-primary/10 px-6 py-3 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Zap className="w-4 h-4 text-primary fill-primary" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">{item.productName}</span>
                        </div>
                        <Link href="https://wa.link/epce4q" target="_blank">
                          <Button className="h-8 bg-[#25D366] hover:bg-[#1EBE57] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 gap-2 border-none shadow-lg shadow-green-500/10">
                            <MessageSquare className="w-3 h-3" />
                            SUPORTE
                          </Button>
                        </Link>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[8px] uppercase text-muted-foreground font-bold ml-1">E-mail de Acesso</Label>
                            <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl text-xs font-mono group/item cursor-pointer hover:bg-black/40 transition-colors" onClick={() => copyToClipboard(item.email)}>
                              <div className="flex items-center gap-3 truncate">
                                <Mail className="w-3 h-3 text-primary" />
                                <span className="truncate">{item.email}</span>
                              </div>
                              <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[8px] uppercase text-muted-foreground font-bold ml-1">Senha da Conta</Label>
                            <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl text-xs font-mono group/item cursor-pointer hover:bg-black/40 transition-colors" onClick={() => copyToClipboard(item.pass)}>
                              <div className="flex items-center gap-3 truncate">
                                <Lock className="w-3 h-3 text-primary" />
                                <span className="truncate">{item.pass}</span>
                              </div>
                              <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </div>

                        {!item.isRevenda && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                              <Label className="text-[8px] uppercase text-muted-foreground font-bold ml-1">Perfil Designado</Label>
                              <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl text-xs font-mono group/item cursor-pointer hover:bg-black/40 transition-colors" onClick={() => copyToClipboard(item.screen)}>
                                <Monitor className="w-3 h-3 text-primary" />
                                <span className="truncate">{item.screen}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[8px] uppercase text-muted-foreground font-bold ml-1">Senha do Perfil</Label>
                              <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl text-xs font-mono group/item cursor-pointer hover:bg-black/40 transition-colors" onClick={() => copyToClipboard(item.screenPass || "Sem Senha")}>
                                <Key className="w-3 h-3 text-primary" />
                                <span className="truncate">{item.screenPass || "Sem Senha"}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/20 rounded-[3rem] border border-dashed border-white/5 animate-in fade-in duration-1000">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Nenhum pedido na nuvem</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8 leading-relaxed">
              Não encontramos compras vinculadas a este número no nosso servidor.
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest rounded-xl gap-2 h-12 px-8 shadow-2xl shadow-primary/20">
                Ir para a loja
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-3xl flex items-center gap-4">
          <ShieldCheck className="w-10 h-10 text-primary shrink-0 opacity-80" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider">Acesso Multi-Dispositivo</h4>
            <p className="text-[10px] text-muted-foreground uppercase leading-relaxed tracking-wider">
              Seus dados de acesso estão salvos com segurança em nossos servidores. Basta entrar com seu WhatsApp em qualquer aparelho para visualizar suas compras.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
