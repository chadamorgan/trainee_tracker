# Deployment Guide

This guide will help you deploy the Drill Sergeant Trainee Tracker application.

## Prerequisites

- A Supabase account
- A GitHub account (for GitHub Pages deployment)
- Basic knowledge of web development

## Step 1: Database Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `drill-sergeant-tracker` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Select the closest region to your users
4. Click "Create new project"
5. Wait for the project to be created (usually takes 1-2 minutes)

### 1.2 Configure Database
1. In your Supabase dashboard, go to the "SQL Editor"
2. Click "New Query"
3. Copy and paste the contents of `setup-database.sql`
4. Click "Run" to execute the script
5. Verify that all tables were created successfully

### 1.3 Get API Credentials
1. In your Supabase dashboard, go to "Settings" > "API"
2. Copy the following values:
   - Project URL (looks like `https://your-project-id.supabase.co`)
   - Anon public key (starts with `eyJ...`)

## Step 2: Configure Application

### 2.1 Update Configuration
1. Copy `js/config.template.js` to `js/config.js`
2. Open `js/config.js` in a text editor
3. Replace the placeholder values:
   ```javascript
   const CONFIG = {
       SUPABASE_URL: 'https://your-project-id.supabase.co',  // Your actual URL
       SUPABASE_ANON_KEY: 'your-actual-anon-key-here',       // Your actual key
       // ... rest of config
   };
   ```

### 2.2 Test Configuration
1. Open `test.html` in your browser
2. Verify that the application loads without errors
3. Check the browser console for any configuration issues

## Step 3: Deploy to GitHub Pages

### 3.1 Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click "New repository"
3. Name it `drill-sergeant-tracker` (or your preferred name)
4. Make it public (required for free GitHub Pages)
5. Don't initialize with README (we already have files)
6. Click "Create repository"

### 3.2 Upload Files
1. Clone your repository locally:
   ```bash
   git clone https://github.com/yourusername/drill-sergeant-tracker.git
   cd drill-sergeant-tracker
   ```
2. Copy all application files to the repository folder
3. Commit and push:
   ```bash
   git add .
   git commit -m "Initial commit: Drill Sergeant Trainee Tracker"
   git push origin main
   ```

### 3.3 Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"
7. Wait a few minutes for the deployment to complete
8. Your app will be available at `https://yourusername.github.io/drill-sergeant-tracker`

## Step 4: Alternative Deployment Options

### 4.1 Netlify
1. Go to [netlify.com](https://netlify.com) and sign up
2. Click "New site from Git"
3. Connect your GitHub repository
4. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `/` (root)
5. Click "Deploy site"

### 4.2 Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Deploy settings:
   - Framework Preset: Other
   - Root Directory: `/`
5. Click "Deploy"

### 4.3 Local Development Server
For testing locally:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

## Step 5: Security Configuration

### 5.1 Supabase Security
1. In your Supabase dashboard, go to "Authentication" > "Policies"
2. Review the Row Level Security policies
3. Consider adding user authentication if needed
4. Set up proper CORS settings if deploying to a custom domain

### 5.2 Environment Variables (Optional)
For production deployments, consider using environment variables:
1. Create a `.env` file (don't commit this to git)
2. Store sensitive configuration there
3. Update your deployment platform to use environment variables

## Step 6: Testing and Validation

### 6.1 Functional Testing
1. Open your deployed application
2. Test all major features:
   - Add trainees
   - Edit trainee information
   - Create training events
   - Add platoon tasks
   - Use bulk upload
   - Test filtering and search

### 6.2 Mobile Testing
1. Test on various mobile devices
2. Verify responsive design works correctly
3. Test touch interactions

### 6.3 Performance Testing
1. Test with large datasets (100+ trainees)
2. Verify loading times are acceptable
3. Check for memory leaks in browser

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify Supabase URL and API key are correct
- Check that RLS policies allow anonymous access
- Ensure CORS is configured properly

**Deployment Issues**
- Verify all files are uploaded correctly
- Check that `config.js` is properly configured
- Ensure no JavaScript errors in browser console

**Performance Issues**
- Consider implementing pagination for large datasets
- Optimize database queries
- Use Supabase's built-in caching features

### Getting Help
1. Check the browser console for error messages
2. Review Supabase logs in the dashboard
3. Test with a fresh browser session
4. Verify all dependencies are loading correctly

## Maintenance

### Regular Tasks
1. Monitor application performance
2. Backup database regularly
3. Update dependencies as needed
4. Review and update security policies

### Updates
1. Test updates in a development environment first
2. Use version control for all changes
3. Document any configuration changes
4. Notify users of significant updates

## Support

For technical support or questions:
1. Check the README.md for common solutions
2. Review the application logs
3. Contact your system administrator
4. Refer to Supabase documentation for database issues