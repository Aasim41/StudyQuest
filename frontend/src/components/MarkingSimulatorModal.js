import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MarkingSimulatorModal({
  visible,
  onClose,
  topicTitle = 'Exam Question',
  subject = 'Physics',
  targetExam = 'CBSE Class 12 Boards',
  questionData = null,
}) {
  const totalMarks = questionData?.marks || 5;

  // Extract or generate realistic key points
  const steps = useMemo(() => {
    if (questionData?.keyPoints && questionData.keyPoints.length > 0) {
      const stepWeight = Number((totalMarks / questionData.keyPoints.length).toFixed(1));
      return questionData.keyPoints.map((kp, idx) => ({
        id: `step-${idx}`,
        text: kp,
        weight: stepWeight,
      }));
    }
    return [
      { id: 'step-0', text: 'State formal definition and governing equation with units', weight: Number((totalMarks * 0.3).toFixed(1)) },
      { id: 'step-1', text: 'Explicitly state domain boundary conditions & edge-case constraints', weight: Number((totalMarks * 0.4).toFixed(1)) },
      { id: 'step-2', text: 'Show step-by-step substitution without skipping derivation', weight: Number((totalMarks * 0.3).toFixed(1)) },
    ];
  }, [questionData, totalMarks]);

  const [checkedSteps, setCheckedSteps] = useState({});

  useEffect(() => {
    if (visible) {
      // Default initial state: first step checked, others open
      setCheckedSteps({ 'step-0': true });
    }
  }, [visible]);

  const toggleStep = (id) => {
    setCheckedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentScore = useMemo(() => {
    let score = 0;
    steps.forEach((s) => {
      if (checkedSteps[s.id]) {
        score += s.weight;
      }
    });
    return Math.min(totalMarks, Number(score.toFixed(1)));
  }, [checkedSteps, steps, totalMarks]);

  const scorePercentage = Math.round((currentScore / totalMarks) * 100);

  const getVerdict = () => {
    if (scorePercentage >= 90) return { label: 'Full Marks Guaranteed! 🏆', color: '#2ED573' };
    if (scorePercentage >= 65) return { label: 'Good: Minor deductions on edge cases', color: '#FFA502' };
    return { label: 'High Risk: Critical examiner keys missing', color: '#FF4757' };
  };

  const verdict = getVerdict();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalBadge}>EXAMINER RUBRIC SIMULATOR</Text>
              <Text style={styles.title} numberOfLines={1}>{topicTitle}</Text>
              <Text style={styles.subtitle}>{subject} • {targetExam}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Real-Time Score Gauge */}
          <View style={styles.scoreGaugeBox}>
            <View style={styles.scoreRow}>
              <View>
                <Text style={styles.scoreLabel}>ESTIMATED EXAM SCORE</Text>
                <Text style={styles.scoreNumber}>
                  {currentScore} <Text style={styles.scoreTotal}>/ {totalMarks} Marks</Text>
                </Text>
              </View>
              <View style={[styles.verdictBadge, { borderColor: verdict.color }]}>
                <Text style={[styles.verdictText, { color: verdict.color }]}>{scorePercentage}%</Text>
              </View>
            </View>

            {/* Progress track */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${scorePercentage}%`, backgroundColor: verdict.color }]} />
            </View>
            <Text style={[styles.verdictStatus, { color: verdict.color }]}>{verdict.label}</Text>
          </View>

          <Text style={styles.sectionHeading}>
            Tick what you included in your draft answer:
          </Text>

          <ScrollView style={styles.stepsList} showsVerticalScrollIndicator={false}>
            {steps.map((step, idx) => {
              const isChecked = !!checkedSteps[step.id];
              return (
                <TouchableOpacity
                  key={step.id}
                  style={[styles.stepItem, isChecked && styles.stepItemChecked]}
                  onPress={() => toggleStep(step.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={isChecked ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={22}
                    color={isChecked ? '#2ED573' : '#777799'}
                    style={{ marginTop: 2, marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepTitle}>Criterion {idx + 1}</Text>
                      <Text style={styles.stepWeight}>+{step.weight} Marks</Text>
                    </View>
                    <Text style={styles.stepText}>{step.text}</Text>
                    {!isChecked && (
                      <Text style={styles.deductionAlert}>
                        &#9888; -{step.weight} mark penalty if omitted
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Close Simulator</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#121228',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D2FF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    maxWidth: 260,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8EA8',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  scoreGaugeBox: {
    backgroundColor: 'rgba(20, 20, 48, 0.9)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8EA8',
    letterSpacing: 0.5,
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  scoreTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8EA8',
  },
  verdictBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  verdictText: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  verdictStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0A0C0',
    marginBottom: 10,
  },
  stepsList: {
    maxHeight: 250,
    marginBottom: 14,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  stepItemChecked: {
    backgroundColor: 'rgba(46, 213, 115, 0.07)',
    borderColor: 'rgba(46, 213, 115, 0.3)',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8EA8',
  },
  stepWeight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00D2FF',
  },
  stepText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 17,
  },
  deductionAlert: {
    fontSize: 11,
    color: '#FF6B81',
    fontWeight: '600',
    marginTop: 4,
  },
  doneBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
