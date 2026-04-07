"use client";

import { useState } from "react";
import { useProducts } from "@/context/products-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Boxes, 
  Plus, 
  AlertTriangle, 
  Trash2, 
  Tv,
  Mail,
  Monitor,
  Key,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export default function AdminStockPage() {
  const { products, addCredential, removeCredential } = useProducts();
  const { toast } = useToast();
  
  // Filtra apenas produtos de Varejo
  const retailProducts = products.filter(p => !p.isRevenda);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    screenName: "",
    screenPassword: ""
  });

  const handleAddAccount = () => {
    if (!selectedProductId) return;
    if (!formData.email || !formData.password || !formData.screenName) {
      toast({ 
        title: "Campos Incompletos", 
        description: "Email, Senha da Conta e Tela são obrigatórios.", 
        variant: "destructive" 
      });
      return;
    }

    addCredential(selectedProductId, {
      email: formData.email,
      password: formData.password,
      screenName: formData.screenName,
      screenPassword: formData.screenPassword || undefined
    });

    toast({ title: "Conta Adicionada", description: "O estoque foi atualizado com sucesso." });
    setFormData({ email: "", password: "", screenName: "", screenPassword: "" });
    setSelectedProductId(null);
  };

  const totalInventory = retailProducts.reduce((acc, p) => acc + (p.credentials?.filter(c => !c.sold).length || 0), 0);
  const lowStockCount = retailProducts.filter(p => (p.credentials?.filter(c => !c.sold).length || 0) < 2).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold mb-2">Estoque de Contas</h1>
        <p className="text-muted-foreground">Cadastre as credenciais que serão enviadas automaticamente aos clientes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total de Contas Disponíveis</CardTitle>
            <Boxes className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalInventory} contas</div>
            <p className="text-[10px] text-muted-foreground uppercase mt-1">Prontas para entrega imediata</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Produtos Críticos</CardTitle>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{lowStockCount} plataformas</div>
            <p className="text-[10px] text-muted-foreground uppercase mt-1">Menos de 2 telas restantes</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {retailProducts.map((product) => {
          const unsoldCredentials = product.credentials?.filter(c => !c.sold) || [];
          return (
            <Card key={product.id} className="bg-card/50 border-border overflow-hidden">
              <CardHeader className="p-6 pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-primary/10 shrink-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <Tv className="w-5 h-5 text-primary absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{product.name}</h3>
                      <Badge variant={unsoldCredentials.length < 2 ? "destructive" : "outline"} className="text-[10px] uppercase">
                        {unsoldCredentials.length} disponíveis
                      </Badge>
                    </div>
                  </div>

                  <Dialog open={selectedProductId === product.id} onOpenChange={(open) => !open && setSelectedProductId(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setSelectedProductId(product.id)}
                        className="bg-primary hover:bg-primary/90 gap-2 font-bold rounded-xl"
                      >
                        <Plus className="w-4 h-4" />
                        ADICIONAR CONTA
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border rounded-[2rem]">
                      <DialogHeader>
                        <DialogTitle className="font-headline text-2xl uppercase">Abastecer {product.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-muted-foreground">E-mail da Conta</Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              placeholder="exemplo@streaming.com"
                              className="bg-background border-border h-12 pl-12 rounded-xl"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Senha da Conta</Label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              type="password"
                              placeholder="••••••••"
                              className="bg-background border-border h-12 pl-12 rounded-xl"
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nome da Tela</Label>
                          <div className="relative">
                            <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              placeholder="Ex: TELA 01"
                              className="bg-background border-border h-12 pl-12 rounded-xl"
                              value={formData.screenName}
                              onChange={(e) => setFormData({...formData, screenName: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Senha da Tela (Opcional)</Label>
                          <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              type="password"
                              placeholder="Deixe em branco se não houver"
                              className="bg-background border-border h-12 pl-12 rounded-xl"
                              value={formData.screenPassword}
                              onChange={(e) => setFormData({...formData, screenPassword: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" className="rounded-xl flex-1 h-12" onClick={() => setSelectedProductId(null)}>CANCELAR</Button>
                        <Button className="bg-primary hover:bg-primary/90 font-bold rounded-xl flex-1 h-12" onClick={handleAddAccount}>SALVAR CONTA</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {unsoldCredentials.length > 0 ? (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="border-border">
                          <TableHead className="text-[10px] font-bold uppercase">Acesso (E-mail / Senha)</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Tela</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-center">Senha Tela</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-right">Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unsoldCredentials.map((cred) => (
                          <TableRow key={cred.id} className="border-border hover:bg-muted/20">
                            <TableCell className="text-xs font-medium">
                              <div className="flex flex-col">
                                <span>{cred.email}</span>
                                <span className="text-muted-foreground text-[10px] font-mono">Senha: ••••••••</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">{cred.screenName}</TableCell>
                            <TableCell className="text-xs text-center font-mono">
                              {cred.screenPassword ? "••••••" : <span className="text-muted-foreground italic text-[10px]">N/A</span>}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                onClick={() => {
                                  removeCredential(product.id, cred.id);
                                  toast({ title: "Removido", description: "Conta excluída do estoque." });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
                    <p className="text-sm text-muted-foreground font-medium">Nenhuma conta disponível para este serviço.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
