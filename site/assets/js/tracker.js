// Deadline tracker — local-first, stores data in browser localStorage only
const STORAGE_KEY = 'asdaleConsumerDeadlines_v1';
let deadlines = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const form = document.getElementById('deadline-form');
const list = document.getElementById('deadline-list');
const countEl = document.getElementById('deadline-count');

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deadlines));
  render();
}

function formatDateLabel(value) {
  const parts = value.split('-');
  if (parts.length !== 3) return value;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNames[parseInt(parts[1], 10) - 1] + ' ' + parts[2] + ', ' + parts[0];
}

function statusBadge(d) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const itemDate = new Date(d.date);
  itemDate.setHours(0, 0, 0, 0);
  if (d.done) return '<span class="badge done">Done</span>';
  if (itemDate < today) return '<span class="badge overdue">Overdue</span>';
  return '<span class="badge upcoming">Upcoming</span>';
}

function addDeadline(e) {
  e.preventDefault();
  const title = document.getElementById('field-title').value.trim();
  const date = document.getElementById('field-date').value;
  const desc = document.getElementById('field-desc').value.trim();
  if (!title || !date) return;
  deadlines.push({ title, date, desc, done: false });
  save();
  form.reset();
}

function toggleDeadline(index) {
  deadlines[index].done = !deadlines[index].done;
  save();
}

function deleteDeadline(index) {
  deadlines.splice(index, 1);
  save();
}

function render() {
  list.innerHTML = '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let upcoming = 0;
  deadlines.forEach((d, i) => {
    const item = document.createElement('div');
    const itemDate = new Date(d.date);
    itemDate.setHours(0, 0, 0, 0);
    const overdue = !d.done && itemDate < today;
    if (!d.done) upcoming++;
    item.className = 'deadline-item' + (d.done ? ' done' : '') + (overdue ? ' overdue' : '');
    item.innerHTML =
      '<div class="item-meta">' +
      '<span class="item-date">' + formatDateLabel(d.date) + '</span>' +
      statusBadge(d) +
      '</div>' +
      '<div class="item-body">' +
      '<h3 class="item-title">' + escapeHtml(d.title) + '</h3>' +
      '<p class="item-desc">' + escapeHtml(d.desc) + '</p>' +
      '</div>' +
      '<div class="item-actions">' +
      '<button class="btn secondary toggle" onclick="app.toggleDeadline(' + i + ')">' + (d.done ? 'Reopen' : 'Mark done') + '</button>' +
      '<button class="btn secondary delete" onclick="app.deleteDeadline(' + i + ')">Delete</button>' +
      '</div>';
    list.appendChild(item);
  });
  countEl.textContent = upcoming + ' upcoming';
}

function printTracker() {
  window.print();
}

function exportTracker() {
  const data = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deadlines, null, 2));
  const link = document.createElement('a');
  link.href = 'data:' + data;
  link.download = 'consumer-deadlines.json';
  link.click();
}

function importTracker(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const imported = JSON.parse(ev.target.result);
      if (Array.isArray(imported)) {
        deadlines = imported;
        save();
      } else {
        alert('Invalid tracker file.');
      }
    } catch (err) {
      alert('Could not read tracker file.');
    }
  };
  reader.readAsText(file);
}

const app = { toggleDeadline, deleteDeadline };

form.addEventListener('submit', addDeadline);
document.getElementById('btn-print').addEventListener('click', printTracker);
document.getElementById('btn-export').addEventListener('click', exportTracker);
document.getElementById('field-import').addEventListener('change', importTracker);

render();
