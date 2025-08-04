const express = require('express');
const { getFirestore } = require('../firebase-config');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const db = getFirestore();

// Get all appointments for a client
router.get('/', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = db.collection('appointments').where('clientId', '==', uid);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.where('outcome', '==', status);
    }

    // Apply pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await query.orderBy('date', 'desc').get();

    const appointments = [];
    snapshot.forEach(doc => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: appointments,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: appointments.length
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      error: 'Failed to fetch appointments',
      message: error.message
    });
  }
});

// Get a specific appointment
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const appointmentDoc = await db.collection('appointments').doc(id).get();

    if (!appointmentDoc.exists) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'The specified appointment does not exist'
      });
    }

    const appointmentData = appointmentDoc.data();

    // Verify the appointment belongs to the authenticated client
    if (appointmentData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this appointment'
      });
    }

    res.json({
      success: true,
      data: {
        id: appointmentDoc.id,
        ...appointmentData
      }
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      error: 'Failed to fetch appointment',
      message: error.message
    });
  }
});

// Create a new appointment
router.post('/', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { leadId, date, time, notes = '' } = req.body;

    // Validate required fields
    if (!leadId || !date || !time) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Lead ID, date, and time are required'
      });
    }

    // Verify lead exists and belongs to client
    const leadDoc = await db.collection('leads').doc(leadId).get();
    if (!leadDoc.exists) {
      return res.status(404).json({
        error: 'Lead not found',
        message: 'The specified lead does not exist'
      });
    }

    const leadData = leadDoc.data();
    if (leadData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to create appointments for this lead'
      });
    }

    const appointmentData = {
      clientId: uid,
      leadId,
      date,
      time,
      outcome: 'scheduled',
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const docRef = await db.collection('appointments').add(appointmentData);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        id: docRef.id,
        ...appointmentData
      }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      error: 'Failed to create appointment',
      message: error.message
    });
  }
});

// Update appointment outcome
router.put('/outcome/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { outcome, notes } = req.body;

    // Validate outcome
    const validOutcomes = ['completed', 'no-show', 'follow-up', 'cancelled'];
    if (!validOutcomes.includes(outcome)) {
      return res.status(400).json({
        error: 'Invalid outcome',
        message: 'Outcome must be one of: completed, no-show, follow-up, cancelled'
      });
    }

    // Check if appointment exists and belongs to client
    const appointmentDoc = await db.collection('appointments').doc(id).get();

    if (!appointmentDoc.exists) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'The specified appointment does not exist'
      });
    }

    const appointmentData = appointmentDoc.data();
    if (appointmentData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to update this appointment'
      });
    }

    const updateData = {
      outcome,
      updated_at: new Date().toISOString()
    };

    if (notes !== undefined) updateData.notes = notes;

    await db.collection('appointments').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Appointment outcome updated successfully'
    });

  } catch (error) {
    console.error('Update appointment outcome error:', error);
    res.status(500).json({
      error: 'Failed to update appointment outcome',
      message: error.message
    });
  }
});

// Delete an appointment
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    // Check if appointment exists and belongs to client
    const appointmentDoc = await db.collection('appointments').doc(id).get();

    if (!appointmentDoc.exists) {
      return res.status(404).json({
        error: 'Appointment not found',
        message: 'The specified appointment does not exist'
      });
    }

    const appointmentData = appointmentDoc.data();
    if (appointmentData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to delete this appointment'
      });
    }

    await db.collection('appointments').doc(id).delete();

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      error: 'Failed to delete appointment',
      message: error.message
    });
  }
});

module.exports = router; 