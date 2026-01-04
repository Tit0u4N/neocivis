import { forwardRef } from 'react';
import { ScrollView as RnScrollView, type ScrollViewProps } from 'react-native';

export const ScrollView = forwardRef<RnScrollView, ScrollViewProps>(({ style, ...otherProps }, ref) => {
 return <RnScrollView ref={ref} style={[{ backgroundColor: 'transparent' }, style]} {...otherProps} />;
});
