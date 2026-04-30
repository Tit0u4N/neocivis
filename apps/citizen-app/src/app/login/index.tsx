import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useColor } from '@/hooks/useColor';
import { useLoginScreen } from '@/screens/login/useLoginScreen';

const HERO_LINE_HEIGHT = 64;
const HERO_FONT_SIZE = 60;
const ROLLER_ITEM_HEIGHT = HERO_LINE_HEIGHT + 3;
const SHEET_DIP_DEPTH = 22;
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export default function LoginScreen() {
  const { isLoading, onSignIn, cities, cityIndex } = useLoginScreen();
  const { t } = useTranslation();

  const backgroundColor = useColor('background');
  const mutedForegroundColor = useColor('mutedForeground');
  const primaryColor = useColor('primary');

  const enterOpacity = useRef(new Animated.Value(0)).current;
  const enterTranslate = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(enterTranslate, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [enterOpacity, enterTranslate]);

  const enterStyle = { opacity: enterOpacity, transform: [{ translateY: enterTranslate }] };

  const [sheetSize, setSheetSize] = useState({ w: 0, h: 0 });
  const sheetPath =
    sheetSize.w > 0
      ? `M 0 0 Q ${sheetSize.w / 2} ${SHEET_DIP_DEPTH * 2} ${sheetSize.w} 0 L ${sheetSize.w} ${sheetSize.h} L 0 ${sheetSize.h} Z`
      : '';

  return (
    <View style={[styles.splash, { backgroundColor: primaryColor }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0)']}
        locations={[0, 0.2]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.15, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.70)', 'rgba(0,0,0,0)']}
        locations={[0, 0.55]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.85, y: 0.1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.hero}>
        <View style={styles.ringLg} />
        <View style={styles.ringSm} />

        <Animated.View style={[styles.wordmarkRow, enterStyle]}>
          <View style={styles.wordmarkDot} />
          <Text style={styles.wordmark}>{t('login.brand').toUpperCase()}</Text>
        </Animated.View>

        <Animated.View style={[styles.heroText, enterStyle]}>
          <Text style={styles.kicker}>{t('login.welcomeTo').toUpperCase()}</Text>
          <CityRoller cities={cities} index={cityIndex} />
        </Animated.View>
      </View>

      <Animated.View
        style={[styles.sheet, enterStyle]}
        onLayout={(e) => setSheetSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        {sheetPath ? (
          <Svg width={sheetSize.w} height={sheetSize.h} style={StyleSheet.absoluteFill}>
            <Path d={sheetPath} fill={backgroundColor} />
          </Svg>
        ) : null}
        <Text style={[styles.subtitle, { color: mutedForegroundColor }]}>{t('login.subtitle')}</Text>

        {isLoading ? (
          <View style={styles.spinnerWrap}>
            <Spinner size="lg" />
          </View>
        ) : (
          <View style={styles.buttons}>
            <Button variant="default" style={styles.button} onPress={onSignIn}>
              {t('login.signIn')}
            </Button>
            <Button variant="outline" style={styles.button} onPress={onSignIn}>
              {t('login.signUp')}
            </Button>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function CityRoller({ cities, index }: { cities: readonly string[]; index: number }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: -index * ROLLER_ITEM_HEIGHT,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [index, translateY]);

  return (
    <View style={styles.rollerWindow}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {cities.map((city) => (
          <Text key={city} style={[styles.heroTitle, styles.rollerItem]}>
            {city}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
  },
  hero: {
    flex: 1.45,
    paddingTop: 64,
    paddingHorizontal: 28,
    paddingBottom: 96,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  ringLg: {
    position: 'absolute',
    top: -180,
    right: -160,
    width: 420,
    height: 420,
    borderRadius: 210,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.18)',
    pointerEvents: 'none',
  },
  ringSm: {
    position: 'absolute',
    top: -60,
    right: 40,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    pointerEvents: 'none',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordmarkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  wordmark: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.4,
  },
  heroText: {
    gap: 6,
  },
  kicker: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: HERO_FONT_SIZE,
    fontWeight: '900',
    lineHeight: HERO_LINE_HEIGHT,
    letterSpacing: -1.6,
    color: '#FFFFFF',
  },
  rollerWindow: {
    height: ROLLER_ITEM_HEIGHT,
    overflow: 'hidden',
  },
  rollerItem: {
    height: ROLLER_ITEM_HEIGHT,
  },
  sheet: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 38,
    paddingBottom: 36,
    marginTop: -SHEET_DIP_DEPTH,
    gap: 16,
    zIndex: 2,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.10)',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 8,
  },
  buttons: {
    gap: 12,
    marginTop: 'auto',
  },
  button: {
    borderRadius: 10,
    height: 56,
  },
  spinnerWrap: {
    marginTop: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
});
