import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Leave from '../models/Leave.js';
import User from '../models/User.js';

// Get admin dashboard data
export const getAdminDashboard = async (req, res) => {
  try {
    // Basic counts
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const totalDepartments = await Department.countDocuments({ isActive: true });
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    // Recent employees (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEmployees = await Employee.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).populate('department', 'name').sort({ createdAt: -1 }).limit(5);

    // Department distribution
    const departmentStats = await Employee.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept'
        }
      },
      {
        $unwind: '$dept'
      },
      {
        $group: {
          _id: '$dept.name',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 6
      }
    ]);

    // Leave statistics
    const leaveStats = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly employee growth (last 12 months)
    const monthlyGrowth = await Employee.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Recent activities (last 10 leaves)
    const recentLeaves = await Leave.find()
      .populate('employee', 'name employeeId')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      summary: {
        totalEmployees,
        activeEmployees,
        totalDepartments,
        pendingLeaves
      },
      recentEmployees,
      departmentStats,
      leaveStats,
      monthlyGrowth,
      recentLeaves
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee dashboard data
export const getEmployeeDashboard = async (req, res) => {
  try {
    if (!req.user.employeeId) {
      return res.status(400).json({ message: 'Employee profile not found' });
    }

    const employee = await Employee.findOne({ employeeId: req.user.employeeId })
      .populate('department', 'name')
      .populate('manager', 'name employeeId');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const totalLeaves = await Leave.countDocuments({ employee: employee._id });
    const pendingLeaves = await Leave.countDocuments({ employee: employee._id, status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ employee: employee._id, status: 'approved' });

    const recentLeaves = await Leave.find({ employee: employee._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const joinDate = new Date(employee.dateOfJoining);
    const today = new Date();
    const tenureInDays = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
    const tenureYears = Math.floor(tenureInDays / 365);
    const tenureMonths = Math.floor((tenureInDays % 365) / 30);

    const colleaguesCount = await Employee.countDocuments({ 
      department: employee.department._id,
      status: 'active',
      _id: { $ne: employee._id }
    });

    res.json({
      employee,
      leaveStats: {
        totalLeaves,
        pendingLeaves,
        approvedLeaves
      },
      recentLeaves,
      tenure: {
        days: tenureInDays,
        years: tenureYears,
        months: tenureMonths
      },
      colleaguesCount
    });

  } catch (error) {
    console.error('Employee dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
