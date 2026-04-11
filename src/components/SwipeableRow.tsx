import React, { useRef, useCallback } from 'react'
import { Animated } from 'react-native'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Stack, StyledText, StyledPressable } from 'fluent-styles'
import { DeleteIcon } from '../icons'
import { Colors } from '../constants'

interface SwipeableRowProps {
  children:  React.ReactNode
  onDelete:  () => void
  label?:    string
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children, onDelete, label = 'Delete',
}) => {
  const swipeRef = useRef<Swipeable>(null)

  const handleDelete = useCallback(() => {
    swipeRef.current?.close()
    onDelete()
  }, [onDelete])

  const renderRightAction = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange:  [-80, 0],
      outputRange: [1, 0.7],
      extrapolate: 'clamp',
    })

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <StyledPressable
          width={80}
          height="100%"
          backgroundColor={Colors.expense}
          alignItems="center"
          justifyContent="center"
          gap={4}
          onPress={handleDelete}
        >
          <DeleteIcon size={20} color={Colors.white} />
          <StyledText fontSize={11} fontWeight="700" color={Colors.white}>
            {label}
          </StyledText>
        </StyledPressable>
      </Animated.View>
    )
  }

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightAction}
      rightThreshold={40}
      overshootRight={false}
      friction={2}
    >
      {children}
    </Swipeable>
  )
}
