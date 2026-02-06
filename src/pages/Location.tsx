import InlineSpinner from '@/components/common/InlineSpinner';
import Loading from '@/components/common/Loading';
import QueryErrorFallback from '@/components/common/QueryErrorFallback';
import StatCard from '@/components/common/StatCard';
import GoBack from '@/components/ui/GoBack';
import { LocationMap, LocationRecentDives, useGetLocationDives } from '@/features/locations';
import { useToggleLocationFavorite } from '@/features/locations/hooks/useToggleLocationFavorite';
import { useUpdateLocation } from '@/features/locations/hooks/useUpdateLocation';
import { formatValueWithUnit } from '@/shared/utils/units';
import { useSettingsStore } from '@/store/settingsStore';
import { Calendar, MapPin, Star, TrendingUp, Waves, Zap } from 'lucide-react';

function Location() {
  const { dives, isLoading, error, refetch } = useGetLocationDives();
  const { isPending: isUpdatingLocation, mutateAsync: updateLocation } = useUpdateLocation();
  const { isPending: isTogglingFavorite, mutateAsync: toggleFavoriteMutate } =
    useToggleLocationFavorite();
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <QueryErrorFallback
        error={error}
        onRetry={refetch}
        title="Failed to Load Location"
        description="Unable to load location data. Please check your connection and try again."
      />
    );
  }

  const location = dives?.[0]?.locations ?? null;
  const locationId = location?.id ?? null;
  const country = location?.country ?? 'Unknown Country';
  const name = location?.name ?? 'Unknown Location';
  const is_favorite = location?.is_favorite ?? false;
  const lat = location?.lat ?? null;
  const lng = location?.lng ?? null;
  const totalDives = dives?.length ?? 0;
  const averageDepth =
    totalDives > 0
      ? Math.round((dives ?? []).reduce((sum, dive) => sum + dive.depth, 0) / totalDives)
      : 0;
  const deepestDive =
    (dives?.length ?? 0) > 0 ? Math.max(...(dives ?? []).map((dive) => dive.depth)) : 0;
  const lastDiveDateTimestamp =
    (dives?.length ?? 0) > 0
      ? Math.max(...(dives ?? []).map((dive) => new Date(dive.date).getTime()))
      : -Infinity;
  const lastDiveDate = Number.isFinite(lastDiveDateTimestamp)
    ? new Date(lastDiveDateTimestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

  const onLatLngChange = (lat: number | '', lng: number | '') => {
    if (locationId) {
      updateLocation({
        id: locationId,
        locationData: {
          lat: lat === '' ? null : lat,
          lng: lng === '' ? null : lng,
        },
      });
    }
  };

  return (
    <>
      <header>
        <GoBack />
        <div className="flex gap-4 mt-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{name}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {country}
            </p>
          </div>
          {isTogglingFavorite ? (
            <div className="pt-2">
              <InlineSpinner size={24} />
            </div>
          ) : (
            <button
              onClick={() =>
                locationId && toggleFavoriteMutate({ id: locationId, isFavorite: !is_favorite })
              }
              className="inline h-10"
            >
              <Star
                className={`w-6 h-6 ${
                  is_favorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                }`}
              />
            </button>
          )}
        </div>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Dives" value={totalDives} icon={<Waves className="w-42 h-42" />} />
        <StatCard
          title="Average Depth"
          value={formatValueWithUnit(averageDepth, 'depth', unitSystem)}
          icon={<Zap className="w-42 h-42" />}
        />
        <StatCard
          title="Deepest Dive"
          value={formatValueWithUnit(deepestDive, 'depth', unitSystem)}
          icon={<TrendingUp className="w-42 h-42" />}
        />
        <StatCard
          title="Last Dive"
          value={lastDiveDate}
          icon={<Calendar className="w-42 h-42" />}
        />
      </section>

      {/* Map Section */}
      <LocationMap
        name={name}
        country={country}
        lat={lat}
        lng={lng}
        onLatLngChange={onLatLngChange}
        isUpdatingLocation={isUpdatingLocation}
      />

      {/* Recent Dives Section */}
      <LocationRecentDives dives={dives ?? []} />
    </>
  );
}

export default Location;
