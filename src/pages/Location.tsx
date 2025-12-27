import Loading from "@/components/common/Loading";
import StatCard from "@/components/common/StatCard";
import NoResults from "@/components/layout/NoResults";
import GoBack from "@/components/ui/GoBack"
import { useGetLocationDives } from "@/features/locations";
import { Calendar, MapPin, TrendingUp, Waves, Zap } from "lucide-react"

function Location() {
	const { dives, isLoading, isError } = useGetLocationDives();

	if (isLoading) {
		return <Loading />;
	}

	if (isError || !dives) {
		return (
			<NoResults>
				Error loading location. Please try again later.
			</NoResults>
		);
	}

	const location = dives?.[0]?.locations ?? null;
	const country = location?.country ?? 'Unknown Country';
	const name = location?.name ?? 'Unknown Location';
	const totalDives = dives.length;
	const averageDepth = Math.round(
		dives.reduce((sum, dive) => sum + dive.depth, 0) / totalDives
	);
	const deepestDive = Math.max(...dives.map((dive) => dive.depth));
	const lastDiveDateTimestamp = Math.max(
		...dives.map((dive) => new Date(dive.date).getTime())
	);
	const lastDiveDate = Number.isFinite(lastDiveDateTimestamp)
		? new Date(lastDiveDateTimestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		  })
		: 'N/A';

	
	return (
	<>
		
		<header>
			<GoBack />
			<h1 className="text-3xl font-bold text-foreground">{name}</h1>
				<p className="text-muted-foreground mt-1 flex items-center gap-1">
				<MapPin className="w-4 h-4" />
				{country}
			</p>
		</header>
		<section className="grid grid-cols-1 md:grid-cols-4 gap-4">
			<StatCard
				title="Total Dives"
				value={totalDives}
				icon={<Waves className="w-6 h-6" />}
				color="from-teal-500 to-teal-700"
			/>
			<StatCard
				title="Average Depth"
				value={`${averageDepth} m`}
				icon={<Zap className="w-6 h-6" />}
				color="from-cyan-500 to-cyan-700"
			/>
			<StatCard
				title="Deepest Dive"
				value={`${deepestDive} m`}
				icon={<TrendingUp className="w-6 h-6" />}
				color="from-blue-500 to-blue-700"
			/>
			<StatCard
				title="Last Dive"
				value={lastDiveDate}
				icon={<Calendar className="w-6 h-6" />}
				color="from-purple-500 to-purple-700"
			/>
		</section>
	  </>
  )
}

export default Location