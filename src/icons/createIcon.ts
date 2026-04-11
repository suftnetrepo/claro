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

export function createIcon(render: IconRenderer) {
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
