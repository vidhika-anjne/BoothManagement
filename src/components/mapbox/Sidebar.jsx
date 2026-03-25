/**
 * Sidebar.jsx — Left navigation panel for drill-down hierarchy.
 * Displays District → AC → Booth lists with loading states and badge indicators.
 */

import React from 'react';
import {
  ChevronRight, ArrowLeft, MapPin, Building2,
  Navigation, CheckCircle, XCircle, Loader2
} from 'lucide-react';

export default function Sidebar({
  level, loading,
  districts, acs, booths, sections,
  selectedDistrict, selectedAC, selectedBooth,
  onSelectDistrict, onSelectAC, onSelectBooth,
  onBack, onReset,
}) {
  return (
    <aside className="w-80 shrink-0 flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 h-full shadow-lg z-10">

      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-gradient-to-r from-indigo-600 to-blue-600">
        <h1 className="text-white font-bold text-lg tracking-tight">Booth Map</h1>
        <p className="text-indigo-200 text-xs mt-0.5">Hyper-local constituency explorer</p>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 py-2.5 text-xs flex flex-wrap items-center gap-1 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <button onClick={onReset} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Delhi</button>
        {selectedDistrict && (
          <>
            <ChevronRight className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-[100px]">{selectedDistrict.districtName || selectedDistrict.name}</span>
          </>
        )}
        {selectedAC && (
          <>
            <ChevronRight className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-[100px]">{selectedAC.acName || selectedAC.name}</span>
          </>
        )}
        {selectedBooth && (
          <>
            <ChevronRight className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-[80px]">Booth {selectedBooth.partNumber}</span>
          </>
        )}
      </div>

      {/* Back Button */}
      {level !== 'DISTRICT' && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          </div>
        )}

        {/* DISTRICT LIST */}
        {!loading && level === 'DISTRICT' && (
          <>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1 mb-2">Select District</p>
            {districts.map((d, i) => (
              <button
                key={d.districtId || i}
                onClick={() => onSelectDistrict(d)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 flex-1">{d.districtName || d.name}</span>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-400 transition-colors" />
              </button>
            ))}
          </>
        )}

        {/* AC LIST */}
        {!loading && level === 'AC' && (
          <>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1 mb-2">Assembly Constituencies ({acs.length})</p>
            {acs.map((ac, i) => (
              <button
                key={ac.acNumber || i}
                onClick={() => onSelectAC(ac)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 truncate">{ac.acName || ac.name}</p>
                  <p className="text-xs text-zinc-400">AC No. {ac.acNumber}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
              </button>
            ))}
          </>
        )}

        {/* BOOTH LIST */}
        {!loading && (level === 'BOOTH' || level === 'SECTION') && !selectedBooth && (
          <>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1 mb-2">Polling Booths ({booths.length})</p>
            {booths.map((b, i) => (
              <button
                key={b.partId || i}
                onClick={() => onSelectBooth(b)}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Booth {b.partNumber} — {b.partName}</p>
                  {b.pollingStationName && (
                    <p className="text-xs text-zinc-400 truncate">{b.pollingStationName}</p>
                  )}
                </div>
              </button>
            ))}
          </>
        )}

        {/* SECTION VIEW (when booth selected) */}
        {!loading && level === 'SECTION' && selectedBooth && (
          <SectionPanel booth={selectedBooth} sections={sections} />
        )}
      </div>
    </aside>
  );
}

function SectionPanel({ booth, sections }) {
  const hasSections = sections.length > 0;
  return (
    <div className="space-y-3">
      {/* Booth Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-800">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Selected Booth</p>
        <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Booth {booth.partNumber}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{booth.partName}</p>
        {booth.pollingStationName && (
          <p className="text-xs text-zinc-500 mt-1">{booth.pollingStationName}</p>
        )}
        {booth.pollingStationAddress && (
          <p className="text-xs text-zinc-400 mt-0.5 flex items-start gap-1">
            <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
            {booth.pollingStationAddress}
          </p>
        )}
        {/* Badge */}
        <div className="mt-2">
          {hasSections ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              <CheckCircle className="w-3 h-3" /> Sections Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
              <XCircle className="w-3 h-3" /> No Sections
            </span>
          )}
        </div>
      </div>

      {/* Section List */}
      {hasSections ? (
        <>
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">Sections ({sections.length})</p>
          {sections.map((sec, i) => (
            <div key={sec.sectionId ?? i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
              <div className="w-7 h-7 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                {sec.sectionId}
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-200 flex-1">{sec.sectionName}</p>
            </div>
          ))}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 py-10 px-4 text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No sections available for this booth</p>
        </div>
      )}
    </div>
  );
}
