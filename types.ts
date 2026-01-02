
export enum JobFlag {
  STAIRS = 'stairs',
  HEAVY = 'heavy',
  STORAGE = 'storage',
  PIANO = 'piano',
  MULTI_STOP = 'multi-stop'
}

export interface Employee {
  id: string;
  name: string;
  initials: string;
  hasLicense: boolean;
  phone: string;
  rank: number;
}

export interface Job {
  id: string;
  time: string;
  customerName: string;
  customerPhone: string;
  fromTo: string;
  flags: JobFlag[];
  notes: string;
}

export interface Truck {
  id: string;
  name: string;
  capacity: number;
  fuelLevel: number;
  ready: boolean;
  crewIds: string[];
  jobIds: string[];
}

export interface DragItem {
  type: 'employee' | 'job';
  id: string;
  sourceTruckId?: string;
}
