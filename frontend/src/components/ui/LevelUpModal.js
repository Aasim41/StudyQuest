import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { FadeIn, SlideInDown, ZoomIn, SlideOutDown, FadeOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../theme';

const { width, height } = Dimensions.get('window');

export default function LevelUpModal({ visible, newLevel, onClose }) {
  const confettiRef = useRef(null);

  useEffect(() => {
    if (visible && confettiRef.current) {
      confettiRef.current.play();
      // Auto close after 5 seconds
      const t = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={styles.overlay}>
        <LinearGradient colors={['rgba(0,0,0,0.8)', 'rgba(21,21,30,0.9)']} style={StyleSheet.absoluteFill} />
        
        <LottieView
          ref={confettiRef}
          source={require('../../../assets/confetti.json')} // Ensure this exists, or fallback
          style={styles.confetti}
          autoPlay={false}
          loop={false}
          resizeMode="cover"
        />

        <Animated.View entering={ZoomIn.springify().damping(12).delay(200)} exiting={SlideOutDown} style={styles.card}>
          <LinearGradient colors={COLORS.gradientGlass} style={styles.cardGradient}>
            <Animated.Text entering={SlideInDown.delay(300)} style={styles.title}>LEVEL UP!</Animated.Text>
            
            <View style={styles.levelCircle}>
              <LinearGradient colors={[COLORS.accent, COLORS.primary]} style={styles.circleGradient}>
                <Text style={styles.levelNumber}>{newLevel}</Text>
              </LinearGradient>
            </View>

            <Animated.Text entering={SlideInDown.delay(500)} style={styles.subtitle}>
              You're making incredible progress. Keep it up!
            </Animated.Text>
            
            <Animated.View entering={FadeIn.delay(800)}>
              <Text style={styles.tapToContinue} onPress={onClose}>Tap anywhere to continue</Text>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  confetti: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 1,
  },
  card: {
    width: width * 0.85,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.accent,
    zIndex: 10,
    elevation: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  cardGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    marginBottom: SPACING.xl,
    textShadowColor: COLORS.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  levelCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: SPACING.xl,
  },
  circleGradient: {
    flex: 1,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFF',
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  tapToContinue: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  }
});
