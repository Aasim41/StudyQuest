// JUET Guna B.Tech III Sem CSE Master Timetable & Batch Filtering Engine (July - Dec 2026)

export const BATCH_GROUPS = {
  BX: ['B1', 'B2', 'B3'],
  BY: ['B4', 'B5', 'B6'],
  BZ: ['B7', 'B8', 'B9'],
  BX1: ['B21', 'B22', 'B23', 'B31'],
};

export const ALL_BATCHES = [
  'B1', 'B2', 'B3',
  'B4', 'B5', 'B6',
  'B7', 'B8', 'B9',
  'B21', 'B22', 'B23', 'B31'
];

export const SUBJECT_CATALOG = {
  // Theory Subjects (L + T combined)
  TDM: {
    code: 'HS103',
    name: 'Techniques for Decision Making (TDM)',
    shortName: 'TDM',
    category: 'Theory',
    isLab: false,
    color: '#FF6B6B',
    faculty: 'Dr. Pankaj Gupta (BX), Dr. Rohit Mishra (BY), Dr. Amiya Kumar Sahu (BZ), Dr. Manoj Dubey (BX1)',
  },
  DS: {
    code: 'CS103',
    name: 'Data Structures (DS)',
    shortName: 'DS',
    category: 'Theory',
    isLab: false,
    color: '#4D96FF',
    faculty: 'Dr. K B Meena* (BX, BX1), Mr. Navaljeet Singh (BY, BZ)',
  },
  DBMS: {
    code: 'CS104',
    name: 'Database Systems (DBMS)',
    shortName: 'DBMS',
    category: 'Theory',
    isLab: false,
    color: '#6BCB77',
    faculty: 'Dr. Amit Kumar Srivastava* (BX, BY), Dr. Jitendra Parmar (BZ, BX1)',
  },
  EVS: {
    code: 'GE001',
    name: 'Environmental Science (EVS)',
    shortName: 'EVS',
    category: 'Theory',
    isLab: false,
    color: '#10B981',
    faculty: 'Dr. Sumit Gandhi (B1-B2), Dr. NK Samaiya (B3-B4), Dr. Abhishek Verma (B5-B6), Dr. SN Yadav (B7-B8), Mr. RK Goliya (B9, B31), Dr. Jitendra Sahu (B21-B23)',
  },
  TOC: {
    code: 'CS110',
    name: 'Theory of Computation (ToC)',
    shortName: 'ToC',
    category: 'Theory',
    isLab: false,
    color: '#9B51E0',
    faculty: 'Dr. Animesh Kumar Dubey* (BX, BY), Dr. Malti Nagle (BZ)',
  },
  CMD: {
    code: 'HS006',
    name: 'Career Management & Development (CMD)',
    shortName: 'CMD',
    category: 'Theory',
    isLab: false,
    color: '#F59E0B',
    faculty: 'Dr. Tamanna Agrawal (BX, BY), Mr. Neeraj Jain (BZ, BX1)',
  },
  SM: {
    code: 'CS115',
    name: 'Statistical Methods (SM)',
    shortName: 'SM',
    category: 'Theory',
    isLab: false,
    color: '#00D2FF',
    faculty: 'Dr. Shekhar Singh',
  },
  FOAI: {
    code: 'CS116',
    name: 'Foundation of AI (FOAI)',
    shortName: 'FOAI',
    category: 'Theory',
    isLab: false,
    color: '#8B5CF6',
    faculty: 'Dr. Rahul Pachauri',
  },

  // Practical / Lab Subjects (2 hours duration, tracked independently)
  DSLAB: {
    code: 'CS203',
    name: 'Data Structures Lab (DS Lab)',
    shortName: 'DS Lab',
    category: 'Lab',
    isLab: true,
    durationHours: 2,
    color: '#3B82F6',
    faculty: 'Dr. K B Meena, Mr. Navaljeet Singh*',
  },
  DBMSLAB: {
    code: 'CS204',
    name: 'Database Systems Lab (DBMS Lab)',
    shortName: 'DBMS Lab',
    category: 'Lab',
    isLab: true,
    durationHours: 2,
    color: '#059669',
    faculty: 'Dr. Amit Srivastava, Dr. Jitendra Parmar*',
  },
  UNIXLAB: {
    code: 'CS219',
    name: 'Unix Programming Lab (UNIX Lab)',
    shortName: 'UNIX Lab',
    category: 'Lab',
    isLab: true,
    durationHours: 2,
    color: '#EC4899',
    faculty: 'Dr. Ankur Mudgal*',
  },
  APLAB1: {
    code: 'CS206',
    name: 'Advanced Programming Lab-1 (AP Lab-1)',
    shortName: 'AP Lab-1',
    category: 'Lab',
    isLab: true,
    durationHours: 2,
    color: '#8B5CF6',
    faculty: 'Dr. Dinesh Verma, Prof. Mahesh Kumar*',
  },
  SMLAB: {
    code: 'CS221',
    name: 'Statistical Methods Lab (SM Lab)',
    shortName: 'SM Lab',
    category: 'Lab',
    isLab: true,
    durationHours: 2,
    color: '#06B6D4',
    faculty: 'Dr. Shekhar Singh',
  },
  AILAB: {
    code: 'CS222',
    name: 'AI Lab (AI Lab)',
    shortName: 'AI Lab',
    category: 'Lab',
    isLab: true,
    durationHours: 2,
    color: '#A855F7',
    faculty: 'Dr. Rahul Pachauri',
  },
};

