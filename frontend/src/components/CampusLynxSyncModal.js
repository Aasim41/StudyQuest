import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, BORDER_RADIUS, SPACING } from '../theme';
import { PulseIndicator } from './ui';

const { width, height } = Dimensions.get('window');

// Injected JS that continuously observes the DOM for the CampusLynx attendance table
const INJECTED_SCRAPER = `
(function() {
  function scrapeAttendance() {
    try {
      // Find table with attendance headers
      var tables = document.querySelectorAll('table');
      for (var i = 0; i < tables.length; i++) {
        var table = tables[i];
        var text = table.innerText || '';
        if (text.includes('Subject Code') && (text.includes('Overall LTP') || text.includes('Overall') || text.includes('Current L'))) {
          var rows = table.querySelectorAll('tbody tr');
          if (rows.length === 0) {
            rows = table.querySelectorAll('tr');
          }
          var records = [];
          for (var r = 0; r < rows.length; r++) {
            var cells = rows[r].querySelectorAll('td');
            if (cells.length >= 6) {
              var subj = cells[1].innerText.trim();
              var lStr = cells[2].innerText.trim();
              var tStr = cells[3].innerText.trim();
              var pStr = cells[4].innerText.trim();
              var ltpStr = cells[5].innerText.trim();

              if (subj && subj !== 'Subject Code') {
                records.push({
                  rawSubject: subj,
                  currentL: lStr ? parseFloat(lStr) : null,
                  currentT: tStr ? parseFloat(tStr) : null,
                  currentP: pStr ? parseFloat(pStr) : null,
                  overallLTP: ltpStr ? parseFloat(ltpStr) : null,
                });
              }
            }
          }
          if (records.length > 0) {
            var studentNameElem = document.querySelector('span[id*="Name"], .student-name, b, strong');
            var studentName = studentNameElem ? studentNameElem.innerText.trim() : '';
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'CAMPUSLYNX_ATTENDANCE_SUCCESS',
              studentName: studentName,
              records: records
            }));
            return true;
          }
        }
      }
    } catch (e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'LOG',
        message: e.message
      }));
    }
    return false;
  }

  // Poll for attendance table every 1.2 seconds once user is logged in
  setInterval(scrapeAttendance, 1200);
})();
true;
`;

