import store from '../services/store.js';

export const getPayrollRegister = async (req, res) => {
  try {
    const employees = await store.getEmployees();
    const records = await store.getPayroll();

    const payrollPreviews = employees.map((emp) => {
      const existing = records.find((r) => r.employeeCode === emp.employeeCode);
      const baseSalary = Number(emp.salary || 0);
      const totalWorkingDays = 26;
      const presentDays = existing ? existing.daysWorked : (emp.todayAttendance === 'Present' ? 1 : 0);
      const dailyRate = totalWorkingDays > 0 && baseSalary > 0 ? Math.round(baseSalary / totalWorkingDays) : 0;
      const attendanceDeduction = Math.round((totalWorkingDays - presentDays) * dailyRate);
      const overtimeHours = 0;
      const overtimePay = 0;
      const netSalary = Math.max(0, baseSalary - attendanceDeduction + overtimePay);

      return {
        id: existing ? existing.id : emp.id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        department: emp.department,
        designation: emp.designation,
        baseSalary,
        workingDays: totalWorkingDays,
        presentDays,
        attendanceDeduction,
        overtimeHours,
        overtimePay,
        netSalary,
        period: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        isCalculationPreview: true,
        status: existing ? existing.status : 'PENDING_APPROVAL',
        paidAt: null,
      };
    });

    const totalLiability = payrollPreviews.reduce((sum, item) => sum + item.netSalary, 0);
    const approvedCount = payrollPreviews.filter((p) => p.status === 'APPROVED' || p.status === 'PAID').length;

    res.json({
      success: true,
      period: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      summary: {
        totalStaff: payrollPreviews.length,
        totalMonthlyLiability: totalLiability,
        approvedCount,
        pendingReviewCount: payrollPreviews.length - approvedCount,
        payrollStatus: approvedCount === payrollPreviews.length && payrollPreviews.length > 0 ? 'Ready For Payout' : 'Calculation In Progress',
      },
      data: payrollPreviews,
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export const updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['CALCULATION_PREVIEW', 'PENDING_APPROVAL', 'APPROVED', 'PAID'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Permitted: ${allowed.join(', ')}` });
    }

    const updated = await store.updatePayrollStatus(id, status, req.user);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    res.json({
      success: true,
      message: `Payroll status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export default {
  getPayrollRegister,
  updatePayrollStatus,
};
