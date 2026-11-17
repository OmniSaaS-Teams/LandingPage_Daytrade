import Link from "next/link";
import { logout } from "../../app/admin/auth-actions";
import styles from "../../app/admin/admin.module.css";

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  return <><header className={styles.header}><Link className={styles.brand} href="/admin">DAYTRADE <span>ADMIN</span></Link><nav><Link href="/admin">Visão geral</Link><Link href="/admin/acessos">Acessos</Link><Link href="/admin/contatos">Contatos e currículos</Link><Link href="/admin/blog">Blog</Link><Link href="/admin/instagram">Instagram</Link><Link href="/" target="_blank">Ver site ↗</Link></nav><form action={logout}><span>{email}</span><button>Sair</button></form></header><main className={styles.main}>{children}</main></>;
}