export default function CampusLynxSyncModal({ visible, onClose, onSyncComplete, userUid }) {
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success'
  const [scrapedCount, setScrapedCount] = useState(0);
  const [savedUser, setSavedUser] = useState('');
  const [savedPass, setSavedPass] = useState('');
  const [showCredForm, setShowCredForm] = useState(false);
  const webViewRef = useRef(null);

  // Load saved autofill credentials
  React.useEffect(() => {
    if (visible && userUid) {
      AsyncStorage.getItem(`@campuslynx_creds_${userUid}`).then(val => {
        if (val) {
          try {
            const parsed = JSON.parse(val);
            setSavedUser(parsed.username || '');
            setSavedPass(parsed.password || '');
          } catch (e) {}
        }
      });
      setSyncStatus('idle');
      setLoading(true);
    }
  }, [visible, userUid]);

  const saveCredentials = async () => {
    if (userUid) {
      await AsyncStorage.setItem(
        `@campuslynx_creds_${userUid}`,
        JSON.stringify({ username: savedUser, password: savedPass })
      );
      Alert.alert('Saved', 'Your CampusLynx credentials are saved securely on this device.');
      setShowCredForm(false);
    }
  };

  const autofillCredentials = () => {
    if (!savedUser || !savedPass) {
      setShowCredForm(true);
      return;
    }
    const js = `
      (function() {
        var inputs = document.querySelectorAll('input');
        for (var i = 0; i < inputs.length; i++) {
          var inp = inputs[i];
          var name = (inp.name || inp.id || '').toLowerCase();
          var type = (inp.type || '').toLowerCase();
          if (type === 'text' && (name.includes('user') || name.includes('enroll') || name.includes('id') || i === 0)) {
            inp.value = '${savedUser}';
            inp.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (type === 'password') {
            inp.value = '${savedPass}';
            inp.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(js);
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'CAMPUSLYNX_ATTENDANCE_SUCCESS' && data.records?.length > 0) {
        setSyncStatus('success');
        setScrapedCount(data.records.length);
        if (onSyncComplete) {
          onSyncComplete(data.records);
        }
      }
    } catch (e) {
      // Non-json message or log
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.lynxBadge}>
                <PulseIndicator size={6} color="#00D2FF" />
                <Text style={[styles.lynxBadgeText, { marginLeft: 5 }]}>JUET CampusLynx Live Sync</Text>
              </View>
              <Text style={styles.headerTitle}>Student Portal Auto-Sync</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Quick Helper Bar */}
          <View style={styles.helperBar}>
            <Text style={styles.helperText} numberOfLines={2}>
              1. Log in with your captcha. 2. Tap{' '}
              <Text style={{ color: '#00D2FF', fontWeight: '800' }}>Teaching Load → My Class Attendance</Text>. We auto-extract everything!
            </Text>

            <View style={styles.helperActionRow}>
              {savedUser ? (
                <TouchableOpacity style={styles.autofillBtn} onPress={autofillCredentials}>
                  <MaterialCommunityIcons name="lightning-bolt" size={14} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.autofillBtnText}>Autofill ({savedUser})</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity style={styles.credToggleBtn} onPress={() => setShowCredForm(!showCredForm)}>
                <MaterialCommunityIcons name="key-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                <Text style={styles.credToggleText}>{showCredForm ? 'Hide' : 'Save ID'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Credential Save Drawer */}
          {showCredForm && (
            <View style={styles.credFormBox}>
              <TextInput
                placeholder="Enrollment No (e.g., 231B...)"
                placeholderTextColor={COLORS.textMuted}
                value={savedUser}
                onChangeText={setSavedUser}
                style={styles.credInput}
                autoCapitalize="characters"
              />
              <TextInput
                placeholder="Portal Password"
                placeholderTextColor={COLORS.textMuted}
                value={savedPass}
                onChangeText={setSavedPass}
                secureTextEntry
                style={styles.credInput}
              />
              <TouchableOpacity style={styles.saveCredBtn} onPress={saveCredentials}>
                <Text style={styles.saveCredBtnText}>Save Credential Locally</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Success Banner if scraped */}
          {syncStatus === 'success' && (
            <View style={styles.successBanner}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#2ECC71" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.successTitle}>Successfully Synced {scrapedCount} Courses!</Text>
                <Text style={styles.successSub}>Your L(%), T(%), and Overall LTP(%) are now 100% up-to-date.</Text>
              </View>
              <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Embedded Secure WebView */}
          <View style={styles.webViewContainer}>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#00D2FF" />
                <Text style={styles.loadingText}>Connecting to studentportal.juet.ac.in...</Text>
              </View>
            )}

            <WebView
              ref={webViewRef}
              source={{ uri: 'https://studentportal.juet.ac.in' }}
              injectedJavaScript={INJECTED_SCRAPER}
              onMessage={handleMessage}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
              style={{ flex: 1, backgroundColor: '#07070F' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0C0C18',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.9,
    paddingTop: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs,
  },
  headerLeft: {
    flex: 1,
  },
  lynxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    marginBottom: 4,
  },
  lynxBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00D2FF',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFF',
  },
  closeBtn: {
    padding: 6,
  },

  helperBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginHorizontal: SPACING.lg,
    marginVertical: 6,
    padding: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 8,
  },
  helperActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  autofillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C5CE7',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.sm,
  },
  autofillBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  credToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: BORDER_RADIUS.sm,
  },
  credToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  credFormBox: {
    backgroundColor: '#121226',
    marginHorizontal: SPACING.lg,
    marginBottom: 8,
    padding: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
    gap: 6,
  },
  credInput: {
    backgroundColor: '#080814',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#FFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveCredBtn: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#00D2FF',
  },
  saveCredBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00D2FF',
  },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
    marginHorizontal: SPACING.lg,
    marginBottom: 8,
    padding: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.4)',
  },
  successTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2ECC71',
  },
  successSub: {
    fontSize: 10,
    color: '#FFF',
    opacity: 0.8,
  },
  doneBtn: {
    backgroundColor: '#2ECC71',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.sm,
  },
  doneBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },

  webViewContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#07070F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0C0C18',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 10,
    fontWeight: '600',
  },
});
