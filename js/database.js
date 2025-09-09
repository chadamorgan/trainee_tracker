// Database module for Supabase integration
class Database {
    constructor() {
        this.supabase = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            // Initialize Supabase client
            this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            this.initialized = true;
            console.log('Database initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize database:', error);
            this.initialized = false;
            return false;
        }
    }

    // Trainee operations
    async getTrainees(platoon = null) {
        if (!this.initialized) return [];
        
        try {
            let query = this.supabase.from('trainees').select('*');
            if (platoon) {
                query = query.eq('platoon', platoon);
            }
            const { data, error } = await query.order('name');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching trainees:', error);
            return [];
        }
    }

    async addTrainee(traineeData) {
        if (!this.initialized) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('trainees')
                .insert([traineeData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding trainee:', error);
            return null;
        }
    }

    async updateTrainee(id, updates) {
        if (!this.initialized) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('trainees')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating trainee:', error);
            return null;
        }
    }

    async deleteTrainee(id) {
        if (!this.initialized) return false;
        
        try {
            const { error } = await this.supabase
                .from('trainees')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting trainee:', error);
            return false;
        }
    }

    // Training events operations
    async getTrainingEvents() {
        if (!this.initialized) return [];
        
        try {
            const { data, error } = await this.supabase
                .from('training_events')
                .select('*')
                .order('name');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching training events:', error);
            return [];
        }
    }

    async addTrainingEvent(name) {
        if (!this.initialized) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('training_events')
                .insert([{ name }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding training event:', error);
            return null;
        }
    }

    // Platoon tasks operations
    async getPlatoonTasks() {
        if (!this.initialized) return [];
        
        try {
            const { data, error } = await this.supabase
                .from('platoon_tasks')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching platoon tasks:', error);
            return [];
        }
    }

    async addPlatoonTask(taskData) {
        if (!this.initialized) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('platoon_tasks')
                .insert([taskData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding platoon task:', error);
            return null;
        }
    }

    async updatePlatoonTask(id, updates) {
        if (!this.initialized) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('platoon_tasks')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating platoon task:', error);
            return null;
        }
    }

    async deletePlatoonTask(id) {
        if (!this.initialized) return false;
        
        try {
            const { error } = await this.supabase
                .from('platoon_tasks')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting platoon task:', error);
            return false;
        }
    }

    // App metadata operations
    async getAppMetadata() {
        if (!this.initialized) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('app_metadata')
                .select('*')
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching app metadata:', error);
            return null;
        }
    }

    async updateAppMetadata(metadata) {
        if (!this.initialized) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('app_metadata')
                .upsert(metadata)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating app metadata:', error);
            return null;
        }
    }
}

// Create global database instance
const db = new Database();