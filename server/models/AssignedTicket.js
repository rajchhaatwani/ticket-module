const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const assignedTicketSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'Ticket is required']
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  qrCode: {
    type: String,
    unique: true,
    default: function() {
      return uuidv4();
    }
  },
  status: {
    type: String,
    enum: ['assigned', 'used', 'cancelled'],
    default: 'assigned'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better performance
assignedTicketSchema.index({ ticket: 1 });
assignedTicketSchema.index({ userEmail: 1 });
assignedTicketSchema.index({ qrCode: 1 });
assignedTicketSchema.index({ status: 1 });

module.exports = mongoose.model('AssignedTicket', assignedTicketSchema);