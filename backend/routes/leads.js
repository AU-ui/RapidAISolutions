const express = require('express');
const { getFirestore } = require('../firebase-config');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const db = getFirestore();

// Get all leads for a client
router.get('/', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = db.collection('leads').where('clientId', '==', uid);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Apply pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await query.orderBy('created_at', 'desc').get();

    const leads = [];
    snapshot.forEach(doc => {
      leads.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: leads,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: leads.length
      }
    });

  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      error: 'Failed to fetch leads',
      message: error.message
    });
  }
});

// Get a specific lead
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const leadDoc = await db.collection('leads').doc(id).get();

    if (!leadDoc.exists) {
      return res.status(404).json({
        error: 'Lead not found',
        message: 'The specified lead does not exist'
      });
    }

    const leadData = leadDoc.data();

    // Verify the lead belongs to the authenticated client
    if (leadData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this lead'
      });
    }

    res.json({
      success: true,
      data: {
        id: leadDoc.id,
        ...leadData
      }
    });

  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      error: 'Failed to fetch lead',
      message: error.message
    });
  }
});

// Create a new lead
router.post('/', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, phone, email, status = 'warm', notes = '' } = req.body;

    // Validate required fields
    if (!name || !phone || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, phone, and email are required'
      });
    }

    // Validate status
    const validStatuses = ['hot', 'warm', 'cold', 'dead'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: hot, warm, cold, dead'
      });
    }

    const leadData = {
      clientId: uid,
      name,
      phone,
      email,
      status,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_contacted: null
    };

    const docRef = await db.collection('leads').add(leadData);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: {
        id: docRef.id,
        ...leadData
      }
    });

  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      error: 'Failed to create lead',
      message: error.message
    });
  }
});

// Update a lead
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { name, phone, email, status, notes, last_contacted } = req.body;

    // Check if lead exists and belongs to client
    const leadDoc = await db.collection('leads').doc(id).get();

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
        message: 'You do not have permission to update this lead'
      });
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['hot', 'warm', 'cold', 'dead'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          message: 'Status must be one of: hot, warm, cold, dead'
        });
      }
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (last_contacted) updateData.last_contacted = last_contacted;

    await db.collection('leads').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Lead updated successfully'
    });

  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      error: 'Failed to update lead',
      message: error.message
    });
  }
});

// Delete a lead
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    // Check if lead exists and belongs to client
    const leadDoc = await db.collection('leads').doc(id).get();

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
        message: 'You do not have permission to delete this lead'
      });
    }

    await db.collection('leads').doc(id).delete();

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      error: 'Failed to delete lead',
      message: error.message
    });
  }
});

module.exports = router; 