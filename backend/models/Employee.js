import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  dateOfJoining: {
    type: Date,
    required: true
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'resigned', 'terminated', 'on_leave'],
    default: 'active'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: {
    type: Date
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  performanceRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  // Performance tracking
  performanceReviews: [{
    reviewDate: Date,
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    goals: [String],
    achievements: [String],
    areasForImprovement: [String],
    comments: String
  }],
  // Skills and certifications
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    certifiedDate: Date
  }],
  // Work history within company
  workHistory: [{
    position: String,
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    startDate: Date,
    endDate: Date,
    salary: Number
  }],
  // Benefits and compensation
  benefits: {
    healthInsurance: { type: Boolean, default: false },
    dentalInsurance: { type: Boolean, default: false },
    visionInsurance: { type: Boolean, default: false },
    retirement401k: { type: Boolean, default: false },
    paidTimeOff: { type: Number, default: 0 },
    sickLeave: { type: Number, default: 0 }
  },
  // Employment details
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'intern'],
    default: 'full-time'
  },
  workLocation: {
    type: String,
    enum: ['office', 'remote', 'hybrid'],
    default: 'office'
  },
  // User account reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Pre-save hook to generate employeeId
employeeSchema.pre('save', async function (next) {
  if (!this.isNew || this.employeeId) return next();

  try {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP${(count + 1).toString().padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

// Auto-populate department and manager
employeeSchema.pre(/^find/, function (next) {
  this.populate('department', 'name')
      .populate('manager', 'name employeeId')
      .populate('user', 'name email role');
  next();
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for age
employeeSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for tenure
employeeSchema.virtual('tenure').get(function() {
  const today = new Date();
  const joinDate = new Date(this.dateOfJoining);
  const diffTime = Math.abs(today - joinDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  return { years, months, days: diffDays };
});

// Ensure virtual fields are serialized
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;