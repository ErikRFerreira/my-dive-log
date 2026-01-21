import caveIcon from '../../assets/icons/cave.svg?raw';
import driftIcon from '../../assets/icons/drift.svg?raw';
import lakeRiverIcon from '../../assets/icons/lake-river.svg?raw';
import nightIcon from '../../assets/icons/night.svg?raw';
import reefIcon from '../../assets/icons/reef.svg?raw';
import trainingIcon from '../../assets/icons/training.svg?raw';
import wallIcon from '../../assets/icons/wall.svg?raw';
import wreckIcon from '../../assets/icons/wreck.svg?raw';

const TYPE_ICON_SVGS = {
  cave: caveIcon,
  drift: driftIcon,
  'lake-river': lakeRiverIcon,
  night: nightIcon,
  reef: reefIcon,
  training: trainingIcon,
  wall: wallIcon,
  wreck: wreckIcon,
} as const;

type TypeIconKey = keyof typeof TYPE_ICON_SVGS;

type TypeIconProps = {
  icon: TypeIconKey | string;
  color?: string;
};

function TypeIconBase({ icon, color = 'text-primary' }: TypeIconProps) {
  const resolvedIcon = TYPE_ICON_SVGS[icon as TypeIconKey];
  if (!resolvedIcon) return null;

  return (
    <div
      aria-hidden="true"
      className={`z-10 flex w-10 h-10 items-center justify-center ${color} [&>svg]:h-10 [&>svg]:w-10`}
      dangerouslySetInnerHTML={{ __html: resolvedIcon }}
    />
  );
}

export default TypeIconBase;
