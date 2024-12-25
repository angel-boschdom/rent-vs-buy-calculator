import React from 'react';
import TooltipIcon from '@/components/TooltipIcon';

interface SliderProps {
  id: string;
  label: string;
  tooltipText?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChangeValue: (newValue: number) => void;
  valueSuffix?: string;
}

const Slider: React.FC<SliderProps> = ({
  id,
  label,
  tooltipText,
  min,
  max,
  step,
  value,
  onChangeValue,
  valueSuffix = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeValue(Number(e.target.value));
  };

  return (
    <div className="mb-5 text-center">
      <label htmlFor={id} className="block mb-1 font-semibold">
        {label}:{' '}
        <span className="font-bold">{value}{valueSuffix}</span>
        {tooltipText && <TooltipIcon text={tooltipText} />}
      </label>

      {/* 
        Tailwind doesn't have direct styling for <input type="range"> 
        so you can use minimal styling or adopt a custom approach:
      */}
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="
          w-3/4 mt-2 
          accent-primary
          cursor-pointer 
          h-2 rounded-lg 
          bg-gray-300
        "
        style={{ 
          // Optionally style the thumb inlined:
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      />
    </div>
  );
};

export default Slider;