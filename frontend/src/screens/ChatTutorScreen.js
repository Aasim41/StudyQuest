import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../theme';
import { useUser } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';

export default function ChatTutorScreen({ navigation }) {
  const { userStats, studyPlan, BADGE_DEFINITIONS } = useUser();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI Study Buddy. I know you're currently Level " + userStats.level + " and studying " + (studyPlan[0]?.subject || 'hard') + ". How can I help you today?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = { role: 'user', content: inputText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Context preparation
    const context = `
    User Level: ${userStats.level}
    Current Streak: ${userStats.streak}
    Unlocked Badges: ${userStats.unlockedBadges?.map(b => BADGE_DEFINITIONS[b]?.name).join(', ') || 'None'}
    Current Study Plan: ${studyPlan.map(s => `${s.subject} (${s.topic})`).join(', ')}
    `;

    try {
      // Fetch the API key from environment variables for security
      const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: 'system', content: `You are a helpful AI study tutor. Use this context about the user to personalize your answers:\n${context}` },
            ...messages,
            userMsg
          ],
          temperature: 0.7,
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error answering that.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Study Buddy 🤖</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, idx) => (
          <Animated.View 
            key={idx} 
            entering={FadeInUp.springify()} 
            style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.botBubble]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
          </Animated.View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.accent} />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor={COLORS.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={isLoading}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder
  },
  backBtn: { padding: SPACING.sm },
  backBtnText: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.subtitle, fontWeight: '800' },
  chatContainer: { padding: SPACING.md, paddingBottom: SPACING.xl },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderBottomLeftRadius: 4
  },
  messageText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, lineHeight: 22 },
  loadingContainer: { alignSelf: 'flex-start', padding: SPACING.md },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.glass,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
    paddingBottom: 12,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    marginRight: SPACING.md
  },
  sendBtn: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.accent,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  sendIcon: { color: '#FFF', fontSize: 20 }
});
