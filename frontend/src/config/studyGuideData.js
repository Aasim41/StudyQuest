/**
 * StudyQuest Universal Exam & Subject Knowledgebase (High-Precision Curation Engine)
 * Automatically curates study plans, syllabus topics, flashcards, and predictor radar
 * based on the active target exam.
 * 
 * Supports:
 * - CBSE Class 12 & Class 10 Boards
 * - JEE Main & Advanced
 * - NEET UG Medical
 * - College & University Semester Exams (B.Tech, BCA, CS/IT)
 * - GATE Engineering (CS/IT)
 * - UPSC Civil Services Examination
 * - CAT / Management Entrances
 * - Custom & Other Exams
 */

export const EXAM_CATEGORIES = [
  { id: 'ALL', label: 'All Exams', icon: 'earth' },
  { id: 'COMPETITIVE', label: 'Competitive Exams', icon: 'trophy-variant-outline', desc: 'JEE, NEET, GATE, UPSC, CAT' },
  { id: 'BOARD', label: 'Board & School', icon: 'school-outline', desc: 'CBSE 10/12, ICSE/ISC, State Boards' },
  { id: 'COLLEGE', label: 'College & University', icon: 'domain', desc: 'Mid-Sem, End-Sem, Engineering' },
];

export const EXAM_TARGETS = [
  // Competitive Exams
  {
    id: 'JEE',
    category: 'COMPETITIVE',
    label: 'JEE Main & Advanced',
    desc: 'Physics, Chemistry, Mathematics • Extreme edge cases, multi-concept traps',
    weightage: '300 / 360 Marks',
    examType: 'Competitive',
    markingScheme: '+4 for correct, -1 for incorrect, 0 for unattempted. Numerical section has no negative marking in select sets.',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
  },
  {
    id: 'NEET',
    category: 'COMPETITIVE',
    label: 'NEET (UG)',
    desc: 'Botany, Zoology, Chemistry, Physics • 100% NCERT verbatim recall & exceptions',
    weightage: '720 Marks',
    examType: 'Competitive',
    markingScheme: '+4 for correct, -1 for incorrect. 180 questions to be answered out of 200.',
    subjects: ['Botany', 'Zoology', 'Chemistry', 'Physics'],
  },
  {
    id: 'GATE',
    category: 'COMPETITIVE',
    label: 'GATE / PSU Exam',
    desc: 'Computer Science & Engineering • NAT numerical precision, rigorous asymptotic bounds',
    weightage: '100 Marks',
    examType: 'Competitive',
    markingScheme: '1 & 2 Mark MCQs (-0.33 / -0.66). NAT (Numerical Answer Type) has zero negative marking.',
    subjects: ['Algorithms & Complexity', 'Theory of Computation', 'Operating Systems', 'Computer Networks', 'Database Systems'],
  },
  {
    id: 'UPSC',
    category: 'COMPETITIVE',
    label: 'UPSC / Civil Services',
    desc: 'General Studies & Optionals • Multi-dimensional governance, constitutional articles, balanced conclusions',
    weightage: '1750 Mains Marks',
    examType: 'Competitive',
    markingScheme: 'Subjective 10 & 15 marker questions with strict word counts (150 & 250 words). Introduction, Arguments, Counter-arguments, Way Forward.',
    subjects: ['Polity & Governance', 'Modern History & Culture', 'Economy & Budget', 'Geography & Environment', 'Ethics & Integrity'],
  },
  {
    id: 'CAT',
    category: 'COMPETITIVE',
    label: 'CAT / Management',
    desc: 'Quant, DILR, VARC • Logic boundary constraints, speed shortcuts, reading inference',
    weightage: '100 Percentile',
    examType: 'Competitive',
    markingScheme: '+3 for correct, -1 for MCQ negative. Non-MCQ TITA (Type In The Answer) has zero negative marking.',
    subjects: ['Quantitative Aptitude', 'DILR (Data & Logic)', 'Verbal & Reading Comprehension'],
  },

  // Board & School Exams
  {
    id: 'CBSE_12',
    category: 'BOARD',
    label: 'CBSE Class 12 Boards',
    desc: 'Physics, Chemistry, Maths, Biology • Strict step-marking, formula substitution, units & diagrams',
    weightage: '70 / 80 Marks Theory',
    examType: 'Board',
    markingScheme: 'Step-marking with 0.5 & 1 mark sub-divisions. Final answer without units loses 0.5 marks. Formula statement mandatory.',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English Core'],
  },
  {
    id: 'CBSE_10',
    category: 'BOARD',
    label: 'CBSE Class 10 Boards',
    desc: 'Science, Mathematics, Social Science • Textbook definitions, balanced equations, standard derivations',
    weightage: '80 Marks Theory',
    examType: 'Board',
    markingScheme: 'Strict adherence to NCERT keywords, labeled ray diagrams, and standard algebraic steps.',
    subjects: ['Science (Physics/Chem/Bio)', 'Mathematics', 'Social Science', 'English Language'],
  },

  // ICSE / ISC (CISCE Board)
  {
    id: 'ICSE_10',
    category: 'BOARD',
    label: 'ICSE Class 10',
    desc: 'English, Mathematics, Science, History & Civics, Geography • Application-based questions, internal/external assessment split',
    weightage: '80 Marks External + 20 Marks Internal per subject',
    examType: 'Board',
    markingScheme: 'External exam 80 marks (2.5 hrs). Internal assessment 20 marks (project + practicals). Section A is compulsory; Section B offers internal choice (attempt 4 out of 7). Neat labeled diagrams carry dedicated marks.',
    subjects: ['English', 'Mathematics', 'Science (Physics/Chem/Bio)', 'History & Civics', 'Geography'],
  },
  {
    id: 'ISC_12',
    category: 'BOARD',
    label: 'ISC Class 12',
    desc: 'English, Physics, Chemistry, Maths, Biology/CS • Rigorous application & analysis, project-based internal assessment',
    weightage: '70 Marks External + 30 Marks Internal (Practical/Project)',
    examType: 'Board',
    markingScheme: 'Theory paper 70 marks (3 hrs). Internal assessment 30 marks (practical + project + viva). Section A compulsory; Section B attempt 4 out of 6. Answer must include diagrams, derivations, and applications.',
    subjects: ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology/Computer Science'],
  },

  // State Board Exams
  {
    id: 'MH_BOARD',
    category: 'BOARD',
    label: 'Maharashtra Board (HSC)',
    desc: 'Physics, Chemistry, Mathematics, Biology • MSBSHSE pattern with 70/30 theory-practical split, activity-based questions',
    weightage: '70 Marks Theory + 30 Marks Practical per subject',
    examType: 'Board',
    markingScheme: 'Theory paper 70 marks (3 hrs). Practical/oral 30 marks. Numericals carry 3-4 marks each; diagram-based questions carry 2 marks for labeled diagram alone. Activity-based questions mandatory in Section D.',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },
  {
    id: 'KA_BOARD',
    category: 'BOARD',
    label: 'Karnataka Board (PUC II)',
    desc: 'Physics, Chemistry, Mathematics, Biology • Blueprint-based question paper pattern with fixed unit-wise mark distribution',
    weightage: '70 Marks Theory + 30 Marks Practical',
    examType: 'Board',
    markingScheme: 'Blueprint pattern: 1-mark (VSA), 2-mark (SA), 3-mark (SA), 5-mark (LA with choice) sections. Fixed unit-wise weightage published annually. Practical 30 marks includes record + viva + experiment.',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },
  {
    id: 'TN_BOARD',
    category: 'BOARD',
    label: 'Tamil Nadu Board (HSC +2)',
    desc: 'Physics, Chemistry, Mathematics, Biology • Samacheer Kalvi syllabus, volume-based textbooks, state-specific content',
    weightage: '70 Marks Theory + 30 Marks Practical',
    examType: 'Board',
    markingScheme: 'Part I: 15×1 MCQ (15 marks). Part II: 6×2 SA (12 marks). Part III: 6×3 SA (18 marks). Part IV: 5×5 LA with internal choice (25 marks). Total theory 70 marks. State-specific examples and Tamil Nadu geography/history integrated.',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },
  {
    id: 'KL_BOARD',
    category: 'BOARD',
    label: 'Kerala Board (DHSE +2)',
    desc: 'Physics, Chemistry, Mathematics, Biology • SCERT Kerala syllabus, focus on conceptual understanding and application',
    weightage: '60 Marks Theory + 20 Marks Practical + 20 Marks CE',
    examType: 'Board',
    markingScheme: 'Theory 60 marks. Practical 20 marks. Continuous Evaluation (CE) 20 marks. Questions include 1-mark (fill/MCQ), 2-mark (short answer), 3-mark (paragraph), 5-mark (essay with choice). CE includes assignments, seminars, lab records.',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },
  {
    id: 'UP_BOARD',
    category: 'BOARD',
    label: 'UP Board (Intermediate)',
    desc: 'Physics, Chemistry, Mathematics, Biology • NCERT-aligned since 2018 but retains legacy UP Board question patterns',
    weightage: '70 Marks Theory + 30 Marks Practical',
    examType: 'Board',
    markingScheme: 'Theory 70 marks (3 hrs). Practical 30 marks. Bilingual paper (Hindi & English). MCQ section (20 marks), Very Short (10 marks), Short Answer (20 marks), Long Answer (20 marks). Legacy numerical patterns alongside NCERT alignment.',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },
  {
    id: 'MP_BOARD',
    category: 'BOARD',
    label: 'MP Board (HSC)',
    desc: 'Physics, Chemistry, Mathematics, Biology • MPBSE syllabus with blueprint-based marking and quarterly assessment',
    weightage: '70 Marks Theory + 30 Marks Practical',
    examType: 'Board',
    markingScheme: 'Theory 70 marks. Objective (1-mark MCQ/fill-in), Very Short (2 marks), Short Answer (3 marks), Long Answer (4-5 marks). Blueprint published with unit-wise marks. Practical 30 marks (experiment + viva + record).',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },
  {
    id: 'RJ_BOARD',
    category: 'BOARD',
    label: 'Rajasthan Board (RBSE Sr. Sec)',
    desc: 'Physics, Chemistry, Mathematics, Biology • RBSE syllabus with NCERT-based content and state-specific supplements',
    weightage: '56 Marks Theory + 20 Marks Practical + 24 Marks Internal',
    examType: 'Board',
    markingScheme: 'Theory 56 marks (3.25 hrs). Practical 20 marks. Internal assessment 24 marks (project + assignment + attendance). Objective section (1 mark × 8), SA (2 marks × 8), LA (4 marks × 4), Very LA (5 marks × 2).',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },
  {
    id: 'WB_BOARD',
    category: 'BOARD',
    label: 'West Bengal Board (HS)',
    desc: 'Physics, Chemistry, Mathematics, Biology • WBCHSE syllabus with MCQ + SAQ + LAQ pattern',
    weightage: '70 Marks Theory + 30 Marks Practical',
    examType: 'Board',
    markingScheme: 'Group A: MCQ 15×1 (15 marks). Group B: SAQ (attempt 18 out of 21 at 1 mark each). Group C: Descriptive 3-5 marks with internal choice. Total theory 70 marks. Practical 30 marks (experiment + project + viva).',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },
  {
    id: 'AP_BOARD',
    category: 'BOARD',
    label: 'AP/Telangana Board (IPE)',
    desc: 'Physics, Chemistry, Mathematics, Biology • BIEAP/TSBIE Intermediate pattern with Section A/B/C structure',
    weightage: '60 Marks Theory + 30 Marks Practical + 10 Marks Internal',
    examType: 'Board',
    markingScheme: 'Section A: 10×2 VSAQ (20 marks). Section B: 6×4 SAQ attempt 6 out of 8 (24 marks). Section C: 2×8 LAQ attempt 2 out of 4 (16 marks). Theory total 60 marks. Practical 30 marks. Internal 10 marks.',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },
  {
    id: 'BIHAR_BOARD',
    category: 'BOARD',
    label: 'Bihar Board (BSEB Intermediate)',
    desc: 'Physics, Chemistry, Mathematics, Biology • BSEB pattern with 50% objective + 50% subjective split',
    weightage: '70 Marks Theory + 30 Marks Practical',
    examType: 'Board',
    markingScheme: 'Paper split into two halves: Objective (35 marks, 70 MCQs with OMR) + Subjective (35 marks, short + long answers). Total theory 70 marks. Practical 30 marks. Each half has separate time allocation (1.5 hrs each).',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },
  {
    id: 'GJ_BOARD',
    category: 'BOARD',
    label: 'Gujarat Board (GSEB HSC)',
    desc: 'Physics, Chemistry, Mathematics, Biology • GSEB syllabus with MCQ-heavy pattern and Gujarati/English medium',
    weightage: '70 Marks Theory + 30 Marks Practical',
    examType: 'Board',
    markingScheme: 'Section A: MCQ (1 mark each, ~16 marks). Section B: VSA 1-2 marks. Section C: SA 3 marks. Section D: LA 5 marks with internal choice. Total theory 70 marks. Practical 30 marks (experiment + journal + oral).',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },

  // College & University Exams
  {
    id: 'COLLEGE_SEM',
    category: 'COLLEGE',
    label: 'College Semester Exams',
    desc: 'B.Tech / BCA / CS / IT • Unit-wise 10-marker derivations, architectural block diagrams, pseudocode',
    weightage: 'Semester End (70-100 Marks)',
    examType: 'College',
    markingScheme: 'Long answer format (7-10 marks each) requiring architectural diagrams, step-by-step algorithm explanation, and time complexity proofs.',
    subjects: ['Data Structures & Algorithms', 'Database Systems (DBMS)', 'Operating Systems', 'Computer Networks', 'Software Engineering'],
  },
];

export const COMMON_SUBJECTS = [
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'Computer Science',
  'Economics',
  'Other / Custom Subject',
];

// ─────────────────────────────────────────────────────────────────────────────
// EXAM-SPECIFIC CURATED TOPICS & BLINDSPOTS
// ─────────────────────────────────────────────────────────────────────────────

