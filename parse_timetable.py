import pdfplumber
import re
import json

THEORY_TIMES = {
    1: '9:00 - 9:55 AM',
    2: '10:00 - 10:55 AM',
    3: '10:00 - 10:55 AM',
    4: '11:00 - 11:55 AM',
    5: '12:00 - 12:55 PM',
    7: '2:00 - 2:55 PM',
    8: '3:00 - 3:55 PM',
    9: '4:00 - 4:55 PM',
}

PRACTICAL_TIMES = {
    1: '9:00 - 10:55 AM',
    4: '11:00 - 12:55 PM',
    7: '2:00 - 3:55 PM',
}

DAYS = {
    2: 'Monday', 3: 'Monday',
    4: 'Tuesday', 5: 'Tuesday',
    6: 'Wednesday', 7: 'Wednesday',
    8: 'Thursday', 9: 'Thursday',
    10: 'Friday', 11: 'Friday',
    12: 'Saturday'
}

SUBJECT_NAMES = {
    'TDM': 'Techniques for Decision Making (TDM)',
    'DS': 'Data Structures (DS)',
    'DBMS': 'Database Systems (DBMS)',
    'EVS': 'Environmental Science (EVS)',
    'TOC': 'Theory of Computation (ToC)',
    'CMD': 'Career Management & Development (CMD)',
    'SM': 'Statistical Methods (SM)',
    'FOAI': 'Foundation of AI (FOAI)',
    'DSLAB': 'Data Structures Lab (DS Lab)',
    'DBMSLAB': 'Database Systems Lab (DBMS Lab)',
    'UNIXLAB': 'Unix Programming Lab (UNIX Lab)',
    'APLAB1': 'Advanced Programming Lab-1 (AP Lab-1)',
    'SMLAB': 'Statistical Methods Lab (SM Lab)',
    'AILAB': 'AI Lab (AI Lab)',
}

GROUPS = {
    'BX': ['B1', 'B2', 'B3'],
    'BY': ['B4', 'B5', 'B6'],
    'BZ': ['B7', 'B8', 'B9'],
    'BX1': ['B21', 'B22', 'B23', 'B31']
}

def matches_batch(cell_batch, user_batch):
    if cell_batch == user_batch:
        return True
    if cell_batch in GROUPS and user_batch in GROUPS[cell_batch]:
        return True
    batches = re.findall(r'B\d+', cell_batch)
    return user_batch in batches

with pdfplumber.open('C:/Users/aasim/Downloads/BTech3semCSE.pdf') as pdf:
    table = pdf.pages[0].extract_table()

all_sessions = []

for r_idx in range(2, 13):
    day = DAYS[r_idx]
    is_practical_row = (r_idx in [3, 5, 7, 9, 11])
    row = table[r_idx]
    
    for c_idx, cell in enumerate(row):
        if not cell or not cell.strip():
            continue
        if c_idx == 0 and not is_practical_row:
            continue
        if c_idx == 6:
            continue
            
        time_slot = PRACTICAL_TIMES.get(c_idx) if is_practical_row else THEORY_TIMES.get(c_idx)
        if not time_slot:
            continue
            
        cleaned_cell = re.sub(r'-\s+', '-', cell.replace('\n', ' '))
        tokens = re.findall(r'([A-Za-z0-9]+)-([LTP])-([A-Za-z0-9]+)-([A-Za-z0-9]+)', cleaned_cell)
        
        for batch, stype, subj, room in tokens:
            subj_clean = subj.upper()
            all_sessions.append({
                'day': day,
                'time': time_slot,
                'batch': batch,
                'type': 'Practical' if stype == 'P' else ('Lecture' if stype == 'L' else 'Tutorial'),
                'rawType': stype,
                'subjectCode': subj_clean,
                'subjectName': SUBJECT_NAMES.get(subj_clean, subj_clean),
                'room': room,
                'isLab': stype == 'P',
                'durationHours': 2 if stype == 'P' else 1
            })

print(f"Total sessions across college: {len(all_sessions)}")

b31_sessions = [s for s in all_sessions if matches_batch(s['batch'], 'B31')]
print(f"Total sessions for B31: {len(b31_sessions)}")
for s in b31_sessions:
    print(f"{s['day']:<10} | {s['time']:<18} | {s['type']:<9} | {s['subjectCode']:<8} | {s['room']:<6} | {s['batch']}")
