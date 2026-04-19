export interface RouteStep {
  instruction: string;
  type: 'walk' | 'board' | 'alight';
  duration?: string;
  detail?: string;
}

export interface RouteOption {
  id: string;
  type: 'minibus' | 'bajaj' | 'taxi';
  origin: string;
  destination: string;
  fareETB: number;
  durationMins: number;
  path: [number, number][]; // Array of [lat, lng] coordinates
  routeName: string;
  traffic: 'low' | 'moderate' | 'high';
  steps: RouteStep[];
}

export const locations = [
  "Posta Bet",
  "College",
  "Mebrat Hail",
  "Kebele 03",
  "Firanko",
  "Derartu Tulu Park",
  "Adama Stadium",
  "Nazareth Hospital",
  "Menahariya",
  "kebele 04",
  "Bole",
  "Wangari",
  "Ganda Gara",
  "Amade",

];

// Combine origins and destinations to make complete routes
export const mockRoutes: RouteOption[] = [
  {
    id: 'r1',
    type: 'minibus',
    origin: 'Posta Bet',
    destination: 'Menahariya',
    fareETB: 20,
    durationMins: 30,
    routeName: 'Minibus + Walk',
    traffic: 'low',
    path: [
      [8.5400, 39.2700],
      [8.5410, 39.2720],
      [8.5420, 39.2740],
      [8.5415, 39.2770],
      [8.5400, 39.2820]
    ],
    steps: [
      { instruction: 'Walk to Posta Bet Station', type: 'walk', duration: '5 mins' },
      { instruction: 'Board Minibus to Menahariya', type: 'board', detail: 'Route 1 Minibus' },
      { instruction: 'Alight at Menahariya Terminal', type: 'alight', duration: '20 mins' }
    ]
  },
  {
    id: 'r2',
    type: 'taxi',
    origin: 'Posta Bet',
    destination: 'Menahariya',
    fareETB: 80,
    durationMins: 20,
    routeName: 'Taxi',
    traffic: 'moderate',
    path: [
      [8.5400, 39.2700],
      [8.5408, 39.2745],
      [8.5400, 39.2820]
    ],
    steps: [
      { instruction: 'Hail a taxi at Posta Bet', type: 'walk', duration: '2 mins' },
      { instruction: 'Ride taxi directly to Menahariya', type: 'board', detail: 'Direct taxi ride' },
      { instruction: 'Arrive at Menahariya', type: 'alight', duration: '15 mins' }
    ]
  },
  {
    id: 'r3',
    type: 'bajaj',
    origin: 'Posta Bet',
    destination: 'Menahariya',
    fareETB: 15,
    durationMins: 35,
    routeName: 'Bajaj + Walk',
    traffic: 'high',
    path: [
      [8.5400, 39.2700],
      [8.5390, 39.2730],
      [8.5395, 39.2760],
      [8.5405, 39.2790],
      [8.5400, 39.2820]
    ],
    steps: [
      { instruction: 'Walk to nearest Bajaj stop', type: 'walk', duration: '3 mins' },
      { instruction: 'Board Bajaj towards Menahariya', type: 'board', detail: 'Bajaj shared ride' },
      { instruction: 'Walk to final destination', type: 'walk', duration: '5 mins' }
    ]
  },
  {
    id: 'r4',
    type: 'minibus',
    origin: 'Piazza',
    destination: 'Adama Stadium',
    fareETB: 15,
    durationMins: 12,
    routeName: 'Minibus Direct',
    traffic: 'low',
    path: [
      [8.5420, 39.2660],
      [8.5425, 39.2670],
      [8.5430, 39.2680]
    ],
    steps: [
      { instruction: 'Walk to Piazza Minibus Stop', type: 'walk', duration: '2 mins' },
      { instruction: 'Board Minibus to Adama Stadium', type: 'board', detail: 'Stadium Route' },
      { instruction: 'Alight at Adama Stadium', type: 'alight', duration: '8 mins' }
    ]
  },
  {
    id: 'r5',
    type: 'bajaj',
    origin: 'Piazza',
    destination: 'Adama Stadium',
    fareETB: 60,
    durationMins: 6,
    routeName: 'Bajaj Express',
    traffic: 'moderate',
    path: [
      [8.5420, 39.2660],
      [8.5428, 39.2675],
      [8.5430, 39.2680]
    ],
    steps: [
      { instruction: 'Hail a Bajaj near Piazza', type: 'walk', duration: '1 min' },
      { instruction: 'Ride Bajaj to Stadium', type: 'board', detail: 'Direct Bajaj' },
      { instruction: 'Arrive at Stadium', type: 'alight', duration: '4 mins' }
    ]
  },
  {
    id: 'r6',
    type: 'minibus',
    origin: 'Mebrat Hail',
    destination: 'Posta Bet',
    fareETB: 10,
    durationMins: 10,
    routeName: 'Minibus + Walk',
    traffic: 'low',
    path: [
      [8.5360, 39.2740],
      [8.5380, 39.2720],
      [8.5400, 39.2700]
    ],
    steps: [
      { instruction: 'Walk to Mebrat Hail stop', type: 'walk', duration: '2 mins' },
      { instruction: 'Board Minibus to Posta Bet', type: 'board', detail: 'Posta Route' },
      { instruction: 'Alight at Posta Bet', type: 'alight', duration: '6 mins' }
    ]
  },
  {
    id: 'r7',
    type: 'taxi',
    origin: 'Adama Stadium',
    destination: 'Derartu Tulu Park',
    fareETB: 150,
    durationMins: 20,
    routeName: 'Taxi Direct',
    traffic: 'moderate',
    path: [
      [8.5430, 39.2680],
      [8.5440, 39.2700],
      [8.5450, 39.2780]
    ],
    steps: [
      { instruction: 'Find taxi near Stadium', type: 'walk', duration: '3 mins' },
      { instruction: 'Taxi to Derartu Tulu Park', type: 'board', detail: 'Contract taxi' },
      { instruction: 'Arrive at Park entrance', type: 'alight', duration: '15 mins' }
    ]
  },
  {
    id: 'r8',
    type: 'bajaj',
    origin: 'Kebele 03',
    destination: 'Nazareth Hospital',
    fareETB: 40,
    durationMins: 15,
    routeName: 'Bajaj + Walk',
    traffic: 'low',
    path: [
      [8.5480, 39.2800],
      [8.5450, 39.2750],
      [8.5380, 39.2720]
    ],
    steps: [
      { instruction: 'Walk to Kebele 03 junction', type: 'walk', duration: '3 mins' },
      { instruction: 'Board Bajaj to Hospital area', type: 'board', detail: 'Shared Bajaj' },
      { instruction: 'Walk to Nazareth Hospital', type: 'walk', duration: '4 mins' }
    ]
  },
  {
    id: 'r9',
    type: 'minibus',
    origin: 'Menahariya',
    destination: 'Kebele 03',
    fareETB: 10,
    durationMins: 14,
    routeName: 'Minibus Direct',
    traffic: 'high',
    path: [
      [8.5400, 39.2820],
      [8.5430, 39.2810],
      [8.5480, 39.2800]
    ],
    steps: [
      { instruction: 'Walk to Menahariya Terminal', type: 'walk', duration: '2 mins' },
      { instruction: 'Board Minibus to Kebele 03', type: 'board', detail: 'Kebele Route' },
      { instruction: 'Alight at Kebele 03', type: 'alight', duration: '10 mins' }
    ]
  },
  {
    id: 'r10',
    type: 'bajaj',
    origin: 'Nazareth Hospital',
    destination: 'Mebrat Hail',
    fareETB: 30,
    durationMins: 5,
    routeName: 'Bajaj Express',
    traffic: 'low',
    path: [
      [8.5380, 39.2720],
      [8.5370, 39.2730],
      [8.5360, 39.2740]
    ],
    steps: [
      { instruction: 'Find Bajaj at Hospital gate', type: 'walk', duration: '1 min' },
      { instruction: 'Ride Bajaj to Mebrat Hail', type: 'board', detail: 'Short Bajaj ride' },
      { instruction: 'Arrive at Mebrat Hail', type: 'alight', duration: '3 mins' }
    ]
  }
];
