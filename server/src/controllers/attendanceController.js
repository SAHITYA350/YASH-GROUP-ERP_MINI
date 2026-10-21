import store from '../services/store.js';
import { prisma } from '../config/prisma.js';

export const getAttendanceRegister = async (req, res) => {
  try {
    const employees = await store.getEmployees();
    const settings = await store.getAttendanceSettings();
    const todayAttendanceList = await store.getAttendance();

    const attendanceRecords = employees.map((emp) => {
      const todayRecord = todayAttendanceList.find((a) => a.employeeId === emp.id);

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        department: emp.department,
        shift: emp.shift || 'GENERAL',
        workDate: new Date().toISOString().split('T')[0],
        status: todayRecord ? todayRecord.status : 'Not Marked',
        checkIn: todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        checkOut: todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        hoursWorked: todayRecord?.hoursWorked ? Number(todayRecord.hoursWorked) : 0,
        lateMinutes: 0,
        locationStatus: emp.shift === 'SITE' ? 'OnSite' : 'InOffice',
      };
    });

    const totalStaff = employees.length;
    const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
    const attendanceRate = totalStaff > 0 ? ((presentCount / totalStaff) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      summary: {
        totalStaff,
        presentCount,
        absentCount: totalStaff - presentCount,
        attendanceRate: parseFloat(attendanceRate),
      },
      settings,
      data: attendanceRecords,
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { employeeId, status, checkIn, checkOut, hoursWorked } = req.body;
    const empId = parseInt(employeeId, 10);

    if (prisma) {
      try {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        const record = await prisma.attendance.upsert({
          where: {
            employeeId_workDate: {
              employeeId: empId,
              workDate: todayDate,
            },
          },
          update: {
            status: status || 'Present',
            checkIn: checkIn ? new Date(checkIn) : new Date(),
            checkOut: checkOut ? new Date(checkOut) : undefined,
            hoursWorked: hoursWorked ? Number(hoursWorked) : undefined,
          },
          create: {
            employeeId: empId,
            workDate: todayDate,
            status: status || 'Present',
            checkIn: checkIn ? new Date(checkIn) : new Date(),
            checkOut: checkOut ? new Date(checkOut) : null,
            hoursWorked: hoursWorked ? Number(hoursWorked) : 0,
          },
        });

        return res.json({
          success: true,
          message: `Attendance marked as ${record.status}`,
          data: record,
        });
      } catch (e) {
        console.warn('[Attendance] Prisma upsert notice:', e.message);
      }
    }

    const record = await store.markAttendance(
      { employeeId: empId, status, checkIn, checkOut, hoursWorked },
      req.user
    );
    res.json({
      success: true,
      message: `Attendance marked as ${record.status}`,
      data: record,
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export const getSettings = async (req, res) => {
  try {
    const settings = await store.getAttendanceSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updated = await store.updateAttendanceSettings(req.body, req.user);
    res.json({ success: true, message: 'Attendance settings updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getAttendanceRegister,
  markAttendance,
  getSettings,
  updateSettings,
};