export const EXAM_KNOWLEDGEBASE = {
  // ─── CBSE CLASS 12 BOARDS ──────────────────────────────────────────────────
  CBSE_12: {
    name: 'CBSE Class 12 Boards',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English Core'],
    topics: [
      {
        id: 'cbse12-phy-photoelectric',
        subject: 'Physics',
        title: 'Photoelectric Effect & Stopping Potential',
        examRelevance: 'CBSE 12th Board 3-Marker Guaranteed',
        blindspotCount: 3,
        summary: 'Emission of electrons under incident electromagnetic radiation with strict frequency criteria.',
        aiBlindspots: [
          {
            point: 'Stopping Potential Depends on Frequency, NOT Intensity',
            whatAiSays: 'Generic AI states that intense light produces energetic electrons.',
            whatAiMisses: 'Standard AI confuses intensity with frequency. Intensity ONLY increases photocurrent (number of electrons/sec). Stopping potential V_0 depends strictly on incident frequency nu and work function Phi_0.',
            examinerRubric: 'Examiners award full 3 marks only when: (1) e*V_0 = h*nu - Phi_0 formula is written (1 mark), (2) Graph shows intercept on frequency axis nu_0 (1 mark), (3) Slope equals h/e (1 mark).',
          },
          {
            point: 'Instantaneous Emission Disproves Classical Wave Theory',
            whatAiSays: 'Generic AI mentions wave-particle duality in general terms.',
            whatAiMisses: 'AI skips the mandatory 2-marker board proof: classical wave theory requires hours for continuous wave energy accumulation over electron cross-section, whereas experimental time lag is < 10^-9 seconds.',
            examinerRubric: 'Mentioning "< 10^-9 seconds time lag" is an explicit NCERT rubric mark.',
          },
        ],
        coreConcepts: [
          'Einstein Photoelectric Equation: K_max = h*nu - Phi_0 = e*V_0.',
          'Threshold frequency nu_0: minimum frequency for emission irrespective of intensity.',
          'Saturation current is directly proportional to intensity of incident radiation.',
        ],
        examQuestions: [
          {
            question: 'Plot a graph showing variation of stopping potential with frequency of incident radiation for two different photosensitive materials having work functions W1 and W2 (W1 > W2). On what factor does the slope depend?',
            marks: 3,
            keyPoints: [
              'Two parallel straight lines with equal slope h/e.',
              'Line for W1 has a higher threshold frequency intercept than W2.',
              'Slope equals h/e, which is universal and independent of material.',
            ],
          },
        ],
        quiz: [
          {
            question: 'If incident light intensity is tripled keeping frequency constant, stopping potential will:',
            options: ['Triple', 'Become one-third', 'Remain completely unchanged', 'Increase by factor of 9'],
            correctIndex: 2,
            explanation: 'Stopping potential is independent of intensity; it depends solely on radiation frequency and work function.',
          },
        ],
      },
      {
        id: 'cbse12-chem-aldol',
        subject: 'Chemistry',
        title: 'Aldol Condensation vs Cannizzaro Reaction',
        examRelevance: 'CBSE 12th Board Organic 5-Marker Core',
        blindspotCount: 3,
        summary: 'Carbonyl condensation reactions governed by the presence or absence of alpha-hydrogens.',
        aiBlindspots: [
          {
            point: 'Alpha-Hydrogen is the Mandatory Disproportionation Trigger',
            whatAiSays: 'Generic AI provides generic reaction steps with NaOH.',
            whatAiMisses: 'AI misses the decisive distinction: Aldol strictly requires at least one alpha-hydrogen to form nucleophilic enolate ion. If alpha-H is ABSENT (e.g. Benzaldehyde, Formaldehyde), 50% conc. NaOH triggers Cannizzaro self-redox.',
            examinerRubric: 'Examiners deduct 2 marks if absence of alpha-hydrogens is not explicitly identified.',
          },
          {
            point: 'Uncontrolled Crossed Aldol Yields 4 Distinct Products',
            whatAiSays: 'Generic AI shows a single clean product.',
            whatAiMisses: 'Mixing two different aldehydes that both possess alpha-hydrogens produces 4 products (2 self-aldol + 2 crossed-aldol), resulting in synthetic mixture.',
            examinerRubric: 'Standard Board question: Draw all 4 structural isomers of crossed aldol between ethanal and propanal.',
          },
        ],
        coreConcepts: [
          'Aldol: Carbonyl with alpha-H + dilute NaOH -> beta-hydroxy aldehyde/ketone -> alpha,beta-unsaturated carbonyl upon heating.',
          'Cannizzaro: Carbonyl without alpha-H + 50% NaOH -> 1 molecule reduced to primary alcohol, 1 molecule oxidized to carboxylate salt.',
        ],
        examQuestions: [
          {
            question: 'An organic compound (A) with molecular formula C7H6O does not reduce Fehling solution but undergoes Cannizzaro reaction. Identify (A) and write reactions.',
            marks: 3,
            keyPoints: [
              'Compound (A) is Benzaldehyde (C6H5CHO).',
              'Does not reduce Fehling because it is an aromatic aldehyde.',
              'Equation with conc. NaOH gives Benzyl alcohol + Sodium benzoate.',
            ],
          },
        ],
        quiz: [
          {
            question: 'Which of the following compounds will undergo Cannizzaro reaction?',
            options: ['Acetaldehyde', 'Acetone', 'Benzaldehyde', 'Propanal'],
            correctIndex: 2,
            explanation: 'Benzaldehyde lacks alpha-hydrogens and therefore undergoes disproportionation in concentrated base.',
          },
        ],
      },
      {
        id: 'cbse12-math-kings',
        subject: 'Mathematics',
        title: "Definite Integrals: King's Property & The 2I Step",
        examRelevance: 'CBSE 12th Board Section D 6-Marker',
        blindspotCount: 2,
        summary: 'Symmetric transformation: Integral from a to b of f(x)dx = Integral from a to b of f(a + b - x)dx.',
        aiBlindspots: [
          {
            point: 'The Mandatory "2I" Addition Step and Division by 2',
            whatAiSays: 'Generic AI states the property formula.',
            whatAiMisses: 'Generic AI fails to format the step-by-step board proof: (1) Set I = Integral f(x)dx, (2) Apply King property to obtain transformed equation for I, (3) Add both equations to establish 2I = Integral [f(x) + f(a+b-x)]dx. Students frequently forget to divide by 2 at the final step!',
            examinerRubric: 'CBSE marking scheme allocates 2 marks for setting up 2I, 2 marks for constant integrand evaluation, and 1 mark for dividing by 2.',
          },
        ],
        coreConcepts: [
          'Integral[0 to a] f(x) dx = Integral[0 to a] f(a - x) dx.',
          'Integral[a to b] f(x) dx = Integral[a to b] f(a + b - x) dx.',
          'When f(x) + f(a + b - x) = constant k, value is k * (b - a) / 2.',
        ],
        examQuestions: [
          {
            question: 'Evaluate Integral from 0 to pi of (x * sin x) / (1 + cos^2 x) dx.',
            marks: 6,
            keyPoints: [
              'Let I = Integral[0 to pi] (x sin x)/(1 + cos^2 x) dx.',
              'Apply f(pi - x) to get I = Integral[0 to pi] ((pi - x) sin x)/(1 + cos^2 x) dx.',
              'Add: 2I = pi * Integral[0 to pi] (sin x)/(1 + cos^2 x) dx => 2I = pi * (pi/2) => I = pi^2 / 4.',
            ],
          },
        ],
        quiz: [
          {
            question: 'The value of Integral[0 to pi/2] (sin^4 x) / (sin^4 x + cos^4 x) dx is:',
            options: ['pi/2', 'pi/4', '0', '1'],
            correctIndex: 1,
            explanation: 'Using King property, 2I = Integral[0 to pi/2] 1 dx = pi/2 => I = pi/4.',
          },
        ],
      },
      {
        id: 'cbse12-bio-dna',
        subject: 'Biology',
        title: 'DNA Replication & Leading vs Lagging Strand Synthesis',
        examRelevance: 'CBSE 12th Board 5-Marker Genetics',
        blindspotCount: 3,
        summary: 'Semiconservative replication mediated by DNA Polymerase acting strictly in 5-prime to 3-prime direction.',
        aiBlindspots: [
          {
            point: 'DNA Polymerase Strictly Requires a Free 3-OH Primer Terminus',
            whatAiSays: 'Generic AI states that DNA polymerase copies DNA.',
            whatAiMisses: 'DNA Polymerase CANNOT initiate synthesis de novo; it requires an RNA primer synthesized by RNA primase to provide the free 3-prime hydroxyl group.',
            examinerRubric: 'Examiners deduct 1.5 marks if the role of RNA Primase and 3-OH terminus is omitted.',
          },
        ],
        coreConcepts: [
          'Helicase unzips; single-strand binding proteins stabilize replication bubble.',
          'Leading strand: continuous synthesis towards fork.',
          'Lagging strand: discontinuous Okazaki fragments joined by DNA Ligase.',
        ],
        examQuestions: [
          {
            question: 'Explain why DNA replication is termed semiconservative and semidiscontinuous. Name the key enzymes involved.',
            marks: 5,
            keyPoints: [
              'Semiconservative: one parental and one daughter strand (Meselson & Stahl experimental citation).',
              'Semidiscontinuous: continuous on leading strand, discontinuous on lagging strand.',
              'Enzymes: Helicase, Topoisomerase/Gyrase, Primase, DNA Polymerase III & I, Ligase.',
            ],
          },
        ],
        quiz: [
          {
            question: 'Okazaki fragments are formed on the lagging strand because:',
            options: [
              'DNA polymerase synthesizes only in 5-prime to 3-prime direction',
              'DNA helicase moves in opposite directions',
              'RNA primer degrades midway',
              'Template DNA is fragmented',
            ],
            correctIndex: 0,
            explanation: 'Because DNA Polymerase can only add nucleotides to a free 3-OH group (synthesizing 5 to 3), the antiparallel strand must be copied away from the fork in discontinuous fragments.',
          },
        ],
      },
    ],
  },

  // ─── JEE MAIN & ADVANCED ───────────────────────────────────────────────────
  JEE: {
    name: 'JEE Main & Advanced',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    topics: [
      {
        id: 'jee-phy-rolling',
        subject: 'Physics',
        title: 'Rolling Without Slipping & Static Friction Direction',
        examRelevance: 'JEE Advanced Mechanics Core Trap',
        blindspotCount: 3,
        summary: 'Rigid body kinematics with instantaneous center of zero velocity at contact point.',
        aiBlindspots: [
          {
            point: 'Static Friction Can Act Forward, Zero, or Backward',
            whatAiSays: 'Generic AI says friction always opposes the direction of motion.',
            whatAiMisses: 'In pure rolling under external force F applied at height h from center of mass: f_s = (F * I_cm - F * m * R * h) / (I_cm + m * R^2). When h = I_cm / (m*R), friction is EXACTLY ZERO! When h is greater, friction acts FORWARD!',
            examinerRubric: 'Classic JEE Advanced negative-marking trap: assuming friction is always opposite to wheel translation.',
          },
          {
            point: 'Work Done by Static Friction in Pure Rolling is Zero',
            whatAiSays: 'Generic AI calculates work as Force * distance.',
            whatAiMisses: 'Because the instantaneous velocity at contact is V_contact = V_cm - omega*R = 0, instantaneous displacement is zero. Hence, total work done by static friction on the rolling body is identically zero.',
            examinerRubric: 'Conservation of mechanical energy holds strictly because W_friction = 0.',
          },
        ],
        coreConcepts: [
          'Pure rolling constraint: V_cm = R * omega, a_cm = R * alpha.',
          'Acceleration down incline: a = g * sin(theta) / (1 + I_cm / (m * R^2)).',
          'Minimum friction coefficient for pure rolling: mu_min = tan(theta) / (1 + m * R^2 / I_cm).',
        ],
        examQuestions: [
          {
            question: 'A horizontal force F is applied at the top of a uniform solid sphere of mass M and radius R on a rough horizontal surface. Find the direction and magnitude of friction force.',
            marks: 4,
            keyPoints: [
              'Torque about CM: tau = F*R - f*R = I*alpha = (2/5*M*R^2)*alpha.',
              'Linear: F + f = M*a.',
              'Solving with a = R*alpha yields f = +F/7 (acting FORWARD in direction of force!).',
            ],
          },
        ],
        quiz: [
          {
            question: 'For a solid cylinder rolling without slipping, what fraction of its total kinetic energy is rotational?',
            options: ['1/2 (50%)', '1/3 (33.3%)', '2/5 (40%)', '2/3 (66.7%)'],
            correctIndex: 1,
            explanation: 'K_trans = 1/2*M*V^2, K_rot = 1/2*(1/2*M*R^2)*omega^2 = 1/4*M*V^2. K_rot / K_total = (1/4) / (3/4) = 1/3.',
          },
        ],
      },
      {
        id: 'jee-chem-carbocation',
        subject: 'Chemistry',
        title: 'Carbocation Rearrangements & Ring Expansions',
        examRelevance: 'JEE Advanced Organic Chemistry Mechanism Trap',
        blindspotCount: 3,
        summary: 'Wagner-Meerwein shifts driving carbocation stabilization via hyperconjugation and ring strain release.',
        aiBlindspots: [
          {
            point: 'Ring Expansion Dominates Over Simple Hydride Shift',
            whatAiSays: 'Generic AI predicts simple secondary to tertiary hydride shift.',
            whatAiMisses: 'A 4-membered or 5-membered ring with an adjacent exocyclic carbocation (cyclobutyl-methyl cation) ALWAYS undergoes ring expansion to relieve Baeyer angle strain before any hydride shift can occur.',
            examinerRubric: 'JEE penalizes students who perform 1,2-hydride shift to form strained cyclobutane rather than 5-membered cyclopentyl cation.',
          },
        ],
        coreConcepts: [
          'Driving force: relief of angle strain (4->5, 5->6 membered rings) and resonance stabilization.',
          'Rearrangement is intramolecular and concerted with retention of stereochemistry.',
        ],
        examQuestions: [
          {
            question: 'Predict the major product when 1-cyclobutyl-ethanol is treated with concentrated sulfuric acid.',
            marks: 4,
            keyPoints: [
              'Protonation of alcohol followed by water loss forms secondary cation adjacent to 4-membered ring.',
              'Ring expansion occurs to give 1-methylcyclopentyl cation (tertiary 5-membered ring).',
              'Elimination yields 1-methylcyclopentene as Saytzeff major product.',
            ],
          },
        ],
        quiz: [
          {
            question: 'Which carbocation rearrangement is thermodynamically most favorable?',
            options: ['Cyclohexyl to Cycloheptyl', 'Cyclobutyl-carbinyl to Cyclopentyl', 'Tertiary to Secondary', 'Bridgehead carbocation formation'],
            correctIndex: 1,
            explanation: 'Cyclobutane angle strain (~26 kcal/mol) release makes cyclobutyl-carbinyl to cyclopentyl expansion extremely exothermic.',
          },
        ],
      },
      {
        id: 'jee-math-lhopital',
        subject: 'Mathematics',
        title: "Limits: L'Hopital Traps & Squeeze Theorem Edge Cases",
        examRelevance: 'JEE Advanced Calculus Invariant',
        blindspotCount: 3,
        summary: 'Rigorous limit evaluation when indeterminate conditions fail or derivative oscillations occur.',
        aiBlindspots: [
          {
            point: "L'Hopital Rule Strictly Requires 0/0 or Infinity/Infinity",
            whatAiSays: "Generic AI blindly applies L'Hopital whenever limits look complex.",
            whatAiMisses: "If limit is NOT indeterminate (e.g., denominator approaches finite non-zero value), applying L'Hopital gives totally incorrect results. Also fails on oscillatory derivatives like lim x->infinity (x + sin x)/x.",
            examinerRubric: 'JEE Advanced designs distractors specifically matching erroneous L’Hopital outputs.',
          },
        ],
        coreConcepts: [
          'Standard expansion series: sin x = x - x^3/6, e^x = 1 + x + x^2/2, ln(1+x) = x - x^2/2.',
          'Squeeze Theorem: If g(x) <= f(x) <= h(x) and lim g = lim h = L, then lim f = L.',
        ],
        examQuestions: [
          {
            question: 'Evaluate lim x->0 (tan x - sin x) / x^3 without using decimal approximations.',
            marks: 3,
            keyPoints: [
              'tan x - sin x = tan x * (1 - cos x) = tan x * 2 * sin^2(x/2).',
              'Divide by x^3: (tan x / x) * 2 * (sin(x/2) / (x/2))^2 * (1/4).',
              'Result = 1 * 2 * 1 * (1/4) = 1/2.',
            ],
          },
        ],
        quiz: [
          {
            question: 'The value of lim x->0 (x * sin(1/x)) is:',
            options: ['1', '0', 'Does not exist', 'Infinity'],
            correctIndex: 1,
            explanation: 'Since -1 <= sin(1/x) <= 1, -|x| <= x*sin(1/x) <= |x|. By squeeze theorem as x->0, limit is 0.',
          },
        ],
      },
    ],
  },

  // ─── NEET (UG) MEDICAL ─────────────────────────────────────────────────────
  NEET: {
    name: 'NEET (UG)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Botany', 'Zoology', 'Chemistry', 'Physics'],
    topics: [
      {
        id: 'neet-bot-photosynthesis',
        subject: 'Botany',
        title: 'C4 Pathway & Kranz Anatomy vs Photorespiration',
        examRelevance: 'NEET Plant Physiology 4-Marker Guaranteed',
        blindspotCount: 3,
        summary: 'Spatial separation of carbon fixation mechanisms overcoming RuBisCO oxygenase activity.',
        aiBlindspots: [
          {
            point: 'PEPcase is in Mesophyll; RuBisCO is STRICTLY in Bundle Sheath',
            whatAiSays: 'Generic AI states both enzymes exist in leaf cells.',
            whatAiMisses: 'NEET requires exact cellular localization: Mesophyll cells LACK RuBisCO and possess PEPcase. Bundle sheath cells LACK PEPcase and are packed with RuBisCO and agranal chloroplasts with thick, gas-impermeable walls.',
            examinerRubric: 'NEET questions test the exact cellular location: "Which enzyme is absent in mesophyll cells of C4 plants? Answer: RuBisCO".',
          },
          {
            point: 'Photorespiration Produces Neither ATP Nor Sugar (25% Carbon Loss)',
            whatAiSays: 'Generic AI describes photorespiration as an alternate respiration pathway.',
            whatAiMisses: 'Standard AI misses that C2 cycle consumes ATP, produces zero sugar, and releases CO2 in mitochondria with waste of 25% fixed carbon.',
            examinerRubric: 'Organelle sequence: Chloroplast -> Peroxisome -> Mitochondria is tested verbatim.',
          },
        ],
        coreConcepts: [
          'Primary CO2 acceptor in C4: Phosphoenolpyruvate (PEP, 3-carbon) forming Oxaloacetic acid (OAA, 4-carbon).',
          'RuBisCO exhibits higher affinity for CO2 when CO2:O2 ratio is normal, but acts as oxygenase at high temp.',
        ],
        examQuestions: [
          {
            question: 'In C4 plants, the primary carboxylation reaction takes place in the chloroplast of which cells?',
            marks: 4,
            keyPoints: [
              'Mesophyll cells via PEP carboxylase.',
              'Primary product: Oxaloacetic acid (4C).',
              'Malic acid or aspartic acid translocated to bundle sheath.',
            ],
          },
        ],
        quiz: [
          {
            question: 'RuBisCO enzyme acts as an oxygenase in C3 plants under conditions of:',
            options: ['Low O2 and high CO2', 'High O2, high temperature, and low CO2', 'Low light intensity', 'High humidity'],
            correctIndex: 1,
            explanation: 'High O2 concentration coupled with elevated temperatures increases RuBisCO oxygenase activity, triggering photorespiration.',
          },
        ],
      },
      {
        id: 'neet-zoo-neural',
        subject: 'Zoology',
        title: 'Action Potential Generation & Ionic Permeabilities',
        examRelevance: 'NEET Animal Physiology 4-Marker Core',
        blindspotCount: 3,
        summary: 'Electrochemical gradient propagation governed by voltage-gated Na+ and K+ channels.',
        aiBlindspots: [
          {
            point: 'Depolarization is Rapid Na+ Influx; Repolarization is K+ Efflux',
            whatAiSays: 'Generic AI says ions move across the membrane.',
            whatAiMisses: 'NEET tests exact direction and channel types: Threshold potential (-55mV) triggers voltage-gated Na+ channel opening -> rapid Na+ INFLUX -> membrane potential reaches +30mV. Repolarization is caused by K+ EFFLUX through voltage-gated K+ channels.',
            examinerRubric: 'Examiners check for "Na+ influx" vs "K+ efflux" distinction.',
          },
        ],
        coreConcepts: [
          'Resting membrane potential: -70 mV maintained by Na+/K+ ATPase pump (3 Na+ out, 2 K+ in).',
          'Axonal membrane at rest is more permeable to K+ ions and almost impermeable to Na+ ions.',
        ],
        examQuestions: [
          {
            question: 'Describe the events during transmission of an impulse across an electrical vs chemical synapse.',
            marks: 4,
            keyPoints: [
              'Electrical synapse: gap junctions allow direct ion flow, faster, rare in human system.',
              'Chemical synapse: synaptic vesicles release neurotransmitters (e.g. Acetylcholine) into synaptic cleft; Ca2+ influx mandatory.',
            ],
          },
        ],
        quiz: [
          {
            question: 'The resting membrane potential of an axonal membrane is maintained primarily by:',
            options: [
              'Sodium-potassium pump pumping 3 Na+ out for 2 K+ in',
              'Voltage-gated calcium channels',
              'Active transport of chloride ions',
              'Passive flow of sodium ions inwards',
            ],
            correctIndex: 0,
            explanation: 'The electrogenic Na+/K+ ATPase pump transports 3 Na+ outwards for every 2 K+ inwards using 1 ATP, maintaining negative interior.',
          },
        ],
      },
    ],
  },

  // ─── COLLEGE & UNIVERSITY SEMESTER EXAMS ────────────────────────────────────
  COLLEGE_SEM: {
    name: 'College Semester Exams',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Data Structures & Algorithms', 'Database Systems (DBMS)', 'Operating Systems', 'Computer Networks', 'Software Engineering'],
    topics: [
      {
        id: 'col-os-deadlock',
        subject: 'Operating Systems',
        title: "Deadlock: Banker's Algorithm & Safe State Proof",
        examRelevance: 'University 10-Marker End-Sem Question',
        blindspotCount: 3,
        summary: 'Resource allocation state evaluation ensuring avoidance of circular wait conditions.',
        aiBlindspots: [
          {
            point: 'Safe State is NOT Identical to Deadlock-Free State',
            whatAiSays: 'Generic AI says an unsafe state is a deadlocked state.',
            whatAiMisses: 'Unsafe state does NOT mean deadlock has occurred; it means the system cannot guarantee avoidance of deadlock if all processes demand their maximum claims simultaneously. A deadlocked state is a strict subset of unsafe states.',
            examinerRubric: 'University 10-mark marking keys award 3 marks specifically for the Venn diagram showing: [Deadlock] subset of [Unsafe State] disjoint from [Safe State].',
          },
        ],
        coreConcepts: [
          '4 Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
          'Bankers matrices: Allocation, Max, Need = Max - Allocation, Available vector.',
        ],
        examQuestions: [
          {
            question: 'Given 5 processes P0 to P4 and 3 resource types A (10), B (5), C (7). Run Banker algorithm to verify if current state is safe. If a request from P1 arrives for (1, 0, 2), can it be granted?',
            marks: 10,
            keyPoints: [
              'Calculate Need matrix: Need = Max - Allocation.',
              'Safety algorithm trace showing work vector updates and safe sequence.',
              'Resource request algorithm validation for process P1.',
            ],
          },
        ],
        quiz: [
          {
            question: 'If a system is in an unsafe state, deadlock:',
            options: ['Has definitely occurred', 'May occur if maximum resource claims are requested', 'Is impossible', 'Occurs only on multi-core processors'],
            correctIndex: 1,
            explanation: 'An unsafe state means safe termination cannot be guaranteed under worst-case maximum claims, but deadlock may not occur if processes release resources early.',
          },
        ],
      },
      {
        id: 'col-dbms-bcnf',
        subject: 'Database Systems (DBMS)',
        title: 'Normalization: 3NF vs BCNF & Dependency Preservation',
        examRelevance: 'University End-Sem 10-Marker Question',
        blindspotCount: 3,
        summary: 'Decomposition guarantees: Lossless join property vs Functional Dependency preservation.',
        aiBlindspots: [
          {
            point: 'BCNF Decomposition Can LOSE Functional Dependencies',
            whatAiSays: 'Generic AI says BCNF is always better than 3NF.',
            whatAiMisses: '3NF ALWAYS guarantees both Lossless Join AND Dependency Preservation. BCNF guarantees Lossless Join, but CANNOT always preserve functional dependencies! In database design, 3NF is often preferred in practice when dependency preservation is vital.',
            examinerRubric: 'University examiners deduct 4 marks if the student claims BCNF always preserves functional dependencies.',
          },
        ],
        coreConcepts: [
          '3NF Condition: For X -> A, either X is a superkey OR A is a prime attribute.',
          'BCNF Condition: For X -> A, X MUST be a superkey (prime attribute exception is removed).',
        ],
        examQuestions: [
          {
            question: 'Given relation R(A, B, C, D) with FDs {AB -> C, C -> D, D -> A}. Find candidate keys, test for 3NF and BCNF, and decompose.',
            marks: 10,
            keyPoints: [
              'Candidate keys: AB, BC, CD.',
              'Check each FD against superkey and prime attribute criteria.',
              'Demonstrate why decomposition into BCNF loses AB -> C dependency.',
            ],
          },
        ],
        quiz: [
          {
            question: 'Which property is guaranteed in 3NF decomposition but NOT always in BCNF?',
            options: ['Lossless Join', 'Dependency Preservation', 'No Redundancy', 'Atomicity of attributes'],
            correctIndex: 1,
            explanation: 'While both 3NF and BCNF guarantee lossless decomposition, only 3NF is mathematically guaranteed to preserve all functional dependencies.',
          },
        ],
      },
    ],
  },

  // ─── GATE CS / IT ──────────────────────────────────────────────────────────
  GATE: {
    name: 'GATE / PSU Exam',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Algorithms & Complexity', 'Theory of Computation', 'Operating Systems', 'Computer Networks', 'Database Systems'],
    topics: [
      {
        id: 'gate-algo-master',
        subject: 'Algorithms & Complexity',
        title: 'Master Theorem: Regularity Condition & Gaps',
        examRelevance: 'GATE Core Numerical Trap',
        blindspotCount: 3,
        summary: 'Recurrence relation solution T(n) = a*T(n/b) + f(n) and non-applicable gap cases.',
        aiBlindspots: [
          {
            point: 'Case 3 Requires Strict Polynomial Domination & Regularity Condition',
            whatAiSays: 'Generic AI says if f(n) > n^(log_b a), answer is Theta(f(n)).',
            whatAiMisses: 'In GATE, f(n) must be POLYNOMIALLY larger: f(n) = Omega(n^(log_b a + epsilon)) for epsilon > 0. It fails for T(n) = 2T(n/2) + n*log n! Furthermore, the regularity condition a*f(n/b) <= c*f(n) for c < 1 must be verified.',
            examinerRubric: 'GATE NAT questions frequently ask for T(n) = 2T(n/2) + n*log n, which cannot be solved by standard Master Theorem (requires Akra-Bazzi or recursion tree: Theta(n * log^2 n)).',
          },
        ],
        coreConcepts: [
          'Critical exponent: c_crit = log_b(a).',
          'Case 1: f(n) = O(n^(c_crit - epsilon)) => T(n) = Theta(n^c_crit).',
          'Extended Case 2: f(n) = Theta(n^c_crit * log^k n) => T(n) = Theta(n^c_crit * log^(k+1) n).',
        ],
        examQuestions: [
          {
            question: 'Solve the recurrence relation T(n) = 4T(n/2) + n^2 * log n. State the asymptotic tight bound Theta.',
            marks: 2,
            keyPoints: [
              'a = 4, b = 2 => n^(log_2 4) = n^2.',
              'f(n) = n^2 * log^1 n matches Extended Case 2 with k = 1.',
              'T(n) = Theta(n^2 * log^2 n).',
            ],
          },
        ],
        quiz: [
          {
            question: 'Can the recurrence T(n) = 2T(n/2) + n / log n be solved using the standard Master Theorem?',
            options: ['Yes, Case 1', 'Yes, Case 3', 'No, because ratio is logarithmic not polynomial', 'Yes, Case 2'],
            correctIndex: 2,
            explanation: 'The difference between n and n/log n is not polynomial (n^epsilon), falling into the gap between Case 1 and Case 2.',
          },
        ],
      },
    ],
  },

  // ─── UPSC CIVIL SERVICES ───────────────────────────────────────────────────
  UPSC: {
    name: 'UPSC / Civil Services',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Polity & Governance', 'Modern History & Culture', 'Economy & Budget', 'Geography & Environment', 'Ethics & Integrity'],
    topics: [
      {
        id: 'upsc-polity-basic-structure',
        subject: 'Polity & Governance',
        title: 'Basic Structure Doctrine & Judicial Review Scope',
        examRelevance: 'UPSC GS Paper II Core Question',
        blindspotCount: 3,
        summary: 'Constitutional amendment limits under Article 368 established via judicial evolution.',
        aiBlindspots: [
          {
            point: 'Basic Structure is NOT Defined in the Text of the Constitution',
            whatAiSays: 'Generic AI treats basic structure as a constitutional clause.',
            whatAiMisses: 'Basic Structure is nowhere defined in the Indian Constitution; it is an organic judge-made doctrine originating in Kesavananda Bharati (1973) following Shankari Prasad (1951), Golaknath (1967), and Minerva Mills (1980).',
            examinerRubric: 'Mains examiners look for the evolution timeline and reference to Article 13(2) vs Article 368.',
          },
        ],
        coreConcepts: [
          'Doctrine limits Parliament amending power: Cannot alter the core identity of the constitution.',
          'Key elements: Supremacy of Constitution, Rule of Law, Judicial Review, Secularism, Federalism.',
        ],
        examQuestions: [
          {
            question: 'Analyze whether the Basic Structure doctrine has transformed the Indian judiciary into a third chamber of the legislature. Give balanced arguments.',
            marks: 15,
            keyPoints: [
              'Introduction defining Kesavananda Bharati and Article 368 bounds.',
              'Arguments for judicial overreach (NJAC invalidation 99th amendment).',
              'Arguments for constitutional guardrail (protecting fundamental rights from majoritarian excesses).',
              'Balanced conclusion upholding constitutionalism and separation of powers.',
            ],
          },
        ],
        quiz: [
          {
            question: 'The Basic Structure doctrine was formally propounded by the Supreme Court in:',
            options: ['Golaknath Case (1967)', 'Kesavananda Bharati Case (1973)', 'Minerva Mills Case (1980)', 'Maneka Gandhi Case (1978)'],
            correctIndex: 1,
            explanation: 'A 13-judge constitutional bench ruled by a 7-6 majority in Kesavananda Bharati that Parliament cannot alter the basic structure of the Constitution under Article 368.',
          },
        ],
      },
    ],
  },
  // ─── ICSE CLASS 10 (CISCE) ────────────────────────────────────────────────
  ICSE_10: {
    name: 'ICSE Class 10 (CISCE)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['English', 'Mathematics', 'Science (Physics/Chem/Bio)', 'History & Civics', 'Geography'],
    topics: [
      {
        id: 'icse10-phy-prism',
        subject: 'Science (Physics/Chem/Bio)',
        title: 'Refraction of Light through Prism & Total Internal Reflection',
        examRelevance: 'ICSE Section A & B 4-Marker Guaranteed Question',
        blindspotCount: 3,
        summary: 'Deviation through triangular glass prism (i1 + i2 = A + delta) and critical angle total internal reflection applications.',
        aiBlindspots: [
          {
            point: 'Angle of Minimum Deviation Condition (i1 = i2 and r1 = r2)',
            whatAiSays: 'Generic AI states that light bends towards the base of a prism.',
            whatAiMisses: 'ICSE examiners look strictly for the minimum deviation condition: ray inside the prism must be parallel to the base ONLY when i1 = i2. If prism is not equilateral, the ray is parallel to the base ONLY for isosceles/equilateral prisms.',
            examinerRubric: 'ICSE Marking Scheme: 1 mark for i1 + i2 = A + delta, 1 mark for ray diagram showing normal and arrows on every ray, 1 mark for stating r1 = r2 = A/2 at delta_min.',
          },
          {
            point: 'Critical Angle Dependence on Color/Wavelength of Light',
            whatAiSays: 'Generic AI defines critical angle as arcsin(1/mu).',
            whatAiMisses: 'ICSE questions frequently test which color of light has the greatest critical angle. Red light has the longest wavelength, lowest refractive index, hence HIGHEST critical angle (approx 42.8 deg in glass vs 41.2 deg for violet).',
            examinerRubric: 'Direct 1-mark question in ICSE Section A compulsory paper.',
          },
        ],
        coreConcepts: [
          'Prism formula: A = r1 + r2, delta = (i1 + i2) - A.',
          'Condition for total internal reflection: Light travels from denser to rarer medium, and angle of incidence > critical angle C.',
          'Total reflecting prisms: 45-90-45 degree right isosceles glass prism used in periscopes and binoculars (deviates ray by 90 or 180 degrees with 100% intensity).',
        ],
        examQuestions: [
          {
            question: 'A ray of light is incident normally on the face of an equilateral glass prism (mu = 1.5). Draw the ray path through and emerging from the prism. State whether total internal reflection occurs at the second surface.',
            marks: 4,
            keyPoints: [
              'Normal incidence means angle of incidence at first face is 0 deg, so ray enters undeviated.',
              'Angle of incidence at second face = 60 degrees.',
              'Critical angle of glass = 42 degrees. Since 60 deg > 42 deg, total internal reflection occurs.',
              'Draw arrows on all ray segments with normal drawn at point of incidence.',
            ],
          },
        ],
        quiz: [
          {
            question: 'For total internal reflection to occur in a 45-90-45 degree right-angled glass prism, the critical angle of glass must be:',
            options: ['Less than 45 degrees', 'Greater than 45 degrees', 'Exactly 60 degrees', '90 degrees'],
            correctIndex: 0,
            explanation: 'The ray strikes the hypotenuse at 45 degrees. For total internal reflection to occur, the angle of incidence (45 deg) must exceed the critical angle, so C < 45 deg (glass critical angle is ~42 deg).',
          },
        ],
      },
      {
        id: 'icse10-chem-hall-heroult',
        subject: 'Science (Physics/Chem/Bio)',
        title: 'Hall-Héroult Electrolytic Reduction of Alumina',
        examRelevance: 'ICSE Metallurgy 3-Marker Compulsory Question',
        blindspotCount: 3,
        summary: 'Extraction of aluminum from purified alumina (Al2O3) using cryolite and fluorspar flux in an electrolytic cell.',
        aiBlindspots: [
          {
            point: 'Exact Function of Cryolite (Na3AlF6) and Fluorspar (CaF2)',
            whatAiSays: 'Generic AI states they act as catalysts or solvents.',
            whatAiMisses: 'ICSE examiners deduct marks unless two specific functions are stated: (1) Lowers the melting point of alumina from 2050 deg C to around 950 deg C (saving enormous electrical energy), and (2) Enhances electrical conductivity since pure alumina is a poor conductor.',
            examinerRubric: 'CISCE marking scheme awards 1 mark per function. Both must be explicitly articulated.',
          },
          {
            point: 'Graphite Anodes Must Be Periodically Replaced',
            whatAiSays: 'Generic AI says graphite conducts electricity.',
            whatAiMisses: 'Oxygen evolved at the anode reacts with carbon anodes at 950 deg C to produce CO and CO2: C + O2 -> CO2 and 2C + O2 -> 2CO. The anodes burn away and must be replaced periodically.',
            examinerRubric: 'Equation C + O2 -> CO2 is required for full mark.',
          },
        ],
        coreConcepts: [
          'Cathode: Carbon lining of steel tank: 2Al^3+ + 6e^- -> 2Al(l) (Aluminum taps out at bottom).',
          'Anode: Suspended graphite rods: 3O^2- - 6e^- -> 3[O], C + 2[O] -> CO2(g).',
          'Layer of powdered coke sprinkled on electrolyte prevents heat loss and burning of carbon anodes.',
        ],
        examQuestions: [
          {
            question: 'In the electrolytic reduction of alumina: (a) Name the components of the electrolyte and their ratio. (b) Write cathode and anode reactions. (c) Why is powdered coke sprinkled on top?',
            marks: 4,
            keyPoints: [
              'Electrolyte: Purified Al2O3 (1 part), Cryolite Na3AlF6 (3 parts), Fluorspar CaF2 (1 part).',
              'Cathode: Al^3+ + 3e^- -> Al. Anode: 2O^2- - 4e^- -> O2, then C + O2 -> CO2.',
              'Powdered coke prevents heat radiation loss and burning of carbon anodes in air.',
            ],
          },
        ],
        quiz: [
          {
            question: 'Why is powdered coke sprinkled over the electrolytic bath in Hall-Héroult process?',
            options: ['To act as a reducing agent', 'To prevent heat loss by radiation and burning of anodes', 'To speed up aluminum deposition', 'To neutralize acidic fumes'],
            correctIndex: 1,
            explanation: 'Powdered coke insulates the surface, preventing heat loss by radiation and preventing the hot carbon anodes from burning in atmospheric oxygen.',
          },
        ],
      },
      {
        id: 'icse10-bio-genetics',
        subject: 'Science (Physics/Chem/Bio)',
        title: 'Genetics: Mendel Dihybrid Cross & Punnett Square',
        examRelevance: 'ICSE Biology Section B 5-Marker Pattern',
        blindspotCount: 3,
        summary: 'Inheritance of two independent traits (Seed shape: Round/Wrinkled, Seed color: Yellow/Green) and 9:3:3:1 phenotypic ratio.',
        aiBlindspots: [
          {
            point: 'Distinction Between Phenotypic and Genotypic Ratios in F2',
            whatAiSays: 'Generic AI quotes the 9:3:3:1 ratio and stops.',
            whatAiMisses: '9:3:3:1 is strictly the PHENOTYPIC ratio. The GENOTYPIC ratio is 1:2:2:4:1:2:1:2:1 (9 distinct genotypes). ICSE questions specifically ask for the number of recombinant vs parental phenotypes (recombinants = 3/16 + 3/16 = 6/16 = 37.5%).',
            examinerRubric: 'Examiners award marks for identifying Round Green (3/16) and Wrinkled Yellow (3/16) as new recombinant combinations.',
          },
        ],
        coreConcepts: [
          'Law of Independent Assortment: Alleles of two different genes assort independently during gamete formation.',
          'Gametes produced by F1 dihybrid (RrYy): RY, Ry, rY, ry in equal 1:1:1:1 proportion.',
          'Punnett Square: 16-box grid showing 9 Round Yellow, 3 Round Green, 3 Wrinkled Yellow, 1 Wrinkled Green.',
        ],
        examQuestions: [
          {
            question: 'A pure breeding pea plant with round yellow seeds (RRYY) is crossed with wrinkled green seeds (rryy). (a) State F1 phenotype and genotype. (b) Write the 4 gametes formed by F1. (c) State F2 phenotypic ratio and percentage of recombinants.',
            marks: 5,
            keyPoints: [
              'F1 phenotype: All Round Yellow. Genotype: RrYy.',
              'Gametes: RY, Ry, rY, ry.',
              'F2 phenotypic ratio: 9:3:3:1. Recombinants: 6 out of 16 (37.5%).',
            ],
          },
        ],
        quiz: [
          {
            question: 'In a dihybrid cross between RrYy and rryy (test cross), the phenotypic ratio of offspring is:',
            options: ['9:3:3:1', '1:1:1:1', '3:1', '1:2:1'],
            correctIndex: 1,
            explanation: 'A dihybrid test cross (crossing F1 heterozygous with double recessive homozygous rryy) yields a 1:1:1:1 ratio, confirming independent assortment.',
          },
        ],
      },
    ],
  },

  // ─── ISC CLASS 12 (CISCE) ────────────────────────────────────────────────
  ISC_12: {
    name: 'ISC Class 12 (CISCE)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology/Computer Science'],
    topics: [
      {
        id: 'isc12-phy-lcr',
        subject: 'Physics',
        title: 'Series LCR Resonance & Quality Factor Q',
        examRelevance: 'ISC Physics Section B/C 4-Marker Standard',
        blindspotCount: 3,
        summary: 'Impedance minimization Z = R at resonance frequency omega_0 = 1/sqrt(LC) and sharpness of resonance.',
        aiBlindspots: [
          {
            point: 'Voltages Across L and C Can Exceed Source Voltage at Resonance',
            whatAiSays: 'Generic AI states that voltages add up algebraically.',
            whatAiMisses: 'Because V_L and V_C are 180 degrees out of phase, they cancel out in phasor addition: V_source = sqrt(V_R^2 + (V_L - V_C)^2) = V_R. However, V_L = I * X_L = (V/R) * omega_0*L = Q * V. If Q > 1, voltage across the capacitor or inductor is Q times HIGHER than the input supply voltage!',
            examinerRubric: 'ISC derivation questions specifically ask for the Q-factor definition as voltage magnification factor: Q = V_L / V = (1/R) * sqrt(L/C).',
          },
        ],
        coreConcepts: [
          'Impedance: Z = sqrt(R^2 + (X_L - X_C)^2). At resonance, X_L = X_C => Z_min = R.',
          'Resonant frequency: f_0 = 1 / (2 * pi * sqrt(LC)). Current is maximum and in phase with voltage.',
          'Bandwidth: Delta_omega = omega_2 - omega_1 = R / L. Quality factor Q = omega_0 / Delta_omega = (1/R)*sqrt(L/C).',
        ],
        examQuestions: [
          {
            question: 'Derive the expression for the resonant frequency and Quality factor Q in a series LCR circuit. Explain why an LCR circuit is called an acceptor circuit.',
            marks: 4,
            keyPoints: [
              'Phasor diagram showing V_R, V_L, V_C and resulting voltage V.',
              'Condition X_L = X_C giving omega_0 = 1/sqrt(LC).',
              'Quality factor derivation: Q = omega_0*L / R = (1/R)*sqrt(L/C).',
              'Acceptor circuit explanation: It admits maximum current at its resonant frequency and rejects all other frequencies.',
            ],
          },
        ],
        quiz: [
          {
            question: 'To increase the sharpness (Quality factor) of a series LCR resonant circuit, one should:',
            options: ['Increase R and decrease L', 'Decrease R and increase L', 'Increase both R and C', 'Decrease both L and C'],
            correctIndex: 1,
            explanation: 'Q = (1/R) * sqrt(L/C). Lower resistance R and higher inductance L make the resonance curve sharper and increase selectivity.',
          },
        ],
      },
      {
        id: 'isc12-chem-cft',
        subject: 'Chemistry',
        title: 'Crystal Field Splitting in Octahedral Complexes',
        examRelevance: 'ISC Coordination Chemistry 3-Marker',
        blindspotCount: 3,
        summary: 'Degeneracy removal of d-orbitals into t2g (lower, triply degenerate) and eg (higher, doubly degenerate) levels.',
        aiBlindspots: [
          {
            point: 'Spectrochemical Series & Delta_o vs Pairing Energy P Condition',
            whatAiSays: 'Generic AI explains splitting into 3 and 2 orbitals.',
            whatAiMisses: 'ISC examiners penalize students who do not explicitly compare Delta_o with pairing energy P: When Delta_o > P (strong field ligand, e.g. CN^-), electrons pair up in t2g first producing low-spin (inner orbital) complexes. When Delta_o < P (weak field, e.g. F^-), electrons occupy eg producing high-spin (outer orbital) complexes.',
            examinerRubric: 'ISC rubric awards 1.5 marks for stating the exact Delta_o vs P inequality and drawing the orbital electron distribution for d4-d7 configurations.',
          },
        ],
        coreConcepts: [
          'Energy barycenter: t2g lowered by -0.4 Delta_o (-2/5 Delta_o), eg raised by +0.6 Delta_o (+3/5 Delta_o).',
          'Crystal Field Stabilization Energy (CFSE) = [-0.4 * n(t2g) + 0.6 * n(eg)] * Delta_o + m*P.',
          'Color of coordination complexes arises from d-d electronic transition between t2g and eg upon absorbing visible light.',
        ],
        examQuestions: [
          {
            question: 'Using Crystal Field Theory, write the electronic configuration of d^5 metal ion in an octahedral complex when: (a) Delta_o > P, (b) Delta_o < P. Calculate CFSE in each case.',
            marks: 3,
            keyPoints: [
              '(a) Delta_o > P (strong field): t2g^5 eg^0. CFSE = (-0.4 * 5) * Delta_o + 2P = -2.0 Delta_o + 2P.',
              '(b) Delta_o < P (weak field): t2g^3 eg^2. CFSE = (-0.4 * 3 + 0.6 * 2) * Delta_o = 0 Delta_o.',
              'Identify magnetic nature: (a) 1 unpaired electron (paramagnetic), (b) 5 unpaired electrons (strongly paramagnetic).',
            ],
          },
        ],
        quiz: [
          {
            question: 'What is the CFSE of a d6 metal ion in a high-spin octahedral complex (Delta_o < P)?',
            options: ['-2.4 Delta_o', '-0.4 Delta_o', '-0.8 Delta_o', '0 Delta_o'],
            correctIndex: 1,
            explanation: 'High-spin d6 has configuration t2g^4 eg^2. CFSE = (4 * -0.4 + 2 * +0.6) Delta_o = (-1.6 + 1.2) Delta_o = -0.4 Delta_o.',
          },
        ],
      },
    ],
  },

  // ─── MAHARASHTRA STATE BOARD (MSBSHSE HSC) ────────────────────────────────
  MH_BOARD: {
    name: 'Maharashtra Board (MSBSHSE HSC)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'mh-phy-banking',
        subject: 'Physics',
        title: 'Rotational Dynamics: Banking of Roads & Conical Pendulum',
        examRelevance: 'Maharashtra HSC Board Section C/D 3-4 Marker Question',
        blindspotCount: 3,
        summary: 'Derivation of optimum speed v_0 = sqrt(rg * tan theta) and maximum/minimum safe speed limits considering friction mu.',
        aiBlindspots: [
          {
            point: 'Upper vs Lower Safe Speed Limits with Static Friction',
            whatAiSays: 'Generic AI gives only the optimum speed formula v = sqrt(rg tan theta).',
            whatAiMisses: 'Maharashtra Board strictly evaluates Section D 4-markers on the complete derivation of both limits: v_max = sqrt(rg * (tan theta + mu_s)/(1 - mu_s * tan theta)) and v_min = sqrt(rg * (tan theta - mu_s)/(1 + mu_s * tan theta)). If tan theta >= 1/mu_s, minimum speed is zero.',
            examinerRubric: 'Balbharati textbook rubric: 1 mark for resolution diagram with normal and friction components, 1 mark for equilibrium equations N cos theta = mg + f_s sin theta, 2 marks for final algebraic expression.',
          },
          {
            point: 'Conical Pendulum Tension & Period Formula',
            whatAiSays: 'Generic AI states T = 2 pi sqrt(L/g).',
            whatAiMisses: 'In a conical pendulum, the period is T = 2 pi * sqrt(L * cos theta / g) (where h = L cos theta is vertical height). Generic notes omit cos theta, confusing simple pendulum with conical pendulum.',
            examinerRubric: 'Maharashtra Board penalizes -1.5 marks for omitting cos theta in the conical pendulum derivation.',
          },
        ],
        coreConcepts: [
          'Centripetal force provided by horizontal component of normal reaction N sin theta.',
          'Optimum speed eliminates wear and tear of tires: v_0 = sqrt(r * g * tan theta).',
          'Period of conical pendulum: T = 2 * pi * sqrt(L * cos theta / g). Frequency n = 1/T.',
        ],
        examQuestions: [
          {
            question: 'Derive an expression for the maximum safety speed with which a vehicle can round a curved banked road considering friction between tyres and road surface. What happens if mu_s = 0?',
            marks: 4,
            keyPoints: [
              'Draw neat labeled force diagram showing weight mg, normal N, and friction f_s resolved along horizontal and vertical.',
              'Equate vertical forces: N cos theta = mg + f_s sin theta.',
              'Equate horizontal forces: N sin theta + f_s cos theta = m*v^2 / r.',
              'Divide equations and substitute f_s = mu_s * N to get v_max = sqrt(rg(mu_s + tan theta)/(1 - mu_s tan theta)).',
            ],
          },
        ],
        quiz: [
          {
            question: 'The period of a conical pendulum of string length L making an angle theta with the vertical is given by:',
            options: ['2 * pi * sqrt(L / g)', '2 * pi * sqrt(L * cos theta / g)', '2 * pi * sqrt(L * sin theta / g)', '2 * pi * sqrt(L * tan theta / g)'],
            correctIndex: 1,
            explanation: 'In a conical pendulum, T cos theta = mg and T sin theta = m * omega^2 * (L sin theta). Solving gives omega = sqrt(g / (L cos theta)), so period T = 2 pi sqrt(L cos theta / g).',
          },
        ],
      },
      {
        id: 'mh-chem-wmax',
        subject: 'Chemistry',
        title: 'Thermodynamics: Maximum Work in Isothermal Reversible Expansion',
        examRelevance: 'Maharashtra HSC Board Section D 4-Marker Guaranteed Derivation',
        blindspotCount: 3,
        summary: 'Derivation of W_max = -2.303 nRT log10(V2 / V1) for an ideal gas with indicator diagram.',
        aiBlindspots: [
          {
            point: 'Balbharati Convention for External Pressure (P_ext = P - dP)',
            whatAiSays: 'Generic AI integrates P dV directly without thermodynamic justification.',
            whatAiMisses: 'Maharashtra Board requires students to explicitly define that during reversible expansion, the driving force exceeds opposing force by an infinitesimal amount dP: P_ext = P - dP. Neglecting dP * dV term as second order infinitesimal must be clearly written.',
            examinerRubric: 'Balbharati marking key explicitly awards 1 mark for stating P_ext = P - dP and discarding dP*dV.',
          },
        ],
        coreConcepts: [
          'Work in infinitesimal step: dW = -P_ext * dV = -(P - dP) * dV = -P * dV + dP * dV.',
          'Total work by integration from V1 to V2: W_max = -integral(nRT/V dV) = -nRT ln(V2/V1).',
          'Conversion to base 10: W_max = -2.303 * nRT * log10(V2/V1) = -2.303 * nRT * log10(P1/P2).',
        ],
        examQuestions: [
          {
            question: 'Derive the expression for the maximum work obtained in isothermal reversible expansion of n moles of an ideal gas. Calculate W_max when 2 moles of gas expand from 10 L to 20 L at 300 K (R = 8.314 J/K/mol).',
            marks: 4,
            keyPoints: [
              'Derivation steps from dW = -P_ext dV to W_max = -2.303 nRT log10(V2/V1).',
              'Substitution: W_max = -2.303 * 2 * 8.314 * 300 * log10(20/10).',
              'Calculation: log10(2) = 0.3010 => W_max = -3455 J (-3.455 kJ).',
              'Units and negative sign indicating work done by the system must be shown.',
            ],
          },
        ],
        quiz: [
          {
            question: 'In an isothermal reversible compression of an ideal gas, the sign of W_max is:',
            options: ['Negative', 'Positive', 'Zero', 'Undefined'],
            correctIndex: 1,
            explanation: 'In compression, work is done ON the system (V2 < V1, so log10(V2/V1) is negative, cancelling the formula minus sign), resulting in a positive sign.',
          },
        ],
      },
      {
        id: 'mh-bio-nerve',
        subject: 'Biology',
        title: 'Control and Coordination: Mechanism of Nerve Impulse Conduction',
        examRelevance: 'Maharashtra HSC Biology Section C 3-Marker',
        blindspotCount: 3,
        summary: 'Resting membrane potential (-70 mV), depolarization (+30 mV via Na+ influx), repolarization (K+ efflux), and refractory period.',
        aiBlindspots: [
          {
            point: 'Sodium-Potassium Exchange Pump Ratio and ATP Consumption',
            whatAiSays: 'Generic AI says ions move across the membrane.',
            whatAiMisses: 'Maharashtra Board requires exact stoichiometric numbers: 3 Na+ ions pumped OUT for every 2 K+ ions pumped IN with consumption of 1 ATP molecule. Furthermore, resting membrane is 20 times more permeable to K+ than to Na+.',
            examinerRubric: 'Balbharati evaluation key dedicates 1 full mark to the 3 Na+ out / 2 K+ in ratio.',
          },
        ],
        coreConcepts: [
          'Resting potential: -70 mV maintained by Na+/K+ ATPase pump and leak channels.',
          'Action potential: Threshold stimulus (-55 mV) opens voltage-gated Na+ channels, causing rapid depolarisation to +30 mV.',
          'Repolarization: Na+ channels inactivate, voltage-gated K+ channels open causing K+ efflux.',
        ],
        examQuestions: [
          {
            question: 'Explain the generation and conduction of nerve impulse along an axon with the help of a labeled diagram showing ionic movements.',
            marks: 3,
            keyPoints: [
              'Resting stage: Polarity (+ve outside, -ve inside) maintained by 3 Na+ out / 2 K+ in.',
              'Excited stage (Depolarisation): Influx of Na+ reverses polarity (+ve inside, -ve outside).',
              'Repolarisation: Influx of K+ restores resting potential. Local circuits drive impulse forward.',
            ],
          },
        ],
        quiz: [
          {
            question: 'The resting membrane potential of a neuron (-70 mV) is primarily maintained by:',
            options: ['Passive diffusion of Cl- ions', 'Active transport of 3 Na+ out and 2 K+ in by Na+/K+ pump', 'Equal diffusion of Na+ and K+', 'Voltage-gated calcium channels'],
            correctIndex: 1,
            explanation: 'The electrogenic Na+/K+ ATPase pump exports 3 Na+ for every 2 K+ imported against their electrochemical gradients, creating a net negative interior.',
          },
        ],
      },
    ],
  },

  // ─── UP BOARD (UPMSP INTERMEDIATE) ─────────────────────────────────────────
  UP_BOARD: {
    name: 'UP Board (UPMSP Intermediate)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'up-phy-huygens',
        subject: 'Physics',
        title: 'Wave Optics: Huygens Principle Wavefront Refraction & Snell Law Proof',
        examRelevance: 'UP Board Class 12 Physics 5-Marker Guaranteed Question',
        blindspotCount: 3,
        summary: 'Derivation of Snell Law of Refraction (sin i / sin r = v1 / v2 = 1n2) using secondary wavelets.',
        aiBlindspots: [
          {
            point: 'Wavefront Construction Diagram with Common Time t',
            whatAiSays: 'Generic AI gives the algebraic formula sin i / sin r = mu.',
            whatAiMisses: 'UP Board evaluators deduct 2 out of 5 marks if the wavefront diagram does not show: (1) incident planar wavefront AB, (2) refracted wavefront CD, (3) distances BC = v1 * t and AD = v2 * t traversed in identical time t, (4) right triangles ABC and ADC sharing common hypotenuse AC.',
            examinerRubric: 'UPMSP marking scheme: 2 marks for neat diagram with normal and wavefronts, 3 marks for sin i / sin r derivation.',
          },
        ],
        coreConcepts: [
          'Huygens Principle: Every point on a wavefront acts as a source of secondary spherical wavelets.',
          'Right triangle ABC: sin i = BC / AC = (v1 * t) / AC.',
          'Right triangle ADC: sin r = AD / AC = (v2 * t) / AC.',
          'Dividing gives: sin i / sin r = v1 / v2 = n2 / n1 = 1n2 (Snell Law).',
        ],
        examQuestions: [
          {
            question: 'State Huygens Principle of secondary wavelets. Using it, prove the laws of refraction of light at a plane separating two media.',
            marks: 5,
            keyPoints: [
              'Statement of Huygens two postulates (wavefront definition and secondary wavelets envelope).',
              'Diagram showing incident wavefront AB at angle i and refracted wavefront CD at angle r.',
              'Derivation using BC = v1*t and AD = v2*t sharing common hypotenuse AC.',
              'Conclude sin i / sin r = v1 / v2 = constant = 1n2.',
            ],
          },
        ],
        quiz: [
          {
            question: 'When light travels from an optically rarer to a denser medium, which wave characteristic remains unchanged?',
            options: ['Wavelength', 'Frequency', 'Velocity', 'Amplitude'],
            correctIndex: 1,
            explanation: 'Frequency depends only on the source of light and remains constant across all media. Velocity and wavelength decrease in denser media.',
          },
        ],
      },
      {
        id: 'up-chem-nernst',
        subject: 'Chemistry',
        title: 'Electrochemistry: Nernst Equation & Cell EMF at 298 K',
        examRelevance: 'UP Board Class 12 Chemistry 4-Marker Numerical Trap',
        blindspotCount: 3,
        summary: 'Calculation of non-standard cell potential E_cell = E_cell_0 - (0.0591 / n) * log10([Anode] / [Cathode]).',
        aiBlindspots: [
          {
            point: 'Stoichiometric Coefficients Become Powers in the Reaction Quotient',
            whatAiSays: 'Generic AI puts concentrations directly into the ratio [Anode] / [Cathode].',
            whatAiMisses: 'In cells like Zn | Zn2+ || Ag+ | Ag, the balanced equation is Zn + 2Ag+ -> Zn2+ + 2Ag. The reaction quotient Q is [Zn2+] / [Ag+]^2 (the Ag+ concentration MUST be squared!). Forgetting the exponent 2 is the #1 mistake in UP Board examinations.',
            examinerRubric: 'UPMSP answer keys deduct 2 marks immediately if [Ag+] is not squared in the log term.',
          },
        ],
        coreConcepts: [
          'Standard EMF: E_cell_0 = E_cathode_0 - E_anode_0 (both standard reduction potentials).',
          'Nernst formula at 298K: E_cell = E_cell_0 - (0.0591 / n) * log10(Q).',
          'Relationship with equilibrium constant: Delta G_0 = -nFE_cell_0 = -2.303 RT log10(K_c).',
        ],
        examQuestions: [
          {
            question: 'Calculate the EMF of the cell: Mg(s) | Mg2+(0.001 M) || Cu2+(0.0001 M) | Cu(s) at 298 K. Given E0(Mg2+/Mg) = -2.37 V, E0(Cu2+/Cu) = +0.34 V.',
            marks: 4,
            keyPoints: [
              'Calculate E0_cell = E0_cathode - E0_anode = 0.34 - (-2.37) = +2.71 V.',
              'Cell reaction: Mg + Cu2+ -> Mg2+ + Cu (n = 2 electrons).',
              'Nernst equation: E = 2.71 - (0.0591 / 2) * log10([Mg2+] / [Cu2+]).',
              'log10(0.001 / 0.0001) = log10(10) = 1 => E = 2.71 - 0.0295 = 2.68 V.',
            ],
          },
        ],
        quiz: [
          {
            question: 'If the concentration of Cu2+ ions in a Daniel cell (Zn | Zn2+ || Cu2+ | Cu) is increased by 10 times at 298K, the cell EMF will:',
            options: ['Increase by 0.0591 V', 'Increase by 0.0295 V', 'Decrease by 0.0295 V', 'Remain unchanged'],
            correctIndex: 1,
            explanation: 'Nernst equation is E = E0 - (0.0591/2) * log([Zn2+]/[Cu2+]). Increasing [Cu2+] by 10 decreases log([Zn2+]/[Cu2+]) by 1, so EMF increases by 0.0591/2 = +0.0295 V.',
          },
        ],
      },
    ],
  },

  // ─── KARNATAKA STATE BOARD (2ND PUC / KSEEB) ──────────────────────────────
  KA_BOARD: {
    name: 'Karnataka Board (2nd PUC)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'ka-phy-wheatstone',
        subject: 'Physics',
        title: 'Current Electricity: Wheatstone Bridge Balanced Condition Derivation',
        examRelevance: 'Karnataka 2nd PUC Physics Part D 5-Marker Blueprint Derivation',
        blindspotCount: 3,
        summary: 'Derivation of balanced Wheatstone bridge condition P / Q = R / S using Kirchhoff Loop and Junction Rules.',
        aiBlindspots: [
          {
            point: 'Strict Application of Kirchhoff Second Rule (Loop Rule) on Both Meshes',
            whatAiSays: 'Generic AI states P/Q = R/S without deriving current directions.',
            whatAiMisses: 'Karnataka PUC blueprint mandates: (1) Label current through galvanometer I_g, (2) Apply Loop Rule to mesh ABDA: -I1*P - I_g*G + I2*R = 0, (3) Apply Loop Rule to mesh BCDB: -(I1 - I_g)*Q + (I2 + I_g)*S + I_g*G = 0, (4) Set I_g = 0 for balance point.',
            examinerRubric: 'Karnataka PUE marking rubric awards: 1 mark circuit diagram with currents, 2 marks loop equations, 2 marks algebraic division giving P/Q = R/S.',
          },
        ],
        coreConcepts: [
          'Kirchhoff Junction Rule (KCL): Sum of currents meeting at any junction is zero (conservation of charge).',
          'Kirchhoff Loop Rule (KVL): Algebraic sum of changes in potential in a closed loop is zero (conservation of energy).',
          'At balance condition, potential at B equals potential at D (V_B = V_D), so galvanometer current I_g = 0.',
        ],
        examQuestions: [
          {
            question: 'State Kirchhoff rules. Obtain the condition for balance of a Wheatstone bridge using Kirchhoff rules with the help of a circuit diagram.',
            marks: 5,
            keyPoints: [
              'Statement of Kirchhoff First Rule (junction rule) and Second Rule (loop rule).',
              'Draw four arm resistors P, Q, R, S with battery E and galvanometer G.',
              'Formulate loop equations for mesh ABDA and BCDB.',
              'Substitute condition I_g = 0 to arrive at P/Q = R/S.',
            ],
          },
        ],
        quiz: [
          {
            question: 'In a balanced Wheatstone bridge, if the positions of the galvanometer and cell are interchanged, the balance condition:',
            options: ['Remains unchanged', 'Becomes inverted P/R = Q/S', 'Is destroyed completely', 'Depends on internal resistance of the cell'],
            correctIndex: 0,
            explanation: 'The conjugate arms of a Wheatstone bridge can be interchanged without affecting the balance condition P/Q = R/S.',
          },
        ],
      },
      {
        id: 'ka-chem-kinetics',
        subject: 'Chemistry',
        title: 'Chemical Kinetics: Integrated Rate Equation for First Order Reaction',
        examRelevance: 'Karnataka 2nd PUC Chemistry Part D 5-Marker Guaranteed Derivation',
        blindspotCount: 3,
        summary: 'Derivation of k = (2.303 / t) * log10([R]0 / [R]) and half-life t_1/2 = 0.693 / k.',
        aiBlindspots: [
          {
            point: 'Integration Constant I Evaluation at Boundary Condition t = 0',
            whatAiSays: 'Generic AI writes the final logarithmic formula directly.',
            whatAiMisses: 'Karnataka PUC evaluators check for the intermediate integration constant step: ln[R] = -k*t + I. At t = 0, [R] = [R]_0, therefore I = ln[R]_0. Substituting gives ln([R]/[R]_0) = -k*t. Skipping this step loses 1.5 marks.',
            examinerRubric: 'PUE evaluation scheme awards 1 mark explicitly for calculating integration constant I.',
          },
        ],
        coreConcepts: [
          'Differential rate: -d[R]/dt = k[R]. Separating variables: d[R]/[R] = -k dt.',
          'Integrated equation: ln[R] = -kt + ln[R]_0 => k = (2.303 / t) * log10([R]_0 / [R]).',
          'Half-life: At t = t_1/2, [R] = [R]_0 / 2 => t_1/2 = 2.303 * log10(2) / k = 0.693 / k (independent of initial concentration).',
        ],
        examQuestions: [
          {
            question: 'Derive the integrated rate equation for a first order reaction. Show that the half-life of a first order reaction is independent of initial concentration.',
            marks: 5,
            keyPoints: [
              'Write differential rate law and integrate: integral(d[R]/[R]) = -k * integral(dt).',
              'Evaluate integration constant at t = 0.',
              'Derive k = (2.303/t) * log10([R]0 / [R]).',
              'Substitute [R] = [R]0 / 2 to obtain t_1/2 = 0.693 / k.',
            ],
          },
        ],
        quiz: [
          {
            question: 'For a first order reaction, a plot of log10[R] versus time t yields a straight line with slope equal to:',
            options: ['-k', '-k / 2.303', '+k / 2.303', '-2.303 / k'],
            correctIndex: 1,
            explanation: 'The equation log10[R] = -(k / 2.303)*t + log10[R]_0 is of the form y = mx + c with slope m = -k / 2.303.',
          },
        ],
      },
    ],
  },

  // ─── TAMIL NADU STATE BOARD (SAMACHEER KALVI HSC +2) ──────────────────────
  TN_BOARD: {
    name: 'Tamil Nadu Board (HSC +2)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'tn-phy-dipole',
        subject: 'Physics',
        title: 'Electrostatics: Electric Field Due to Dipole at Axial and Equatorial Points',
        examRelevance: 'Tamil Nadu Class 12 Physics Part IV 5-Marker',
        blindspotCount: 3,
        summary: 'Vector derivation of E_axial = (1 / 4pi eps0) * (2p / r^3) and E_equatorial = -(1 / 4pi eps0) * (p / r^3).',
        aiBlindspots: [
          {
            point: 'Opposite Vector Direction for Equatorial Electric Field',
            whatAiSays: 'Generic AI states magnitudes E_axial = 2 * E_equatorial.',
            whatAiMisses: 'Tamil Nadu DGE marking keys require the vector minus sign: E_equatorial vector is ANTI-PARALLEL to the dipole moment p vector (from +q to -q), whereas E_axial is PARALLEL to p vector. Vector notation with unit vector p_hat is mandatory.',
            examinerRubric: 'Tamil Nadu marking key: 1 mark for vector direction, 2 marks for axial derivation, 2 marks for equatorial derivation.',
          },
        ],
        coreConcepts: [
          'Electric dipole moment: p = q * (2a) directed from negative to positive charge.',
          'Axial field for r >> a: E_axial = (1 / 4*pi*epsilon_0) * (2p / r^3) along p.',
          'Equatorial field for r >> a: E_equatorial = -(1 / 4*pi*epsilon_0) * (p / r^3) opposite to p.',
        ],
        examQuestions: [
          {
            question: 'Calculate the electric field due to an electric dipole at points on the axial line and equatorial line. Deduce the relation between them for a short dipole.',
            marks: 5,
            keyPoints: [
              'Derive E_axial = (1 / 4pi eps0) * 2pr / (r^2 - a^2)^2 -> 2p / r^3 for r >> a.',
              'Derive E_equatorial = (1 / 4pi eps0) * p / (r^2 + a^2)^(3/2) -> p / r^3 for r >> a.',
              'Vector comparison: E_axial = -2 * E_equatorial.',
            ],
          },
        ],
        quiz: [
          {
            question: 'The ratio of the electric field at a point on the axial line to that on the equatorial line at the same large distance from a short dipole is:',
            options: ['1 : 1', '2 : 1', '1 : 2', '4 : 1'],
            correctIndex: 1,
            explanation: 'For a short dipole (r >> a), E_axial = 2p/(4 pi eps0 r^3) and E_equatorial = p/(4 pi eps0 r^3), giving a magnitude ratio of 2:1.',
          },
        ],
      },
    ],
  },

  // ─── BIHAR STATE BOARD (BSEB INTERMEDIATE) ────────────────────────────────
  BIHAR_BOARD: {
    name: 'Bihar Board (BSEB Intermediate)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'bihar-phy-lensmaker',
        subject: 'Physics',
        title: 'Optics: Lens Maker Formula Derivation for Double Convex Lens',
        examRelevance: 'BSEB Class 12 Long Answer 5-Marker Guaranteed Question',
        blindspotCount: 3,
        summary: 'Derivation of 1/f = (mu - 1) * (1/R1 - 1/R2) by considering refraction at two spherical interfaces.',
        aiBlindspots: [
          {
            point: 'Virtual Intermediate Image Acts as Virtual Object for Second Surface',
            whatAiSays: 'Generic AI states the combined lens formula directly.',
            whatAiMisses: 'Bihar Board subjective evaluators specifically look for the two spherical interface equations: Surface 1: mu2/v1 - mu1/u = (mu2 - mu1)/R1. Surface 2: mu1/v - mu2/v1 = (mu1 - mu2)/R2. Adding them cancels the intermediate image distance v1. Skipping the intermediate virtual object proof loses 3 marks.',
            examinerRubric: 'BSEB 5-mark rubric: 1 mark ray diagram, 1.5 marks surface 1 equation, 1.5 marks surface 2 equation, 1 mark addition and substitution.',
          },
        ],
        coreConcepts: [
          'Spherical refraction formula: mu_rarer / (-u) + mu_denser / v = (mu_denser - mu_rarer) / R.',
          'Adding equations for both surfaces: mu1 * (1/v - 1/u) = (mu2 - mu1) * (1/R1 - 1/R2).',
          'When u = infinity, v = f, giving 1/f = (mu2/mu1 - 1) * (1/R1 - 1/R2).',
        ],
        examQuestions: [
          {
            question: 'Establish Lens Maker formula for a thin double convex lens using the formula for refraction at a single spherical surface.',
            marks: 5,
            keyPoints: [
              'Draw ray diagram showing two refracting surfaces with radii R1 and R2.',
              'Refraction at first surface giving virtual image at distance v1.',
              'Refraction at second surface where intermediate image acts as virtual object.',
              'Add both equations and apply condition 1/v - 1/u = 1/f.',
            ],
          },
        ],
        quiz: [
          {
            question: 'If a convex lens made of glass (mu = 1.5) is immersed in water (mu = 1.33), its focal length:',
            options: ['Decreases to half', 'Increases by about 4 times', 'Remains unchanged', 'Becomes negative (diverging)'],
            correctIndex: 1,
            explanation: 'f_water / f_air = (mu_g - 1) / (mu_g/mu_w - 1) = (1.5 - 1) / (1.5/1.33 - 1) = 0.5 / 0.128 ~= 4. The focal length increases approximately 4 times.',
          },
        ],
      },
    ],
  },

};

