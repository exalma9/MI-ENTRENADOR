// =====================================================
// app.js — con memoria localStorage
// =====================================================

const STORAGE_KEY = 'fitcoach_historial';

let historial = cargarHistorial();

window.addEventListener('load', () => {
  if (historial.length > 0) {
    historial.forEach(msg => {
      mostrarMensaje(msg.content, msg.role === 'user' ? 'user' : 'ai');
    });
    mostrarBotonReset();
  } else {
    llamarAPI('Hola, empieza la sesión', true);
  }
});

document.getElementById('user-input')
  .addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

function sendMessage() {
  const input = document.getElementById('user-input');
  const texto = input.value.trim();
  if (!texto) return;

  mostrarMensaje(texto, 'user');
  input.value = '';
  llamarAPI(texto, false);
}

async function llamarAPI(textoUsuario, esInicio) {

  if (esInicio) {
    historial.push({ role: 'user', content: 'Hola, empieza la sesión' });
  } else {
    historial.push({ role: 'user', content: textoUsuario });
  }

  const typing = mostrarTyping();
  document.getElementById('send-btn').disabled = true;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: historial })
    });

    const data = await res.json();
    const respuesta = data.reply;

    historial.push({ role: 'assistant', content: respuesta });

    guardarHistorial();

    typing.remove();
    mostrarMensaje(respuesta, 'ai');

    if (historial.length === 2) {
      mostrarBotonReset();
    }

  } catch (err) {
    typing.remove();
    mostrarMensaje('Ups, algo salió mal. Inténtalo de nuevo.', 'ai');
    console.error(err);
  }

  document.getElementById('send-btn').disabled = false;
}

function guardarHistorial() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historial));
  } catch (e) {
    console.error('No se pudo guardar el historial', e);
  }
}

function cargarHistorial() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado ? JSON.parse(guardado) : [];
  } catch (e) {
    return [];
  }
}

function resetChat() {
  if (!confirm('¿Seguro que quieres empezar de nuevo? Se borrarán todos tus datos y rutinas guardadas.')) return;

  localStorage.removeItem(STORAGE_KEY);
  historial = [];
  document.getElementById('chat').innerHTML = '';
  llamarAPI('Hola, empieza la sesión', true);
}

function mostrarBotonReset() {
  if (document.getElementById('reset-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'reset-btn';
  btn.textContent = 'Nuevo usuario';
  btn.onclick = resetChat;
  btn.style.cssText = `
    margin-top: 6px;
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    background: white;
    color: #666;
    cursor: pointer;
  `;
  document.querySelector('header').appendChild(btn);
}

function mostrarMensaje(texto, tipo) {
  const chat = document.getElementById('chat');
  const div  = document.createElement('div');
  div.className = 'msg ' + tipo;

  if (tipo === 'ai') {
    div.innerHTML = marked.parse(texto);
  } else {
    div.textContent = texto;
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function mostrarTyping() {
  const chat = document.getElementById('chat');
  const div  = document.createElement('div');
  div.className = 'msg ai typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}