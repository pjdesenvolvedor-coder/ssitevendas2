
"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useProducts } from "@/context/products-context";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  QrCode, 
  User, 
  Phone, 
  Plus, 
  Trash2,
  ChevronDown,
  Copy,
  CheckCircle2,
  Zap,
  Mail,
  Lock,
  Monitor,
  Key,
  AlertTriangle,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { StreamingService, Order, DeliveredCredential } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createPixAction, checkPixStatusAction, PixResponse } from "@/lib/payment-actions";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { products, sellCredential, addOrder } = useProducts();
  const { toast } = useToast();
  
  const [selectedProducts, setSelectedProducts] = useState<StreamingService[]>([]);
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'paid'>('idle');
  const [copied, setCopied] = useState(false);
  const [affiliateRef, setAffiliateRef] = useState<string | null>(null);
  
  const saleProcessedRef = useRef(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: ""
  });

  const [purchasedCredentials, setPurchasedCredentials] = useState<DeliveredCredential[]>([]);

  useEffect(() => {
    const storedRef = sessionStorage.getItem('pj_contas_ref');
    if (storedRef) setAffiliateRef(storedRef);
  }, []);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: formatPhone(e.target.value) });
  };

  const processSale = useCallback(() => {
    if (saleProcessedRef.current) return;
    saleProcessedRef.current = true;

    // 1. Coletar credenciais e atualizar estoque
    const credentials: DeliveredCredential[] = selectedProducts.map(p => {
      const sold = sellCredential(p.id);
      return {
        productName: p.name,
        email: sold?.email || "Pendente de envio",
        pass: sold?.password || "Pendente de envio",
        screen: sold?.screenName || "Pendente de envio",
        screenPass: sold?.screenPassword || null,
        isRevenda: p.isRevenda || false
      };
    });
    
    // 2. Criar objeto do pedido
    const newOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      customerName: formData.fullName,
      customerPhone: formData.phone,
      status: 'completed',
      date: new Date().toISOString(),
      total: selectedProducts.reduce((acc, p) => acc + p.price, 0),
      items: credentials,
      affiliateId: affiliateRef
    };
    
    // 3. Persistir e Notificar Webhook via Contexto
    addOrder(newOrder);
    
    // 4. Salvar telefone para o perfil do cliente
    sessionStorage.setItem("pj_contas_customer_phone", formData.phone);
    
    // 5. Atualizar UI
    setPurchasedCredentials(credentials);
    setPaymentStatus('paid');
    
    toast({
      title: "Pagamento Confirmado!",
      description: "Seu acesso está liberado na tela e salvo no seu perfil.",
    });
  }, [selectedProducts, formData, affiliateRef, sellCredential, addOrder, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (paymentStatus === 'pending' && pixData?.id && !saleProcessedRef.current) {
      interval = setInterval(async () => {
        const result = await checkPixStatusAction(pixData.id);
        if (result.status === 'paid') {
          clearInterval(interval);
          processSale();
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentStatus, pixData?.id, processSale]);

  useEffect(() => {
    const initialProduct = products.find(p => p.id === resolvedParams.id);
    if (initialProduct && selectedProducts.length === 0) {
      setSelectedProducts([initialProduct]);
    }
  }, [products, resolvedParams.id, selectedProducts.length]);

  const handleAddProduct = (product: StreamingService) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      toast({ title: "Atenção", description: "Este produto já está no seu carrinho." });
      return;
    }
    setSelectedProducts([...selectedProducts, product]);
    setPixData(null);
    setPaymentStatus('idle');
    saleProcessedRef.current = false;
    toast({ title: "Produto Adicionado", description: `${product.name} foi incluído no pedido.` });
  };

  const handleRemoveProduct = (id: string) => {
    if (selectedProducts.length <= 1) {
      toast({ title: "Erro", description: "O carrinho deve ter pelo menos um produto.", variant: "destructive" });
      return;
    }
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    setPixData(null);
    setPaymentStatus('idle');
    saleProcessedRef.current = false;
  };

  const totalValue = selectedProducts.reduce((acc, p) => acc + p.price, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || formData.phone.length < 14) {
      toast({ 
        title: "Dados Inválidos", 
        description: "Por favor, preencha seu nome e um WhatsApp válido.", 
        variant: "destructive" 
      });
      return;
    }
    
    setLoading(true);
    try {
      const pix = await createPixAction(totalValue);
      setPixData(pix);
      setPaymentStatus('pending');
      saleProcessedRef.current = false;
      toast({ 
        title: "PIX Gerado!", 
        description: "Efetue o pagamento para liberar seu acesso.",
      });
    } catch (error: any) {
      toast({ 
        title: "Erro ao gerar PIX", 
        description: error.message || "Tente novamente em instantes.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text || text === "Pendente de envio") return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copiado!", description: "Informação copiada com sucesso." });
    setTimeout(() => setCopied(false), 2000);
  };

  const availableToAdd = products.filter(p => {
    const isSameType = selectedProducts.length > 0 
      ? !!p.isRevenda === !!selectedProducts[0].isRevenda 
      : true;

    return p.active && 
      p.stock > 0 && 
      !selectedProducts.find(sp => sp.id === p.id) &&
      isSameType;
  });

  // Lógica de redirecionamento inteligente
  const getBackUrl = () => {
    // Verifica se é revenda baseando-se nos produtos selecionados ou comprados
    const isRevenda = purchasedCredentials.length > 0 
      ? purchasedCredentials.some(c => c.isRevenda)
      : selectedProducts.some(p => p.isRevenda);

    const base = isRevenda ? "/revenda" : "/";
    return affiliateRef ? `${base}?ref=${affiliateRef}` : base;
  };

  return (
    <div className="min-h-screen pt-32 pb-12 bg-background">
      <Navbar />
      <div className="container mx-auto px-6 max-w-2xl">
        {paymentStatus !== 'paid' && (
          <Link href={getBackUrl()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-sm font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Loja
          </Link>
        )}

        <div className="space-y-6">
          {paymentStatus !== 'paid' && (
            <div className="space-y-4">
              {selectedProducts.map((product) => (
                <Card key={product.id} className="bg-primary/5 border-primary/20 rounded-2xl overflow-hidden border-dashed relative group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-headline text-xl text-white truncate">{product.name}</h2>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Entrega Imediata</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-xl font-headline font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                          <p className="text-[8px] text-muted-foreground uppercase font-bold">por mês</p>
                        </div>
                        {selectedProducts.length > 1 && paymentStatus === 'idle' && (
                          <button 
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                            onClick={() => handleRemoveProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {paymentStatus === 'idle' && (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 rounded-xl text-xs uppercase tracking-widest gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar Produto
                    <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-white/10 w-64 p-2 rounded-xl max-h-[300px] overflow-y-auto no-scrollbar">
                  {availableToAdd.length > 0 ? (
                    availableToAdd.map(product => (
                      <DropdownMenuItem 
                        key={product.id} 
                        className="flex justify-between items-center p-3 rounded-lg cursor-pointer focus:bg-white/5 group border border-transparent focus:border-white/10 outline-none transition-all"
                        onClick={() => handleAddProduct(product)}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-white">{product.name}</span>
                          <span className="text-[8px] text-muted-foreground uppercase font-bold">Assinatura Mensal</span>
                        </div>
                        <span className="text-xs font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[10px] text-muted-foreground uppercase font-bold">Sem mais produtos disponíveis</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {paymentStatus !== 'paid' && (
            <div className="bg-card/30 border border-white/5 p-6 rounded-2xl flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-headline text-xl text-muted-foreground uppercase tracking-widest">Valor Total</span>
                <span className="text-[10px] text-primary font-bold uppercase">PAGAMENTO MENSAL</span>
              </div>
              <span className="font-headline text-4xl text-primary">R$ {totalValue.toFixed(2)}</span>
            </div>
          )}

          {paymentStatus === 'idle' ? (
            <Card className="bg-card/50 border-white/5 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
              <CardHeader className="pt-8 text-center">
                <CardTitle className="font-headline text-3xl uppercase tracking-normal">Dados do Cliente</CardTitle>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Informações para entrega do acesso</p>
              </CardHeader>
              <CardContent className="px-8 pb-10">
                <form onSubmit={handleCheckout} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                      Nome Completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="fullName" 
                        placeholder="Ex: João Silva"
                        className="bg-background border-white/5 h-14 pl-12 rounded-xl focus:ring-primary"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                      WhatsApp / Contato
                    </Label>
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25D366]" />
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="(00) 00000-0000"
                        className="bg-background border-white/5 h-14 pl-12 rounded-xl focus:ring-primary font-bold"
                        required
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <Separator className="bg-white/5 my-6" />

                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
                      Forma de Pagamento
                    </Label>
                    <div className="flex items-center gap-4 rounded-2xl border-2 border-primary bg-primary/5 p-5 transition-all">
                      <div className="bg-primary p-2 rounded-lg">
                        <QrCode className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold text-sm uppercase tracking-widest text-white">PIX Automático</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Liberação imediata após o pagamento</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-16 text-lg rounded-2xl shadow-2xl shadow-primary/30 mt-6 uppercase tracking-widest"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>GERAR CÓDIGO PIX</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : paymentStatus === 'pending' && pixData ? (
            <Card className="bg-card/50 border-primary/20 border-2 rounded-[2.5rem] shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="bg-primary/10 py-4 text-center border-b border-primary/20">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] animate-pulse">
                  Aguardando Pagamento...
                </span>
              </div>
              <CardContent className="p-8 flex flex-col items-center gap-8">
                <div className="bg-white p-4 rounded-3xl shadow-2xl flex items-center justify-center min-h-[280px] min-w-[280px]">
                  {pixData.qr_code_base64 ? (
                    <img 
                      src={pixData.qr_code_base64.startsWith('data:') ? pixData.qr_code_base64 : `data:image/png;base64,${pixData.qr_code_base64}`}
                      alt="PIX QR Code"
                      width={280}
                      height={280}
                      className="rounded-xl block"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground p-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="text-[10px] font-bold uppercase">Carregando QR Code...</span>
                    </div>
                  )}
                </div>

                <div className="w-full space-y-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
                      PIX -&gt; COPIA E COLA -&gt; PAGAR
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Código Copia e Cola</Label>
                    <div className="relative group">
                      <div className="bg-background border border-white/10 rounded-xl p-4 pr-16 text-xs font-mono break-all line-clamp-2 text-muted-foreground">
                        {pixData.qr_code}
                      </div>
                      <Button 
                        onClick={() => copyToClipboard(pixData.qr_code)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary hover:bg-primary/90 rounded-lg shadow-lg"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button 
                      onClick={() => copyToClipboard(pixData.qr_code)}
                      className="w-full h-14 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest rounded-xl text-xs gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar Código PIX
                    </Button>
                  </div>

                  <p className="text-[9px] text-center text-muted-foreground uppercase font-medium leading-relaxed">
                    Após o pagamento, o sistema identificará automaticamente <br /> e liberará seu acesso em instantes.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : paymentStatus === 'paid' && (
            <div className="space-y-6 animate-in fade-in duration-700">
              <Card className="bg-card/50 border-green-500/30 border-2 rounded-[2.5rem] shadow-2xl backdrop-blur-xl overflow-hidden py-10 px-8 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="font-headline text-3xl text-white mb-1">PAGAMENTO APROVADO!</h2>
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-8">Obrigado pela preferência.</p>
                
                <div className="mb-4 text-center">
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                    CLIQUE NA INFORMAÇÃO PARA COPIAR
                  </span>
                </div>

                <div className="space-y-4 text-left">
                  {purchasedCredentials.map((cred, idx) => (
                    <Card key={idx} className="bg-background/50 border-white/5 rounded-2xl overflow-hidden">
                      <div className="bg-primary/10 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{cred.productName}</span>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[8px] uppercase text-muted-foreground font-bold">E-mail</Label>
                            <div 
                              className="flex items-center gap-2 bg-black/20 p-2 rounded-lg text-xs font-mono break-all text-white relative group cursor-pointer hover:bg-black/40 transition-colors"
                              onClick={() => copyToClipboard(cred.email)}
                            >
                              <Mail className="w-3 h-3 shrink-0 text-primary" />
                              <span className="truncate">{cred.email}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[8px] uppercase text-muted-foreground font-bold">Senha</Label>
                            <div 
                              className="flex items-center gap-2 bg-black/20 p-2 rounded-lg text-xs font-mono break-all text-white relative group cursor-pointer hover:bg-black/40 transition-colors"
                              onClick={() => copyToClipboard(cred.pass)}
                            >
                              <Lock className="w-3 h-3 shrink-0 text-primary" />
                              <span className="truncate">{cred.pass}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {!cred.isRevenda && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-[8px] uppercase text-muted-foreground font-bold">Perfil / Tela</Label>
                              <div 
                                className="flex items-center gap-2 bg-black/20 p-2 rounded-lg text-xs font-mono break-all text-white cursor-pointer hover:bg-black/40 transition-colors"
                                onClick={() => copyToClipboard(cred.screen)}
                              >
                                <Monitor className="w-3 h-3 shrink-0 text-primary" />
                                <span className="truncate">{cred.screen}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[8px] uppercase text-muted-foreground font-bold">Senha Perfil</Label>
                              <div 
                                className="flex items-center gap-2 bg-black/20 p-2 rounded-lg text-xs font-mono break-all text-white cursor-pointer hover:bg-black/40 transition-colors"
                                onClick={() => copyToClipboard(cred.screenPass || "Sem Senha")}
                              >
                                <Key className="w-3 h-3 shrink-0 text-primary" />
                                <span className="truncate">{cred.screenPass || "Sem Senha"}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3 text-left">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                  <p className="text-[10px] text-yellow-500/90 font-bold uppercase leading-relaxed">
                    te enviamos também o acesso pelo zap se precisar de suporte contate por lá!
                  </p>
                </div>

                <Link href={getBackUrl()} className="block mt-8">
                  <Button className="bg-white text-black hover:bg-white/90 font-bold h-14 w-full rounded-xl uppercase tracking-widest">
                    Voltar ao Início
                  </Button>
                </Link>
              </Card>
            </div>
          )}

          <div className="flex flex-col items-center gap-6 py-8 opacity-40">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <div className="text-[9px] font-bold flex flex-col justify-center text-left leading-tight tracking-wider uppercase">
                  <span>PAGAMENTO</span>
                  <span>100% SEGURO</span>
                </div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-[9px] font-bold flex flex-col justify-center text-left leading-tight tracking-wider uppercase">
                <span>ENTREGA</span>
                <span>IMEDIATA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
