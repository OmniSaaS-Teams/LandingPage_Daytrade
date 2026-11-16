import { Suspense } from "react";
import Link from "next/link";
import { login } from "../auth-actions";
import styles from "../admin.module.css";

async function LoginForm({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return <main className={styles.login}><Link href="/" className={styles.brand}>DAYTRADE <span>ADMIN</span></Link><h1>Acesso à administração</h1><p>Contatos, currículos e conteúdo em um só lugar.</p>
    {erro && <p className={styles.alert} role="alert">{erro === "limite" ? "Muitas tentativas. Aguarde 15 minutos." : erro === "indisponivel" ? "Serviço indisponível. Confira a configuração do banco." : "E-mail ou senha incorretos."}</p>}
    <form action={login} className={styles.form}><label>E-mail<input name="email" type="email" autoComplete="username" required maxLength={254} /></label><label>Senha<input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label><button>Entrar</button></form>
  </main>;
}
export default function LoginPage(props: { searchParams: Promise<{ erro?: string }> }) { return <Suspense fallback={<p>Carregando…</p>}><LoginForm {...props} /></Suspense>; }
