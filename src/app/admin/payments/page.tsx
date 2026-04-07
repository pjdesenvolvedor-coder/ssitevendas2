
"use client";

import { useState } from "react";
import { useProducts } from "@/context/products-context";
import { Card, CardContent } from "@/components/ui/card";
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
import { Check, X, Search, Wallet, User, Copy, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { WithdrawalRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const { withdrawals, updateWithdrawalStatus } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filtered = withdrawals.filter(w => 
    w.affiliateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.pixKey.includes(searchTerm)
  );

  const handleAction = (id: string, status: 'paid' | 'rejected') => {
    updateWithdrawalStatus(id, status);
    toast({ 
      title: status === 'paid' ? "Pagamento Realizado" : "Saque Recusado", 
      description: "O status foi atualizado e o saldo processado." 
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Chave PIX copiada para a área de transferência." });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold mb-2 uppercase">Gestão de Pagamentos</h1>
        <p className="text-muted-foreground">Processe as solicitações de saque dos afiliados PJ ELITE.</p>
      </div>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4 w-full max-w-md">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome ou chave PIX..." 
                className="border-none bg-transparent shadow-none focus-visible:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead>Afiliado</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Dados PIX</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((req) => (
                  <TableRow key={req.id} className="border-border hover:bg-muted/30">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{req.affiliateName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-primary">R$ {req.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 group">
                          <Badge variant="outline" className="text-[8px] uppercase h-5">{req.pixType}</Badge>
                          <span className="text-xs font-mono">{req.pixKey}</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(req.pixKey)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{req.pixName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[8px] border-none font-bold tracking-widest",
                        req.status === 'pending' ? "bg-yellow-500/20 text-yellow-500" :
                        req.status === 'paid' ? "bg-green-500/20 text-green-500" :
                        "bg-red-500/20 text-red-500"
                      )}>
                        {req.status === 'pending' ? "PENDENTE" : req.status === 'paid' ? "PAGO" : "RECUSADO"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="icon" 
                            className="h-8 w-8 bg-green-500 hover:bg-green-600 rounded-lg"
                            onClick={() => handleAction(req.id, 'paid')}
                          >
                            <Check className="w-4 h-4 text-white" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:bg-red-500/5"
                            onClick={() => handleAction(req.id, 'rejected')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground uppercase text-xs font-bold">
                    Nenhuma solicitação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
