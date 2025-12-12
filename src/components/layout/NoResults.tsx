import { Card, CardContent } from '../ui/card';

function NoResults({ children }: { children?: React.ReactNode }) {
  return (
    <Card className="bg-card border-slate-200 dark:border-slate-700">
      <CardContent className="p-12 text-center">
        <div className="text-muted-foreground flex flex-col gap-4">{children}</div>
      </CardContent>
    </Card>
  );
}

export default NoResults;
