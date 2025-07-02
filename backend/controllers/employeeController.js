import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { validationResult } from 'express-validator';
import { sendEmail } from '../utils/emailService.js';

// Get all employees with filtering and pagination
export const getAllEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      status = '',
      sortBy = 'name',
      sortOrder = 'asc',
      employmentType = '',
      workLocation = ''
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (employmentType) filter.employmentType = employmentType;
    if (workLocation) filter.workLocation = workLocation;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const employees = await Employee.find(filter)
      .populate('department', 'name')
      .populate('manager', 'name employeeId')
      .populate('user', 'name email role avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Employee.countDocuments(filter);

    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department')
      .populate('manager', 'name employeeId')
      .populate('user', 'name email role avatar preferences')
      .populate('performanceReviews.reviewer', 'name employeeId');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ employee });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    // Check for duplicate email
    const existing = await Employee.findOne({ email: employeeData.email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check that department exists
    const department = await Department.findById(employeeData.department);
    if (!department) {
      return res.status(400).json({ message: 'Department not found' });
    }

    const employee = new Employee(employeeData);
    await employee.save();

    // Populate for response
    await employee.populate('department', 'name');

    // Send welcome email to employee
    try {
      await sendEmail(
        employee.email,
        'Welcome to the Company!',
        `
        <h1>Welcome ${employee.name}!</h1>
        <p>We're excited to have you join our team as ${employee.position} in the ${department.name} department.</p>
        <p>Your employee ID is: <strong>${employee.employeeId}</strong></p>
        <p>Your start date is: ${new Date(employee.dateOfJoining).toLocaleDateString()}</p>
        <p>Please contact HR if you have any questions.</p>
        `
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employeeId = req.params.id;
    const updateData = req.body;

    // Check if email is already taken by another employee
    if (updateData.email) {
      const existingEmployee = await Employee.findOne({
        email: updateData.email,
        _id: { $ne: employeeId }
      });

      if (existingEmployee) {
        return res.status(400).json({ message: 'Email already taken by another employee' });
      }
    }

    // Verify department exists if being updated
    if (updateData.department) {
      const department = await Department.findById(updateData.department);
      if (!department) {
        return res.status(400).json({ message: 'Department not found' });
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true, runValidators: true }
    ).populate('department', 'name').populate('manager', 'name').populate('user');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      message: 'Employee updated successfully',
      employee
    });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload employee avatar
export const uploadEmployeeAvatar = async (req, res) => {
  try {
    const employeeId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { avatar: req.file.path },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Also update user avatar if linked
    if (employee.user) {
      await User.findByIdAndUpdate(employee.user, { avatar: req.file.path });
    }

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: employee.avatar
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload employee document
export const uploadEmployeeDocument = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const document = {
      name: req.file.originalname,
      type: documentType || 'general',
      url: req.file.path,
      uploadDate: new Date()
    };

    employee.documents.push(document);
    await employee.save();

    res.json({
      message: 'Document uploaded successfully',
      document
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // If employee has a linked user account, delete it too
    if (employee.user) {
      await User.findByIdAndDelete(employee.user);
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({ message: 'Employee deleted successfully' });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee statistics
export const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const resignedEmployees = await Employee.countDocuments({ status: 'resigned' });
    const onLeaveEmployees = await Employee.countDocuments({ status: 'on_leave' });

    // Department wise distribution
    const departmentStats = await Employee.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $group: {
          _id: '$department.name',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Employment type distribution
    const employmentTypeStats = await Employee.aggregate([
      {
        $group: {
          _id: '$employmentType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Work location distribution
    const workLocationStats = await Employee.aggregate([
      {
        $group: {
          _id: '$workLocation',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average performance rating
    const avgPerformance = await Employee.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$performanceRating' }
        }
      }
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      resignedEmployees,
      onLeaveEmployees,
      departmentStats,
      employmentTypeStats,
      workLocationStats,
      avgPerformanceRating: avgPerformance[0]?.avgRating || 0
    });

  } catch (error) {
    console.error('Employee stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create user account for employee
export const createEmployeeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role = 'employee' } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.user) {
      return res.status(400).json({ message: 'Employee already has a user account' });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already taken' });
    }

    // Create user account
    const user = new User({
      name: employee.name,
      email,
      password,
      role,
      employee: employee._id
    });

    await user.save();

    // Link user to employee
    employee.user = user._id;
    await employee.save();

    // Send account creation email
    try {
      await sendEmail(
        email,
        'Your Account Has Been Created',
        `
        <h1>Account Created Successfully</h1>
        <p>Hello ${employee.name},</p>
        <p>Your user account has been created for the Employee Management System.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p>You can now log in to the system using your email and the password provided by your administrator.</p>
        `
      );
    } catch (emailError) {
      console.error('Failed to send account creation email:', emailError);
    }

    res.status(201).json({
      message: 'User account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Create employee user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};