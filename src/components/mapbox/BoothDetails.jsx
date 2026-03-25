/**
 * BoothDetails.jsx — Popup card shown inside the map on booth click.
 * Displays name, part number, station name, address, and section badge.
 */

import React from 'react';
import { MapPin, Hash, Building, CheckCircle, XCircle, X } from 'lucide-react';

export default function BoothDetails({ booth, sections, onClose }) {
  if (!booth) return null;
  const hasSections = Array.isArray(sections) && sections.length > 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 p-4 min-w-[220px] max-w-[280px] relative">

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 flex items-center justify-center transition-colors"
      >
        <X className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
      </button>

      {/* Booth Name */}
      <h3 className="font-bold text-zinc-800 dark:text-zinc-100 pr-7 leading-tight mb-1">
        {booth.partName || `Booth ${booth.partNumber}`}
      </h3>

      {/* Meta rows */}
      <div className="space-y-1.5 mt-2">
        <Row icon={<Hash className="w-3.5 h-3.5" />} label="Part No." value={booth.partNumber} />
        {booth.pollingStationName && (
          <Row icon={<Building className="w-3.5 h-3.5" />} label="Station" value={booth.pollingStationName} />
        )}
        {booth.pollingStationAddress && (
          <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={booth.pollingStationAddress} />
        )}
      </div>

      {/* Section Badge */}
      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
        {hasSections ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            {sections.length} Section{sections.length > 1 ? 's' : ''} Available
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            No Sections Available
          </span>
        )}
      </div>

      {/* Section List (compact) */}
      {hasSections && (
        <ul className="mt-2 space-y-1 max-h-28 overflow-y-auto pr-1">
          {sections.map((sec, i) => (
            <li key={sec.sectionId ?? i} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <span className="w-5 h-5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                {sec.sectionId}
              </span>
              <span className="truncate">{sec.sectionName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-zinc-400 mt-0.5 shrink-0">{icon}</span>
      <span className="text-zinc-500 shrink-0">{label}:</span>
      <span className="text-zinc-700 dark:text-zinc-200 break-words">{value}</span>
    </div>
  );
}
