"use client";
import styles from "./admin.module.css";
export default function AdminError({ reset }: { reset: () => void }) { return <main className={styles.main}><h1>Não foi possível carregar o painel.</h1><p>Confira se o banco está disponível e se as migrações foram aplicadas.</p><button onClick={reset}>Tentar novamente</button></main>; }
