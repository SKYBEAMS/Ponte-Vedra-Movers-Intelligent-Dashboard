
import React from 'react';
import { Truck, Employee, Job, JobFlag } from './types';
import { 
  ArrowUpCircle, 
  Weight, 
  Box, 
  Music, 
  MapPin 
} from 'lucide-react';

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'James Wilson', initials: 'JW', hasLicense: true, phone: '(904) 555-0101', rank: 9 },
  { id: 'e2', name: 'Sarah Miller', initials: 'SM', hasLicense: false, phone: '(904) 555-0102', rank: 7 },
  { id: 'e3', name: 'Mike Thompson', initials: 'MT', hasLicense: true, phone: '(904) 555-0103', rank: 10 },
  { id: 'e4', name: 'David Lee', initials: 'DL', hasLicense: true, phone: '(904) 555-0104', rank: 8 },
  { id: 'e5', name: 'Chris Evans', initials: 'CE', hasLicense: false, phone: '(904) 555-0105', rank: 5 },
  { id: 'e6', name: 'Emma Watson', initials: 'EW', hasLicense: false, phone: '(904) 555-0106', rank: 6 },
  { id: 'e7', name: 'Robert Downey', initials: 'RD', hasLicense: true, phone: '(904) 555-0107', rank: 9 },
  { id: 'e8', name: 'Scarlett J.', initials: 'SJ', hasLicense: false, phone: '(904) 555-0108', rank: 7 },
  { id: 'e9', name: 'Mark Ruffalo', initials: 'MR', hasLicense: true, phone: '(904) 555-0109', rank: 8 },
  { id: 'e10', name: 'Jeremy Renner', initials: 'JR', hasLicense: true, phone: '(904) 555-0110', rank: 4 },
  { id: 'e11', name: 'Paul Rudd', initials: 'PR', hasLicense: false, phone: '(904) 555-0111', rank: 6 },
  { id: 'e12', name: 'Brie Larson', initials: 'BL', hasLicense: true, phone: '(904) 555-0112', rank: 8 },
  { id: 'e13', name: 'Tom Holland', initials: 'TH', hasLicense: false, phone: '(904) 555-0113', rank: 3 },
  { id: 'e14', name: 'Zendaya Coleman', initials: 'ZC', hasLicense: true, phone: '(904) 555-0114', rank: 7 },
];

export const INITIAL_TRUCKS: Truck[] = [
  { id: 't1', name: 'Truck 1', capacity: 6, fuelLevel: 85, ready: true, crewIds: [], jobIds: [] },
  { id: 't2', name: 'Truck 2', capacity: 6, fuelLevel: 92, ready: true, crewIds: [], jobIds: [] },
  { id: 't3', name: 'Truck 3', capacity: 4, fuelLevel: 45, ready: false, crewIds: [], jobIds: [] },
  { id: 't4', name: 'Truck 4', capacity: 6, fuelLevel: 70, ready: true, crewIds: [], jobIds: [] },
  { id: 't5', name: 'Truck 5', capacity: 4, fuelLevel: 100, ready: true, crewIds: [], jobIds: [] },
  { id: 't6', name: 'Truck 6', capacity: 6, fuelLevel: 25, ready: false, crewIds: [], jobIds: [] },
];

export const INITIAL_JOBS: Job[] = [
  { 
    id: 'j1', 
    time: '9:00 AM', 
    customerName: 'Anderson, Paul', 
    customerPhone: '(904) 123-4567',
    fromTo: 'Jax Bch → PV', 
    flags: [JobFlag.STAIRS, JobFlag.HEAVY],
    notes: 'Large mahogany desk in the master bedroom needs extra padding. 2nd floor access via narrow stairs.'
  },
  { 
    id: 'j2', 
    time: '10:30 AM', 
    customerName: 'Gomez, Maria', 
    customerPhone: '(904) 234-5678',
    fromTo: 'Nocatee → Mandarin', 
    flags: [JobFlag.STORAGE],
    notes: 'Moving into short-term storage. Boxes should be organized by room labels. Fragile crystal set in blue bins.'
  },
  { 
    id: 'j3', 
    time: '11:30–1:30', 
    customerName: 'Skyline Corp', 
    customerPhone: '(904) 345-6789',
    fromTo: 'Downtown → St. Johns', 
    flags: [JobFlag.MULTI_STOP, JobFlag.HEAVY],
    notes: 'Commercial office move. Picking up filing cabinets at secondary location first. Building manager contact: Mike.'
  },
  { 
    id: 'j4', 
    time: '12:00 PM', 
    customerName: 'Baker Residence', 
    customerPhone: '(904) 456-7890',
    fromTo: 'PV → PV South', 
    flags: [JobFlag.PIANO],
    notes: 'Upright piano. Requires specialized dolly and 4-person crew minimum for the landing.'
  },
  { 
    id: 'j5', 
    time: '1:45 PM', 
    customerName: 'Miller, Steve', 
    customerPhone: '(904) 567-8901',
    fromTo: 'Oakleaf → Julington', 
    flags: [],
    notes: 'Standard 3-bedroom home. Customer is very organized, all boxes are pre-taped.'
  },
  { 
    id: 'j6', 
    time: 'Afternoon (3:00)', 
    customerName: 'Tech Solutions', 
    customerPhone: '(904) 678-9012',
    fromTo: 'Southside → Jax', 
    flags: [JobFlag.MULTI_STOP],
    notes: 'Computer equipment move. Anti-static wraps provided by client. Clean truck bed mandatory.'
  },
  { 
    id: 'j7', 
    time: '3:30 PM', 
    customerName: 'Henderson, L.', 
    customerPhone: '(904) 789-0123',
    fromTo: 'Marsh Landing → World', 
    flags: [JobFlag.STAIRS],
    notes: 'Apartment move. Use the service elevator on the north side of the building.'
  },
  { 
    id: 'j8', 
    time: '4:00 PM', 
    customerName: 'Davis Moving', 
    customerPhone: '(904) 890-1234',
    fromTo: 'Riverside → Ortega', 
    flags: [JobFlag.HEAVY],
    notes: 'Safe relocation. Heavy equipment required. Confirm floor strength at destination.'
  },
  { 
    id: 'j9', 
    time: '4:30 PM', 
    customerName: 'Wilfred Co.', 
    customerPhone: '(904) 901-2345',
    fromTo: 'PV Lakes → Beaches', 
    flags: [JobFlag.STORAGE, JobFlag.STAIRS],
    notes: 'End of month rush. Multiple delicate oil paintings. Temp controlled storage requested.'
  },
  { 
    id: 'j10', 
    time: '5:00 PM', 
    customerName: 'Coastal Living', 
    customerPhone: '(904) 012-3456',
    fromTo: 'Fernandina → Jax', 
    flags: [JobFlag.PIANO, JobFlag.MULTI_STOP],
    notes: 'Long haul. Baby grand piano. Second stop at tuner shop for drop-off.'
  },
];

export const FLAG_ICONS = {
  [JobFlag.STAIRS]: <ArrowUpCircle size={14} className="text-sky-400" />,
  [JobFlag.HEAVY]: <Weight size={14} className="text-orange-400" />,
  [JobFlag.STORAGE]: <Box size={14} className="text-blue-400" />,
  [JobFlag.PIANO]: <Music size={14} className="text-purple-400" />,
  [JobFlag.MULTI_STOP]: <MapPin size={14} className="text-emerald-400" />,
};
