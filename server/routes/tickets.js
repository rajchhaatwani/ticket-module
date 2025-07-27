const express = require('express');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all tickets for an event
// @route   GET /api/tickets/event/:eventId
// @access  Private
router.get('/event/:eventId', async (req, res) => {
  try {
    // First verify the event belongs to the organizer
    const event = await Event.findOne({
      _id: req.params.eventId,
      organizer: req.organizer._id,
      isDeleted: false
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const tickets = await Ticket.find({ 
      event: req.params.eventId, 
      isDeleted: false 
    }).populate('event', 'name startTime endTime');

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting tickets'
    });
  }
});

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('event', 'name organizer');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if the ticket's event belongs to the organizer
    if (ticket.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting ticket'
    });
  }
});

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
router.post('/', async (req, res) => {
  try {
    // Verify the event belongs to the organizer
    const event = await Event.findOne({
      _id: req.body.event,
      organizer: req.organizer._id,
      isDeleted: false
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const ticket = await Ticket.create(req.body);
    await ticket.populate('event', 'name startTime endTime');

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    
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
      message: 'Server error creating ticket'
    });
  }
});

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('event', 'organizer');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if the ticket's event belongs to the organizer
    if (ticket.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('event', 'name startTime endTime');

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    
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
      message: 'Server error updating ticket'
    });
  }
});

// @desc    Delete ticket (soft delete)
// @route   DELETE /api/tickets/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('event', 'organizer');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if the ticket's event belongs to the organizer
    if (ticket.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    ticket.isDeleted = true;
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting ticket'
    });
  }
});

module.exports = router;