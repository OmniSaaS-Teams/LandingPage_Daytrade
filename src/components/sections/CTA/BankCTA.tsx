import Image from "next/image";
import styles from "./BankCTA.module.css";

export function BankCTA() {
  return (
    <section className={styles.section} aria-labelledby="bank-cta-title">
      <div className={styles.banner}>
        <div className={styles.copy}>
          <Image className={styles.logo} src="/images/dti-logo-cta.png" alt="DTI Digital" width={171} height={50} />
          <p className={styles.eyebrow}>SEU NEGÓCIO EM MOVIMENTO</p>
          <h2 id="bank-cta-title">Uma conta digital.<br /><span>Novas possibilidades</span><br />para sua empresa.</h2>
          <p className={styles.description}>Pagamentos, transferências e gestão financeira. Conheça a DTI Digital e tenha seu negócio sempre por perto.</p>
          <a className={styles.button} href="https://www.bancodti.com.br/" target="_blank" rel="noopener noreferrer">Conheça o Banco DTI <span aria-hidden="true">↗</span></a>
          <p className={styles.note}>Soluções para empresas. Atendimento próximo.</p>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.halo} />
          <div className={styles.orbit} />
          <div className={styles.phoneLayer}><Image src="/images/dti-cta-phone-login.png" alt="" width={1024} height={1536} sizes="(max-width: 640px) 72vw, 420px" className={styles.phone} /></div>
          <div className={styles.cardLayer}><Image src="/images/dti-cta-card.png" alt="" width={1024} height={1536} sizes="(max-width: 640px) 45vw, 270px" className={styles.card} /></div>
          <div className={styles.payment}>
            <span className={styles.paymentIcon}>↗</span>
            <span><small>Gestão financeira</small><strong>Seu negócio conectado</strong><span className={styles.sparkline}><i /><i /><i /><i /><i /><i /><i /><i /><i /></span></span>
          </div>
          <div className={styles.transfer}><span className={styles.check}>✓</span><span><strong>Conta empresarial</strong><small>Pagamentos e transferências</small></span></div>
          <span className={styles.illustration}>Composição e interface ilustrativas</span>
        </div>
      </div>
    </section>
  );
}
