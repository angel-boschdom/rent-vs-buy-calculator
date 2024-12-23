import React, { useState } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update if using mouse or if actually dragging on touch device
    if (!e.nativeEvent.type.includes('touch') || isDragging) {
      onChangeValue(Number(e.target.value));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent accidental touches while scrolling
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setIsDragging(true);
    const input = e.target as HTMLInputElement;
    const touch = e.touches[0];
    const rect = input.getBoundingClientRect();
    const pos = (touch.clientX - rect.left) / rect.width;
    const newValue = min + pos * (max - min);
    onChangeValue(Math.min(max, Math.max(min, Math.round(newValue / step) * step)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="slider-container">
      <label htmlFor={id}>
        {label}: <span className="slider-value">{value}</span>{valueSuffix}{' '}
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

export default Slider;
