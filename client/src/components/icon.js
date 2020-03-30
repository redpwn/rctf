export default function Icon ({ glyph, viewBox, ...props }) {
  return (
    <svg {...props} viewBox={viewBox} xmlns='http://www.w3.org/2000/svg'>
      <use xlinkHref={`#${glyph}`} />
    </svg>
  )
}
