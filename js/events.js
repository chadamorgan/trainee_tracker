// Training events management module
class EventsManager {
    constructor() {
        this.events = [];
        this.trainees = [];
    }

    async loadEvents() {
        this.events = await db.getTrainingEvents();
        this.trainees = await db.getTrainees();
    }

    async openEventsDialog() {
        await this.loadEvents();
        const modal = this.createEventsModal();
        
        document.getElementById('modalContainer').innerHTML = modal;
        document.getElementById('eventsModal').classList.remove('hidden');
        
        this.renderEventsList();
    }

    createEventsModal() {
        return `
            <div id="eventsModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center p-6 border-b">
                            <h2 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-tasks mr-2 text-blue-600"></i>
                                Training Events Management
                            </h2>
                            <button onclick="eventsManager.closeEventsDialog()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div class="p-6">
                            <!-- Add New Event -->
                            <div class="mb-6">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Add New Training Event</h3>
                                <div class="flex space-x-4">
                                    <input type="text" id="newEventName" placeholder="Event name (e.g., Weapons Qualification)" 
                                           class="flex-1 border border-gray-300 rounded-md px-3 py-2">
                                    <button onclick="eventsManager.addEvent()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                                        <i class="fas fa-plus mr-1"></i> Add Event
                                    </button>
                                </div>
                            </div>

                            <!-- Events List -->
                            <div class="mb-6">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Training Events</h3>
                                <div id="eventsList" class="space-y-4">
                                    <!-- Events will be dynamically rendered here -->
                                </div>
                            </div>

                            <!-- Event Management -->
                            <div id="eventManagement" class="hidden">
                                <div class="border-t pt-6">
                                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                        Manage: <span id="selectedEventName"></span>
                                    </h3>
                                    
                                    <!-- Trainee Selection -->
                                    <div class="mb-4">
                                        <h4 class="font-medium text-gray-700 mb-2">Mark Trainees as Completed</h4>
                                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4">
                                            <!-- Trainee checkboxes will be dynamically added here -->
                                        </div>
                                    </div>

                                    <!-- Bulk Actions -->
                                    <div class="flex space-x-4 mb-4">
                                        <button onclick="eventsManager.selectAllTrainees()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                                            <i class="fas fa-check-double mr-1"></i> Select All
                                        </button>
                                        <button onclick="eventsManager.deselectAllTrainees()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm">
                                            <i class="fas fa-times mr-1"></i> Deselect All
                                        </button>
                                        <button onclick="eventsManager.saveEventProgress()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                                            <i class="fas fa-save mr-1"></i> Save Progress
                                        </button>
                                    </div>

                                    <!-- Progress Summary -->
                                    <div class="bg-gray-50 rounded-md p-4">
                                        <h4 class="font-medium text-gray-700 mb-2">Progress Summary</h4>
                                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span class="text-gray-600">Total Trainees:</span>
                                                <span id="totalTrainees" class="font-medium ml-1">0</span>
                                            </div>
                                            <div>
                                                <span class="text-gray-600">Completed:</span>
                                                <span id="completedTrainees" class="font-medium ml-1 text-green-600">0</span>
                                            </div>
                                            <div>
                                                <span class="text-gray-600">Remaining:</span>
                                                <span id="remainingTrainees" class="font-medium ml-1 text-red-600">0</span>
                                            </div>
                                            <div>
                                                <span class="text-gray-600">Progress:</span>
                                                <span id="progressPercentage" class="font-medium ml-1">0%</span>
                                            </div>
                                        </div>
                                        <div class="mt-2">
                                            <div class="w-full bg-gray-200 rounded-full h-2">
                                                <div id="progressBar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEventsList() {
        const container = document.getElementById('eventsList');
        if (!container) return;

        if (this.events.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No training events created yet</p>';
            return;
        }

        container.innerHTML = this.events.map(event => `
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800">${event.name}</h4>
                        <p class="text-sm text-gray-600">Created: ${new Date(event.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="eventsManager.manageEvent('${event.id}', '${event.name}')" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                            <i class="fas fa-cog mr-1"></i> Manage
                        </button>
                        <button onclick="eventsManager.deleteEvent('${event.id}')" 
                                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                            <i class="fas fa-trash mr-1"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async addEvent() {
        const nameInput = document.getElementById('newEventName');
        const name = nameInput.value.trim();

        if (!name) {
            alert('Please enter an event name');
            return;
        }

        const event = await db.addTrainingEvent(name);
        if (event) {
            nameInput.value = '';
            await this.loadEvents();
            this.renderEventsList();
        }
    }

    async deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this training event? This action cannot be undone.')) {
            // Note: In a real implementation, you would need to add a deleteTrainingEvent method to the database class
            // For now, we'll just remove it from the local array
            this.events = this.events.filter(e => e.id !== eventId);
            this.renderEventsList();
        }
    }

    async manageEvent(eventId, eventName) {
        this.selectedEventId = eventId;
        document.getElementById('selectedEventName').textContent = eventName;
        document.getElementById('eventManagement').classList.remove('hidden');
        
        await this.renderTraineeCheckboxes();
        this.updateProgressSummary();
    }

    async renderTraineeCheckboxes() {
        const container = document.getElementById('eventManagement').querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-2');
        if (!container) return;

        const platoon = document.getElementById('platoonSelect').value;
        const platoonTrainees = platoon ? this.trainees.filter(t => t.platoon === platoon) : this.trainees;

        container.innerHTML = platoonTrainees.map(trainee => {
            const isCompleted = this.isTraineeCompletedForEvent(trainee, this.selectedEventId);
            return `
                <label class="flex items-center space-x-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" 
                           class="trainee-checkbox rounded" 
                           data-trainee-id="${trainee.id}"
                           ${isCompleted ? 'checked' : ''}>
                    <span class="text-sm">
                        <span class="font-medium">${trainee.rank || ''} ${trainee.name}</span>
                        <span class="text-gray-500 block">${trainee.platoon}</span>
                    </span>
                </label>
            `;
        }).join('');
    }

    isTraineeCompletedForEvent(trainee, eventId) {
        if (!trainee.training_events) return false;
        return trainee.training_events.some(te => te.event_id === eventId && te.completed);
    }

    selectAllTrainees() {
        const checkboxes = document.querySelectorAll('.trainee-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        this.updateProgressSummary();
    }

    deselectAllTrainees() {
        const checkboxes = document.querySelectorAll('.trainee-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateProgressSummary();
    }

    updateProgressSummary() {
        const checkboxes = document.querySelectorAll('.trainee-checkbox');
        const total = checkboxes.length;
        const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
        const remaining = total - completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('totalTrainees').textContent = total;
        document.getElementById('completedTrainees').textContent = completed;
        document.getElementById('remainingTrainees').textContent = remaining;
        document.getElementById('progressPercentage').textContent = `${percentage}%`;
        
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }

    async saveEventProgress() {
        const checkboxes = document.querySelectorAll('.trainee-checkbox');
        const updates = [];

        for (const checkbox of checkboxes) {
            const traineeId = checkbox.dataset.traineeId;
            const isCompleted = checkbox.checked;
            
            // Find the trainee
            const trainee = this.trainees.find(t => t.id === traineeId);
            if (!trainee) continue;

            // Update training events
            let trainingEvents = trainee.training_events || [];
            const existingEvent = trainingEvents.find(te => te.event_id === this.selectedEventId);
            
            if (existingEvent) {
                existingEvent.completed = isCompleted;
                existingEvent.updated_at = new Date().toISOString();
            } else {
                trainingEvents.push({
                    event_id: this.selectedEventId,
                    completed: isCompleted,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }

            updates.push({
                id: traineeId,
                training_events: trainingEvents
            });
        }

        // Save all updates
        for (const update of updates) {
            await db.updateTrainee(update.id, { training_events: update.training_events });
        }

        // Reload trainees and update display
        await this.loadEvents();
        await this.renderTraineeCheckboxes();
        this.updateProgressSummary();

        // Show success message
        alert('Event progress saved successfully!');
    }

    closeEventsDialog() {
        const modal = document.getElementById('eventsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        document.getElementById('modalContainer').innerHTML = '';
    }

    // Get completion statistics for dashboard
    getEventCompletionStats() {
        const stats = {};
        
        this.events.forEach(event => {
            const platoon = document.getElementById('platoonSelect').value;
            const platoonTrainees = platoon ? this.trainees.filter(t => t.platoon === platoon) : this.trainees;
            
            const completed = platoonTrainees.filter(trainee => 
                this.isTraineeCompletedForEvent(trainee, event.id)
            ).length;
            
            stats[event.id] = {
                name: event.name,
                completed,
                total: platoonTrainees.length,
                percentage: platoonTrainees.length > 0 ? Math.round((completed / platoonTrainees.length) * 100) : 0
            };
        });
        
        return stats;
    }
}

// Create global events manager instance
const eventsManager = new EventsManager();