import { faq } from "../../../data/faq";
import styles from "./FAQ.module.css";

export function FAQ() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className={styles.container}>
        <div className={styles.intro}>
          <span className={styles.badge}>Perguntas frequentes</span>
          <h2 id="faq-title" className={styles.title}>
            Respostas claras para você tomar o próximo passo.
          </h2>
          <p className={styles.description}>
            Reunimos as dúvidas iniciais para facilitar a sua conversa com a Daytrade.
          </p>
        </div>

        <div className={styles.list}>
          {faq.map((item, index) => (
            <details key={item.question} className={styles.item} open={index === 0}>
              <summary className={styles.question}>
                <span>{item.question}</span>
                <span className={styles.icon} aria-hidden="true">
                  +
                </span>
              </summary>
              <p className={styles.answer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
