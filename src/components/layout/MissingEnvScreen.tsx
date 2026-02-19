export default function MissingEnvScreen({ missing }: { missing: string[] }) {
  return (
    <div className="max-w-3xl mx-auto my-16 p-6">
      <h1 className="text-2xl font-bold text-foreground mb-3">Deployment misconfigured</h1>
      <p className="mb-4 text-foreground">
        This app is missing required environment variables. If you are the developer, set them in
        Vercel and redeploy.
      </p>
      <div className="p-3 bg-muted rounded-lg">
        <strong className="font-semibold text-foreground block mb-2">Missing:</strong>
        <ul className="list-disc list-inside space-y-1">
          {missing.map((m) => (
            <li key={m} className="text-foreground">
              {m}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-muted-foreground">
        Note: in Vite, public env vars must start with{' '}
        <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">VITE_</code>.
      </p>
    </div>
  );
}
