import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, commonStyles, spacing, typography, borderRadius } from '../styles/commonStyles';

// Lazy import react-native-svg without type dependency
const SvgLib: any = require('react-native-svg');
const Svg: any = SvgLib.Svg || SvgLib.default;
const Path: any = SvgLib.Path;

type TankStatus = 'good' | 'warning' | 'critical';

// Build a seamless sine wave path that loops perfectly
function buildWavePath(totalWidth: number, height: number, amplitude: number, wavelength: number) {
  const step = 2; // Very smooth curves
  const mid = height * 0.5;
  let d = `M 0 ${height} L 0 ${mid}`;
  
  // Generate exactly one complete wavelength cycle for seamless looping
  for (let x = 0; x <= totalWidth; x += step) {
    const angle = (2 * Math.PI * x) / wavelength;
    const y = mid + amplitude * Math.sin(angle);
    d += ` L ${x} ${y}`;
  }
  
  d += ` L ${totalWidth} ${height} Z`;
  return d;
}

const Tank: React.FC<{ delay: number; size?: number }> = ({ delay, size = 180 }) => {
  const [status, setStatus] = React.useState<TankStatus>('good');
  const level = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const waveOffset = useRef(new Animated.Value(0)).current;

  // Fishes: multiple independent animated positions
  const fishCount = 4;
  const fishes = useRef(
    Array.from({ length: fishCount }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      r: new Animated.Value(0),
    }))
  ).current;

  // Bubbles
  const bubbleCount = 8;
  const bubbles = useRef(
    Array.from({ length: bubbleCount }, (_, i) => ({
      y: new Animated.Value(0),
      leftPct: Math.random() * 80 + 10,
      size: Math.random() * 6 + 4,
      delay: i * 100 + Math.random() * 200,
      speed: 1600 + Math.random() * 1200,
    }))
  ).current;

  useEffect(() => {
    // Randomize tank status repeatedly so it doesn't stay at one level
    const choices: TankStatus[] = ['good', 'warning', 'critical'];
    const pickStatus = () => choices[Math.floor(Math.random() * choices.length)];
    let last: TankStatus | null = null;
    const statusTimer = setInterval(() => {
      let next = pickStatus();
      if (next === last) next = pickStatus();
      last = next;
      setStatus(next);
    }, 1200);

    const levelAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(level, { toValue: 1, duration: 1400, delay, useNativeDriver: true }),
        Animated.timing(level, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, delay, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    const ringAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1, duration: 1200, delay, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );

    // Endless sine wave offset (slower and smoother)
    const waveAnim = Animated.loop(
      Animated.timing(waveOffset, {
        toValue: 1,
        duration: 8000, // Increased duration for smoother animation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Fish random walkers
    const range = (min: number, max: number) => Math.random() * (max - min) + min;
    const half = size * 0.4;
    const moveFish = (f: { x: Animated.Value; y: Animated.Value; r: Animated.Value }, d: number) => {
      const toX = range(-half, half);
      const toY = range(-half + 10, half - 10);
      const toR = Math.sign(toX) >= 0 ? 1 : -1;
      Animated.parallel([
        Animated.timing(f.x, { toValue: toX, duration: range(900, 1700), delay: d, useNativeDriver: true }),
        Animated.timing(f.y, { toValue: toY, duration: range(900, 1700), delay: d, useNativeDriver: true }),
        Animated.timing(f.r, { toValue: toR, duration: range(900, 1700), delay: d, useNativeDriver: true }),
      ]).start(() => moveFish(f, 0));
    };
    fishes.forEach((f, i) => moveFish(f, i * 150));

    // Bubble loops
    bubbles.forEach(b => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(b.y, { toValue: -size, duration: b.speed, delay: b.delay, useNativeDriver: true }),
          Animated.timing(b.y, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    });

    levelAnim.start();
    pulseAnim.start();
    ringAnim.start();
    waveAnim.start();
    return () => {
      clearInterval(statusTimer);
      levelAnim.stop();
      pulseAnim.stop();
      ringAnim.stop();
      waveOffset.setValue(0);
    };
  }, [delay, level, pulse, ring, size, fishes, bubbles]);

  const translateY = level.interpolate({ inputRange: [0, 1], outputRange: [20, -12] });
  const sensorOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.85] });
  const waveTranslate = waveOffset.interpolate({ inputRange: [0, 1], outputRange: [0, -size] });

  const statusColor =
    status === 'good' ? colors.success : status === 'warning' ? colors.warning : colors.error;

  return (
    <View style={[styles.tankBox, { width: size, height: size }] }>
      {/* IoT device at top-right */}
      <View style={[styles.iotDevice, { right: -38, top: size * 0.5 - 27, transform: [{ rotate: '90deg' }] }] }>
        <MaterialIcons name="router" size={16} color={colors.white} />
        <View style={styles.iotLed} />
      </View>
      <Animated.View style={[styles.sensorDot, { opacity: sensorOpacity, right: 8, top: 8 }]}>
        <MaterialIcons name="sensors" size={16} color={colors.white} />
      </Animated.View>
      <View style={styles.tankBoxInner}>
        {/* Stick with sensors */}
        <View style={[styles.stick, { left: size * 0.28, height: size * 0.72 }]} />
        {[0.2, 0.45, 0.65, 0.8].map((p, i) => (
          <View key={i} style={[styles.stickSensor, { left: size * 0.28 - 4, top: size * p }]} />
        ))}

        {/* Water fill and waves */}
        <View style={styles.waterBase} />
        {/* Wave layers with seamless animation */}
        <View style={{ position: 'absolute', top: 6, left: 0, width: size, height: 42, overflow: 'hidden' }}>
          {/* First wave layer */}
          <Animated.View style={{ 
            position: 'absolute',
            width: size * 3, 
            height: 42, 
            transform: [{ translateX: waveTranslate }] 
          }}>
            <Svg width={size} height={42} style={{ position: 'absolute', left: 0 }}>
              <Path d={buildWavePath(size, 42, 12, size)} fill={'rgba(255,255,255,0.28)'} />
            </Svg>
            <Svg width={size} height={42} style={{ position: 'absolute', left: size }}>
              <Path d={buildWavePath(size, 42, 12, size)} fill={'rgba(255,255,255,0.28)'} />
            </Svg>
            <Svg width={size} height={42} style={{ position: 'absolute', left: size * 2 }}>
              <Path d={buildWavePath(size, 42, 12, size)} fill={'rgba(255,255,255,0.28)'} />
            </Svg>
          </Animated.View>
          {/* Second wave layer with offset */}
          <Animated.View style={{ 
            position: 'absolute',
            width: size * 3, 
            height: 42, 
            transform: [{ translateX: waveOffset.interpolate({ 
              inputRange: [0, 1], 
              outputRange: [size * 0.3, -size * 0.7] 
            }) }]
          }}>
            <Svg width={size} height={42} style={{ position: 'absolute', left: 0 }}>
              <Path d={buildWavePath(size, 42, 8, size * 0.8)} fill={'rgba(8,145,178,0.2)'} />
            </Svg>
            <Svg width={size} height={42} style={{ position: 'absolute', left: size }}>
              <Path d={buildWavePath(size, 42, 8, size * 0.8)} fill={'rgba(8,145,178,0.2)'} />
            </Svg>
            <Svg width={size} height={42} style={{ position: 'absolute', left: size * 2 }}>
              <Path d={buildWavePath(size, 42, 8, size * 0.8)} fill={'rgba(8,145,178,0.2)'} />
            </Svg>
          </Animated.View>
        </View>

        {/* Bubbles */}
        {bubbles.map((b, i) => (
          <Animated.View key={i} style={[styles.bubble, { left: `${b.leftPct}%`, width: b.size, height: b.size, borderRadius: b.size/2, transform: [{ translateY: b.y }] }]} />
        ))}

        {/* Fishes */}
        {fishes.map((f, i) => (
          <Animated.View key={i} style={[styles.fishIcon, { transform: [{ translateX: f.x }, { translateY: f.y }, { rotate: f.r.interpolate({ inputRange: [-1, 1], outputRange: ['-10deg', '10deg'] }) }] }]}>
            <FontAwesome5 name="fish" color={colors.white} size={i % 2 === 0 ? 18 : 22} />
          </Animated.View>
        ))}

        {/* Status pill */}
        <View style={[styles.alertPill, { backgroundColor: statusColor + '40' }] }>
          <MaterialIcons
            name={status === 'good' ? 'check-circle' : status === 'warning' ? 'error-outline' : 'warning'}
            size={11}
            color={statusColor}
          />
          <Text style={[styles.alertText, { color: statusColor }]}>
            {status.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const TankLoadingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 100));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      (async () => {
        try {
          const auth = (await import('@react-native-firebase/auth')).default;
          const user = auth().currentUser;
          navigation.reset({ index: 0, routes: [{ name: user ? 'MainTabs' : 'Auth' }] });
        } catch {
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        }
      })();
    }
  }, [progress, navigation]);

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.container}>
        <View style={styles.centerTankWrap}>
          <Tank delay={0} />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  centerTankWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
  },
  progressText: {
    marginTop: spacing.sm,
    color: 'rgba(255,255,255,0.95)',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  tankBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  ringPulse: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 16,
    opacity: 0, // disabled outer ring to emphasize open-top
  },
  tankBoxInner: {
    width: '96%',
    height: '96%',
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderTopWidth: 0, // open top
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  waterBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 20,
    backgroundColor: 'rgba(8,145,178,0.35)',
  },
  waveLayer: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  waveLayer2: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  waveScallops: {
    position: 'absolute',
    height: 26,
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  scallop: {
    backgroundColor: '#fff',
  },
  fishIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
  },
  stick: {
    position: 'absolute',
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    top: -6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  stickSensor: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
  alertPill: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  alertText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sensorDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    padding: 4,
  },
  bubble: {
    position: 'absolute',
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
    opacity: 0.9,
  },
  iotDevice: {
    position: 'absolute',
    width: 54,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  iotLed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  wire: {
    position: 'absolute',
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 1,
  },
  wireInside: {
    position: 'absolute',
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 1,
  },
});

export default TankLoadingScreen;