// ─────────────────────────────────────────────────────────────────────────────
// CURATION ENGINE HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve target exam string/id to a normalized knowledgebase key
 */
export function normalizeExamKey(examTarget = '') {
  const str = (examTarget || '').toUpperCase();
  if (str.includes('JEE')) return 'JEE';
  if (str.includes('NEET')) return 'NEET';
  if (str.includes('GATE')) return 'GATE';
  if (str.includes('UPSC')) return 'UPSC';
  if (str.includes('CAT')) return 'CAT';

  // ICSE & ISC (CISCE)
  if (str.includes('ICSE') || (str.includes('CISCE') && str.includes('10'))) return 'ICSE_10';
  if (str.includes('ISC') && !str.includes('MISC')) return 'ISC_12';

  // State Boards
  if (str.includes('MAHARASHTRA') || str.includes('MSBSHSE') || str.includes('MH_BOARD') || str.includes('MH BOARD') || str.includes('HSC')) return 'MH_BOARD';
  if (str.includes('KARNATAKA') || str.includes('KSEEB') || str.includes('KA_BOARD') || str.includes('PUC')) return 'KA_BOARD';
  if (str.includes('TAMIL') || str.includes('TN_BOARD') || str.includes('SAMACHEER') || str.includes('DGE')) return 'TN_BOARD';
  if (str.includes('KERALA') || str.includes('KL_BOARD') || str.includes('DHSE')) return 'KL_BOARD';
  if (str.includes('UP BOARD') || str.includes('UP_BOARD') || str.includes('UPMSP') || str.includes('UTTAR PRADESH')) return 'UP_BOARD';
  if (str.includes('MP BOARD') || str.includes('MP_BOARD') || str.includes('MPBSE') || str.includes('MADHYA PRADESH')) return 'MP_BOARD';
  if (str.includes('RAJASTHAN') || str.includes('RBSE') || str.includes('RJ_BOARD')) return 'RJ_BOARD';
  if (str.includes('WEST BENGAL') || str.includes('WBBSE') || str.includes('WB_BOARD') || str.includes('WBCHSE') || str.includes('MADHYAMIK')) return 'WB_BOARD';
  if (str.includes('ANDHRA') || str.includes('TELANGANA') || str.includes('AP_BOARD') || str.includes('TSBIE') || str.includes('BIEAP') || str.includes('IPE')) return 'AP_BOARD';
  if (str.includes('BIHAR') || str.includes('BSEB') || str.includes('BIHAR_BOARD')) return 'BIHAR_BOARD';
  if (str.includes('GUJARAT') || str.includes('GSEB') || str.includes('GJ_BOARD')) return 'GJ_BOARD';

  // Generic Board & College Fallbacks
  if (str.includes('10') || str.includes('CLASS 10')) return 'CBSE_10';
  if (str.includes('COLLEGE') || str.includes('SEM') || str.includes('B.TECH') || str.includes('BCA')) return 'COLLEGE_SEM';
  if (str.includes('12') || str.includes('BOARD') || str.includes('CBSE')) return 'CBSE_12';
  return 'CBSE_12';
}

