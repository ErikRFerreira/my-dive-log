import { Card, CardContent } from '@/components/ui/card';
import { Award, Target, TrendingUp, Trophy } from 'lucide-react';

function DiveMilestones() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4">Diving Milestones</h2>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-3">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">100 Dives</h3>
              <p className="text-xs text-muted-foreground mt-1">Century Club</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-3">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">40m Depth</h3>
              <p className="text-xs text-muted-foreground mt-1">Deep Diver</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-3">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">50 Species</h3>
              <p className="text-xs text-muted-foreground mt-1">Marine Biologist</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-3">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">20 Locations</h3>
              <p className="text-xs text-muted-foreground mt-1">World Explorer</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default DiveMilestones;
