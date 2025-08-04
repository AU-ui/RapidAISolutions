const express = require('express');
const { getFirestore } = require('../firebase-config');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const db = getFirestore();

// Get all support tickets for a client
router.get('/', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = db.collection('support_tickets').where('clientId', '==', uid);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Apply pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await query.orderBy('created_at', 'desc').get();

    const tickets = [];
    snapshot.forEach(doc => {
      tickets.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: tickets,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: tickets.length
      }
    });

  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({
      error: 'Failed to fetch support tickets',
      message: error.message
    });
  }
});

// Get a specific support ticket
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const ticketDoc = await db.collection('support_tickets').doc(id).get();

    if (!ticketDoc.exists) {
      return res.status(404).json({
        error: 'Support ticket not found',
        message: 'The specified support ticket does not exist'
      });
    }

    const ticketData = ticketDoc.data();

    // Verify the ticket belongs to the authenticated client
    if (ticketData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this support ticket'
      });
    }

    res.json({
      success: true,
      data: {
        id: ticketDoc.id,
        ...ticketData
      }
    });

  } catch (error) {
    console.error('Get support ticket error:', error);
    res.status(500).json({
      error: 'Failed to fetch support ticket',
      message: error.message
    });
  }
});

// Create a new support ticket
router.post('/', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { subject, message, priority = 'medium' } = req.body;

    // Validate required fields
    if (!subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Subject and message are required'
      });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority',
        message: 'Priority must be one of: low, medium, high, urgent'
      });
    }

    const ticketData = {
      clientId: uid,
      subject,
      message,
      priority,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    const docRef = await db.collection('support_tickets').add(ticketData);

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: {
        id: docRef.id,
        ...ticketData
      }
    });

  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({
      error: 'Failed to create support ticket',
      message: error.message
    });
  }
});

// Update support ticket status
router.put('/status/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: open, in_progress, resolved, closed'
      });
    }

    // Check if ticket exists and belongs to client
    const ticketDoc = await db.collection('support_tickets').doc(id).get();

    if (!ticketDoc.exists) {
      return res.status(404).json({
        error: 'Support ticket not found',
        message: 'The specified support ticket does not exist'
      });
    }

    const ticketData = ticketDoc.data();
    if (ticketData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to update this support ticket'
      });
    }

    await db.collection('support_tickets').doc(id).update({
      status,
      last_updated: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Support ticket status updated successfully'
    });

  } catch (error) {
    console.error('Update support ticket status error:', error);
    res.status(500).json({
      error: 'Failed to update support ticket status',
      message: error.message
    });
  }
});

// Add a reply to a support ticket
router.post('/reply/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { message } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Message is required'
      });
    }

    // Check if ticket exists and belongs to client
    const ticketDoc = await db.collection('support_tickets').doc(id).get();

    if (!ticketDoc.exists) {
      return res.status(404).json({
        error: 'Support ticket not found',
        message: 'The specified support ticket does not exist'
      });
    }

    const ticketData = ticketDoc.data();
    if (ticketData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to reply to this support ticket'
      });
    }

    // Create reply data
    const replyData = {
      id: Date.now().toString(),
      message,
      author: 'client',
      created_at: new Date().toISOString()
    };

    // Get existing replies or create new array
    const replies = ticketData.replies || [];
    replies.push(replyData);

    await db.collection('support_tickets').doc(id).update({
      replies,
      last_updated: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Reply added successfully',
      data: replyData
    });

  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      error: 'Failed to add reply',
      message: error.message
    });
  }
});

// Delete a support ticket
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    // Check if ticket exists and belongs to client
    const ticketDoc = await db.collection('support_tickets').doc(id).get();

    if (!ticketDoc.exists) {
      return res.status(404).json({
        error: 'Support ticket not found',
        message: 'The specified support ticket does not exist'
      });
    }

    const ticketData = ticketDoc.data();
    if (ticketData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to delete this support ticket'
      });
    }

    await db.collection('support_tickets').doc(id).delete();

    res.json({
      success: true,
      message: 'Support ticket deleted successfully'
    });

  } catch (error) {
    console.error('Delete support ticket error:', error);
    res.status(500).json({
      error: 'Failed to delete support ticket',
      message: error.message
    });
  }
});

module.exports = router; 