// Main application file
class DrillSergeantApp {
    constructor() {
        this.currentPlatoon = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            // Initialize database
            const dbInitialized = await db.initialize();
            if (!dbInitialized) {
                console.error('Failed to initialize database');
                this.showError('Failed to connect to database. Please check your configuration.');
                return false;
            }

            // Set up event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadInitialData();

            this.initialized = true;
            console.log('Application initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
            return false;
        }
    }

    setupEventListeners() {
        // Platoon selection
        const platoonSelect = document.getElementById('platoonSelect');
        if (platoonSelect) {
            platoonSelect.addEventListener('change', (e) => {
                this.currentPlatoon = e.target.value;
                this.loadPlatoonData();
            });
        }

        // Add trainee button
        const addTraineeBtn = document.getElementById('addTraineeBtn');
        if (addTraineeBtn) {
            addTraineeBtn.addEventListener('click', () => {
                traineeManager.openTraineeDialog();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                traineeManager.setSearchTerm(e.target.value);
            });
        }

        // Bulk upload button
        const bulkUploadBtn = document.getElementById('bulkUploadBtn');
        if (bulkUploadBtn) {
            bulkUploadBtn.addEventListener('click', () => {
                this.openBulkUploadDialog();
            });
        }

        // Events management button
        const manageEventsBtn = document.getElementById('manageEventsBtn');
        if (manageEventsBtn) {
            manageEventsBtn.addEventListener('click', () => {
                eventsManager.openEventsDialog();
            });
        }

        // Tasks management button
        const manageTasksBtn = document.getElementById('manageTasksBtn');
        if (manageTasksBtn) {
            manageTasksBtn.addEventListener('click', () => {
                tasksManager.openTasksDialog();
            });
        }

        // Accountability cards
        const accountabilityCards = document.querySelectorAll('.accountability-card');
        accountabilityCards.forEach(card => {
            card.addEventListener('click', () => {
                const status = card.dataset.status;
                const gender = card.dataset.gender;
                
                if (status) {
                    traineeManager.filterByStatus(status);
                } else if (gender) {
                    traineeManager.filterByGender(gender);
                }
            });
        });

        // Task form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'taskForm') {
                e.preventDefault();
                const formData = new FormData(e.target);
                tasksManager.addTask(formData);
            } else if (e.target.id === 'traineeForm') {
                e.preventDefault();
                const formData = new FormData(e.target);
                traineeManager.saveTrainee(formData);
            }
        });

        // Task filters
        document.addEventListener('change', (e) => {
            if (e.target.id === 'priorityFilter' || e.target.id === 'statusFilter') {
                tasksManager.renderTasksList();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N for new trainee
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                traineeManager.openTraineeDialog();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    async loadInitialData() {
        // Set default platoon
        const platoonSelect = document.getElementById('platoonSelect');
        if (platoonSelect && platoonSelect.options.length > 1) {
            platoonSelect.value = CONFIG.DEFAULT_PLATOON;
            this.currentPlatoon = CONFIG.DEFAULT_PLATOON;
        }

        // Load platoon data
        await this.loadPlatoonData();
    }

    async loadPlatoonData() {
        const platoon = this.currentPlatoon || document.getElementById('platoonSelect').value;
        
        if (!platoon) {
            this.showMessage('Please select a platoon to view data', 'warning');
            return;
        }

        // Load trainees
        await traineeManager.loadTrainees(platoon);
        
        // Load and update tasks
        await tasksManager.updatePriorityList();
        
        // Update dashboard
        this.updateDashboard();
    }

    updateDashboard() {
        // Update availability counter
        traineeManager.updateAvailabilityCounter();
        
        // Update accountability cards
        traineeManager.updateAccountabilityCards();
        
        // Update upcoming appointments
        traineeManager.updateUpcomingAppointments();
        
        // Update priority list
        tasksManager.updatePriorityList();
    }

    openBulkUploadDialog() {
        const modal = `
            <div id="bulkUploadModal" class="fixed inset-0 bg-black bg-opacity-50 z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                        <div class="flex justify-between items-center p-6 border-b">
                            <h2 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-upload mr-2 text-gray-600"></i>
                                Bulk Upload Trainees
                            </h2>
                            <button onclick="drillSergeantApp.closeBulkUploadDialog()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div class="p-6">
                            <div class="mb-4">
                                <h3 class="text-lg font-semibold text-gray-800 mb-2">Upload Format</h3>
                                <p class="text-gray-600 mb-4">
                                    Enter trainee data in the following format (one per line):
                                </p>
                                <div class="bg-gray-100 p-4 rounded-md mb-4">
                                    <code class="text-sm">
                                        Rank, Name, Gender, Platoon<br>
                                        PVT, John Smith, Male, 1st Platoon<br>
                                        PFC, Jane Doe, Female, 1st Platoon<br>
                                        SPC, Bob Johnson, Male, 2nd Platoon
                                    </code>
                                </div>
                                <p class="text-sm text-gray-600">
                                    <strong>Note:</strong> Platoon is optional. If not specified, trainees will be added to the currently selected platoon.
                                </p>
                            </div>
                            
                            <div class="mb-6">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Trainee Data</label>
                                <textarea id="bulkUploadText" rows="10" 
                                          class="w-full border border-gray-300 rounded-md px-3 py-2"
                                          placeholder="Paste trainee data here..."></textarea>
                            </div>
                            
                            <div class="flex justify-end space-x-4">
                                <button onclick="drillSergeantApp.closeBulkUploadDialog()" 
                                        class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button onclick="drillSergeantApp.processBulkUpload()" 
                                        class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                                    <i class="fas fa-upload mr-1"></i> Upload Trainees
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').innerHTML = modal;
    }

    async processBulkUpload() {
        const textarea = document.getElementById('bulkUploadText');
        const csvText = textarea.value.trim();
        
        if (!csvText) {
            this.showMessage('Please enter trainee data', 'error');
            return;
        }

        try {
            await traineeManager.bulkUploadTrainees(csvText);
            this.closeBulkUploadDialog();
            this.showMessage('Trainees uploaded successfully!', 'success');
        } catch (error) {
            console.error('Bulk upload error:', error);
            this.showMessage('Error uploading trainees. Please check your data format.', 'error');
        }
    }

    closeBulkUploadDialog() {
        const modal = document.getElementById('bulkUploadModal');
        if (modal) {
            modal.remove();
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('[id$="Modal"]');
        modals.forEach(modal => modal.remove());
        document.getElementById('modalContainer').innerHTML = '';
    }

    showMessage(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        const bgColor = {
            'success': 'bg-green-500',
            'error': 'bg-red-500',
            'warning': 'bg-yellow-500',
            'info': 'bg-blue-500'
        }[type] || 'bg-blue-500';

        toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    // Utility methods
    formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString();
    }

    // Export data functionality
    async exportData() {
        try {
            const trainees = await db.getTrainees(this.currentPlatoon);
            const tasks = await db.getPlatoonTasks();
            const events = await db.getTrainingEvents();
            
            const data = {
                trainees,
                tasks,
                events,
                exportDate: new Date().toISOString(),
                platoon: this.currentPlatoon
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `drill-sergeant-data-${this.currentPlatoon}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Failed to export data');
        }
    }

    // Import data functionality
    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.trainees) {
                for (const trainee of data.trainees) {
                    await db.addTrainee(trainee);
                }
            }
            
            if (data.tasks) {
                for (const task of data.tasks) {
                    await db.addPlatoonTask(task);
                }
            }
            
            if (data.events) {
                for (const event of data.events) {
                    await db.addTrainingEvent(event.name);
                }
            }
            
            await this.loadPlatoonData();
            this.showMessage('Data imported successfully!', 'success');
        } catch (error) {
            console.error('Import error:', error);
            this.showError('Failed to import data. Please check the file format.');
        }
    }
}

// Create global app instance
const drillSergeantApp = new DrillSergeantApp();

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const initialized = await drillSergeantApp.initialize();
    if (!initialized) {
        console.error('Application failed to initialize');
    }
});

// Handle page visibility changes to refresh data
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && drillSergeantApp.initialized) {
        drillSergeantApp.loadPlatoonData();
    }
});

// Handle window resize for responsive adjustments
window.addEventListener('resize', () => {
    // Trigger re-render of components that might need adjustment
    if (drillSergeantApp.initialized) {
        traineeManager.renderRoster();
    }
});