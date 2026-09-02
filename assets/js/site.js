(function () {
  "use strict";

  var doc = document;
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     Rolagem suave
     --------------------------------------------------------------- */
  var lenis = null;

  if (!calmo && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.05,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true
    });

    var quadro = function (t) {
      lenis.raf(t);
      requestAnimationFrame(quadro);
    };
    requestAnimationFrame(quadro);

    /* Âncoras precisam passar pelo Lenis, senão o pulo é seco. */
    doc.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var alvo = doc.querySelector(link.getAttribute("href"));
        if (!alvo) return;
        e.preventDefault();
        lenis.scrollTo(alvo, { offset: -90 });
      });
    });
  }

  var posicaoY = function () {
    return lenis ? lenis.scroll : window.scrollY;
  };

  /* ---------------------------------------------------------------
     Quebra o título em linhas visuais para cada uma subir da máscara.
     Precisa rodar com a fonte já carregada, senão mede a largura errada.
     --------------------------------------------------------------- */
  function partirEmLinhas(titulo) {
    if (titulo.dataset.partido) return;

    var pedacos = [];

    Array.prototype.forEach.call(titulo.childNodes, function (no) {
      if (no.nodeType === 3) {
        no.textContent.split(/\s+/).forEach(function (palavra) {
          if (palavra) pedacos.push({ texto: palavra, classe: "" });
        });
      } else if (no.nodeType === 1) {
        var classe = no.getAttribute("class") || "";
        no.textContent.split(/\s+/).forEach(function (palavra) {
          if (palavra) pedacos.push({ texto: palavra, classe: classe });
        });
      }
    });

    if (!pedacos.length) return;

    titulo.textContent = "";
    var palavras = pedacos.map(function (p) {
      var s = doc.createElement("span");
      s.textContent = p.texto;
      if (p.classe) s.setAttribute("class", p.classe);
      s.style.display = "inline-block";
      titulo.appendChild(s);
      titulo.appendChild(doc.createTextNode(" "));
      return s;
    });

    /* Agrupa por altura: palavras no mesmo topo estão na mesma linha. */
    var linhas = [];
    var topoAtual = null;

    palavras.forEach(function (s) {
      var topo = Math.round(s.offsetTop);
      if (topoAtual === null || Math.abs(topo - topoAtual) > 4) {
        linhas.push([]);
        topoAtual = topo;
      }
      linhas[linhas.length - 1].push(s);
    });

    titulo.textContent = "";

    linhas.forEach(function (grupo, i) {
      var fora = doc.createElement("span");
      fora.className = "linha";
      var dentro = doc.createElement("span");
      dentro.style.setProperty("--atraso", i * 0.09 + "s");

      grupo.forEach(function (s, j) {
        s.style.display = "";
        dentro.appendChild(s);
        if (j < grupo.length - 1) dentro.appendChild(doc.createTextNode(" "));
      });

      fora.appendChild(dentro);
      titulo.appendChild(fora);
    });

    titulo.dataset.partido = "1";
  }

  var titulos = Array.prototype.slice.call(doc.querySelectorAll("[data-quebra]"));

  function prepararTitulos() {
    titulos.forEach(partirEmLinhas);
    observarTudo();
  }

  /* ---------------------------------------------------------------
     Entrada por scroll
     --------------------------------------------------------------- */
  var olho = null;

  function observarTudo() {
    var alvos = doc.querySelectorAll(
      ".sobe:not(.dentro), .revela:not(.dentro), .retrato:not(.dentro), [data-quebra]:not(.dentro)"
    );

    if (calmo || !("IntersectionObserver" in window)) {
      alvos.forEach(function (el) {
        el.classList.add("dentro");
      });
      return;
    }

    if (!olho) {
      olho = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (e) {
            if (!e.isIntersecting) return;
            e.target.classList.add("dentro");
            olho.unobserve(e.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
      );
    }

    alvos.forEach(function (el) {
      olho.observe(el);
    });
  }

  if (doc.fonts && doc.fonts.ready) {
    doc.fonts.ready.then(prepararTitulos);
  } else {
    window.addEventListener("load", prepararTitulos);
  }
  observarTudo();

  /* Refaz a quebra quando a largura muda, senão as linhas ficam tortas. */
  var larguraAntes = window.innerWidth;
  var esperaResize;
  window.addEventListener("resize", function () {
    if (window.innerWidth === larguraAntes) return;
    larguraAntes = window.innerWidth;
    clearTimeout(esperaResize);
    esperaResize = setTimeout(function () {
      titulos.forEach(function (t) {
        if (!t.dataset.partido) return;
        var linhas = t.querySelectorAll(".linha > span > span");
        var textos = [];
        Array.prototype.forEach.call(linhas, function (s) {
          textos.push({ t: s.textContent, c: s.getAttribute("class") || "" });
        });
        t.textContent = "";
        textos.forEach(function (p, i) {
          var s = doc.createElement("span");
          s.textContent = p.t;
          if (p.c) s.setAttribute("class", p.c);
          t.appendChild(s);
          if (i < textos.length - 1) t.appendChild(doc.createTextNode(" "));
        });
        delete t.dataset.partido;
        partirEmLinhas(t);
        t.classList.add("dentro");
      });
    }, 220);
  });

  /* ---------------------------------------------------------------
     Cabeçalho e barra de progresso
     --------------------------------------------------------------- */
  var topo = doc.getElementById("topo");
  var barra = doc.getElementById("progresso");
  var pedido = false;

  function aoRolar() {
    var y = posicaoY();
    if (topo) topo.classList.toggle("fixo", y > 24);

    if (barra) {
      var total = doc.documentElement.scrollHeight - window.innerHeight;
      barra.style.transform = "scaleX(" + (total > 0 ? y / total : 0) + ")";
    }
  }

  function agendar() {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(function () {
      aoRolar();
      pedido = false;
    });
  }

  if (lenis) lenis.on("scroll", agendar);
  window.addEventListener("scroll", agendar, { passive: true });
  aoRolar();

  /* ---------------------------------------------------------------
     Menu no celular
     --------------------------------------------------------------- */
  var botaoMenu = doc.querySelector(".menu-btn");

  if (botaoMenu && topo) {
    botaoMenu.addEventListener("click", function () {
      var aberto = topo.classList.toggle("aberto");
      botaoMenu.setAttribute("aria-expanded", String(aberto));
      botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });

    topo.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        topo.classList.remove("aberto");
        botaoMenu.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------------
     Números que contam ao entrar na tela
     --------------------------------------------------------------- */
  var contadores = doc.querySelectorAll("[data-conta]");

  if (contadores.length) {
    var olhoNumero = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          olhoNumero.unobserve(e.target);
          contar(e.target);
        });
      },
      { threshold: 0.6 }
    );

    contadores.forEach(function (el) {
      olhoNumero.observe(el);
    });
  }

  function contar(el) {
    var fim = parseInt(el.dataset.conta, 10);
    var prefixo = el.dataset.prefixo || "";
    /* Ano não é quantidade: conta a partir de um piso, não do zero. */
    var inicio = el.hasAttribute("data-cru") ? fim - 14 : 0;

    if (calmo) {
      el.textContent = prefixo + fim;
      return;
    }

    var duracao = 1400;
    var t0 = null;

    function passo(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / duracao);
      var suave = 1 - Math.pow(1 - p, 3);
      el.textContent = prefixo + Math.round(inicio + (fim - inicio) * suave);
      if (p < 1) requestAnimationFrame(passo);
    }

    requestAnimationFrame(passo);
  }

  /* ---------------------------------------------------------------
     Brilho que acompanha o ponteiro nos cartões
     --------------------------------------------------------------- */
  if (!calmo && window.matchMedia("(hover: hover)").matches) {
    doc.querySelectorAll("[data-brilho]").forEach(function (cartao) {
      cartao.addEventListener("pointermove", function (e) {
        var r = cartao.getBoundingClientRect();
        cartao.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        cartao.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ---------------------------------------------------------------
     Marquise infinita
     --------------------------------------------------------------- */
  var trilho = doc.getElementById("marquise-trilho");

  if (trilho && !calmo) {
    Array.prototype.slice.call(trilho.children).forEach(function (item) {
      var copia = item.cloneNode(true);
      copia.setAttribute("aria-hidden", "true");
      trilho.appendChild(copia);
    });
    var largura = trilho.scrollWidth / 2;
    trilho.style.setProperty("--duracao", Math.round(largura / 60) + "s");
  }

  /* --- Ano do rodapé --------------------------------------------- */
  var ano = doc.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
