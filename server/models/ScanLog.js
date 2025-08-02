import mongoose from 'mongoose';

const scanLogSchema = new mongoose.Schema({
  assignedTicket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssignedTicket',
    required: [true, 'Assigned ticket is required']
  },
  scannedBy: {
    type: String,
    required: [true, 'Scanner info is required'],
    trim: true,
    maxlength: [100, 'Scanner info cannot exceed 100 characters']
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Add indexes for better performance
scanLogSchema.index({ assignedTicket: 1 });
scanLogSchema.index({ scannedAt: 1 });

export default mongoose.model('ScanLog', scanLogSchema);