export interface RouteOption {
  id: string;
  type: 'minibus' | 'bajaj' | 'taxi';
  origin: string;
  destination: string;
  fareETB: number;
  durationMins: number;
  path: [number, number][]; // Array of [lat, lng] coordinates
}

export const locations = [
  "Posta Bet",
  "Piazza",
  "Mebrat Hail",
  "Kebele 03",
  "Derartu Tulu Park",
  "Adama Stadium",
  "Nazareth Hospital",
  "Menahariya"
];

// Combine origins and destinations to make complete routes
export const mockRoutes: RouteOption[] = [
  {
    id: 'r1',
    type: 'minibus',
    origin: 'Posta Bet',
    destination: 'Menahariya',
    fareETB: 10,
    durationMins: 15,
    path: [
      [8.5400, 39.2700],
      [8.5420, 39.2740],
      [8.5400, 39.2820]
    ]
  },
  {
    id: 'r2',
    type: 'bajaj',
    origin: 'Posta Bet',
    destination: 'Menahariya',
    fareETB: 50,
    durationMins: 8,
    path: [
      [8.5400, 39.2700],
      [8.5410, 39.2750],
      [8.5400, 39.2820]
    ]
  },
  {
    id: 'r3',
    type: 'minibus',
    origin: 'Piazza',
    destination: 'Adama Stadium',
    fareETB: 15,
    durationMins: 12,
    path: [
      [8.5420, 39.2660],
      [8.5425, 39.2670],
      [8.5430, 39.2680]
    ]
  },
  {
    id: 'r4',
    type: 'bajaj',
    origin: 'Piazza',
    destination: 'Adama Stadium',
    fareETB: 60,
    durationMins: 6,
    path: [
      [8.5420, 39.2660],
      [8.5428, 39.2675],
      [8.5430, 39.2680]
    ]
  },
  {
    id: 'r5',
    type: 'minibus',
    origin: 'Mebrat Hail',
    destination: 'Posta Bet',
    fareETB: 10,
    durationMins: 10,
    path: [
      [8.5360, 39.2740],
      [8.5380, 39.2720],
      [8.5400, 39.2700]
    ]
  }
];
