import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminShell } from "../../../components/admin/AdminShell";
import { dateLabel } from "../../../lib/admin-data.ts";
import { requireAdmin } from "../../../lib/auth.ts";
import { pageViewPath } from "../../../lib/page-view-path.ts";
import { pageViewIpPageSize, pageViewPeriods, readPageViews } from "../../../lib/page-views.ts";
import styles from "../admin.module.css";

const number = new Intl.NumberFormat("pt-BR");
const pageLabel = (path: string) => path === "/" ? "Página inicial" : path;
const viewDate = (timestamp: number) => dateLabel(new Date(timestamp));
const rankedPageLimit = 10;

async function AccessReport({ searchParams }: PageProps<"/admin/acessos">) {
  await connection();
  const admin = await requireAdmin();
  const params = await searchParams;
  const days = pageViewPeriods.find(days => String(days) === params.periodo) ?? 30;
  const path = pageViewPath(typeof params.rota === "string" ? params.rota : null);
  const requestedPage = Number(params.pagina);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100_000) : 1;
  const { summary, ips, pages } = await readPageViews(days, path, page);
  const pageCount = Math.max(1, Math.ceil(summary.uniqueIps / pageViewIpPageSize));
  const metrics = [
    { label: "Visualizações", value: summary.total },
    { label: "IPs distintos", value: summary.uniqueIps },
    { label: "IPs com mais de um acesso", value: summary.repeatedIps },
    { label: "Visualizações sem IP", value: summary.withoutIp },
  ];

  function reportUrl(route: string | null, ipPage = 1) {
    const query = new URLSearchParams({ periodo: String(days) });
    if (route) query.set("rota", route);
    if (ipPage > 1) query.set("pagina", String(ipPage));
    return `/admin/acessos?${query}`;
  }

  return (
    <AdminShell email={admin.email}>
      <h1>Acessos ao site</h1>
      <p>Acompanhe as visualizações das páginas públicas e veja quantas vieram de cada IP.</p>

      <div className={styles.toolbar}>
        <form key={`${days}:${path ?? ""}`} className={styles.accessFilters}>
          <label>
            Período
            <select name="periodo" defaultValue={days}>
              {pageViewPeriods.map(period => <option key={period} value={period}>Últimos {period} dias</option>)}
            </select>
          </label>
          <label>
            Página
            <select name="rota" defaultValue={path ?? ""}>
              <option value="">Todas as páginas</option>
              {path && !pages.some(row => row.path === path) && <option value={path}>{pageLabel(path)}</option>}
              {pages.map(row => <option key={row.path} value={row.path}>{pageLabel(row.path)}</option>)}
            </select>
          </label>
          <button>Aplicar filtros</button>
        </form>
      </div>

      <div className={styles.cards}>
        {metrics.map(({ label, value }) => (
          <div className={styles.card} key={label}>
            <span>{label}</span>
            <strong>{number.format(value)}</strong>
          </div>
        ))}
      </div>
      <p className={styles.muted}>Pessoas na mesma rede podem compartilhar um IP. Um mesmo visitante também pode usar IPs diferentes.</p>

      <section className={styles.reportSection} aria-labelledby="ips-heading">
        <h2 id="ips-heading">Visualizações por IP</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table} aria-labelledby="ips-heading">
            <thead>
              <tr><th scope="col">Endereço IP</th><th scope="col">Visualizações</th><th scope="col">Primeiro acesso</th><th scope="col">Último acesso</th></tr>
            </thead>
            <tbody>
              {ips.map(row => (
                <tr key={row.ip}>
                  <td><code>{row.ip}</code></td>
                  <td>{number.format(row.views)}</td>
                  <td>{viewDate(row.firstView)}</td>
                  <td>{viewDate(row.lastView)}</td>
                </tr>
              ))}
              {!ips.length && <tr><td colSpan={4}>{summary.uniqueIps ? "Nenhum IP nesta página da lista." : "Nenhum IP identificado para este filtro."}</td></tr>}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <nav className={styles.pagination} aria-label="Paginação dos IPs">
            {page > 1 && <Link href={reportUrl(path, Math.min(page - 1, pageCount))}>← Anterior</Link>}
            <span>Página {number.format(page)} de {number.format(pageCount)}</span>
            {page < pageCount && <Link href={reportUrl(path, page + 1)}>Próxima →</Link>}
          </nav>
        )}
      </section>

      <section className={styles.reportSection} aria-labelledby="pages-heading">
        <h2 id="pages-heading">Páginas mais acessadas no período</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table} aria-labelledby="pages-heading">
            <thead>
              <tr><th scope="col">Página</th><th scope="col">Visualizações</th><th scope="col">IPs distintos</th></tr>
            </thead>
            <tbody>
              {pages.slice(0, rankedPageLimit).map(row => (
                <tr key={row.path}>
                  <td><Link href={reportUrl(row.path)}>{pageLabel(row.path)}</Link></td>
                  <td>{number.format(row.views)}</td>
                  <td>{number.format(row.uniqueIps)}</td>
                </tr>
              ))}
              {!pages.length && <tr><td colSpan={3}>Nenhuma visualização registrada no período.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

export default function AccessPage(props: PageProps<"/admin/acessos">) {
  return <Suspense fallback={<p>Carregando acessos…</p>}><AccessReport {...props} /></Suspense>;
}
