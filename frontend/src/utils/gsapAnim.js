/**
 * StudyQuest GSAP Animation Bridge for React Native & Web
 * Drives React Native Animated.Value cleanly using GSAP easing curves
 * without DOM dependencies, preventing crashes on Hermes / iOS / Android.
 */

import { gsap } from 'gsap';

/**
 * Smoothly transition a tab content Animated.Value (0 -> 1) using GSAP power3.out
 */
export function gsapTabTransition(animatedValue, onStart) {
  if (!animatedValue) return () => {};
  const proxy = { v: 0.92 };
  animatedValue.setValue(0.92);
  if (onStart) onStart();

  const tween = gsap.to(proxy, {
    v: 1,
    duration: 0.28,
    ease: 'power3.out',
    onUpdate: () => {
      animatedValue.setValue(proxy.v);
    },
  });

  return () => {
    tween.kill();
  };
}

/**
 * Smooth entrance slide/fade using GSAP back.out / power2.out
 */
export function gsapEntrance(animatedValue, { from = 0, to = 1, duration = 0.42, delay = 0, ease = 'power2.out' } = {}) {
  if (!animatedValue) return () => {};
  const proxy = { v: from };
  animatedValue.setValue(from);

  const tween = gsap.to(proxy, {
    v: to,
    duration,
    delay,
    ease,
    onUpdate: () => {
      animatedValue.setValue(proxy.v);
    },
  });

  return () => {
    tween.kill();
  };
}

/**
 * Staggered card deck pop-in using GSAP stagger
 */
export function gsapStaggerCards(animatedValues = [], duration = 0.35, staggerDelay = 0.06) {
  if (!animatedValues.length) return () => {};
  const proxies = animatedValues.map((av) => {
    av.setValue(0);
    return { v: 0, av };
  });

  const tween = gsap.to(proxies, {
    v: 1,
    duration,
    stagger: staggerDelay,
    ease: 'power2.out',
    onUpdate: function () {
      proxies.forEach((p) => p.av.setValue(p.v));
    },
  });

  return () => {
    tween.kill();
  };
}
