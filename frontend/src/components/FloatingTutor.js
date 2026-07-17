import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeInUp, withSpring, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../theme';

const { width, height } = Dimensions.get('window');

export default function FloatingTutor() {
  const navigation = useNavigation();
  const bounce = useSharedValue(0);

  React.useEffect(() => {
    bounce.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: bounce.value * -10 }]
    };
  });

  return (
    <Animated.View entering={FadeInUp.delay(500).springify()} style={[styles.container, animatedStyle]}>
      <TouchableOpacity 
        style={styles.tutorBtn} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ChatTutor')}
      >
        <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.gradient}>
          <Text style={styles.botIcon}>🤖</Text>
        </LinearGradient>
      </TouchableOpacity>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Ask AI</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Above bottom tabs
    right: 20,
    zIndex: 1000,
    alignItems: 'center'
  },
  tutorBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    ...SHADOWS.glow,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  botIcon: {
    fontSize: 32
  },
  badge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#FF4C4C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFF'
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800'
  }
});
