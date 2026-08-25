import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'

export interface IconProps {
  size?:        number
  color?:       string
  strokeWidth?: number
  style?:       StyleProp<ViewStyle>
}

type IconRenderer = (
  props: Required<Pick<IconProps, 'size' | 'color' | 'strokeWidth'>>,
  rest:  Omit<IconProps, 'size' | 'color' | 'strokeWidth'>
) => React.ReactElement

// Same call signature as before ((props: IconProps) => React.ReactElement),
// just with `displayName` declared as an assignable property — every icon
// file already does `XIcon.displayName = 'XIcon'` after defining it.
type IconComponent = ((props: IconProps) => React.ReactElement) & { displayName?: string }

export function createIcon(render: IconRenderer): IconComponent {
  const Icon = ({
    size        = 24,
    color       = '#1A1A1A',
    strokeWidth = 1.8,
    style,
    ...rest
  }: IconProps) => {
    return render({ size, color, strokeWidth }, { style, ...rest })
  }
  return Icon
}
