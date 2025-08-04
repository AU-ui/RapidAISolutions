const express = require('express');
const { getAuth, getFirestore } = require('../firebase-config');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const auth = getAuth();
const db = getFirestore();

// Register new client
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, company, phone } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, and name are required'
      });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    // Create client profile in Firestore
    const clientData = {
      uid: userRecord.uid,
      name,
      email,
      company: company || '',
      phone: phone || '',
      start_date: new Date().toISOString(),
      status: 'active',
      plan: 'basic',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.collection('clients').doc(userRecord.uid).set(clientData);

    // Create custom token for client-side authentication
    const customToken = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: 'Client registered successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName
      },
      customToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'A user with this email already exists'
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Login client
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    // Note: Firebase Auth handles login on the client side
    // This endpoint is for server-side verification if needed
    res.json({
      success: true,
      message: 'Login should be handled on the client side with Firebase Auth'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// Verify token and get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    // Get client profile from Firestore
    const clientDoc = await db.collection('clients').doc(uid).get();

    if (!clientDoc.exists) {
      return res.status(404).json({
        error: 'Client not found',
        message: 'Client profile does not exist'
      });
    }

    const clientData = clientDoc.data();

    res.json({
      success: true,
      data: {
        uid: clientData.uid,
        name: clientData.name,
        email: clientData.email,
        company: clientData.company,
        phone: clientData.phone,
        start_date: clientData.start_date,
        status: clientData.status,
        plan: clientData.plan
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// Update client profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, company, phone } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;

    await db.collection('clients').doc(uid).update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// Logout (client-side handled, but server can invalidate if needed)
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Firebase handles logout on client side
    // Server can perform cleanup if needed
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    });
  }
});

module.exports = router; 