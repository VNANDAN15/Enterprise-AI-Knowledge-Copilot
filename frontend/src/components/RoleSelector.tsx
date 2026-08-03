import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { PersonaRole } from '../store/useAppStore';
import { GraduationCap, Presentation, Briefcase, UserCheck, ChevronDown, Sparkles } from 'lucide-react';

interface RoleOption {
  id: PersonaRole;
  label: string;
  description: string;
  icon: React.ElementType;
  disabled: boolean;
}

const ROLES: RoleOption[] = [
  {
    id: 'student',
    label: 'Student',
    description: 'Quizzes, Flashcards, Study Checklists & Plain-Language Explanations',
    icon: GraduationCap,
    disabled: false
  },
  {
    id: 'teacher',
    label: 'Teacher',
    description: 'Question Banks, Rubrics & Document Topic Coverage Gap Auditing',
    icon: Presentation,
    disabled: false
  },
  {
    id: 'manager',
    label: 'Manager',
    description: 'Executive Briefings, Action Items & KPI Extractors',
    icon: Briefcase,
    disabled: false
  },
  {
    id: 'employee',
    label: 'Employee',
    description: 'Standard Operating Procedures, Onboarding & Compliance SOPs',
    icon: UserCheck,
    disabled: false
  }
];

export default function RoleSelector() {
  const { currentRole, setCurrentRole } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeRoleConfig = ROLES.find(r => r.id === currentRole) || ROLES[0];
  const IconComponent = activeRoleConfig.icon;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/30 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 transition-all text-xs font-semibold shadow-sm"
      >
        <div className="p-1 rounded-lg bg-indigo-600 text-white shadow shadow-indigo-500/30">
          <IconComponent className="w-3.5 h-3.5" />
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-[10px] text-indigo-500/80 dark:text-indigo-400/80 font-mono uppercase tracking-wider block -mb-0.5">Active Persona</span>
          <span className="font-bold text-xs">{activeRoleConfig.label} Mode</span>
        </div>
        <span className="font-bold text-xs sm:hidden">{activeRoleConfig.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Role Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Select Copilot Persona</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          </div>

          <div className="py-1.5 space-y-1">
            {ROLES.map((role) => {
              const RoleIcon = role.icon;
              const isSelected = role.id === currentRole;

              return (
                <button
                  key={role.id}
                  disabled={role.disabled}
                  onClick={() => {
                    if (!role.disabled) {
                      setCurrentRole(role.id);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 border ${
                    role.disabled
                      ? 'opacity-50 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/20 border-transparent'
                      : isSelected
                        ? 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/40 text-slate-900 dark:text-white'
                        : 'border-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow' 
                      : role.disabled
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <RoleIcon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold block">{role.label}</span>
                      {role.disabled && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {role.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
