
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
import { Search, Check, X, Percent, Wallet, Phone, Mail, User, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Affiliate } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function AdminAffiliatesPage() {
  const { affiliates, updateAffiliateStatus, appSettings, updateAppSettings } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [newRate, setNewRate] = useState("");
  const { toast } = useToast();

  const filteredAffiliates = affiliates.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = (id: string, status: Affiliate['status']) => {
    updateAffiliateStatus(id, status);
    toast({ title: "Status Atualizado", description: `Afiliado ${status === 'active' ? 'ativado' : 'rejeitado'}.` });
  };

  const handleSaveSettings = () => {
    if (editingAffiliate) {
      updateAffiliateStatus(editingAffiliate.id, editingAffiliate.status, parseFloat(newRate));
      toast({ title: "Sucesso", description: "Comissão personalizada salva." });
      setEditingAffiliate(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold mb-2 uppercase">Gestão de Afiliados</h1>
          <p className="text-muted-foreground">Aprove cadastros e gerencie comissões de vendas.</p>
        </div>

        <Card className="bg-primary/5 border-primary/20 p-4 flex items-center gap-4">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase text-primary">Comissão Global (%)</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                className="w-20 h-10 bg-background border-primary/30 text-center font-bold"
                value={appSettings.defaultCommissionRate}
                onChange={(e) => updateAppSettings({ ...appSettings, defaultCommissionRate: parseFloat(e.target.value) })}
              />
              <Badge className="bg-primary text-white rounded-lg px-3">%</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4 w-full max-w-md">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome ou e-mail..." 
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
                <TableHead>Status</TableHead>
                <TableHead>Carteira</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAffiliates.length > 0 ? (
                filteredAffiliates.map((aff) => (
                  <TableRow key={aff.id} className="border-border hover:bg-muted/30">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{aff.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{aff.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        aff.status === 'active' ? "bg-green-500/20 text-green-500 border-none" :
                        aff.status === 'pending' ? "bg-yellow-500/20 text-yellow-500 border-none" :
                        "bg-red-500/20 text-red-500 border-none"
                      }>
                        {aff.status === 'active' ? "ATIVO" : aff.status === 'pending' ? "PENDENTE" : "REJEITADO"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-primary">R$ {aff.balance?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell className="text-xs font-medium">
                      {aff.commissionRate ? `${aff.commissionRate}% (Indiv.)` : `${appSettings.defaultCommissionRate}% (Global)`}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {aff.status === 'pending' && (
                          <>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:bg-green-500/5" onClick={() => handleUpdateStatus(aff.id, 'active')}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/5" onClick={() => handleUpdateStatus(aff.id, 'rejected')}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-primary hover:bg-primary/5"
                          onClick={() => { setEditingAffiliate(aff); setNewRate(aff.commissionRate?.toString() || ""); }}
                        >
                          <Percent className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground uppercase text-xs font-bold">
                    Nenhum afiliado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingAffiliate} onOpenChange={(o) => !o && setEditingAffiliate(null)}>
        <DialogContent className="bg-card border-border rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl uppercase">Configurar Comissão</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-muted/20 rounded-2xl border border-border/50 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold"><User className="w-4 h-4 text-primary" /> {editingAffiliate?.name}</div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase"><Mail className="w-3 h-3" /> {editingAffiliate?.email}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Porcentagem Individual (%)</Label>
              <Input 
                type="number" 
                placeholder="Ex: 15" 
                className="h-12 bg-background border-border rounded-xl font-bold"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground px-1 italic">
                Deixe em branco para usar a taxa global de {appSettings.defaultCommissionRate}%.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl h-12 flex-1" onClick={() => setEditingAffiliate(null)}>CANCELAR</Button>
            <Button className="bg-primary hover:bg-primary/90 rounded-xl h-12 flex-1 font-bold" onClick={handleSaveSettings}>SALVAR TAXA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
