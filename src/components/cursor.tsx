import { cn } from '@/lib/utils'
import { MousePointer2 } from 'lucide-react'

export const Cursor = ({
  className,
  style,
  color,
  name,
}: {
  className?: string
  style?: React.CSSProperties
  color: string
  name: string
}) => {
  return (
    <div className={cn('select-none group', className)} style={style}>
      <MousePointer2 color={color} fill={color} size={24} />

      <div
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out mt-1 p-1 rounded-lg text-[10px] font-medium text-white text-center"
        style={{ backgroundColor: color }}
      >
        {name.split('@')[0]}
      </div>
    </div>
  )
}