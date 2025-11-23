// Extension para autocompletar tarjetas de crédito (Shadow Virtual Cards)
console.log("💳 Shadow Virtual Cards cargada!");

let botonesActivos = [];
let menuActivo = null;
let _inputActual = null;

document.addEventListener("click", (event) => {
  const target = event.target;

  if (target.tagName === "INPUT") {
    const tipo = detectarTipoCampo(target);
    if (tipo === "numero") {
      _inputActual = target;
      mostrarMenuTarjetas(target);
    } else {
      ocultarBotones();
    }
  } else if (!menuActivo || !menuActivo.contains(target)) {
    ocultarBotones();
  }
});

function detectarTipoCampo(input) {
  const name = (input.name || "").toLowerCase();
  const id = (input.id || "").toLowerCase();
  const placeholder = (input.placeholder || "").toLowerCase();
  const autocomplete = (input.autocomplete || "").toLowerCase();
  const texto = `${name} ${id} ${placeholder} ${autocomplete}`;

  // Detectar número de tarjeta
  if (texto.match(/card.*number|cardnumber|cc.*number|number|card|ccnumber/)) {
    return "numero";
  }

  return "desconocido";
}

async function mostrarMenuTarjetas(inputNumero) {
  ocultarBotones();

  const rect = inputNumero.getBoundingClientRect();

  // Crear menú contenedor
  const menu = document.createElement("div");
  menu.style.cssText = `
    position: absolute;
    background: #ffffff;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
    z-index: 999999;
    min-width: 320px;
    max-width: 360px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    max-height: 240px;
    overflow-y: auto;
    border: 1px solid #e5e5e5;
  `;

  // Agregar estilos para scrollbar
  const style = document.createElement("style");
  style.textContent = `
    .shadow-cards-menu::-webkit-scrollbar {
      width: 6px;
    }
    .shadow-cards-menu::-webkit-scrollbar-track {
      background: #f5f5f5;
    }
    .shadow-cards-menu::-webkit-scrollbar-thumb {
      background: #d5d5d5;
    }
    .shadow-cards-menu::-webkit-scrollbar-thumb:hover {
      background: #b5b5b5;
    }
  `;
  if (!document.querySelector("#shadow-cards-style")) {
    style.id = "shadow-cards-style";
    document.head.appendChild(style);
  }
  menu.classList.add("shadow-cards-menu");

  menu.style.left = `${rect.left + window.scrollX}px`;
  menu.style.top = `${rect.bottom + window.scrollY + 8}px`;

  // Mostrar loading mientras carga
  menu.innerHTML = `
    <div style="padding: 20px; text-align: center; color: #666;">
      <div style="margin-bottom: 8px;">⏳</div>
      Loading cards...
    </div>
  `;

  document.body.appendChild(menu);
  menuActivo = menu;
  botonesActivos.push(menu);

  try {
    // Obtener tarjetas del usuario
    const response = await chrome.runtime.sendMessage({ action: "listCards" });

    if (!response.success) {
      throw new Error(response.error || "Error al cargar tarjetas");
    }

    const cards = response.cards || [];

    // Limpiar menu
    menu.innerHTML = "";

    // Si hay tarjetas, mostrarlas
    if (cards.length > 0) {
      cards.forEach((card) => {
        const cardItem = crearItemTarjeta(card);
        menu.appendChild(cardItem);
      });
    }

    // Botón de crear nueva tarjeta
    const crearBtn = crearBotonCrearTarjeta();
    menu.appendChild(crearBtn);
  } catch (error) {
    console.error("Error cargando tarjetas:", error);
    menu.innerHTML = `
      <div style="padding: 16px; text-align: center; color: #d32f2f; font-size: 13px;">
        ❌ Error loading cards
      </div>
    `;
  }
}

function crearItemTarjeta(card) {
  const item = document.createElement("div");
  item.style.cssText = `
    padding: 12px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fafafa;
    margin: 4px 0;
  `;

  // Detectar tipo de tarjeta (Visa, Mastercard, etc.)
  const brand = card.brand || "card";
  const brandEmoji = brand.toLowerCase().includes("visa")
    ? "💳"
    : brand.toLowerCase().includes("master")
      ? "💳"
      : "💳";

  item.innerHTML = `
    <div style="
      width: 40px;
      height: 40px;
      background: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      border: 1px solid #000;
    ">${brandEmoji}</div>
    <div style="flex: 1; min-width: 0;">
      <div style="
        font-size: 14px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      ">${card.name || "Card"}</div>
      <div style="
        font-size: 13px;
        color: #666;
        font-family: 'SF Mono', monospace;
      ">•••• •••• •••• ${card.last4}</div>
    </div>
  `;

  item.addEventListener("mouseenter", () => {
    item.style.background = "#f0f0f0";
    item.style.transform = "translateX(2px)";
  });

  item.addEventListener("mouseleave", () => {
    item.style.background = "#fafafa";
    item.style.transform = "translateX(0)";
  });

  item.addEventListener("click", async (e) => {
    e.stopPropagation();
    await autocompletarTarjeta(card);
  });

  return item;
}

