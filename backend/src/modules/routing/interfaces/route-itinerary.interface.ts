/**
 * Represents a single route option returned by the planning engine.
 */
export interface RouteItinerary {
  /** Unique identifier for this itinerary option */
  id: string;

  /** Human-readable label (e.g. "Minibus via Total Station") */
  label: string;

  /** Primary transport mode for this option */
  mode: 'minibus' | 'bus' | 'bajaj' | 'taxi' | 'walking';

  /** Total estimated travel time in minutes */
  totalTime: number;

  /** Total estimated cost in Ethiopian Birr (ETB) */
  totalCost: number;

  /** Total walking distance in meters */
  walkingDistance: number;

  /** Number of vehicle changes required */
  numberOfTransfers: number;

  /** Ordered step-by-step directions using local Adama landmarks */
  stepByStepInstructions: string[];

  /** Context-aware smart tip for this route */
  smartSuggestion: string;
}
