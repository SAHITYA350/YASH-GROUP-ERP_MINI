import store from '../services/store.js';

export const getEmployees = async (req, res) => {
  try {
    const { department, search, status } = req.query;
    const list = await store.getEmployees({ department, search, status });

    res.json({
      success: true,
      total: list.length,
      data: list,
      employees: list,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const emp = await store.getEmployeeById(req.params.id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: emp });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { fullName, department, designation, salary, employmentType, employeeCode, shift, currentWork } = req.body;
    if (!fullName) {
      return res.status(400).json({ success: false, message: 'Employee full name is required' });
    }
    const created = await store.createEmployee(
      {
        fullName,
        employeeCode: employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
        department: department || 'Operations',
        designation: designation || 'Staff',
        salary: salary ? parseFloat(salary) : 0,
        employmentType: employmentType || 'Full-time',
        shift: shift || 'General',
        currentWork: currentWork || designation || 'Operational role',
      },
      req.user
    );
    res.status(201).json({ success: true, message: 'Employee registered successfully', data: created });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const updated = await store.updateEmployee(req.params.id, req.body, req.user);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getDailyTodos = async (req, res) => {
  try {
    const todos = await store.getTodos();
    res.json({ success: true, data: todos });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
};

export const toggleDailyTodo = async (req, res) => {
  try {
    const updated = await store.toggleTodo(req.params.id);
    if (!updated) return res.status(404).json({ success: false, message: 'To-do item not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  getDailyTodos,
  toggleDailyTodo,
};
