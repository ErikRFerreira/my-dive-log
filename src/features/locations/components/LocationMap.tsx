import Loading from '@/components/common/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

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

  const hasValidCoords =
    typeof latValue === 'number' &&
    typeof lngValue === 'number' &&
    Number.isFinite(latValue) &&
    Number.isFinite(lngValue);

  const mapCenter = (hasValidCoords ? [latValue, lngValue] : [0, 0]) as [number, number];
  const mapZoom = hasValidCoords ? 12 : 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (latState !== '' && lngState !== '') {
      onLatLngChange(Number(latState), Number(lngState));
    }
  };

  return (
    <section>
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">Location Map</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isUpdatingLocation ? (
            <Loading />
          ) : hasValidCoords ? (
            <MapContainer
              key={`${latValue},${lngValue}`}
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={false}
              className="h-[500px] w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latValue, lngValue] as [number, number]}>
                <Popup>{label ?? 'Dive location'}</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <>
              <div className="h-[100px] flex items-center justify-center text-muted-foreground">
                Enter valid coordinates to display the map.
              </div>
              <form className="mt-4 text-sm text-muted-foreground" onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="block mb-1 font-medium">Latitude:</label>
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-full bg-white dark:bg-slate-900"
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
                <div className="mb-2">
                  <label className="block mb-1 font-medium">Longitude:</label>
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-full bg-white dark:bg-slate-900"
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
                <button
                  type="submit"
                  className="mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={latState === '' || lngState === ''}
                >
                  Set Coordinates
                </button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default LocationMap;
