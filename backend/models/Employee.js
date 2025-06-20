import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true // Not required, as we generate it
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
    enum: ['active', 'resigned', 'terminated'],
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
    phone: String
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
  }
}, {
  timestamps: true
});

// ✅ Pre-save hook to generate employeeId
employeeSchema.pre('save', async function (next) {
  if (!this.isNew || this.employeeId) return next();

  try {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP${(count + 1).toString().padStart(4, '0')}`;
    console.log('Generated employeeId:', this.employeeId);
    next();
  } catch (err) {
    console.error('Error generating employeeId:', err);
    next(err);
  }
});

// ✅ Auto-populate department and manager
employeeSchema.pre(/^find/, function (next) {
  this.populate('department', 'name').populate('manager', 'name');
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