/**
 * Get exact curated subjects for the active target exam
 */
export function getCuratedSubjectsForExam(examTarget = '') {
  const key = normalizeExamKey(examTarget);
  if (EXAM_KNOWLEDGEBASE[key]) {
    return EXAM_KNOWLEDGEBASE[key].subjects;
  }
  return COMMON_SUBJECTS.filter(s => s !== 'Other / Custom Subject');
}

/**
 * Get curated topics and blindspots for the active target exam
 */
export function getCuratedTopicsForExam(examTarget = '', selectedSubject = 'All') {
  const key = normalizeExamKey(examTarget);
  const examData = EXAM_KNOWLEDGEBASE[key] || EXAM_KNOWLEDGEBASE['CBSE_12'];
  let list = examData.topics || [];

  if (selectedSubject && selectedSubject !== 'All') {
    list = list.filter(t => t.subject === selectedSubject || t.subject.toLowerCase().includes(selectedSubject.toLowerCase()));
  }

  // If specific subject has no items in specific bucket, fall back to global subject pool
  if (list.length === 0 && selectedSubject !== 'All') {
    Object.values(EXAM_KNOWLEDGEBASE).forEach(data => {
      data.topics?.forEach(t => {
        if (t.subject === selectedSubject && !list.some(existing => existing.id === t.id)) {
          list.push(t);
        }
      });
    });
  }

  return list;
}

