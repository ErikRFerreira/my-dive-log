import diverIcon from '../../assets/icons/diver.svg?raw';

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center text-primary [&>svg]:h-8 [&>svg]:w-8"
        dangerouslySetInnerHTML={{ __html: diverIcon }}
      />
      <h2 className="text-xl font-bold text-white">Dive Log</h2>
    </div>
  );
}

export default Logo;
