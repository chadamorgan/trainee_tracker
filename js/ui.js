export function renderStatusCards(statusCounts) {
  const container = document.getElementById('statusCards');
  const items = [
    { key: 'Present', label: 'Present', color: 'bg-green-50 border-green-200' },
    { key: 'Sick Call', label: 'Sick Call', color: 'bg-amber-50 border-amber-200' },
    { key: 'Profile', label: 'Profiles', color: 'bg-yellow-50 border-yellow-200' },
    { key: 'ACFT Fail', label: 'ACFT Fail', color: 'bg-rose-50 border-rose-200' },
    { key: 'Rifle Unqualified', label: 'Rifle Unqualified', color: 'bg-orange-50 border-orange-200' },
    { key: 'Male', label: 'Male', color: 'bg-blue-50 border-blue-200' },
    { key: 'Female', label: 'Female', color: 'bg-pink-50 border-pink-200' }
  ];
  container.innerHTML = items.map((x) => `
    <button data-filter="${x.key}" class="text-left border ${x.color} rounded-lg p-3 hover:bg-white">
      <div class="text-xs text-gray-500">${x.label}</div>
      <div class="text-xl font-semibold">${statusCounts[x.key] || 0}</div>
    </button>
  `).join('');
}

export function renderRoster(trainees, onClick) {
  const roster = document.getElementById('roster');
  roster.innerHTML = trainees.map((t) => `
    <button class="text-left border bg-white rounded-lg p-3 hover:shadow" data-id="${t.id}">
      <div class="flex items-center justify-between">
        <div class="font-medium">${t.rank || ''} ${t.name}</div>
        <span class="text-xs text-gray-500">${t.platoon}</span>
      </div>
      <div class="text-sm text-gray-600">${t.status || 'Present'}${t.location ? ' • ' + t.location : ''}</div>
      ${t.profile?.restriction ? `<div class="text-xs text-amber-700">Profile: ${t.profile.restriction}</div>` : ''}
      ${t.fitness?.acft_status ? `<div class="text-xs">ACFT: ${t.fitness.acft_status}</div>` : ''}
    </button>
  `).join('');

  roster.querySelectorAll('button[data-id]').forEach((el) => {
    el.addEventListener('click', () => {
      const trainee = trainees.find((t) => t.id === el.getAttribute('data-id'));
      onClick && onClick(trainee);
    });
  });
}

export function renderUpcomingAppointments(items) {
  const ul = document.getElementById('upcomingAppointments');
  if (!items || items.length === 0) {
    ul.innerHTML = '<li class="text-gray-500">No upcoming appointments</li>';
    return;
  }
  ul.innerHTML = items.map((a) => `
    <li class="flex items-start justify-between gap-3">
      <div>
        <div class="font-medium">${a.name}</div>
        <div class="text-xs text-gray-600">${a.date} ${a.time} • ${a.location}</div>
      </div>
      <span class="text-xs text-gray-500">${a.platoon}</span>
    </li>
  `).join('');
}

export function renderPriorityList(items) {
  const ul = document.getElementById('priorityList');
  if (!items || items.length === 0) {
    ul.innerHTML = '<li class="text-gray-500">No priority items</li>';
    return;
  }
  ul.innerHTML = items.map((p) => `
    <li class="border rounded-md p-2 ${priorityBorder(p.priority)}">
      <div class="flex items-center justify-between">
        <div class="font-medium">${p.text}</div>
        <span class="text-xs">${p.priority}${p.due_date ? ' • Due ' + p.due_date : ''}</span>
      </div>
      ${p.trainee ? `<div class="text-xs text-gray-600">${p.trainee}</div>` : ''}
    </li>
  `).join('');
}

function priorityBorder(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'high': return 'border-rose-300 bg-rose-50';
    case 'medium': return 'border-amber-300 bg-amber-50';
    case 'low': return 'border-emerald-300 bg-emerald-50';
    default: return 'border-gray-200 bg-white';
  }
}

