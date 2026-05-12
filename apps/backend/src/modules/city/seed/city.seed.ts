export type CitySeed = Readonly<{
  name: string;
  adminUsername: string;
  employeeUsernames: string[];
  citizenUsernames: string[];
}>;

export const citySeeds: CitySeed[] = [
  {
    name: 'Nice',
    adminUsername: 'admin-nice',
    employeeUsernames: ['employee-nice1'],
    citizenUsernames: ['citizen1', 'citizen3'],
  },
  {
    name: 'Biot',
    adminUsername: 'admin-biot',
    employeeUsernames: ['employee-biot1'],
    citizenUsernames: ['citizen2', 'citizen3'],
  },
  {
    name: 'Marseille',
    adminUsername: 'admin-marseille',
    employeeUsernames: ['employee-marseille1'],
    citizenUsernames: ['citizen3'],
  },
];

