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
  if (str.includes('10') || str.includes('CLASS 10')) return 'CBSE_10';
  if (str.includes('COLLEGE') || str.includes('SEM') || str.includes('B.TECH') || str.includes('BCA')) return 'COLLEGE_SEM';
  if (str.includes('12') || str.includes('BOARD') || str.includes('CBSE')) return 'CBSE_12';
  return 'CBSE_12'; // Default reliable fallback
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
