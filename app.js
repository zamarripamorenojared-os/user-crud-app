/* =====================
   UserVault — app.js
   CRUD con localStorage
   ===================== */

/* ── Paleta de colores para avatares ── */
const AVATAR_COLORS = [
  ['#7c6dfa','#9b8eff'], // violeta
  ['#34d399','#6ee7b7'], // verde
  ['#f59e0b','#fbbf24'], // ámbar
  ['#f87171','#fca5a5'], // rojo
  ['#38bdf8','#7dd3fc'], // celeste
  ['#e879f9','#f0abfc'], // rosa
  ['#fb923c','#fdba74'], // naranja
  ['#a3e635','#bef264'], // lima
];

/* ── Estado global ── */
let users   = JSON.parse(localStorage.getItem('uv_users') || '[]');
let currentId = null;   // ID del usuario en modal
let editMode  = false;

/* ── Persistencia ── */
const save = () => localStorage.setItem('uv_users', JSON.stringify(users));

/* ── Generar ID único ── */
const uid = () => '_' + Math.random().toString(36).substr(2,9);

/* ── Fecha legible ── */
const fmtDate = iso =>
  new Date(iso).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'});

/* ── Iniciales para avatar ── */
const initials = (first, last) =>
  (first[0] || '') + (last[0] || '');

/* ── Color de avatar por índice ── */
const avatarColor = idx => AVATAR_COLORS[idx % AVATAR_COLORS.length];

/* ── Hash rápido para elegir color por email ── */
const colorIdx = str => {
  let h = 0;
  for (const c of str) h = (h << 5) - h + c.charCodeAt(0);
  return Math.abs(h) % AVATAR_COLORS.length;
};

/* =====================
   RENDER: TARJETAS
   ===================== */
