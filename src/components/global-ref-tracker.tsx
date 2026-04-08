
'use client';

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Componente cliente responsável por capturar o parâmetro 'ref' da URL
 * e persistir no sessionStorage para atribuição de comissão.
 */
export function GlobalRefTracker() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      sessionStorage.setItem('pj_contas_ref', ref);
    }
  }, [searchParams]);
  
  return null;
}
