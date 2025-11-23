// Background Service Worker para Shadow Virtual Cards
console.log('🔧 Background worker cargado!');

const API_BASE_URL = 'https://shadow.commet.co/api/extension';

// Estado de autenticación (se guarda en chrome.storage.local)
let authState = {
  token: null,
  user: null,
  isAuthenticated: false
};

// Inicializar: Cargar token guardado al iniciar
chrome.runtime.onStartup.addListener(async () => {
  await loadAuthState();
});

chrome.runtime.onInstalled.addListener(async () => {
  await loadAuthState();
});

// Cargar estado de autenticación desde storage
async function loadAuthState() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'authUser']);
    if (result.authToken && result.authUser) {
      authState.token = result.authToken;
      authState.user = result.authUser;
      authState.isAuthenticated = true;
      console.log('✓ Sesión restaurada:', authState.user.email);
    }
  } catch (error) {
    console.error('Error cargando auth state:', error);
  }
}

// Guardar estado de autenticación en storage
async function saveAuthState() {
  try {
    await chrome.storage.local.set({
      authToken: authState.token,
      authUser: authState.user
    });
  } catch (error) {
    console.error('Error guardando auth state:', error);
  }
}

// Login
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Guardar token y usuario
    authState.token = data.sessionToken;
    authState.user = data.user;
    authState.isAuthenticated = true;

    await saveAuthState();

    console.log('✓ Login exitoso:', data.user.email);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, error: error.message };
  }
}

// Logout
async function logout() {
  authState.token = null;
  authState.user = null;
  authState.isAuthenticated = false;

  await chrome.storage.local.remove(['authToken', 'authUser']);
  console.log('✓ Logout exitoso');
  
  return { success: true };
}

// Verificar si está autenticado
async function checkAuth() {
  if (!authState.token) {
    await loadAuthState();
  }

  if (!authState.isAuthenticated) {
    return { isAuthenticated: false };
  }

  // Verificar que el token siga siendo válido
  try {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'verify',
        token: authState.token 
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      // Token inválido, hacer logout
      await logout();
      return { isAuthenticated: false };
    }

    return { 
      isAuthenticated: true, 
      user: authState.user 
    };
  } catch (error) {
    console.error('Error verificando auth:', error);
    return { isAuthenticated: false };
  }
}

// Crear tarjeta virtual
async function createCard(domain) {
  try {
    if (!authState.isAuthenticated || !authState.token) {
      throw new Error('Not authenticated');
    }

    console.log(`🎴 Creando tarjeta para: ${domain}`);

    const response = await fetch(`${API_BASE_URL}/cards/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: domain,
        token: authState.token,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.needsOnboarding) {
        throw new Error('Necesitas completar el onboarding en shadow-v2');
      }
      throw new Error(data.error || 'Failed to create card');
    }

    console.log('✓ Tarjeta creada exitosamente:', data.card.last4);
    return { success: true, card: data.card };
  } catch (error) {
    console.error('❌ Error creando tarjeta:', error);
    return { success: false, error: error.message };
  }
}

// Listar tarjetas del usuario
async function listCards() {
  try {
    if (!authState.isAuthenticated || !authState.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/cards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authState.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch cards');
    }

    return { success: true, cards: data.cards };
  } catch (error) {
    console.error('Error listando tarjetas:', error);
    return { success: false, error: error.message };
  }
}

// Escuchar mensajes desde content.js o popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Mensaje recibido:', message.action);

  (async () => {
    try {
      switch (message.action) {
        case 'login':
          const loginResult = await login(message.email, message.password);
          sendResponse(loginResult);
          break;

        case 'logout':
          const logoutResult = await logout();
          sendResponse(logoutResult);
          break;

        case 'checkAuth':
          const authResult = await checkAuth();
          sendResponse(authResult);
          break;

        case 'createAndFill':
          const cardResult = await createCard(message.domain);
          sendResponse(cardResult);
          break;

        case 'listCards':
          const listResult = await listCards();
          sendResponse(listResult);
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error en mensaje:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  // Mantener el canal abierto para respuesta asíncrona
  return true;
});

