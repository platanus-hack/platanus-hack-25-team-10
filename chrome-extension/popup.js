// Popup.js - UI para login/logout y gestión de tarjetas
console.log("💳 Popup cargado!");

// Referencias a elementos del DOM
const loadingState = document.getElementById("loadingState");
const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const errorMessage = document.getElementById("errorMessage");
const userName = document.getElementById("userName");
const cardsList = document.getElementById("cardsList");

// Estado
let isLoading = false;

// Inicializar popup
async function init() {
  showLoading();

  // Verificar si está autenticado
  const authResult = await sendMessage({ action: "checkAuth" });

  if (authResult.isAuthenticated) {
    showDashboard(authResult.user);
    await loadCards();
  } else {
    showLogin();
  }
}

// Mostrar vista de loading
function showLoading() {
  loadingState.style.display = "block";
  loginView.style.display = "none";
  dashboardView.style.display = "none";
}

// Mostrar vista de login
function showLogin() {
  loadingState.style.display = "none";
  loginView.style.display = "block";
  dashboardView.style.display = "none";
}

// Mostrar dashboard
function showDashboard(user) {
  loadingState.style.display = "none";
  loginView.style.display = "none";
  dashboardView.style.display = "block";

  userName.textContent = user.email;
}

// Mostrar error
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";

  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 5000);
}

// Enviar mensaje al background worker
function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response || {});
    });
  });
}

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isLoading) return;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showError("Por favor completa todos los campos");
    return;
  }

  isLoading = true;
  loginBtn.textContent = "Iniciando sesión...";
  loginBtn.disabled = true;

  const result = await sendMessage({
    action: "login",
    email,
    password,
  });

  isLoading = false;
  loginBtn.textContent = "Iniciar Sesión";
  loginBtn.disabled = false;

  if (result.success) {
    showDashboard(result.user);
    await loadCards();
  } else {
    showError(result.error || "Error al iniciar sesión");
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  if (isLoading) return;

  isLoading = true;
  logoutBtn.textContent = "Cerrando sesión...";
  logoutBtn.disabled = true;

  const result = await sendMessage({ action: "logout" });

  isLoading = false;
  logoutBtn.textContent = "Cerrar Sesión";
  logoutBtn.disabled = false;

  if (result.success) {
    // Limpiar formulario
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    showLogin();
  }
});

// Cargar lista de tarjetas
async function loadCards() {
  cardsList.innerHTML =
    '<div style="text-align: center; padding: 10px; color: #999;">Cargando...</div>';

  const result = await sendMessage({ action: "listCards" });

  if (result.success && result.cards && result.cards.length > 0) {
    // Mostrar últimas 5 tarjetas
    const recentCards = result.cards.slice(0, 5);

    cardsList.innerHTML = recentCards
      .map(
        (card) => `
      <div class="card-item">
        <span class="name">${card.name || "Sin nombre"}</span>
        <span class="last4">•••• ${card.last4}</span>
      </div>
    `,
      )
      .join("");
  } else {
    cardsList.innerHTML =
      '<div class="empty-state">No has creado tarjetas aún.<br>Usa un formulario de pago para crear tu primera tarjeta.</div>';
  }
}

// Inicializar cuando se carga el popup
init();
