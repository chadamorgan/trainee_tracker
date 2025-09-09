// Trainee management module
class TraineeManager {
    constructor() {
        this.trainees = [];
        this.currentFilter = null;
        this.searchTerm = '';
    }

    async loadTrainees(platoon = null) {
        this.trainees = await db.getTrainees(platoon);
        this.renderRoster();
        this.updateDashboard();
    }

    renderRoster() {
        const container = document.getElementById('rosterContainer');
        if (!container) return;

        const filteredTrainees = this.getFilteredTrainees();
        
        if (filteredTrainees.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No trainees found</div>';
            return;
        }

        container.innerHTML = filteredTrainees.map(trainee => this.createTraineeCard(trainee)).join('');
    }

    createTraineeCard(trainee) {
        const statusColor = this.getStatusColor(trainee.status);
        const profileRestriction = trainee.profile?.restriction || 'None';
        const acftStatus = trainee.fitness?.acft_pass ? 'Pass' : 'Fail';
        const rifleStatus = trainee.fitness?.rifle_qualified ? 'Qualified' : 'Unqualified';
        
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer trainee-card" 
                 data-trainee-id="${trainee.id}">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-semibold text-gray-800">${trainee.rank || ''} ${trainee.name}</h3>
                    <span class="px-2 py-1 text-xs rounded-full ${statusColor}">${trainee.status}</span>
                </div>
                <div class="text-sm text-gray-600 space-y-1">
                    <div><i class="fas fa-venus-mars mr-1"></i> ${trainee.gender || 'N/A'}</div>
                    <div><i class="fas fa-map-marker-alt mr-1"></i> ${trainee.location || 'N/A'}</div>
                    <div><i class="fas fa-user-md mr-1"></i> Profile: ${profileRestriction}</div>
                    <div><i class="fas fa-dumbbell mr-1"></i> ACFT: ${acftStatus}</div>
                    <div><i class="fas fa-crosshairs mr-1"></i> Rifle: ${rifleStatus}</div>
                </div>
                <div class="mt-3 flex justify-between items-center">
                    <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="traineeManager.openTraineeDialog('${trainee.id}')">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button class="text-red-600 hover:text-red-800 text-sm" onclick="traineeManager.deleteTrainee('${trainee.id}')">
                        <i class="fas fa-trash mr-1"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    getStatusColor(status) {
        const colors = {
            'Present': 'bg-green-100 text-green-800',
            'Sick Call': 'bg-red-100 text-red-800',
            'Profiles': 'bg-yellow-100 text-yellow-800',
            'ACFT Fail': 'bg-orange-100 text-orange-800',
            'Rifle Unqualified': 'bg-purple-100 text-purple-800',
            'AWOL': 'bg-red-100 text-red-800',
            'Medical Hold': 'bg-yellow-100 text-yellow-800',
            'Recycle': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getFilteredTrainees() {
        let filtered = this.trainees;

        // Apply status filter
        if (this.currentFilter) {
            if (this.currentFilter.type === 'status') {
                filtered = filtered.filter(t => t.status === this.currentFilter.value);
            } else if (this.currentFilter.type === 'gender') {
                filtered = filtered.filter(t => t.gender === this.currentFilter.value);
            }
        }

        // Apply search filter
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(t => 
                t.name.toLowerCase().includes(term) ||
                (t.rank && t.rank.toLowerCase().includes(term)) ||
                (t.location && t.location.toLowerCase().includes(term))
            );
        }

        return filtered;
    }

    updateDashboard() {
        this.updateAvailabilityCounter();
        this.updateAccountabilityCards();
        this.updateUpcomingAppointments();
        this.updatePriorityList();
    }

    updateAvailabilityCounter() {
        const counter = document.getElementById('availabilityCounter');
        if (!counter) return;

        const present = this.trainees.filter(t => t.status === 'Present').length;
        const total = this.trainees.length;
        counter.textContent = `${present} / ${total}`;
    }

    updateAccountabilityCards() {
        const statusCounts = {};
        const genderCounts = { Male: 0, Female: 0 };

        // Initialize status counts
        CONFIG.STATUS_OPTIONS.forEach(status => {
            statusCounts[status] = 0;
        });

        // Count trainees by status and gender
        this.trainees.forEach(trainee => {
            if (statusCounts.hasOwnProperty(trainee.status)) {
                statusCounts[trainee.status]++;
            }
            if (trainee.gender && genderCounts.hasOwnProperty(trainee.gender)) {
                genderCounts[trainee.gender]++;
            }
        });

        // Update status cards
        Object.keys(statusCounts).forEach(status => {
            const element = document.getElementById(`${status.toLowerCase().replace(/\s+/g, '')}Count`);
            if (element) {
                element.textContent = statusCounts[status];
            }
        });

        // Update gender cards
        Object.keys(genderCounts).forEach(gender => {
            const element = document.getElementById(`${gender.toLowerCase()}Count`);
            if (element) {
                element.textContent = genderCounts[gender];
            }
        });
    }

    updateUpcomingAppointments() {
        const container = document.getElementById('upcomingAppointments');
        if (!container) return;

        const now = new Date();
        const tenDaysFromNow = new Date(now.getTime() + (10 * 24 * 60 * 60 * 1000));

        const upcomingAppointments = [];
        this.trainees.forEach(trainee => {
            if (trainee.appointments) {
                trainee.appointments.forEach(appointment => {
                    const appointmentDate = new Date(appointment.date);
                    if (appointmentDate >= now && appointmentDate <= tenDaysFromNow) {
                        upcomingAppointments.push({
                            ...appointment,
                            traineeName: trainee.name,
                            traineeRank: trainee.rank
                        });
                    }
                });
            }
        });

        upcomingAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcomingAppointments.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No appointments scheduled</p>';
            return;
        }

        container.innerHTML = upcomingAppointments.map(apt => `
            <div class="text-sm border-l-2 border-blue-500 pl-2">
                <div class="font-medium">${apt.traineeRank || ''} ${apt.traineeName}</div>
                <div class="text-gray-600">${new Date(apt.date).toLocaleDateString()} at ${apt.time}</div>
                <div class="text-gray-500">${apt.description || 'No description'}</div>
            </div>
        `).join('');
    }

    updatePriorityList() {
        const container = document.getElementById('priorityList');
        if (!container) return;

        const priorityItems = [];

        // Add trainee-specific notes
        this.trainees.forEach(trainee => {
            if (trainee.custom_notes) {
                trainee.custom_notes.forEach(note => {
                    if (note.priority) {
                        priorityItems.push({
                            ...note,
                            traineeName: trainee.name,
                            traineeRank: trainee.rank,
                            type: 'trainee'
                        });
                    }
                });
            }
        });

        // Add platoon tasks (will be loaded separately)
        // This will be updated when tasks are loaded

        if (priorityItems.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No priority items</p>';
            return;
        }

        // Sort by priority and due date
        priorityItems.sort((a, b) => {
            const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            const aPriority = priorityOrder[a.priority] || 0;
            const bPriority = priorityOrder[b.priority] || 0;
            
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }
            
            if (a.due_date && b.due_date) {
                return new Date(a.due_date) - new Date(b.due_date);
            }
            
            return 0;
        });

        container.innerHTML = priorityItems.map(item => `
            <div class="text-sm border-l-2 ${this.getPriorityColor(item.priority)} pl-2">
                <div class="font-medium">${item.traineeRank || ''} ${item.traineeName}</div>
                <div class="text-gray-600">${item.text || item.note}</div>
                <div class="text-gray-500 text-xs">${item.priority} Priority</div>
            </div>
        `).join('');
    }

