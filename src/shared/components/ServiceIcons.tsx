import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// Wrench Icon for Plumbing
export const WrenchIcon: React.FC<IconProps> = ({ size = 80, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Wind Icon for HVAC
export const WindIcon: React.FC<IconProps> = ({ size = 80, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Lightning Bolt Icon for Electrical
export const ZapIcon: React.FC<IconProps> = ({ size = 80, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
    />
  </Svg>
);

// Hammer Icon for Carpentry
export const HammerIcon: React.FC<IconProps> = ({ size = 80, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Tree Icon for Landscaping
export const TreeIcon: React.FC<IconProps> = ({ size = 80, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" fill={color} />
    <Path
      d="M12 12v10M8 15c0 0 1-1 4-1s4 1 4 1"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 8c-2 2-3 4-3 6h14c0-2-1-4-3-6"
      fill={color}
    />
  </Svg>
);

// Paintbrush Icon for Painting
export const PaintbrushIcon: React.FC<IconProps> = ({ size = 80, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
    />
    <Path
      d="m9 8 4 4-6 6H3v-4l6-6Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Square/Brick Icon for Walling
export const SquareIcon: React.FC<IconProps> = ({ size = 80, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const getServiceIcon = (type: string) => {
  switch (type) {
    case 'plumbing':
      return WrenchIcon;
    case 'hvac':
      return WindIcon;
    case 'electrical':
      return ZapIcon;
    case 'carpentry':
      return HammerIcon;
    case 'landscaping':
      return TreeIcon;
    case 'painting':
      return PaintbrushIcon;
    case 'walling':
      return SquareIcon;
    default:
      return WrenchIcon;
  }
};
