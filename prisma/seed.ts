import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Replace with a real user from your auth.users table
const USER_ID = '7a549c76-6b66-4b20-986a-99a693ab0f16';

type SeedLocation = {
  name: string;
  country: string;
  countryCode: string;
};

type SeedDive = {
  locationName: string;
  date: Date;
  depth: number;
  duration: number;
  notes?: string;
  summary?: string;
  waterTemp?: number;
  visibility?: string;
  startPressure?: number;
  endPressure?: number;
  airUsage?: number;
  diveType?: string;
  waterType?: string;
  exposure?: string;
  gas?: string;
  currents?: string;
  weight?: number;
};

const locations: SeedLocation[] = [
  { name: 'Sesimbra', country: 'Portugal', countryCode: 'PT' },
  { name: 'Berlengas', country: 'Portugal', countryCode: 'PT' },
  { name: 'Great Blue Hole', country: 'Belize', countryCode: 'BZ' },
  { name: 'SS Thistlegorm', country: 'Egypt', countryCode: 'EG' },
  { name: 'Silfra Fissure', country: 'Iceland', countryCode: 'IS' },
];

const dives: SeedDive[] = [
  {
    locationName: 'Sesimbra',
    date: new Date('2025-04-05'),
    depth: 18,
    duration: 42,
    notes: 'Calm seas, octopus spotted.',
    summary: 'Relaxed coastal reef dive.',
    waterTemp: 18,
    visibility: 'good',
    diveType: 'reef',
    waterType: 'salt',
    exposure: 'wet-5mm',
    gas: 'air',
    currents: 'calm',
  },
  {
    locationName: 'Berlengas',
    date: new Date('2025-06-12'),
    depth: 27,
    duration: 38,
    notes: 'Thermocline at 22m.',
    summary: 'Chilly water with great visibility.',
    waterTemp: 16,
    visibility: 'fair',
    diveType: 'reef',
    waterType: 'salt',
    exposure: 'wet-7mm',
    gas: 'air',
    currents: 'mild',
  },
  {
    locationName: 'Great Blue Hole',
    date: new Date('2025-07-20'),
    depth: 32,
    duration: 30,
    notes: 'Stalactites and clear blue water.',
    summary: 'Iconic blue hole drop-off.',
    waterTemp: 26,
    visibility: 'good',
    diveType: 'cave',
    waterType: 'salt',
    exposure: 'wet-3mm',
    gas: 'nitrox',
    currents: 'mild',
  },
  {
    locationName: 'SS Thistlegorm',
    date: new Date('2025-08-15'),
    depth: 28,
    duration: 45,
    notes: 'Wreck packed with artifacts and trucks.',
    summary: 'Classic Red Sea wreck dive.',
    waterTemp: 27,
    visibility: 'good',
    diveType: 'wreck',
    waterType: 'salt',
    exposure: 'wet-3mm',
    gas: 'air',
    currents: 'moderate',
  },
  {
    locationName: 'Silfra Fissure',
    date: new Date('2025-03-10'),
    depth: 14,
    duration: 35,
    notes: 'Crystal-clear glacier water.',
    summary: 'Freshwater rift between tectonic plates.',
    waterTemp: 2,
    visibility: 'excellent',
    diveType: 'lake',
    waterType: 'fresh',
    exposure: 'dry',
    gas: 'air',
    currents: 'mild',
  },
];

async function main() {
  const locationIds = new Map<string, string>();

  // Upsert locations and store their IDs
  for (const location of locations) {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      insert into public.locations (user_id, name, country, country_code)
      values (${USER_ID}, ${location.name}, ${location.country}, ${location.countryCode})
      on conflict (user_id, name)
      do update set
        country = excluded.country,
        country_code = excluded.country_code
      returning id;
    `;

    const id = rows[0]?.id;
    if (!id) {
      throw new Error(`Failed to upsert location: ${location.name}`);
    }

    locationIds.set(location.name, id);
  }

  // Insert dives
  for (const dive of dives) {
    const locationId = locationIds.get(dive.locationName);
    if (!locationId) {
      throw new Error(`Missing location for dive: ${dive.locationName}`);
    }

    await prisma.$executeRaw`
      insert into public.dives (
        user_id,
        location_id,
        date,
        depth,
        duration,
        notes,
        summary,
        water_temp,
        visibility,
        start_pressure,
        end_pressure,
        air_usage,
        dive_type,
        water_type,
        exposure,
        gas,
        currents,
        weight
      )
      values (
        ${USER_ID},
        ${locationId},
        ${dive.date},
        ${dive.depth},
        ${dive.duration},
        ${dive.notes ?? null},
        ${dive.summary ?? null},
        ${dive.waterTemp ?? null},
        ${dive.visibility ?? null},
        ${dive.startPressure ?? null},
        ${dive.endPressure ?? null},
        ${dive.airUsage ?? null},
        ${dive.diveType ?? null},
        ${dive.waterType ?? null},
        ${dive.exposure ?? null},
        ${dive.gas ?? null},
        ${dive.currents ?? null},
        ${dive.weight ?? null}
      )
      on conflict do nothing;
    `;
  }

  console.log(`Seeded ${locations.length} locations and ${dives.length} dives.`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
