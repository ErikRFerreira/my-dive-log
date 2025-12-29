import Loading from '@/components/common/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

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
  const [latState, setLatState] = useState<number | ''>(lat ?? '');
  const [lngState, setLngState] = useState<number | ''>(lng ?? '');

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
          ) : (
            <>
              <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
                Map will be displayed here.
              </div>
            </>
          )}

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
        </CardContent>
      </Card>
    </section>
  );
}

export default LocationMap;
