
"use client";

import { useState } from "react";
import { useProducts } from "@/context/products-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Eye, Mail, CheckCircle, Clock, Copy, User, Phone, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrdersPage() {
  const { orders } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone.includes(searchTerm)
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Informação copiada com sucesso." });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold mb-2">Pedidos</h1>
        <p className="text-muted-foreground">Monitore as vendas e visualize as credenciais entregues.</p>
      </div>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4 w-full max-w-md">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, telefone ou ID..." 
                className="border-none bg-transparent shadow-none focus-visible:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-[120px]">ID Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-bold">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{order.customerName}</span>
                        <span className="text-[10px] text-muted-foreground">{order.customerPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(order.date).toLocaleDateString('pt-BR')} {new Date(order.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="font-bold text-primary">R$ {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-500 border-none uppercase text-[8px]">
                        Concluído
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-primary hover:bg-primary/5" 
                        title="Ver Acessos"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground uppercase text-xs font-bold">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detalhes do Pedido Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-card border-border rounded-[2rem] max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl uppercase tracking-normal flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary" />
              Detalhes do Pedido {selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Cliente</Label>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <User className="w-3 h-3 text-primary" />
                  {selectedOrder?.customerName}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">WhatsApp</Label>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Phone className="w-3 h-3 text-primary" />
                  {selectedOrder?.customerPhone}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold ml-1">Itens Entregues</Label>
              {selectedOrder?.items.map((item, idx) => (
                <div key={idx} className="bg-background border border-border rounded-2xl overflow-hidden">
                  <div className="bg-primary/10 px-4 py-2 border-b border-border">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.productName}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[8px] uppercase text-muted-foreground font-bold">E-mail</Label>
                        <div className="flex items-center justify-between bg-muted/20 p-2 rounded-lg text-[10px] font-mono group">
                          <span className="truncate">{item.email}</span>
                          <Button variant="ghost" size="icon" className="h-4 w-4 shrink-0" onClick={() => copyToClipboard(item.email)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] uppercase text-muted-foreground font-bold">Senha</Label>
                        <div className="flex items-center justify-between bg-muted/20 p-2 rounded-lg text-[10px] font-mono">
                          <span className="truncate">{item.pass}</span>
                          <Button variant="ghost" size="icon" className="h-4 w-4 shrink-0" onClick={() => copyToClipboard(item.pass)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {!item.isRevenda && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[8px] uppercase text-muted-foreground font-bold">Tela / Perfil</Label>
                          <div className="bg-muted/20 p-2 rounded-lg text-[10px] font-mono">
                            {item.screen}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[8px] uppercase text-muted-foreground font-bold">Senha Tela</Label>
                          <div className="bg-muted/20 p-2 rounded-lg text-[10px] font-mono">
                            {item.screenPass || "Sem Senha"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