    getPriorityColor(priority) {
        const colors = {
            'High': 'border-red-500',
            'Medium': 'border-yellow-500',
            'Low': 'border-green-500'
        };
        return colors[priority] || 'border-gray-500';
    }

    async openTraineeDialog(traineeId = null) {
        const trainee = traineeId ? this.trainees.find(t => t.id === traineeId) : null;
        const modal = this.createTraineeModal(trainee);
        
        document.getElementById('modalContainer').innerHTML = modal;
        document.getElementById('traineeModal').classList.remove('hidden');
        
        if (trainee) {
            this.populateTraineeForm(trainee);
        }
    }

    createTraineeModal(trainee) {
        return `
            <div id="traineeModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center p-6 border-b">
                            <h2 class="text-2xl font-bold text-gray-800">
                                ${trainee ? 'Edit Trainee' : 'Add New Trainee'}
                            </h2>
                            <button onclick="traineeManager.closeTraineeDialog()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <form id="traineeForm" class="p-6 space-y-6">
                            <!-- Personal Information -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Rank</label>
                                    <select name="rank" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                        <option value="">Select Rank</option>
                                        ${CONFIG.RANK_OPTIONS.map(rank => `<option value="${rank}">${rank}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input type="text" name="name" required class="w-full border border-gray-300 rounded-md px-3 py-2">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select name="gender" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                        <option value="">Select Gender</option>
                                        ${CONFIG.GENDER_OPTIONS.map(gender => `<option value="${gender}">${gender}</option>`).join('')}
                                    </select>
                                </div>
                            </div>

                            <!-- Accountability -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                        ${CONFIG.STATUS_OPTIONS.map(status => `<option value="${status}">${status}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input type="text" name="location" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                </div>
                            </div>

                            <!-- Training & Fitness -->
                            <div class="border-t pt-6">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Training & Fitness</h3>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">ACFT Score</label>
                                        <select name="acft_pass" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                            <option value="">Select Status</option>
                                            <option value="true">Pass</option>
                                            <option value="false">Fail</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Rifle Qualification</label>
                                        <select name="rifle_qualified" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                            <option value="">Select Status</option>
                                            <option value="true">Qualified</option>
                                            <option value="false">Unqualified</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Run Time (minutes)</label>
                                        <input type="number" name="run_time" step="0.1" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                    </div>
                                </div>
                            </div>

                            <!-- Medical -->
                            <div class="border-t pt-6">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Medical</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Profile Restriction</label>
                                        <input type="text" name="profile_restriction" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Profile End Date</label>
                                        <input type="date" name="profile_end_date" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                    </div>
                                </div>
                            </div>

                            <!-- Appointments -->
                            <div class="border-t pt-6">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Appointments</h3>
                                <div id="appointmentsList" class="space-y-2 mb-4">
                                    <!-- Appointments will be dynamically added here -->
                                </div>
                                <button type="button" onclick="traineeManager.addAppointment()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                                    <i class="fas fa-plus mr-1"></i> Add Appointment
                                </button>
                            </div>

                            <!-- Custom Notes -->
                            <div class="border-t pt-6">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Custom Notes</h3>
                                <div id="notesList" class="space-y-2 mb-4">
                                    <!-- Notes will be dynamically added here -->
                                </div>
                                <button type="button" onclick="traineeManager.addNote()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                                    <i class="fas fa-plus mr-1"></i> Add Note
                                </button>
                            </div>

                            <!-- Form Actions -->
                            <div class="border-t pt-6 flex justify-end space-x-4">
                                <button type="button" onclick="traineeManager.closeTraineeDialog()" class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                                    ${trainee ? 'Update Trainee' : 'Add Trainee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    populateTraineeForm(trainee) {
        const form = document.getElementById('traineeForm');
        if (!form) return;

        // Populate basic fields
        form.name.value = trainee.name || '';
        form.rank.value = trainee.rank || '';
        form.gender.value = trainee.gender || '';
        form.status.value = trainee.status || CONFIG.DEFAULT_STATUS;
        form.location.value = trainee.location || '';

        // Populate fitness fields
        if (trainee.fitness) {
            form.acft_pass.value = trainee.fitness.acft_pass !== undefined ? trainee.fitness.acft_pass.toString() : '';
            form.rifle_qualified.value = trainee.fitness.rifle_qualified !== undefined ? trainee.fitness.rifle_qualified.toString() : '';
            form.run_time.value = trainee.fitness.run_time || '';
        }

        // Populate medical fields
        if (trainee.profile) {
            form.profile_restriction.value = trainee.profile.restriction || '';
            form.profile_end_date.value = trainee.profile.end_date || '';
        }

        // Populate appointments
        this.renderAppointments(trainee.appointments || []);
        
        // Populate notes
        this.renderNotes(trainee.custom_notes || []);
    }

    renderAppointments(appointments) {
        const container = document.getElementById('appointmentsList');
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No appointments scheduled</p>';
            return;
        }

        container.innerHTML = appointments.map((apt, index) => `
            <div class="border border-gray-200 rounded-md p-3">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input type="date" name="appointment_date_${index}" value="${apt.date || ''}" class="border border-gray-300 rounded px-2 py-1">
                    <input type="time" name="appointment_time_${index}" value="${apt.time || ''}" class="border border-gray-300 rounded px-2 py-1">
                    <input type="text" name="appointment_location_${index}" value="${apt.location || ''}" placeholder="Location" class="border border-gray-300 rounded px-2 py-1">
                    <div class="flex space-x-2">
                        <input type="text" name="appointment_description_${index}" value="${apt.description || ''}" placeholder="Description" class="border border-gray-300 rounded px-2 py-1 flex-1">
                        <button type="button" onclick="traineeManager.removeAppointment(${index})" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderNotes(notes) {
        const container = document.getElementById('notesList');
        if (!container) return;

        if (notes.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No notes added</p>';
            return;
        }

        container.innerHTML = notes.map((note, index) => `
            <div class="border border-gray-200 rounded-md p-3">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select name="note_priority_${index}" class="border border-gray-300 rounded px-2 py-1">
                        <option value="">Priority</option>
                        ${CONFIG.PRIORITY_LEVELS.map(priority => 
                            `<option value="${priority}" ${note.priority === priority ? 'selected' : ''}>${priority}</option>`
                        ).join('')}
                    </select>
                    <input type="date" name="note_due_date_${index}" value="${note.due_date || ''}" class="border border-gray-300 rounded px-2 py-1">
                    <div class="flex space-x-2">
                        <input type="text" name="note_text_${index}" value="${note.text || note.note || ''}" placeholder="Note text" class="border border-gray-300 rounded px-2 py-1 flex-1">
                        <button type="button" onclick="traineeManager.removeNote(${index})" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    addAppointment() {
        const container = document.getElementById('appointmentsList');
        if (!container) return;

        const currentAppointments = container.querySelectorAll('.border.border-gray-200.rounded-md.p-3').length;
        const appointmentHtml = `
            <div class="border border-gray-200 rounded-md p-3">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input type="date" name="appointment_date_${currentAppointments}" class="border border-gray-300 rounded px-2 py-1">
                    <input type="time" name="appointment_time_${currentAppointments}" class="border border-gray-300 rounded px-2 py-1">
                    <input type="text" name="appointment_location_${currentAppointments}" placeholder="Location" class="border border-gray-300 rounded px-2 py-1">
                    <div class="flex space-x-2">
                        <input type="text" name="appointment_description_${currentAppointments}" placeholder="Description" class="border border-gray-300 rounded px-2 py-1 flex-1">
                        <button type="button" onclick="traineeManager.removeAppointment(${currentAppointments})" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (container.innerHTML.includes('No appointments scheduled')) {
            container.innerHTML = appointmentHtml;
        } else {
            container.insertAdjacentHTML('beforeend', appointmentHtml);
        }
    }

    addNote() {
        const container = document.getElementById('notesList');
        if (!container) return;

        const currentNotes = container.querySelectorAll('.border.border-gray-200.rounded-md.p-3').length;
        const noteHtml = `
            <div class="border border-gray-200 rounded-md p-3">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select name="note_priority_${currentNotes}" class="border border-gray-300 rounded px-2 py-1">
                        <option value="">Priority</option>
                        ${CONFIG.PRIORITY_LEVELS.map(priority => `<option value="${priority}">${priority}</option>`).join('')}
                    </select>
                    <input type="date" name="note_due_date_${currentNotes}" class="border border-gray-300 rounded px-2 py-1">
                    <div class="flex space-x-2">
                        <input type="text" name="note_text_${currentNotes}" placeholder="Note text" class="border border-gray-300 rounded px-2 py-1 flex-1">
                        <button type="button" onclick="traineeManager.removeNote(${currentNotes})" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (container.innerHTML.includes('No notes added')) {
            container.innerHTML = noteHtml;
        } else {
            container.insertAdjacentHTML('beforeend', noteHtml);
        }
    }

    removeAppointment(index) {
        const container = document.getElementById('appointmentsList');
        if (!container) return;

        const appointments = container.querySelectorAll('.border.border-gray-200.rounded-md.p-3');
        if (appointments[index]) {
            appointments[index].remove();
        }

        if (container.children.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No appointments scheduled</p>';
        }
    }

    removeNote(index) {
        const container = document.getElementById('notesList');
        if (!container) return;

        const notes = container.querySelectorAll('.border.border-gray-200.rounded-md.p-3');
        if (notes[index]) {
            notes[index].remove();
        }

        if (container.children.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No notes added</p>';
        }
    }

    async saveTrainee(formData) {
        const traineeData = {
            name: formData.get('name'),
            rank: formData.get('rank'),
            gender: formData.get('gender'),
            status: formData.get('status') || CONFIG.DEFAULT_STATUS,
            location: formData.get('location'),
            platoon: document.getElementById('platoonSelect').value || CONFIG.DEFAULT_PLATOON,
            fitness: {
                acft_pass: formData.get('acft_pass') === 'true',
                rifle_qualified: formData.get('rifle_qualified') === 'true',
                run_time: parseFloat(formData.get('run_time')) || null
            },
            profile: {
                restriction: formData.get('profile_restriction'),
                end_date: formData.get('profile_end_date')
            },
            appointments: this.collectAppointments(formData),
            custom_notes: this.collectNotes(formData)
        };

        // Remove empty values
        Object.keys(traineeData).forEach(key => {
            if (traineeData[key] === '' || traineeData[key] === null) {
                delete traineeData[key];
            }
        });

        const traineeId = formData.get('trainee_id');
        let result;

        if (traineeId) {
            result = await db.updateTrainee(traineeId, traineeData);
        } else {
            result = await db.addTrainee(traineeData);
        }

        if (result) {
            await this.loadTrainees(document.getElementById('platoonSelect').value);
            this.closeTraineeDialog();
        }
    }

    collectAppointments(formData) {
        const appointments = [];
        let index = 0;

        while (formData.has(`appointment_date_${index}`)) {
            const date = formData.get(`appointment_date_${index}`);
            const time = formData.get(`appointment_time_${index}`);
            const location = formData.get(`appointment_location_${index}`);
            const description = formData.get(`appointment_description_${index}`);

            if (date) {
                appointments.push({
                    date,
                    time,
                    location,
                    description
                });
            }
            index++;
        }

        return appointments;
    }

    collectNotes(formData) {
        const notes = [];
        let index = 0;

        while (formData.has(`note_text_${index}`)) {
            const text = formData.get(`note_text_${index}`);
            const priority = formData.get(`note_priority_${index}`);
            const due_date = formData.get(`note_due_date_${index}`);

            if (text) {
                notes.push({
                    text,
                    priority,
                    due_date
                });
            }
            index++;
        }

        return notes;
    }

    closeTraineeDialog() {
        const modal = document.getElementById('traineeModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        document.getElementById('modalContainer').innerHTML = '';
    }

    async deleteTrainee(traineeId) {
        if (confirm('Are you sure you want to delete this trainee? This action cannot be undone.')) {
            const success = await db.deleteTrainee(traineeId);
            if (success) {
                await this.loadTrainees(document.getElementById('platoonSelect').value);
            }
        }
    }

    // Filter methods
    filterByStatus(status) {
        this.currentFilter = { type: 'status', value: status };
        this.renderRoster();
    }

    filterByGender(gender) {
        this.currentFilter = { type: 'gender', value: gender };
        this.renderRoster();
    }

    clearFilter() {
        this.currentFilter = null;
        this.renderRoster();
    }

    setSearchTerm(term) {
        this.searchTerm = term;
        this.renderRoster();
    }

    // Bulk upload
    async bulkUploadTrainees(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        const trainees = [];

        for (const line of lines) {
            const [rank, name, gender, platoon] = line.split(',').map(item => item.trim());
            if (name) {
                trainees.push({
                    rank: rank || '',
                    name,
                    gender: gender || '',
                    platoon: platoon || document.getElementById('platoonSelect').value || CONFIG.DEFAULT_PLATOON,
                    status: CONFIG.DEFAULT_STATUS
                });
            }
        }

        for (const trainee of trainees) {
            await db.addTrainee(trainee);
        }

        await this.loadTrainees(document.getElementById('platoonSelect').value);
    }
}

// Create global trainee manager instance
const traineeManager = new TraineeManager();