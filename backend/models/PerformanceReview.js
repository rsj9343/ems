import mongoose from 'mongoose';

const performanceReviewSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  categories: [{
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comments: String
  }],
  goals: [{
    description: String,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'exceeded'],
      default: 'not_started'
    },
    dueDate: Date,
    completedDate: Date
  }],
  achievements: [String],
  areasForImprovement: [String],
  developmentPlan: [{
    skill: String,
    action: String,
    timeline: String,
    resources: [String]
  }],
  employeeComments: String,
  reviewerComments: String,
  status: {
    type: String,
    enum: ['draft', 'pending_employee_review', 'completed', 'approved'],
    default: 'draft'
  },
  nextReviewDate: Date
}, {
  timestamps: true
});

// Auto-populate employee and reviewer
performanceReviewSchema.pre(/^find/, function (next) {
  this.populate('employee', 'name employeeId position department')
      .populate('reviewer', 'name employeeId position');
  next();
});

export default mongoose.model('PerformanceReview', performanceReviewSchema);