export const ROOM_LOCATIONS = {
  CR1: 'Ramanujam Bhawan (Ground Floor)',
  CR2: 'Ramanujam Bhawan (Ground Floor)',
  CR3: 'Ramanujam Bhawan (Ground Floor)',
  CR4: 'Ramanujam Bhawan (Ground Floor)',
  CR5: 'Ramanujam Bhawan (I Floor)',
  CR6: 'Ramanujam Bhawan (II Floor)',
  CR7: 'Ramanujam Bhawan (II Floor)',
  CR8: 'Ramanujam Bhawan (II Floor)',
  CR9: 'Raman Bhawan (Ground Floor)',
  CR10: 'Raman Bhawan (Ground Floor)',
  CR11: 'Raman Bhawan (I Floor)',
  CR12: 'Raman Bhawan (I Floor)',
  CR14: 'Raman Bhawan (I Floor)',
  CR15: 'Raman Bhawan (II Floor)',
  CR16: 'Raman Bhawan (II Floor)',
  CR17: 'Raman Bhawan (II Floor)',
  CR18: 'Raman Bhawan (II Floor)',
  CR19: 'Raman Bhawan (II Floor)',
  CR21: 'Vishveswarya Bhawan (I Floor)',
  CR22: 'Vishveswarya Bhawan (I Floor)',
  CR23: 'Vishveswarya Bhawan (I Floor)',
  CR24: 'Vishveswarya Bhawan (I Floor)',
  CR25: 'Vishveswarya Bhawan (II Floor)',
  CR26: 'Vishveswarya Bhawan (II Floor)',
  CR27: 'Vishveswarya Bhawan (II Floor)',
  CR29: 'Vishveswarya Bhawan (II Floor)',
  LT1: 'Lecture Theatre 1',
  LT2: 'Lecture Theatre 2',
  LT3: 'Lecture Theatre 3',
  CL2: 'Computer Lab 2',
  CL3: 'Computer Lab 3',
  CL4: 'Computer Lab 4',
  CL7: 'Computer Lab 7',
  DLC: 'DLC Hall',
};

// Check if a batch string in the timetable matches the selected user batch
export function isBatchMatch(cellBatch, userBatch) {
  if (!cellBatch || !userBatch) return false;
  if (cellBatch === userBatch) return true;

  // Group check (BX, BY, BZ, BX1)
  if (BATCH_GROUPS[cellBatch] && BATCH_GROUPS[cellBatch].includes(userBatch)) {
    return true;
  }

  // Combined batch string check (e.g. B9B31, B21B22, B21B22B23)
  const matches = cellBatch.match(/B\d+/g) || [];
  return matches.includes(userBatch);
}

