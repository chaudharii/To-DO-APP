
let tasks       = JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
let currentFilter = 'all';
let editingId     = null;

function save()    { localStorage.setItem('taskflow_tasks', JSON.stringify(tasks)); }
function uid()     { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function addTask() {
  const input    = document.getElementById('task-input');
  const priority = document.getElementById('priority-select').value;
  const text     = input.value.trim();

  if (!text) {
    input.focus();
    input.style.outline = '2px solid var(--danger)';
    setTimeout(() => input.style.outline = '', 800);
    return;
  }

  tasks.unshift({ id: uid(), text, priority, completed: false, createdAt: Date.now() });
  save();
  input.value = '';
  render();
}

// Press Enter to add
document.getElementById('task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// ── Toggle Complete ───────────────────────────────────────────────
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) { task.completed = !task.completed; save(); render(); }
}

// ── Delete Task ───────────────────────────────────────────────────
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save(); render();
}

// ── Open Edit Modal ───────────────────────────────────────────────
function openEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;

  document.getElementById('edit-input').value    = task.text;
  document.getElementById('edit-priority').value = task.priority;

  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('edit-input').focus(), 150);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  editingId = null;
}

// Press Escape to close modal
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Save Edit ─────────────────────────────────────────────────────
function saveEdit() {
  const newText     = document.getElementById('edit-input').value.trim();
  const newPriority = document.getElementById('edit-priority').value;

  if (!newText) {
    document.getElementById('edit-input').focus();
    return;
  }

  const task = tasks.find(t => t.id === editingId);
  if (task) {
    task.text     = newText;
    task.priority = newPriority;
    save(); render();
  }
  closeModal();
}

// ── Filter ────────────────────────────────────────────────────────
function filterTasks(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  render();
}

// ── Render ────────────────────────────────────────────────────────
function render() {
  const list     = document.getElementById('task-list');
  const emptyMsg = document.getElementById('empty-msg');

  let filtered = tasks;
  if (currentFilter === 'pending')   filtered = tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') filtered = tasks.filter(t =>  t.completed);

  // Stats
  document.getElementById('total-count').textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
  document.getElementById('done-count').textContent   = `${tasks.filter(t => t.completed).length} done`;

  // Empty state
  if (filtered.length === 0) {
    list.innerHTML = '';
    emptyMsg.classList.add('show');
    emptyMsg.textContent =
      currentFilter === 'completed' ? 'No completed tasks yet.' :
      currentFilter === 'pending'   ? 'All caught up! 🎉' :
      'No tasks yet. Add one above ↑';
    return;
  }
  emptyMsg.classList.remove('show');

  // Build list
  list.innerHTML = filtered.map(task => `
    <li class="task-item ${task.completed ? 'completed' : ''}" data-priority="${task.priority}" data-id="${task.id}">
      <button class="complete-btn" onclick="toggleComplete('${task.id}')" title="${task.completed ? 'Mark pending' : 'Mark complete'}">
        ${task.completed ? '✓' : ''}
      </button>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <span class="priority-badge ${task.priority}">${task.priority}</span>
      <div class="task-actions">
        <button class="action-btn edit"   onclick="openEdit('${task.id}')"   title="Edit task">✏</button>
        <button class="action-btn delete" onclick="deleteTask('${task.id}')" title="Delete task">🗑</button>
      </div>
    </li>
  `).join('');
}

// ── XSS guard ─────────────────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ── Init ──────────────────────────────────────────────────────────
render();
