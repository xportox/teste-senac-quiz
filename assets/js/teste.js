// SUMÁRIO

// 1a etapa: criar estrutura de dados
// 2a etapa: renderizar a estrutura de dados no html
// 3a etapa: concretizar validações
// 4a etapa: lidar com fluxo entre questões
// 5a etapa: "frontend"

// CONSIDERAÇÕES
// embrulhei o código utilizando uma IIFE para não expor nada no escopo global.
//
// A respeito das questões
// 1. Inicialmente havia criado um objeto para as questões
// 2. Depois, transformei esse objeto em JSON e armazenei ele na raiz do projeto e fiz uma requisição assíncrona pra ele;
// 3. Porém, não é garantia se a pessoa que irá avaliar o teste irá rodar um servidor HTTP ou então apenas abrirá o index.html, sem servidor. Então deixei o arquivo das questões em um gist do meu github e retorno de forma assíncrona as questões, fazendo com que funcione tanto com servidor quanto sem.
//
// Apenas pra contextualizar: rodar o index.html sem servidor não permitirá que o arquivo local questoes.json seja carregado, fazendo com que o teste não funcione, por isso a solução acima

// 1a etapa: criar estrutura de dados

(async function () {
  async function puxarQuestoes() {
    const res = await fetch(
      "https://gist.githubusercontent.com/xportox/8e4444a309ceb4c89c27cce2ea5da674/raw/c4a24945d2b608012975c242e3ca1120bb26a45e/questoes.json"
    );
    const json = await res.json();
    return json;
  }

  const questoes = puxarQuestoes();

  const estado = {
    arr: await questoes,
    enviouForm: false,
    acertouResposta: undefined,
    questaoAtual: 0,
    acertos: 0,
    get getCorreta() {
      return verificarCorreta(this.arr[this.questaoAtual]);
    },
  };

  // 2a etapa: renderizar a estrutura de dados no html

  /* HELPERS */

  function criarElemento(tag = "div", props = {}, children = []) {
    let el = document.createElement(tag);
    Object.assign(el, props);
    el.append(...children);
    return el;
  }

  let criarTexto = document.createTextNode.bind(document);

  function definirAtributos(el, atributos) {
    Object.entries(atributos).forEach(([chave, valor]) =>
      el.setAttribute(chave, valor)
    );
  }

  function inserirTexto(el, texto) {
    el.innerText = texto;
  }

  function renderizarPlacar(acertos, indiceAtual, indiceTotal) {
    let elIndiceAtual = document.querySelector(".placar__indiceAtual");
    let elIndiceTotal = document.querySelector(".placar__indiceTotal");
    let elAcertos = document.querySelector(".placar__pontuacao");

    inserirTexto(elIndiceAtual, indiceAtual);
    inserirTexto(elIndiceTotal, indiceTotal);
    inserirTexto(elAcertos, acertos);
  }

  function renderizarAlternativa({ id, texto }) {
    let htmlId = `alternativa${id}`;
    return `<div class='quiz__alternativa' data-alternativa=${id}>
      <input id=${htmlId} type='radio' name='alternativa' required>
      <label for=${htmlId}>${texto}</>
    </div>`;
  }

  function renderizarAlternativas(arr, el) {
    return arr.forEach((e) =>
      el.appendChild(
        document
          .createRange()
          .createContextualFragment(renderizarAlternativa(e))
      )
    );
  }

  function renderizarFormulario(obj, { acertos, questaoAtual, arr }) {
    let elBotao = criarElemento(
      "button",
      { type: "submit", className: "quiz__submit botao" },
      [criarTexto("Confirmar")]
    );
    let elForm = document.querySelector(".quiz__form");
    let elNumero = document.querySelector(".quiz__numero h3");
    let elTitulo = document.querySelector(".quiz__titulo");
    let elThumbnail = document.querySelector(".quiz__thumbnail");

    renderizarPlacar(acertos, questaoAtual + 1, arr.length);

    Object.entries(obj).forEach(([chave, valor]) => {
      switch (chave) {
        case "id":
          inserirTexto(elNumero, valor);
          break;
        case "titulo":
          inserirTexto(elTitulo, valor);
          break;
        case "alternativas":
          renderizarAlternativas(valor, elForm);
          break;
        case "thumbnail":
          definirAtributos(elThumbnail, { src: valor.src, alt: valor.alt });
          break;
      }
    });

    document
      .querySelector(".quiz__form")
      .lastElementChild.insertAdjacentElement("afterend", elBotao);
  }

  renderizarFormulario(estado.arr[estado.questaoAtual], estado);

  // 3a etapa: concretizar validações

  function verificarCorreta(obj) {
    let nodeCorreta = obj.alternativas.find((item) => item.correta);
    return [nodeCorreta, nodeCorreta.id, nodeCorreta.feedback];
  }

  function retornarFeedback(obj, alternativa) {
    return obj.alternativas.find((e) => e.id == alternativa).feedback;
  }

  function renderizarCheck(elemento) {
    let respostaCerta = criarElemento("i", { className: "fas fa-check" });
    let respostaErrada = criarElemento("i", { className: "fas fa-times" });

    if (elemento.parentElement.dataset.alternativa == estado.getCorreta[1]) {
      elemento.parentElement.style.backgroundColor = "var(--cor-quiz-primaria)";

      [...elemento.parentElement.children].forEach(
        (e) => (e.style.color = "var(--cor-banner-bg)")
      );

      elemento.parentElement.insertBefore(respostaCerta, elemento);
    } else {
      elemento.parentElement.insertBefore(respostaErrada, elemento);
    }
  }

  function renderizarFeedback(acertou, alternativa) {
    let elBotao = criarElemento(
      "button",
      { className: "feedback__proximo botao" },
      [
        estado.questaoAtual + 1 == estado.arr.length
          ? criarTexto("Concluir ")
          : criarTexto("Próxima questão"),
      ]
    );

    elBotao.addEventListener("click", proximaQuestao);

    let elCorreta = document.querySelector(".feedback__correta");
    let elCorpo = document.querySelector(".feedback__corpo");
    let elTitulo = document.querySelector(".feedback__titulo");
    let elWrapper = document.querySelector(".feedback");

    elWrapper.style.display = "flex";

    if (acertou) {
      inserirTexto(elTitulo, "Parabéns!");
      inserirTexto(elCorpo, estado.getCorreta[2]);
    } else {
      inserirTexto(elTitulo, "Não foi dessa vez...");
      inserirTexto(
        elCorpo,
        retornarFeedback(estado.arr[estado.questaoAtual], alternativa)
      );
      inserirTexto(
        elCorreta,
        `A resposta correta é a ${estado.getCorreta[1]}.

        Explicação: ${
          estado.arr[estado.questaoAtual].alternativas[estado.getCorreta[1] - 1]
            .feedback
        }`
      );
    }

    elWrapper.lastElementChild.insertAdjacentElement("afterend", elBotao);
  }

  function contabilizarResultado(el, acertou) {
    if (acertou) {
      estado.acertos++;
      inserirTexto(el, estado.acertos);
    }
  }

  function congelarInputs(elemento) {
    elemento.setAttribute("disabled", "disabled");
  }

  function validarForm(e) {
    e.preventDefault();
    let elBotao = document.querySelector(".quiz__submit");
    let elAlternativas = [...e.target.elements["alternativa"]];
    let elAlternativaEscolhida = elAlternativas.find((e) => e.checked);
    let idAlternativaEscolhida =
      elAlternativaEscolhida.parentElement.dataset.alternativa;

    if (!estado.enviouForm) {
      elAlternativas.forEach(renderizarCheck);
      estado.enviouForm = true;

      if (estado.enviouForm) {
        elAlternativas.forEach(congelarInputs);
        elBotao.remove();
      }

      if (idAlternativaEscolhida == estado.getCorreta[1]) {
        estado.acertouResposta = true;
      } else {
        estado.acertouResposta = false;
      }

      renderizarFeedback(estado.acertouResposta, idAlternativaEscolhida);

      contabilizarResultado(
        document.querySelector(".placar__pontuacao"),
        estado.acertouResposta
      );
    }
  }

  document.querySelector(".quiz__form").addEventListener("submit", validarForm);

  // 4a etapa: lidar com fluxo entre questões

  function renderizarFinalizacao({ acertos, arr }) {
    let elMain = document.querySelector(".quiz main");
    let elTitulo = document.querySelector(".quiz__titulo");

    document.querySelector(".quiz__numero").remove();

    document.querySelector(".quiz footer").remove();
    [...elMain.children].forEach((e) => e.remove());

    acertos <= 2
      ? inserirTexto(elTitulo, "Não foi dessa vez...")
      : inserirTexto(elTitulo, "Parabéns!");

    elMain.innerHTML = `
      <h4 class="quiz__final">Agradecemos pela sua participação no teste! Você acertou ${acertos} ${
      acertos != 1 ? "questões" : "questão"
    } de ${arr.length}</h4>
    `;
  }

  function proximaQuestao(e) {
    let elFeedback = document.querySelector(".feedback");
    let elForm = document.querySelector(".quiz__form");

    // Remover conteúdo anterior
    estado.enviouForm = false;
    estado.acertouResposta = undefined;

    document.querySelector(".feedback").style.display = "none";

    elForm.removeEventListener("submit", validarForm);

    if ([...elFeedback.children].length) {
      [...elFeedback.children].forEach((e) => {
        e.innerText = "";
        e.nodeName == "BUTTON" ? e.remove() : null;
      });
    }

    if ([...elForm.children].length) {
      [...document.querySelector(".quiz__form").children].forEach((e) =>
        e.remove()
      );
    }

    // Avançar para próxima questão
    if (estado.questaoAtual + 1 != estado.arr.length) {
      estado.questaoAtual++;
      renderizarFormulario(estado.arr[estado.questaoAtual], estado);
      document
        .querySelector(".quiz__form")
        .addEventListener("submit", validarForm);
    } else {
      renderizarFinalizacao(estado);
    }
  }

  // 5a etapa: "frontend"
  // infelizmente as cores não mudam uniformemente de um tema pra outro, então foi necessário definir variáveis extras. Contextualizando: o verde dos itens do quiz do tema 1 não ficam azuis no tema 2, ao invés disso ficam rosa.
  // TO-DO:
  // 1. corrigir --cor-banner-bg (por enquanto deixei --cor-banner-bg-2)
  // 2. manter tema atual persistente (localStorage) (OK)

  const temas = [
    {
      "--cor-primaria": "#05266e",
      "--cor-secundaria": "#ccff63",
      "--cor-secundaria-alpha": "rgba(204, 255, 99, 0.9)",
      "--cor-banner-bg": "#1c0f30",
      "--cor-quiz-numero": "var(--cor-primaria)",
      "--cor-quiz-primaria": "var(--cor-secundaria)",
      "--cor-quiz-botao": "var(--cor-outline)",
      "--cor-quiz-bg": "#1c0f30",
      "--cor-img-border": "#ded9d9",
      "--cor-texto": "#484848",
      "--cor-texto-bold": "#0019bf",
      "--cor-texto-light": "#ded9d9",
      "--cor-texto-bold-bg": "var(--cor-secundaria)",
      "--cor-outline": "#ff757f",
      "--cor-bg": "#f1f1f1",
      "--cor-placar-bg": "var(--cor-banner-bg)",
      "--cor-placar-texto": "var(--cor-secundaria)",
      "--cor-feedback-texto": "var(--cor-primaria)",
      "--cor-banner-bg-2": "var(--cor-banner-bg)",
      "--bg-banner": "url('../img/light_bannerBG.png')",
    },
    {
      "--cor-primaria": "#ccff63",
      "--cor-secundaria": "#05266e",
      "--cor-secundaria-alpha": "rgba(112, 112, 112, 0.7)",
      "--cor-banner-bg": "#1c0f30",
      "--cor-quiz-numero": "var(--cor-secundaria)",
      "--cor-quiz-primaria": "#ff757f",
      "--cor-quiz-botao": "var(--cor-primaria)",
      "--cor-quiz-bg": "#0019bf",
      "--cor-img-border": "#ded9d9",
      "--cor-texto-light": "#ded9d9",
      "--cor-texto": "var(--cor-texto-light)",
      "--cor-texto-bold": "#0019bf",
      "--cor-texto-bold-bg": "var(--cor-secundaria)",
      "--cor-outline": "var(--cor-primaria)",
      "--cor-bg": "url('../img/dark_background.png')",
      "--cor-placar-bg": "var(--cor-quiz-bg)",
      "--cor-placar-texto": "var(--cor-quiz-primaria)",
      "--cor-feedback-texto": "var(--cor-texto-light)",
      "--cor-banner-bg-2": "var(--cor-quiz-primaria)",
      "--bg-banner": "url('../img/dark_bannerBG.png')",
    },
  ];

  function atualizarCores(numTema, arr) {
    Object.entries(arr[numTema - 1]).forEach(([chave, valor]) => {
      document.documentElement.style.setProperty(chave, valor);
    });
  }

  function atualizarTema(e) {
    localStorage.setItem("temaAtual", e.target.value);

    atualizarCores(localStorage.getItem("temaAtual"), temas);

    // document.getElementById(
    //   "temaEscolhido"
    // ).innerText = `O tema atual é ${localStorage.getItem("temaAtual")}`;
  }

  document.getElementById("tema").addEventListener("change", atualizarTema);

  [...document.querySelector("#tema").children]
    .find((e) => e.value == localStorage.getItem("temaAtual"))
    .setAttribute("selected", "selected");

  atualizarCores(localStorage.getItem("temaAtual") || 1, temas);
})();
