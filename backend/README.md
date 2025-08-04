# Rapid AI Solutions - Client Portal Backend

This is the backend API server for the Rapid AI Solutions Client Portal, built with Express.js and Firebase.

## 🚀 Features

- **Authentication**: Firebase Auth integration with JWT token verification
- **Database**: Firestore for data storage
- **File Storage**: Firebase Storage for PDF uploads
- **RESTful API**: Complete CRUD operations for all entities
- **Security**: Token-based authentication and authorization
- **Statistics**: Dashboard analytics and reporting

## 📋 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new client
- `POST /login` - Client login (handled on frontend)
- `GET /profile` - Get client profile
- `PUT /profile` - Update client profile
- `POST /logout` - Logout (client-side handled)

### Clients (`/api/clients`)
- `GET /profile` - Get client profile
- `PUT /profile` - Update client profile

### Leads (`/api/leads`)
- `GET /` - Get all leads (with filtering and pagination)
- `GET /:id` - Get specific lead
- `POST /` - Create new lead
- `PUT /:id` - Update lead
- `DELETE /:id` - Delete lead
- `GET /stats/summary` - Get lead statistics

### Appointments (`/api/appointments`)
- `GET /` - Get all appointments (with filtering and pagination)
- `GET /:id` - Get specific appointment
- `POST /` - Create new appointment
- `PUT /:id/outcome` - Update appointment outcome
- `DELETE /:id` - Delete appointment
- `GET /stats/summary` - Get appointment statistics

### Proposals (`/api/proposals`)
- `GET /` - Get all proposals (with filtering and pagination)
- `GET /:id` - Get specific proposal
- `POST /` - Create new proposal
- `PUT /:id/status` - Update proposal status
- `GET /:id/download` - Get proposal download URL
- `DELETE /:id` - Delete proposal
- `GET /stats/summary` - Get proposal statistics

### Support (`/api/support`)
- `GET /` - Get all support tickets (with filtering and pagination)
- `GET /:id` - Get specific support ticket
- `POST /` - Create new support ticket
- `PUT /:id/status` - Update ticket status
- `POST /:id/reply` - Add reply to ticket
- `DELETE /:id` - Delete support ticket
- `GET /stats/summary` - Get support ticket statistics

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication (Email/Password)
4. Create Firestore Database
5. Create Storage Bucket

#### Step 2: Get Service Account Key
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `serviceAccountKey.json`
5. Place it in the `backend` folder

#### Step 3: Environment Variables
Create a `.env` file in the backend folder:
```env
PORT=5000
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NODE_ENV=development
```

### 3. Database Schema

The following Firestore collections will be created automatically:

#### `clients`
```javascript
{
  uid: string,
  name: string,
  email: string,
  company: string,
  phone: string,
  start_date: timestamp,
  status: 'active' | 'inactive',
  plan: 'basic' | 'premium',
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `leads`
```javascript
{
  clientId: string,
  name: string,
  phone: string,
  email: string,
  status: 'hot' | 'warm' | 'cold' | 'dead',
  notes: string,
  last_contacted: timestamp,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `appointments`
```javascript
{
  clientId: string,
  leadId: string,
  date: string,
  time: string,
  outcome: 'scheduled' | 'completed' | 'no-show' | 'follow-up' | 'cancelled',
  notes: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `proposals`
```javascript
{
  clientId: string,
  title: string,
  description: string,
  amount: number,
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'revised',
  pdf_url: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `support_tickets`
```javascript
{
  clientId: string,
  subject: string,
  message: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  status: 'open' | 'in_progress' | 'resolved' | 'closed',
  replies: array,
  created_at: timestamp,
  updated_at: timestamp,
  last_updated: timestamp
}
```

### 4. Security Rules

Deploy the following Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Clients can only access their own data
    match /clients/{clientId} {
      allow read, write: if request.auth != null && request.auth.uid == clientId;
    }
    
    // Leads belong to clients
    match /leads/{leadId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.clientId;
    }
    
    // Appointments belong to clients
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.clientId;
    }
    
    // Proposals belong to clients
    match /proposals/{proposalId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.clientId;
    }
    
    // Support tickets belong to clients
    match /support_tickets/{ticketId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.clientId;
    }
  }
}
```

### 5. Run the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 🔧 API Usage Examples

### Authentication
```javascript
// Register new client
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'client@example.com',
    password: 'password123',
    name: 'John Doe',
    company: 'Example Corp',
    phone: '+1234567890'
  })
});
```

### Get Leads
```javascript
// Get all leads with authentication
const response = await fetch('/api/leads', {
  headers: {
    'Authorization': `Bearer ${firebaseIdToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Create Lead
```javascript
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${firebaseIdToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Jane Smith',
    phone: '+1234567890',
    email: 'jane@example.com',
    status: 'warm',
    notes: 'Interested in our services'
  })
});
```

## 🔒 Security Features

- **Token Verification**: All protected routes verify Firebase ID tokens
- **Data Isolation**: Clients can only access their own data
- **Input Validation**: All endpoints validate required fields
- **Error Handling**: Comprehensive error handling and logging
- **CORS**: Configured for cross-origin requests

## 📊 Monitoring

- Health check endpoint: `GET /api/health`
- Comprehensive error logging
- Request/response logging in development mode

## 🚀 Deployment

### Environment Variables for Production
```env
PORT=5000
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NODE_ENV=production
```

### Recommended Hosting Platforms
- **Vercel**: Easy deployment with serverless functions
- **Heroku**: Traditional hosting with easy scaling
- **Google Cloud Run**: Containerized deployment
- **AWS Lambda**: Serverless deployment

## 📝 Notes

- The backend is designed to work seamlessly with the React frontend
- Firebase handles most of the heavy lifting for authentication and database operations
- All endpoints return consistent JSON responses with success/error indicators
- The API is RESTful and follows standard HTTP status codes
- Comprehensive error handling ensures graceful failure responses

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling for new endpoints
3. Include input validation for all user inputs
4. Test all endpoints before committing
5. Update this README for any new features 