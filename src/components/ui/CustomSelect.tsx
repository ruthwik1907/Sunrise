import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  label, 
  options, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-bold text-slate-700 tracking-tight">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          className={`
            appearance-none w-full px-4 py-3 bg-white 
            border-2 border-slate-100 rounded-2xl
            text-slate-900 text-sm font-medium
            focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10
            transition-all cursor-pointer
            ${error ? 'border-red-500 focus:ring-red-500/10' : 'hover:border-slate-200'}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none group-focus-within:text-indigo-500 text-slate-400 transition-colors">
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
      {error && (
        <p className="text-xs font-bold text-red-500 mt-1 uppercase tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
};
