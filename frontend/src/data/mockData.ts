export type TransportType = 'minibus' | 'taxi' | 'bajaj';
export type TrafficLevel = 'low' | 'moderate' | 'high';

export interface RouteStep {
  type: 'walk' | 'board' | 'alight';
  instruction: string;
  duration?: string;
}

export interface RouteOption {
  id: string;
  origin: string;
  destination: string;
  routeName: string;
  type: TransportType;
  fareETB: number;
  durationMins: number;
  traffic: TrafficLevel;
  path: [number, number][];
  steps: RouteStep[];
}

export const locations: string[] = [
  'Mexico Square',
  'Bole',
  'Piassa',
  'Megenagna',
  'CMC',
  'Gotera',
  'Sarbet',
  'Lideta',
  'Ayat',
  'Kazanchis',
];

export const mockRoutes: RouteOption[] = [
  {
    id: 'r1',
    origin: 'Mexico Square',
    destination: 'Bole',
    routeName: 'Mexico -> Bole Road',
    type: 'minibus',
    fareETB: 25,
    durationMins: 28,
    traffic: 'moderate',
    path: [
      [9.0108, 38.7613],
      [9.0183, 38.7781],
      [9.0027, 38.7874],
    ],
    steps: [
      { type: 'walk', instruction: 'Walk to Mexico minibus stop', duration: '4 min' },
      { type: 'board', instruction: 'Board minibus toward Bole', duration: '20 min' },
      { type: 'alight', instruction: 'Alight near Bole Medhanialem', duration: '4 min' },
    ],
  },
  {
    id: 'r2',
    origin: 'Piassa',
    destination: 'Megenagna',
    routeName: 'Piassa -> Megenagna',
    type: 'taxi',
    fareETB: 40,
    durationMins: 24,
    traffic: 'low',
    path: [
      [9.0396, 38.7469],
      [9.0506, 38.7615],
      [9.0466, 38.8082],
    ],
    steps: [
      { type: 'walk', instruction: 'Walk to main taxi rank', duration: '3 min' },
      { type: 'board', instruction: 'Take taxi via Churchill Ave', duration: '17 min' },
      { type: 'alight', instruction: 'Arrive at Megenagna junction', duration: '4 min' },
    ],
  },
  {
    id: 'r3',
    origin: 'Gotera',
    destination: 'CMC',
    routeName: 'Gotera -> CMC Ring Road',
    type: 'bajaj',
    fareETB: 35,
    durationMins: 32,
    traffic: 'high',
    path: [
      [8.9898, 38.7686],
      [9.0184, 38.7879],
      [9.0619, 38.8504],
    ],
    steps: [
      { type: 'walk', instruction: 'Walk to Gotera bajaj stand', duration: '5 min' },
      { type: 'board', instruction: 'Ride bajaj toward CMC', duration: '22 min' },
      { type: 'alight', instruction: 'Get off at CMC terminal', duration: '5 min' },
    ],
  },
];
