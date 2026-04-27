export type JourneyStep = {
  type: 'walk' | 'board' | 'transfer' | 'alight' | 'arrive';
  label: string;
};
