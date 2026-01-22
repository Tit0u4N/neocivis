import { forwardRef } from 'react';
import { View as RnView, type ViewProps } from 'react-native';

export const View = forwardRef<RnView, ViewProps>(({ style, ...otherProps }, ref) => {
  return <RnView ref={ref} style={[{ backgroundColor: 'transparent' }, style]} {...otherProps} />;
});
