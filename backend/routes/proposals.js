const express = require('express');
const { getFirestore, getStorage } = require('../firebase-config');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const db = getFirestore();
const storage = getStorage();

// Get all proposals for a client
router.get('/', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = db.collection('proposals').where('clientId', '==', uid);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Apply pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await query.orderBy('created_at', 'desc').get();

    const proposals = [];
    snapshot.forEach(doc => {
      proposals.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: proposals,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: proposals.length
      }
    });

  } catch (error) {
    console.error('Get proposals error:', error);
    res.status(500).json({
      error: 'Failed to fetch proposals',
      message: error.message
    });
  }
});

// Get a specific proposal
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const proposalDoc = await db.collection('proposals').doc(id).get();

    if (!proposalDoc.exists) {
      return res.status(404).json({
        error: 'Proposal not found',
        message: 'The specified proposal does not exist'
      });
    }

    const proposalData = proposalDoc.data();

    // Verify the proposal belongs to the authenticated client
    if (proposalData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this proposal'
      });
    }

    res.json({
      success: true,
      data: {
        id: proposalDoc.id,
        ...proposalData
      }
    });

  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({
      error: 'Failed to fetch proposal',
      message: error.message
    });
  }
});

// Create a new proposal
router.post('/', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { title, description, amount, status = 'draft' } = req.body;

    // Validate required fields
    if (!title || !description || !amount) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, description, and amount are required'
      });
    }

    // Validate status
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'revised'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: draft, sent, accepted, rejected, revised'
      });
    }

    const proposalData = {
      clientId: uid,
      title,
      description,
      amount: parseFloat(amount),
      status,
      pdf_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const docRef = await db.collection('proposals').add(proposalData);

    res.status(201).json({
      success: true,
      message: 'Proposal created successfully',
      data: {
        id: docRef.id,
        ...proposalData
      }
    });

  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({
      error: 'Failed to create proposal',
      message: error.message
    });
  }
});

// Update proposal status
router.put('/status/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'revised'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: draft, sent, accepted, rejected, revised'
      });
    }

    // Check if proposal exists and belongs to client
    const proposalDoc = await db.collection('proposals').doc(id).get();

    if (!proposalDoc.exists) {
      return res.status(404).json({
        error: 'Proposal not found',
        message: 'The specified proposal does not exist'
      });
    }

    const proposalData = proposalDoc.data();
    if (proposalData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to update this proposal'
      });
    }

    await db.collection('proposals').doc(id).update({
      status,
      updated_at: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Proposal status updated successfully'
    });

  } catch (error) {
    console.error('Update proposal status error:', error);
    res.status(500).json({
      error: 'Failed to update proposal status',
      message: error.message
    });
  }
});

// Get proposal download URL
router.get('/download/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const proposalDoc = await db.collection('proposals').doc(id).get();

    if (!proposalDoc.exists) {
      return res.status(404).json({
        error: 'Proposal not found',
        message: 'The specified proposal does not exist'
      });
    }

    const proposalData = proposalDoc.data();

    // Verify the proposal belongs to the authenticated client
    if (proposalData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this proposal'
      });
    }

    if (!proposalData.pdf_url) {
      return res.status(404).json({
        error: 'PDF not available',
        message: 'No PDF file has been uploaded for this proposal'
      });
    }

    // Generate a signed URL for the PDF
    const bucket = storage.bucket();
    const file = bucket.file(proposalData.pdf_url);
    
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    res.json({
      success: true,
      data: {
        download_url: url,
        expires_in: 15 * 60 // 15 minutes in seconds
      }
    });

  } catch (error) {
    console.error('Get proposal download URL error:', error);
    res.status(500).json({
      error: 'Failed to generate download URL',
      message: error.message
    });
  }
});

// Delete a proposal
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    // Check if proposal exists and belongs to client
    const proposalDoc = await db.collection('proposals').doc(id).get();

    if (!proposalDoc.exists) {
      return res.status(404).json({
        error: 'Proposal not found',
        message: 'The specified proposal does not exist'
      });
    }

    const proposalData = proposalDoc.data();
    if (proposalData.clientId !== uid) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to delete this proposal'
      });
    }

    // Delete PDF file from storage if it exists
    if (proposalData.pdf_url) {
      try {
        const bucket = storage.bucket();
        await bucket.file(proposalData.pdf_url).delete();
      } catch (storageError) {
        console.error('Failed to delete PDF file:', storageError);
        // Continue with proposal deletion even if PDF deletion fails
      }
    }

    await db.collection('proposals').doc(id).delete();

    res.json({
      success: true,
      message: 'Proposal deleted successfully'
    });

  } catch (error) {
    console.error('Delete proposal error:', error);
    res.status(500).json({
      error: 'Failed to delete proposal',
      message: error.message
    });
  }
});

module.exports = router; 