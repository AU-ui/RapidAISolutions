# Rapid AI Solutions - Client Portal

A modern, secure client portal built with React.js and Firebase, designed for agencies to manage client relationships, leads, appointments, proposals, and support tickets.

## 🚀 Features

### Core Functionality
- **Secure Authentication** - Firebase Auth with email/password
- **Client Dashboard** - Overview of leads, appointments, and proposals
- **Lead Management** - Track leads with status (hot/warm/cold/dead)
- **Appointment Scheduling** - Book and manage client calls
- **Proposal Management** - Create, track, and download proposals
- **Support System** - Ticket-based support with replies
- **Real-time Updates** - Live data synchronization

### Technical Features
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI/UX** - Animated components with glass morphism effects
- **Secure API** - Express.js backend with Firebase Admin SDK
- **Data Isolation** - Each client can only access their own data
- **File Storage** - Secure PDF storage for proposals

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Plain CSS** - Custom styling with animations
- **React Router** - Client-side routing
- **Firebase SDK** - Authentication and real-time database

### Backend
- **Express.js** - RESTful API server
- **Firebase Admin SDK** - Server-side Firebase integration
- **CORS** - Cross-origin resource sharing
- **JWT Authentication** - Secure token-based auth

### Database & Storage
- **Firebase Firestore** - NoSQL database
- **Firebase Storage** - File storage for PDFs
- **Firebase Authentication** - User management

## 📁 Project Structure

```
RAS/
├── frontend/
│   └── app/
│       ├── public/
│       │   └── rapid.jpeg
│       └── src/
│           ├── components/
│           │   ├── LandingPage.js
│           │   ├── Login.js
│           │   ├── Register.js
│           │   ├── Dashboard.js
│           │   └── *.css
│           ├── contexts/
│           │   └── AuthContext.js
│           ├── services/
│           │   └── firebaseService.js
│           ├── App.js
│           └── firebase.js
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clients.js
│   │   ├── leads.js
│   │   ├── appointments.js
│   │   ├── proposals.js
│   │   └── support.js
│   ├── middleware/
│   │   └── auth.js
│   ├── firebase-config.js
│   ├── server.js
│   └── package.json
├── firestore.rules
├── storage.rules
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### Frontend Setup
```bash
cd frontend/app
npm install
npm start
```

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Firebase Configuration
1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Set up Storage
5. Download service account key
6. Update `frontend/app/src/firebase.js` with your config
7. Place `serviceAccountKey.json` in backend folder

## 🔧 Configuration

### Environment Variables
Create `.env` files in both frontend and backend directories:

**Frontend (.env)**
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

**Backend (.env)**
```env
PORT=8000
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new client
- `POST /api/auth/login` - Client login
- `GET /api/auth/profile` - Get client profile
- `PUT /api/auth/profile` - Update client profile

### Leads
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get specific lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get specific appointment
- `PUT /api/appointments/outcome/:id` - Update outcome
- `DELETE /api/appointments/:id` - Delete appointment

### Proposals
- `GET /api/proposals` - Get all proposals
- `POST /api/proposals` - Create proposal
- `GET /api/proposals/:id` - Get specific proposal
- `PUT /api/proposals/status/:id` - Update status
- `GET /api/proposals/download/:id` - Get download URL
- `DELETE /api/proposals/:id` - Delete proposal

### Support
- `GET /api/support` - Get all tickets
- `POST /api/support` - Create ticket
- `GET /api/support/:id` - Get specific ticket
- `PUT /api/support/status/:id` - Update status
- `POST /api/support/reply/:id` - Add reply
- `DELETE /api/support/:id` - Delete ticket

## 🔒 Security

### Firebase Security Rules
- **Firestore**: Clients can only access their own data
- **Storage**: Secure file access with signed URLs
- **Authentication**: Email/password with server-side verification

### API Security
- JWT token verification on all protected routes
- CORS configuration for frontend access
- Input validation and sanitization
- Error handling without sensitive data exposure

## 🎨 UI/UX Features

### Design Elements
- **Glass Morphism** - Modern translucent effects
- **Gradient Backgrounds** - Dynamic color schemes
- **Smooth Animations** - CSS transitions and keyframes
- **Responsive Layout** - Mobile-first design
- **Interactive Elements** - Hover effects and feedback

### Color Scheme
- Primary: Dark blue gradients
- Secondary: White text and accents
- Accent: Orange highlights
- Background: Animated gradients

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend/app
npm run build
# Deploy build folder
```

### Backend (Heroku/Railway)
```bash
cd backend
# Set environment variables
# Deploy with Procfile
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added support ticket system
- **v1.2.0** - Enhanced UI/UX with animations
- **v1.3.0** - Improved security and performance

---

**Built with ❤️ by Rapid AI Solutions Team** 