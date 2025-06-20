import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import { validationResult } from 'express-validator';

// Get all leaves with filtering
export const getAllLeaves = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
      type = '',
      employee = '',
      startDate = '',
      endDate = ''
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (employee) filter.employee = employee;
    
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    // If user is employee, only show their leaves
    if (req.user.role === 'employee' && req.user.employeeId) {
      filter.employee = req.user.employeeId;
    }

    const leaves = await Leave.find(filter)
      .populate('employee', 'name employeeId department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments(filter);

    res.json({
      leaves,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get leave by ID
export const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'name employeeId department email')
      .populate('approvedBy', 'name email');

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Check if user can access this leave
    if (req.user.role === 'employee' && 
        req.user.employeeId && 
        leave.employee._id.toString() !== req.user.employeeId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ leave });

  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new leave application
export const createLeave = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employee, type, startDate, endDate, reason, documents } = req.body;

    // Verify employee exists
    const emp = await Employee.findById(employee);
    if (!emp) {
      return res.status(400).json({ message: 'Employee not found' });
    }

    // If user is employee, they can only create leave for themselves
    if (req.user.role === 'employee' && 
        req.user.employeeId && 
        employee !== req.user.employeeId.toString()) {
      return res.status(403).json({ message: 'You can only create leave for yourself' });
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      employee,
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(startDate) }
        },
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(endDate) }
        },
        {
          startDate: { $gte: new Date(startDate) },
          endDate: { $lte: new Date(endDate) }
        }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({ 
        message: 'Leave dates overlap with existing leave application' 
      });
    }

    const leave = new Leave({
      employee,
      type,
      startDate,
      endDate,
      reason,
      documents: documents || []
    });

    await leave.save();
    await leave.populate('employee', 'name employeeId department');

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave
    });

  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update leave status (Admin only)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const leaveId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const updateData = {
      status,
      approvedBy: req.user.id,
      approvedDate: new Date()
    };

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      updateData,
      { new: true }
    ).populate('employee', 'name employeeId department email')
     .populate('approvedBy', 'name');

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    res.json({
      message: `Leave ${status} successfully`,
      leave
    });

  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete leave application
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Only allow deletion if leave is pending
    if (leave.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot delete leave that has been approved or rejected' 
      });
    }

    // Check if user can delete this leave
    if (req.user.role === 'employee' && 
        req.user.employeeId && 
        leave.employee.toString() !== req.user.employeeId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.json({ message: 'Leave application deleted successfully' });

  } catch (error) {
    console.error('Delete leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get leave statistics
export const getLeaveStats = async (req, res) => {
  try {
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'rejected' });

    // Leave type distribution
    const typeStats = await Leave.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Monthly leave trend (current year)
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Leave.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      typeStats,
      monthlyStats
    });

  } catch (error) {
    console.error('Leave stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};