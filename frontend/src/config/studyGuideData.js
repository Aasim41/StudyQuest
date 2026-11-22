/**
 * StudyQuest Universal Exam & Subject Knowledgebase
 * Covers Competitive Exams, College/University Semester Exams, and School/Board Exams.
 * Pinpoints what generic AI (ChatGPT, etc.) misses in specific exams.
 */

export const EXAM_CATEGORIES = [
  { id: 'ALL', label: 'All Exams', icon: 'earth' },
  { id: 'COMPETITIVE', label: 'Competitive Exams', icon: 'trophy-variant-outline', desc: 'JEE, NEET, GATE, UPSC, CAT, SSC' },
  { id: 'BOARD', label: 'Board & School', icon: 'school-outline', desc: 'CBSE 10/12, ICSE/ISC, State Boards' },
  { id: 'COLLEGE', label: 'College & University', icon: 'domain', desc: 'Mid-Sem, End-Sem, Finals' },
];

export const EXAM_TARGETS = [
  // Competitive Exams
  {
    id: 'JEE',
    category: 'COMPETITIVE',
    label: 'JEE Main & Advanced',
    desc: 'Physics, Chemistry, Mathematics • Extreme edge cases, negative-marking traps',
    weightage: 'Competitive Scoring',
    examType: 'Competitive',
  },
  {
    id: 'NEET',
    category: 'COMPETITIVE',
    label: 'NEET (UG)',
    desc: 'Biology, Physics, Chemistry • NCERT verbatim lines, diagram labeling, exceptions',
    weightage: '720 Marks',
    examType: 'Competitive',
  },
  {
    id: 'GATE',
    category: 'COMPETITIVE',
    label: 'GATE / PSU Exam',
    desc: 'Engineering & CS • Numerical accuracy, counterexamples, rigorous worst-case bounds',
    weightage: '100 Marks',
    examType: 'Competitive',
  },
  {
    id: 'UPSC',
    category: 'COMPETITIVE',
    label: 'UPSC / Civil Services',
    desc: 'General Studies & Optionals • Multi-dimensional analysis, constitutional articles, counter-views',
    weightage: 'Subjective Scoring',
    examType: 'Competitive',
  },
  {
    id: 'CAT',
    category: 'COMPETITIVE',
    label: 'CAT / Management',
    desc: 'Quant, DILR, VARC • Boundary constraints, shortcut shortcuts vs full logic',
    weightage: '100 Percentile',
    examType: 'Competitive',
  },

  // Board & School Exams
  {
    id: 'CBSE_12',
    category: 'BOARD',
    label: 'CBSE Class 12 Boards',
    desc: 'Science, Commerce & Arts • Strict step-marking, formula substitution, NCERT rubrics',
    weightage: 'Step-Wise Rubric',
    examType: 'Board',
  },
  {
    id: 'CBSE_10',
    category: 'BOARD',
    label: 'CBSE Class 10 Boards',
    desc: 'Maths, Science, Social Science • Textbook definitions, standard derivations, units',
    weightage: 'Board Rubric',
    examType: 'Board',
  },
  {
    id: 'ICSE_ISC',
    category: 'BOARD',
    label: 'ICSE / ISC Boards',
    desc: 'Comprehensive conceptual answers, exact keywords, practical applications',
    weightage: 'Keyword Rubric',
    examType: 'Board',
  },
  {
    id: 'STATE_BOARD',
    category: 'BOARD',
    label: 'State Board Exams',
    desc: 'State syllabus theorems, standard derivations, precise definitions',
    weightage: 'State Rubric',
    examType: 'Board',
  },

  // College & University Exams
  {
    id: 'COLLEGE_MID',
    category: 'COLLEGE',
    label: 'College Mid-Sem Exam',
    desc: 'Foundational theory, proof steps, architectural diagrams',
    weightage: 'Internal Assessment',
    examType: 'College',
  },
  {
    id: 'COLLEGE_END',
    category: 'COLLEGE',
    label: 'College End-Sem / Final Exam',
    desc: 'Full syllabus, multi-module questions, complete mathematical derivations',
    weightage: 'Final Grade Weight',
    examType: 'College',
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

export const SUBJECT_TOPICS = {
  'Physics': [
    {
      id: 'phy-photoelectric',
      title: 'Photoelectric Effect & Stopping Potential',
      subject: 'Physics',
      examRelevance: 'CBSE 12th & JEE / NEET High Probability',
      blindspotCount: 3,
      summary: 'Emission of electrons when electromagnetic radiation hits a material surface.',
      aiBlindspots: [
        {
          point: 'Stopping Potential Depends on Frequency, NOT Intensity',
          whatAiSays: 'Generic AI explains that brighter light increases electron energy.',
          whatAiMisses: 'Standard AI frequently confuses intensity with frequency: Intensity ONLY increases the number of emitted photoelectrons (photocurrent), while stopping potential and maximum kinetic energy depend STRICTLY on frequency and work function.',
          examinerRubric: 'Examiners award full marks only when the graph of Stopping Potential vs Frequency shows the threshold frequency intercept on the frequency axis.',
        },
        {
          point: 'Instantaneous Emission (Zero Time Lag)',
          whatAiSays: 'Generic AI mentions wave-particle duality.',
          whatAiMisses: 'AI omits the experimental fact that emission is virtually instantaneous (< 10^-9 s), which classical wave theory could never explain since wave energy accumulation would require hours.',
          examinerRubric: 'Crucial 2-mark question in Board and competitive theory.',
        },
      ],
      coreConcepts: [
        "Einstein's Photoelectric Equation: K_max = h*nu - Phi_0 = e*V_0.",
        'Threshold frequency (nu_0): Minimum frequency below which no emission occurs, regardless of intensity.',
        'Photocurrent is directly proportional to incident intensity for a given frequency.',
      ],
      examQuestions: [
        {
          question: 'Draw the graph showing variation of stopping potential with frequency of incident radiation. How can Planck constant be determined from this graph?',
          marks: 3,
          keyPoints: [
            'Straight line with positive slope not passing through origin (intercept = nu_0 on x-axis).',
            'Slope of line equals h/e.',
            'Planck constant h = slope * electronic charge e.',
          ],
        },
      ],
      quiz: [
        {
          question: 'If the intensity of incident light is doubled while keeping frequency constant, what happens to the stopping potential?',
          options: ['It doubles', 'It halves', 'It remains unchanged', 'It increases fourfold'],
          correctIndex: 2,
          explanation: 'Stopping potential depends solely on the frequency of incident radiation and work function, not intensity.',
        },
      ],
    },
    {
      id: 'phy-rotational',
      title: 'Rolling Without Slipping & Friction Direction',
      subject: 'Physics',
      examRelevance: 'JEE Main & Advanced Frequent Trap',
      blindspotCount: 3,
      summary: 'Combined translational and rotational motion with point of contact at instantaneous rest.',
      aiBlindspots: [
        {
          point: 'Static Friction Can Act Forward or Backward',
          whatAiSays: 'Generic AI says friction always opposes motion.',
          whatAiMisses: 'In pure rolling under external force/torque, static friction can act forward, backward, or even be zero depending on where the force is applied relative to the center of mass (F*r vs I*alpha).',
          examinerRubric: 'Negative marking trap in competitive exams: assuming friction is always backward on rolling bodies.',
        },
        {
          point: 'Instantaneous Velocity at Contact Point is Zero',
          whatAiSays: 'Generic AI says the wheel is moving forward at speed V.',
          whatAiMisses: 'The instantaneous point of contact with the ground has exactly zero velocity: V_contact = V_cm - omega*R = 0. Work done by static friction is zero.',
          examinerRubric: 'Examiners check for V_cm = R * omega and W_friction = 0.',
        },
      ],
      coreConcepts: [
        'Pure rolling condition: V_cm = R * omega, a_cm = R * alpha.',
        'Total kinetic energy = K_trans + K_rot = 1/2*m*V^2 * (1 + k^2/R^2).',
        'Acceleration down an incline: a = g*sin(theta) / (1 + I / (m*R^2)).',
      ],
      examQuestions: [
        {
          question: 'A solid cylinder and a hollow sphere of equal mass roll down an inclined plane from rest. Which reaches the bottom first?',
          marks: 4,
          keyPoints: [
            'Formulate a = g*sin(theta)/(1 + k^2/R^2).',
            'Solid cylinder k^2/R^2 = 1/2 = 0.5. Hollow sphere k^2/R^2 = 2/3 = 0.67.',
            'Smaller k^2/R^2 gives greater acceleration, so solid cylinder reaches first.',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is the work done by static friction during pure rolling without slipping?',
          options: ['Positive', 'Negative', 'Exactly zero', 'Depends on distance'],
          correctIndex: 2,
          explanation: 'Because the point of contact is instantaneously at rest, displacement during contact is zero, so work done is zero.',
        },
      ],
    },
  ],

  'Chemistry': [
    {
      id: 'chem-aldol',
      title: 'Aldol Condensation vs Cannizzaro Reaction',
      subject: 'Chemistry',
      examRelevance: 'CBSE 12th Board & JEE Guaranteed Question',
      blindspotCount: 3,
      summary: 'Fundamental carbonyl addition reactions based on presence or absence of alpha-hydrogens.',
      aiBlindspots: [
        {
          point: 'Alpha-Hydrogen is the Decisive Factor',
          whatAiSays: 'Generic AI explains aldehydes react in basic medium.',
          whatAiMisses: 'Aldol requires at least one alpha-hydrogen to form enolate ion. If NO alpha-hydrogens exist (e.g. Benzaldehyde, Formaldehyde), 50% NaOH triggers Cannizzaro self-redox (disproportionation into alcohol + carboxylate salt).',
          examinerRubric: 'Examiners deduct 2 marks if the student fails to explicitly name the absence of alpha-hydrogens for Cannizzaro.',
        },
        {
          point: 'Crossed Aldol Produces 4 Products Without Control',
          whatAiSays: 'Generic AI gives one single product.',
          whatAiMisses: 'If two different aldehydes both having alpha-hydrogens are mixed, 4 distinct condensation products form (2 self-aldol + 2 cross-aldol), giving poor synthetic yield.',
          examinerRubric: 'Standard 3-mark board question: list all 4 condensation products.',
        },
      ],
      coreConcepts: [
        'Aldol: Carbonyl with alpha-H + dilute base -> beta-hydroxy aldehyde -> alpha,beta-unsaturated aldehyde (upon heating).',
        'Cannizzaro: Carbonyl without alpha-H + conc. base -> 1 molecule reduced to alcohol, 1 molecule oxidized to acid salt.',
      ],
      examQuestions: [
        {
          question: 'Distinguish chemically between ethanal and benzaldehyde with suitable reactions.',
          marks: 3,
          keyPoints: [
            'Ethanal has alpha-H, undergoes Aldol and Iodoform test.',
            'Benzaldehyde has no alpha-H, undergoes Cannizzaro reaction with 50% KOH.',
            'Balanced chemical equations for both.',
          ],
        },
      ],
      quiz: [
        {
          question: 'Which compound undergoes Cannizzaro reaction upon heating with concentrated alkali?',
          options: ['Acetaldehyde', 'Formaldehyde', 'Acetone', 'Propionaldehyde'],
          correctIndex: 1,
          explanation: 'Formaldehyde (HCHO) has no alpha-hydrogens, making it undergo self-oxidation-reduction (Cannizzaro).',
        },
      ],
    },
  ],

  'Mathematics': [
    {
      id: 'math-kings-rule',
      title: "Definite Integrals: King's Property & Symmetry",
      subject: 'Mathematics',
      examRelevance: 'CBSE 12th 6-Marker & JEE Main Core Trap',
      blindspotCount: 2,
      summary: 'Integral from a to b of f(x)dx = integral from a to b of f(a + b - x)dx.',
      aiBlindspots: [
        {
          point: 'Adding Original and Transformed Integrals (2I Step)',
          whatAiSays: 'Generic AI states the property formula.',
          whatAiMisses: 'Generic AI fails to show the crucial exam step: define I = integral f(x)dx, apply property to get I = integral f(a+b-x)dx, then add them: 2I = integral [f(x) + f(a+b-x)]dx. Examiners check for the "2I" step!',
          examinerRubric: 'Examiners deduct 1.5 marks if students forget to divide by 2 at the final answer step.',
        },
      ],
      coreConcepts: [
        'Property: Integral[a to b] f(x) dx = Integral[a to b] f(a + b - x) dx.',
        'When lower limit is 0: Integral[0 to a] f(x) dx = Integral[0 to a] f(a - x) dx.',
      ],
      examQuestions: [
        {
          question: 'Evaluate Integral from 0 to pi/2 of (sqrt(sin x) / (sqrt(sin x) + sqrt(cos x))) dx.',
          marks: 4,
          keyPoints: [
            'Let I = Integral(sin^0.5 / (sin^0.5 + cos^0.5)) dx.',
            'Apply f(pi/2 - x) to get second equation for I with swapped sine/cosine.',
            'Add equations: 2I = Integral from 0 to pi/2 of 1 dx = pi/2 => I = pi/4.',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is the value of Integral[0 to pi/2] of ln(tan x) dx?',
          options: ['pi/4', 'pi/2', '0', '1'],
          correctIndex: 2,
          explanation: 'Using King property, I = Integral ln(tan(pi/2 - x)) = Integral ln(cot x) = -I. Thus 2I = 0 => I = 0.',
        },
      ],
    },
  ],

  'Biology': [
    {
      id: 'bio-dna-repl',
      title: 'DNA Replication & Leading vs Lagging Strand',
      subject: 'Biology',
      examRelevance: 'NEET & CBSE 12th Board High Frequency',
      blindspotCount: 3,
      summary: 'Semiconservative replication by DNA Polymerase synthesizing 5-prime to 3-prime.',
      aiBlindspots: [
        {
          point: 'DNA Polymerase CANNOT Initiate De Novo',
          whatAiSays: 'Generic AI says DNA polymerase builds the new DNA strand.',
          whatAiMisses: 'DNA polymerase cannot synthesize without a pre-existing 3-prime OH group. It strictly requires an RNA primer laid down by RNA Primase, which is later removed and replaced by DNA Polymerase I.',
          examinerRubric: 'Examiners look for the mention of "RNA Primer" and "3-OH primer terminus" for full marks.',
        },
        {
          point: 'Synthesis is Unidirectional (5-prime to 3-prime ONLY)',
          whatAiSays: 'Generic AI describes antiparallel strands.',
          whatAiMisses: 'Because synthesis is strictly 5 to 3, the lagging strand must be synthesized discontinuously as Okazaki fragments, joined by DNA ligase (forming phosphodiester bonds).',
          examinerRubric: 'Must state Okazaki fragments and DNA Ligase role.',
        },
      ],
      coreConcepts: [
        'Helicase unzips hydrogen bonds; Topoisomerase/Gyrase relieves supercoiling tension.',
        'Leading strand: continuous replication towards replication fork.',
        'Lagging strand: discontinuous replication away from fork via Okazaki fragments.',
      ],
      examQuestions: [
        {
          question: 'Why is DNA replication termed semiconservative and semidiscontinuous?',
          marks: 3,
          keyPoints: [
            'Semiconservative: One parental strand conserved in each daughter helix (Meselson & Stahl).',
            'Semidiscontinuous: Leading strand is continuous while lagging strand is discontinuous.',
            'DNA polymerase operates strictly in 5-prime to 3-prime direction.',
          ],
        },
      ],
      quiz: [
        {
          question: 'Which enzyme synthesizes the small RNA primer required for DNA polymerase activity?',
          options: ['DNA Ligase', 'RNA Primase', 'Topoisomerase', 'Telomerase'],
          correctIndex: 1,
          explanation: 'RNA Primase synthesizes the initial RNA primer that provides the free 3-OH group required by DNA polymerase.',
        },
      ],
    },
  ],

  'Computer Science': [
    {
      id: 'cs-rbt',
      title: 'Red-Black Trees vs AVL Trees',
      subject: 'Computer Science',
      examRelevance: 'GATE & College Semesters Guaranteed Question',
      blindspotCount: 3,
      summary: 'Self-balancing Binary Search Trees ensuring O(log N) search, insertion, and deletion.',
      aiBlindspots: [
        {
          point: 'Max Rotations on Insert is Bounded by 2',
          whatAiSays: 'Generic AI says insertion requires rotations to balance the tree.',
          whatAiMisses: 'Regardless of tree size, Red-Black tree insertion NEVER requires more than 2 rotations. Deletion requires at most 3 rotations. Recoloring may propagate O(log N) times, but rotations are strictly O(1).',
          examinerRubric: 'Examiners award marks specifically for identifying that rotations are bounded by O(1) while recoloring is O(log N).',
        },
        {
          point: 'Black-Height Definition Excludes Root',
          whatAiSays: 'Generic AI defines black height as the count of black nodes.',
          whatAiMisses: 'Black height bh(x) is the count of black nodes on any path from x down to a leaf, NOT including x itself, but including null leaves (NIL nodes which are black by definition).',
          examinerRubric: 'Deductions occur if NIL leaves are omitted from the black-height calculation.',
        },
      ],
      coreConcepts: [
        '5 Invariants: 1. Red/Black nodes. 2. Root is Black. 3. NIL is Black. 4. No consecutive Red nodes. 5. Equal Black count on all paths.',
        'Height Bound: h <= 2 * log2(n + 1).',
      ],
      examQuestions: [
        {
          question: 'What is the maximum number of rotations during insertion and deletion in a Red-Black Tree?',
          marks: 3,
          keyPoints: [
            'Insertion: At most 2 rotations.',
            'Deletion: At most 3 rotations.',
            'Recoloring can propagate up to O(log N) times.',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is the maximum number of rotations needed during insertion into a Red-Black Tree?',
          options: ['O(log N)', 'At most 2', 'At most 3', 'Unlimited'],
          correctIndex: 1,
          explanation: 'While recoloring can propagate up the tree, insertion terminates after at most 2 structural rotations.',
        },
      ],
    },
  ],

  'Economics': [
    {
      id: 'eco-deficit',
      title: 'Fiscal Deficit vs Primary Deficit & Crowding Out',
      subject: 'Economics',
      examRelevance: 'CBSE 12th Board, UPSC & College Semesters',
      blindspotCount: 2,
      summary: 'Government budget deficits, borrowing requirements, and debt sustainability.',
      aiBlindspots: [
        {
          point: 'Primary Deficit Reflects CURRENT Year Fiscal Stance',
          whatAiSays: 'Generic AI explains that both are types of deficits.',
          whatAiMisses: 'Primary Deficit = Fiscal Deficit - Interest Payments. A zero primary deficit means the government borrows ONLY to pay past interest liabilities, not for current expenditure programs.',
          examinerRubric: 'Examiners award full marks when the student highlights that Primary Deficit isolates current-year fiscal policy from legacy debt burden.',
        },
      ],
      coreConcepts: [
        'Fiscal Deficit = Total Expenditure - Total Receipts (excluding borrowings).',
        'Primary Deficit = Fiscal Deficit - Interest Payments.',
        'Crowding Out: High government market borrowings reduce loanable funds for private investment.',
      ],
      examQuestions: [
        {
          question: 'What does a large primary deficit indicate? What does a zero primary deficit signify?',
          marks: 4,
          keyPoints: [
            'Large primary deficit: Current government spending significantly exceeds current revenues.',
            'Zero primary deficit: Entire government borrowing is consumed by servicing past debt interest.',
            'Implications for inflation and credit availability.',
          ],
        },
      ],
      quiz: [
        {
          question: 'If a government has a Fiscal Deficit of 50,000 crores and Interest Payments of 50,000 crores, what is the Primary Deficit?',
          options: ['100,000 crores', '50,000 crores', 'Zero', 'Cannot be determined'],
          correctIndex: 2,
          explanation: 'Primary Deficit = Fiscal Deficit - Interest Payments = 50,000 - 50,000 = 0.',
        },
      ],
    },
  ],
};
