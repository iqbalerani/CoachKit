import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import FadeInView from './FadeInView';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface StaggerListProps {
  staggerDelay?: number;
  baseDelay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function StaggerList({
  staggerDelay = 60,
  baseDelay = 0,
  direction = 'up',
  distance,
  duration,
  style,
  children,
}: StaggerListProps) {
  const childArray = React.Children.toArray(children);

  return (
    <>
      {childArray.map((child, index) => (
        <FadeInView
          key={index}
          delay={baseDelay + index * staggerDelay}
          direction={direction}
          distance={distance}
          duration={duration}
          style={style}
        >
          {child}
        </FadeInView>
      ))}
    </>
  );
}
