// file: /src/components/RadioButtonCustom/RadioButtonCustom.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import TooltipIcon from '../TooltipIcon/TooltipIcon';
import './RadioButtonCustom.css';

interface RadioButtonCustomProps {
  name: string;
  values: (number | string)[];
  defaultSelectedIndex?: number;
  onValueChange: (value: string) => void;
  label: string;
  tooltipText?: string;
}

const RadioButtonCustom: React.FC<RadioButtonCustomProps> = ({
  name,
  values,
  defaultSelectedIndex,
  onValueChange,
  label,
  tooltipText,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(
    defaultSelectedIndex ? defaultSelectedIndex : 1
  );
  const [customText, setCustomText] = useState('');

  // Determine if custom option is selected
  const isCustomOptionSelected = selectedIndex === 4;

  useEffect(() => {
    if (!isCustomOptionSelected) {
      onValueChange(String(values[selectedIndex - 1]));
    } else {
      onValueChange(customText.trim());
    }
  }, [selectedIndex, customText, isCustomOptionSelected, onValueChange, values]);

  const handleRadioChange = (_e: ChangeEvent<HTMLInputElement>, index: number) => {
    setSelectedIndex(index + 1);
  };

  const handleCustomInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomText(e.target.value);
  };

  return (
    <fieldset className="radio-button-custom">
      {/* We show label + tooltip similarly to how you do in Slider. */}
      <label className="radio-label">
        {label}
        {tooltipText && <TooltipIcon text={tooltipText} />}
      </label>

      <div className="toggle">
        {values.map((value, index) => (
          <React.Fragment key={`${name}-value-${value}`}>
            <input
              type="radio"
              name={`customradio_${name}`}
              value={String(value)}
              id={`radiovalue${value}_${name}`}
              checked={selectedIndex === index + 1 && !isCustomOptionSelected}
              onChange={(e) => handleRadioChange(e, index)}
            />
            <label htmlFor={`radiovalue${value}_${name}`}>{value}</label>
          </React.Fragment>
        ))}

        {/* "Custom" radio */}
        <input
          type="radio"
          name={`customradio_${name}`}
          value="custom"
          id={`radiovalueCustom_${name}`}
          checked={isCustomOptionSelected}
          onChange={() => setSelectedIndex(4)}
        />
        <label htmlFor={`radiovalueCustom_${name}`}>Custom</label>
      </div>

      <div className="custom-input" style={{ display: isCustomOptionSelected ? 'block' : 'none' }}>
        <input
          type="text"
          placeholder="Enter custom value"
          value={customText}
          onChange={handleCustomInputChange}
        />
      </div>
    </fieldset>
  );
};

export default RadioButtonCustom;