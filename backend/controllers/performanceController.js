import PerformanceReview from '../models/PerformanceReview.js';
import Employee from '../models/Employee.js';
import { validationResult } from 'express-validator';
import { sendEmail } from '../utils/emailService.js';

// Get all performance reviews
export const getAllPerformanceReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      employee = '',
      reviewer = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (employee) filter.employee = employee;
    if (reviewer) filter.reviewer = reviewer;
    if (status) filter.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await PerformanceReview.find(filter)
      .populate('employee', 'name employeeId position department')
      .populate('reviewer', 'name employeeId position')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PerformanceReview.countDocuments(filter);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get performance reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get performance review by ID
export const getPerformanceReviewById = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id)
      .populate('employee', 'name employeeId position department email')
      .populate('reviewer', 'name employeeId position email');

    if (!review) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    res.json({ review });

  } catch (error) {
    console.error('Get performance review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create performance review
export const createPerformanceReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reviewData = req.body;

    // Verify employee and reviewer exist
    const employee = await Employee.findById(reviewData.employee);
    const reviewer = await Employee.findById(reviewData.reviewer);

    if (!employee) {
      return res.status(400).json({ message: 'Employee not found' });
    }

    if (!reviewer) {
      return res.status(400).json({ message: 'Reviewer not found' });
    }

    const review = new PerformanceReview(reviewData);
    await review.save();

    await review.populate('employee', 'name employeeId position department email');
    await review.populate('reviewer', 'name employeeId position email');

    // Send notification email to employee
    try {
      await sendEmail(
        employee.email,
        'Performance Review Scheduled',
        `
        <h1>Performance Review Scheduled</h1>
        <p>Hello ${employee.name},</p>
        <p>A performance review has been scheduled for you.</p>
        <p><strong>Review Period:</strong> ${new Date(review.reviewPeriod.startDate).toLocaleDateString()} - ${new Date(review.reviewPeriod.endDate).toLocaleDateString()}</p>
        <p><strong>Reviewer:</strong> ${reviewer.name}</p>
        <p>Please prepare for your review and be ready to discuss your achievements and goals.</p>
        `
      );
    } catch (emailError) {
      console.error('Failed to send review notification email:', emailError);
    }

    res.status(201).json({
      message: 'Performance review created successfully',
      review
    });

  } catch (error) {
    console.error('Create performance review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update performance review
export const updatePerformanceReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const updateData = req.body;

    const review = await PerformanceReview.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true, runValidators: true }
    ).populate('employee', 'name employeeId position department email')
     .populate('reviewer', 'name employeeId position email');

    if (!review) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    // If review is completed, update employee's performance rating
    if (updateData.status === 'completed' && updateData.overallRating) {
      await Employee.findByIdAndUpdate(
        review.employee._id,
        { performanceRating: updateData.overallRating }
      );

      // Send completion notification
      try {
        await sendEmail(
          review.employee.email,
          'Performance Review Completed',
          `
          <h1>Performance Review Completed</h1>
          <p>Hello ${review.employee.name},</p>
          <p>Your performance review has been completed.</p>
          <p><strong>Overall Rating:</strong> ${updateData.overallRating}/5</p>
          <p>Please log in to the system to view your detailed review.</p>
          `
        );
      } catch (emailError) {
        console.error('Failed to send review completion email:', emailError);
      }
    }

    res.json({
      message: 'Performance review updated successfully',
      review
    });

  } catch (error) {
    console.error('Update performance review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete performance review
export const deletePerformanceReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    res.json({ message: 'Performance review deleted successfully' });

  } catch (error) {
    console.error('Delete performance review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get performance statistics
export const getPerformanceStats = async (req, res) => {
  try {
    const totalReviews = await PerformanceReview.countDocuments();
    const completedReviews = await PerformanceReview.countDocuments({ status: 'completed' });
    const pendingReviews = await PerformanceReview.countDocuments({ status: 'pending_employee_review' });

    // Average ratings by department
    const departmentRatings = await PerformanceReview.aggregate([
      { $match: { status: 'completed' } },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      { $unwind: '$employeeData' },
      {
        $lookup: {
          from: 'departments',
          localField: 'employeeData.department',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: '$department' },
      {
        $group: {
          _id: '$department.name',
          avgRating: { $avg: '$overallRating' },
          reviewCount: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1 } }
    ]);

    // Rating distribution
    const ratingDistribution = await PerformanceReview.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$overallRating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalReviews,
      completedReviews,
      pendingReviews,
      departmentRatings,
      ratingDistribution
    });

  } catch (error) {
    console.error('Performance stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee performance history
export const getEmployeePerformanceHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const reviews = await PerformanceReview.find({ employee: employeeId })
      .populate('reviewer', 'name employeeId')
      .sort({ 'reviewPeriod.endDate': -1 });

    const employee = await Employee.findById(employeeId)
      .select('name employeeId position department performanceRating');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      employee,
      reviews,
      currentRating: employee.performanceRating
    });

  } catch (error) {
    console.error('Get employee performance history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};