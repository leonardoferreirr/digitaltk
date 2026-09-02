(function () {
  "use strict";

  var doc = document;

  /* ---------------------------------------------------------------
     Traço da linha do tempo: cresce conforme a história passa.
     --------------------------------------------------------------- */
  var trilha = doc.querySelector(".linha-tempo");
  var marca = doc.getElementById("marca-tempo");

  if (trilha && marca) {
    var pedido = false;

    var medir = function () {
      var r = trilha.getBoundingClientRect();
      var alturaVisivel = window.innerHeight * 0.5;
      /* 0 quando o topo da trilha chega ao meio da tela,
         1 quando o fim dela passa por lá. */
      var andado = (alturaVisivel - r.top) / r.height;
      marca.style.transform =
        "scaleY(" + Math.max(0, Math.min(1, andado)).toFixed(4) + ")";
      pedido = false;
    };

    var agendar = function () {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(medir);
    };

    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    medir();
  }

  /* ---------------------------------------------------------------
     Formulário
     --------------------------------------------------------------- */
  var form = doc.getElementById("form");
  if (!form) return;

  var recado = doc.getElementById("recado");
  var tentou = false;

  function caixaDo(campo) {
    return campo.closest(".campo");
  }

  function valido(campo) {
    var v = campo.value.trim();
    if (!campo.hasAttribute("required")) return true;
    if (!v) return false;
    /* Telefone brasileiro com DDD tem 10 ou 11 dígitos. */
    if (campo.type === "tel") return v.replace(/\D/g, "").length >= 10;
    if (campo.tagName === "TEXTAREA") return v.length >= 8;
    return true;
  }

  function conferir(campo) {
    var caixa = caixaDo(campo);
    if (!caixa) return true;
    var ok = valido(campo);
    caixa.classList.toggle("invalido", !ok);
    campo.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }

  var campos = Array.prototype.slice.call(
    form.querySelectorAll("input, select, textarea")
  );

  campos.forEach(function (campo) {
    /* Só reclama depois da primeira tentativa, senão o formulário
       nasce todo vermelho enquanto a pessoa ainda está digitando. */
    campo.addEventListener("blur", function () {
      if (tentou) conferir(campo);
    });
    campo.addEventListener("input", function () {
      if (tentou && caixaDo(campo).classList.contains("invalido")) {
        conferir(campo);
      }
    });
  });

  /* Máscara leve de telefone, sem travar a digitação. */
  var tel = doc.getElementById("telefone");
  if (tel) {
    tel.addEventListener("input", function () {
      var d = tel.value.replace(/\D/g, "").slice(0, 11);
      if (!d) {
        tel.value = "";
        return;
      }
      var saida = "(" + d.slice(0, 2);
      if (d.length > 2) saida += ") " + d.slice(2, d.length > 10 ? 7 : 6);
      if (d.length > 6) saida += "-" + d.slice(d.length > 10 ? 7 : 6);
      tel.value = saida;
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    tentou = true;

    var falhas = campos.filter(function (c) {
      return !conferir(c);
    });

    if (falhas.length) {
      falhas[0].focus();
      if (recado) {
        recado.textContent =
          "Faltou preencher " +
          (falhas.length === 1 ? "um campo." : falhas.length + " campos.");
        recado.classList.add("aparece");
      }
      return;
    }

    /* O destino ainda não existe: em vez de fingir que enviou, o
       formulário diz a verdade e oferece o caminho que funciona hoje. */
    var destino = form.dataset.destino;

    if (!destino || destino.indexOf("[A PREENCHER]") !== -1) {
      if (recado) {
        recado.innerHTML =
          "Formulário validado, mas o envio ainda não está ligado. " +
          'Fale com a gente pelo <a class="amarelo" href="https://instagram.com/digital.tk" ' +
          'target="_blank" rel="noopener">@digital.tk</a> enquanto isso.';
        recado.classList.add("aparece");
      }
      return;
    }

    form.submit();
  });
})();
