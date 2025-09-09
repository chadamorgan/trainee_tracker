// Platoon tasks management module
class TasksManager {
    constructor() {
        this.tasks = [];
    }

    async loadTasks() {
        this.tasks = await db.getPlatoonTasks();
    }

    async openTasksDialog() {
        await this.loadTasks();
        const modal = this.createTasksModal();
        
        document.getElementById('modalContainer').innerHTML = modal;
        document.getElementById('tasksModal').classList.remove('hidden');
        
        this.renderTasksList();
    }

    createTasksModal() {
        return `
            <div id="tasksModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div class="flex justify-between items-center p-6 border-b">
                            <h2 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-list-check mr-2 text-green-600"></i>
                                Platoon Tasks Management
                            </h2>
                            <button onclick="tasksManager.closeTasksDialog()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div class="p-6">
                            <!-- Add New Task -->
                            <div class="mb-6">
                                <h3 class="text-lg font-semibold text-gray-800 mb-4">Add New Task</h3>
                                <form id="taskForm" class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Task Description *</label>
                                        <textarea name="text" required rows="3" 
                                                  class="w-full border border-gray-300 rounded-md px-3 py-2"
                                                  placeholder="Enter task description..."></textarea>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                            <select name="priority" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                                ${CONFIG.PRIORITY_LEVELS.map(priority => 
                                                    `<option value="${priority}" ${priority === CONFIG.DEFAULT_PRIORITY ? 'selected' : ''}>${priority}</option>`
                                                ).join('')}
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                            <input type="date" name="due_date" class="w-full border border-gray-300 rounded-md px-3 py-2">
                                        </div>
                                    </div>
                                    <div class="flex justify-end">
                                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
                                            <i class="fas fa-plus mr-1"></i> Add Task
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <!-- Tasks List -->
                            <div>
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="text-lg font-semibold text-gray-800">Platoon Tasks</h3>
                                    <div class="flex space-x-2">
                                        <select id="priorityFilter" class="border border-gray-300 rounded-md px-3 py-1 text-sm">
                                            <option value="">All Priorities</option>
                                            ${CONFIG.PRIORITY_LEVELS.map(priority => 
                                                `<option value="${priority}">${priority}</option>`
                                            ).join('')}
                                        </select>
                                        <select id="statusFilter" class="border border-gray-300 rounded-md px-3 py-1 text-sm">
                                            <option value="">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                                <div id="tasksList" class="space-y-3">
                                    <!-- Tasks will be dynamically rendered here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTasksList() {
        const container = document.getElementById('tasksList');
        if (!container) return;

        const priorityFilter = document.getElementById('priorityFilter')?.value;
        const statusFilter = document.getElementById('statusFilter')?.value;

        let filteredTasks = this.tasks;

        // Apply filters
        if (priorityFilter) {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        if (statusFilter) {
            if (statusFilter === 'completed') {
                filteredTasks = filteredTasks.filter(task => task.completed);
            } else if (statusFilter === 'pending') {
                filteredTasks = filteredTasks.filter(task => !task.completed);
            }
        }

        // Sort by priority and due date
        filteredTasks.sort((a, b) => {
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

        if (filteredTasks.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No tasks found</p>';
            return;
        }

        container.innerHTML = filteredTasks.map(task => this.createTaskCard(task)).join('');
    }

    createTaskCard(task) {
        const priorityColor = this.getPriorityColor(task.priority);
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
        const dueDateText = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date';
        
        return `
            <div class="border border-gray-200 rounded-lg p-4 ${task.completed ? 'bg-gray-50' : 'bg-white'} hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="px-2 py-1 text-xs rounded-full ${priorityColor}">${task.priority}</span>
                            ${task.completed ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>' : ''}
                            ${isOverdue ? '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Overdue</span>' : ''}
                        </div>
                        <p class="text-gray-800 mb-2 ${task.completed ? 'line-through' : ''}">${task.text}</p>
                        <div class="text-sm text-gray-600">
                            <div><i class="fas fa-calendar mr-1"></i> Due: ${dueDateText}</div>
                            <div><i class="fas fa-clock mr-1"></i> Created: ${new Date(task.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="flex space-x-2 ml-4">
                        <button onclick="tasksManager.toggleTaskCompletion('${task.id}', ${!task.completed})" 
                                class="px-3 py-1 text-sm rounded ${task.completed ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}">
                            <i class="fas fa-${task.completed ? 'undo' : 'check'} mr-1"></i>
                            ${task.completed ? 'Reopen' : 'Complete'}
                        </button>
                        <button onclick="tasksManager.editTask('${task.id}')" 
                                class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded">
                            <i class="fas fa-edit mr-1"></i> Edit
                        </button>
                        <button onclick="tasksManager.deleteTask('${task.id}')" 
                                class="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">
                            <i class="fas fa-trash mr-1"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getPriorityColor(priority) {
        const colors = {
            'High': 'bg-red-100 text-red-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-green-100 text-green-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    }

    async addTask(formData) {
        const taskData = {
            text: formData.get('text'),
            priority: formData.get('priority'),
            due_date: formData.get('due_date') || null,
            completed: false
        };

        const task = await db.addPlatoonTask(taskData);
        if (task) {
            document.getElementById('taskForm').reset();
            await this.loadTasks();
            this.renderTasksList();
            this.updatePriorityList();
        }
    }

    async toggleTaskCompletion(taskId, completed) {
        const success = await db.updatePlatoonTask(taskId, { completed });
        if (success) {
            await this.loadTasks();
            this.renderTasksList();
            this.updatePriorityList();
        }
    }

    async editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newText = prompt('Edit task description:', task.text);
        if (newText && newText !== task.text) {
            const success = await db.updatePlatoonTask(taskId, { text: newText });
            if (success) {
                await this.loadTasks();
                this.renderTasksList();
                this.updatePriorityList();
            }
        }
    }

    async deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const success = await db.deletePlatoonTask(taskId);
            if (success) {
                await this.loadTasks();
                this.renderTasksList();
                this.updatePriorityList();
            }
        }
    }

    closeTasksDialog() {
        const modal = document.getElementById('tasksModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        document.getElementById('modalContainer').innerHTML = '';
    }

    // Update priority list in main dashboard
    async updatePriorityList() {
        await this.loadTasks();
        
        const container = document.getElementById('priorityList');
        if (!container) return;

        const now = new Date();
        const priorityItems = [];

        // Add platoon tasks
        this.tasks.forEach(task => {
            if (!task.completed) {
                const isOverdue = task.due_date && new Date(task.due_date) < now;
                const priority = isOverdue ? 'High' : task.priority;
                
                priorityItems.push({
                    text: task.text,
                    priority: priority,
                    due_date: task.due_date,
                    type: 'task',
                    isOverdue: isOverdue
                });
            }
        });

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

        if (priorityItems.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No priority items</p>';
            return;
        }

        container.innerHTML = priorityItems.map(item => `
            <div class="text-sm border-l-2 ${this.getPriorityColor(item.priority)} pl-2">
                <div class="font-medium">${item.text}</div>
                <div class="text-gray-500 text-xs">
                    ${item.priority} Priority
                    ${item.due_date ? ` • Due: ${new Date(item.due_date).toLocaleDateString()}` : ''}
                    ${item.isOverdue ? ' • OVERDUE' : ''}
                </div>
            </div>
        `).join('');
    }

    // Get task statistics for dashboard
    getTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const overdue = this.tasks.filter(t => 
            t.due_date && new Date(t.due_date) < new Date() && !t.completed
        ).length;

        return {
            total,
            completed,
            pending,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
}

// Create global tasks manager instance
const tasksManager = new TasksManager();