function crearBotonCrearTarjeta() {
  const boton = document.createElement("div");
  boton.style.cssText = `
    padding: 12px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fafafa;
    margin-top: 4px;
    border: 1px dashed #d5d5d5;
  `;

  boton.innerHTML = `
    <div style="
      width: 40px;
      height: 40px;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      border: 1px solid #e5e5e5;
    ">➕</div>
    <div style="flex: 1;">
      <div style="
        font-size: 14px;
        font-weight: 500;
        color: #1a1a1a;
      ">Create new card</div>
      <div style="
        font-size: 12px;
        color: #666;
      ">For ${window.location.hostname}</div>
    </div>
  `;

  boton.addEventListener("mouseenter", () => {
    boton.style.background = "#f0f0f0";
    boton.style.borderColor = "#b5b5b5";
    boton.style.transform = "translateX(2px)";
  });

  boton.addEventListener("mouseleave", () => {
    boton.style.background = "#fafafa";
    boton.style.borderColor = "#d5d5d5";
    boton.style.transform = "translateX(0)";
  });

  boton.addEventListener("click", async (e) => {
    e.stopPropagation();
    await crearYAutocompletarNuevaTarjeta(boton);
  });

  return boton;
}

async function autocompletarTarjeta(card) {
  try {
    // Completar campos con la tarjeta existente
    completarCampo("numero", card.number);
    completarCampo("nombre", card.cardholder_name || card.name);
    completarCampo("expiracion", card.expiration);
    completarCampo("cvv", card.cvv);

    // Feedback visual
    if (menuActivo) {
      menuActivo.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #000;">
          <div style="font-size: 32px; margin-bottom: 8px;">✓</div>
          <div style="font-size: 14px; font-weight: 500;">Card filled!</div>
        </div>
      `;

      setTimeout(() => {
        ocultarBotones();
      }, 1000);
    }
  } catch (error) {
    console.error("Error autocompletando:", error);
  }
}

async function crearYAutocompletarNuevaTarjeta(botonElement) {
  try {
    // Mostrar loading
    botonElement.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
        border: 1px solid #e5e5e5;
      ">⏳</div>
      <div style="flex: 1;">
        <div style="
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
        ">Creating card...</div>
      </div>
    `;
    botonElement.style.cursor = "wait";

    const domain = window.location.hostname;

    // Crear tarjeta
    const response = await chrome.runtime.sendMessage({
      action: "createAndFill",
      domain: domain,
    });

    if (!response.success) {
      throw new Error(response.error || "Error creating card");
    }

    const cardData = response.card;

    // Completar campos
    completarCampo("numero", cardData.number);
    completarCampo("nombre", cardData.cardholder_name);
    completarCampo("expiracion", cardData.expiration);
    completarCampo("cvv", cardData.cvv);

    // Feedback visual
    if (menuActivo) {
      menuActivo.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #000;">
          <div style="font-size: 32px; margin-bottom: 8px;">✓</div>
          <div style="font-size: 14px; font-weight: 500;">Card created & filled!</div>
          <div style="font-size: 12px; color: #666; margin-top: 4px;">•••• ${cardData.last4}</div>
        </div>
      `;

      setTimeout(() => {
        ocultarBotones();
      }, 1500);
    }
  } catch (error) {
    console.error("Error:", error);

    // Mostrar error
    botonElement.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: #ffebee;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
        border: 1px solid #ffcdd2;
      ">❌</div>
      <div style="flex: 1;">
        <div style="
          font-size: 14px;
          font-weight: 500;
          color: #d32f2f;
        ">${error.message || "Error"}</div>
      </div>
    `;
    botonElement.style.cursor = "pointer";

    setTimeout(() => {
      ocultarBotones();
    }, 3000);
  }
}

function completarCampo(tipoCampo, valor) {
  const inputs = document.querySelectorAll("input");

  for (const input of inputs) {
    const name = (input.name || "").toLowerCase();
    const id = (input.id || "").toLowerCase();
    const placeholder = (input.placeholder || "").toLowerCase();
    const autocomplete = (input.autocomplete || "").toLowerCase();
    const texto = `${name} ${id} ${placeholder} ${autocomplete}`;

    let esElCampo = false;

    switch (tipoCampo) {
      case "numero":
        esElCampo = texto.match(
          /card.*number|cardnumber|cc.*number|^number$|^card$/,
        );
        break;
      case "nombre":
        esElCampo = texto.match(
          /card.*name|cardholder|name.*card|cc.*name|holder/,
        );
        break;
      case "expiracion":
        esElCampo = texto.match(/exp|expir|expiry|date/);
        break;
      case "cvv":
        esElCampo = texto.match(/cvv|cvc|security.*code|csc|ccv/);
        break;
    }

    if (esElCampo) {
      input.value = valor;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      console.log(`✓ Completado ${tipoCampo}:`, valor);
      break;
    }
  }
}

function ocultarBotones() {
  botonesActivos.forEach((boton) => boton.remove());
  botonesActivos = [];
  menuActivo = null;
  _inputActual = null;
}
