import Department from '../models/Department.js';
import Employee from '../models/Employee.js';
import { validationResult } from 'express-validator';

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const { active } = req.query;
    
    const filter = {};
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const departments = await Department.find(filter)
      .populate('head', 'name employeeId')
      .populate('createdBy', 'name')
      .populate('employeeCount')
      .sort({ name: 1 });

    res.json({ departments });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name employeeId email')
      .populate('createdBy', 'name');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Get employees in this department
    const employees = await Employee.find({ department: req.params.id })
      .select('name employeeId position email status')
      .sort({ name: 1 });

    res.json({ 
      department: {
        ...department.toObject(),
        employees
      }
    });

  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new department
export const createDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, head, budget } = req.body;

    // Check if department already exists
    const existingDepartment = await Department.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingDepartment) {
      return res.status(400).json({ message: 'Department with this name already exists' });
    }

    // Verify head employee exists if provided
    if (head) {
      const employee = await Employee.findById(head);
      if (!employee) {
        return res.status(400).json({ message: 'Head employee not found' });
      }
    }

    const department = new Department({
      name,
      description,
      head: head || null,
      budget: budget || 0,
      createdBy: req.user.id
    });

    await department.save();

    // Populate before sending response
    await department.populate('head', 'name employeeId');
    await department.populate('createdBy', 'name');

    res.status(201).json({
      message: 'Department created successfully',
      department
    });

  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const departmentId = req.params.id;
    const { name, description, head, budget, isActive } = req.body;

    // Check if another department has the same name
    if (name) {
      const existingDepartment = await Department.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: departmentId }
      });

      if (existingDepartment) {
        return res.status(400).json({ message: 'Department with this name already exists' });
      }
    }

    // Verify head employee exists if provided
    if (head) {
      const employee = await Employee.findById(head);
      if (!employee) {
        return res.status(400).json({ message: 'Head employee not found' });
      }
    }

    const department = await Department.findByIdAndUpdate(
      departmentId,
      { name, description, head, budget, isActive },
      { new: true, runValidators: true }
    ).populate('head', 'name employeeId').populate('createdBy', 'name');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({
      message: 'Department updated successfully',
      department
    });

  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;

    // Check if department has employees
    const employeeCount = await Employee.countDocuments({ department: departmentId });
    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete department. It has ${employeeCount} employee(s) assigned.`
      });
    }

    const department = await Department.findByIdAndDelete(departmentId);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });

  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get department statistics
export const getDepartmentStats = async (req, res) => {
  try {
    const stats = await Department.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'department',
          as: 'employees'
        }
      },
      {
        $project: {
          name: 1,
          isActive: 1,
          budget: 1,
          employeeCount: { $size: '$employees' },
          activeEmployees: {
            $size: {
              $filter: {
                input: '$employees',
                cond: { $eq: ['$$this.status', 'active'] }
              }
            }
          }
        }
      },
      {
        $sort: { employeeCount: -1 }
      }
    ]);

    res.json({ stats });

  } catch (error) {
    console.error('Department stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};