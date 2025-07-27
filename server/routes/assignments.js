const express = require('express');
const AssignedTicket = require('../models/AssignedTicket');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all assigned tickets for organizer's events
// @route   GET /api/assignments
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Get all events for this organizer
    const events = await Event.find({ 
      organizer: req.organizer._id, 
      isDeleted: false 
    }).select('_id');
    
    const eventIds = events.map(event => event._id);

    // Get all tickets for these events
    const tickets = await Ticket.find({ 
      event: { $in: eventIds }, 
      isDeleted: false 
    }).select('_id');
    
    const ticketIds = tickets.map(ticket => ticket._id);

    // Get assigned tickets for these tickets
    const assignedTickets = await AssignedTicket.find({ 
      ticket: { $in: ticketIds } 
    })
    .populate({
      path: 'ticket',
      populate: {
        path: 'event',
        select: 'name startTime endTime venue'
      }
    })
    .sort({ assignedAt: -1 });

    res.status(200).json({
      success: true,
      count: assignedTickets.length,
      data: assignedTickets
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting assignments'
    });
  }
});

// @desc    Get assigned tickets for a specific ticket
// @route   GET /api/assignments/ticket/:ticketId
// @access  Private
router.get('/ticket/:ticketId', async (req, res) => {
  try {
    // Verify the ticket belongs to organizer's event
    const ticket = await Ticket.findOne({
      _id: req.params.ticketId,
      isDeleted: false
    }).populate('event', 'organizer');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const assignedTickets = await AssignedTicket.find({ 
      ticket: req.params.ticketId 
    })
    .populate('ticket', 'type price')
    .sort({ assignedAt: -1 });

    res.status(200).json({
      success: true,
      count: assignedTickets.length,
      data: assignedTickets
    });
  } catch (error) {
    console.error('Get ticket assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting ticket assignments'
    });
  }
});

// @desc    Assign ticket to user
// @route   POST /api/assignments
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { ticket: ticketId, userEmail, quantity = 1 } = req.body;

    // Verify the ticket belongs to organizer's event
    const ticket = await Ticket.findOne({
      _id: ticketId,
      isDeleted: false
    }).populate('event', 'organizer');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if enough tickets are available
    if (ticket.availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough tickets available'
      });
    }

    // Create assigned tickets
    const assignedTickets = [];
    for (let i = 0; i < quantity; i++) {
      const assignedTicket = await AssignedTicket.create({
        ticket: ticketId,
        userEmail
      });
      assignedTickets.push(assignedTicket);
    }

    // Update available quantity
    ticket.availableQuantity -= quantity;
    await ticket.save();

    // Populate the assigned tickets for response
    const populatedTickets = await AssignedTicket.find({
      _id: { $in: assignedTickets.map(t => t._id) }
    }).populate('ticket', 'type price');

    res.status(201).json({
      success: true,
      message: `${quantity} ticket(s) assigned successfully`,
      data: populatedTickets
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error assigning ticket'
    });
  }
});

// @desc    Update assigned ticket status
// @route   PUT /api/assignments/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['assigned', 'used', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const assignedTicket = await AssignedTicket.findById(req.params.id)
      .populate({
        path: 'ticket',
        populate: {
          path: 'event',
          select: 'organizer'
        }
      });

    if (!assignedTicket) {
      return res.status(404).json({
        success: false,
        message: 'Assigned ticket not found'
      });
    }

    // Check if the assigned ticket belongs to organizer's event
    if (assignedTicket.ticket.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const oldStatus = assignedTicket.status;
    assignedTicket.status = status;
    await assignedTicket.save();

    // Update ticket availability if status changed to/from cancelled
    if (oldStatus === 'cancelled' && status !== 'cancelled') {
      // Ticket was uncancelled, decrease available quantity
      await Ticket.findByIdAndUpdate(assignedTicket.ticket._id, {
        $inc: { availableQuantity: -1 }
      });
    } else if (oldStatus !== 'cancelled' && status === 'cancelled') {
      // Ticket was cancelled, increase available quantity
      await Ticket.findByIdAndUpdate(assignedTicket.ticket._id, {
        $inc: { availableQuantity: 1 }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assigned ticket status updated successfully',
      data: assignedTicket
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating assignment'
    });
  }
});

// @desc    Get assigned ticket by QR code
// @route   GET /api/assignments/qr/:qrCode
// @access  Private
router.get('/qr/:qrCode', async (req, res) => {
  try {
    const assignedTicket = await AssignedTicket.findOne({ 
      qrCode: req.params.qrCode 
    })
    .populate({
      path: 'ticket',
      populate: {
        path: 'event',
        select: 'name startTime endTime venue organizer'
      }
    });

    if (!assignedTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if the assigned ticket belongs to organizer's event
    if (assignedTicket.ticket.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: assignedTicket
    });
  } catch (error) {
    console.error('Get assignment by QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting assignment'
    });
  }
});

module.exports = router;