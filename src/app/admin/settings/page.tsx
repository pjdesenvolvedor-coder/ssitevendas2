
"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/context/products-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Webhook, Save, Globe, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const { webhookSettings, updateWebhookSettings } = useProducts();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState(webhookSettings);

  useEffect(() => {
    setFormData(webhookSettings);
  }, [webhookSettings]);

  const handleSave = () => {
    updateWebhookSettings(formData);
    toast({
      title: "Configurações Salvas",
      description: "As preferências do Webhook foram atualizadas.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as integrações e automações do sistema.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="bg-card/50 border-border overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <Webhook className="w-6 h-6 text-primary" />
              <CardTitle className="font-headline text-2xl uppercase">Configuração de Webhook</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Envie os dados das vendas automaticamente para sua API ou bot</p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between p-6 bg-background border border-border rounded-2xl">
              <div className="space-y-1">
                <Label className="text-sm font-bold uppercase tracking-wider">Status do Webhook</Label>
                <p className="text-[10px] text-muted-foreground uppercase">Ative para começar a enviar dados após cada venda confirmada.</p>
              </div>
              <Switch 
                checked={formData.enabled} 
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })} 
              />
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">URL de Destino (Endpoint)</Label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="https://seu-servidor.com/api/webhook" 
                  className="bg-background border-border h-14 pl-12 rounded-xl focus:ring-primary"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-6">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Dados a serem enviados (JSON Payload)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'orderId', label: 'ID do Pedido' },
                  { id: 'customerName', label: 'Nome do Cliente' },
                  { id: 'customerPhone', label: 'WhatsApp do Cliente' },
                  { id: 'total', label: 'Valor Total da Venda' },
                  { id: 'items', label: 'Dados de Acesso (E-mail, Senha, Perfil)' },
                ].map((field) => (
                  <div key={field.id} className="flex items-center space-x-3 p-4 bg-muted/20 rounded-xl border border-border/50">
                    <Checkbox 
                      id={field.id} 
                      checked={formData.fields[field.id as keyof typeof formData.fields]}
                      onCheckedChange={(checked) => 
                        setFormData({ 
                          ...formData, 
                          fields: { ...formData.fields, [field.id]: !!checked } 
                        })
                      }
                    />
                    <Label htmlFor={field.id} className="text-xs font-bold uppercase cursor-pointer">{field.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                className="w-full h-14 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 gap-3"
              >
                <Save className="w-5 h-5" />
                SALVAR CONFIGURAÇÕES
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-[2rem] flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 text-yellow-500 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-yellow-500 uppercase text-xs">Segurança dos Dados</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
              Certifique-se de que sua URL de Webhook seja segura (HTTPS). Os dados enviados incluem credenciais de acesso sensíveis se a opção "Dados de Acesso" estiver marcada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
