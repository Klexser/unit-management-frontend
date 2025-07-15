// src/components/FloorSelector.js
import React from 'react';

function FloorSelector({ levels, selectedLevel, onSelectLevel }) {
  return (
    <div className="flex space-x-2">
      <label htmlFor="floor-select" className="sr-only">Select Floor</label>
      <select
        id="floor-select"
        value={selectedLevel}
        onChange={(e) => onSelectLevel(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
      >
        {levels.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FloorSelector;