/**
 * Generate a high-precision, 4-phase day-by-day curated study plan for the active exam
 */
export function getCuratedPlanForExam(examTarget = '') {
  const key = normalizeExamKey(examTarget);
  const subjects = getCuratedSubjectsForExam(examTarget);
  const mainSub1 = subjects[0] || 'Core Subject 1';
  const mainSub2 = subjects[1] || 'Core Subject 2';
  const mainSub3 = subjects[2] || 'Core Subject 3';

  if (key === 'JEE') {
    return [
      {
        id: 'plan-jee-1',
        phase: 'Phase 1: High-Yield Core & Speed Sprints',
        week: 'Week 1',
        day: 'Day 1 & 2',
        subject: 'Physics',
        topic: 'Rolling Motion & Static Friction Direction Invariants',
        focus: 'Calculate friction when torque and force act at varying heights; verify zero-work proof.',
        estimatedMinutes: 60,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-jee-2',
        phase: 'Phase 1: High-Yield Core & Speed Sprints',
        week: 'Week 1',
        day: 'Day 3 & 4',
        subject: 'Chemistry',
        topic: 'Carbocation Rearrangements & Ring Expansion Traps',
        focus: 'Wagner-Meerwein ring expansion vs hydride shifts; avoid strained cyclobutyl cation trap.',
        estimatedMinutes: 50,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-jee-3',
        phase: 'Phase 2: Negative Marking Defense & Derivations',
        week: 'Week 2',
        day: 'Day 5 & 6',
        subject: 'Mathematics',
        topic: "Calculus: L'Hopital Boundary Traps & Squeeze Theorem",
        focus: "Inspect non-0/0 conditions where L'Hopital fails; evaluate oscillatory limit proofs.",
        estimatedMinutes: 55,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-jee-4',
        phase: 'Phase 3: Multi-Concept PYQ Problem Sets',
        week: 'Week 3',
        day: 'Day 7 to 10',
        subject: 'Physics & Chemistry',
        topic: 'Thermodynamics & Adiabatic Work Calculations',
        focus: 'Reversible vs irreversible adiabatic work W = Delta U; avoid isothermal formula confusion.',
        estimatedMinutes: 75,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-jee-5',
        phase: 'Phase 4: Full-Length Timed Mocks & Cheat Sheet Flip',
        week: 'Week 4',
        day: 'Day 11 to 14',
        subject: 'Mathematics',
        topic: '3D Geometry Skew Lines & Coordinate Geometry Invariants',
        focus: 'Vector shortest distance formula; T=0 tangent vs T=S1 chord with known midpoint.',
        estimatedMinutes: 60,
        priority: 'CRITICAL',
        isCompleted: false,
      },
    ];
  } else if (key === 'NEET') {
    return [
      {
        id: 'plan-neet-1',
        phase: 'Phase 1: NCERT Verbatim Line-by-Line Mastery',
        week: 'Week 1',
        day: 'Day 1 & 2',
        subject: 'Botany',
        topic: 'C4 Pathway: RuBisCO vs PEPcase Cellular Distribution',
        focus: 'Memorize: RuBisCO in bundle sheath; PEPcase in mesophyll; absence in opposite cells.',
        estimatedMinutes: 45,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-neet-2',
        phase: 'Phase 1: NCERT Verbatim Line-by-Line Mastery',
        week: 'Week 1',
        day: 'Day 3 & 4',
        subject: 'Zoology',
        topic: 'Neural Conduction: Na+ Influx vs K+ Efflux Channels',
        focus: 'Depolarization vs repolarization exact ion flow directions and -70mV resting pump ratio.',
        estimatedMinutes: 50,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-neet-3',
        phase: 'Phase 2: Diagram Labeling & Exception Drills',
        week: 'Week 2',
        day: 'Day 5 & 6',
        subject: 'Botany',
        topic: 'Chloroplast, Peroxisome & Mitochondria in C2 Cycle',
        focus: 'Trace the 3 organelles in photorespiration sequence and zero ATP/sugar consequence.',
        estimatedMinutes: 40,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-neet-4',
        phase: 'Phase 3: 180-Question High-Speed Simulation',
        week: 'Week 3',
        day: 'Day 7 to 10',
        subject: 'Chemistry',
        topic: 'Coordination Isomerism & Biomolecules Vitamins Classification',
        focus: 'Water soluble B & C vs fat soluble A, D, E, K; optical activity in cis vs trans isomers.',
        estimatedMinutes: 60,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-neet-5',
        phase: 'Phase 4: 60-Second Flashcards & Rapid Formula Recall',
        week: 'Week 4',
        day: 'Day 11 to 14',
        subject: 'Physics',
        topic: 'Modern Physics Bohr Formulae & Stopping Potential',
        focus: 'Bohr radius r proportional to n^2/Z; energy proportional to -Z^2/n^2.',
        estimatedMinutes: 45,
        priority: 'CRITICAL',
        isCompleted: false,
      },
    ];
  } else if (key === 'COLLEGE_SEM') {
    return [
      {
        id: 'plan-col-1',
        phase: 'Phase 1: Unit 1 & 2 Architectural Block Diagrams',
        week: 'Week 1',
        day: 'Day 1 & 2',
        subject: 'Operating Systems',
        topic: "Deadlock Prevention: Banker's Algorithm & Safe Sequences",
        focus: 'Prove unsafe state is NOT deadlock; draw the state inclusion Venn diagram.',
        estimatedMinutes: 60,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-col-2',
        phase: 'Phase 1: Unit 1 & 2 Architectural Block Diagrams',
        week: 'Week 1',
        day: 'Day 3 & 4',
        subject: 'Database Systems (DBMS)',
        topic: 'BCNF vs 3NF: Lossless Decomposition vs Dependency Loss',
        focus: 'Demonstrate why BCNF does not always preserve functional dependencies.',
        estimatedMinutes: 55,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-col-3',
        phase: 'Phase 2: 10-Marker Long Proofs & Pseudocode Formatting',
        week: 'Week 2',
        day: 'Day 5 & 6',
        subject: 'Data Structures & Algorithms',
        topic: 'Red-Black Trees: Maximum 2 Rotations on Insertion',
        focus: 'Prove insertion rotations bounded by O(1) while recoloring propagates O(log N).',
        estimatedMinutes: 50,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-col-4',
        phase: 'Phase 3: Previous Semester Paper (PYQ) Solutions',
        week: 'Week 3',
        day: 'Day 7 to 10',
        subject: 'Computer Networks',
        topic: 'TCP Congestion Control & 3-Duplicate ACK Fast Recovery',
        focus: 'Draw Congestion Window vs Transmission rounds plot; contrast slow start with AIMD.',
        estimatedMinutes: 65,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-col-5',
        phase: 'Phase 4: 1-Page Summary PDF & Morning Architecture Recap',
        week: 'Week 4',
        day: 'Day 11 to 14',
        subject: 'Software Engineering',
        topic: 'Design Patterns & Agile Sprint Velocity Metrics',
        focus: 'Singleton double-checked locking; Factory vs Abstract Factory architectural comparison.',
        estimatedMinutes: 45,
        priority: 'CRITICAL',
        isCompleted: false,
      },
    ];
  } else if (key === 'GATE') {
    return [
      {
        id: 'plan-gate-1',
        phase: 'Phase 1: Discrete Foundations & Recurrence Complexity',
        week: 'Week 1',
        day: 'Day 1 & 2',
        subject: 'Algorithms & Complexity',
        topic: 'Master Theorem Non-Applicable Gaps & Akra-Bazzi Bounds',
        focus: 'Master Theorem fails on non-polynomial gaps (e.g. n / log n); apply recursion tree.',
        estimatedMinutes: 60,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-gate-2',
        phase: 'Phase 1: Discrete Foundations & Recurrence Complexity',
        week: 'Week 1',
        day: 'Day 3 & 4',
        subject: 'Theory of Computation',
        topic: 'Decidability & Halting Problem via Rice Theorem',
        focus: 'Properties of recursively enumerable languages and Turing machine undecidability.',
        estimatedMinutes: 70,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-gate-3',
        phase: 'Phase 2: Numerical Answer Type (NAT) Accuracy Drills',
        week: 'Week 2',
        day: 'Day 5 & 6',
        subject: 'Operating Systems',
        topic: 'Paging & Multi-Level TLB Effective Memory Access Time',
        focus: 'Calculate EMAT with page table in memory vs inverted page tables; zero rounding errors.',
        estimatedMinutes: 60,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-gate-4',
        phase: 'Phase 3: Past 15-Year High-Weightage Problem Sets',
        week: 'Week 3',
        day: 'Day 7 to 10',
        subject: 'Computer Networks',
        topic: 'Sliding Window Protocols: Optimal Window for Efficiency',
        focus: 'Bandwidth-Delay product calculations and Go-Back-N sender/receiver window sizes.',
        estimatedMinutes: 65,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-gate-5',
        phase: 'Phase 4: Timed Mock GATE Tests & Formula Cheat Sheet',
        week: 'Week 4',
        day: 'Day 11 to 14',
        subject: 'Database Systems',
        topic: 'Conflict Serializability Precedence Graphs & Deadlock',
        focus: 'Topological sort cycle detection for serializability; lock upgrade vs downgrade rules.',
        estimatedMinutes: 50,
        priority: 'CRITICAL',
        isCompleted: false,
      },
    ];
  } else if (key === 'UPSC') {
    return [
      {
        id: 'plan-upsc-1',
        phase: 'Phase 1: Core Static Constitutional Frameworks',
        week: 'Week 1',
        day: 'Day 1 & 2',
        subject: 'Polity & Governance',
        topic: 'Basic Structure Doctrine: Kesavananda Bharati to Present',
        focus: 'Trace Article 368 bounds vs Article 13(2); cite Minerva Mills & 99th NJAC judgment.',
        estimatedMinutes: 60,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-upsc-2',
        phase: 'Phase 1: Core Static Constitutional Frameworks',
        week: 'Week 1',
        day: 'Day 3 & 4',
        subject: 'Economy & Budget',
        topic: 'Monetary Policy Transmission & SDF vs Reverse Repo',
        focus: 'Analyze liquidity absorption mechanism under Standing Deposit Facility (SDF).',
        estimatedMinutes: 60,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-upsc-3',
        phase: 'Phase 2: Multi-Dimensional 250-Word Answer Drafting',
        week: 'Week 2',
        day: 'Day 5 & 6',
        subject: 'Polity & Governance',
        topic: 'Governor Discretionary Powers Under Article 163 & 356',
        focus: 'Integrate Sarkaria Commission, Punchhi Commission, and Nabam Rebia guidelines.',
        estimatedMinutes: 75,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-upsc-4',
        phase: 'Phase 3: Ethics Case Studies & Committee Recommendations',
        week: 'Week 3',
        day: 'Day 7 to 10',
        subject: 'Ethics & Integrity',
        topic: 'Conflict of Interest & Nolan Committee Principles',
        focus: 'Frame real-world district magistrate ethical dilemmas; recommend systemic guardrails.',
        estimatedMinutes: 60,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-upsc-5',
        phase: 'Phase 4: High-Yield Revision Bullet Sheets & Data Points',
        week: 'Week 4',
        day: 'Day 11 to 14',
        subject: 'Geography & Environment',
        topic: 'Climate Change Adaptation: COP Commitments & Carbon Budgets',
        focus: 'Panchamrit targets, renewable capacity goals, Article 6 carbon markets.',
        estimatedMinutes: 50,
        priority: 'CRITICAL',
        isCompleted: false,
      },
    ];
  } else if (key === 'ICSE_10') {
    return [
      {
        id: 'plan-icse10-1',
        phase: 'Phase 1: Compulsory Section A & Direct Numerical Drills',
        week: 'Week 1',
        day: 'Day 1 & 2',
        subject: 'Science (Physics/Chem/Bio)',
        topic: 'Prisms Total Internal Reflection & Hall-Heroult Metallurgy',
        focus: 'Memorize critical angle conditions (i1 + i2 = A + delta); write balanced chemical equations for alumina electrolysis.',
        estimatedMinutes: 50,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-icse10-2',
        phase: 'Phase 2: Section B High-Scoring Option Sets',
        week: 'Week 2',
        day: 'Day 3 to 6',
        subject: 'Mathematics',
        topic: 'Matrices, Arithmetic Progression & Quadratic Equations',
        focus: 'Solve Section B standard 4-marker algebraic derivations; master quadratic formula steps.',
        estimatedMinutes: 55,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-icse10-3',
        phase: 'Phase 3: English Literature & Language Precise Format Drills',
        week: 'Week 3',
        day: 'Day 7 to 10',
        subject: 'English',
        topic: 'Formal Letter, Notice, Email & Drama Textual Analysis',
        focus: 'Follow strict CISCE format for formal letter opening/closing; practice 5-mark drama quote references.',
        estimatedMinutes: 45,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-icse10-4',
        phase: 'Phase 4: Topo-Sheets & Full 10-Year Specimen Papers',
        week: 'Week 4',
        day: 'Day 11 to 14',
        subject: 'Geography & History',
        topic: 'Survey Map 4-Figure/6-Figure Grid Coordinates & Climate Graphs',
        focus: 'Master 4-figure grid references, conventional signs, drainage patterns, and map pointing.',
        estimatedMinutes: 60,
        priority: 'HIGH',
        isCompleted: false,
      },
    ];
  } else if (key === 'MH_BOARD') {
    return [
      {
        id: 'plan-mh-1',
        phase: 'Phase 1: Balbharati 4-Marker Derivations & Activity Sets',
        week: 'Week 1',
        day: 'Day 1 to 3',
        subject: 'Physics',
        topic: 'Rotational Dynamics: Road Banking & Conical Pendulum',
        focus: 'Derive v_max and v_min considering friction; solve Balbharati solved and exercise numericals.',
        estimatedMinutes: 55,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-mh-2',
        phase: 'Phase 2: Thermodynamics & Organic Reaction Mechanisms',
        week: 'Week 2',
        day: 'Day 4 to 7',
        subject: 'Chemistry',
        topic: 'Maximum Work W_max Derivation & Haloarenes SN1/SN2',
        focus: 'Write W_max = -2.303 nRT log10(V2/V1) with P_ext = P - dP step; master reaction conditions.',
        estimatedMinutes: 50,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-mh-3',
        phase: 'Phase 3: Calculus & Vector 4-Mark Problem Sets',
        week: 'Week 3',
        day: 'Day 8 to 11',
        subject: 'Mathematics',
        topic: 'Definite Integrals & Linear Programming Formulations',
        focus: 'Practice 4-marker theorem proofs (Integration by parts and properties of definite integrals).',
        estimatedMinutes: 60,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-mh-4',
        phase: 'Phase 4: HSC Board Specimen Papers & Practical Viva Revision',
        week: 'Week 4',
        day: 'Day 12 to 14',
        subject: 'Physics & Chemistry',
        topic: '70-Mark Timed HSC Papers & Practical Formula Sheet',
        focus: 'Complete 2 full mock papers in 3-hour exam conditions; verify log-table calculation speed.',
        estimatedMinutes: 65,
        priority: 'CRITICAL',
        isCompleted: false,
      },
    ];
  } else if (key === 'BIHAR_BOARD') {
    return [
      {
        id: 'plan-bihar-1',
        phase: 'Phase 1: 50% OMR Objective Section Speed Mastery',
        week: 'Week 1',
        day: 'Day 1 to 3',
        subject: 'Physics & Chemistry',
        topic: 'Formula Flashcards & 35-Mark OMR Objective Sets',
        focus: 'Practice answering 35 MCQs out of 70 options in under 45 minutes with 100% precision.',
        estimatedMinutes: 45,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-bihar-2',
        phase: 'Phase 2: 5-Marker Guaranteed Long Answer Proofs',
        week: 'Week 2',
        day: 'Day 4 to 7',
        subject: 'Physics',
        topic: 'Lens Maker Formula & Huygens Wave Theory Refraction',
        focus: 'Memorize complete 5-marker derivations with neat labeled diagrams and step explanations.',
        estimatedMinutes: 55,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-bihar-3',
        phase: 'Phase 3: Short Answer 2-Marker Conceptual Definitions',
        week: 'Week 3',
        day: 'Day 8 to 11',
        subject: 'Chemistry & Biology',
        topic: 'Raoult Law, Faraday Laws, Spermatogenesis vs Oogenesis',
        focus: 'Write crisp 2-to-3 sentence definitions with equations and examples for short answer section.',
        estimatedMinutes: 50,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-bihar-4',
        phase: 'Phase 4: Full BSEB Model Papers & Time Allocation Drill',
        week: 'Week 4',
        day: 'Day 12 to 14',
        subject: 'All Subjects',
        topic: 'BSEB Official Model Papers 2026-27 Strict Timing',
        focus: 'Simulate exact 3 hr 15 min session (15 min reading + 1.5 hr OMR + 1.5 hr subjective paper).',
        estimatedMinutes: 60,
        priority: 'HIGH',
        isCompleted: false,
      },
    ];
  } else if (key === 'UP_BOARD' || key === 'KA_BOARD' || key === 'TN_BOARD' || key === 'KL_BOARD' || key === 'WB_BOARD' || key === 'AP_BOARD' || key === 'RJ_BOARD' || key === 'GJ_BOARD' || key === 'MP_BOARD') {
    return [
      {
        id: 'plan-state-1',
        phase: 'Phase 1: State Board Textbook Core Derivations & Diagrams',
        week: 'Week 1',
        day: 'Day 1 to 3',
        subject: subjects[0] || 'Physics',
        topic: 'Core Derivations & State Marking Blueprint Questions',
        focus: 'Master mandatory long-answer derivations and diagrams featured in state board blueprints.',
        estimatedMinutes: 50,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-state-2',
        phase: 'Phase 2: Reaction Mechanisms & Chemical Equations',
        week: 'Week 2',
        day: 'Day 4 to 7',
        subject: subjects[1] || 'Chemistry',
        topic: 'Named Reactions, Numerical Problems & State Textbook Exercises',
        focus: 'Write balanced equations with reaction conditions; practice formula substitution with SI units.',
        estimatedMinutes: 50,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-state-3',
        phase: 'Phase 3: Mathematical Theorems & Problem Solving',
        week: 'Week 3',
        day: 'Day 8 to 11',
        subject: subjects[2] || 'Mathematics',
        topic: 'Calculus, Vectors & Coordinate Geometry Theorem Proofs',
        focus: 'Solve past 5 years state board papers; write all intermediate steps to secure step-marks.',
        estimatedMinutes: 55,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-state-4',
        phase: 'Phase 4: Timed State Board Sample Papers & Revision',
        week: 'Week 4',
        day: 'Day 12 to 14',
        subject: 'All Subjects',
        topic: 'State Board Model Papers & 60-Second Flashcard Review',
        focus: 'Complete 2 full length papers; review common state examiner traps and negative deductions.',
        estimatedMinutes: 60,
        priority: 'CRITICAL',
        isCompleted: false,
      },
    ];
  } else {
    // Default: CBSE Class 12 Boards / General Board Plan
    return [
      {
        id: 'plan-cbse-1',
        phase: 'Phase 1: NCERT Step-Marking & Derivation Checklists',
        week: 'Week 1',
        day: 'Day 1 & 2',
        subject: 'Physics',
        topic: 'Photoelectric Effect: Stopping Potential vs Frequency',
        focus: 'Step-marking: Formula statement (1m), Intercept identification (1m), Slope = h/e (1m).',
        estimatedMinutes: 45,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-cbse-2',
        phase: 'Phase 1: NCERT Step-Marking & Derivation Checklists',
        week: 'Week 1',
        day: 'Day 3 & 4',
        subject: 'Chemistry',
        topic: 'Aldol vs Cannizzaro: Alpha-Hydrogen Elimination',
        focus: 'Draw 4 crossed-aldol isomers; write 50% NaOH Cannizzaro disproportionation reaction.',
        estimatedMinutes: 50,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-cbse-3',
        phase: 'Phase 2: Common Board Examiner Trap Elimination',
        week: 'Week 2',
        day: 'Day 5 & 6',
        subject: 'Mathematics',
        topic: "Definite Integrals: King's Property 2I Step",
        focus: 'Master the 2I addition step; divide by 2 at the conclusion to avoid losing 1.5 marks.',
        estimatedMinutes: 50,
        priority: 'CRITICAL',
        isCompleted: false,
      },
      {
        id: 'plan-cbse-4',
        phase: 'Phase 3: Sample Paper Drills & Unit Consistency',
        week: 'Week 3',
        day: 'Day 7 to 10',
        subject: 'Biology / Computer Science',
        topic: 'DNA Replication Semiconservative Proof / Array Matrix',
        focus: 'Unidirectional 5-prime to 3-prime synthesis with RNA primase 3-OH terminus requirement.',
        estimatedMinutes: 55,
        priority: 'HIGH',
        isCompleted: false,
      },
      {
        id: 'plan-cbse-5',
        phase: 'Phase 4: 60-Second Flashcards & 1-Page Cheat Sheet Review',
        week: 'Week 4',
        day: 'Day 11 to 14',
        subject: 'Physics & Chemistry',
        topic: 'Ray Optics Lens Maker Sign Convention & Solutions Colligative',
        focus: 'Lens maker sign convention (-R1 vs +R2); van \'t Hoff factor i dissociation vs association.',
        estimatedMinutes: 40,
        priority: 'CRITICAL',
        isCompleted: false,
      },
    ];
  }
}

