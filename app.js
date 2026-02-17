const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const countEl = document.getElementById('todo-count');
const footer = document.getElementById('todo-footer');
const clearBtn = document.getElementById('clear-completed');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let currentFilter = 'all';

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function render() {
  const filtered = todos.filter(t => {
    if (currentFilter === 'active') return !t.done;
    if (currentFilter === 'completed') return t.done;
    return true;
  });

  list.innerHTML = '';

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-message';
    li.textContent = currentFilter === 'all' ? 'タスクがありません' :
      currentFilter === 'active' ? '未完了のタスクはありません' : '完了済みのタスクはありません';
    list.appendChild(li);
  } else {
    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.done ? ' completed' : '');

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'todo-checkbox';
      cb.checked = todo.done;
      cb.addEventListener('change', () => { todo.done = cb.checked; save(); render(); });

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;
      span.addEventListener('dblclick', () => startEdit(li, todo));

      const del = document.createElement('button');
      del.className = 'delete-btn';
      del.textContent = '\u00d7';
      del.addEventListener('click', () => { todos = todos.filter(t => t !== todo); save(); render(); });

      li.append(cb, span, del);
      list.appendChild(li);
    });
  }

  const remaining = todos.filter(t => !t.done).length;
  countEl.textContent = `残り ${remaining} 件`;
  footer.style.display = todos.length ? 'flex' : 'none';
  clearBtn.style.display = todos.some(t => t.done) ? 'inline' : 'none';
}

function startEdit(li, todo) {
  const existing = li.querySelector('.todo-text');
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'todo-text-input';
  editInput.value = todo.text;
  existing.replaceWith(editInput);
  editInput.focus();

  const finish = () => {
    const val = editInput.value.trim();
    if (val) { todo.text = val; save(); }
    render();
  };

  editInput.addEventListener('blur', finish);
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') finish();
    if (e.key === 'Escape') render();
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text, done: false });
  input.value = '';
  save();
  render();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active').classList.remove('active');
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  save();
  render();
});

render();
