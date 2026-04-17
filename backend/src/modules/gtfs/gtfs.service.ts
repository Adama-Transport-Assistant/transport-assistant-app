import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { pipeline } from 'stream/promises';
import * as os from 'os';
import * as path from 'path';
import * as unzipper from 'unzipper';
import { parse } from 'csv-parse/sync';

import { PrismaService } from '../prisma/prisma.service';

const BATCH_SIZE = 5000;

@Injectable()
export class GtfsService {
  private readonly logger = new Logger(GtfsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async importLatestGtfs() {
    const gtfsUrl = this.configService.get<string>('app.gtfsUrl', { infer: true }) as string;
    const downloadPath = this.configService.get<string>('app.gtfsDownloadPath', {
      infer: true,
    }) as string;

    await this.downloadGtfsZip(gtfsUrl, downloadPath);

    const extractDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gtfs-'));
    await createReadStream(downloadPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    const stops = await this.parseCsv(path.join(extractDir, 'stops.txt'));
    const routes = await this.parseCsv(path.join(extractDir, 'routes.txt'));
    const trips = await this.parseCsv(path.join(extractDir, 'trips.txt'));
    const stopTimes = await this.parseCsv(path.join(extractDir, 'stop_times.txt'));

    await this.upsertStops(stops);
    await this.upsertRoutes(routes);
    await this.upsertTrips(trips);
    await this.upsertStopTimes(stopTimes);

    return {
      message: 'GTFS import completed',
      counts: {
        stops: stops.length,
        routes: routes.length,
        trips: trips.length,
        stopTimes: stopTimes.length,
      },
    };
  }

  async getSummary() {
    const [stops, routes, trips, stopTimes] = await Promise.all([
      this.prisma.stop.count(),
      this.prisma.route.count(),
      this.prisma.trip.count(),
      this.prisma.stopTime.count(),
    ]);

    return { stops, routes, trips, stopTimes };
  }

  private async downloadGtfsZip(url: string, downloadPath: string): Promise<void> {
    this.logger.log(`Downloading GTFS data from ${url}`);

    const response = await firstValueFrom(
      this.httpService.get(url, { responseType: 'stream' }),
    );

    await fs.mkdir(path.dirname(downloadPath), { recursive: true });
    await pipeline(response.data, createWriteStream(downloadPath));
  }

  private async parseCsv(filePath: string): Promise<Record<string, string>[]> {
    const fileContent = await fs.readFile(filePath);

    return parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];
  }

  private async upsertStops(stops: Record<string, string>[]) {
    const data = stops.map((stop) => ({
      id: stop.stop_id,
      code: stop.stop_code || null,
      name: stop.stop_name,
      desc: stop.stop_desc || null,
      lat: Number(stop.stop_lat),
      lon: Number(stop.stop_lon),
      zoneId: stop.zone_id || null,
      locationType: stop.location_type ? Number(stop.location_type) : null,
      parentStationId: stop.parent_station || null,
      wheelchairBoarding: stop.wheelchair_boarding ? Number(stop.wheelchair_boarding) : null,
      platformCode: stop.platform_code || null,
    }));

    await this.createManyInBatches('stop', data);
  }

  private async upsertRoutes(routes: Record<string, string>[]) {
    const data = routes.map((route) => ({
      id: route.route_id,
      agencyId: route.agency_id || null,
      shortName: route.route_short_name || null,
      longName: route.route_long_name || null,
      desc: route.route_desc || null,
      type: Number(route.route_type),
      url: route.route_url || null,
      color: route.route_color || null,
      textColor: route.route_text_color || null,
    }));

    await this.createManyInBatches('route', data);
  }

  private async upsertTrips(trips: Record<string, string>[]) {
    const data = trips.map((trip) => ({
      id: trip.trip_id,
      routeId: trip.route_id,
      serviceId: trip.service_id,
      headsign: trip.trip_headsign || null,
      directionId: trip.direction_id ? Number(trip.direction_id) : null,
      blockId: trip.block_id || null,
      shapeId: trip.shape_id || null,
      wheelchairAccessible: trip.wheelchair_accessible
        ? Number(trip.wheelchair_accessible)
        : null,
      bikesAllowed: trip.bikes_allowed ? Number(trip.bikes_allowed) : null,
    }));

    await this.createManyInBatches('trip', data);
  }

  private async upsertStopTimes(stopTimes: Record<string, string>[]) {
    const data = stopTimes.map((stopTime) => ({
      tripId: stopTime.trip_id,
      arrivalTime: stopTime.arrival_time || null,
      departureTime: stopTime.departure_time || null,
      stopId: stopTime.stop_id,
      stopSequence: Number(stopTime.stop_sequence),
      stopHeadsign: stopTime.stop_headsign || null,
      pickupType: stopTime.pickup_type ? Number(stopTime.pickup_type) : null,
      dropOffType: stopTime.drop_off_type ? Number(stopTime.drop_off_type) : null,
      shapeDistTraveled: stopTime.shape_dist_traveled
        ? Number(stopTime.shape_dist_traveled)
        : null,
      timepoint: stopTime.timepoint ? Number(stopTime.timepoint) : null,
    }));

    await this.createManyInBatches('stopTime', data);
  }

  private async createManyInBatches(
    model: 'stop' | 'route' | 'trip' | 'stopTime',
    data: Record<string, unknown>[],
  ) {
    for (let index = 0; index < data.length; index += BATCH_SIZE) {
      const batch = data.slice(index, index + BATCH_SIZE);
      switch (model) {
        case 'stop':
          await this.prisma.stop.createMany({ data: batch, skipDuplicates: true });
          break;
        case 'route':
          await this.prisma.route.createMany({ data: batch, skipDuplicates: true });
          break;
        case 'trip':
          await this.prisma.trip.createMany({ data: batch, skipDuplicates: true });
          break;
        case 'stopTime':
          await this.prisma.stopTime.createMany({ data: batch, skipDuplicates: true });
          break;
      }
    }
  }
}