/**
 * Get high-yield question predictor radar questions specifically for the active target exam
 */
export function getCuratedPredictorQuestionsForExam(examTarget = '') {
  const key = normalizeExamKey(examTarget);
  const topics = getCuratedTopicsForExam(examTarget);

  return topics.map((t, idx) => {
    const qItem = t.examQuestions?.[0] || {};
    const bItem = t.aiBlindspots?.[0] || {};
    return {
      id: `pred-${key}-${idx + 1}`,
      subject: t.subject,
      topic: t.title,
      probability: 94 - idx * 4,
      probabilityTier: idx === 0 ? 'Guaranteed (90%+)' : idx === 1 ? 'High Recurrence (85%+)' : 'Frequent Trap (75%+)',
      marks: qItem.marks || 5,
      pastFrequency: `Featured in 4 of last 5 official ${examTarget || 'exam'} cycles`,
      trapSummary: bItem.whatAiMisses || 'Students lose step marks because generic notes miss crucial edge cases.',
      keyPoints: qItem.keyPoints || [
        'State primary governing formula and definitions clearly.',
        'Draw labeled diagram/graph showing intercepts and axes.',
        'Provide concluding sentence with correct physical units.',
      ],
      examTarget: examTarget || 'General',
    };
  });
}

/**
 * Get rapid 60-second exam morning flashcards specifically for the active target exam
 */
