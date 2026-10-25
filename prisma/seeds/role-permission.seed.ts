import { prisma } from '../prisma-client.ts';

const rolePermissions: Record<string, string[]> = {
  super_admin: ['*'],

  admin: [
    'dashboard.view',
    'students.view',
    'students.create',
    'students.edit',
    'students.delete',
    'teachers.view',
    'teachers.create',
    'teachers.edit',
    'teachers.delete',
    'parents.view',
    'parents.create',
    'parents.edit',
    'parents.delete',
    'subjects.view',
    'subjects.create',
    'subjects.edit',
    'subjects.delete',
    'classes.view',
    'classes.create',
    'classes.edit',
    'classes.delete',
    'student_attendance.view',
    'student_attendance.create',
    'student_attendance.edit',
    'teacher_attendance.view',
    'teacher_attendance.create',
    'teacher_attendance.edit',
    'mark_attendance.view',
    'mark_attendance.create',
    'timetable.view',
    'timetable.create',
    'timetable.edit',
    'exams_results.view',
    'exams_results.create',
    'exams_results.edit',
    'fees.view',
    'fees.create',
    'fees.edit',
    'fee_structure.view',
    'fee_structure.create',
    'fee_structure.edit',
    'notices.view',
    'notices.create',
    'notices.edit',
    'leave_requests.view',
    'leave_requests.edit',
    'teacher_leaves.view',
    'teacher_leaves.edit',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'roles.view',
    'roles.create',
    'roles.edit',
    'settings.view',
    'settings.edit',
  ],

  teacher: [
    'dashboard.view',
    'students.view',
    'student_attendance.view',
    'student_attendance.create',
    'student_attendance.edit',
    'mark_attendance.view',
    'mark_attendance.create',
    'timetable.view',
    'exams_results.view',
    'exams_results.create',
    'exams_results.edit',
    'notices.view',
    'teacher_leaves.view',
    'teacher_leaves.create',
  ],

  parent: [
    'dashboard.view',
    'students.view',
    'student_attendance.view',
    'timetable.view',
    'exams_results.view',
    'fees.view',
    'notices.view',
    'leave_requests.view',
  ],

  student: [
    'dashboard.view',
    'student_attendance.view',
    'timetable.view',
    'exams_results.view',
    'fees.view',
    'notices.view',
  ],
};

export async function seedRolePermissions() {
  const permissions = await prisma.permission.findMany();
  const roles = await prisma.role.findMany();

  for (const role of roles) {
    const keys = rolePermissions[role.slug];

    if (!keys) continue;

    const allowedPermissions = keys.includes('*')
      ? permissions
      : permissions.filter((permission: any) => keys.includes(permission.key));

    await prisma.rolePermission.createMany({
      data: allowedPermissions.map((permission: any) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  console.log('Role permissions seeded successfully');
}
