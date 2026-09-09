# Guia de entrega

Qual arquivo enviar em qual tarefa. Todos estão nesta pasta `docs/`.

| | |
|---|---|
| **Projeto** | Library's Potter — e-commerce |
| **Autores** | Arthur Roberto Weege Pontes · Guilherme Silveira · Lucas Alves |
| **Repositório** | `https://github.com/useazyx/librarys-potter` |

---

## Tarefa 1 — Documentação

**Enviar:** `01-documentacao.pdf`

Cobre tudo o que a tarefa pede, na mesma ordem do enunciado:

| O que foi pedido | Onde está no PDF |
|---|---|
| Visão geral do sistema (objetivo, público-alvo, escopo) | Seção 1 |
| Requisitos funcionais | Seção 2.1 — 20 requisitos, cada um ligado ao endpoint e ao caso de teste |
| Requisitos não funcionais | Seção 2.2 — 10 requisitos, com o resultado da verificação |
| Arquitetura do sistema (front, back, banco, integrações) | Seção 3 (resumo) e o PDF da tarefa 2 (completo) |
| Modelagem de dados | Seção 4.1 — usuário, produto, pedido e item do pedido |
| Diagrama de casos de uso | Seção 4.3 |
| Diagrama entidade-relacionamento (DER) | Seção 4.2 |
| Diagrama de sequência | Seção 4.4 — uma compra do clique ao pedido pago |

---

## Tarefa 2 — Arquitetura de software

**Enviar:** `02-arquitetura.pdf` **e o link do repositório**

O enunciado pede o link do GitHub com a solução: `https://github.com/useazyx/librarys-potter`

| O que foi pedido | Onde está |
|---|---|
| Camadas (front-end, back-end, banco) | Seção 1, com diagrama |
| Componentes essenciais | Seção 2 — inclusive o porquê de não haver gateway de API separado |
| Gateway de API, serviço de produtos, de clientes, de pedidos e pagamento | Seção 2 |
| Endpoints da API REST (o bônus do enunciado) | Seção 4, com os 44 endpoints e os parâmetros de filtro |
| Endpoints que o enunciado cita e que não existem no projeto | Seção 4.8, com o motivo |
| Segurança na arquitetura | Seção 5 |
| Decisões de projeto | Seção 6 |

---

## Tarefa 3 — Testes

**Enviar:** `03-plano-de-testes.pdf` **e** `resultados-dos-testes.xlsx`

O enunciado pede duas coisas: o plano de testes e uma planilha de resultados. São esses dois
arquivos.

| O que foi pedido | Onde está |
|---|---|
| Plano de testes (objetivo, escopo, ambiente, estratégia) | Seções 1 a 4 do PDF |
| Testes funcionais: cadastro e login, busca e filtros, carrinho, checkout | Seções 5.1 a 5.4 |
| Testes de integração: frete, gateway de pagamento, e-mails | Seção 5.6 |
| Testes de segurança: SSL e dados sensíveis | Seção 5.7 |
| Testes de usabilidade e desempenho: responsividade e velocidade | Seção 5.8 |
| Planilha de resultados | `resultados-dos-testes.xlsx`, com quatro abas: casos de teste, resumo, defeitos e testes automatizados |

Se o envio não aceitar `.xlsx`, mande o `resultados-dos-testes.csv`, que tem o mesmo conteúdo.

---

## Resumo rápido

| Tarefa | Arquivos |
|---|---|
| Documentação | `01-documentacao.pdf` |
| Arquitetura de software | `02-arquitetura.pdf` + link do repositório |
| Testes | `03-plano-de-testes.pdf` + `resultados-dos-testes.xlsx` |

Os arquivos `.md` são as versões editáveis dos mesmos documentos e ficam no repositório para quem
quiser ler direto no GitHub, onde os diagramas aparecem desenhados. Para entregar, use os PDFs.

## Duas coisas que valem avisar antes de enviar

**O plano de testes registra um defeito em aberto.** O DEF-01 é um estouro horizontal do catálogo
em tela de celular, com a correção já descrita. Isso é proposital: um plano de testes que encontra
defeito mostra que os testes rodaram de verdade. Se preferir entregar com ele corrigido, é uma
mudança de duas classes de CSS.

**Três itens do enunciado não têm contrapartida no sistema:** cálculo de frete por CEP, gateway de
pagamento com webhook e envio de e-mail transacional. Os três estão registrados como não
implementados, com o motivo e o caminho de implementação na seção 7 do plano de testes.
