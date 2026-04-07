
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
import { CheckCircle2, Star, Zap, ShoppingCart, Tv, Play, Ban, Sparkles, ArrowRight } from "lucide-react";
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

export default function Home() {
  const { products } = useProducts();
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero')?.imageUrl || '';
  const logoImg = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';

  const categories = ['Netflix', 'Disney+', 'HBO Max', 'Prime Video', 'Star+', 'GloboPlay', 'Apple TV+'];
  const tickerItems = [...categories, ...categories];

  const scrollToProducts = () => {
    const element = document.getElementById('produtos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const retailProductsList = products.filter(p => !p.isRevenda);
  const promotionProducts = retailProductsList.filter(p => p.active && p.isPromotion);
  const regularProducts = retailProductsList.filter(p => p.active && !p.isPromotion);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <Suspense fallback={null}>
        <RefTracker />
      </Suspense>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden flex items-center">
        <div className="absolute inset-0 -z-10 opacity-40">
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
            <Star className="w-3 h-3 mr-2 fill-primary" />
            LÍDER EM ENTRETENIMENTO PREMIUM
          </Badge>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-headline font-bold mb-6 leading-[0.9] tracking-normal">
            STREAMING SEM <br />
            <span className="text-primary italic">LIMITES.</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 max-w-lg mx-auto font-body leading-relaxed px-4">
            Acesso instantâneo às melhores plataformas do mundo. Sem burocracia e com a confiança da <span className="pj-text">PJ</span> <span className="contas-text">CONTAS</span>.
          </p>
          <div className="flex flex-col gap-4 px-6 sm:flex-row sm:justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto h-16 text-xl rounded-2xl font-bold shadow-2xl shadow-primary/30 uppercase tracking-widest"
              onClick={scrollToProducts}
            >
              Ver Catálogo
            </Button>
            <Link href="https://wa.link/epce4q" target="_blank" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full h-16 text-xl rounded-2xl font-bold bg-[#25D366] hover:bg-[#1EBE57] text-white uppercase tracking-widest gap-3 shadow-lg shadow-green-500/20 border-none"
              >
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                SUPORTE AQUI
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ticker Section */}
      <section className="py-4 bg-card/20 border-y border-white/5 relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-20 bg-primary/20 blur-[60px] pointer-events-none rounded-full z-0"></div>
        <div className="ticker-container pointer-events-none">
          <div className="animate-marquee flex whitespace-nowrap">
            {tickerItems.map((cat, i) => (
              <div key={i} className="ticker-item flex items-center gap-3 relative overflow-hidden group">
                <Play className="w-4 h-4 fill-current opacity-50" />
                {cat}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="py-16 container mx-auto px-6">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase tracking-normal">Promoções do dia</h2>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Ofertas exclusivas por tempo limitado</p>
          </div>
        </div>

        {promotionProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotionProducts.map((product) => {
              const hasStock = product.stock > 0;
              return (
                <Card key={product.id} className="group bg-primary/5 border-primary/20 hover:border-primary transition-all duration-500 rounded-[2rem] overflow-hidden relative">
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-primary text-white font-bold animate-pulse">OFERTA ESPECIAL</Badge>
                  </div>
                  <CardContent className="p-0">
                    <div className="relative h-48 w-full">
                      {product.imageUrl && (
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition-transform group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-headline font-bold mb-2 uppercase">{product.name}</h3>
                      <div className="flex flex-col mb-6">
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through decoration-primary decoration-2">
                            De: R$ {product.originalPrice.toFixed(2)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Por:</span>
                          <span className="text-3xl font-headline font-bold text-white">R$ {product.price.toFixed(2)}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">/ MÊS</span>
                        </div>
                      </div>
                      {hasStock ? (
                        <Link href={`/checkout/${product.id}`} className="w-full">
                          <Button className="w-full bg-primary hover:bg-primary/90 font-bold h-12 rounded-xl uppercase tracking-widest gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            Aproveitar agora
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled className="w-full bg-muted text-red-500 font-bold h-12 rounded-xl uppercase tracking-widest gap-2">
                          <Ban className="w-4 h-4 text-red-500" />
                          Sem Estoque
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-card/30 border-dashed border-white/10 rounded-[2rem] p-12 text-center">
            <div className="max-w-xs mx-auto space-y-6">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Sem ofertas agora</h3>
                <p className="text-sm text-muted-foreground">Fique de olho! Novas promoções podem surgir a qualquer momento.</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest gap-2"
                onClick={scrollToProducts}
              >
                Ver todos os produtos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Product Grid */}
      <section id="produtos" className="py-16 container mx-auto px-6">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 uppercase tracking-normal">Plataformas Disponíveis</h2>
          <div className="w-20 h-1 bg-primary mb-4 mx-auto md:mx-0"></div>
          <p className="text-base text-muted-foreground max-w-md">
            Escolha seu serviço favorito e receba os dados de acesso imediato na <span className="pj-text">PJ</span> <span className="contas-text">CONTAS</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {regularProducts.map((product) => {
            const hasStock = product.stock > 0;
            
            return (
              <Card key={product.id} className="group bg-card/60 border-white/5 hover:border-primary/50 transition-all duration-500 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                <CardHeader className="p-0">
                  <div className="relative h-56 w-full overflow-hidden">
                    {product.imageUrl && (
                      <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-100"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card/40 via-transparent to-transparent"></div>
                    <div className="absolute top-6 right-6">
                      {hasStock ? (
                        <Badge className="bg-primary text-white border-none font-bold py-1 px-4 text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">POPULAR</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold py-1 px-4 text-[10px] uppercase tracking-widest">INDISPONÍVEL</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Tv className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-headline uppercase tracking-normal">{product.name}</CardTitle>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm gap-3 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-headline font-bold text-white">R$ {product.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">/ MÊS</span>
                    </div>
                    
                    {hasStock ? (
                      <Link href={`/checkout/${product.id}`} className="w-full">
                        <Button className="bg-primary hover:bg-primary/90 w-full h-16 text-lg rounded-2xl font-bold gap-3 shadow-xl shadow-primary/20 uppercase tracking-[0.1em]">
                          <ShoppingCart className="w-5 h-5" />
                          ASSINAR AGORA
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="bg-muted/50 text-red-500 w-full h-16 text-lg rounded-2xl font-bold gap-3 cursor-not-allowed uppercase tracking-[0.1em] border border-white/5">
                        <Ban className="w-5 h-5 text-red-500" />
                        SEM ESTOQUE
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 blur-[80px] rounded-full"></div>
          <div className="relative z-10">
            <Zap className="w-14 h-14 text-primary mx-auto mb-6 animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 uppercase tracking-normal">Pronto para maratonar?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-sm mx-auto">
              O maior catálogo do mundo na palma da sua mão. Escolha <span className="pj-text">PJ</span> <span className="contas-text">CONTAS</span>.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 w-full max-w-xs h-16 text-xl rounded-2xl font-bold shadow-2xl shadow-primary/30 uppercase tracking-widest"
              onClick={scrollToProducts}
            >
              COMEÇAR AGORA
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-16 bg-black/40 border-t border-white/5 px-6">
        <div className="container mx-auto flex flex-col items-center text-center gap-10">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image src={logoImg} alt="PJ CONTAS Logo" fill className="object-contain" />
            </div>
            <span className="text-2xl font-headline font-bold tracking-normal">
              <span className="pj-text">PJ</span> <span className="contas-text">CONTAS</span>
            </span>
          </div>
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] max-w-xs leading-loose">
            © 2024 <span className="pj-text">PJ</span> <span className="contas-text">CONTAS</span>. ENTRETENIMENTO DE ALTA QUALIDADE ACESSÍVEL PARA TODOS OS BRASILEIROS.
          </p>
        </div>
      </footer>
    </div>
  );
}
