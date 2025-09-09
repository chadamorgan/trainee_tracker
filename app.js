import { createSupabaseClient } from './js/supabaseClient.js';
import { renderStatusCards, renderRoster, renderUpcomingAppointments, renderPriorityList } from './js/ui.js';
import { openModal, closeModal, bindModalCloseButtons } from './js/modals.js';
import * as api from './js/api.js';

const supabase = await createSupabaseClient();
let currentStatusFilter = null;

function setupEventHandlers() {
  const platoonSelect = document.getElementById('platoonSelect');
  const rosterSearch = document.getElementById('rosterSearch');
  const openTraining = document.getElementById('openTrainingEvents');
  const openTasks = document.getElementById('openPlatoonTasks');
  const addTask = document.getElementById('addPlatoonTask');
  const statusCards = document.getElementById('statusCards');
  const openBulkUpload = document.getElementById('openBulkUpload');
  const processBulkUpload = document.getElementById('processBulkUpload');

  platoonSelect.addEventListener('change', refreshAll);
  rosterSearch.addEventListener('input', () => refreshRoster());

  openTraining.addEventListener('click', () => openModal('#trainingEventsModal'));
  openTasks.addEventListener('click', async () => openTasksModal());
  addTask.addEventListener('click', async () => openTasksModal());

  document.getElementById('closeTraineeModal').addEventListener('click', () => closeModal('#traineeModal'));
  bindModalCloseButtons();

  statusCards.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    const value = btn.getAttribute('data-filter');
    currentStatusFilter = currentStatusFilter === value ? null : value;
    refreshRoster();
  });

  openBulkUpload.addEventListener('click', () => {
    document.getElementById('bulkUploadText').value = '';
    document.getElementById('bulkUploadPreview').innerHTML = '';
    openModal('#bulkUploadModal');
  });
  processBulkUpload.addEventListener('click', async () => {
    const raw = document.getElementById('bulkUploadText').value || '';
    const parsed = parseBulkUploadText(raw);
    const preview = document.getElementById('bulkUploadPreview');
    if (parsed.length === 0) {
      preview.innerHTML = '<span class="text-rose-600">No valid rows found.</span>';
      return;
    }
    preview.innerHTML = `${parsed.length} trainees parsed. Importing...`;
    const res = await api.bulkCreateTrainees(supabase, parsed);
    if (res.ok) {
      preview.innerHTML = '<span class="text-emerald-700">Import complete.</span>';
      closeModal('#bulkUploadModal');
      await refreshAll();
    } else {
      preview.innerHTML = '<span class="text-rose-600">Import failed. Check console.</span>';
    }
  });
}

async function refreshAll() {
  await Promise.all([
    refreshCounts(),
    refreshRoster(),
    refreshAppointments(),
    refreshPriority()
  ]);
}

function getSelectedPlatoon() {
  return document.getElementById('platoonSelect').value;
}

async function refreshCounts() {
  const platoon = getSelectedPlatoon();
  const { available, total, statusCounts } = await api.getDashboardCounts(supabase, platoon);
  document.getElementById('availabilityCount').textContent = available;
  document.getElementById('availabilityTotal').textContent = total;
  renderStatusCards(statusCounts);
}

async function refreshRoster() {
  const platoon = getSelectedPlatoon();
  const q = document.getElementById('rosterSearch').value || '';
  let trainees = await api.searchTrainees(supabase, { platoon, query: q });
  if (currentStatusFilter) {
    if (currentStatusFilter === 'Male' || currentStatusFilter === 'Female') {
      const g = currentStatusFilter.toLowerCase();
      trainees = trainees.filter((t) => (t.gender || '').toLowerCase() === g);
    } else {
      trainees = trainees.filter((t) => (t.status || 'Present') === currentStatusFilter);
    }
  }
  renderRoster(trainees, onTraineeClick);
}

function parseBulkUploadText(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items = [];
  for (const line of lines) {
    // Format: Rank, Name, Gender; Platoon/Company
    // Example: PV2, John Doe, Male; 1st/A
    const [left, right] = line.split(';').map((x) => x && x.trim());
    if (!left || !right) continue;
    const parts = left.split(',').map((x) => x && x.trim());
    if (parts.length < 2) continue;
    const rank = parts[0] || '';
    const name = parts[1] || '';
    const gender = parts[2] || '';
    const platoon = (right.split('/')[0] || '').trim();
    if (!name || !platoon) continue;
    items.push({ rank, name, gender, platoon });
  }
  return items;
}

