
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  PackageCheck, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  ShoppingBag
} from "lucide-react";
import { useProducts } from "@/context/products-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { products, orders } = useProducts();
  
  // Os pedidos já vem ordenados do contexto por data decrescente
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalSales = orders.length;
  const activeProductsCount = products.filter(p => p.active).length;
  const lowStock = products.filter(p => p.stock < 2).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold mb-2 uppercase text-primary">Painel PJ CONTAS</h1>
        <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Controle total das suas operações de streaming.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Receita Total", 
            value: `R$ ${totalRevenue.toFixed(2)}`, 
            icon: TrendingUp, 
            color: "text-green-500", 
            change: totalSales > 0 ? "+100%" : "0%", 
            up: true 
          },
          { 
            label: "Vendas Totais", 
            value: totalSales, 
            icon: ShoppingBag, 
            color: "text-blue-500", 
            change: totalSales > 0 ? `+${totalSales}` : "0", 
            up: true 
          },
          { 
            label: "Produtos Ativos", 
            value: activeProductsCount, 
            icon: Users, 
            color: "text-primary", 
            change: "Catálogo", 
            up: true 
          },
          { 
            label: "Estoque Baixo", 
            value: lowStock, 
            icon: AlertTriangle, 
            color: lowStock > 0 ? "text-yellow-500" : "text-muted-foreground", 
            change: lowStock > 0 ? "Atenção" : "OK", 
            up: lowStock === 0 
          },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/50 border-border rounded-[1.5rem] shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1 text-[10px] font-medium uppercase">
                {stat.up ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
                <span className={stat.up ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                <span className="text-muted-foreground ml-1">Status Atual</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card/50 border-border rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border">
            <CardTitle className="font-headline text-xl uppercase tracking-normal">Últimas Vendas Realizadas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {orders.length > 0 ? (
                // Mostrando até 15 vendas para maior visibilidade
                orders.slice(0, 15).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{order.customerName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground uppercase font-mono">{order.id}</span>
                        {order.items.some(item => item.isRevenda) && (
                          <Badge className="bg-primary/20 text-primary border-none text-[8px] h-4 font-bold uppercase">REVENDA</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-primary block">R$ {order.total.toFixed(2)}</span>
                        <span className="text-[8px] text-muted-foreground uppercase font-bold">{new Date(order.date).toLocaleString('pt-BR')}</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500 border-none uppercase text-[8px] font-bold">
                        PAGO
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                  Nenhuma venda registrada ainda.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border">
            <CardTitle className="font-headline text-xl uppercase tracking-normal">Status do Estoque Atual</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
             <div className="space-y-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider">{product.name}</span>
                        {product.isRevenda && <Badge variant="outline" className="text-[8px] h-4 border-primary/30 text-primary">REVENDA</Badge>}
                      </div>
                      <span className={cn(
                        "font-bold uppercase",
                        product.stock < 2 ? "text-red-500" : "text-muted-foreground"
                      )}>
                        {product.stock} disponíveis
                      </span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000", 
                          product.stock < 2 ? "bg-red-500" : "bg-primary"
                        )} 
                        style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground uppercase text-[10px] font-bold">
                  Nenhum produto cadastrado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
