import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

const FACULTY_LIST = [
  {
    id: 'f1',
    name: 'Dr. K B Meena',
    designation: 'Associate Professor & HOD',
    department: 'Computer Science & Engineering',
    subjects: ['Data Structures (CS103)', 'DS Lab (CS203)'],
    cabin: 'CR12, Raman Bhawan (I Floor)',
    email: 'kb.meena@juet.ac.in',
  },
  {
    id: 'f2',
    name: 'Dr. Amit Kumar Srivastava',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    subjects: ['Database Systems (CS104)', 'DBMS Lab (CS204)'],
    cabin: 'CR15, Raman Bhawan (II Floor)',
    email: 'amit.srivastava@juet.ac.in',
  },
  {
    id: 'f3',
    name: 'Dr. Shekhar Singh',
    designation: 'Associate Professor',
    department: 'Mathematics & Computing',
    subjects: ['Statistical Methods (CS115)', 'SM Lab (CS221)'],
    cabin: 'CR14, Raman Bhawan (I Floor)',
    email: 'shekhar.singh@juet.ac.in',
  },
  {
    id: 'f4',
    name: 'Dr. Dinesh Verma',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    subjects: ['Advanced Programming Lab-1 (CS206)'],
    cabin: 'CL4, Computer Lab Building',
    email: 'dinesh.verma@juet.ac.in',
  },
  {
    id: 'f5',
    name: 'Dr. Ankur Mudgal',
    designation: 'Assistant Professor (SG)',
    department: 'Computer Science & Engineering',
    subjects: ['Unix Programming Lab (CS219)'],
    cabin: 'CL2, Computer Lab Building',
    email: 'ankur.mudgal@juet.ac.in',
  },
  {
    id: 'f6',
    name: 'Dr. Pankaj Gupta',
    designation: 'Associate Professor',
    department: 'Humanities & Social Sciences',
    subjects: ['Techniques for Decision Making (HS103)'],
    cabin: 'CR5, Ramanujam Bhawan (I Floor)',
    email: 'pankaj.gupta@juet.ac.in',
  },
  {
    id: 'f7',
    name: 'Dr. Sumit Gandhi',
    designation: 'Associate Professor',
    department: 'Civil & Environmental Engineering',
    subjects: ['Environmental Science (GE001)'],
    cabin: 'CR9, Raman Bhawan (Ground Floor)',
    email: 'sumit.gandhi@juet.ac.in',
  },
  {
    id: 'f8',
    name: 'Mr. Neeraj Jain',
    designation: 'Assistant Professor',
    department: 'Humanities & Management',
    subjects: ['Career Management & Development (HS007)'],
    cabin: 'CR6, Ramanujam Bhawan (II Floor)',
    email: 'neeraj.jain@juet.ac.in',
  },
  {
    id: 'f9',
    name: 'Dr. Rahul Pachauri',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    subjects: ['Foundation of AI (CS116)', 'AI Lab (CS222)'],
    cabin: 'CR22, Vishveswarya Bhawan (I Floor)',
    email: 'rahul.pachauri@juet.ac.in',
  },
  {
    id: 'f10',
    name: 'Prof. Mahesh Kumar',
    designation: 'Professor',
    department: 'Computer Science & Engineering',
    subjects: ['Advanced Programming Lab-1 (CS206)'],
    cabin: 'CL7, Computer Lab Building',
    email: 'mahesh.kumar@juet.ac.in',
  },
  {
    id: 'f11',
    name: 'Mr. Navaljeet Singh',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    subjects: ['Data Structures Lab (CS203)'],
    cabin: 'CL3, Computer Lab Building',
    email: 'navaljeet.singh@juet.ac.in',
  },
  {
    id: 'f12',
    name: 'Dr. Jitendra Parmar',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    subjects: ['Database Systems Lab (CS204)'],
    cabin: 'CL4, Computer Lab Building',
    email: 'jitendra.parmar@juet.ac.in',
  },
  {
    id: 'f13',
    name: 'Mr. RK Goliya',
    designation: 'Assistant Professor',
    department: 'Civil Engineering',
    subjects: ['Environmental Science (GE001)'],
    cabin: 'CR10, Raman Bhawan (Ground Floor)',
    email: 'rk.goliya@juet.ac.in',
  },
  {
    id: 'f14',
    name: 'Dr. Rohit Mishra',
    designation: 'Assistant Professor',
    department: 'Humanities & Social Sciences',
    subjects: ['Techniques for Decision Making (HS103)'],
    cabin: 'CR5, Ramanujam Bhawan (I Floor)',
    email: 'rohit.mishra@juet.ac.in',
  },
  {
    id: 'f15',
    name: 'Dr. Amiya Kumar Sahu',
    designation: 'Assistant Professor',
    department: 'Humanities & Social Sciences',
    subjects: ['Techniques for Decision Making (HS103)'],
    cabin: 'CR5, Ramanujam Bhawan (I Floor)',
    email: 'amiya.sahu@juet.ac.in',
  },
];

export default function FacultyScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaculty = useMemo(() => {
    if (!searchQuery.trim()) return FACULTY_LIST;
    const q = searchQuery.toLowerCase();
    return FACULTY_LIST.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q) ||
        f.cabin.toLowerCase().includes(q) ||
        f.subjects.some((s) => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B13" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeftRow}>
          <TouchableOpacity
            style={styles.backCircleBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Faculty Directory</Text>
            <Text style={styles.headerSub}>JUET Academic Staff (15)</Text>
          </View>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#8E8D9A" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, subject, or cabin..."
          placeholderTextColor="#686777"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#8E8D9A" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        <View style={styles.cardGroup}>
          {filteredFaculty.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.facultyRow,
                index < filteredFaculty.length - 1 && styles.facultyRowBorder,
              ]}
            >
              <View style={styles.avatarCircle}>
                <MaterialCommunityIcons name="account-outline" size={22} color="#C5BBED" />
              </View>

              <View style={styles.facultyInfo}>
                <Text style={styles.facultyName}>{item.name}</Text>
                <Text style={styles.facultyDesignation}>{item.designation}</Text>
                <Text style={styles.facultyDept}>{item.department}</Text>

                <View style={styles.cabinRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={13} color="#A29BFE" style={{ marginRight: 4 }} />
                  <Text style={styles.cabinText}>{item.cabin}</Text>
                </View>

                <View style={styles.subjectsTagsRow}>
                  {item.subjects.map((sub) => (
                    <View key={sub} style={styles.subTag}>
                      <Text style={styles.subTagText}>{sub}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B13',
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8D9A',
    marginTop: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161622',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFF',
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  cardGroup: {
    backgroundColor: '#161622',
    borderRadius: 20,
    overflow: 'hidden',
  },
  facultyRow: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  facultyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(197, 187, 237, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  facultyInfo: {
    flex: 1,
  },
  facultyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  facultyDesignation: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C5BBED',
  },
  facultyDept: {
    fontSize: 11,
    color: '#8E8D9A',
    marginTop: 1,
  },
  cabinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cabinText: {
    fontSize: 11,
    color: '#A29BFE',
    fontWeight: '600',
  },
  subjectsTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  subTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B5B4C2',
  },
});
