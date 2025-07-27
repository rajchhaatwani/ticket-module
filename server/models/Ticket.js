const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  type: {
    type: String,
    required: [true, 'Ticket type is required'],
    trim: true,
    maxlength: [100, 'Ticket type cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  totalQuantity: {
    type: Number,
    required: [true, 'Total quantity is required'],
    min: [1, 'Total quantity must be at least 1']
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Available quantity cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.totalQuantity;
      },
      message: 'Available quantity cannot exceed total quantity'
    }
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better performance
ticketSchema.index({ event: 1, isDeleted: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);