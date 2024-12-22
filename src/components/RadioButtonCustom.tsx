// file: /src/components/RadioButtonCustom.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';

interface RadioButtonCustomProps {
  name: string;                   // Unique name for the radio group
  values: (number | string)[];    // The set of radio options (e.g., [20, 25, 30])
  defaultSelectedIndex?: number;  // Which option is selected by default (1-based for consistency with original code)
  onValueChange: (value: string) => void; 
}

const RadioButtonCustom: React.FC<RadioButtonCustomProps> = ({
  name,
  values,
  defaultSelectedIndex,
  onValueChange,
}) => {
  // We handle an optional "custom" input as the 4th position in the original code. 
  // If you want that exact approach, you can replicate it. 
  // For simplicity, let's replicate your original logic: we show "Custom" if the user selects the 4th radio.
  // We'll store:
  //  - which radio index is currently selected (1-based or 0-based)
  //  - the custom text
  const [selectedIndex, setSelectedIndex] = useState<number>(
    defaultSelectedIndex ? defaultSelectedIndex : 1
  );
  const [customText, setCustomText] = useState('');

  // If "custom" is the last in the list, we check if selectedIndex matches that.
  const isCustomOptionSelected = selectedIndex === 4; // following original pattern

  useEffect(() => {
    // On mount or whenever selectedIndex or customText changes, emit the "value-has-been-modified"
    if (!isCustomOptionSelected) {
      onValueChange(String(values[selectedIndex - 1])); 
    } else {
      onValueChange(customText.trim());
    }
  }, [selectedIndex, customText]);

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    setSelectedIndex(index + 1); // keep the old 1-based approach
  };

  const handleCustomInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomText(e.target.value);
  };

  return (
    <fieldset>
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