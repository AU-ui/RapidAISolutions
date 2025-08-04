const express = require('express');
const { getFirestore } = require('../firebase-config');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const db = getFirestore();

// Get client profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

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
        plan: clientData.plan,
        created_at: clientData.created_at,
        updated_at: clientData.updated_at
      }
    });

  } catch (error) {
    console.error('Get client profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch client profile',
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
    console.error('Update client profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

module.exports = router; 