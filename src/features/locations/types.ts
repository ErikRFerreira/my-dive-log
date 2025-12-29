export interface Location {
	id: string;
	name: string;
	country: string | null;
	country_code: string | null;
	lat?: number | null;
	lng?: number | null;
}