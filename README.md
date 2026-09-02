# Digital TK

Site institucional e landing page da Digital TK, agência de publicidade e
marketing em Uberlândia (MG).

HTML, CSS e JavaScript puros. O único passo de build é o `build.py`, que junta
os CSS.

## Rodar

```bash
npx serve -l 8871 .
```

- `/` — site institucional
- `/landingpage/` — a história da agência, montada sobre o briefing

## Mexer no CSS

Edite os arquivos em `assets/css/origem/` e rode:

```bash
python3 build.py
```

Isso gera `assets/css/site.css` e `assets/css/lp.css`. **Editar os gerados
direto não adianta**, o próximo build sobrescreve.

## Decisões que não são óbvias no código

- **O `@import` foi eliminado a martelo.** Ele encadeava os downloads
  (HTML → site.css → base.css → fontes.css) e cada elo só começava quando o
  anterior terminava: 6,9 s de first paint. Com os arquivos juntos, 1,6 s.
  É por isso que existe o `build.py`.
- **`clip-path` nunca vai no elemento observado.** O reveal por máscara aplica
  o clip na `img`, não na `figure`. Clip-path no próprio alvo zera a área de
  interseção e o IntersectionObserver não dispara nunca, então a imagem
  ficaria escondida para sempre.
- **`max-width` não pode ficar num elemento com a classe `.env`.** O `.env`
  tem `margin-inline: auto`; um `max-width` menor no mesmo elemento faz o
  bloco centralizar em vez de encostar na margem esquerda. O limite vai nos
  filhos.
- **O amarelo #ffcc00 só é texto sobre o preto.** Ali ele dá 13:1; sobre
  branco dá 1,5:1 e reprova. Em fundo claro ele aparece só como superfície.
- **As cores dos cards são de apoio, não da marca.** Amarelo (o da marca),
  roxo, coral e turquesa aparecem só nos cards de serviço e nos blocos de
  segmento. O resto do site fica em preto e branco para a identidade não se
  diluir. Cada par cor/texto foi checado em contraste.
- **A logo do cabeçalho é uma máscara CSS**, não uma imagem colorida. O lockup
  original é preto sobre transparente; como máscara ele vira a forma e toma a
  cor da marca, em vez de sumir no fundo escuro.
- **Os cartões de serviço empilham por `position: sticky`**, não por JS. Cada
  um gruda no topo com um recuo que cresce pelo índice (`--i`), então o
  seguinte sobe por cima deixando à mostra só a faixa colorida do anterior.
- **O título quebra em linhas no JS**, depois que a fonte carrega, para cada
  linha subir de dentro da própria máscara. Medir antes da fonte assentar
  agrupa as palavras errado.

## Pendências

- **Fotos de bastidores.** O briefing pede gravações, reuniões e atendimentos.
  O material tinha três fotos do escritório vazio, que é o que está no ar. O
  bloco marcado na landing page espera essas imagens.
- **Vídeo ou foto da Thatiana com a equipe** para o hero, como o briefing
  sugere. Hoje o hero usa a foto do escritório.
- **Destino do formulário.** A validação e a máscara de telefone funcionam,
  mas não há para onde enviar: o `data-destino` do `<form>` está como
  `[A PREENCHER]` e, enquanto estiver assim, a página diz isso ao visitante em
  vez de fingir que enviou.
- **Licença da Cocogoose.** Os títulos usam Cocogoose Pro, a fonte da marca,
  convertida dos TTF que estavam em `~/Downloads/digital tk/cocogoose/`. Os
  arquivos são a versão **trial**, sob licença CC BY-NC, que cobre uso não
  comercial. O site de uma agência é uso comercial, então a licença precisa
  ser comprada na Zetafonts antes de ir ao ar em definitivo. O corpo do texto
  segue em Archivo.

## Notas sobre o material recebido

- No repo anterior, `office4.webp`, `office5.webp` e `office6.webp` não eram
  fotos do escritório: eram as logos da UniCesumar, da Ânime e da Glicnutri
  salvas com nome errado. Não foram trazidas.
- `xingo.webp` vinha com a logo repetida três vezes na mesma imagem. Foi
  recortada para uma.
