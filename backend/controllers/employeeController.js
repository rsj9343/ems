import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import { validationResult } from 'express-validator';

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
      sortOrder = 'asc'
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

    if (department) {
      filter.department = department;
    }

    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const employees = await Employee.find(filter)
      .populate('department', 'name')
      .populate('manager', 'name')
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
      .populate('manager', 'name employeeId');

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

    // Optional: populate for response
    await employee.populate('department', 'name');

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
    ).populate('department', 'name').populate('manager', 'name');

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

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

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
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      totalEmployees,
      activeEmployees,
      resignedEmployees,
      departmentStats
    });

  } catch (error) {
    console.error('Employee stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};