function renderList(filter = '') {
  const grid  = document.getElementById('userGrid');
  const empty = document.getElementById('emptyState');
  const ctr   = document.getElementById('userCounter');

  const q   = filter.toLowerCase().trim();
  const list = users.filter(u =>
    !q ||
    u.firstName.toLowerCase().includes(q) ||
    u.lastName.toLowerCase().includes(q)  ||
    u.email.toLowerCase().includes(q)
  );

  ctr.textContent = `${users.length} usuario${users.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    grid.innerHTML  = '';
    empty.classList.add('visible');
    return;
  }
  empty.classList.remove('visible');

  grid.innerHTML = list.map((u, i) => {
    const ci   = colorIdx(u.email);
    const [c1, c2] = avatarColor(ci);
    const ini  = initials(u.firstName, u.lastName).toUpperCase();
    return `
    <div class="user-card" onclick="openModal('${u.id}')" style="animation-delay:${i*0.04}s">
      <div class="card-avatar" style="background:linear-gradient(135deg,${c1},${c2})">${ini}</div>
      <div class="card-name">${u.firstName} ${u.lastName}</div>
      <div class="card-email">${u.email}</div>
      <div class="card-date">Registrado: ${fmtDate(u.createdAt)}</div>
      <div class="card-actions">
        <button class="card-btn" onclick="editUser('${u.id}',event)" title="Editar">✎</button>
        <button class="card-btn del" onclick="deleteUser('${u.id}',event)" title="Eliminar">⌫</button>
      </div>
    </div>`;
  }).join('');
}

/* =====================
   MODAL: DETALLE
   ===================== */
function openModal(id) {
  const u = users.find(x => x.id === id);
  if (!u) return;
  currentId = id;

  const ci   = colorIdx(u.email);
  const [c1, c2] = avatarColor(ci);
  const ini  = initials(u.firstName, u.lastName).toUpperCase();

  document.getElementById('modalAvatar').style.background = `linear-gradient(135deg,${c1},${c2})`;
  document.getElementById('modalAvatar').textContent = ini;
  document.getElementById('modalName').textContent  = `${u.firstName} ${u.lastName}`;
  document.getElementById('modalEmail').textContent = u.email;
  document.getElementById('modalId').textContent    = `ID: ${u.id}`;
  document.getElementById('modalDate').textContent  = `Alta: ${fmtDate(u.createdAt)}`;

  document.getElementById('modalEdit').onclick   = () => { closeModal(); editUser(id); };
  document.getElementById('modalDelete').onclick = () => { closeModal(); deleteUser(id); };

  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  currentId = null;
}

/* =====================
   CRUD
   ===================== */

/* ── CREATE / UPDATE ── */
document.getElementById('userForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;

  const id        = document.getElementById('editId').value;
  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const email     = document.getElementById('email').value.trim().toLowerCase();
  const password  = document.getElementById('password').value;

  if (id) {
    /* UPDATE */
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return;

    /* Verificar email duplicado (excluyendo el propio) */
    if (users.some(u => u.email === email && u.id !== id)) {
      showError('errEmail', 'Este correo ya está registrado');
      return;
    }

    users[idx] = {
      ...users[idx],
      firstName, lastName, email,
      password: hashPass(password),
      updatedAt: new Date().toISOString()
    };
    save();
    toast('Usuario actualizado ✓', 'success');
  } else {
    /* CREATE */
    if (users.some(u => u.email === email)) {
      showError('errEmail', 'Este correo ya está registrado');
      return;
    }
    users.push({
      id: uid(),
      firstName, lastName, email,
      password: hashPass(password),
      createdAt: new Date().toISOString(),
      updatedAt: null
    });
    save();
    toast('Usuario registrado ✓', 'success');
  }

  resetForm();
  switchView('list');
  renderList();
});

/* ── READ (Editar → llenar form) ── */
function editUser(id, evt) {
  if (evt) evt.stopPropagation();
  const u = users.find(x => x.id === id);
  if (!u) return;

  editMode = true;
  document.getElementById('editId').value    = u.id;
  document.getElementById('firstName').value = u.firstName;
  document.getElementById('lastName').value  = u.lastName;
  document.getElementById('email').value     = u.email;
  document.getElementById('password').value  = '';          // seguridad: no pre-llenar

  document.getElementById('formTitle').textContent = 'Editar Usuario';
  document.getElementById('formDesc').textContent  = 'Modifica los campos que desees actualizar';
  document.getElementById('submitBtn').textContent = 'Actualizar usuario';

  switchView('register');
}

/* ── DELETE ── */
function deleteUser(id, evt) {
  if (evt) evt.stopPropagation();
  const u = users.find(x => x.id === id);
  if (!u) return;

  if (!confirm(`¿Eliminar a ${u.firstName} ${u.lastName}?`)) return;

  users = users.filter(x => x.id !== id);
  save();
  renderList(document.getElementById('searchInput').value);
  toast('Usuario eliminado', 'error');
}

/* =====================
   VALIDACIÓN
   ===================== */
function validateForm() {
  let ok = true;
  clearErrors();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const email     = document.getElementById('email').value.trim();
  const password  = document.getElementById('password').value;

  if (!firstName) { showError('errFirst', 'Campo requerido'); ok = false; }
  else if (firstName.length < 2) { showError('errFirst', 'Mínimo 2 caracteres'); ok = false; }

  if (!lastName) { showError('errLast', 'Campo requerido'); ok = false; }
  else if (lastName.length < 2) { showError('errLast', 'Mínimo 2 caracteres'); ok = false; }

  const emailRgx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) { showError('errEmail', 'Campo requerido'); ok = false; }
  else if (!emailRgx.test(email)) { showError('errEmail', 'Formato inválido'); ok = false; }

  if (!password) { showError('errPass', 'Campo requerido'); ok = false; }
  else if (password.length < 6) { showError('errPass', 'Mínimo 6 caracteres'); ok = false; }

  return ok;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
  /* marcar campo */
  const inputMap = { errFirst:'firstName', errLast:'lastName', errEmail:'email', errPass:'password' };
  const inp = document.getElementById(inputMap[id]);
  if (inp) inp.classList.add('error');
}

function clearErrors() {
  ['errFirst','errLast','errEmail','errPass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['firstName','lastName','email','password'].forEach(id => {
    const inp = document.getElementById(id);
    if (inp) inp.classList.remove('error');
  });
}

/* ── Limpiar errors on input ── */
['firstName','lastName','email','password'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    document.getElementById(id).classList.remove('error');
  });
});

/* =====================
   PASSWORD UX
   ===================== */
document.getElementById('passToggle').addEventListener('click', () => {
  const inp = document.getElementById('password');
  const tog = document.getElementById('passToggle');
  if (inp.type === 'password') { inp.type = 'text'; tog.textContent = '◉'; }
  else { inp.type = 'password'; tog.textContent = '◎'; }
});

document.getElementById('password').addEventListener('input', e => {
  const v = e.target.value;
  const fill  = document.getElementById('passFill');
  const label = document.getElementById('passLabel');

  let strength = 0;
  if (v.length >= 6)  strength++;
  if (v.length >= 10) strength++;
  if (/[A-Z]/.test(v)) strength++;
  if (/[0-9]/.test(v)) strength++;
  if (/[^A-Za-z0-9]/.test(v)) strength++;

  const pct   = Math.min(100, strength * 20);
  const colors = ['#f87171','#fb923c','#fbbf24','#34d399','#6ee7b7'];
  const labels = ['Muy débil','Débil','Regular','Fuerte','Muy fuerte'];

  fill.style.width      = pct + '%';
  fill.style.background = colors[strength - 1] || '#f87171';
  label.textContent     = v ? (labels[strength - 1] || 'Muy débil') : '—';
});

/* ── "Hash" mínimo (demostración) ── */
function hashPass(p) {
  /* En producción real: usa bcrypt en el backend.
     Aquí solo almacenamos una representación base64 como demo. */
  return btoa(unescape(encodeURIComponent(p)));
}

/* =====================
   NAVEGACIÓN VISTAS
   ===================== */
function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(`view-${name}`).classList.add('active');
  document.querySelector(`[data-view="${name}"]`).classList.add('active');

  const titles = {
    list: ['Todos los Usuarios', 'Gestión completa de registros'],
    register: [editMode ? 'Editar Usuario' : 'Nuevo Usuario',
               editMode ? 'Actualiza los datos del registro' : 'Completa todos los campos para registrar']
  };
  document.getElementById('pageTitle').textContent    = titles[name][0];
  document.getElementById('pageSubtitle').textContent = titles[name][1];

  /* Mostrar/ocultar buscador */
  document.getElementById('searchWrap').style.display = name === 'list' ? 'flex' : 'none';
  document.getElementById('userCounter').style.display = name === 'list' ? 'flex' : 'none';

  if (name === 'list') renderList(document.getElementById('searchInput').value);
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    if (view === 'register' && editMode) {
      resetForm(); // limpia si venía de editar
    }
    switchView(view);
  });
});

/* =====================
   RESETEAR FORM
   ===================== */
function resetForm() {
  document.getElementById('userForm').reset();
  document.getElementById('editId').value       = '';
  document.getElementById('formTitle').textContent = 'Nuevo Usuario';
  document.getElementById('formDesc').textContent  = 'Completa todos los campos para registrar';
  document.getElementById('submitBtn').textContent = 'Guardar usuario';
  document.getElementById('passFill').style.width  = '0%';
  document.getElementById('passLabel').textContent = '—';
  document.getElementById('password').type = 'password';
  document.getElementById('passToggle').textContent = '◎';
  clearErrors();
  editMode = false;
}

function cancelForm() {
  resetForm();
  switchView('list');
}

/* =====================
   BÚSQUEDA
   ===================== */
document.getElementById('searchInput').addEventListener('input', e => {
  renderList(e.target.value);
});

/* =====================
   TOAST
   ===================== */
let toastTimer;
function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ── Cerrar modal con Escape ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── Cerrar modal al click en overlay ── */
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

/* =====================
   INICIO
   ===================== */
renderList();
switchView('list');
