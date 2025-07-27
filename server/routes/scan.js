const express = require('express');
const ScanLog = require('../models/ScanLog');
const AssignedTicket = require('../models/AssignedTicket');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Scan QR code and validate ticket
// @route   POST /api/scan
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { qrCode, scannedBy, location, notes } = req.body;

    if (!qrCode || !scannedBy) {
      return res.status(400).json({
        success: false,
        message: 'QR code and scanner information are required'
      });
    }

    // Find the assigned ticket by QR code
    const assignedTicket = await AssignedTicket.findOne({ qrCode })
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
        message: 'Invalid QR code - ticket not found'
      });
    }

    // Check if the assigned ticket belongs to organizer's event
    if (assignedTicket.ticket.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - this ticket does not belong to your events'
      });
    }

    // Check ticket status
    if (assignedTicket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This ticket has been cancelled'
      });
    }

    if (assignedTicket.status === 'used') {
      // Get the last scan log for this ticket
      const lastScan = await ScanLog.findOne({
        assignedTicket: assignedTicket._id
      }).sort({ scannedAt: -1 });

      return res.status(400).json({
        success: false,
        message: 'This ticket has already been used',
        data: {
          ticket: assignedTicket,
          lastScan: lastScan
        }
      });
    }

    // Check if event has started (optional validation)
    const now = new Date();
    const eventStartTime = new Date(assignedTicket.ticket.event.startTime);
    const eventEndTime = new Date(assignedTicket.ticket.event.endTime);

    if (now < eventStartTime) {
      return res.status(400).json({
        success: false,
        message: 'Event has not started yet',
        data: {
          ticket: assignedTicket,
          eventStartTime: eventStartTime
        }
      });
    }

    if (now > eventEndTime) {
      return res.status(400).json({
        success: false,
        message: 'Event has already ended',
        data: {
          ticket: assignedTicket,
          eventEndTime: eventEndTime
        }
      });
    }

    // Mark ticket as used
    assignedTicket.status = 'used';
    await assignedTicket.save();

    // Create scan log
    const scanLog = await ScanLog.create({
      assignedTicket: assignedTicket._id,
      scannedBy,
      location,
      notes
    });

    await scanLog.populate('assignedTicket');

    res.status(200).json({
      success: true,
      message: 'Ticket scanned successfully - Entry granted',
      data: {
        ticket: assignedTicket,
        scanLog: scanLog,
        scanTime: scanLog.scannedAt
      }
    });
  } catch (error) {
    console.error('Scan ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error scanning ticket'
    });
  }
});

// @desc    Get scan logs for organizer's events
// @route   GET /api/scan/logs
// @access  Private
router.get('/logs', async (req, res) => {
  try {
    const { eventId, limit = 50, page = 1 } = req.query;
    
    let matchCondition = {};
    
    if (eventId) {
      // Get tickets for the specific event
      const Event = require('../models/Event');
      const Ticket = require('../models/Ticket');
      
      // Verify event belongs to organizer
      const event = await Event.findOne({
        _id: eventId,
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
        event: eventId, 
        isDeleted: false 
      }).select('_id');
      
      const ticketIds = tickets.map(ticket => ticket._id);
      
      const assignedTickets = await AssignedTicket.find({ 
        ticket: { $in: ticketIds } 
      }).select('_id');
      
      const assignedTicketIds = assignedTickets.map(at => at._id);
      matchCondition.assignedTicket = { $in: assignedTicketIds };
    } else {
      // Get all events for organizer
      const Event = require('../models/Event');
      const Ticket = require('../models/Ticket');
      
      const events = await Event.find({ 
        organizer: req.organizer._id, 
        isDeleted: false 
      }).select('_id');
      
      const eventIds = events.map(event => event._id);
      
      const tickets = await Ticket.find({ 
        event: { $in: eventIds }, 
        isDeleted: false 
      }).select('_id');
      
      const ticketIds = tickets.map(ticket => ticket._id);
      
      const assignedTickets = await AssignedTicket.find({ 
        ticket: { $in: ticketIds } 
      }).select('_id');
      
      const assignedTicketIds = assignedTickets.map(at => at._id);
      matchCondition.assignedTicket = { $in: assignedTicketIds };
    }

    const skip = (page - 1) * limit;
    
    const scanLogs = await ScanLog.find(matchCondition)
      .populate({
        path: 'assignedTicket',
        populate: {
          path: 'ticket',
          populate: {
            path: 'event',
            select: 'name startTime endTime venue'
          }
        }
      })
      .sort({ scannedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ScanLog.countDocuments(matchCondition);

    res.status(200).json({
      success: true,
      count: scanLogs.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: scanLogs
    });
  } catch (error) {
    console.error('Get scan logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting scan logs'
    });
  }
});

// @desc    Get scan statistics for an event
// @route   GET /api/scan/stats/:eventId
// @access  Private
router.get('/stats/:eventId', async (req, res) => {
  try {
    const Event = require('../models/Event');
    const Ticket = require('../models/Ticket');
    
    // Verify event belongs to organizer
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

    // Get tickets for the event
    const tickets = await Ticket.find({ 
      event: req.params.eventId, 
      isDeleted: false 
    }).select('_id');
    
    const ticketIds = tickets.map(ticket => ticket._id);
    
    // Get assigned ticket stats
    const assignedTicketStats = await AssignedTicket.aggregate([
      { $match: { ticket: { $in: ticketIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get scan logs count
    const assignedTickets = await AssignedTicket.find({ 
      ticket: { $in: ticketIds } 
    }).select('_id');
    
    const assignedTicketIds = assignedTickets.map(at => at._id);
    
    const totalScans = await ScanLog.countDocuments({
      assignedTicket: { $in: assignedTicketIds }
    });

    // Format stats
    const stats = {
      assigned: 0,
      used: 0,
      cancelled: 0,
      totalScans
    };

    assignedTicketStats.forEach(stat => {
      stats[stat._id] = stat.count;
    });

    stats.total = stats.assigned + stats.used + stats.cancelled;
    stats.usageRate = stats.total > 0 ? ((stats.used / stats.total) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        event: {
          id: event._id,
          name: event.name,
          startTime: event.startTime,
          endTime: event.endTime
        },
        stats
      }
    });
  } catch (error) {
    console.error('Get scan stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting scan statistics'
    });
  }
});

module.exports = router;