import type React from 'react';
import { forwardRef } from 'react';
import { Text as RnText, type TextProps as RnTextProps, type TextStyle } from 'react-native';
import { useColor } from '@/hooks/useColor';
import { FONT_SIZE } from '@/theme/globals';

type TextVariant = 'body' | 'title' | 'subtitle' | 'caption' | 'heading' | 'link';

interface TextProps extends RnTextProps {
  variant?: TextVariant;
  lightColor?: string;
  darkColor?: string;
  children: React.ReactNode;
}

export const Text = forwardRef<RnText, TextProps>(
  ({ variant = 'body', lightColor, darkColor, style, children, ...props }, ref) => {
    const textColor = useColor('text', { light: lightColor, dark: darkColor });
    const mutedColor = useColor('textMuted');

    const getTextStyle = (): TextStyle => {
      const baseStyle: TextStyle = {
        color: textColor,
      };

      switch (variant) {
        case 'heading':
          return {
            ...baseStyle,
            fontSize: 28,
            fontWeight: '800',
          };
        case 'title':
          return {
            ...baseStyle,
            fontSize: 24,
            fontWeight: '700',
          };
        case 'subtitle':
          return {
            ...baseStyle,
            fontSize: 19,
            fontWeight: '600',
          };
        case 'caption':
          return {
            ...baseStyle,
            fontSize: FONT_SIZE,
            fontWeight: '400',
            color: mutedColor,
          };
        case 'link':
          return {
            ...baseStyle,
            fontSize: FONT_SIZE,
            fontWeight: '500',
            textDecorationLine: 'underline',
          };
        default: // 'body'
          return {
            ...baseStyle,
            fontSize: FONT_SIZE,
            fontWeight: '400',
          };
      }
    };

    return (
      <RnText ref={ref} style={[getTextStyle(), style]} {...props}>
        {children}
      </RnText>
    );
  },
);
