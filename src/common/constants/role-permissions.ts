export const rolePermissions: Record<string, string[]> = {
  super_admin: [
    'dashboard.view',

    // Schools
    'schools.view',
    'schools.create',
    'schools.edit',
    'schools.delete',
    'schools.lookup',

    // Users
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.lookup',

    // Roles
    'roles.view',
    'roles.create',
    'roles.edit',
    'roles.delete',
    'roles.lookup',
  ],

  school_admin: [
    'dashboard.view',

    // Schools
    'schools.edit',
    'schools.lookup',

    // Students
    'students.view',
    'students.create',
    'students.edit',
    'students.delete',
    'students.lookup',

    // Teachers
    'teachers.view',
    'teachers.create',
    'teachers.edit',
    'teachers.delete',
    'teachers.lookup',

    // Parents
    // 'parents.view',
    // 'parents.create',
    // 'parents.edit',
    // 'parents.delete',
    // 'parents.lookup',

    // Subjects
    'subjects.view',
    'subjects.create',
    'subjects.edit',
    'subjects.delete',
    'subjects.lookup',

    // Classes
    'classes.view',
    'classes.create',
    'classes.edit',
    'classes.delete',
    'classes.lookup',

    // Sections
    'sections.view',
    'sections.create',
    'sections.edit',
    'sections.delete',
    'sections.lookup',

    // Academic Years
    'academic_years.view',
    'academic_years.create',
    'academic_years.edit',
    'academic_years.delete',
    'academic_years.lookup',

    // Academic Terms
    'academic_terms.view',
    'academic_terms.create',
    'academic_terms.delete',
    'academic_terms.lookup',

    // Academic Year Terms
    'academic_year_terms.view',
    'academic_year_terms.create',
    'academic_year_terms.delete',

    // Student Attendance
    'student_attendance.view',
    'student_attendance.create',
    'student_attendance.edit',
    'student_attendance.delete',

    // Teacher Attendance
    'teacher_attendance.view',
    'teacher_attendance.create',
    'teacher_attendance.edit',
    'teacher_attendance.delete',

    // Mark Attendance
    'mark_attendance.view',
    'mark_attendance.create',
    'mark_attendance.edit',
    'mark_attendance.delete',

    // Timetable
    'timetable.view',
    'timetable.create',
    'timetable.edit',
    'timetable.delete',
    'timetable.lookup',

    // Exams & Results
    // 'exams_results.view',
    // 'exams_results.create',
    // 'exams_results.edit',
    // 'exams_results.delete',

    // Fees
    // 'fees.view',
    // 'fees.create',
    // 'fees.edit',
    // 'fees.delete',

    // Fee Structure
    // 'fee_structure.view',
    // 'fee_structure.create',
    // 'fee_structure.edit',
    // 'fee_structure.delete',

    // Notices
    // 'notices.view',
    // 'notices.create',
    // 'notices.edit',
    // 'notices.delete',

    // Leave Requests
    'leave_requests.view',
    'leave_requests.edit',

    // Teacher Leaves
    // 'teacher_leaves.view',
    // 'teacher_leaves.create',
    // 'teacher_leaves.edit',
    // 'teacher_leaves.delete',

    // Leave Policies
    'leave_policies.view',
    'leave_policies.create',
    'leave_policies.edit',
    'leave_policies.delete',
    'leave_policy_settings.view',
    'leave_policy_settings.edit',

    // Users
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.lookup',

    // Roles
    'roles.view',
    'roles.create',
    'roles.edit',
    'roles.delete',

    // Settings
    'settings.view',
    'settings.edit',
  ],

  // admin: [
  //   'dashboard.view',

  //   'students.view',
  //   'students.create',
  //   'students.edit',
  //   'students.delete',
  //   'students.lookup',

  //   'teachers.view',
  //   'teachers.create',
  //   'teachers.edit',
  //   'teachers.delete',
  //   'teachers.lookup',

  //   'parents.view',
  //   'parents.create',
  //   'parents.edit',
  //   'parents.delete',
  //   'parents.lookup',

  //   'subjects.view',
  //   'subjects.create',
  //   'subjects.edit',
  //   'subjects.delete',
  //   'subjects.lookup',

  //   'classes.view',
  //   'classes.create',
  //   'classes.edit',
  //   'classes.delete',
  //   'classes.lookup',

  //   'academic_years.view',
  //   'academic_years.create',
  //   'academic_years.edit',
  //   'academic_years.delete',
  //   'academic_years.lookup',

  //   'academic_terms.view',
  //   'academic_terms.create',
  //   'academic_terms.delete',
  //   'academic_terms.lookup',

  //   'academic_year_terms.view',
  //   'academic_year_terms.create',
  //   'academic_year_terms.delete',

  //   'student_attendance.view',
  //   'student_attendance.create',
  //   'student_attendance.edit',

  //   'teacher_attendance.view',
  //   'teacher_attendance.create',
  //   'teacher_attendance.edit',

  //   'mark_attendance.view',
  //   'mark_attendance.create',

  //   'timetable.view',
  //   'timetable.create',
  //   'timetable.edit',
  //   'timetable.lookup',

  //   'exams_results.view',
  //   'exams_results.create',
  //   'exams_results.edit',

  //   'fees.view',
  //   'fees.create',
  //   'fees.edit',

  //   'fee_structure.view',
  //   'fee_structure.create',
  //   'fee_structure.edit',

  //   'notices.view',
  //   'notices.create',
  //   'notices.edit',

  //   'leave_requests.view',
  //   'leave_requests.edit',

  //   'teacher_leaves.view',
  //   'teacher_leaves.edit',

  //   'leave_policies.view',
  //   'leave_policies.create',
  //   'leave_policies.edit',
  //   'leave_policies.delete',
  //   'leave_policy_settings.view',
  //   'leave_policy_settings.edit',

  //   'users.view',
  //   'users.create',
  //   'users.edit',
  //   'users.delete',

  //   'roles.view',
  //   'roles.create',
  //   'roles.edit',

  //   'settings.view',
  //   'settings.edit',
  // ],

  teacher: [
    'dashboard.view',

    'students.view',
    'students.lookup',

    'teachers.lookup',
    // 'parents.lookup',
    'subjects.lookup',
    'classes.lookup',
    'sections.lookup',
    'academic_years.lookup',
    'academic_terms.lookup',
    'timetable.lookup',

    'student_attendance.view',
    'student_attendance.create',
    'student_attendance.edit',

    'mark_attendance.view',
    'mark_attendance.create',

    'timetable.view',

    // 'exams_results.view',
    // 'exams_results.create',
    // 'exams_results.edit',

    // 'notices.view',

    'teacher_leaves.view',
    'teacher_leaves.create',
    'teacher_leaves.edit',
    'teacher_leaves.delete',

    'users.lookup',
  ],

  // parent: [
  //   'users.lookup',
  //   'dashboard.view',

  //   'students.view',
  //   'students.lookup',

  //   'teachers.lookup',
  //   'subjects.lookup',
  //   'classes.lookup',
  //   'academic_years.lookup',
  //   'academic_terms.lookup',
  //   'timetable.lookup',

  //   'student_attendance.view',
  //   'timetable.view',
  //   'exams_results.view',
  //   'fees.view',
  //   'notices.view',
  //   'leave_requests.view',
  // ],

  // student: [
  //   'dashboard.view',

  //   'teachers.lookup',
  //   'subjects.lookup',
  //   'classes.lookup',
  //   'academic_years.lookup',
  //   'academic_terms.lookup',
  //   'timetable.lookup',

  //   'student_attendance.view',
  //   'timetable.view',
  //   'exams_results.view',
  //   'fees.view',
  //   'notices.view',
  //   'users.lookup',
  // ],
};
