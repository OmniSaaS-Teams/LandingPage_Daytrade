"use client";

import { useEffect, useRef } from "react";
import { useInvestorForms, money } from "./useInvestorForms";
import styles from "./Investor.module.css";

export function InvestorContent() {
  const { result, values, resultRef, simulate, simulationBusy, simulationError, submitInterest, contactBusy, contactSuccess, contactError } = useInvestorForms();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add(styles.visible);
      });
    }, { threshold: 0.12 });
    contentRef.current?.querySelectorAll(`.${styles.reveal}`).forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page} ref={contentRef}><main>
<section className={styles["hero"]} id="topo">
    <div className={styles["container"] + " " + styles["hero-grid"]}>
      <div className={styles["reveal"]}>
        <span className={styles["eyebrow"]}>Seja nosso investidor</span>
        <h1>Invista em renda fixa com ativos reais como garantia.</h1>
        <p>
          Invista em debêntures estruturadas a partir de operações reais de antecipação de recebíveis, com garantias consistentes, gestão ativa de risco e previsibilidade de retorno.
        </p>

        <div className={styles["hero-actions"]}>
          <a href="#investimento" className={styles["btn"] + " " + styles["btn-primary"]}>Simular investimento</a>
          <a href="#politica" className={styles["btn"] + " " + styles["btn-outline"]}>Entender a política de investimento</a>
        </div>

        <div className={styles["hero-stats"]}>
          <div className={styles["stat"]}>
            <strong>100% Garantido</strong>
            <span>Todas as operações contam com recebíveis e garantias vinculadas que sustentam a estrutura do investimento.</span>
          </div>
          <div className={styles["stat"]}>
            <strong>Gestão e Controle Diário</strong>
            <span>Monitoramento constante da carteira, liquidez e performance das operações.</span>
          </div>
          <div className={styles["stat"]}>
            <strong>Proteção ao Investidor</strong>
            <span>Modelo financeiro desenhado para proteger o capital e alinhar interesses entre investidores e empresa.</span>
          </div>
        </div>
      </div>

      <div className={styles["hero-card"] + " " + styles["reveal"]} id="politica">
        <span className={styles["card-badge"]}>Call to Action</span>
        <h3>Estrutura pensada para quem busca segurança e clareza</h3>
        <p>
          Trabalhamos com operações qualificadas por equipe especializada, buscando reduzir exposição
          desnecessária e manter alinhamento entre interesses da empresa, acionistas e investidores.
        </p>

        <ul className={styles["hero-list"]}>
          <li>Compra de recebíveis e ativos financeiros.</li>
          <li>Operações lastreadas em duplicatas, cheques e recebíveis de vendas.</li>
          <li>Atuação sem foco em crédito aval ou empréstimos tradicionais.</li>
          <li>Seleção criteriosa das entidades participantes da operação.</li>
        </ul>

        <div className={styles["mini-cta"]}>
          <strong>Deseja receber mais detalhes?</strong>
          <span>Preencha o formulário ao final da página e solicite uma apresentação comercial.</span>
        </div>
      </div>
    </div>
  </section>

  
  <section className={styles["section"]} id="solucoes">
    <div className={styles["container"]}>
      <div className={styles["reveal"]}>
        <h2 className={styles["section-title"]}>Nossa estrutura de investimento</h2>
        <p className={styles["section-subtitle"]}>
          Uma metodologia construída para proteger capital, reduzir riscos e gerar retornos previsíveis.
        </p>
        <p>
          Cada operação segue critérios rigorosos de seleção, garantias e monitoramento, garantindo que os recursos dos investidores estejam sempre vinculados a ativos reais da economia.
        </p>
      </div>

      <div className={styles["services-grid"]}>
        <article className={styles["service-card"] + " " + styles["reveal"]}>
          <div className={styles["service-icon"]}>1</div>
          <h3>Política de investimento disciplinada</h3>
          <p>
            Capital direcionado para operações estruturadas de compra de recebíveis e ativos financeiros, priorizando previsibilidade de retorno e proteção do investidor.
          </p>
        </article>

        <article className={styles["service-card"] + " " + styles["reveal"]}>
          <div className={styles["service-icon"]}>2</div>
          <h3>Operações com garantias vinculadas</h3>
          <p>
            As operações seguem diretriz de estruturação com no mínimo 100% de lastro em recebíveis, como duplicatas, cheques e créditos originados de vendas reais.
          </p>
        </article>

        <article className={styles["service-card"] + " " + styles["reveal"]}>
          <div className={styles["service-icon"]}>3</div>
          <h3>Estratégia conservadora de risco</h3>
          <p>
            A lógica é simples: preservar capital vem antes de buscar retorno. Por isso, a estrutura prioriza segurança, liquidez e controle rigoroso das operações.
          </p>
        </article>

        <article className={styles["service-card"] + " " + styles["reveal"]}>
          <div className={styles["service-icon"]}>4</div>
          <h3>Foco em recebíveis performados</h3>
          <p>
            A atuação não está baseada em empréstimos tradicionais, mas em operações estruturadas sobre créditos existentes, reduzindo incertezas do fluxo financeiro.
          </p>
        </article>

        <article className={styles["service-card"] + " " + styles["reveal"]}>
          <div className={styles["service-icon"]}>5</div>
          <h3>Gestão ativa de risco</h3>
          <p>
            Carteira distribuída entre diferentes setores da economia, com monitoramento diário da liquidez e da performance dos ativos.
          </p>
        </article>

        <article className={styles["service-card"] + " " + styles["reveal"]}>
          <div className={styles["service-icon"]}>6</div>
          <h3>6. Qualificação rigorosa das partes</h3>
          <p>
            Empresas cedentes e sacados passam por análise criteriosa, garantindo maior previsibilidade e transparência nas operações.
          </p>
        </article>
      </div>
    </div>
    <div className={styles["form-field"]}>
      <a href="https://wa.me/5515981166112?text=Olá%2C%20gostaria%20de%20saber%20mais%20sobre%20investimento" className={styles["btn-call-action"]}>Conheça a estrutura completa do investimento</a>
    </div>
  </section>

  
  <section className={styles["section"]} id="garantias">
    <div className={styles["container"] + " " + styles["proof-grid"]}>
      <div className={styles["reveal"]}>
        <h2 className={styles["section-title"]}>Por que investidores escolhem nossa estrutura?</h2>
        <p className={styles["section-subtitle"]}>
          Uma estrutura construída para priorizar segurança, previsibilidade e controle de risco.
        </p>

        <div className={styles["proof-list"]}>
          <div className={styles["proof-item"]}>
            <div className={styles["proof-number"]}>01</div>
            <div>
              <strong>Operações lastreadas em ativos reais</strong>
              <p>Empresas cedentes passam por análise prévia de crédito e capacidade operacional antes de integrar a estrutura.</p>
            </div>
          </div>

          <div className={styles["proof-item"]}>
            <div className={styles["proof-number"]}>02</div>
            <div>
              <strong>Garantias vinculadas às operações</strong>
              <p>Os investimentos são vinculados a créditos originados de vendas reais, como duplicatas e outros recebíveis.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles["portfolio-box"] + " " + styles["reveal"]}>
        <div className={styles["proof-item"]}>
          <div className={styles["proof-number"]}>03</div>
          <div>
            <strong>Carteira diversificada</strong>
            <p>A carteira é distribuída entre diferentes empresas e setores para reduzir concentração de risco.</p>
          </div>
        </div>

        <div className={styles["proof-item"]}>
          <div className={styles["proof-number"]}>04</div>
          <div>
            <strong>Monitoramento contínuo da liquidez</strong>
            <p>Acompanhamento diário da liquidez e da performance dos ativos vinculados às operações.</p>
          </div>
        </div>

        <div className={styles["proof-item"]}>
          <div className={styles["proof-number"]}>05</div>
          <div>
            <strong>Estrutura com alinhamento de interesses</strong>
            <p>A estrutura busca alinhar interesses entre empresa e investidores, fortalecendo a segurança da operação.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  
  <section className={styles["section"]}>
    <div className={styles["container"]}>
      <div className={styles["reveal"]}>
        <h2 className={styles["section-title"]}>O que investidores destacam em nossa estrutura</h2>
        <p className={styles["section-subtitle"]}>
          A estrutura das operações, baseada em ativos reais, garantias vinculadas e monitoramento constante, gera confiança e previsibilidade para quem investe.
        </p>
      </div>

      <div className={styles["testimonials"]}>
        <article className={styles["testimonial"] + " " + styles["reveal"]}>
          <div className={styles["stars"]}>★★★★★</div>
          <p>
            “Gostei da clareza da estrutura. A presença de garantias vinculadas às operações e o acompanhamento constante da carteira passam segurança para quem busca renda fixa com gestão profissional.”
          </p>
          <strong>Investidor Pessoa Física</strong>
          <span>Perfil Conservador</span>
        </article>

        <article className={styles["testimonial"] + " " + styles["reveal"]}>
          <div className={styles["stars"]}>★★★★★</div>
          <p>
            “A diversificação da carteira e o monitoramento da liquidez mostram uma gestão mais criteriosa do risco. Isso faz diferença para quem analisa estruturas de investimento.”
          </p>
          <strong>Empresário e investidor</strong>
          <span>Perfil Moderado</span>
        </article>

        <article className={styles["testimonial"] + " " + styles["reveal"]}>
          <div className={styles["stars"]}>★★★★★</div>
          <p>
            “O alinhamento entre empresa e investidores e o foco em ativos reais trazem uma percepção de estrutura mais madura e organizada.”
          </p>
          <strong>Investidor privado</strong>
          <span>Perfil Patrimonial</span>
        </article>
      </div>
    </div>
  </section>

  
  <section id="investimento">
    
    <div className={styles["investimento-form-section"]} id="formSection" hidden={Boolean(result)}>
      <div className={styles["investimento-overlay"]}></div>

      <div className={styles["investimento-container"]}>
        <div className={styles["investimento-left"]}>
          <h2>Veja na prática quanto seu <span>capital pode render</span></h2>
          <p className={styles["investimento-descricao"]}>
            Preencha os dados e veja uma projeção de rentabilidade baseada na estrutura de investimento apresentada.
          </p>
          
          <form id="simuladorInvestimentoForm" className={styles["investimento-form"]} onSubmit={simulate} aria-busy={simulationBusy}><fieldset className={styles["form-fields"]} disabled={simulationBusy}>
            <div className={styles["form-grid"]}>
              <div className={styles["form-field"]}>
                <label htmlFor="valorInvestir">Valor pretendido (R$) *</label>
                <input type="text" id="valorInvestir" name="valorInvestir" 
                      pattern="^\d{1,3}(?:\.\d{3})*(?:,\d{2})?$"
                      placeholder="50.000,00" 
                      defaultValue="50.000,00" 
                      required />
                <small className={styles["field-helper"]}>Valor mínimo: R$ 50.000,00</small>
              </div>
    
              <div className={styles["form-field"]}>
                <label htmlFor="periodoInvestir">Período do investimento *</label>
                <select id="periodoInvestir" name="periodoInvestir" required>
                  <option value="1">1 ano</option>
                  <option value="3">3 anos</option>
                  <option value="5">5 anos</option>
                </select>
              </div>

              <div className={styles["form-field"]}>
                <label htmlFor="nomeCompleto">Nome completo *</label>
                <input type="text" id="nomeCompleto" name="nomeCompleto" placeholder="Digite seu nome completo" required />
              </div>

              <div className={styles["form-field"]}>
                <label htmlFor="emailInvestidor">E-mail *</label>
                <input type="email" id="emailInvestidor" name="emailInvestidor" placeholder="seu@email.com" required />
              </div>

              <div className={styles["form-field"]}>
                <label htmlFor="telefoneInvestidor">Telefone *</label>
                <input type="tel" id="telefoneInvestidor" name="telefoneInvestidor" placeholder="(00) 00000-0000" required />
              </div>

              
              <input type="hidden" id="origemSimulador" name="origem" value="simulador_investimento" />

              <div className={styles["form-field"] + " " + styles["form-field-submit"]}>
                <button type="submit" className={styles["btn-investimento-form"]}>Simular meu investimento</button>
              </div>
            </div>

            <div className={styles["form-message"]} id="formSimulacaoMessage" role={simulationError ? "alert" : "status"}>{simulationError || (simulationBusy ? "Enviando..." : "")}</div>
          </fieldset></form>

          <div className={styles["investimento-seguranca"]}>
            <span>🔒</span>
            <p>Seus dados estão seguros e não serão compartilhados.</p>
          </div>
        </div>

        <div className={styles["investimento-right"]}>
          <h3>Por que simular com a gente?</h3>

          <div className={styles["beneficios-lista"]}>
            <div className={styles["beneficio-item"]}>
              <div className={styles["beneficio-icon"]}>📊</div>
              <div className={styles["beneficio-texto"]}>
                <strong>Projeção realista</strong>
                <p>Baseada em critérios de investimento, histórico de operações e política de gestão da carteira.</p>
              </div>
            </div>

            <div className={styles["beneficio-item"]}>
              <div className={styles["beneficio-icon"]}>🛡️</div>
              <div className={styles["beneficio-texto"]}>
                <strong>Sem compromisso</strong>
                <p>Simulação gratuita e sem qualquer obrigação de investimento.</p>
              </div>
            </div>

            <div className={styles["beneficio-item"]}>
              <div className={styles["beneficio-icon"]}>⚡</div>
              <div className={styles["beneficio-texto"]}>
                <strong>Resultado imediato</strong>
                <p>Veja na hora uma estimativa de rendimento para o valor informado.</p>
              </div>
            </div>

            <div className={styles["beneficio-item"]}>
              <div className={styles["beneficio-icon"]}>📈</div>
              <div className={styles["beneficio-texto"]}>
                <strong>Estrutura comparável ao mercado</strong>
                <p>Modelo de investimento estruturado com base em práticas utilizadas em operações de crédito privado.</p>
              </div>
            </div>
          </div>

          <div className={styles["investimento-observacao"]}>
            <p>
              (*) A simulação considera a política de investimento apresentada nesta página. 
              Valores são projetados com base em taxas históricas e não garantem rentabilidade futura.
            </p>
            <br />
            <p>
              (*) Todo e qualquer tipo de investimento possui algum tipo de risco. O perfil do investidor será submetido à análise e à prévia aprovação.
            </p>
          </div>
        </div>
      </div>
    </div>

    
    <div className={styles["investimento-comparativo"]} id="resultSection" hidden={!result} ref={resultRef} tabIndex={-1}>
      <div className={styles["investimento-overlay"]}></div>

      <div className={styles["investimento-container"]}>
        <div className={styles["investimento-left"]}>
          <h2>Olá, <span id="investidorNome">{result ? result.name.split(/\s+/)[0].toUpperCase() : "INVESTIDOR"}</span></h2>
          <p id="investidorTexto">De acordo com a nossa simulação, investindo <strong>{result ? money(result.amount) : "R$ 10.000,00"}</strong> em {result?.years ?? 1} {result?.years === 1 || !result ? "ano" : "anos"} você poderá ter</p>

          <div className={styles["investimento-valor"]} id="investidorValor">{result ? money(values.carteira) : "R$ 11.788,00"}</div>

          <a href="#contato" className={styles["btn-investimento"]}>Abra sua conta</a>
        </div>

        <div className={styles["investimento-right"]}>
          <h3>Veja o quanto investir com a gente é vantajoso</h3>

          <div className={styles["grafico-barras"]}>
            <div className={styles["barra-item"]}>
              <span className={styles["barra-valor"]} id="valorPoupanca">{result ? money(values.poupanca) : "R$ 10.817,33"}</span>
              <div className={styles["barra"] + " " + styles["barra-1"]} id="barraPoupanca" style={{ height: `${values.carteira ? Math.round(values.poupanca / values.carteira * 285) : 0}px` }}></div>
              <div className={styles["barra-label"]}>
                <strong>Poupança</strong>
                <span>(69% do CDI)</span>
              </div>
            </div>

            <div className={styles["barra-item"]}>
              <span className={styles["barra-valor"]} id="valorCDB">{result ? money(values.cdb) : "R$ 11.490,00"}</span>
              <div className={styles["barra"] + " " + styles["barra-2"]} id="barraCDB" style={{ height: `${values.carteira ? Math.round(values.cdb / values.carteira * 285) : 0}px` }}></div>
              <div className={styles["barra-label"]}>
                <strong>CDBs 100%</strong>
                <span>(100% do CDI)</span>
              </div>
            </div>

            <div className={styles["barra-item"] + " " + styles["destaque"]}>
              <span className={styles["barra-valor"]} id="valorCarteira">{result ? money(values.carteira) : "R$ 11.788,00"}</span>
              <div className={styles["barra"] + " " + styles["barra-3"]} id="barraCarteira" style={{ height: `${values.carteira ? 285 : 0}px` }}></div>
              <div className={styles["barra-label"]}>
                <strong>Carteira Daytrade</strong>
                <span>(120% do CDI)</span>
              </div>
            </div>
          </div>

          <p className={styles["investimento-observacao"]} id="observacaoData">
            (*) Projeção ilustrativa calculada em {result?.date ?? "—"} para o prazo de {result?.years ?? 1} {result?.years === 1 || !result ? "ano" : "anos"}, com CDI hipotético de 11,25% a.a.
            Valores brutos, sem considerar descontos de Imposto de Renda.
            Verifique as condições de cada produto antes de investir.
          </p>
        </div>
      </div>
    </div>
  </section>

  
  <section className={styles["section"]} id="faq">
    <div className={styles["container"]}>
      <div className={styles["reveal"]}>
        <h2 className={styles["section-title"]}>Perguntas Frequentes</h2>
        <p className={styles["section-subtitle"]}>
          Tire suas dúvidas sobre investimentos em recebíveis e como funcionam as operações estruturadas.
        </p>
      </div>

      <div className={styles["faq-list"]}>
        <details className={styles["faq-item"]} open><summary className={styles["faq-head"]}><h3 className={styles["faq-question"]}>O que é investimento em recebíveis?</h3><span className={styles["faq-toggle"]} aria-hidden="true">+</span></summary><div className={styles["faq-answer"]}>
            Investimento em recebíveis consiste na alocação de recursos em créditos originados de vendas ou serviços realizados por empresas. Esses créditos podem incluir duplicatas, cheques ou outros recebíveis comerciais, que servem como base para operações estruturadas de investimento.
          </div></details>

        <details className={styles["faq-item"]}><summary className={styles["faq-head"]}><h3 className={styles["faq-question"]}>Como funciona a securitização de recebíveis?</h3><span className={styles["faq-toggle"]} aria-hidden="true">+</span></summary><div className={styles["faq-answer"]}>
            Na securitização, recebíveis empresariais são utilizados como lastro para estruturar operações financeiras. Esses ativos são organizados em estruturas de investimento que permitem a participação de investidores interessados em renda fixa vinculada a créditos da economia real.
          </div></details>

        <details className={styles["faq-item"]}><summary className={styles["faq-head"]}><h3 className={styles["faq-question"]}>O investimento em debêntures lastreadas em recebíveis é seguro?</h3><span className={styles["faq-toggle"]} aria-hidden="true">+</span></summary><div className={styles["faq-answer"]}>
            A segurança da operação depende da qualidade dos ativos, das garantias vinculadas e da gestão de risco da estrutura. Em operações estruturadas, é comum haver monitoramento da carteira, diversificação de ativos e análise prévia das empresas envolvidas.
          </div></details>

        <details className={styles["faq-item"]}><summary className={styles["faq-head"]}><h3 className={styles["faq-question"]}>Como os recursos dos investidores são utilizados?</h3><span className={styles["faq-toggle"]} aria-hidden="true">+</span></summary><div className={styles["faq-answer"]}>
            Os recursos captados são direcionados para operações de compra de recebíveis empresariais e ativos financeiros vinculados a transações comerciais reais, buscando gerar retorno com base nesses fluxos financeiros.
          </div></details>

        <details className={styles["faq-item"]}><summary className={styles["faq-head"]}><h3 className={styles["faq-question"]}>A operação envolve empréstimos tradicionais?</h3><span className={styles["faq-toggle"]} aria-hidden="true">+</span></summary><div className={styles["faq-answer"]}>
            Não. O modelo apresentado não se baseia em empréstimos pessoais ou crédito direto, mas em operações estruturadas sobre recebíveis originados de vendas e serviços realizados por empresas.
          </div></details>

        <details className={styles["faq-item"]}><summary className={styles["faq-head"]}><h3 className={styles["faq-question"]}>Como o risco é gerenciado nesse tipo de investimento?</h3><span className={styles["faq-toggle"]} aria-hidden="true">+</span></summary><div className={styles["faq-answer"]}>
            O risco é mitigado por meio de análise das empresas envolvidas, diversificação da carteira entre diferentes setores da economia, garantias vinculadas às operações e monitoramento contínuo da liquidez dos ativos.
          </div></details>

        <details className={styles["faq-item"]}><summary className={styles["faq-head"]}><h3 className={styles["faq-question"]}>Existe valor mínimo para investir?</h3><span className={styles["faq-toggle"]} aria-hidden="true">+</span></summary><div className={styles["faq-answer"]}>
            O valor mínimo pode variar de acordo com a estrutura da operação e as condições da emissão, iniciando em R$50.000,00 (cinquenta mil reais). A simulação disponível na página permite avaliar valores e prazos de investimento.
          </div></details>

        <details className={styles["faq-item"]}><summary className={styles["faq-head"]}><h3 className={styles["faq-question"]}>Como iniciar um investimento nesse tipo de estrutura?</h3><span className={styles["faq-toggle"]} aria-hidden="true">+</span></summary><div className={styles["faq-answer"]}>
            O primeiro passo é realizar uma simulação de investimento informando valor e prazo desejados. A partir disso, é possível avaliar as condições da estrutura e receber mais informações sobre as oportunidades disponíveis.
          </div></details>
      </div>
    </div>
  </section>

  
  <section className={styles["section"]} id="contato">
    <div className={styles["container"]}>
      <div className={styles["cta-box"] + " " + styles["reveal"]}>
        <h2>Receba uma apresentação da estrutura de investimento</h2>
        <p>
          Preencha os campos abaixo para registrar seu interesse. Nossa equipe entrará
          em contato para apresentar a estrutura de investimento.
        </p>

        <form className={styles["cta-form"]} id="investForm" onSubmit={submitInterest} aria-busy={contactBusy}><fieldset className={styles["form-fields"]} disabled={contactBusy || contactSuccess}>
          <div>
            
            <input type="hidden" id="origemApresentacao" name="origem" value="solicitar_apresentacao" />
            
            <div className={styles["field"]}>
              <label htmlFor="nome">Nome</label>
              <input type="text" id="nome" name="nome" placeholder="Seu nome" required />
            </div>

            <div className={styles["field"]}>
              <label htmlFor="email">E-mail</label>
              <input type="email" id="email" name="email" placeholder="voce@empresa.com" required />
            </div>

            <div className={styles["field"]}>
              <label htmlFor="perfil">Perfil</label>
              <select defaultValue="" id="perfil" name="perfil" required>
                <option value="">Selecione</option>
                <option>Investidor pessoa física</option>
                <option>Investidor pessoa jurídica</option>
                <option>Parceiro comercial</option>
                <option>Outro</option>
              </select>
            </div>
          </div>
          <div className={styles["field"]}>
            <label>Enviar</label>
            <button className={styles["btn"] + " " + styles["btn-primary"]} type="submit">Enviar interesse</button>
          </div>
        </fieldset></form>

        <div className={styles["form-message"]} id="formMessage" role={contactError ? "alert" : "status"}>{contactError || (contactSuccess ? "Recebemos suas informações! Em breve entraremos em contato." : contactBusy ? "Enviando..." : "")}</div>
      </div>
    </div>
  </section>

  
  </main>
    </div>
  );
}
