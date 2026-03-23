import type { Resident } from '../../types'

type Size = 'sm' | 'md' | 'lg'
const sizeClass: Record<Size, string> = {
  sm: 'w-5 h-5 text-[11px] rounded-[5px]',
  md: 'w-6 h-6 text-[11px] rounded-[6px]',
  lg: 'w-9 h-9 text-sm rounded-[9px]',
}

export function Avatar({ resident, size = 'md' }: { resident: Resident; size?: Size }) {
  return (
    <span
      className={`inline-flex items-center justify-center font-syne font-bold flex-shrink-0 ${sizeClass[size]}`}
      style={{ background: resident.bg, color: resident.color }}
    >
      {resident.initial}
    </span>
  )
}
