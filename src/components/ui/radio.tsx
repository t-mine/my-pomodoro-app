import React, { ChangeEvent } from 'react';

interface RadioProps {
  name: string;
  selectedValue: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;  // ChangeEvent を使う
  options: { value: string; label: string }[];
}

const Radio: React.FC<RadioProps> = ({
  name,
  selectedValue,
  onChange,
  options,
}) => {
  return (
    <div className="flex w-full mt-2 border border-gray-500 rounded">
      {options.map((option) => (
        <label key={option.value} className="flex items-center cursor-pointer w-full">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={(e) => onChange(e)}  // ChangeEvent をそのまま渡す
            className="hidden"
          />
          <span
            className={`w-full h-8 flex items-center justify-center text-sm text-center cursor-pointer ${
              selectedValue === option.value
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gray-800 text-gray-600 hover:bg-gray-700 hover:text-gray-400'
            }`}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
};

export default Radio;
