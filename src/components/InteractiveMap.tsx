import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Complaint, IssueCategory, IssueStatus } from '../types/index.ts';
import { MapPin, AlertCircle, CheckCircle, Clock, ShieldAlert, Layers } from 'lucide-react';

interface InteractiveMapProps {
  complaints: Complaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: Complaint) => void;
  onLocationPick?: (coords: { latitude: number; longitude: number; address?: string }) => void;
  isPickerMode?: boolean;
  pickerCoords?: { latitude: number; longitude: number } | null;
  height?: string;
  showFilters?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Road Damage': '#2563EB', // Blue
  'Garbage Overflow': '#10B981', // Emerald
  'Water Leakage': '#06B6D4', // Cyan
  'Drainage Blockage': '#8B5CF6', // Purple
  'Streetlight Failure': '#F59E0B', // Amber
  'Public Infrastructure Damage': '#EC4899', // Pink
  'Water Stagnation': '#0284C7',
  'Other Civic Issues': '#64748B'
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  onLocationPick,
  isPickerMode = false,
  pickerCoords,
  height = '500px',
  showFilters = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center: Bengaluru (12.9716, 77.5946)
    const initialLat = pickerCoords?.latitude || (complaints.length > 0 ? complaints[0].location.latitude : 12.9716);
    const initialLng = pickerCoords?.longitude || (complaints.length > 0 ? complaints[0].location.longitude : 77.5946);

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Handle clicks if in picker mode
    if (isPickerMode && onLocationPick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onLocationPick({
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        });
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Picker Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isPickerMode) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }

    if (pickerCoords && pickerCoords.latitude && pickerCoords.longitude) {
      const pickerIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="background-color: #DC2626; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); border: 2px solid white;">
            <div style="transform: rotate(45deg); width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      pickerMarkerRef.current = L.marker([pickerCoords.latitude, pickerCoords.longitude], {
        icon: pickerIcon,
        draggable: true
      }).addTo(map);

      pickerMarkerRef.current.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        if (onLocationPick) {
          onLocationPick({
            latitude: Number(pos.lat.toFixed(6)),
            longitude: Number(pos.lng.toFixed(6)),
            address: `Coordinates: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`
          });
        }
      });

      map.panTo([pickerCoords.latitude, pickerCoords.longitude]);
    }
  }, [pickerCoords, isPickerMode, onLocationPick]);

  // Update Complaint Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    let filtered = complaints;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(c => c.status === selectedStatus);
    }

    filtered.forEach(complaint => {
      const color = CATEGORY_COLORS[complaint.category] || '#2563EB';
      const isCritical = complaint.priority === 'Critical';
      const isSelected = complaint.id === selectedComplaintId;

      const markerHtml = `
        <div style="
          background-color: ${color};
          width: ${isSelected ? '36px' : '28px'};
          height: ${isSelected ? '36px' : '28px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 2px solid ${isCritical ? '#DC2626' : '#FFFFFF'};
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          cursor: pointer;
          transition: transform 0.2s ease;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        ">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-civic-pin',
        html: markerHtml,
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14]
      });

      const marker = L.marker([complaint.location.latitude, complaint.location.longitude], {
        icon: customIcon
      });

      const popupContent = `
        <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748B; margin-bottom: 2px;">
            ${complaint.complaintNumber} · ${complaint.category}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0F172A; line-height: 1.3; margin-bottom: 6px;">
            ${complaint.title}
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 12px;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 11px; background-color: ${complaint.priority === 'Critical' ? '#FEE2E2' : '#EFF6FF'}; color: ${complaint.priority === 'Critical' ? '#DC2626' : '#1D4ED8'};">
              ${complaint.priority} (${complaint.priorityScore}/100)
            </span>
            <span style="font-size: 11px; color: #475569; font-weight: 600;">
              ${complaint.status}
            </span>
          </div>
          <div style="font-size: 12px; color: #475569; margin-bottom: 10px; line-height: 1.4;">
            ${complaint.location.address}
          </div>
          <button id="view-complaint-${complaint.id}" style="
            width: 100%;
            background-color: #0F172A;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          ">
            View Details & Timeline
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-complaint-${complaint.id}`);
        if (btn && onSelectComplaint) {
          btn.onclick = () => onSelectComplaint(complaint);
        }
      });

      marker.addTo(markersLayer);
    });
  }, [complaints, selectedCategory, selectedStatus, selectedComplaintId, onSelectComplaint]);

  const categories: IssueCategory[] = [
    'Road Damage',
    'Garbage Overflow',
    'Water Leakage',
    'Drainage Blockage',
    'Streetlight Failure',
    'Public Infrastructure Damage'
  ];

  return (
    <div className="relative flex flex-col w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {showFilters && !isPickerMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1 whitespace-nowrap">Category:</span>
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All ({complaints.length})
            </button>
            {categories.map(cat => {
              const count = complaints.filter(c => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] || '#2563EB' }}
                  />
                  {cat.split(' ')[0]} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      )}

      {isPickerMode && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Click anywhere on the map or drag the pin to pin the precise issue location</span>
          </div>
          {pickerCoords && (
            <span className="font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              {pickerCoords.latitude.toFixed(4)}, {pickerCoords.longitude.toFixed(4)}
            </span>
          )}
        </div>
      )}

      <div ref={mapContainerRef} style={{ height }} className="w-full relative z-0" />
    </div>
  );
};
