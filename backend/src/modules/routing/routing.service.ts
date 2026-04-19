import { Injectable, Logger } from '@nestjs/common';

import { PlanRouteDto, RoutingPreference } from './dto/plan-route.dto';
import { RouteItinerary } from './interfaces/route-itinerary.interface';

/**
 * RoutingService — MVP mock implementation.
 *
 * Returns 3–4 realistic route options for Adama city using local landmarks.
 * Data is self-contained for the MVP and can be replaced later by live sources.
 * Replace mock data with real routing logic when live data becomes available.
 */
@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  planRoute(query: PlanRouteDto): {
    request: object;
    itineraries: RouteItinerary[];
  } {
    const preference = query.preference ?? RoutingPreference.FASTEST;

    this.logger.log(
      `Planning route from [${query.fromLat},${query.fromLon}] ` +
        `to [${query.toLat},${query.toLon}] | preference: ${preference}`,
    );

    const itineraries = this.sortByPreference(this.buildMockRoutes(), preference);

    return {
      request: {
        from: { lat: query.fromLat, lon: query.fromLon },
        to: { lat: query.toLat, lon: query.toLon },
        preference,
        dateTime: query.dateTime ?? new Date().toISOString(),
      },
      itineraries,
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Builds the full set of mock route options for Adama city.
   * Each option uses real Adama landmarks and realistic ETB fares.
   */
  private buildMockRoutes(): RouteItinerary[] {
    return [
      // ── Option 1: Minibus via Total Station ──────────────────────────────
      {
        id: 'route-1',
        label: 'Minibus via Total Station',
        mode: 'minibus',
        totalTime: 30,
        totalCost: 15,
        walkingDistance: 450,
        numberOfTransfers: 1,
        stepByStepInstructions: [
          'Walk ~250m south to the Adama University main gate bus stop.',
          'Board Minibus Route 5 towards Piassa — fare: 8 ETB.',
          'Ride ~12 min and alight at Total Station (near the fuel station on the main road).',
          'Transfer to a short Minibus heading to the market area — fare: 7 ETB.',
          'Alight at Adama Merkato. Walk ~200m east to your destination.',
        ],
        smartSuggestion:
          'Minibuses fill up fast between 7–9 AM near the university. Board early or wait for the next one.',
      },

      // ── Option 2: Direct Bajaj (fastest, pricier) ─────────────────────────
      {
        id: 'route-2',
        label: 'Direct Bajaj',
        mode: 'bajaj',
        totalTime: 20,
        totalCost: 50,
        walkingDistance: 150,
        numberOfTransfers: 0,
        stepByStepInstructions: [
          'Walk ~100m to the bajaj stand at the Adama University roundabout.',
          'Negotiate a direct bajaj to Adama Merkato — typical fare: 40–55 ETB.',
          'Ride takes ~15 min via the Piassa shortcut road.',
          'Alight directly in front of the market entrance. Walk ~50m to your destination.',
        ],
        smartSuggestion:
          'Bajajs are the fastest door-to-door option in Adama. Always agree on the price before boarding.',
      },

      // ── Option 3: Bus 101 — cheapest, more transfers ──────────────────────
      {
        id: 'route-3',
        label: 'Bus Route 101 (Cheapest)',
        mode: 'bus',
        totalTime: 48,
        totalCost: 10,
        walkingDistance: 1100,
        numberOfTransfers: 2,
        stepByStepInstructions: [
          'Walk ~600m north to the Adama Bus Station (main inter-city terminal).',
          'Board Bus Route 101 towards the town center — fare: 5 ETB.',
          'Ride ~18 min and alight at Piassa junction (the busy roundabout near the commercial bank).',
          'Walk ~200m west and board Minibus Route 2 towards the market — fare: 5 ETB.',
          'Alight at Adama Merkato. Walk ~300m to your destination.',
        ],
        smartSuggestion:
          'This is the cheapest option but involves more walking. Good choice if you have time and want to save money.',
      },

      // ── Option 4: Taxi (shared) — balanced comfort/cost ───────────────────
      {
        id: 'route-4',
        label: 'Shared Taxi via Piassa',
        mode: 'taxi',
        totalTime: 25,
        totalCost: 30,
        walkingDistance: 300,
        numberOfTransfers: 0,
        stepByStepInstructions: [
          'Walk ~200m to the shared taxi pick-up point near Adama University gate (look for white Lada taxis).',
          'Board a shared taxi heading to Piassa — fare: 15–20 ETB.',
          'Ride ~10 min; the taxi passes through the Bole road before reaching Piassa.',
          'Alight at Piassa junction. Walk ~100m south to the market entrance.',
          'Walk ~100m further to your final destination.',
        ],
        smartSuggestion:
          'Traffic is usually heavy near Piassa after 5 PM. This route avoids the main bus station bottleneck.',
      },
    ];
  }

  /**
   * Sorts itineraries by user preference and returns the top results.
   */
  private sortByPreference(
    routes: RouteItinerary[],
    preference: RoutingPreference,
  ): RouteItinerary[] {
    const sorted = [...routes];

    switch (preference) {
      case RoutingPreference.CHEAPEST:
        sorted.sort((a, b) => a.totalCost - b.totalCost);
        break;
      case RoutingPreference.LEAST_WALKING:
        sorted.sort((a, b) => a.walkingDistance - b.walkingDistance);
        break;
      case RoutingPreference.FASTEST:
      default:
        sorted.sort((a, b) => a.totalTime - b.totalTime);
        break;
    }

    return sorted;
  }
}
