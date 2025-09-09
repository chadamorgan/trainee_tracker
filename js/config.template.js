// Configuration template for Drill Sergeant Trainee Tracker
// Copy this file to config.js and update with your actual values

const CONFIG = {
    // Supabase configuration - Replace with your actual Supabase URL and API key
    SUPABASE_URL: 'https://your-project-id.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    
    // Application settings
    APP_NAME: 'Drill Sergeant Trainee Tracker',
    VERSION: '1.0.0',
    
    // Default values
    DEFAULT_PLATOON: '1st Platoon',
    DEFAULT_STATUS: 'Present',
    DEFAULT_PRIORITY: 'Medium',
    
    // Status options
    STATUS_OPTIONS: [
        'Present',
        'Sick Call',
        'Profiles',
        'ACFT Fail',
        'Rifle Unqualified',
        'AWOL',
        'Medical Hold',
        'Recycle'
    ],
    
    // Gender options
    GENDER_OPTIONS: ['Male', 'Female'],
    
    // Priority levels
    PRIORITY_LEVELS: ['High', 'Medium', 'Low'],
    
    // Ranks
    RANK_OPTIONS: [
        'PVT', 'PV2', 'PFC', 'SPC', 'CPL', 'SGT', 'SSG', 'SFC', 'MSG', '1SG', 'SGM', 'CSM'
    ],
    
    // Training events (can be customized)
    DEFAULT_TRAINING_EVENTS: [
        'Weapons Qualification',
        'Physical Fitness Test',
        'Land Navigation',
        'First Aid',
        'Chemical Warfare',
        'Combat Water Survival',
        'Confidence Course',
        'Rappelling',
        'Field Training Exercise',
        'Graduation Requirements'
    ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}