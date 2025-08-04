# Firebase Setup Guide for Rapid AI Solutions Client Portal

## 🚀 Quick Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `rapid-ai-client-portal`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to "Authentication" → "Get started"
2. Click "Sign-in method" tab
3. Enable "Email/Password" provider
4. Click "Save"

### 3. Create Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (we'll add security rules later)
3. Select a location (choose closest to your users)
4. Click "Done"

### 4. Enable Storage

1. Go to "Storage" → "Get started"
2. Choose "Start in test mode"
3. Select a location (same as Firestore)
4. Click "Done"

### 5. Get Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → "Web"
4. Register app with name: "Rapid AI Client Portal"
5. Copy the configuration object

### 6. Update Firebase Config

Replace the placeholder config in `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 7. Deploy Security Rules

#### Firestore Rules
1. Go to "Firestore Database" → "Rules"
2. Replace with content from `firestore.rules`
3. Click "Publish"

#### Storage Rules
1. Go to "Storage" → "Rules"
2. Replace with content from `storage.rules`
3. Click "Publish"

## 📊 Database Schema

The following collections will be created automatically when clients register:

### `clients` Collection
```javascript
{
  id: "user_uid",
  name: "Client Name",
  email: "client@example.com",
  company: "Company Name",
  phone: "+1234567890",
  start_date: "2024-01-01T00:00:00.000Z",
  status: "active",
  plan: "basic",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

### `leads` Collection
```javascript
{
  id: "auto_generated",
  client_id: "user_uid",
  name: "Lead Name",
  phone: "+1234567890",
  email: "lead@example.com",
  status: "hot|warm|cold|dead",
  notes: "Lead notes",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

### `appointments` Collection
```javascript
{
  id: "auto_generated",
  client_id: "user_uid",
  lead_id: "lead_id",
  date: "2024-01-01",
  time: "14:00",
  outcome: "completed|no-show|follow-up",
  notes: "Appointment notes",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

### `proposals` Collection
```javascript
{
  id: "auto_generated",
  client_id: "user_uid",
  pdf_url: "https://storage.googleapis.com/...",
  status: "draft|sent|approved|rejected",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

### `support_tickets` Collection
```javascript
{
  id: "auto_generated",
  client_id: "user_uid",
  subject: "Support request subject",
  message: "Support request message",
  status: "open|in-progress|resolved|closed",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

## 🔧 Testing the Setup

### 1. Test Authentication
- Start your React app: `npm start`
- Go to `/register` and create a test account
- Verify you can log in and access the dashboard

### 2. Test Database
- Check Firestore Console to see if client profile was created
- Verify the data structure matches the schema

### 3. Test Security Rules
- Try accessing data from different user accounts
- Verify users can only access their own data

## 🚨 Important Security Notes

1. **Never commit Firebase config with real keys to public repositories**
2. **Use environment variables for production**
3. **Regularly review and update security rules**
4. **Monitor Firebase usage and costs**

## 🔄 Environment Variables (Production)

Create a `.env` file in your project root:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

Then update `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## 📈 Next Steps

1. **Set up N8N automations** for workflow triggers
2. **Create individual feature components** (Leads, Appointments, etc.)
3. **Add file upload functionality** for proposal PDFs
4. **Implement real-time updates** using Firestore listeners
5. **Add admin panel** for managing all clients

## 🆘 Troubleshooting

### Common Issues:

1. **Authentication not working**
   - Check if Email/Password provider is enabled
   - Verify Firebase config is correct

2. **Database access denied**
   - Check Firestore security rules
   - Ensure user is authenticated

3. **Storage upload fails**
   - Check Storage security rules
   - Verify file size limits

4. **CORS errors**
   - Add your domain to Firebase Auth authorized domains
   - Check Storage CORS configuration

### Support:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support) 