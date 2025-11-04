export const getDepthColor = (depth: number): string => {
	if (depth <= 18) {
		return '#16a34a'; // green
	} else if (depth <= 40) {
		return '#eab308'; // yellow
	} else {
		return '#dc2626'; // red
	}
}
