export type PosyanduSession = {
  id: string;
  date: string;
  location: string;
  posyanduName: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED';
  registeredChildren: number;
};

export type PosyanduChildRegistration = {
  childId: string;
  childName: string;
  ageMonths: number;
  checkedIn: boolean;
  weight?: number;
  height?: number;
};
