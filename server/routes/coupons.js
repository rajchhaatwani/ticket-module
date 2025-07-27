import express from 'express';
import Coupon from '../models/Coupon.js';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all coupons for an event
// @route   GET /api/coupons/event/:eventId
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

    const coupons = await Coupon.find({ 
      event: req.params.eventId 
    }).populate('event', 'name startTime endTime');

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting coupons'
    });
  }
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('event', 'name organizer');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if the coupon's event belongs to the organizer
    if (coupon.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting coupon'
    });
  }
});

// @desc    Create new coupon
// @route   POST /api/coupons
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

    const coupon = await Coupon.create(req.body);
    await coupon.populate('event', 'name startTime endTime');

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating coupon'
    });
  }
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('event', 'organizer');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if the coupon's event belongs to the organizer
    if (coupon.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('event', 'name startTime endTime');

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: updatedCoupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating coupon'
    });
  }
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('event', 'organizer');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if the coupon's event belongs to the organizer
    if (coupon.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting coupon'
    });
  }
});

// @desc    Validate and use coupon
// @route   POST /api/coupons/validate
// @access  Private
router.post('/validate', async (req, res) => {
  try {
    const { code, eventId } = req.body;

    // Verify the event belongs to the organizer
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

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      event: eventId
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    const now = new Date();
    
    // Check if coupon is valid
    if (now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is not yet valid'
      });
    }

    if (now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired'
      });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      data: {
        coupon,
        isValid: true,
        discount: {
          type: coupon.discountType,
          value: coupon.discountValue
        }
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error validating coupon'
    });
  }
});

// @desc    Use coupon (increment usage count)
// @route   POST /api/coupons/:id/use
// @access  Private
router.post('/:id/use', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('event', 'organizer');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if the coupon's event belongs to the organizer
    if (coupon.event.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }

    coupon.usedCount += 1;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon used successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Use coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error using coupon'
    });
  }
});

export default router;