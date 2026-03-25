import React from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';

export default function MapBreadcrumbs({ level, selectedDistrict, selectedAC, selectedBooth, handleReset, handleSelectDistrict, handleSelectAC }) {
  return (
    <div className="mb-4 flex justify-between items-end">
      <div>
        <h1 className="text-2xl font-bold">AI Booth Management</h1>
        <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
          <span className={`cursor-pointer hover:text-blue-500 ${level === 'DISTRICT' ? 'font-bold' : ''}`} onClick={handleReset}>Delhi</span>
          
          {selectedDistrict && (
            <>
              <ChevronRight size={14} /> 
              <span className={`cursor-pointer hover:text-blue-500 ${level === 'AC' ? 'font-bold' : ''}`} onClick={() => handleSelectDistrict(selectedDistrict)}>
                {selectedDistrict.districtName}
              </span>
            </>
          )}
          
          {selectedAC && (
            <>
              <ChevronRight size={14} /> 
              <span className={`cursor-pointer hover:text-blue-500 ${level === 'BOOTH' ? 'font-bold' : ''}`} onClick={() => handleSelectAC(selectedAC)}>
                AC {selectedAC.acNumber}
              </span>
            </>
          )}
          
          {selectedBooth && (
            <>
              <ChevronRight size={14} /> 
              <span className="font-bold">{selectedBooth.partName}</span>
            </>
          )}
        </div>
      </div>
      <button 
        onClick={handleReset} 
        className="flex items-center gap-1 text-sm bg-gray-200 dark:bg-zinc-700 px-3 py-1.5 rounded hover:bg-gray-300 transition-colors"
      >
        <RotateCcw size={14} /> Reset View
      </button>
    </div>
  );
}
