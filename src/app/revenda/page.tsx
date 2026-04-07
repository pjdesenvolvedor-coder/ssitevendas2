
"use client";

import { useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useProducts } from "@/context/products-context";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, Zap, ShoppingCart, Tv, Play, Ban, Sparkles, ArrowRight, Briefcase, Boxes } from "lucide-react";
import { useSearchParams } from "next/navigation";

function RefTracker() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      sessionStorage.setItem('pj_contas_ref', ref);
    }
  }, [searchParams]);
  return null;
}

export default function RevendaPage() {
  const { products } = useProducts();
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero')?.imageUrl || '';
  const logoImg = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';

  const revendaProducts = products.filter(p => p.active && p.isRevenda);
  const promotionProducts = revendaProducts.filter(p => p.isPromotion);
  const regularProducts = revendaProducts.filter(p => !p.isPromotion);

  const scrollToProducts = () => {
    const element = document.getElementById('produtos-revenda');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = ['Netflix Revenda', 'Disney+ Pack', 'HBO Max Business', 'Combo Premium'];
  const tickerItems = [...categories, ...categories];

  const VerifiedBadge = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-blue-500 animate-pulse shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
    </svg>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <Suspense fallback={null}>
        <RefTracker />
      </Suspense>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden flex items-center">
        <div className="absolute inset-0 -z-10 opacity-30">
          <Image 
            src={heroImg} 
            alt="Fundo Hero" 
            fill 
            className="object-cover scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center">
          <Badge variant="outline" className="mb-8 border-primary/50 text-primary px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] bg-primary/5">
            <Briefcase className="w-3 h-3 mr-2 fill-primary" />
            OPORTUNIDADE PARA REVENDEDORES
          </Badge>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-headline font-bold mb-6 leading-[0.9] tracking-normal">
            CATÁLOGO DE <br />
            <span className="text-primary italic">REVENDA.</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 max-w-lg mx-auto font-body leading-relaxed px-4">
            Preços exclusivos para atacado. Abasteça seu negócio com a melhor qualidade da <span className="pj-text">PJ</span> <span className="contas-text">CONTAS</span>.
          </p>
          <div className="flex flex-col gap-4 px-6 sm:flex-row sm:justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto h-16 text-xl rounded-2xl font-bold shadow-2xl shadow-primary/30 uppercase tracking-widest"
              onClick={scrollToProducts}
            >
              Ver Tabela Atacado
            </Button>
            <Link href="https://wa.link/epce4q" target="_blank" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full h-14 text-lg rounded-2xl font-bold bg-[#25D366] hover:bg-[#1EBE57] text-white uppercase tracking-widest border-none shadow-md shadow-green-500/10"
              >
                FALAR COM CONSULTOR
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ticker Section */}
      <section className="py-4 bg-card/20 border-y border-white/5 relative overflow-hidden">
        <div className="ticker-container pointer-events-none">
          <div className="animate-marquee flex whitespace-nowrap">
            {tickerItems.map((cat, i) => (
              <div key={i} className="ticker-item flex items-center gap-3 relative overflow-hidden group">
                <Zap className="w-4 h-4 fill-current opacity-50" />
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenda Promotions */}
      {promotionProducts.length > 0 && (
        <section className="py-16 container mx-auto px-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase tracking-normal">Melhores Margens</h2>
              <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Destaques para o seu estoque</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotionProducts.map((product) => {
              const hasStock = product.stock > 0;
              return (
                <Card key={product.id} className="group bg-primary/5 border-primary/20 hover:border-primary transition-all duration-500 rounded-[2rem] overflow-hidden relative">
                  <CardContent className="p-0">
                    <div className="relative h-48 w-full">
                      {product.imageUrl && (
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition-transform group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-black/80 text-primary border border-primary/20 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold gap-2">
                          <Boxes className="w-3 h-3 text-primary" />
                          {product.stock} EM ESTOQUE
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-headline font-bold uppercase">{product.name}</h3>
                        <VerifiedBadge />
                      </div>
                      <div className="flex flex-col mb-6">
                        <span className="text-4xl font-headline font-bold text-white">R$ {product.price.toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">PREÇO DA CONTA</span>
                      </div>
                      {hasStock ? (
                        <Link href={`/checkout/${product.id}`} className="w-full">
                          <Button className="w-full bg-primary hover:bg-primary/90 font-bold h-12 rounded-xl uppercase tracking-widest gap-2">
                            Comprar Lote
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled className="w-full bg-muted text-red-500 font-bold h-12 rounded-xl uppercase tracking-widest gap-2">
                          Esgotado
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Revenda Grid */}
      <section id="produtos-revenda" className="py-16 container mx-auto px-6">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 uppercase tracking-normal">Tabela de Atacado</h2>
          <div className="w-20 h-1 bg-primary mb-4 mx-auto md:mx-0"></div>
          <p className="text-base text-muted-foreground max-w-md">
            Selecione o pacote ideal para sua revenda e receba os acessos imediatamente.
          </p>
          <p className="text-xs text-primary font-bold uppercase mt-4 tracking-wider">
            Todas nossas contas são feitas no nosso email para agilizar devidos suportes!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {regularProducts.length > 0 ? regularProducts.map((product) => {
            const hasStock = product.stock > 0;
            return (
              <Card key={product.id} className="group bg-card/60 border-white/5 hover:border-primary/50 transition-all duration-500 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                <CardContent className="p-8">
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex justify-end">
                      <Badge className="bg-black/60 text-primary border border-primary/20 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold gap-2">
                        <Boxes className="w-3 h-3 text-primary" />
                        {product.stock} EM ESTOQUE
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 shrink-0">
                        {product.imageUrl && <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-2xl font-headline uppercase tracking-normal">{product.name}</CardTitle>
                          <VerifiedBadge />
                        </div>
                        <div className="flex mt-1">
                          <Badge variant="outline" className="text-[8px] uppercase tracking-widest text-primary border-primary/30 h-5 px-2">Revenda</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm gap-3 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-4xl font-headline font-bold text-white leading-none">R$ {product.price.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-2">PREÇO DA CONTA</span>
                    </div>
                    
                    {hasStock ? (
                      <Link href={`/checkout/${product.id}`}>
                        <Button className="bg-primary hover:bg-primary/90 h-11 px-8 text-xs rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                          Adquirir
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="bg-muted/50 text-red-500 h-11 px-6 text-xs rounded-xl font-bold uppercase tracking-widest">
                        Reposição em breve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="col-span-full py-20 text-center bg-card/20 rounded-[3rem] border border-dashed border-white/5">
              <p className="text-muted-foreground font-bold uppercase tracking-[0.2em]">O catálogo de revenda está sendo atualizado...</p>
            </div>
          )}
        </div>
      </section>

      <footer className="py-16 bg-black/40 border-t border-white/5 px-6 mt-auto">
        <div className="container mx-auto flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-headline font-bold tracking-normal">
              <span className="pj-text">PJ</span> <span className="contas-text">CONTAS</span> <span className="text-primary italic">REVENDA</span>
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] max-w-xs leading-loose">
            © 2024 PJ CONTAS. ÁREA EXCLUSIVA PARA PARCEIROS E REVENDEDORES. TODOS OS DIREITOS RESERVADOS.
          </p>
        </div>
      </footer>
    </div>
  );
}
