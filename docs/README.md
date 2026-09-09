# Documentação do projeto — Library's Potter

Os três documentos pedidos no trabalho, na ordem em que fazem sentido ser lidos.

**Autores:** Arthur Roberto Weege Pontes · Guilherme Silveira · Lucas Alves

Cada documento tem uma versão em **PDF**, que é a que deve ser entregue, e a versão em `.md`, que é
a editável e mostra os diagramas desenhados aqui no GitHub. O
[guia de entrega](GUIA-DE-ENTREGA.md) diz qual arquivo vai em qual tarefa.

| # | Documento | O que traz |
|---|---|---|
| 1 | [**Documentação**](01-documentacao.md) · [PDF](01-documentacao.pdf) | Visão geral, público-alvo, escopo, 20 requisitos funcionais e 10 não funcionais, modelagem de dados e os três diagramas: casos de uso, entidade-relacionamento e sequência de uma compra |
| 2 | [**Arquitetura do software**](02-arquitetura.md) · [PDF](02-arquitetura.pdf) | As três camadas, os componentes essenciais, o mapa dos 44 endpoints, as medidas de segurança e as decisões de projeto |
| 3 | [**Plano de testes**](03-plano-de-testes.md) · [PDF](03-plano-de-testes.pdf) | Estratégia, ambiente, 89 casos de teste com resultado, os defeitos encontrados e o que falta implementar |

**Planilha de resultados:** [`resultados-dos-testes.xlsx`](resultados-dos-testes.xlsx) (quatro
abas: casos de teste, resumo, defeitos e testes automatizados) ou
[`resultados-dos-testes.csv`](resultados-dos-testes.csv), com o mesmo conteúdo em texto.

**Capturas de tela:** [`img/`](img/) — as mesmas três páginas em 1440 px (`desktop-*.png`) e em
390 px (`celular-*.png`), tiradas do build de produção.

---

## Resumo dos resultados

| | |
|---|---|
| Casos de teste executados | 89 |
| Passou | 81 |
| Parcial | 2 |
| Não aplicável ao ambiente local | 1 |
| Não implementado (fora do escopo) | 4 |
| Observação | 1 |
| Testes automatizados | 96, todos passando |
| Defeitos em aberto | 1 médio, 1 baixo. Nenhum crítico ou grave |

O fluxo de compra funciona do cadastro ao cancelamento do pedido, com o estoque correto em todos
os pontos medidos. O pior tempo de carregamento foi 476 ms, contra o limite de 3 segundos.

Os quatro itens marcados como não implementados são o gateway de pagamento, o webhook dele, o
cálculo de frete por CEP e o envio de e-mail. São escolhas de escopo de um trabalho acadêmico, e a
seção 7 do plano de testes descreve o que seria preciso para fechar cada um.

## Como reproduzir os testes

```bash
cd backend  && npm test    # 54 testes de API
cd frontend && npm test    # 42 testes de interface
```

O backend precisa do banco `librarys_potter_test` criado; o resto (migrations e seed) o próprio
`global-setup` faz. As instruções completas de instalação estão na seção 5 da
[documentação](01-documentacao.md).
