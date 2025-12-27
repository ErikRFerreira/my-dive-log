import { LocationCards, LocationStats } from '@/features/locations';

function Locations() {
  return (
    <>
      <header>
        <h1 className="text-3xl font-bold text-foreground">Dive Locations</h1>
        <p className="text-muted-foreground mt-1">
          Explore and manage your favorite dive sites around the world
        </p>
      </header>

      <section>
        <LocationStats />
      </section>

      <section className="mt-8">
        <LocationCards />
      </section>
    </>
  );
}

export default Locations;
