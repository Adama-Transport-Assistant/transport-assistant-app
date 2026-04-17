export interface RouteOption {
  id: string;
  type: 'minibus' | 'bajaj' | 'taxi';
  origin: string;
  destination: string;
  fareETB: number;
  durationMins: number;
  path: [number, number][]; // Array of [lat, lng] coordinates
}

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
      [8.5450, 39.2700],
      [8.5480, 39.2750]
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
      [8.5430, 39.2670],
      [8.5480, 39.2750]
    ]
  }
];
