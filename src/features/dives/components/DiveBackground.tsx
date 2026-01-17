type DiveBackgroundProps = {
  coverPhotoUrl: string;
};

function DiveBackground({ coverPhotoUrl }: DiveBackgroundProps) {
  return (
    <div className="absolute left-0 right-0 top-0 h-[440px] overflow-hidden pointer-events-none z-0 md:left-[300px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${coverPhotoUrl}')` }}
      ></div>
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/20 to-cyan-50 dark:via-slate-900/25 dark:to-slate-900"></div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-cyan-50 dark:to-slate-900"></div>
    </div>
  );
}

export default DiveBackground;
