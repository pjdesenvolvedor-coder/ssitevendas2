
"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/context/products-context";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  GripVertical,
  Tv,
  Link as LinkIcon,
  Pencil,
  Tag
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { StreamingService } from "@/lib/types";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function AdminProductsRevendaPage() {
  const { products, addProduct, deleteProduct, updateProduct, updateProductsOrder } = useProducts();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StreamingService | null>(null);
  const [productToDelete, setProductToDelete] = useState<StreamingService | null>(null);
  const { toast } = useToast();

  const revendaProducts = products.filter(p => p.isRevenda);

  const [newFeature, setNewFeature] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    imageUrl: "",
    features: [] as string[],
    isPromotion: false
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    imageUrl: "",
    features: [] as string[],
    active: true,
    isPromotion: false
  });
  const [newEditFeature, setNewEditFeature] = useState("");

  useEffect(() => {
    if (editingProduct) {
      setEditFormData({
        name: editingProduct.name,
        price: editingProduct.price.toString(),
        originalPrice: editingProduct.originalPrice?.toString() || "",
        imageUrl: editingProduct.imageUrl,
        features: [...editingProduct.features],
        active: editingProduct.active,
        isPromotion: editingProduct.isPromotion || false
      });
    }
  }, [editingProduct]);

  const addFeature = (mode: 'add' | 'edit') => {
    if (mode === 'add') {
      if (newFeature.trim()) {
        setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
        setNewFeature("");
      }
    } else {
      if (newEditFeature.trim()) {
        setEditFormData({ ...editFormData, features: [...editFormData.features, newEditFeature.trim()] });
        setNewEditFeature("");
      }
    }
  };

  const removeFeature = (index: number, mode: 'add' | 'edit') => {
    if (mode === 'add') {
      setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
    } else {
      setEditFormData({ ...editFormData, features: editFormData.features.filter((_, i) => i !== index) });
    }
  };

  const onDragEndFeatures = (result: DropResult, mode: 'add' | 'edit') => {
    if (!result.destination) return;
    const items = mode === 'add' ? Array.from(formData.features) : Array.from(editFormData.features);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    if (mode === 'add') {
      setFormData({ ...formData, features: items });
    } else {
      setEditFormData({ ...editFormData, features: items });
    }
  };

  const onDragEndProducts = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(revendaProducts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateProductsOrder(items);
    toast({ title: "Ordem Atualizada", description: "A vitrine de revenda foi reorganizada." });
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.imageUrl) {
      toast({ title: "Campos Incompletos", description: "Por favor, preencha nome, preço e URL da imagem.", variant: "destructive" });
      return;
    }
    
    const newProduct: StreamingService = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      price: parseFloat(formData.price),
      description: "",
      stock: 0,
      features: formData.features.length > 0 ? formData.features : ["Acesso imediato", "Suporte 24h"],
      imageUrl: formData.imageUrl,
      active: true,
      isPromotion: formData.isPromotion,
      isRevenda: true,
      originalPrice: (formData.isPromotion && formData.originalPrice) ? parseFloat(formData.originalPrice) : null,
    };

    addProduct(newProduct);
    toast({ title: "Produto de Revenda Salvo", description: `${formData.name} foi adicionado.` });
    setIsAdding(false);
    setFormData({ name: "", price: "", originalPrice: "", imageUrl: "", features: [], isPromotion: false });
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    if (!editFormData.name || !editFormData.price || !editFormData.imageUrl) {
      toast({ title: "Campos Incompletos", description: "Por favor, preencha nome, preço e URL da imagem.", variant: "destructive" });
      return;
    }

    const updatedProduct: StreamingService = {
      ...editingProduct,
      name: editFormData.name,
      price: parseFloat(editFormData.price),
      imageUrl: editFormData.imageUrl,
      features: editFormData.features,
      active: editFormData.active,
      isPromotion: editFormData.isPromotion,
      originalPrice: (editFormData.isPromotion && editFormData.originalPrice) ? parseFloat(editFormData.originalPrice) : null,
    };

    updateProduct(updatedProduct);
    toast({ title: "Produto Atualizado", description: "Alterações salvas com sucesso." });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold mb-2 tracking-normal">Produtos (Revenda)</h1>
          <p className="text-muted-foreground">Gerencie o catálogo exclusivo para revendedores.</p>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2 font-bold py-6 px-6 rounded-2xl">
              <Plus className="w-5 h-5" />
              Novo Produto Revenda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-card border-border rounded-[2rem] max-h-[90vh] overflow-y-auto no-scrollbar">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl uppercase tracking-normal">Novo Item Revenda</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-bold uppercase tracking-wider text-primary">Destaque Revenda</Label>
                  <p className="text-[10px] text-muted-foreground">Coloca este item em evidência no catálogo de revenda.</p>
                </div>
                <Switch checked={formData.isPromotion} onCheckedChange={(val) => setFormData({...formData, isPromotion: val})} />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nome do Serviço</Label>
                <Input placeholder="Ex: Pack 10 Contas Netflix" className="bg-background border-border h-12 rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">URL da Imagem</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="https://exemplo.com/imagem.jpg" className="bg-background border-border h-12 rounded-xl pl-12" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Preço Revenda (R$)</Label>
                  <Input type="number" placeholder="150.00" className="bg-background border-border h-12 rounded-xl" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                {formData.isPromotion && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-primary">Preço Antigo (R$)</Label>
                    <Input type="number" placeholder="190.00" className="bg-background border-primary/30 h-12 rounded-xl" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Características</Label>
                <div className="flex gap-2">
                  <Input placeholder="Ex: 10 contas completas" className="bg-background border-border h-12 rounded-xl flex-1" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addFeature('add')} />
                  <Button type="button" onClick={() => addFeature('add')} className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90"><Plus className="w-5 h-5" /></Button>
                </div>
                <DragDropContext onDragEnd={(res) => onDragEndFeatures(res, 'add')}>
                  <Droppable droppableId="features-add-revenda">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {formData.features.map((feature, idx) => (
                          <Draggable key={`add-rev-${idx}`} draggableId={`add-rev-${idx}`} index={idx}>
                            {(provided, snap) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={cn("flex items-center justify-between p-3 bg-background border border-border rounded-xl", snap.isDragging && "shadow-2xl border-primary")}>
                                <div className="flex items-center gap-3"><GripVertical className="w-4 h-4 text-muted-foreground" /><CheckCircle2 className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{feature}</span></div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => removeFeature(idx, 'add')}><X className="w-4 h-4" /></Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="rounded-xl h-12 font-bold flex-1" onClick={() => setIsAdding(false)}>CANCELAR</Button>
              <Button className="bg-primary hover:bg-primary/90 font-bold rounded-xl h-12 flex-1" onClick={handleSaveProduct}>SALVAR</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={onDragEndProducts}>
        <Droppable droppableId="products-revenda">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 gap-4">
              {revendaProducts.map((product, idx) => (
                <Draggable key={product.id} draggableId={product.id} index={idx}>
                  {(provided, snap) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={cn("rounded-2xl transition-all", snap.isDragging && "z-50 scale-[1.02]")}>
                      <Card className={cn("bg-card/50 border-border rounded-2xl overflow-hidden group transition-shadow", snap.isDragging && "shadow-2xl border-primary bg-card")}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="text-muted-foreground cursor-grab active:cursor-grabbing p-2"><GripVertical className="w-5 h-5" /></div>
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-primary/10">
                                  {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover" /> : <Tv className="w-5 h-5 text-primary absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                  {product.isPromotion && (
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                      <Tag className="w-6 h-6 text-primary animate-pulse" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm">{product.name}</span>
                                    {product.isPromotion && <Badge className="bg-primary text-white text-[8px] h-4 uppercase">Destaque</Badge>}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground uppercase truncate max-w-[150px]">{product.imageUrl}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="flex flex-col text-right">
                                  <div className="flex items-center gap-2 justify-end">
                                    {product.originalPrice && <span className="text-[10px] text-muted-foreground line-through">R$ {product.originalPrice.toFixed(2)}</span>}
                                    <span className="font-bold text-primary text-sm">R$ {product.price.toFixed(2)}</span>
                                  </div>
                                  <span className={`text-[10px] ${product.stock < 5 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{product.stock} em estoque</span>
                                </div>
                                <Badge className={product.active ? "bg-green-500/20 text-green-500 border-none" : "bg-muted text-muted-foreground"}>{product.active ? "Ativo" : "Inativo"}</Badge>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl" onClick={() => setEditingProduct(product)}>
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-xl" onClick={() => setProductToDelete(product)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[550px] bg-card border-border rounded-[2rem] max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl uppercase tracking-normal">Editar {editingProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-bold uppercase tracking-wider text-primary">Destaque Revenda</Label>
                  <p className="text-[10px] text-muted-foreground">Coloca este item em evidência.</p>
                </div>
                <Switch checked={editFormData.isPromotion} onCheckedChange={(val) => setEditFormData({...editFormData, isPromotion: val})} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-bold uppercase tracking-wider">Status</Label>
                  <p className="text-[10px] text-muted-foreground">Define se aparece no catálogo de revenda.</p>
                </div>
                <Switch checked={editFormData.active} onCheckedChange={(val) => setEditFormData({...editFormData, active: val})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nome do Serviço</Label>
              <Input className="bg-background border-border h-12 rounded-xl" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">URL da Imagem</Label>
              <Input className="bg-background border-border h-12 rounded-xl" value={editFormData.imageUrl} onChange={(e) => setEditFormData({...editFormData, imageUrl: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Preço Revenda (R$)</Label>
                <Input type="number" className="bg-background border-border h-12 rounded-xl" value={editFormData.price} onChange={(e) => setEditFormData({...editFormData, price: e.target.value})} />
              </div>
              {editFormData.isPromotion && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-primary">Preço Original (R$)</Label>
                  <Input type="number" placeholder="Opcional" className="bg-background border-primary/30 h-12 rounded-xl" value={editFormData.originalPrice} onChange={(e) => setEditFormData({...editFormData, originalPrice: e.target.value})} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Características</Label>
              <div className="flex gap-2">
                <Input placeholder="Nova vantagem..." className="bg-background border-border h-12 rounded-xl flex-1" value={newEditFeature} onChange={(e) => setNewEditFeature(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addFeature('edit')} />
                <Button type="button" onClick={() => addFeature('edit')} className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90"><Plus className="w-5 h-5" /></Button>
              </div>
              <DragDropContext onDragEnd={(res) => onDragEndFeatures(res, 'edit')}>
                <Droppable droppableId="features-edit-revenda">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {editFormData.features.map((feature, idx) => (
                        <Draggable key={`edit-rev-${idx}`} draggableId={`edit-rev-${idx}`} index={idx}>
                          {(provided, snap) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={cn("flex items-center justify-between p-3 bg-background border border-border rounded-xl", snap.isDragging && "shadow-2xl border-primary bg-card")}>
                              <div className="flex items-center gap-3"><GripVertical className="w-4 h-4 text-muted-foreground" /><CheckCircle2 className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{feature}</span></div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => removeFeature(idx, 'edit')}><X className="w-4 h-4" /></Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl h-12 font-bold flex-1" onClick={() => setEditingProduct(null)}>CANCELAR</Button>
            <Button className="bg-primary hover:bg-primary/90 font-bold rounded-xl h-12 flex-1" onClick={handleUpdateProduct}>SALVAR ALTERAÇÕES</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="bg-card border-border rounded-[2rem]">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4"><AlertCircle className="w-6 h-6 text-red-500" /></div>
            <AlertDialogTitle className="font-headline text-2xl text-center uppercase tracking-normal">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground">Deseja excluir <strong>{productToDelete?.name}</strong> da revenda?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
            <AlertDialogCancel className="rounded-xl h-12 font-bold px-8">CANCELAR</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 rounded-xl h-12 font-bold px-8" onClick={() => { if (productToDelete) { deleteProduct(productToDelete.id); toast({ title: "Produto Excluído", description: "Removido da revenda." }); setProductToDelete(null); } }}>EXCLUIR AGORA</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
