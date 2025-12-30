export interface Location {
	id: string;
	name: string;
	country: string | null;
	country_code: string | null;
	is_favorite?: boolean;
	lat?: number | null;
	lng?: number | null;
}