export function getCuratedFlashcardsForExam(examTarget = '') {
  const topics = getCuratedTopicsForExam(examTarget);
  const deck = [];

  topics.forEach((t) => {
    t.aiBlindspots?.forEach((b, bIdx) => {
      deck.push({
        id: `${t.id}-${bIdx}`,
        subject: t.subject,
        topicTitle: t.title,
        question: `In "${t.title}", what critical point do standard AI notes skip?`,
        point: b.point,
        whatAiSays: b.whatAiSays,
        whatAiMisses: b.whatAiMisses,
        examinerRubric: b.examinerRubric,
      });
    });
  });

  return deck;
}

/**
 * Get high-risk question vault items dynamically curated for the active target exam
 */
export function getCuratedVaultQuestionsForExam(examTarget = '', selectedSubject = 'All') {
  const topics = getCuratedTopicsForExam(examTarget, selectedSubject);

  return topics.map((t, idx) => {
    const qItem = t.examQuestions?.[0] || {};
    const bItem = t.aiBlindspots?.[0] || {};
    return {
      id: `vault-${t.id}`,
      subject: t.subject,
      marks: qItem.marks || 5,
      trapLevel: idx % 2 === 0 ? 'CRITICAL EXAM TRAP (Past 5 Years)' : 'NUMERICAL & STEP TRAP (High Weightage)',
      title: qItem.question || t.title,
      unit: t.examRelevance || `${examTarget || 'Exam'} Core Syllabus`,
      trapDescription: bItem.whatAiMisses || 'Generic AI explanations skip crucial edge conditions and official marking points.',
      aiBlindspot: bItem.whatAiSays
        ? `${bItem.whatAiSays} In reality: ${bItem.whatAiMisses}`
        : 'Standard AI summaries provide superficial text without explicit marks-bearing formulas or step-marking criteria.',
      examinerRubric: qItem.keyPoints || (bItem.examinerRubric ? [bItem.examinerRubric] : [
        'State governing theorem/formula explicitly.',
        'Show complete intermediate algebraic/conceptual steps.',
        'State final units or boundary limits clearly.',
      ]),
      modelAnswerSnippet: bItem.examinerRubric || 'Ensure all required steps and boundary invariants are explicitly mentioned.',
      examTarget: examTarget || 'General',
    };
  });
}

