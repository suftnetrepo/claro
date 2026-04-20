import React from 'react'
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg'

interface ClaroLogoProps {
  size?: number
  variant?: 'icon' | 'full'  // icon = mark only, full = mark + wordmark
  color?: string              // override for monochrome usage
}

export function ClaroLogo({ size = 40, variant = 'icon', color }: ClaroLogoProps) {
  if (variant === 'icon') {
    return (
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
          <LinearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color ?? '#7C6FF7'} />
            <Stop offset="1" stopColor={color ?? '#5B4FE8'} />
          </LinearGradient>
        </Defs>
        {/* Rounded square background */}
        <Path d="M8 0h24a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8z" fill="url(#lg1)" />
        {/* C letterform — clean arc with a gap */}
        <Path
          d="M26 13a10 10 0 1 0 0 14"
          stroke="#fff" strokeWidth="3" fill="none"
          strokeLinecap="round"
        />
        {/* Upward trend line — the money growth symbol */}
        <Path
          d="M22 24 L26 20 L29 22 L32 17"
          stroke="rgba(255,255,255,0.75)" strokeWidth="2" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
        />
      </Svg>
    )
  }

  // Full variant: icon + "claro" wordmark side by side
  const iconSize = size
  const textScale = size / 40
  return (
    <Svg width={iconSize + 72 * textScale} height={iconSize} viewBox={`0 0 ${40 + 72} 40`}>
      <Defs>
        <LinearGradient id="lg2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={color ?? '#7C6FF7'} />
          <Stop offset="1" stopColor={color ?? '#5B4FE8'} />
        </LinearGradient>
      </Defs>
      {/* Icon mark */}
      <Path d="M8 0h24a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8z" fill="url(#lg2)" />
      <Path d="M26 13a10 10 0 1 0 0 14" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M22 24 L26 20 L29 22 L32 17" stroke="rgba(255,255,255,0.75)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* "claro" wordmark */}
      <Path
        d="M52 24a6 6 0 1 0 0-8M62 16v8M62 16a4 4 0 0 1 4-4M70 16v8M70 20a4 4 0 0 1 8 0v4M82 24V11M90 20a4 4 0 1 0 0 1"
        stroke={color ?? '#1a1a2e'} strokeWidth="2.5" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  )
}
