import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { collection, query, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../theme';
import { FloatingParticle, GlassCard } from '../components/ui';

const { width, height } = Dimensions.get('window');
const PAGE_SIZE = 15;

export default function LeaderboardScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(PAGE_SIZE));
      const snapshot = await getDocs(q);
      
      const fetchedUsers = [];
      snapshot.forEach((docSnap) => {
        fetchedUsers.push({ id: docSnap.id, ...docSnap.data() });
      });

      setUsers(fetchedUsers);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);

      // Find my rank (if in top results, otherwise we would need a separate cloud function for exact rank)
      const me = fetchedUsers.findIndex(u => u.id === auth.currentUser?.uid);
      if (me !== -1) {
        setMyRank(me + 1);
      }
    } catch (err) {
      console.warn('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore || !lastVisible) return;
    
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'users'), 
        orderBy('xp', 'desc'), 
        startAfter(lastVisible),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(q);
      
      const newUsers = [];
      snapshot.forEach((docSnap) => {
        newUsers.push({ id: docSnap.id, ...docSnap.data() });
      });

      setUsers(prev => [...prev, ...newUsers]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      
      // Update my rank if found in new batch
      if (!myRank) {
        const me = newUsers.findIndex(u => u.id === auth.currentUser?.uid);
        if (me !== -1) {
          setMyRank(users.length + me + 1);
        }
      }
    } catch (err) {
      console.warn('Error loading more:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderItem = useCallback(({ item, index }) => {
    const isMe = item.id === auth.currentUser?.uid;
    const rank = index + 1;
    let rankEmoji = '';
    let cardColor = COLORS.glass;
    let borderColor = COLORS.glassBorder;

    if (rank === 1) { rankEmoji = '🥇'; borderColor = '#FFD700'; cardColor = 'rgba(255, 215, 0, 0.1)'; }
    else if (rank === 2) { rankEmoji = '🥈'; borderColor = '#C0C0C0'; cardColor = 'rgba(192, 192, 192, 0.1)'; }
    else if (rank === 3) { rankEmoji = '🥉'; borderColor = '#CD7F32'; cardColor = 'rgba(205, 127, 50, 0.1)'; }
    else { rankEmoji = `#${rank}`; }

    const initialLetter = item.displayName ? item.displayName.charAt(0).toUpperCase() : 'S';

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()} layout={Layout.springify()}>
        <View style={[
          styles.userCard, 
          isMe && styles.myCard,
          { backgroundColor: cardColor, borderColor: borderColor }
        ]}>
          <View style={styles.rankContainer}>
            <Text style={styles.rankText}>{rankEmoji}</Text>
          </View>
          <View style={[styles.avatarPlaceholder, isMe && { borderColor: COLORS.accent, borderWidth: 2 }]}>
            {item.avatar ? (
               <Text style={styles.avatarEmoji}>{item.avatar}</Text>
            ) : (
               <Text style={[styles.avatarLetter, isMe && { color: COLORS.accent }]}>{initialLetter}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, isMe && { color: COLORS.accent }]}>
              {item.displayName || 'Anonymous'} {isMe && '(You)'}
            </Text>
            <Text style={styles.userLevel}>Level {item.level || 1} • {item.streak || 0}🔥</Text>
          </View>
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>{item.xp || 0}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </View>
      </Animated.View>
    );
  }, [myRank]);

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 40 }} />;
    return (
      <View style={{ padding: SPACING.lg, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={COLORS.gradientDark} style={StyleSheet.absoluteFill} />

      <FloatingParticle size={150} color={COLORS.primary} x={width * 0.7} y={-40} delay={100} />
      <FloatingParticle size={100} color={COLORS.accent} x={-20} y={height * 0.4} delay={500} />

      <Animated.View style={styles.header} entering={FadeInDown.delay(100).springify()}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard 🏆</Text>
        <Text style={styles.subtitle}>Compete with students nationwide</Text>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xl, paddingTop: height * 0.08, marginBottom: SPACING.md },
  backButton: { marginBottom: SPACING.md },
  backText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.bodyLarge, fontWeight: '600' },
  title: { fontSize: FONT_SIZES.hero, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONT_SIZES.body, color: COLORS.textSecondary },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  userCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: SPACING.md, 
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.card 
  },
  myCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
  },
  rankContainer: { width: 40, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 20, fontWeight: '800', color: COLORS.textSecondary },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  avatarEmoji: { fontSize: 24 },
  avatarLetter: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  userInfo: { flex: 1 },
  userName: { fontSize: FONT_SIZES.body, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  userLevel: { fontSize: FONT_SIZES.caption, color: COLORS.textMuted, fontWeight: '600' },
  xpContainer: { alignItems: 'flex-end', justifyContent: 'center' },
  xpText: { fontSize: FONT_SIZES.subtitle, fontWeight: '900', color: COLORS.accent },
  xpLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, marginTop: -2 },
});
