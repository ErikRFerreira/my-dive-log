import { Card } from '@/components/ui/card';
import type { Dive } from '../types';
import { useNavigate } from 'react-router';

/*
 <div className="space-y-3">
          {recentDives.map((dive) => (
            <Card
              key={dive.id}
              className="bg-[#233C48] border-[#2a3845] p-4 rounded-2xl cursor-pointer hover:border-cyan-400/50 transition-all"
              onClick={() => onViewDive?.(dive.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#0f1419] flex items-center justify-center text-3xl flex-shrink-0">
                  {dive.icon}
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-lg mb-1">{dive.name}</p>
                  <p className="text-gray-400 text-sm flex items-center gap-1 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {dive.date}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-xl">{dive.depth}</span>
                    <span className="text-white font-bold text-xl">{dive.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
                    <span>DEPTH</span>
                    <span>TIME</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

*/

type DiveCardProps = {
  dive: Dive;
};

function DiveCard({ dive }: DiveCardProps) {
  const formatedDate = new Date(dive.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const navigate = useNavigate();

  return (
    <Card
      role="listitem"
      aria-label={`Dive at ${dive.locations?.name || 'Unknown Location'} on ${dive.date}`}
      className="bg-[#233C48] border-[#2a3845] p-4 rounded-2xl cursor-pointer hover:border-cyan-400/50 transition-all"
      onClick={() => navigate(`/dives/${dive.id}`)}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-[#0f1419] flex items-center justify-center text-3xl flex-shrink-0">
          {dive.icon}
        </div>

        <div className="flex-1">
          <p className="text-white font-bold text-lg mb-1">{dive.name}</p>
          <p className="text-gray-400 text-sm flex items-center gap-1 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatedDate}
          </p>
        </div>

        <div className="flex flex-col gap-1 items-end">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xl">{dive.depth}</span>
            <span className="text-white font-bold text-xl">{dive.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
            <span>DEPTH</span>
            <span>TIME</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default DiveCard;
