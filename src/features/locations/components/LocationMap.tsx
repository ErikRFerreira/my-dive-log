import Loading from '@/components/common/Loading';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

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

type LocationMapProps = {
  name: string;
  country: string;
  lat?: number | null;
  lng?: number | null;
  isUpdatingLocation?: boolean;
  onLatLngChange: (lat: number, lng: number) => void;
};

function LocationMap({
  name,
  country,
  lat,
  lng,
  isUpdatingLocation,
  onLatLngChange,
}: LocationMapProps) {
  const latValue = (() => {
    const value = lat as unknown;
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') return Number(value);
    return null;
  })();

  const lngValue = (() => {
    const value = lng as unknown;
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') return Number(value);
    return null;
  })();

  const [latState, setLatState] = useState<number | ''>(latValue ?? '');
  const [lngState, setLngState] = useState<number | ''>(lngValue ?? '');
  const label = `${name}, ${country}`;

  useEffect(() => {
    setLatState(latValue ?? '');
    setLngState(lngValue ?? '');
  }, [latValue, lngValue]);

  const selectedLat =
    typeof latState === 'number' && Number.isFinite(latState) ? (latState as number) : null;
  const selectedLng =
    typeof lngState === 'number' && Number.isFinite(lngState) ? (lngState as number) : null;
  const hasSelectedCoords = selectedLat !== null && selectedLng !== null;

  const mapCenter = (hasSelectedCoords ? [selectedLat, selectedLng] : [0, 0]) as [number, number];
  const mapZoom = hasSelectedCoords ? 12 : 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (latState !== '' && lngState !== '') {
      onLatLngChange(Number(latState), Number(lngState));
    }
  };

  function MapClickHandler() {
    useMapEvents({
      click: (event) => {
        setLatState(event.latlng.lat);
        setLngState(event.latlng.lng);
      },
    });

    return null;
  }

  function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, zoom);
    }, [map, center, zoom]);
    return null;
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-3 px-2">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-foreground text-lg font-semibold">Location Map</h3>
      </div>

      {isUpdatingLocation ? <Loading /> : null}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={false}
        className="h-[500px] w-full rounded-2xl overflow-hidden"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />
        <MapViewUpdater center={mapCenter} zoom={mapZoom} />
        <MapClickHandler />
        {hasSelectedCoords ? (
          <Marker position={[selectedLat, selectedLng] as [number, number]}>
            <Popup>{label ?? 'Dive location'}</Popup>
          </Marker>
        ) : null}
      </MapContainer>

      <Card className="mt-4 bg-card-dark border-border-dark rounded-2xl">
        <CardContent className="p-6">
          <form className="text-sm text-muted-foreground" onSubmit={handleSubmit}>
            {!hasSelectedCoords ? (
              <p className="mb-4">
                No coordinates yet. Click anywhere on the map to pick a location, or type them
                below.
              </p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-semibold text-muted-foreground">
                  Latitude
                </label>
                <Input
                  type="number"
                  value={latState}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setLatState(val);
                  }}
                  placeholder="Enter latitude"
                  step="any"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-muted-foreground">
                  Longitude
                </label>
                <Input
                  type="number"
                  value={lngState}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setLngState(val);
                  }}
                  placeholder="Enter longitude"
                  step="any"
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end">
              <Button type="submit" disabled={latState === '' || lngState === ''}>
                Set Coordinates
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export default LocationMap;
