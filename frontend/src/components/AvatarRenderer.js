import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, Rect, Path, G } from 'react-native-svg';

/**
 * AvatarRenderer — Renders a customizable avatar using SVG
 * Props: avatarData (object with skin, hair, hairStyle, eyes, outfit, accessory, bg, gender)
 *        size (number, default 120)
 */
export default function AvatarRenderer({ avatarData, size = 120 }) {
  const {
    skin = '#F5D0A9',
    hair = '#1A1A2E',
    hairStyle = 'neat',
    eyes = '#4A90D9',
    outfit = '#6C5CE7',
    accessory = 'none',
    bg = ['#6C5CE7', '#A29BFE'],
    gender = 'male',
  } = avatarData || {};

  const scale = size / 120;

  const renderHair = () => {
    const hairProps = { fill: hair };
    switch (hairStyle) {
      case 'spiky':
        return (
          <G>
            <Path d="M35 45 L45 15 L55 40 L60 10 L70 38 L75 18 L85 45" {...hairProps} />
            <Ellipse cx="60" cy="45" rx="28" ry="10" {...hairProps} />
          </G>
        );
      case 'neat':
        return (
          <G>
            <Path d="M32 52 Q32 28 60 25 Q88 28 88 52 L88 48 Q88 25 60 22 Q32 25 32 48 Z" {...hairProps} />
          </G>
        );
      case 'buzzcut':
        return <Path d="M35 50 Q35 30 60 27 Q85 30 85 50" {...hairProps} opacity={0.8} />;
      case 'curly':
        return (
          <G>
            <Circle cx="40" cy="35" r="8" {...hairProps} />
            <Circle cx="55" cy="28" r="9" {...hairProps} />
            <Circle cx="70" cy="32" r="8" {...hairProps} />
            <Circle cx="80" cy="40" r="7" {...hairProps} />
            <Circle cx="35" cy="43" r="7" {...hairProps} />
          </G>
        );
      case 'mohawk':
        return (
          <G>
            <Rect x="53" y="12" width="14" height="35" rx="7" {...hairProps} />
            <Ellipse cx="60" cy="45" rx="25" ry="6" {...hairProps} opacity={0.5} />
          </G>
        );
      case 'messy':
        return (
          <G>
            <Path d="M30 48 Q35 20 60 18 Q85 20 90 48" {...hairProps} />
            <Circle cx="35" cy="38" r="6" {...hairProps} />
            <Circle cx="85" cy="38" r="5" {...hairProps} />
          </G>
        );
      case 'long_wavy':
        return (
          <G>
            <Path d="M28 50 Q28 25 60 22 Q92 25 92 50" {...hairProps} />
            <Path d="M28 50 Q25 70 30 90 L38 88 Q35 70 35 55 Z" {...hairProps} />
            <Path d="M92 50 Q95 70 90 90 L82 88 Q85 70 85 55 Z" {...hairProps} />
          </G>
        );
      case 'bob':
        return (
          <G>
            <Path d="M30 48 Q30 22 60 20 Q90 22 90 48" {...hairProps} />
            <Path d="M30 48 L28 65 Q30 68 40 65 L38 50 Z" {...hairProps} />
            <Path d="M90 48 L92 65 Q90 68 80 65 L82 50 Z" {...hairProps} />
          </G>
        );
      case 'braided':
        return (
          <G>
            <Path d="M30 48 Q30 25 60 22 Q90 25 90 48" {...hairProps} />
            <Path d="M38 50 L35 90 L42 90 L44 55 Z" {...hairProps} />
            <Path d="M82 50 L85 90 L78 90 L76 55 Z" {...hairProps} />
          </G>
        );
      case 'updo':
        return (
          <G>
            <Path d="M32 48 Q32 22 60 18 Q88 22 88 48" {...hairProps} />
            <Ellipse cx="60" cy="20" rx="18" ry="12" {...hairProps} />
          </G>
        );
      case 'flowing':
        return (
          <G>
            <Path d="M25 48 Q28 18 60 15 Q92 18 95 48" {...hairProps} />
            <Path d="M25 48 Q20 75 28 100 L36 98 Q30 75 32 52 Z" {...hairProps} />
            <Path d="M95 48 Q100 75 92 100 L84 98 Q90 75 88 52 Z" {...hairProps} />
          </G>
        );
      case 'ponytail':
        return (
          <G>
            <Path d="M32 48 Q32 25 60 22 Q88 25 88 48" {...hairProps} />
            <Path d="M75 40 Q90 45 85 75 L80 73 Q83 48 72 44 Z" {...hairProps} />
          </G>
        );
      default:
        return <Path d="M32 52 Q32 28 60 25 Q88 28 88 52" {...hairProps} />;
    }
  };

  const renderAccessory = () => {
    switch (accessory) {
      case 'glasses':
        return (
          <G>
            <Circle cx="48" cy="58" r="8" fill="none" stroke="#333" strokeWidth="1.5" />
            <Circle cx="72" cy="58" r="8" fill="none" stroke="#333" strokeWidth="1.5" />
            <Path d="M56 58 L64 58" stroke="#333" strokeWidth="1.5" fill="none" />
            <Path d="M40 58 L32 55" stroke="#333" strokeWidth="1.5" fill="none" />
            <Path d="M80 58 L88 55" stroke="#333" strokeWidth="1.5" fill="none" />
          </G>
        );
      case 'sunglasses':
        return (
          <G>
            <Rect x="39" y="52" width="18" height="12" rx="3" fill="#1A1A2E" opacity={0.85} />
            <Rect x="63" y="52" width="18" height="12" rx="3" fill="#1A1A2E" opacity={0.85} />
            <Path d="M57 58 L63 58" stroke="#333" strokeWidth="2" fill="none" />
          </G>
        );
      case 'crown':
        return (
          <G>
            <Path d="M38 30 L42 18 L50 26 L60 14 L70 26 L78 18 L82 30 Z" fill="#FFD93D" />
            <Circle cx="42" cy="18" r="2" fill="#E74C3C" />
            <Circle cx="60" cy="14" r="2.5" fill="#00D2FF" />
            <Circle cx="78" cy="18" r="2" fill="#2ECC71" />
          </G>
        );
      case 'tiara':
        return (
          <G>
            <Path d="M40 32 Q50 20 60 28 Q70 20 80 32" fill="none" stroke="#FFD93D" strokeWidth="2" />
            <Circle cx="60" cy="24" r="3" fill="#A29BFE" />
          </G>
        );
      case 'mask':
        return (
          <Path d="M38 50 Q40 44 60 43 Q80 44 82 50 L82 62 Q80 66 60 67 Q40 66 38 62 Z"
            fill="#2D3436" opacity={0.7} />
        );
      case 'headphones':
        return (
          <G>
            <Path d="M30 55 Q28 35 60 30 Q92 35 90 55" fill="none" stroke="#636E72" strokeWidth="3" />
            <Rect x="26" y="52" width="8" height="16" rx="4" fill="#636E72" />
            <Rect x="86" y="52" width="8" height="16" rx="4" fill="#636E72" />
          </G>
        );
      case 'cap':
        return (
          <G>
            <Path d="M30 45 Q30 28 60 25 Q90 28 90 45 L92 45 Q92 26 60 22 Q28 26 28 45 Z" fill="#E74C3C" />
            <Path d="M28 45 L20 42 Q18 44 26 47 Z" fill="#C0392B" />
          </G>
        );
      case 'flowers':
        return (
          <G>
            <Circle cx="35" cy="38" r="4" fill="#FD79A8" />
            <Circle cx="35" cy="38" r="1.5" fill="#FFD93D" />
            <Circle cx="30" cy="44" r="3" fill="#E84393" />
            <Circle cx="30" cy="44" r="1" fill="#FFD93D" />
          </G>
        );
      case 'scar':
        return <Path d="M72 50 L78 62" stroke="#C0392B" strokeWidth="2" fill="none" />;
      case 'lightning':
        return <Path d="M82 35 L78 45 L84 44 L80 55" stroke="#FFD93D" strokeWidth="2" fill="none" />;
      case 'earpiece':
        return (
          <G>
            <Rect x="86" y="55" width="5" height="10" rx="2" fill="#00D2FF" />
            <Circle cx="88" cy="55" r="2" fill="#0984E3" />
          </G>
        );
      case 'helmet':
        return (
          <G>
            <Path d="M30 50 Q28 25 60 18 Q92 25 90 50" fill="none" stroke="#DFE6E9" strokeWidth="3" />
            <Rect x="55" y="48" width="12" height="8" rx="2" fill="#74B9FF" opacity={0.5} />
          </G>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LinearGradient
        colors={bg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.background, { borderRadius: size * 0.25 }]}
      />
      <Svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
      >
        {/* Neck */}
        <Rect x="52" y="78" width="16" height="12" rx="4" fill={skin} />

        {/* Body / Outfit */}
        <Path
          d="M35 105 Q35 88 60 85 Q85 88 85 105 L85 120 L35 120 Z"
          fill={outfit}
        />
        {/* Collar detail */}
        <Path d="M52 88 L60 95 L68 88" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

        {/* Head */}
        <Ellipse cx="60" cy="58" rx="26" ry="28" fill={skin} />

        {/* Eyes */}
        <Ellipse cx="48" cy="58" rx="4" ry="4.5" fill="white" />
        <Ellipse cx="72" cy="58" rx="4" ry="4.5" fill="white" />
        <Circle cx="49" cy="58" r="2.5" fill={eyes} />
        <Circle cx="73" cy="58" r="2.5" fill={eyes} />
        <Circle cx="50" cy="57" r="1" fill="white" />
        <Circle cx="74" cy="57" r="1" fill="white" />

        {/* Eyebrows */}
        <Path d="M42 50 Q48 47 54 50" fill="none" stroke={hair} strokeWidth="2" strokeLinecap="round" />
        <Path d="M66 50 Q72 47 78 50" fill="none" stroke={hair} strokeWidth="2" strokeLinecap="round" />

        {/* Nose */}
        <Path d="M58 62 Q60 66 62 62" fill="none" stroke={`${skin}99`} strokeWidth="1.5" />

        {/* Mouth */}
        <Path d="M52 72 Q60 78 68 72" fill="none" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" />

        {/* Blush */}
        <Ellipse cx="40" cy="68" rx="5" ry="3" fill="#FD79A8" opacity={0.2} />
        <Ellipse cx="80" cy="68" rx="5" ry="3" fill="#FD79A8" opacity={0.2} />

        {/* Hair (on top of head) */}
        {renderHair()}

        {/* Accessory (on top of everything) */}
        {renderAccessory()}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
});
