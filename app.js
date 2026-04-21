// =====================================================
// app.js — el cerebro del chat en el navegador
// =====================================================

let historial = [];

window.addEventListener('load', () => {
  llamarAPI('Inicia la conversación saludando al usuario', true);
});

document.getElementById('user-input')
  .addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

function sendMessage() {
  const input  = document.getElementById('user-input');
  const texto  = input.value.trim();

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
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ messages: historial })
    });

    const data      = await res.json();
    const respuesta = data.reply;

    historial.push({ role: 'assistant', content: respuesta });

    typing.remove();
    mostrarMensaje(respuesta, 'ai');

  } catch (err) {
    typing.remove();
    mostrarMensaje(
      'Ups, algo salió mal. Comprueba tu conexión e inténtalo de nuevo.',
      'ai'
    );
    console.error(err);
  }

  document.getElementById('send-btn').disabled = false;
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