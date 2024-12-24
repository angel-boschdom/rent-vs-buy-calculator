import React, { useState, useEffect, ChangeEvent } from 'react';
import TooltipIcon from './TooltipIcon';

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
    <fieldset className="mb-5">
      {/* Label + Tooltip in a flex container */}
      <label className="flex justify-center items-center text-center font-semibold mb-2">
        {label}
        {tooltipText && <TooltipIcon text={tooltipText} />}
      </label>

      {/* Toggle container */}
      <div className="flex flex-wrap justify-center gap-3 mb-5">
        {/* Map each value */}
        {values.map((value, index) => {
          const checked = selectedIndex === index + 1 && !isCustomOptionSelected;
          return (
            <React.Fragment key={`${name}-value-${value}`}>
              <input
                type="radio"
                name={`customradio_${name}`}
                value={String(value)}
                id={`radiovalue${value}_${name}`}
                className="hidden"
                checked={checked}
                onChange={(e) => handleRadioChange(e, index)}
              />
              <label
                htmlFor={`radiovalue${value}_${name}`}
                className={
                  `cursor-pointer px-4 py-2 rounded transition-colors 
                   ${checked ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}
                  `
                }
              >
                {value}
              </label>
            </React.Fragment>
          );
        })}

        {/* Custom radio */}
        <input
          type="radio"
          name={`customradio_${name}`}
          value="custom"
          id={`radiovalueCustom_${name}`}
          className="hidden"
          checked={isCustomOptionSelected}
          onChange={() => setSelectedIndex(4)}
        />
        <label
          htmlFor={`radiovalueCustom_${name}`}
          className={
            `cursor-pointer px-4 py-2 rounded transition-colors 
             ${isCustomOptionSelected ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}
            `
          }
        >
          Custom
        </label>
      </div>

      {/* Custom text field, shown conditionally */}
      {isCustomOptionSelected && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Enter custom value"
            value={customText}
            onChange={handleCustomInputChange}
            className="w-full p-2 border border-gray-300 rounded 
                       focus:outline-none focus:border-primary 
                       focus:shadow-md"
          />
        </div>
      )}
    </fieldset>
  );
};

export default RadioButtonCustom;