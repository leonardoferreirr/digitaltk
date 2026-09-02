#!/usr/bin/env python3
"""
Junta os CSS de origem num arquivo por página.

O @import encadeia os downloads (HTML -> site.css -> base.css -> fontes.css)
e cada elo só começa quando o anterior termina, o que custava mais de 4s no
first paint. Aqui os arquivos viram um só, então o navegador baixa um CSS.

Edite os arquivos em assets/css/origem/ e rode: python3 build.py
"""
import re
from pathlib import Path

RAIZ = Path(__file__).parent
ORIGEM = RAIZ / "assets/css/origem"
DESTINO = RAIZ / "assets/css"

PAGINAS = {
    "site.css": ["fontes.css", "base.css", "site.css"],
    "lp.css": ["fontes.css", "base.css", "lp.css"],
}


def enxuga(css: str) -> str:
    """Tira comentários e espaço sobrando, preservando o que muda o valor."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s*\n\s*", "\n", css)
    css = re.sub(r"\n{2,}", "\n", css)
    css = re.sub(r"\s*([{}:;,>])\s*", r"\1", css)
    css = re.sub(r";}", "}", css)
    return css.strip()


def montar(saida: str, partes: list[str]) -> None:
    pedacos = []
    for nome in partes:
        texto = (ORIGEM / nome).read_text()
        # os @import já estão resolvidos pela ordem da lista
        texto = re.sub(r'@import\s+url\([^)]+\);\s*', "", texto)
        pedacos.append(texto)

    bruto = "\n".join(pedacos)
    final = enxuga(bruto)
    (DESTINO / saida).write_text(final + "\n")
    print(f"{saida}: {len(bruto) // 1024} KB -> {len(final) // 1024} KB")


if __name__ == "__main__":
    if not ORIGEM.exists():
        raise SystemExit(f"faltou a pasta {ORIGEM}")
    for saida, partes in PAGINAS.items():
        montar(saida, partes)