// Master Raw College Sessions from BTech3semCSE.pdf
import masterData from './masterTimetable.json';

export const MASTER_COLLEGE_SESSIONS = masterData;

/**
 * Filter the master college timetable for a specific batch.
 * Applies the user's rules:
 * - Lecture (L) and Tutorial (T) are combined under the unified Theory Subject name.
 * - Practical (P) is 2 hours and given a distinct Lab Subject name.
 */
export function filterTimetableForBatch(userBatch = 'B31') {
  const filtered = [];

  MASTER_COLLEGE_SESSIONS.forEach((item, index) => {
    if (isBatchMatch(item.batchTag, userBatch)) {
      const isLab = item.sessionType === 'P';
      const subjMeta = SUBJECT_CATALOG[item.subjectCode] || {
        name: item.subject,
        code: item.courseCode || '',
        isLab,
        category: isLab ? 'Lab' : 'Theory',
        color: '#6C5CE7',
      };

      // Rule: L and T combine under the same subject name, while Lab is a separate subject
      const subjectDisplayName = subjMeta.name;

      filtered.push({
        id: `tt-${userBatch}-${item.day.toLowerCase()}-${item.subjectCode}-${item.sessionType}-${index}`,
        day: item.day, // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
        dayLong: item.dayLong,
        time: item.time,
        startTime: item.startTime,
        endTime: item.endTime,
        subject: subjectDisplayName,
        subjectCode: item.subjectCode,
        courseCode: subjMeta.code,
        category: subjMeta.category,
        type: isLab ? 'Practical' : (item.sessionType === 'T' ? 'Tutorial' : 'Lecture'),
        sessionType: item.sessionType, // 'L', 'T', 'P'
        isLab,
        durationHours: isLab ? 2 : 1,
        room: item.room,
        roomLocation: item.roomLocation || ROOM_LOCATIONS[item.room] || item.room,
        batchTag: item.batchTag,
        faculty: subjMeta.faculty || '',
        color: subjMeta.color || (isLab ? '#00D2FF' : '#6C5CE7'),
      });
    }
  });

  // Sort chronologically by day and startTime
  const dayOrder = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return filtered.sort((a, b) => {
    if (dayOrder[a.day] !== dayOrder[b.day]) {
      return dayOrder[a.day] - dayOrder[b.day];
    }
    return (a.startTime || '').localeCompare(b.startTime || '');
  });
}

/**
 * Get distinct subject names and metadata for a batch, categorized into Theory and Labs
 */
export function getDistinctSubjectsForBatch(userBatch = 'B31') {
  const batchSchedule = filterTimetableForBatch(userBatch);
  const subjectsMap = {};

  batchSchedule.forEach(item => {
    if (!subjectsMap[item.subject]) {
      subjectsMap[item.subject] = {
        name: item.subject,
        subjectCode: item.subjectCode,
        courseCode: item.courseCode,
        category: item.category,
        isLab: item.isLab,
        durationHours: item.durationHours,
        color: item.color,
        faculty: item.faculty,
        weeklyLectures: 0,
        weeklyTutorials: 0,
        weeklyLabs: 0,
        weeklyTotalHours: 0,
      };
    }

    if (item.sessionType === 'L') subjectsMap[item.subject].weeklyLectures += 1;
    else if (item.sessionType === 'T') subjectsMap[item.subject].weeklyTutorials += 1;
    else if (item.sessionType === 'P') subjectsMap[item.subject].weeklyLabs += 1;

    subjectsMap[item.subject].weeklyTotalHours += item.durationHours;
  });

  const allSubjects = Object.values(subjectsMap);
  return {
    all: allSubjects,
    theory: allSubjects.filter(s => !s.isLab),
    labs: allSubjects.filter(s => s.isLab),
  };
}
