import type { BuildingTemplate, BuildingLink } from '../types';

export const RIMWORLD_BUILDING_PRESETS: BuildingTemplate[] = [
  // Basic Buildings
  {
    id: 'bedroom',
    name: 'Bedroom',
    shape: 'rectangle',
    width: 7,
    height: 7,
    color: '#3b82f6',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    shape: 'rectangle',
    width: 8,
    height: 6,
    color: '#f97316',
  },
  {
    id: 'dining_room',
    name: 'Dining Room',
    shape: 'rectangle',
    width: 10,
    height: 8,
    color: '#eab308',
  },
  {
    id: 'storage',
    name: 'Storage',
    shape: 'rectangle',
    width: 8,
    height: 8,
    color: '#6b7280',
  },
  {
    id: 'freezer',
    name: 'Freezer',
    shape: 'rectangle',
    width: 6,
    height: 6,
    color: '#06b6d4',
  },
  
  // Production Buildings
  {
    id: 'workshop',
    name: 'Workshop',
    shape: 'rectangle',
    width: 10,
    height: 8,
    color: '#92400e',
  },
  {
    id: 'research_lab',
    name: 'Research Lab',
    shape: 'rectangle',
    width: 8,
    height: 6,
    color: '#7c3aed',
  },
  {
    id: 'hospital',
    name: 'Hospital',
    shape: 'rectangle',
    width: 9,
    height: 7,
    color: '#ef4444',
  },
  {
    id: 'rec_room',
    name: 'Recreation Room',
    shape: 'rectangle',
    width: 12,
    height: 10,
    color: '#f59e0b',
  },
  
  // Outdoor/Farm Areas
  {
    id: 'growing_zone',
    name: 'Growing Zone',
    shape: 'rectangle',
    width: 12,
    height: 8,
    color: '#10b981',
  },
  {
    id: 'animal_pen',
    name: 'Animal Pen',
    shape: 'rectangle',
    width: 10,
    height: 10,
    color: '#84cc16',
  },
  
  // Defense
  {
    id: 'bunker',
    name: 'Bunker',
    shape: 'rectangle',
    width: 6,
    height: 4,
    color: '#374151',
  },
  {
    id: 'turret_nest',
    name: 'Turret Nest',
    shape: 'circle',
    width: 4,
    height: 4,
    color: '#dc2626',
  },
  
  // Utility
  {
    id: 'power_room',
    name: 'Power Room',
    shape: 'rectangle',
    width: 6,
    height: 4,
    color: '#fbbf24',
  },
  {
    id: 'dumping_stockpile',
    name: 'Dumping Stockpile',
    shape: 'rectangle',
    width: 8,
    height: 6,
    color: '#9ca3af',
  },
];

export const RIMWORLD_PRESET_CONFIGURATIONS = {
  'Basic Colony': {
    buildings: [
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'bedroom')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'kitchen')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'dining_room')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'storage')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'growing_zone')!,
    ],
    links: [
      { source: 'kitchen', target: 'dining_room', strength: 8 },
      { source: 'kitchen', target: 'storage', strength: 6 },
      { source: 'bedroom', target: 'dining_room', strength: 5 },
      { source: 'growing_zone', target: 'kitchen', strength: 4 },
      { source: 'growing_zone', target: 'storage', strength: 3 },
    ] as BuildingLink<string>[],
  },
  
  'Industrial Base': {
    buildings: [
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'bedroom')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'kitchen')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'dining_room')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'workshop')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'research_lab')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'storage')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'power_room')!,
    ],
    links: [
      { source: 'kitchen', target: 'dining_room', strength: 8 },
      { source: 'workshop', target: 'storage', strength: 7 },
      { source: 'workshop', target: 'power_room', strength: 6 },
      { source: 'research_lab', target: 'workshop', strength: 5 },
      { source: 'bedroom', target: 'dining_room', strength: 5 },
      { source: 'storage', target: 'power_room', strength: 4 },
    ] as BuildingLink<string>[],
  },
  
  'Defensive Outpost': {
    buildings: [
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'bedroom')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'kitchen')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'bunker')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'turret_nest')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'hospital')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'storage')!,
    ],
    links: [
      { source: 'bunker', target: 'turret_nest', strength: 9 },
      { source: 'hospital', target: 'bunker', strength: 7 },
      { source: 'bedroom', target: 'hospital', strength: 6 },
      { source: 'kitchen', target: 'bedroom', strength: 5 },
      { source: 'storage', target: 'hospital', strength: 4 },
      { source: 'storage', target: 'kitchen', strength: 4 },
    ] as BuildingLink<string>[],
  },
  
  'Self-Sufficient Farm': {
    buildings: [
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'bedroom')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'kitchen')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'dining_room')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'growing_zone')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'animal_pen')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'freezer')!,
      RIMWORLD_BUILDING_PRESETS.find(r => r.id === 'storage')!,
    ],
    links: [
      { source: 'growing_zone', target: 'kitchen', strength: 9 },
      { source: 'animal_pen', target: 'kitchen', strength: 8 },
      { source: 'kitchen', target: 'freezer', strength: 7 },
      { source: 'kitchen', target: 'dining_room', strength: 6 },
      { source: 'freezer', target: 'storage', strength: 5 },
      { source: 'bedroom', target: 'dining_room', strength: 5 },
      { source: 'growing_zone', target: 'storage', strength: 4 },
    ] as BuildingLink<string>[],
  },
};

// Helper function to get the first preset configuration
export function getDefaultPresetConfiguration() {
  const firstPresetKey = Object.keys(RIMWORLD_PRESET_CONFIGURATIONS)[0];
  return RIMWORLD_PRESET_CONFIGURATIONS[firstPresetKey as keyof typeof RIMWORLD_PRESET_CONFIGURATIONS];
}
