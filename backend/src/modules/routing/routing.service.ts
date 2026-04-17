import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '../prisma/prisma.service';
import { PlanRouteDto, RoutingPreference } from './dto/plan-route.dto';

type OtpLeg = {
	mode: string;
	routeShortName?: string;
	routeLongName?: string;
	from: { name: string };
	to: { name: string };
	startTime: number;
	endTime: number;
};

type OtpItinerary = {
	duration: number;
	walkDistance: number;
	waitingTime?: number;
	transfers?: number;
	legs: OtpLeg[];
};

@Injectable()
export class RoutingService {
	private readonly otpBaseUrl: string;

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
		private readonly prisma: PrismaService,
	) {
		this.otpBaseUrl = this.configService.get<string>('app.otpBaseUrl', {
			infer: true,
		}) as string;
	}

	async planRoute(query: PlanRouteDto) {
		const date = query.dateTime ? new Date(query.dateTime) : new Date();
		const preference = query.preference ?? RoutingPreference.FASTEST;
		const otpParams = this.buildOtpParams(query, preference, date);

		let data: { plan?: { itineraries?: OtpItinerary[] } };
		try {
			const response = await firstValueFrom(
				this.httpService.get(`${this.otpBaseUrl}/plan`, { params: otpParams }),
			);
			data = response.data as { plan?: { itineraries?: OtpItinerary[] } };
		} catch (error) {
			throw new ServiceUnavailableException('Routing engine is currently unavailable.');
		}

		const itineraries = data.plan?.itineraries ?? [];
		const enrichedItineraries = await Promise.all(
			itineraries.map((itinerary) => this.enrichItinerary(itinerary)),
		);

		return {
			request: {
				from: { lat: query.fromLat, lon: query.fromLon },
				to: { lat: query.toLat, lon: query.toLon },
				preference,
				dateTime: date.toISOString(),
			},
			totalItineraries: enrichedItineraries.length,
			itineraries: enrichedItineraries,
		};
	}

	private buildOtpParams(
		query: PlanRouteDto,
		preference: RoutingPreference,
		date: Date,
	): Record<string, string | number> {
		const maxWalkDistance = this.configService.get<number>('app.maxWalkingDistanceMeters', {
			infer: true,
		}) as number;

		const optimize =
			preference === RoutingPreference.CHEAPEST
				? 'TRANSFERS'
				: preference === RoutingPreference.LEAST_WALKING
					? 'TRIANGLE'
					: 'QUICK';

		const params: Record<string, string | number> = {
			fromPlace: `${query.fromLat},${query.fromLon}`,
			toPlace: `${query.toLat},${query.toLon}`,
			date: date.toISOString().slice(0, 10),
			time: date.toISOString().slice(11, 19),
			mode: 'WALK,TRANSIT',
			maxWalkDistance,
			numItineraries: query.numItineraries ?? 3,
			locale: query.locale ?? 'en',
			optimize,
		};

		if (preference === RoutingPreference.LEAST_WALKING) {
			params.triangleSafetyFactor = 0.2;
			params.triangleSlopeFactor = 0.1;
			params.triangleTimeFactor = 0.7;
		}

		return params;
	}

	private async enrichItinerary(itinerary: OtpItinerary) {
		const costEstimateEtb = this.calculateEtbFare(itinerary.legs);
		const waitingTimeMinutes = Math.round((itinerary.waitingTime ?? 0) / 60);

		const withLandmarks = itinerary.legs.map((leg) => ({
			...leg,
			from: { name: this.localizeLandmark(leg.from.name) },
			to: { name: this.localizeLandmark(leg.to.name) },
		}));

		const smartSuggestions = await this.generateSmartSuggestions(
			waitingTimeMinutes,
			itinerary.walkDistance,
		);

		return {
			...itinerary,
			waitingTimeMinutes,
			costEstimateEtb,
			legs: withLandmarks,
			smartSuggestions,
		};
	}

	private calculateEtbFare(legs: OtpLeg[]): number {
		const baseFareByMode: Record<string, number> = {
			WALK: 0,
			BUS: 12,
			TRAM: 10,
			RAIL: 10,
			SUBWAY: 10,
			MINIBUS: 15,
			CAR: 80,
			TAXI: 120,
		};

		const total = legs.reduce((sum, leg) => {
			const modeKey = leg.mode.toUpperCase();
			const base = baseFareByMode[modeKey] ?? 14;
			const durationMinutes = Math.max(1, Math.round((leg.endTime - leg.startTime) / 60000));

			const variableCost = modeKey === 'WALK' ? 0 : Math.ceil(durationMinutes / 20) * 2;
			return sum + base + variableCost;
		}, 0);

		return Math.round(total * 100) / 100;
	}

	private localizeLandmark(stopName: string): string {
		const map: Record<string, string> = {
			'Mexico': 'Mexico Square',
			'Stadium': 'Addis Ababa Stadium',
			'Piassa': 'Piassa (Arada Center)',
			'Megenagna': 'Megenagna Junction',
			'Ayat': 'Ayat Roundabout',
			'Bole': 'Bole Medhanialem Area',
		};

		for (const [keyword, localLandmark] of Object.entries(map)) {
			if (stopName.toLowerCase().includes(keyword.toLowerCase())) {
				return `${stopName} near ${localLandmark}`;
			}
		}

		return stopName;
	}

	private async generateSmartSuggestions(
		waitingTimeMinutes: number,
		walkDistance: number,
	): Promise<string[]> {
		const suggestions: string[] = [];

		if (waitingTimeMinutes >= 15) {
			suggestions.push(
				'High waiting time detected. Consider nearby shared taxi/bajaj for first-mile connection.',
			);
		}

		if (walkDistance > 1200) {
			suggestions.push('Walking segment is long. Consider boarding from a closer feeder stop.');
		}

		const nearbyTaxiStands = await this.prisma.taxiStandPOI.findMany({
			take: 2,
			orderBy: { updatedAt: 'desc' },
			select: { name: true, areaName: true },
		});

		if (nearbyTaxiStands.length > 0) {
			const formatted = nearbyTaxiStands
				.map((stand) => `${stand.name} (${stand.areaName})`)
				.join(', ');
			suggestions.push(`Nearby taxi stands to check: ${formatted}.`);
		}

		if (suggestions.length === 0) {
			suggestions.push('Transit conditions look good for this plan.');
		}

		return suggestions;
	}
}