async function openTasksModal() {
  const body = document.getElementById('platoonTasksBody');
  body.innerHTML = `
    <form id="createTaskForm" class="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
      <div class="md:col-span-2">
        <label class="text-sm text-gray-600">Task</label>
        <input name="text" required class="border rounded-md w-full px-3 py-2 text-sm" placeholder="Task description">
      </div>
      <div>
        <label class="text-sm text-gray-600">Priority</label>
        <select name="priority" class="border rounded-md w-full px-3 py-2 text-sm">
          <option>High</option>
          <option selected>Medium</option>
          <option>Low</option>
        </select>
      </div>
      <div>
        <label class="text-sm text-gray-600">Due</label>
        <input name="due_date" type="date" class="border rounded-md w-full px-3 py-2 text-sm">
      </div>
      <div class="md:col-span-4 flex justify-end">
        <button class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700" type="submit">Add</button>
      </div>
    </form>
    <div>
      <h4 class="font-medium mt-2 mb-1">Open Tasks</h4>
      <div id="tasksList" class="space-y-2"></div>
    </div>
  `;

  const form = body.querySelector('#createTaskForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const text = (fd.get('text') || '').toString().trim();
    const priority = (fd.get('priority') || 'Medium').toString();
    const due_date = fd.get('due_date') || null;
    if (!text) return;
    await api.createPlatoonTask(supabase, { text, priority, due_date });
    form.reset();
    await Promise.all([renderTasksList(), refreshPriority()]);
  });

  async function renderTasksList() {
    const list = body.querySelector('#tasksList');
    const tasks = await api.listPlatoonTasks(supabase);
    if (!tasks.length) {
      list.innerHTML = '<div class="text-sm text-gray-500">No open tasks</div>';
      return;
    }
    list.innerHTML = tasks.map((t) => `
      <div class="border rounded-md p-2 ${t.completed ? 'opacity-60' : ''}" data-id="${t.id}">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          <div class="md:col-span-6">
            <input class="task-text border rounded-md w-full px-2 py-1 text-sm" value="${escapeHtml(t.text)}">
          </div>
          <div class="md:col-span-2">
            <select class="task-priority border rounded-md w-full px-2 py-1 text-sm">
              ${['High','Medium','Low'].map(p=>`<option ${t.priority===p?'selected':''}>${p}</option>`).join('')}
            </select>
          </div>
          <div class="md:col-span-2">
            <input type="date" class="task-due border rounded-md w-full px-2 py-1 text-sm" value="${t.due_date || ''}">
          </div>
          <div class="md:col-span-2 flex items-center gap-2 justify-end">
            <label class="text-sm inline-flex items-center gap-1"><input type="checkbox" class="task-completed" ${t.completed?'checked':''}> Done</label>
            <button class="task-save text-sm text-emerald-700">Save</button>
            <button class="task-delete text-sm text-rose-700">Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('[data-id]').forEach((row) => {
      const id = row.getAttribute('data-id');
      row.querySelector('.task-save').addEventListener('click', async () => {
        const text = row.querySelector('.task-text').value;
        const priority = row.querySelector('.task-priority').value;
        const due_date = row.querySelector('.task-due').value || null;
        await api.updatePlatoonTask(supabase, id, { text, priority, due_date });
        await refreshPriority();
      });
      row.querySelector('.task-delete').addEventListener('click', async () => {
        if (!confirm('Delete this task?')) return;
        await api.deletePlatoonTask(supabase, id);
        await Promise.all([renderTasksList(), refreshPriority()]);
      });
      row.querySelector('.task-completed').addEventListener('change', async (e) => {
        await api.updatePlatoonTask(supabase, id, { completed: e.target.checked });
        await Promise.all([renderTasksList(), refreshPriority()]);
      });
    });
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  await renderTasksList();
  openModal('#platoonTasksModal');
}

async function refreshAppointments() {
  const platoon = getSelectedPlatoon();
  const items = await api.getUpcomingAppointments(supabase, platoon, 10);
  renderUpcomingAppointments(items);
}

async function refreshPriority() {
  const platoon = getSelectedPlatoon();
  const items = await api.getPriorityItems(supabase, platoon);
  renderPriorityList(items);
}

function onTraineeClick(trainee) {
  const body = document.getElementById('traineeModalBody');
  body.innerHTML = `<div class="space-y-3">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-sm text-gray-600">Rank</label>
        <input data-field="rank" class="border rounded-md w-full px-3 py-2 text-sm" value="${trainee.rank || ''}">
      </div>
      <div>
        <label class="text-sm text-gray-600">Name</label>
        <input data-field="name" class="border rounded-md w-full px-3 py-2 text-sm" value="${trainee.name || ''}">
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-sm text-gray-600">Gender</label>
        <select data-field="gender" class="border rounded-md w-full px-3 py-2 text-sm">
          <option ${trainee.gender === 'Male' ? 'selected' : ''}>Male</option>
          <option ${trainee.gender === 'Female' ? 'selected' : ''}>Female</option>
          <option ${trainee.gender === 'Other' ? 'selected' : ''}>Other</option>
        </select>
      </div>
      <div>
        <label class="text-sm text-gray-600">Status</label>
        <select data-field="status" class="border rounded-md w-full px-3 py-2 text-sm">
          ${['Present','Sick Call','Profile','ACFT Fail','Rifle Unqualified','Other'].map(s=>`<option ${trainee.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div>
      <label class="text-sm text-gray-600">Location</label>
      <input data-field="location" class="border rounded-md w-full px-3 py-2 text-sm" value="${trainee.location || ''}">
    </div>
    <div class="flex items-center justify-between pt-2">
      <button id="deleteTraineeBtn" class="text-red-600 hover:underline">Delete Trainee</button>
      <span class="text-sm text-gray-500">Changes save automatically</span>
    </div>
  </div>`;

  document.getElementById('traineeModalTitle').textContent = `${trainee.rank || ''} ${trainee.name || ''}`.trim();

  body.querySelectorAll('input,select,textarea').forEach((el) => {
    el.addEventListener('change', async () => {
      const field = el.getAttribute('data-field');
      const value = el.value;
      await api.updateTraineeField(supabase, trainee.id, field, value);
      await refreshAll();
    });
  });

  body.querySelector('#deleteTraineeBtn').addEventListener('click', async () => {
    if (confirm('Permanently delete this trainee?')) {
      await api.deleteTrainee(supabase, trainee.id);
      closeModal('#traineeModal');
      await refreshAll();
    }
  });

  openModal('#traineeModal');
}

async function bootstrap() {
  setupEventHandlers();
  await refreshAll();
}

bootstrap();