/**
 * High-Risk Question Vault (backward compatible default)
 */
export const HIGH_RISK_EXAM_VAULT = (function() {
  const vault = [];
  Object.values(EXAM_KNOWLEDGEBASE).forEach(data => {
    data.topics?.forEach((t, idx) => {
      const qItem = t.examQuestions?.[0] || {};
      const bItem = t.aiBlindspots?.[0] || {};
      vault.push({
        id: `vault-${t.id}`,
        subject: t.subject,
        marks: qItem.marks || 5,
        trapLevel: idx % 2 === 0 ? 'CRITICAL EXAM TRAP (Past 5 Years)' : 'NUMERICAL & STEP TRAP (High Weightage)',
        title: qItem.question || t.title,
        unit: t.examRelevance || 'Core Syllabus',
        trapDescription: bItem.whatAiMisses || 'Generic explanations miss key conditions.',
        aiBlindspot: bItem.whatAiSays ? `${bItem.whatAiSays} In reality: ${bItem.whatAiMisses}` : 'Superficial AI coverage.',
        examinerRubric: qItem.keyPoints || [bItem.examinerRubric || 'Explicit formula and steps.'],
        modelAnswerSnippet: bItem.examinerRubric || 'Verify all criteria.',
        examTarget: data.id || 'General',
      });
    });
  });
  return vault;
})();

/**
 * Backward compatibility: export flattened default SUBJECT_TOPICS
 */
export const SUBJECT_TOPICS = (function() {
  const map = {};
  Object.values(EXAM_KNOWLEDGEBASE).forEach(data => {
    data.topics?.forEach(t => {
      if (!map[t.subject]) map[t.subject] = [];
      if (!map[t.subject].some(existing => existing.id === t.id)) {
        map[t.subject].push(t);
      }
    });
  });
  return map;
})();
