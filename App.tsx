
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Home, 
  Undo2, 
  RefreshCcw, 
  Clock, 
  Signal, 
  AlertCircle,
  Truck as TruckIcon,
  Users,
  ClipboardList,
  Phone,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Star,
  MapPin,
  ArrowDown,
  Info,
  ExternalLink,
  MessageSquare,
  Plus,
  Trash2,
  PhoneCall
} from 'lucide-react';
import { Employee, Job, Truck, DragItem, JobFlag } from './types';
import { INITIAL_EMPLOYEES, INITIAL_TRUCKS, INITIAL_JOBS, FLAG_ICONS } from './constants';

// --- Sub-components ---

const TopNav = ({ onUndo, canUndo, onRefresh }: { onUndo: () => void, canUndo: boolean, onRefresh: () => void }) => {
  const dateStr = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  return (
    <div className="h-16 flex items-center justify-between px-6 glass border-b border-sky-500/30 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-2 text-white/80 hover:text-sky-400 transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-sky-500/50">
          <Home size={18} />
          <span className="font-medium text-sm">Home</span>
        </button>
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ${
            canUndo 
              ? 'text-white/80 border-white/10 bg-white/5 hover:text-sky-400 hover:border-sky-500/50' 
              : 'text-white/20 border-white/5 bg-transparent cursor-not-allowed'
          }`}
        >
          <Undo2 size={18} />
          <span className="font-medium text-sm">Undo</span>
        </button>
        <button 
          onClick={onRefresh}
          className="p-2 text-white/80 hover:text-sky-400 transition-colors bg-white/5 rounded-lg border border-white/10 hover:border-sky-500/50"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      <div className="text-center">
        <h1 className="font-tech text-xl font-bold text-white tracking-widest glow-text uppercase">
          Today Manager
        </h1>
        <div className="text-[10px] text-sky-400 font-bold uppercase tracking-tighter opacity-70">
          Ponte Vedra Movers Dispatch
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-right">
          <div className="text-white font-medium text-sm">{dateStr}</div>
          <div className="flex items-center justify-end space-x-2 text-emerald-400 text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeCard = ({ 
  employee, 
  onDragStart,
  sourceTruckId 
}: { 
  employee: Employee; 
  onDragStart: (e: React.DragEvent, id: string, type: 'employee', sourceTruckId?: string) => void;
  sourceTruckId?: string;
}) => {
  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, employee.id, 'employee', sourceTruckId)}
      className="group relative mb-3 p-3 glass border border-white/10 rounded-xl hover:border-sky-400/50 hover:shadow-[0_0_15px_rgba(14,165,233,0.15)] transition-all duration-300 cursor-grab active:cursor-grabbing active:scale-95"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm border border-white/20 shadow-inner">
          {employee.initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm group-hover:text-sky-300 transition-colors">{employee.name}</h3>
            <div className="flex items-center space-x-1 bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-500/30">
              <Star size={10} className="text-sky-400 fill-sky-400" />
              <span className="text-[10px] font-bold text-sky-300">{employee.rank}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-[10px] flex items-center space-x-1 font-bold ${employee.hasLicense ? 'text-emerald-400' : 'text-slate-500'}`}>
              <ShieldCheck size={10} />
              <span>{employee.hasLicense ? 'CDL' : 'NO LIC'}</span>
            </span>
            <span className="text-[10px] text-white/40 flex items-center space-x-1">
              <Phone size={10} />
              <span>{employee.phone}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobCard = ({ 
  job, 
  compact = false,
  onDragStart,
  onViewDetails,
  onDelete,
  sourceTruckId
}: { 
  job: Job; 
  compact?: boolean;
  onDragStart: (e: React.DragEvent, id: string, type: 'job', sourceTruckId?: string) => void;
  onViewDetails: (job: Job) => void;
  onDelete?: (id: string) => void;
  sourceTruckId?: string;
}) => {
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, job.id, 'job', sourceTruckId)}
      onClick={(e) => {
        if (e.defaultPrevented) return;
        onViewDetails(job);
      }}
      className={`relative group glass border border-sky-500/20 rounded-xl hover:border-sky-400/60 transition-all duration-300 cursor-pointer active:scale-95 ${compact ? 'p-2 mb-2 bg-sky-900/10' : 'p-3 mb-3'}`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center space-x-1.5 text-sky-400">
          <Clock size={12} />
          <span className="text-[10px] font-bold tracking-wider">{job.time}</span>
        </div>
        {onDelete && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(job.id);
            }}
            className="text-white/20 hover:text-rose-400 transition-colors p-1"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="flex justify-between items-center">
        <h4 className={`text-white font-bold leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>{job.customerName}</h4>
        <Info size={14} className="text-white/20 group-hover:text-sky-400 transition-colors" />
      </div>
      <div className="flex items-center text-white/50 text-[10px] mt-1 italic">
        <MapPin size={10} className="mr-1 opacity-50" />
        {job.fromTo}
      </div>
    </div>
  );
};

const JobDetailsModal = ({ job, onClose }: { job: Job, onClose: () => void }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg glass border border-sky-400/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(14,165,233,0.3)] animate-in fade-in zoom-in duration-300">
        <div className="bg-sky-500/10 p-6 border-b border-sky-400/20 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 text-sky-400 mb-2">
              <ClipboardList size={20} />
              <span className="font-tech text-xs font-bold tracking-[0.2em] uppercase">Job Specifications</span>
            </div>
            <h2 className="text-2xl font-bold text-white glow-text">{job.customerName}</h2>
            <div className="flex items-center space-x-2 text-white/60 text-sm mt-1">
              <Clock size={14} className="text-sky-400" />
              <span>Scheduled: {job.time}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Customer Phone</label>
              <div className="flex items-center space-x-2 text-white bg-white/5 p-3 rounded-xl border border-white/10">
                <Phone size={16} className="text-sky-400" />
                <span className="font-medium">{job.customerPhone}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Route Path</label>
              <div className="flex items-center space-x-2 text-white bg-white/5 p-3 rounded-xl border border-white/10">
                <MapPin size={16} className="text-sky-400" />
                <span className="font-medium">{job.fromTo}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center">
              <AlertCircle size={14} className="mr-2" /> Dispatcher Notes
            </label>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-white/80 text-sm leading-relaxed italic">
              {job.notes || "No special instructions provided for this contract."}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5 flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center space-x-2"
          >
            <span>Acknowledge & Close</span>
          </button>
          <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all">
            <MessageSquare size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TruckCard = ({ 
  truck, 
  crew, 
  jobs,
  onDrop,
  onDragStart,
  onViewJobDetails
}: { 
  truck: Truck; 
  crew: Employee[];
  jobs: Job[];
  onDrop: (e: React.DragEvent, targetTruckId: string) => void;
  onDragStart: (e: React.DragEvent, id: string, type: 'employee' | 'job', sourceTruckId?: string) => void;
  onViewJobDetails: (job: Job) => void;
}) => {
  const [isOver, setIsOver] = useState(false);
  const isFull = crew.length >= truck.capacity;

  // Determine the Lead based on highest rank
  const leadEmployee = useMemo(() => {
    if (crew.length === 0) return null;
    return [...crew].sort((a, b) => b.rank - a.rank)[0];
  }, [crew]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(e, truck.id);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`glass border transition-all duration-300 rounded-2xl flex flex-col min-h-[220px] overflow-hidden ${
        isOver 
          ? isFull 
            ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' 
            : 'border-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.3)] scale-[1.02]' 
          : 'border-white/10'
      }`}
    >
      <div className="bg-white/5 p-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-2">
          <TruckIcon size={18} className={truck.ready ? 'text-sky-400' : 'text-white/30'} />
          <h2 className="font-tech text-sm font-bold text-white uppercase tracking-wider">{truck.name}</h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-white/40 uppercase font-bold">Fuel</span>
            <div className="w-16 h-1 bg-white/10 rounded-full mt-0.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${truck.fuelLevel < 30 ? 'bg-rose-500' : 'bg-sky-500'}`} 
                style={{ width: `${truck.fuelLevel}%` }}
              ></div>
            </div>
          </div>
          <div className={`p-1 rounded-full ${truck.ready ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
            {truck.ready ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          </div>
        </div>
      </div>

      <div className="p-3 grid grid-cols-2 gap-3 flex-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={`text-[10px] font-bold uppercase tracking-widest flex items-center ${isFull ? 'text-rose-400' : 'text-sky-400'}`}>
              <Users size={12} className="mr-1" /> Crew ({crew.length}/{truck.capacity})
            </h3>
          </div>
          <div className={`min-h-[100px] border border-dashed rounded-lg p-1.5 flex flex-wrap gap-1.5 align-content-start transition-colors ${isFull ? 'border-rose-500/20' : 'border-white/10'}`}>
            {crew.map(person => {
              const isLead = person.id === leadEmployee?.id;
              return (
                <div 
                  key={person.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, person.id, 'employee', truck.id)}
                  className={`group relative h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-grab active:cursor-grabbing shadow-lg shadow-sky-900/20 ${
                    isLead 
                      ? 'bg-sky-400 text-slate-950 border-2 border-white shadow-[0_0_15px_rgba(56,189,248,0.5)] z-10' 
                      : 'bg-sky-500/20 border border-sky-500/40 text-white hover:bg-sky-500 hover:border-sky-300'
                  }`}
                  title={isLead ? `Lead: ${person.name} (SMS Handler)` : person.name}
                >
                  {person.initials}
                  {isLead && (
                    <div className="absolute -bottom-1 -right-1 bg-white text-sky-600 rounded-full p-0.5 border border-sky-400 scale-75">
                      <PhoneCall size={10} />
                    </div>
                  )}
                </div>
              );
            })}
            {crew.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/10 py-6">
                <Users size={20} className="mb-1" />
                <span className="text-[8px] uppercase tracking-tighter">Assign Crew</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center">
            <ClipboardList size={12} className="mr-1" /> Jobs ({jobs.length})
          </h3>
          <div className="min-h-[100px] border border-dashed border-white/10 rounded-lg p-1.5">
            {jobs.map(job => (
              <div key={job.id} className="relative group">
                <JobCard 
                  job={job} 
                  compact 
                  onDragStart={onDragStart}
                  onViewDetails={onViewJobDetails}
                  sourceTruckId={truck.id}
                />
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/10 py-6">
                <ClipboardList size={20} className="mb-1" />
                <span className="text-[8px] uppercase tracking-tighter">Drop Contract</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-sky-950/20 p-2 px-3 border-t border-white/5 flex items-center space-x-3 overflow-x-auto no-scrollbar">
        {truck.fuelLevel < 30 && (
          <div className="flex items-center space-x-1 text-rose-400 text-[9px] font-bold whitespace-nowrap bg-rose-500/10 px-1.5 py-0.5 rounded">
            <AlertCircle size={10} />
            <span>CRITICAL FUEL</span>
          </div>
        )}
        {crew.length === 0 && (
          <div className="flex items-center space-x-1 text-amber-400 text-[9px] font-bold whitespace-nowrap bg-amber-500/10 px-1.5 py-0.5 rounded">
            <Signal size={10} />
            <span>ETA RISK</span>
          </div>
        )}
        <div className="flex items-center space-x-1 text-sky-300 text-[9px] font-bold whitespace-nowrap bg-sky-500/10 px-1.5 py-0.5 rounded">
          <AlertCircle size={10} />
          <span>UPDATE NEEDED</span>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [trucks, setTrucks] = useState<Truck[]>(INITIAL_TRUCKS);
  const [history, setHistory] = useState<Truck[][]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Jobs state explicitly to allow adding/cutting
  const [allJobs, setAllJobs] = useState<Job[]>(INITIAL_JOBS);

  // Computed state for roster and queue
  const rosterEmployees = useMemo(() => {
    const assignedIds = new Set(trucks.flatMap(t => t.crewIds));
    return INITIAL_EMPLOYEES.filter(e => !assignedIds.has(e.id));
  }, [trucks]);

  const queueJobs = useMemo(() => {
    const assignedIds = new Set(trucks.flatMap(t => t.jobIds));
    return allJobs.filter(j => !assignedIds.has(j.id));
  }, [trucks, allJobs]);

  const handleRefresh = useCallback(() => {
    setHistory([]);
    setTrucks(INITIAL_TRUCKS);
    setAllJobs(INITIAL_JOBS);
  }, []);

  const saveHistory = useCallback(() => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(trucks))]);
  }, [trucks]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setTrucks(lastState);
    setHistory(prev => prev.slice(0, -1));
  }, [history]);

  const handleDragStart = (e: React.DragEvent, id: string, type: 'employee' | 'job', sourceTruckId?: string) => {
    const dragData: DragItem = { id, type, sourceTruckId };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.4';
    }, 0);
  };

  const handleDropOnTruck = (e: React.DragEvent, targetTruckId: string) => {
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;
    const dragItem: DragItem = JSON.parse(rawData);
    
    if (dragItem.sourceTruckId === targetTruckId) return;

    saveHistory();

    setTrucks(prevTrucks => {
      const nextTrucks = prevTrucks.map(t => ({ ...t, crewIds: [...t.crewIds], jobIds: [...t.jobIds] }));
      const target = nextTrucks.find(t => t.id === targetTruckId);
      const source = dragItem.sourceTruckId ? nextTrucks.find(t => t.id === dragItem.sourceTruckId) : null;

      if (!target) return prevTrucks;

      if (dragItem.type === 'employee') {
        if (target.crewIds.length >= target.capacity) return prevTrucks;
        if (source) source.crewIds = source.crewIds.filter(id => id !== dragItem.id);
        if (!target.crewIds.includes(dragItem.id)) target.crewIds.push(dragItem.id);
      } else {
        if (source) source.jobIds = source.jobIds.filter(id => id !== dragItem.id);
        if (!target.jobIds.includes(dragItem.id)) target.jobIds.push(dragItem.id);
      }

      return nextTrucks;
    });
  };

  const handleDropOnRoster = (e: React.DragEvent) => {
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;
    const dragItem: DragItem = JSON.parse(rawData);

    if (dragItem.type !== 'employee' || !dragItem.sourceTruckId) return;

    saveHistory();
    setTrucks(prevTrucks => prevTrucks.map(t => {
      if (t.id === dragItem.sourceTruckId) {
        return { ...t, crewIds: t.crewIds.filter(id => id !== dragItem.id) };
      }
      return t;
    }));
  };

  const handleDropOnQueue = (e: React.DragEvent) => {
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;
    const dragItem: DragItem = JSON.parse(rawData);

    if (dragItem.type !== 'job' || !dragItem.sourceTruckId) return;

    saveHistory();
    setTrucks(prevTrucks => prevTrucks.map(t => {
      if (t.id === dragItem.sourceTruckId) {
        return { ...t, jobIds: t.jobIds.filter(id => id !== dragItem.id) };
      }
      return t;
    }));
  };

  const addJob = () => {
    const newJob: Job = {
      id: `j-${Date.now()}`,
      time: 'New Entry',
      customerName: 'New Client',
      customerPhone: '(904) 000-0000',
      fromTo: 'TBD → TBD',
      flags: [],
      notes: 'Please update job details.'
    };
    setAllJobs(prev => [...prev, newJob]);
  };

  const deleteJob = (id: string) => {
    // If job is in a truck, remove it from the truck too
    setTrucks(prev => prev.map(t => ({
      ...t,
      jobIds: t.jobIds.filter(jid => jid !== id)
    })));
    setAllJobs(prev => prev.filter(j => j.id !== id));
  };

  const [rosterOver, setRosterOver] = useState(false);
  const [queueOver, setQueueOver] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white tron-grid overflow-hidden relative">
      <TopNav onUndo={handleUndo} canUndo={history.length > 0} onRefresh={handleRefresh} />

      <main className="flex-1 flex overflow-hidden pt-16 p-6 space-x-6">
        {/* Left Column: Employees (Roster) */}
        <div className="w-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-tech text-xs font-bold text-sky-400 uppercase tracking-[0.2em] flex items-center">
              <Users size={16} className="mr-2" /> Crew Roster
            </h2>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
              {rosterEmployees.length} AVAILABLE
            </span>
          </div>
          <div 
            onDragOver={(e) => { e.preventDefault(); setRosterOver(true); }}
            onDragLeave={() => setRosterOver(false)}
            onDrop={(e) => { handleDropOnRoster(e); setRosterOver(false); }}
            className={`flex-1 overflow-y-auto pr-2 no-scrollbar space-y-1 rounded-xl transition-all duration-300 ${
              rosterOver ? 'bg-sky-500/5 ring-2 ring-sky-400/50 scale-[1.01]' : ''
            }`}
          >
            {rosterOver && (
              <div className="flex items-center justify-center py-4 border-2 border-dashed border-sky-400/50 rounded-xl mb-3 animate-pulse bg-sky-500/5">
                <ArrowDown size={24} className="text-sky-400" />
                <span className="ml-2 text-xs font-bold text-sky-400 uppercase">Drop to Unassign</span>
              </div>
            )}
            {rosterEmployees.map(emp => (
              <EmployeeCard key={emp.id} employee={emp} onDragStart={handleDragStart} />
            ))}
          </div>
        </div>

        {/* Center Column: Trucks */}
        <div className="flex-1 flex flex-col space-y-6 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-3 gap-6">
            {trucks.map(truck => (
              <TruckCard 
                key={truck.id} 
                truck={truck} 
                crew={INITIAL_EMPLOYEES.filter(e => truck.crewIds.includes(e.id))}
                jobs={allJobs.filter(j => truck.jobIds.includes(j.id))}
                onDrop={handleDropOnTruck}
                onDragStart={handleDragStart}
                onViewJobDetails={setSelectedJob}
              />
            ))}
          </div>

          <div className="glass p-4 rounded-2xl border border-sky-500/20 flex items-center justify-between shadow-2xl">
            <div className="flex items-center space-x-6">
               <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span className="text-[10px] font-bold text-white/60 tracking-wider">SYSTEMS NOMINAL</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                <span className="text-[10px] font-bold text-white/60 tracking-wider">{queueJobs.length} PENDING ASSIGNMENTS</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20">
              <Signal size={14} className="text-sky-400" />
              <span className="text-[10px] font-tech text-sky-400 tracking-widest">NETWORK: ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Right Column: Queue */}
        <div className="w-[320px] flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
             <h2 className="font-tech text-xs font-bold text-sky-400 uppercase tracking-[0.2em] flex items-center">
              <ClipboardList size={16} className="mr-2" /> Job Queue
            </h2>
            <button 
              onClick={addJob}
              className="p-1.5 bg-sky-500/10 border border-sky-500/30 rounded text-sky-400 hover:bg-sky-500 hover:text-white transition-all"
              title="Add New Job"
            >
              <Plus size={16} />
            </button>
          </div>
          <div 
            onDragOver={(e) => { e.preventDefault(); setQueueOver(true); }}
            onDragLeave={() => setQueueOver(false)}
            onDrop={(e) => { handleDropOnQueue(e); setQueueOver(false); }}
            className={`flex-1 overflow-y-auto pr-2 no-scrollbar rounded-xl transition-all duration-300 ${
              queueOver ? 'bg-sky-500/5 ring-2 ring-sky-400/50 scale-[1.01]' : ''
            }`}
          >
            {queueOver && (
              <div className="flex items-center justify-center py-4 border-2 border-dashed border-sky-400/50 rounded-xl mb-3 animate-pulse bg-sky-500/5">
                <ArrowDown size={24} className="text-sky-400" />
                <span className="ml-2 text-xs font-bold text-sky-400 uppercase">Drop to Return</span>
              </div>
            )}
            {queueJobs.length > 0 ? (
              queueJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onDragStart={handleDragStart} 
                  onViewDetails={setSelectedJob}
                  onDelete={deleteJob}
                />
              ))
            ) : !queueOver && (
              <div className="flex flex-col items-center justify-center h-40 glass rounded-2xl border border-dashed border-white/10 opacity-40">
                <CheckCircle2 size={32} className="mb-2" />
                <span className="text-xs uppercase font-bold tracking-widest">Queue Cleared</span>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50 shadow-[0_-4px_20px_rgba(14,165,233,0.5)]"></div>

      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
}
