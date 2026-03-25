import React from 'react';
import { ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import MapContextMetrics from './MapContextMetrics.jsx';

export default function MapSidebar({
  level,
  districts,
  acs,
  booths,
  sections,
  selectedDistrict,
  selectedAC,
  selectedBooth,
  handleSelectDistrict,
  handleSelectAC,
  handleSelectBooth,
  setLevel
}) {
  return (
    <div className="w-full flex flex-col md:flex-row bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-lg shadow-sm overflow-hidden relative z-10 max-h-[30vh]">
      
      {/* Navigation Lists */}
      <div className="p-4 flex-1 overflow-y-auto">
        {level === 'DISTRICT' && (
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg mb-2 border-b pb-2">Districts ({districts.length})</h3>
            {districts.map(d => (
              <button key={d.districtId} onClick={() => handleSelectDistrict(d)} className="p-3 text-left border rounded hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors flex justify-between items-center">
                <span>{d.districtName}</span>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        )}
        
        {level === 'AC' && (
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg mb-2 border-b pb-2">{selectedDistrict?.districtName} - ACs ({acs.length})</h3>
            {acs.map(ac => (
              <button key={ac.acNumber} onClick={() => handleSelectAC(ac)} className="p-3 text-left border rounded hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors flex justify-between items-center">
                <span>{ac.acNumber} - {ac.acName}</span>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        )}

        {(level === 'BOOTH' || level === 'SECTION') && (
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg border-b pb-2">AC {selectedAC?.acNumber} Booths ({booths.length})</h3>
            {booths.map(booth => (
              <button key={booth.partId} onClick={() => handleSelectBooth(booth)} className={`w-full p-3 text-left border rounded transition-colors ${selectedBooth?.partId === booth.partId ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900'}`}>
                <div className="font-medium text-sm">{booth.partNumber} - {booth.partName}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION PANEL OVERLAY IN SIDEBAR */}
      {level === 'SECTION' && selectedBooth && (
        <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-zinc-800 p-4 shadow-lg z-20 flex flex-col">
          <button onClick={() => setLevel('BOOTH')} className="text-blue-500 text-sm mb-4 text-left hover:underline">
            &larr; Back to Booths
          </button>
          
          <h3 className="font-bold text-lg mb-1">{selectedBooth.partName}</h3>
          <p className="text-sm text-gray-500 mb-4">{selectedBooth.pollingStationAddress}</p>
          
          <div className="mb-4">
            {sections.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle size={14} /> Sections Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium dark:bg-red-900/30 dark:text-red-400">
                <XCircle size={14} /> No Sections Available
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {sections.map(sec => (
                <li key={sec.sectionId} className="p-3 border rounded text-sm bg-gray-50 dark:bg-zinc-700">
                  <span className="font-semibold">Sec {sec.sectionId}:</span> {sec.sectionName}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* RIGHT: Chart.js Metrics Panel */}
      <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l dark:border-zinc-700">
        <MapContextMetrics boothsCount={booths.length} sectionsCount={sections.length} />
      </div>
    </div>
  );
}
