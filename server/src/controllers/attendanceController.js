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

export const getUserAttendanceLogs = async (req, res) => {
  try {
    let logs = [];
    if (prisma && prisma.userAttendanceLog) {
      try {
        logs = await prisma.userAttendanceLog.findMany({
          take: 100,
          orderBy: { id: 'desc' },
        });
      } catch (logQueryErr) {
        console.warn('[Attendance] userAttendanceLog table query notice:', logQueryErr.message);
      }
    }

    let users = [];
    if (prisma && prisma.user) {
      try {
        users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            shift: true,
            role: true,
            isLoggedIn: true,
            updatedAt: true,
          },
          orderBy: { id: 'asc' },
        });
      } catch (userQueryErr) {
        console.warn('[Attendance] User query notice:', userQueryErr.message);
      }
    }

    const userMap = new Map(users.map((u) => [u.id, u]));
    const loggedUserIds = new Set(logs.map((l) => l.userId));
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const enriched = logs.map((log) => {
      const u = userMap.get(log.userId);
      return {
        id: log.id,
        userId: log.userId,
        userName: u?.name || `User #${log.userId}`,
        email: u?.email || '',
        department: u?.department || 'Operations',
        shift: u?.shift || 'GENERAL',
        role: u?.role || 'STAFF',
        isLoggedIn: u?.isLoggedIn ?? false,
        date: log.date
          ? typeof log.date === 'string'
            ? log.date.split('T')[0]
            : log.date.toISOString().split('T')[0]
          : todayStr,
        firstLoginAt: log.firstLoginAt,
        lastActiveAt: log.lastActiveAt,
        status: log.status || 'OnTime',
        lateMinutes: log.lateMinutes || 0,
        locationStatus: log.locationStatus || 'InOffice',
        ipAddress: log.ipAddress || '127.0.0.1',
      };
    });

    // Ensure all authenticated users are included in the login & presence register
    for (const u of users) {
      if (!loggedUserIds.has(u.id)) {
        enriched.push({
          id: `usr-${u.id}`,
          userId: u.id,
          userName: u.name,
          email: u.email,
          department: u.department || 'Operations',
          shift: u.shift || 'GENERAL',
          role: u.role || 'STAFF',
          isLoggedIn: u.isLoggedIn,
          date: todayStr,
          firstLoginAt: u.updatedAt || now,
          lastActiveAt: u.updatedAt || now,
          status: 'OnTime',
          lateMinutes: 0,
          locationStatus: u.shift === 'SITE' ? 'OnSite' : 'InOffice',
          ipAddress: '127.0.0.1',
        });
      }
    }

    // Sort: online users first, then by id
    enriched.sort((a, b) => {
      if (a.isLoggedIn && !b.isLoggedIn) return -1;
      if (!a.isLoggedIn && b.isLoggedIn) return 1;
      return 0;
    });

    res.json({
      success: true,
      count: enriched.length,
      logs: enriched,
      data: enriched,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, logs: [], data: [] });
  }
};

export default {
  getAttendanceRegister,
  getUserAttendanceLogs,
  markAttendance,
  getSettings,
  updateSettings,
};
