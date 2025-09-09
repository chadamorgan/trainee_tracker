function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

export async function getDashboardCounts(supabase, platoon) {
  try {
    let query = supabase
      .from('trainees')
      .select('id, status, gender');
    if (platoon && platoon !== 'All') query = query.eq('platoon', platoon);
    const { data, error } = await query;
    if (error) throw error;
    const total = data.length;
    const statusCounts = {
      'Present': 0,
      'Sick Call': 0,
      'Profile': 0,
      'ACFT Fail': 0,
      'Rifle Unqualified': 0,
      'Male': 0,
      'Female': 0,
    };
    for (const t of data) {
      const s = t.status || 'Present';
      if (statusCounts[s] !== undefined) statusCounts[s] += 1;
      const g = (t.gender || '').toLowerCase();
      if (g === 'male') statusCounts['Male'] += 1;
      if (g === 'female') statusCounts['Female'] += 1;
    }
    return { available: statusCounts['Present'], total, statusCounts };
  } catch (e) {
    console.error('getDashboardCounts error', e);
    return { available: 0, total: 0, statusCounts: {} };
  }
}

export async function searchTrainees(supabase, { platoon, query }) {
  try {
    let q = supabase
      .from('trainees')
      .select('id, name, platoon, rank, gender, status, location, profile, fitness, appointments, custom_notes, training_events')
      .order('name', { ascending: true });
    if (platoon && platoon !== 'All') q = q.eq('platoon', platoon);
    if (query && query.trim().length > 0) {
      const term = query.trim();
      const escaped = term.replace(/%/g, '\\%').replace(/_/g, '\\_');
      q = q.or(`name.ilike.%${escaped}%,rank.ilike.%${escaped}%`);
    }
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('searchTrainees error', e);
    return [];
  }
}

export async function getUpcomingAppointments(supabase, platoon, days = 10) {
  try {
    let q = supabase.from('trainees').select('name, platoon, appointments');
    if (platoon && platoon !== 'All') q = q.eq('platoon', platoon);
    const { data, error } = await q;
    if (error) throw error;
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + days);
    const items = [];
    for (const t of data || []) {
      const appts = safeArray(t.appointments);
      for (const a of appts) {
        if (!a || !a.date) continue;
        const dateStr = a.date;
        const timeStr = a.time || '00:00';
        const dt = new Date(`${dateStr}T${timeStr}`);
        if (isNaN(dt.getTime())) continue;
        if (dt >= now && dt <= end) {
          items.push({
            name: t.name,
            platoon: t.platoon,
            date: dateStr,
            time: timeStr,
            location: a.location || '',
            description: a.description || ''
          });
        }
      }
    }
    items.sort((a, b) => (a.date + ' ' + a.time).localeCompare(b.date + ' ' + b.time));
    return items;
  } catch (e) {
    console.error('getUpcomingAppointments error', e);
    return [];
  }
}

export async function getPriorityItems(supabase, platoon) {
  try {
    const [traineesRes, tasksRes] = await Promise.all([
      (async () => {
        let q = supabase.from('trainees').select('name, platoon, custom_notes');
        if (platoon && platoon !== 'All') q = q.eq('platoon', platoon);
        return q;
      })(),
      supabase.from('platoon_tasks').select('*').eq('completed', false)
    ]);
    if (traineesRes.error) throw traineesRes.error;
    if (tasksRes.error) throw tasksRes.error;

    const traineeNotes = [];
    for (const t of traineesRes.data || []) {
      const notes = safeArray(t.custom_notes);
      for (const n of notes) {
        if (!n || !n.text) continue;
        traineeNotes.push({
          text: n.text,
          priority: n.priority || 'Medium',
          due_date: n.due_date || null,
          trainee: t.name
        });
      }
    }

    const tasks = (tasksRes.data || []).map((x) => ({
      text: x.text,
      priority: x.priority || 'Medium',
      due_date: x.due_date || null,
      trainee: null
    }));

    const items = [...traineeNotes, ...tasks];
    items.sort((a, b) => {
      const pr = (p) => ({ high: 0, medium: 1, low: 2 }[(p || '').toLowerCase()] ?? 3);
      const pa = pr(a.priority), pb = pr(b.priority);
      if (pa !== pb) return pa - pb;
      const da = a.due_date || '9999-12-31';
      const db = b.due_date || '9999-12-31';
      return da.localeCompare(db);
    });
    return items;
  } catch (e) {
    console.error('getPriorityItems error', e);
    return [];
  }
}

export async function updateTraineeField(supabase, id, field, value) {
  try {
    const update = { [field]: value, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('trainees').update(update).eq('id', id);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('updateTraineeField error', e);
    return false;
  }
}

export async function deleteTrainee(supabase, id) {
  try {
    const { error } = await supabase.from('trainees').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('deleteTrainee error', e);
    return false;
  }
}

export async function bulkCreateTrainees(supabase, trainees) {
  if (!Array.isArray(trainees) || trainees.length === 0) return { ok: true };
  try {
    const payload = trainees.map((t) => ({
      name: t.name,
      platoon: t.platoon,
      rank: t.rank || null,
      gender: t.gender || null,
      status: t.status || 'Present',
      location: t.location || null
    }));
    const { error } = await supabase.from('trainees').insert(payload);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('bulkCreateTrainees error', e);
    return { ok: false, error: e };
  }
}

export async function listPlatoonTasks(supabase) {
  try {
    const { data, error } = await supabase
      .from('platoon_tasks')
      .select('*')
      .order('completed', { ascending: true })
      .order('priority', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('listPlatoonTasks error', e);
    return [];
  }
}

export async function createPlatoonTask(supabase, task) {
  try {
    const { error } = await supabase.from('platoon_tasks').insert({
      text: task.text,
      priority: task.priority || 'Medium',
      due_date: task.due_date || null
    });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('createPlatoonTask error', e);
    return false;
  }
}

export async function updatePlatoonTask(supabase, id, fields) {
  try {
    const { error } = await supabase.from('platoon_tasks').update(fields).eq('id', id);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('updatePlatoonTask error', e);
    return false;
  }
}

export async function deletePlatoonTask(supabase, id) {
  try {
    const { error } = await supabase.from('platoon_tasks').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('deletePlatoonTask error', e);
    return false;
  }
}

