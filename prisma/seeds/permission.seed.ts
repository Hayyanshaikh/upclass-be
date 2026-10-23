import { prisma } from '../prisma-client.ts';

const groups = [
  {
    name: 'People',
    modules: [
      { key: 'students', label: 'Students' },
      { key: 'teachers', label: 'Teachers' },
      { key: 'parents', label: 'Parents' },
      { key: 'classes', label: 'Classes' },
    ],
  },
  {
    name: 'Attendance',
    modules: [
      { key: 'student_attendance', label: 'Student attendance' },
      { key: 'teacher_attendance', label: 'Teacher attendance' },
    ],
  },
  { name: 'Finance', modules: [{ key: 'fees', label: 'Fees' }] },
  {
    name: 'Academics',
    modules: [
      { key: 'timetable', label: 'Timetable' },
      { key: 'exams_results', label: 'Exams & Results' },
    ],
  },
  { name: 'Communication', modules: [{ key: 'notices', label: 'Notices' }] },
  {
    name: 'System',
    modules: [
      { key: 'leave_requests', label: 'Leave Requests' },
      { key: 'users', label: 'Users' },
      { key: 'roles', label: 'Roles' },
      { key: 'settings', label: 'Settings' },
    ],
  },
] as const;

const actions = ['View', 'Create', 'Edit', 'Delete'] as const;

const permissionDefinitions = groups.flatMap((group, groupIndex) =>
  group.modules.flatMap((module, moduleIndex) =>
    actions.map((action, actionIndex) => ({
      key: `${module.key}.${action.toLowerCase()}`,
      description: `${action} ${module.label}`,
      group: group.name,
      module: module.label,
      action,
      sortOrder: groupIndex * 1000 + moduleIndex * 10 + actionIndex,
    })),
  ),
);

export async function seedPermissions() {
  return prisma.$transaction(
    permissionDefinitions.map((permission) =>
      prisma.permission.upsert({
        where: { key: permission.key },
        update: permission,
        create: permission,
      }),
    ),
  );
}
