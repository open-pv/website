import React from 'react';

const Slider = ({ value, onChange, min, max, stepSize }) => {
  const handleSliderChange = (event) => {
    const { value } = event.target;
    onChange(Number(value));
  };

  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        step={stepSize}
        value={value}
        onChange={handleSliderChange}
      />
    </div>
  );
};

export default Slider;