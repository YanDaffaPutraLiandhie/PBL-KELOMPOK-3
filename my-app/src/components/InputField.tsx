import React from "react";
import { Info } from "lucide-react";

interface InputFieldProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  colorClass: string;
  info: string;
  description: string;
  min: number;
  max: number;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  icon,
  colorClass,
  info,
  description,
  min,
  max,
}) => (
  <div className={`flex items-center gap-3 bg-[var(--bg-600)] rounded-lg px-4 py-3 border border-[var(--border)] flex-1`}>
    {icon}
    <div className="w-full">
      <div className="flex items-center gap-1 mb-1">
        <label className={`block text-xs font-semibold ${colorClass}`}>{label}</label>
        <span title={info}><Info className={`w-3 h-3 ${colorClass}`} /></span>
      </div>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 rounded bg-transparent border ${colorClass.replace('text-', 'border-')} focus:outline-none focus:ring-2 focus:ring-${colorClass.split('-')[1]}-400`}
        min={min}
        max={max}
      />
      <span className={`text-xs ${colorClass.replace('font-semibold', 'font-normal')} opacity-80`}>{description}</span>
    </div>
  </div>
);

export default InputField;
