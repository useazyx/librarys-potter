# Rascunhos

Páginas que saíram do site mas continuam guardadas aqui. Esta pasta fica fora de
`src`, então o `tsc -b` e o `vite build` não a enxergam.

## WandWorkshop.tsx

A oficina de varinhas, que ficava em `/oficina-de-varinhas`. A ideia ainda
precisa de uma volta: o configurador monta uma varinha em CSS, guarda no
localStorage e sugere a réplica do catálogo mais parecida, mas a escolha não
tem consequência nenhuma no resto da loja.

Para colocar de volta, mova o arquivo para `src/pages/`, recrie a rota no
`App.tsx` e os links no `Header.tsx`, no `Footer.tsx` e nas portas da home.
