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
  },
  {
    id: 'r6',
    type: 'taxi',
    origin: 'Adama Stadium',
    destination: 'Derartu Tulu Park',
    fareETB: 150,
    durationMins: 20,
    path: [
      [8.5430, 39.2680],
      [8.5440, 39.2700],
      [8.5450, 39.2780]
    ]
  },
  {
    id: 'r7',
    type: 'bajaj',
    origin: 'Kebele 03',
    destination: 'Nazareth Hospital',
    fareETB: 40,
    durationMins: 15,
    path: [
      [8.5480, 39.2800],
      [8.5450, 39.2750],
      [8.5380, 39.2720]
    ]
  },
  {
    id: 'r8',
    type: 'minibus',
    origin: 'Menahariya',
    destination: 'Kebele 03',
    fareETB: 10,
    durationMins: 14,
    path: [
      [8.5400, 39.2820],
      [8.5430, 39.2810],
      [8.5480, 39.2800]
    ]
  },
  {
    id: 'r9',
    type: 'minibus',
    origin: 'Derartu Tulu Park',
    destination: 'Piazza',
    fareETB: 15,
    durationMins: 18,
    path: [
      [8.5450, 39.2780],
      [8.5440, 39.2700],
      [8.5420, 39.2660]
    ]
  },
  {
    id: 'r10',
    type: 'bajaj',
    origin: 'Nazareth Hospital',
    destination: 'Mebrat Hail',
    fareETB: 30,
    durationMins: 5,
    path: [
      [8.5380, 39.2720],
      [8.5370, 39.2730],
      [8.5360, 39.2740]
    ]
  }
];

