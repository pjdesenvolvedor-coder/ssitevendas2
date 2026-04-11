
'use client';

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, initiateAnonymousSignIn } from "@/firebase";

/**
 * Componente cliente responsável por capturar o parâmetro 'ref' da URL
 * e persistir no sessionStorage para atribuição de comissão.
 * Também garante que o usuário tenha uma sessão anônima no Firebase para evitar erros de permissão.
 */
export function GlobalRefTracker() {
  const searchParams = useSearchParams();
  const auth = useAuth();
  
  useEffect(() => {
    // 1. Rastreamento de Afiliado
    const ref = searchParams.get('ref');
    if (ref) {
      sessionStorage.setItem('pj_contas_ref', ref);
    }
    
    // 2. Autenticação Anônima Automática
    // Garante que o 'request.auth' no Firestore não seja nulo, o que evita bloqueios de segurança
    if (auth && !auth.currentUser) {
      initiateAnonymousSignIn(auth);
    }
  }, [searchParams, auth]);
  
  return null;
}
