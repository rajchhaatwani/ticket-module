import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer',
    required: [true, 'Organizer is required']
  },
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
    maxlength: [300, 'Venue cannot exceed 300 characters']
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better performance
eventSchema.index({ organizer: 1, isDeleted: 1 });
eventSchema.index({ startTime: 1 });

export default mongoose.model('Event', eventSchema);