import React from 'react';
import TooltipIcon from '../TooltipIcon/TooltipIcon';
import './Slider.css';

interface SliderProps {
  id: string;
  label: string;
  tooltipText?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChangeValue: (newValue: number) => void;
  valueSuffix?: string; // e.g. " years old"
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
    <div className="slider-container">
      <label htmlFor={id}>
        {label}: <span className="slider-value">{value}</span>
        {valueSuffix}{' '}
        {tooltipText && <TooltipIcon text={tooltipText} />}
      </label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        className="slider"
        onChange={handleChange}
      />
    </div>
  );
};

export default Slider;