import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import type { Dive } from '@/features/dives/types';
import type { Location } from '@/features/locations/types';

// Fix default marker icons in Vite/React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet's default icon URLs don't work with bundlers unless overridden.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type LocationsMapProps = {
  dives: Dive[];
  locations: Location[];
};

type LocationPin = {
  id: string;
  name: string;
  country: string | null;
  lat: number;
  lng: number;
  totalDives: number;
};

function LocationsMap({ dives, locations }: LocationsMapProps) {
  const locationPins = useMemo<LocationPin[]>(() => {
    const counts = new Map<string, number>();
    const fallbacks = new Map<string, { name: string; country: string | null }>();
    dives.forEach((dive) => {
      const id = dive.location_id ?? dive.locations?.id;
      if (!id) return;
      counts.set(id, (counts.get(id) ?? 0) + 1);
      if (!fallbacks.has(id) && dive.locations?.name) {
        fallbacks.set(id, {
          name: dive.locations.name,
          country: dive.locations.country ?? null,
        });
      }
    });

    return locations
      .map((location) => {
        const lat = location.lat ?? null;
        const lng = location.lng ?? null;
        if (typeof lat !== 'number' || typeof lng !== 'number') return null;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const fallback = fallbacks.get(location.id);

        return {
          id: location.id,
          name: location.name || fallback?.name || 'Unknown location',
          country: location.country ?? fallback?.country ?? null,
          lat,
          lng,
          totalDives: counts.get(location.id) ?? 0,
        };
      })
      .filter((pin): pin is LocationPin => pin !== null);
  }, [dives, locations]);

  const bounds = useMemo(() => {
    if (!locationPins.length) return null;
    return L.latLngBounds(locationPins.map((pin) => [pin.lat, pin.lng] as [number, number]));
  }, [locationPins]);

  function MapBoundsUpdater({
    bounds: boundsInput,
    fallbackCenter,
    fallbackZoom,
  }: {
    bounds: L.LatLngBounds | null;
    fallbackCenter: [number, number];
    fallbackZoom: number;
  }) {
    const map = useMap();
    useEffect(() => {
      if (boundsInput) {
        map.fitBounds(boundsInput, { padding: [48, 48] });
        return;
      }
      map.setView(fallbackCenter, fallbackZoom);
    }, [map, boundsInput, fallbackCenter, fallbackZoom]);
    return null;
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-3 px-2">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-foreground text-lg font-semibold">Locations Map</h3>
      </div>

      <MapContainer
        center={[0, 0]}
        zoom={2}
        scrollWheelZoom={false}
        className="relative z-0 h-[500px] w-full rounded-2xl overflow-hidden"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />
        <MapBoundsUpdater bounds={bounds} fallbackCenter={[0, 0]} fallbackZoom={2} />

        {locationPins.map((pin) => {
          const label = pin.country ? `${pin.name}, ${pin.country}` : pin.name;
          return (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              eventHandlers={{
                mouseover: (event) => event.target.openPopup(),
                mouseout: (event) => event.target.closePopup(),
              }}
            >
              <Popup className="locations-map-popup">
                <div className="text-sm">
                  <div className="font-semibold text-foreground">{label}</div>
                  <div className="text-muted-foreground">Total dives: {pin.totalDives}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </section>
  );
}

export default LocationsMap;
