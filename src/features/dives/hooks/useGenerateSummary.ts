import { useState } from 'react';
import type { Dive } from '../types';

export function useGenerateSummary() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = async (editedDive: Dive, originalDive: Dive): Promise<string> => {
    setIsGenerating(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const depth = editedDive.depth || originalDive.depth || 0;
    const duration = editedDive.duration || originalDive.duration || 0;
    const waterTemp = editedDive.water_temp || originalDive.water_temp;
    const visibility = editedDive.visibility || originalDive.visibility;
    const airUsage = editedDive.air_usage || originalDive.air_usage;
    const wildlifeList = editedDive.wildlife || originalDive.wildlife || [];
    const location = editedDive.location || originalDive.location;

    let summary = `This was an exceptional dive at ${location}. You reached a maximum depth of ${depth}m during a ${duration}-minute exploration.`;

    if (waterTemp && visibility) {
      summary += ` The water temperature of ${waterTemp}°C and ${visibility}m visibility provided excellent conditions.`;
    }

    if (wildlifeList.length > 0) {
      const species = wildlifeList.slice(0, 2).join(' and ');
      summary += ` You observed ${wildlifeList.length} different species including ${species}, demonstrating the rich biodiversity of the site.`;
    }

    if (airUsage) {
      summary += ` Your air consumption was efficient at ${airUsage} bar.`;
    }

    summary += ` All safety parameters were within optimal ranges. Notable highlights include the vivid coral formations and the abundance of marine life activity.`;

    setIsGenerating(false);
    return summary;
  };

  return { generateSummary, isGenerating };
}
