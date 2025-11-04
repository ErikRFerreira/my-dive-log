import {getDepthColor} from "../utils/helpers"

type DepthBadgeProps = {
  depth: number;
}


function DepthBadge({depth} : DepthBadgeProps) {
  
  const bgColor = getDepthColor(depth);
  const label = `${depth} m`;
  const style = {
    backgroundColor: bgColor,
    color: 'white',
    borderRadius: 9999,
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.2,
  }
  
  return (
    <span className={'depth-badge'} aria-label={label} style={style}> 
      {label}
    </span>
  )
}

export default DepthBadge