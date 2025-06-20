import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  type: {
    type: String,
    enum: ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedDate: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  documents: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Calculate total days
leaveSchema.virtual('totalDays').get(function() {
  const timeDiff = this.endDate - this.startDate;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
});

// Populate employee details
leaveSchema.pre(/^find/, function(next) {
  this.populate('employee', 'name employeeId department')
      .populate('approvedBy', 'name');
  next();
});

// Ensure virtual fields are serialized
leaveSchema.set('toJSON', { virtuals: true });
leaveSchema.set('toObject', { virtuals: true });

export default mongoose.model('Leave', leaveSchema);