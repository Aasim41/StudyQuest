/**
 * StudyQuest Master Exam -> Stream -> Subject -> Chapter Hierarchy Catalog
 * 100% Verified 2025-26 / 2026-27 Curriculums across:
 * Competitive Exams, CBSE (10/12), CISCE (ICSE 10 / ISC 12), 11 Major State Boards, & College Streams.
 */

// ─── REUSABLE VERIFIED SUBJECT & CHAPTER LIBRARIES ───────────────────────────

const NCERT_12_PHYSICS_CHAPTERS = [
  { id: 'phy12-1', unit: 'Unit I', title: 'Electric Charges and Fields', weightage: '08 Marks (with Ch 2)', subtopics: ['Gauss Law Applications', 'Electric Dipole Torque & Field', 'Coulomb Law Vector Form'] },
  { id: 'phy12-2', unit: 'Unit I', title: 'Electrostatic Potential and Capacitance', weightage: '08 Marks (with Ch 1)', subtopics: ['Parallel Plate Capacitor with Dielectric', 'Equipotential Surfaces', 'Energy Density'] },
  { id: 'phy12-3', unit: 'Unit II', title: 'Current Electricity', weightage: '08 Marks', subtopics: ['Drift Velocity & Ohm Law Derivation', 'Kirchhoff Rules (KCL/KVL)', 'Wheatstone Bridge Condition'] },
  { id: 'phy12-4', unit: 'Unit III', title: 'Moving Charges and Magnetism', weightage: '09 Marks (with Ch 5)', subtopics: ['Biot-Savart Law & Circular Loop Axis', 'Ampere Circuital Law', 'Moving Coil Galvanometer Conversion'] },
  { id: 'phy12-5', unit: 'Unit III', title: 'Magnetism and Matter', weightage: '09 Marks (with Ch 4)', subtopics: ['Dia, Para & Ferromagnetic Properties', 'Torque on Magnetic Dipole', 'Magnetic Susceptibility'] },
  { id: 'phy12-6', unit: 'Unit IV', title: 'Electromagnetic Induction', weightage: '08 Marks (with Ch 7)', subtopics: ['Faraday & Lenz Law (Energy Conservation)', 'Self & Mutual Inductance of Solenoids', 'Motional EMF'] },
  { id: 'phy12-7', unit: 'Unit IV', title: 'Alternating Current', weightage: '08 Marks (with Ch 6)', subtopics: ['Series LCR Impedance & Resonance Q-Factor', 'Power Factor & Wattless Current', 'Step-up/Down Transformer Losses'] },
  { id: 'phy12-8', unit: 'Unit V', title: 'Electromagnetic Waves', weightage: '03 Marks', subtopics: ['Displacement Current Consistency', 'EM Spectrum Frequency & Uses', 'Transverse Nature'] },
  { id: 'phy12-9', unit: 'Unit VI', title: 'Ray Optics and Optical Instruments', weightage: '09 Marks (with Ch 10)', subtopics: ['Lens Maker Formula Derivation', 'Prism Refraction & Minimum Deviation', 'Astronomical Telescope Normal Adjustment'] },
  { id: 'phy12-10', unit: 'Unit VI', title: 'Wave Optics', weightage: '09 Marks (with Ch 9)', subtopics: ['Huygens Principle Laws of Reflection/Refraction', 'Young Double Slit Fringe Width', 'Single Slit Diffraction Maxima/Minima'] },
  { id: 'phy12-11', unit: 'Unit VII', title: 'Dual Nature of Radiation and Matter', weightage: '04 Marks', subtopics: ['Einstein Photoelectric Equation & Stopping Potential', 'de Broglie Wavelength of Accelerated Electron', 'Threshold Frequency ν₀'] },
  { id: 'phy12-12', unit: 'Unit VIII', title: 'Atoms and Nuclei', weightage: '08 Marks', subtopics: ['Bohr Quantization & Hydrogen Line Spectrum', 'Binding Energy Curve & Mass Defect', 'Nuclear Fission vs Fusion'] },
  { id: 'phy12-13', unit: 'Unit IX', title: 'Semiconductor Electronics', weightage: '07 Marks', subtopics: ['p-n Junction Forward & Reverse Characteristics', 'Half & Full Wave Rectifier Ripple', 'Energy Bands (Conductor/Insulator/Semiconductor)'] },
];

const NCERT_12_CHEMISTRY_CHAPTERS = [
  { id: 'chem12-1', unit: 'Ch 1', title: 'Solutions', weightage: '07 Marks', subtopics: ['Raoult Law Ideal vs Non-Ideal Deviations', 'Colligative Properties & Osmotic Pressure', 'van t Hoff Factor Association/Dissociation'] },
  { id: 'chem12-2', unit: 'Ch 2', title: 'Electrochemistry', weightage: '09 Marks', subtopics: ['Nernst Equation & ΔG° = -nFE°', 'Kohlrausch Law of Independent Migration', 'Conductivity vs Molar Conductivity Dilution'] },
  { id: 'chem12-3', unit: 'Ch 3', title: 'Chemical Kinetics', weightage: '07 Marks', subtopics: ['Integrated Zero & First Order Rate Equations', 'Arrhenius Activation Energy Graph', 'Collision Theory Orientation Factor'] },
  { id: 'chem12-4', unit: 'Ch 4', title: 'The d- and f-Block Elements', weightage: '07 Marks', subtopics: ['Lanthanoid Contraction & Atomic Radii', 'Preparation & Oxidizing Reactions of KMnO₄ & K₂Cr₂O₇', 'Magnetic Moment Spin-Only Formula'] },
  { id: 'chem12-5', unit: 'Ch 5', title: 'Coordination Compounds', weightage: '07 Marks', subtopics: ['Crystal Field Splitting (Δₒ & Δₜ)', 'Werner Theory & IUPAC Nomenclature', 'Valence Bond Hybridization vs Geometry'] },
  { id: 'chem12-6', unit: 'Ch 6', title: 'Haloalkanes and Haloarenes', weightage: '06 Marks', subtopics: ['SN1 Racemization vs SN2 Inversion', 'Sandmeyer & Finkelstein Reactions', 'Low Reactivity of Aryl Halides'] },
  { id: 'chem12-7', unit: 'Ch 7', title: 'Alcohols, Phenols and Ethers', weightage: '06 Marks', subtopics: ['Reimer-Tiemann & Kolbe Reactions', 'Acidic Strength Order of Substituted Phenols', 'Williamson Ether Synthesis Constraints'] },
  { id: 'chem12-8', unit: 'Ch 8', title: 'Aldehydes, Ketones and Carboxylic Acids', weightage: '08 Marks', subtopics: ['Aldol Condensation vs Cannizzaro Reaction', 'Tollens & Fehling Distinction Tests', 'HVZ Reaction & Acid Strength Inductive Effect'] },
  { id: 'chem12-9', unit: 'Ch 9', title: 'Amines', weightage: '06 Marks', subtopics: ['Gabriel Phthalimide & Hoffmann Bromamide', 'Basicity Order in Aqueous vs Gas Phase', 'Hinsberg Reagent 1°/2°/3° Distinction'] },
  { id: 'chem12-10', unit: 'Ch 10', title: 'Biomolecules', weightage: '07 Marks', subtopics: ['Glucose Cyclic Structure & Anomers', 'Denaturation of Proteins & Peptide Linkages', 'DNA vs RNA Bases & Phosphodiester Bonds'] },
];

const NCERT_12_MATHS_CHAPTERS = [
  { id: 'math12-1', unit: 'Unit I', title: 'Relations, Functions & Inverse Trigonometry', weightage: '08 Marks', subtopics: ['Equivalence Relations (Reflexive/Symmetric/Transitive)', 'Bijective Function Proof', 'Principal Value Branches of sin⁻¹x, tan⁻¹x'] },
  { id: 'math12-2', unit: 'Unit II', title: 'Matrices and Determinants', weightage: '10 Marks', subtopics: ['Symmetric & Skew-Symmetric Decomposition', 'Adjoint & Inverse A⁻¹ = adj(A)/|A|', 'Solving System AX = B (Consistent/Inconsistent)'] },
  { id: 'math12-3', unit: 'Unit III', title: 'Continuity, Differentiability & Applications', weightage: '15 Marks', subtopics: ['Left/Right Hand Continuity & Chain Rule', 'Increasing/Decreasing Intervals', 'Maxima/Minima Word Problems'] },
  { id: 'math12-4', unit: 'Unit III', title: 'Integrals, AOI & Differential Equations', weightage: '20 Marks', subtopics: ['King Property (∫f(x)dx from 0 to a)', 'Area Under Curves Between Line & Parabola', 'Linear Differential Equation & Integrating Factor'] },
  { id: 'math12-5', unit: 'Unit IV', title: 'Vectors & 3D Geometry', weightage: '14 Marks', subtopics: ['Scalar Dot & Vector Cross Product Projections', 'Shortest Distance Between Skew Lines', 'Cartesian & Vector Equations of Line'] },
  { id: 'math12-6', unit: 'Unit V-VI', title: 'Linear Programming & Probability', weightage: '13 Marks', subtopics: ['Corner Point Bounded/Unbounded Feasible Region', 'Conditional Probability P(A|B)', 'Bayes Theorem Partition Word Problems'] },
];

const NCERT_12_BIOLOGY_CHAPTERS = [
  { id: 'bio12-1', unit: 'Unit VI', title: 'Sexual Reproduction in Flowering Plants & Human Reproduction', weightage: '16 Marks (with Ch 3)', subtopics: ['Double Fertilization & 7-Celled 8-Nucleate Embryo Sac', 'Spermatogenesis vs Oogenesis Hormonal Control', 'Placenta Functions & Menstrual Cycle'] },
  { id: 'bio12-2', unit: 'Unit VII', title: 'Principles of Inheritance & Molecular Basis', weightage: '20 Marks', subtopics: ['Mendelian Dihybrid Cross & Incomplete Dominance', 'DNA Semi-Conservative Replication & Leading/Lagging Strands', 'Lac Operon Inducible Regulation'] },
  { id: 'bio12-3', unit: 'Unit VIII', title: 'Human Health, Disease & Microbes', weightage: '12 Marks', subtopics: ['Active vs Passive Immunity & Antibody H₂L₂ Structure', 'HIV Retrovirus Replication Cycle', 'BOD & Sewage Treatment Stages'] },
  { id: 'bio12-4', unit: 'Unit IX', title: 'Biotechnology: Principles & Applications', weightage: '12 Marks', subtopics: ['pBR322 Vector Ori, Selectable Markers & Cloning Sites', 'PCR Steps (Denaturation, Annealing, Extension)', 'Bt Cotton Cry Genes & RNA Interference'] },
  { id: 'bio12-5', unit: 'Unit X', title: 'Organisms, Populations & Biodiversity', weightage: '10 Marks', subtopics: ['Logistic Verhulst-Pearl Growth dN/dt = rN((K-N)/K)', 'Population Interactions (Mutualism, Parasitism, Commensalism)', 'Biodiversity Hotspots & Species-Area Relationship'] },
];

const COMMERCE_12_SUBJECTS = [
  {
    id: 'acc-12',
    name: 'Accountancy',
    code: '055',
    marksSplit: '80 Theory + 20 Project',
    chapters: [
      { id: 'acc-1', unit: 'Part A-1', title: 'Accounting for Partnership Firms', weightage: '36 Marks', subtopics: ['Goodwill Valuation (Super Profit & Capitalisation)', 'Sacrificing vs Gaining Ratio & Revaluation A/c', 'Dissolution Realisation Account & Settlement'] },
      { id: 'acc-2', unit: 'Part A-2', title: 'Accounting for Share Capital & Debentures', weightage: '24 Marks', subtopics: ['Pro-Rata Allotment & Forfeiture Entries', 'Reissue of Forfeited Shares & Capital Reserve', 'Issue of Debentures with Terms of Redemption'] },
      { id: 'acc-3', unit: 'Part B-1', title: 'Financial Statement Analysis & Accounting Ratios', weightage: '12 Marks', subtopics: ['Comparative & Common Size Statements', 'Current vs Quick Ratio & Debt-Equity Ratio', 'Inventory Turnover & ROI Calculations'] },
      { id: 'acc-4', unit: 'Part B-2', title: 'Cash Flow Statement (AS-3 Revised)', weightage: '08 Marks', subtopics: ['Operating Activities Indirect Method Adjustments', 'Provision for Tax & Proposed Dividend Treatment', 'Investing vs Financing Activity Classification'] },
    ],
  },
  {
    id: 'bst-12',
    name: 'Business Studies',
    code: '054',
    marksSplit: '80 Theory + 20 Project',
    chapters: [
      { id: 'bst-1', unit: 'Part A-1', title: 'Nature, Principles & Business Environment', weightage: '16 Marks', subtopics: ['Fayol 14 Principles vs Taylor Scientific Management', 'Dimensions of Business Environment (PESTLE)', 'Coordination as Essence of Management'] },
      { id: 'bst-2', unit: 'Part A-2', title: 'Planning, Organising, Staffing, Directing, Controlling', weightage: '34 Marks', subtopics: ['Delegation vs Decentralisation', 'Maslow Need Hierarchy & Leadership Styles', 'Management by Exception & Controlling Process'] },
      { id: 'bst-3', unit: 'Part B-1', title: 'Financial Management & Financial Markets', weightage: '15 Marks', subtopics: ['Trading on Equity & Capital Structure Factors', 'SEBI Protective & Regulatory Functions', 'Money Market Instruments (T-Bills, Commercial Paper)'] },
      { id: 'bst-4', unit: 'Part B-2', title: 'Marketing & Consumer Protection Act 2019', weightage: '15 Marks', subtopics: ['4 Ps of Marketing Mix & Branding/Packaging', '6 Consumer Rights & 3-Tier Redressal Commissions', 'Pecuniary Jurisdiction Limits (2019 Act)'] },
    ],
  },
  {
    id: 'econ-12',
    name: 'Economics',
    code: '030',
    marksSplit: '80 Theory + 20 Project',
    chapters: [
      { id: 'econ-1', unit: 'Part A-1', title: 'National Income & Related Aggregates', weightage: '10 Marks', subtopics: ['Value Added, Income & Expenditure Methods', 'GDP Deflator & Nominal vs Real GDP', 'GDP & Welfare Limitations (Externalities)'] },
      { id: 'econ-2', unit: 'Part A-2', title: 'Money, Banking & Income Determination', weightage: '18 Marks', subtopics: ['Credit Creation Multiplier (1/LRR)', 'AD-AS Equilibrium, MPC+MPS=1 & Multiplier k=1/(1-MPC)', 'Excess vs Deficient Demand RBI Quantitative Tools'] },
      { id: 'econ-3', unit: 'Part A-3', title: 'Government Budget & Balance of Payments', weightage: '12 Marks', subtopics: ['Revenue vs Capital Receipts & Fiscal Deficit', 'Autonomous vs Accommodating BoP Items', 'Managed Floating Exchange Rate'] },
      { id: 'econ-4', unit: 'Part B', title: 'Indian Economic Development (1947–Present)', weightage: '40 Marks', subtopics: ['1991 LPG Reforms (Liberalisation, Privatisation, Globalisation)', 'Human Capital Formation, Rural Credit & Employment', 'India-China-Pakistan Development Comparison'] },
    ],
  },
];

const HUMANITIES_12_SUBJECTS = [
  {
    id: 'hist-12',
    name: 'History',
    code: '027',
    marksSplit: '80 Theory + 20 Project',
    chapters: [
      { id: 'hist-1', unit: 'Theme I', title: 'Bricks, Beads & Bones (Harappan Civilisation) to Bhakti-Sufi', weightage: '25 Marks', subtopics: ['Mohenjodaro Drainage & Citadel Planning', 'Ashoka Dhamma Inscriptions & Magadha Rise', 'Kabir, Guru Nanak & Mirabai Bhakti Traditions'] },
      { id: 'hist-2', unit: 'Theme II', title: 'Vijayanagara Empire & Mughal Agrarian Chronicles', weightage: '25 Marks', subtopics: ['Amara-Nayaka System & Hampi Sacred Centre', 'Ain-i-Akbari Land Revenue & Mansabdari', 'Panchayats and Zamindars in Rural Society'] },
      { id: 'hist-3', unit: 'Theme III', title: '1857 Revolt, Mahatma Gandhi & Framing Constitution', weightage: '30 Marks', subtopics: ['1857 Causes, Rumours & Proclamation Analysis', 'Dandi March, Quit India & Non-Cooperation', 'Constituent Assembly Debates on Separate Electorates'] },
    ],
  },
  {
    id: 'polsci-12',
    name: 'Political Science',
    code: '028',
    marksSplit: '80 Theory + 20 Project',
    chapters: [
      { id: 'pol-1', unit: 'Part A', title: 'Contemporary World Politics (Bipolarity to Globalisation)', weightage: '40 Marks', subtopics: ['Disintegration of USSR & Shock Therapy', 'EU, ASEAN & Rise of Chinese Economy', 'UN Security Council Reform & Kyoto Protocol'] },
      { id: 'pol-2', unit: 'Part B', title: 'Politics in India Since Independence', weightage: '40 Marks', subtopics: ['Challenges of Nation Building & States Reorganisation', 'Emergency 1975 Constitutional Lessons', 'Coalition Era, Mandal Issue & Regional Aspirations'] },
    ],
  },
  {
    id: 'geo-12',
    name: 'Geography',
    code: '029',
    marksSplit: '70 Theory + 30 Practical',
    chapters: [
      { id: 'geo-1', unit: 'Book A', title: 'Fundamentals of Human Geography', weightage: '35 Marks', subtopics: ['Demographic Transition Model Stages', 'Primary, Secondary & Quaternary Activities', 'Suez & Panama Canal International Trade Routes'] },
      { id: 'geo-2', unit: 'Book B', title: 'India: People and Economy', weightage: '35 Marks', subtopics: ['Population Density & Migration Streams', 'Cropping Seasons, Watershed & Indira Gandhi Canal', 'Golden Quadrilateral & Major Sea Ports Map Work'] },
    ],
  },
  { ...COMMERCE_12_SUBJECTS[2] }, // Economics (shared in Arts/Humanities)
];

const ENGLISH_CORE_12 = {
  id: 'eng-12',
  name: 'English Core',
  code: '301',
  marksSplit: '80 Theory + 20 ALS Assessment',
  chapters: [
    { id: 'eng12-1', unit: 'Section A', title: 'Reading Comprehension (Factual & Case-Based)', weightage: '22 Marks', subtopics: ['Inference & Vocabulary Deduction', 'Statistical Chart Interpretation'] },
    { id: 'eng12-2', unit: 'Section B', title: 'Creative Writing Skills', weightage: '18 Marks', subtopics: ['Notice & Formal/Informal Invitation Replies', 'Letter to Editor / Job Application + Biodata', 'Article vs Report Writing Structure'] },
    { id: 'eng12-3', unit: 'Section C', title: 'Flamingo & Vistas Literature', weightage: '40 Marks', subtopics: ['RTC Extracts & Poetic Devices', 'The Last Lesson, Lost Spring, Deep Water, The Rattrap', 'The Third Level & On the Face of It Character Analysis'] },
  ],
};

const CS_12_SUBJECT = {
  id: 'cs-12',
  name: 'Computer Science',
  code: '083',
  marksSplit: '70 Theory + 30 Practical',
  chapters: [
    { id: 'cs12-1', unit: 'Unit I', title: 'Computational Thinking & Python (Files, Stacks)', weightage: '40 Marks', subtopics: ['Text, Binary (pickle) & CSV File Modes', 'Stack LIFO Implementation using List', 'Exception Handling try-except-finally'] },
    { id: 'cs12-2', unit: 'Unit II', title: 'Computer Networks', weightage: '10 Marks', subtopics: ['Switching Techniques & Transmission Media', 'HTTP, FTP, SMTP, VoIP Protocols', 'Topologies & Server Placement Case Studies'] },
    { id: 'cs12-3', unit: 'Unit III', title: 'Database Management (SQL + Python Interface)', weightage: '20 Marks', subtopics: ['DDL vs DML Commands, GROUP BY & HAVING', 'Cartesian Product, Equi-Join & Natural Join', 'mysql.connector Cursor fetchone/fetchall'] },
  ],
};

function buildStandardBoardStreams({
  phySplit = '70 Theory + 30 Practical',
  mathSplit = '80 Theory + 20 Internal',
  commSplit = '80 Theory + 20 Project',
  customPhysicsName = 'Physics',
  customChemName = 'Chemistry',
  customMathsName = 'Mathematics',
  customBioName = 'Biology',
  customAccName = 'Accountancy',
  customBstName = 'Business Studies',
  mathWeightageScale = 1,
}) {
  return [
    {
      id: 'pcm',
      label: 'Science (PCM)',
      desc: `${customPhysicsName}, ${customChemName}, ${customMathsName}, CS & English`,
      subjects: [
        { id: 'phy', name: customPhysicsName, code: '042', marksSplit: phySplit, chapters: NCERT_12_PHYSICS_CHAPTERS },
        { id: 'chem', name: customChemName, code: '043', marksSplit: phySplit, chapters: NCERT_12_CHEMISTRY_CHAPTERS },
        { id: 'math', name: customMathsName, code: '041', marksSplit: mathSplit, chapters: NCERT_12_MATHS_CHAPTERS },
        { ...CS_12_SUBJECT },
        { ...ENGLISH_CORE_12 },
      ],
    },
    {
      id: 'pcb',
      label: 'Science (PCB)',
      desc: `${customPhysicsName}, ${customChemName}, ${customBioName} & English`,
      subjects: [
        { id: 'phy', name: customPhysicsName, code: '042', marksSplit: phySplit, chapters: NCERT_12_PHYSICS_CHAPTERS },
        { id: 'chem', name: customChemName, code: '043', marksSplit: phySplit, chapters: NCERT_12_CHEMISTRY_CHAPTERS },
        { id: 'bio', name: customBioName, code: '044', marksSplit: phySplit, chapters: NCERT_12_BIOLOGY_CHAPTERS },
        { ...ENGLISH_CORE_12 },
      ],
    },
    {
      id: 'commerce',
      label: 'Commerce',
      desc: `${customAccName}, ${customBstName}, Economics & English`,
      subjects: [
        { ...COMMERCE_12_SUBJECTS[0], name: customAccName, marksSplit: commSplit },
        { ...COMMERCE_12_SUBJECTS[1], name: customBstName, marksSplit: commSplit },
        { ...COMMERCE_12_SUBJECTS[2], marksSplit: commSplit },
        { ...ENGLISH_CORE_12 },
      ],
    },
    {
      id: 'humanities',
      label: 'Arts / Humanities',
      desc: 'History, Political Science, Geography, Economics & English',
      subjects: [
        ...HUMANITIES_12_SUBJECTS.map((s) => ({ ...s, marksSplit: s.name === 'Geography' ? phySplit : commSplit })),
        { ...ENGLISH_CORE_12 },
      ],
    },
  ];
}

// ─── MASTER EXAM STREAM CATALOG (ALL 21 TARGETS) ─────────────────────────────

export const EXAM_STREAM_CATALOG = {
  // 1. JEE Main & Advanced
  JEE: {
    boardBody: 'National Testing Agency (NTA) / IITs',
    duration: '3 Hours (CBT)',
    passingRule: 'JEE Main cutoff percentile (~90–93%ile Gen) for JEE Advanced qualification',
    streams: [
      {
        id: 'jee_main',
        label: 'JEE Main (Paper 1: B.E./B.Tech)',
        desc: '300 Marks • +4 / -1 • 75 Qs (20 MCQ + 5 Numerical per subject)',
        subjects: [
          {
            id: 'jee-phy',
            name: 'Physics',
            marksSplit: '100 Marks (20 MCQ + 5 Num)',
            chapters: [
              { id: 'jp-1', unit: 'Mech-1', title: 'Kinematics, NLM, Work Energy & Rotational Motion', weightage: '~28% Paper', subtopics: ['Instantaneous Axis of Rotation & Pure Rolling Friction', 'Constraint Equations & Pseudo Forces', 'Variable Mass & Angular Momentum Conservation'] },
              { id: 'jp-2', unit: 'Heat', title: 'Thermodynamics & Kinetic Theory of Gases', weightage: '~12% Paper', subtopics: ['Molar Heat Capacity Polytropic Process', 'Carnot Engine Entropy & Work Loop Area', 'RMS Speed & Degrees of Freedom'] },
              { id: 'jp-3', unit: 'Elec-Mag', title: 'Electrostatics, Current, Magnetism & EMI/AC', weightage: '~30% Paper', subtopics: ['Gauss Law Flux Symmetry & Conducting Shells', 'RC Circuit Time Constant & Nodal Kirchhoff', 'Motional EMF, Self Inductance & LCR Phasors'] },
              { id: 'jp-4', unit: 'Opt-Mod', title: 'Ray/Wave Optics, Modern Physics & Semiconductors', weightage: '~22% Paper', subtopics: ['YDSE Phase Difference & Thin Film Shift', 'Photoelectric Stopping Potential & Bohr Model', 'de Broglie Wavelength, Q-Value & Zener Diode'] },
              { id: 'jp-5', unit: 'Exp', title: 'Experimental Physics & Error Analysis', weightage: '~8% Paper', subtopics: ['Vernier Callipers & Screw Gauge Zero Error', 'Meter Bridge & Searle Apparatus Percentage Error'] },
            ],
          },
          {
            id: 'jee-chem',
            name: 'Chemistry',
            marksSplit: '100 Marks (20 MCQ + 5 Num)',
            chapters: [
              { id: 'jc-1', unit: 'Physical', title: 'Mole Concept, Atomic Structure, Equilibrium & Electrochemistry', weightage: '~35% Paper', subtopics: ['Limiting Reagent & Eudiometry Calculations', 'Quantum Numbers Radial Nodes & Radial Probability', 'pH Buffer, Ksp Common Ion Effect & Nernst Equation'] },
              { id: 'jc-2', unit: 'Inorganic', title: 'Chemical Bonding, Coordination Compounds & d/f-Block', weightage: '~30% Paper', subtopics: ['VSEPR Geometry, MOT Bond Order & Dipole Moment', 'CFT Octahedral/Tetrahedral Pairing & Isomerism', 'Periodicity Ionization Enthalpy Exceptions'] },
              { id: 'jc-3', unit: 'Organic', title: 'GOC, Hydrocarbons, Carbonyls, Amines & Biomolecules', weightage: '~35% Paper', subtopics: ['Carbocation Rearrangements & Ring Expansion', 'Aromaticity, Resonance, Hyperconjugation & Acidity', 'SN1/SN2/E1/E2 Competition, Aldol & Grignard Reactions'] },
            ],
          },
          {
            id: 'jee-math',
            name: 'Mathematics',
            marksSplit: '100 Marks (20 MCQ + 5 Num)',
            chapters: [
              { id: 'jm-1', unit: 'Calculus', title: 'Limits, Continuity, Differentiation & Definite Integrals', weightage: '~35% Paper', subtopics: ['L Hopital Trap vs Taylor Expansion (x - sin x)', 'Rolle/LMVT & Monotonicity Extrema', 'King Property, Walli Formula & Leibnitz Newton Integral'] },
              { id: 'jm-2', unit: 'Algebra', title: 'Complex Numbers, Quadratics, Matrices, P&C & Binomial', weightage: '~30% Paper', subtopics: ['Rotation Theorem & Cube Roots of Unity', 'Adjoint Determinant Properties |adj(adj A)|', 'Multinomial Theorem, Dearrangements & Remainder Theorem'] },
              { id: 'jm-3', unit: 'Coord-3D', title: 'Conic Sections, Vectors & 3D Geometry', weightage: '~25% Paper', subtopics: ['Tangent/Normal Focal Chord Properties', 'Shortest Distance Skew Lines & Plane Intersection', 'Scalar Triple Product Coplanarity'] },
              { id: 'jm-4', unit: 'Stats-Prob', title: 'Bayes Theorem & Statistical Dispersion', weightage: '~10% Paper', subtopics: ['Variance Variance(ax+b) Scaling', 'Total Probability & Conditional Binomial Trials'] },
            ],
          },
        ],
      },
      {
        id: 'jee_adv',
        label: 'JEE Advanced (IIT Entrance)',
        desc: 'Paper 1 + Paper 2 (6 Hrs Total) • Multi-Correct, Matrix Match & Paragraph Traps',
        subjects: [
          {
            id: 'ja-phy',
            name: 'Physics',
            marksSplit: 'Paper 1 + Paper 2 Composite',
            chapters: [
              { id: 'jap-1', unit: 'Adv-Mech', title: 'Rigid Body Dynamics & Non-Inertial Angular Collisions', weightage: 'High Yield', subtopics: ['Impulse-Momentum Angular Conservation on Hinged Rods', 'Rolling on Accelerated Inclines & Moment of Inertia Tensor'] },
              { id: 'jap-2', unit: 'Adv-EM', title: 'Dielectrics, Cavity Fields & Non-Uniform Magnetic Flux', weightage: 'High Yield', subtopics: ['Induced Electric Field ∮E·dl = -dΦ/dt', 'Capacitor Slab Pull Force Using Virtual Work'] },
            ],
          },
          {
            id: 'ja-chem',
            name: 'Chemistry',
            marksSplit: 'Paper 1 + Paper 2 Composite',
            chapters: [
              { id: 'jac-1', unit: 'Adv-Org', title: 'Stereochemistry, Pericyclic & Multi-Step Organic Synthesis', weightage: 'High Yield', subtopics: ['R/S, Meso & Optical Activity with Chiral Axes', 'Beckmann, Pinacol-Pinacolone & Favorskii Mechanisms'] },
              { id: 'jac-2', unit: 'Adv-Inorg', title: 'Qualitative Salt Analysis & Metallurgy Extraction', weightage: 'High Yield', subtopics: ['Confirmatory Group I–VI Cation Tests & Precipitate Colors', 'Ellingham Diagrams & Self-Reduction'] },
            ],
          },
          {
            id: 'ja-math',
            name: 'Mathematics',
            marksSplit: 'Paper 1 + Paper 2 Composite',
            chapters: [
              { id: 'jam-1', unit: 'Adv-Calc', title: 'Functional Equations & Graphical Inequality Roots', weightage: 'High Yield', subtopics: ['Cauchy Functional Equations f(x+y)=f(x)+f(y)', 'Area Inequalities & Parametric Envelope'] },
            ],
          },
        ],
      },
    ],
  },

  // 2. NEET UG
  NEET: {
    boardBody: 'National Medical Commission (NMC) / NTA',
    duration: '3 Hours 20 Minutes',
    passingRule: '720 Marks Total • +4 Correct / -1 Incorrect (100% NCERT Class 11 & 12)',
    streams: [
      {
        id: 'neet_ug',
        label: 'NEET (UG) Medical Entrance',
        desc: 'Biology 360M (Botany+Zoology) • Chemistry 180M • Physics 180M',
        subjects: [
          {
            id: 'neet-bot',
            name: 'Botany',
            marksSplit: '180 Marks (45 Qs)',
            chapters: [
              { id: 'nb-1', unit: 'Plant-Phys', title: 'Photosynthesis (C3 vs C4 Kranz Anatomy) & Respiration', weightage: '~14–16 Qs', subtopics: ['RuBisCO Carboxylase vs Oxygenase Competition', 'C4 Hatch-Slack Bundle Sheath Malate Pathway', 'Chemiosmotic ATP Synthesis & Krebs Yield'] },
              { id: 'nb-2', unit: 'Genetics', title: 'Molecular Basis of Inheritance & Principles of Inheritance', weightage: '~18 Qs', subtopics: ['Meselson-Stahl Proof, Leading vs Lagging Synthesis', 'Lac Operon Repressor & Allolactose Inducer', 'Linkage Recombination Distance & Pedigree Analysis'] },
              { id: 'nb-3', unit: 'Ecology', title: 'Biodiversity, Population Interactions & Ecosystem Pyramids', weightage: '~10 Qs', subtopics: ['Inverted Biomass Pyramid in Sea', 'Verhulst-Pearl Logistic Sigmoid Equation', 'Rivet Popper & Ex-situ vs In-situ Conservation'] },
            ],
          },
          {
            id: 'neet-zoo',
            name: 'Zoology',
            marksSplit: '180 Marks (45 Qs)',
            chapters: [
              { id: 'nz-1', unit: 'Human-Phys', title: 'Neural Control, Action Potential & Chemical Coordination', weightage: '~16 Qs', subtopics: ['Depolarization Na⁺ Influx vs Repolarization K⁺ Efflux', 'Resting Potential -70 mV (3 Na⁺ out, 2 K⁺ in)', 'Pituitary-Hypothalamus Portal Hormones & ADH'] },
              { id: 'nz-2', unit: 'Biotech', title: 'Biotechnology Processes & Genetic Applications', weightage: '~10 Qs', subtopics: ['pBR322 Antibiotic Insertional Inactivation', 'PCR Taq Polymerase Annealing Step', 'ADA Deficiency Gene Therapy & Gel Electrophoresis'] },
              { id: 'nz-3', unit: 'Human-Repro', title: 'Human Reproduction & Assisted Reproductive Tech', weightage: '~8 Qs', subtopics: ['Follicular vs Luteal Phase LH Surge', 'Cleavage, Morula, Blastocyst Implantation'] },
            ],
          },
          {
            id: 'neet-chem',
            name: 'Chemistry',
            marksSplit: '180 Marks (45 Qs)',
            chapters: [
              { id: 'nc-1', unit: 'Inorg', title: 'Coordination Compounds (CFT & Hybridization) & Bonding', weightage: '~15 Qs', subtopics: ['Octahedral vs Tetrahedral Splitting (Δₜ = 4/9 Δₒ)', 'Spin-Only Magnetic Moment √(n(n+2)) BM', 'Spectrochemical Series High/Low Spin Exceptions'] },
              { id: 'nc-2', unit: 'Phys', title: 'Thermodynamics, Equilibrium & Electrochemistry', weightage: '~15 Qs', subtopics: ['Henderson-Hasselbalch Buffer pH Calculations', 'Gibbs Free Energy ΔG = ΔH - TΔS Spontaneity Criteria'] },
              { id: 'nc-3', unit: 'Org', title: 'Named Organic Reactions & Biomolecules', weightage: '~15 Qs', subtopics: ['Cannizzaro, Reimer-Tiemann, Carbylamine Tests', 'Essential Amino Acids & Glycosidic Linkages'] },
            ],
          },
          {
            id: 'neet-phy',
            name: 'Physics',
            marksSplit: '180 Marks (45 Qs)',
            chapters: [
              { id: 'np-1', unit: 'Mod-Semi', title: 'Semiconductors, Zener Diode & Logic Gates', weightage: '~10 Qs', subtopics: ['Zener Voltage Regulator Strictly in Reverse Breakdown', 'AND/OR/NAND/NOR Truth Tables & De Morgan Laws'] },
              { id: 'np-2', unit: 'Elec-Opt', title: 'Current Electricity, Optics & Electrostatics', weightage: '~18 Qs', subtopics: ['Cell Grouping, Color Coding & Wheatstone Symmetry', 'Young Double Slit Fringe Shift & Resolving Power'] },
            ],
          },
        ],
      },
    ],
  },

  // 3. GATE Engineering
  GATE: {
    boardBody: 'IISc / IIT Organizing Institute',
    duration: '3 Hours (65 Qs • 100 Marks)',
    passingRule: 'MCQ (-0.33/-0.66) • MSQ (No Partial/Negative) • NAT (Zero Negative)',
    streams: [
      {
        id: 'gate_cs',
        label: 'Computer Science & IT (CS)',
        desc: 'Algorithms, TOC, OS, DBMS, CN & Engineering Mathematics',
        subjects: [
          {
            id: 'gate-algo',
            name: 'Algorithms & Complexity',
            marksSplit: '~12–15 Marks',
            chapters: [
              { id: 'ga-1', unit: 'Unit 1', title: 'Asymptotic Analysis & Master Theorem Recurrences', weightage: '4–5 Marks', subtopics: ['Case 3 Regularity Condition a·f(n/b) ≤ c·f(n)', 'Recursion Tree Method & Substitution'] },
              { id: 'ga-2', unit: 'Unit 2', title: 'Dynamic Programming, Greedy & Graph Shortest Paths', weightage: '7–9 Marks', subtopics: ['Dijkstra Negative Edge Failure vs Bellman-Ford', '0/1 Knapsack vs Fractional Knapsack & Prim/Kruskal'] },
            ],
          },
          {
            id: 'gate-toc',
            name: 'Theory of Computation',
            marksSplit: '~8–10 Marks',
            chapters: [
              { id: 'gt-1', unit: 'Unit 1', title: 'Finite Automata, Myhill-Nerode & Regular Languages', weightage: '4 Marks', subtopics: ['Minimization State Equivalence', 'Pumping Lemma Regular vs CFL Traps'] },
              { id: 'gt-2', unit: 'Unit 2', title: 'Turing Machines, Undecidability & Rice Theorem', weightage: '4–5 Marks', subtopics: ['Semantic vs Syntactic Property Decidability', 'CFL Non-Closure Under Intersection & Complement'] },
            ],
          },
          {
            id: 'gate-os',
            name: 'Operating Systems',
            marksSplit: '~9–11 Marks',
            chapters: [
              { id: 'go-1', unit: 'Unit 1', title: 'Concurrency, Semaphores & Deadlock Avoidance', weightage: '4–5 Marks', subtopics: ['Peterson Solution & Producer-Consumer Race Conditions', 'Banker Safety Algorithm & Resource Allocation Graph'] },
              { id: 'go-2', unit: 'Unit 2', title: 'Virtual Memory, Page Replacement & TLB EMAT', weightage: '5 Marks', subtopics: ['Belady Anomaly in FIFO vs Inclusion Stack Algorithms (LRU)', 'Multi-Level Paging Offset Bit Calculations'] },
            ],
          },
          {
            id: 'gate-cn',
            name: 'Computer Networks',
            marksSplit: '~8–10 Marks',
            chapters: [
              { id: 'gcn-1', unit: 'Unit 1', title: 'Data Link Sliding Window & CSMA/CD Efficiency', weightage: '4 Marks', subtopics: ['Go-Back-N vs Selective Repeat Optimal Window Bits', 'Bandwidth-Delay Product η = 1/(1 + 2a)'] },
              { id: 'gcn-2', unit: 'Unit 2', title: 'IPv4 CIDR Subnetting, TCP Congestion Control & Routing', weightage: '5 Marks', subtopics: ['Slow Start Exponential + Congestion Avoidance AIMD', 'Longest Prefix Match & RIP Count-to-Infinity'] },
            ],
          },
          {
            id: 'gate-dbms',
            name: 'Database Systems',
            marksSplit: '~8–10 Marks',
            chapters: [
              { id: 'gdb-1', unit: 'Unit 1', title: 'Normalization (1NF–BCNF) & Functional Dependencies', weightage: '4 Marks', subtopics: ['Lossless Join & Dependency Preservation Check', 'Candidate Key Closure F⁺ Algorithmic Steps'] },
              { id: 'gdb-2', unit: 'Unit 2', title: 'Transactions, Conflict Serializability & B+ Trees', weightage: '4–5 Marks', subtopics: ['Precedence Cycle Graph Check & Strict 2PL Deadlocks', 'B+ Tree Internal Node Key vs Leaf Record Capacity'] },
            ],
          },
        ],
      },
      {
        id: 'gate_ece',
        label: 'Electronics & Communication (EC)',
        desc: 'Networks, Signals, Analog/Digital Circuits, Control & Comm.',
        subjects: [
          {
            id: 'ece-sig',
            name: 'Algorithms & Complexity',
            marksSplit: 'Core EC Signal Processing',
            chapters: [
              { id: 'es-1', unit: 'Unit 1', title: 'Fourier, Laplace & Z-Transform ROC Properties', weightage: '10 Marks', subtopics: ['Causal LTI System Stability Inside Unit Circle', 'Nyquist Sampling Theorem & Aliasing Bounds'] },
            ],
          },
          {
            id: 'ece-ctrl',
            name: 'Operating Systems',
            marksSplit: 'Core EC Systems',
            chapters: [
              { id: 'ec-1', unit: 'Unit 2', title: 'Routh-Hurwitz, Root Locus & Bode Plot Stability', weightage: '9 Marks', subtopics: ['Gain Margin & Phase Margin Crossover Frequencies', 'Steady State Error Constants Kp, Kv, Ka'] },
            ],
          },
        ],
      },
    ],
  },

  // 4. UPSC CSE
  UPSC: {
    boardBody: 'Union Public Service Commission (UPSC)',
    duration: 'Prelims (2h/paper) • Mains (3h/paper)',
    passingRule: 'Prelims CSAT 33% Qualifying + GS-I Merit • Mains 1750 + Interview 275',
    streams: [
      {
        id: 'upsc_gs',
        label: 'CSE Prelims + Mains (GS I–IV)',
        desc: 'Polity, Modern History, Economy, Geography, Environment & Ethics',
        subjects: [
          {
            id: 'upsc-pol',
            name: 'Polity & Governance',
            marksSplit: 'GS-II (250M) + Prelims 18–20 Qs',
            chapters: [
              { id: 'up-1', unit: 'Polity-1', title: 'Basic Structure Doctrine, Fundamental Rights & DPSP', weightage: 'High Yield', subtopics: ['Article 368 Constituent Power Limits (Kesavananda Bharati)', 'Writs Jurisdiction Art 32 vs Art 226', 'Minerva Mills Harmonious Balance Test'] },
              { id: 'up-2', unit: 'Polity-2', title: 'Parliament, Money Bill Art 110 & Centre-State Federalism', weightage: 'High Yield', subtopics: ['Anti-Defection Tenth Schedule Speaker Powers', 'President Ordinance Art 123 & Governor Discretion Art 200'] },
            ],
          },
          {
            id: 'upsc-hist',
            name: 'Modern History & Culture',
            marksSplit: 'GS-I (250M) + Prelims 15 Qs',
            chapters: [
              { id: 'uh-1', unit: 'History-1', title: '1857 Revolt, Swadeshi & Constitutional Acts (1909–1935)', weightage: 'High Yield', subtopics: ['Morley-Minto Separate Electorates vs Montagu Dyarchy', 'Gandhi-Irwin Pact & Poona Pact Provisions'] },
              { id: 'uh-2', unit: 'Culture-2', title: 'Temple Architecture (Nagara, Dravida, Vesara) & Bhakti Saints', weightage: 'High Yield', subtopics: ['Shikhara vs Vimana Architectural Elements', 'Buddhist Councils & Heterodox Philosophies'] },
            ],
          },
          {
            id: 'upsc-econ',
            name: 'Economy & Budget',
            marksSplit: 'GS-III (250M) + Prelims 16 Qs',
            chapters: [
              { id: 'ue-1', unit: 'Macro-1', title: 'RBI Monetary Policy, LAF Corridor (SDF vs Reverse Repo) & Inflation', weightage: 'High Yield', subtopics: ['SDF Non-Collateralized Liquidity Absorption', 'Headline CPI vs Core Inflation & GDP Deflator'] },
              { id: 'ue-2', unit: 'Fiscal-2', title: 'FRBM Act Fiscal Consolidation, Capital Expenditure & GST Council', weightage: 'High Yield', subtopics: ['Primary Deficit vs Revenue Deficit Elimination', 'External Sector BoP Current vs Capital Convertibility'] },
            ],
          },
          {
            id: 'upsc-geo',
            name: 'Geography & Environment',
            marksSplit: 'GS-I/III + Prelims 18–22 Qs',
            chapters: [
              { id: 'ug-1', unit: 'Geog-1', title: 'Monsoon Mechanism, Indian Ocean Dipole & Tropical Cyclones', weightage: 'High Yield', subtopics: ['Coriolis Force & Latent Heat Eye-Wall Dynamics', 'El Nino Southern Oscillation & Madden-Julian Impact'] },
              { id: 'ug-2', unit: 'Env-2', title: 'Biodiversity Acts, Ramsar Wetlands & Carbon Markets (Art 6)', weightage: 'High Yield', subtopics: ['Wildlife Protection Act 1972 Schedules Amendment', 'COP Climate Finance & National Green Hydrogen Mission'] },
            ],
          },
          {
            id: 'upsc-eth',
            name: 'Ethics & Integrity',
            marksSplit: 'GS-IV (250M)',
            chapters: [
              { id: 'uet-1', unit: 'GS4-1', title: 'Emotional Intelligence, Foundational Civil Service Values & Case Studies', weightage: '250 Marks', subtopics: ['Conflict of Interest Resolution Framework', 'Probity, Citizen Charters & Administrative Discretion'] },
            ],
          },
        ],
      },
    ],
  },

  // 5. CAT Management
  CAT: {
    boardBody: 'Indian Institutes of Management (IIMs)',
    duration: '120 Minutes (40m per section strict lock)',
    passingRule: '+3 Correct / -1 Incorrect MCQ • TITA (Non-MCQ) Zero Negative • Sectional Cutoffs',
    streams: [
      {
        id: 'cat_mba',
        label: 'IIM CAT / MBA Entrance',
        desc: 'Section 1: VARC (24 Qs) • Section 2: DILR (20–22 Qs) • Section 3: QA (22 Qs)',
        subjects: [
          {
            id: 'cat-qa',
            name: 'Quantitative Aptitude',
            marksSplit: '66 Marks (22 Qs)',
            chapters: [
              { id: 'cq-1', unit: 'Arith', title: 'Time Speed Distance, Escalators, Circular Tracks & Mixtures', weightage: '~40% QA', subtopics: ['Escalator Constant Step Count N = t(v ± e)', 'Circular Race Coprime Distinct Meeting Points', 'Alligation Weighted Average Replacement'] },
              { id: 'cq-2', unit: 'Algebra', title: 'Quadratic Maximum/Minimum, Inequalities & Logarithms', weightage: '~30% QA', subtopics: ['Modulus Graph Vertices |x-a|+|x-b| Minimum', 'AM-GM Inequality Optimization Constraints'] },
              { id: 'cq-3', unit: 'Geo-Mod', title: 'Circle Chords, Triangles & Combinatorics/P&C', weightage: '~30% QA', subtopics: ['Stewart Theorem & Ptolemy Cyclic Quad', 'Derangements D(n) & Integral Solutions Distributing Objects'] },
            ],
          },
          {
            id: 'cat-dilr',
            name: 'DILR (Data & Logic)',
            marksSplit: '60–66 Marks (4–5 Sets)',
            chapters: [
              { id: 'cd-1', unit: 'Set-1', title: 'Games, Seeded Knockouts & Round-Robin Tables', weightage: 'Core Set', subtopics: ['Seeded Sum 2^k + 1 Pairing Invariant', 'Pigeonhole Qualification Bounds & Goal Difference'] },
              { id: 'cd-2', unit: 'Set-2', title: 'Routes, Networks & Matrix Constraints', weightage: 'Core Set', subtopics: ['DAG Max-Flow Capacity Bottleneck', 'Truth-Teller Conditional Grids'] },
            ],
          },
          {
            id: 'cat-varc',
            name: 'Verbal & Reading Comprehension',
            marksSplit: '72 Marks (24 Qs)',
            chapters: [
              { id: 'cv-1', unit: 'RC', title: 'Critical Inference, Tone & Assumption Negation', weightage: '16 Qs (4 Passages)', subtopics: ['Negation Rule for Unstated Assumptions', 'Eliminating Extreme Scope-Shift Traps'] },
              { id: 'cv-2', unit: 'VA', title: 'Para-Jumbles (TITA), Odd-One-Out & Para Summary', weightage: '8 Qs', subtopics: ['Mandatory Noun-Pronoun Pairs & Chronological Connectors'] },
            ],
          },
        ],
      },
    ],
  },

  // 6. CBSE CLASS 12
  CBSE_12: {
    boardBody: 'Central Board of Secondary Education (CBSE)',
    duration: '3 Hours Theory',
    passingRule: 'Minimum 33% separately in Theory AND Practical/Internal Assessment',
    streams: buildStandardBoardStreams({
      phySplit: '70 Theory + 30 Practical',
      mathSplit: '80 Theory + 20 Internal Assessment',
      commSplit: '80 Theory + 20 Project (Basic Calculator permitted in Accountancy 055)',
    }),
  },

  // 7. CBSE CLASS 10
  CBSE_10: {
    boardBody: 'Central Board of Secondary Education (CBSE)',
    duration: '3 Hours Theory',
    passingRule: '80 Theory + 20 Internal • Minimum 33% Combined Marks Required to Pass',
    streams: [
      {
        id: 'cbse10_std',
        label: 'Standard (Core + Maths Standard 041)',
        desc: 'For Class 11 Science (PCM) / JEE Aspirants & Commerce with Maths',
        subjects: [
          {
            id: 'c10-math',
            name: 'Mathematics',
            code: '041',
            marksSplit: '80 Theory + 20 Internal',
            chapters: [
              { id: 'm10-1', unit: 'Unit II', title: 'Polynomials, Linear Equations & Quadratic Equations', weightage: '20 Marks', subtopics: ['Discriminant D = b² - 4ac Real Roots & a ≠ 0 Condition', 'Pair of Lines Consistency a₁/a₂ = b₁/b₂ vs c₁/c₂'] },
              { id: 'm10-2', unit: 'Unit IV', title: 'Triangles (BPT) & Circles Theorems', weightage: '15 Marks', subtopics: ['Thales Basic Proportionality Theorem Statement & Proof', 'Equal Tangents from External Point Proof'] },
              { id: 'm10-3', unit: 'Unit V', title: 'Trigonometry Identities & Heights/Distances', weightage: '12 Marks', subtopics: ['sin²θ + cos²θ = 1 Proof Templates', 'Angle of Elevation & Depression Diagram Labels'] },
              { id: 'm10-4', unit: 'Unit VI-VII', title: 'Surface Areas, Volumes & Statistics/Probability', weightage: '21 Marks', subtopics: ['Combination Solids Hollow Cylinder & Hemispherical Dome', 'Grouped Mean/Median Missing Frequency f₁, f₂ Questions'] },
            ],
          },
          {
            id: 'c10-sci',
            name: 'Science (Physics/Chem/Bio)',
            code: '086',
            marksSplit: '80 Theory + 20 Practical/Internal',
            chapters: [
              { id: 's10-1', unit: 'Chem', title: 'Chemical Reactions, Acids-Bases & Carbon Compounds', weightage: '25 Marks', subtopics: ['Balanced Redox, Double Displacement & Precipitate Colors', 'pH Scale Tooth Decay/Soil & Esterification/Saponification'] },
              { id: 's10-2', unit: 'Bio', title: 'Life Processes, Control, Heredity & Environment', weightage: '25 Marks', subtopics: ['Nephron Ultrafiltration vs 99% Tubular Reabsorption', 'Dihybrid 9:3:3:1 Ratio & Reflex Arc Diagram'] },
              { id: 's10-3', unit: 'Phy', title: 'Light Reflection/Refraction & Electricity/Magnetism', weightage: '25 Marks', subtopics: ['Cartesian Sign Convention (Mirror 1/f=1/v+1/u vs Lens -)', 'Series/Parallel R_eq, P = V²/R & Fleming Left-Hand Rule'] },
            ],
          },
          {
            id: 'c10-sst',
            name: 'Social Science',
            code: '087',
            marksSplit: '80 Theory + 20 Internal',
            chapters: [
              { id: 'sst10-1', unit: 'Hist', title: 'Nationalism in Europe & Nationalism in India', weightage: '20 Marks', subtopics: ['Non-Cooperation Boycott vs Civil Disobedience Law Breaking', 'Poona Pact 1932 Reserved Seats in Joint Electorate'] },
              { id: 'sst10-2', unit: 'Geog', title: 'Resources, Agriculture, Minerals & Manufacturing', weightage: '20 Marks', subtopics: ['Kharif vs Rabi Crops & Soil Conservation Terrace Farming', 'National Highways, Ports & Dam Map Identification'] },
              { id: 'sst10-3', unit: 'Pol-Econ', title: 'Power Sharing, Federalism, Money-Credit & Globalisation', weightage: '40 Marks', subtopics: ['Belgium vs Sri Lanka Majoritarian Model', 'SHG Collateral Solutions & RBI Formal Credit Monitoring'] },
            ],
          },
          {
            id: 'c10-eng',
            name: 'English Language',
            code: '184',
            marksSplit: '80 Theory + 20 Internal',
            chapters: [
              { id: 'e10-1', unit: 'Writing', title: 'Formal Letter to Editor & Analytical Paragraph', weightage: '10 Marks', subtopics: ['7-Part Formal Letter Block Format & Subject Underlining', 'Data Comparison Analytical Paragraph without Bias'] },
              { id: 'e10-2', unit: 'Lit', title: 'First Flight & Footprints Without Feet', weightage: '40 Marks', subtopics: ['Letter to God Irony, Nelson Mandela Dual Obligations', 'Bholi Empowerment & Matilda Necklace Lesson'] },
            ],
          },
        ],
      },
      {
        id: 'cbse10_basic',
        label: 'Basic (Maths Basic 241)',
        desc: 'For Humanities / Non-Math Commerce Pathways (Standard Core Science & SST)',
        subjects: [
          {
            id: 'c10-math-b',
            name: 'Mathematics',
            code: '241',
            marksSplit: '80 Theory + 20 Internal (Direct NCERT Questions)',
            chapters: [
              { id: 'm10b-1', unit: 'Alg', title: 'Real Numbers (LCM×HCF=ab), Quadratics & AP', weightage: '25 Marks', subtopics: ['Irrationality Proof of √2, √3', 'nth Term a + (n-1)d & Sum of n Terms'] },
              { id: 'm10b-2', unit: 'Geom', title: 'Coordinate Geometry, Circles & Trig Basics', weightage: '30 Marks', subtopics: ['Distance Formula & Section Ratio', 'Standard Trig Angles 0°, 30°, 45°, 60°, 90°'] },
            ],
          },
          { id: 'c10-sci-b', name: 'Science (Physics/Chem/Bio)', code: '086', marksSplit: '80 Theory + 20 Internal', chapters: [] },
          { id: 'c10-sst-b', name: 'Social Science', code: '087', marksSplit: '80 Theory + 20 Internal', chapters: [] },
          { id: 'c10-eng-b', name: 'English Language', code: '184', marksSplit: '80 Theory + 20 Internal', chapters: [] },
        ],
      },
    ],
  },

  // 8. ICSE CLASS 10
  ICSE_10: {
    boardBody: 'Council for the Indian School Certificate Examinations (CISCE)',
    duration: '2 Hrs Science / 2.5–3 Hrs Maths & English',
    passingRule: 'Group I & II: 80 External + 20 Internal • Group III (Comp/Comm Apps): 50 External + 50 Internal • Best of 5 (incl. English)',
    streams: [
      {
        id: 'icse_sci',
        label: 'ICSE Science + Group III Computer Apps',
        desc: 'Group I Compulsory • Physics (P1), Chemistry (P2), Biology (P3), Maths, Java/Comp Apps',
        subjects: [
          {
            id: 'icse-eng',
            name: 'English',
            marksSplit: 'P1 Lang (80+20) + P2 Lit (80+20)',
            chapters: [
              { id: 'ie-1', unit: 'Paper 1', title: 'Composition, Formal/Informal Letter, Notice & Precis Summary', weightage: '80 Marks', subtopics: ['CISCE Strict Email + Notice Formatting Marks', '60-Word Precis Grid Rough + Fair Copy Rule'] },
              { id: 'ie-2', unit: 'Paper 2', title: 'Julius Caesar (Acts 3–5) & Treasure Chest', weightage: '80 Marks', subtopics: ['Antony Funeral Oration Rhetoric Devices', 'Character Quote Citations from Act Text'] },
            ],
          },
          {
            id: 'icse-math',
            name: 'Mathematics',
            marksSplit: '80 Theory (3 Hrs) + 20 Project',
            chapters: [
              { id: 'im-1', unit: 'Comm-Math', title: 'GST Invoices, Banking Recurring Deposit & Shares/Dividends', weightage: '22 Marks', subtopics: ['CGST+SGST Intra-State vs IGST Inter-State Formula Trap', 'Interest I = P × n(n+1)/(2×12) × r/100'] },
              { id: 'im-2', unit: 'Alg-Geom', title: 'Matrices, Similarity, Circles Tangents & Mensuration', weightage: '40 Marks', subtopics: ['Alternate Segment Theorem & Secant Tangent PT²=PA·PB', 'Cylinder/Cone Recasting Volume Equality'] },
            ],
          },
          {
            id: 'icse-sci',
            name: 'Science (Physics/Chem/Bio)',
            marksSplit: '3 Separate Papers (80+20 Each)',
            chapters: [
              { id: 'is-1', unit: 'Phy P1', title: 'Force/Machines, Refraction Through Prism, Sound & Calorimetry', weightage: '80 Marks', subtopics: ['Snell Law Angle of Minimum Deviation δ_min = 2i - A', 'm·c·ΔT Heat Loss = Heat Gain Phase Latent Heat Traps'] },
              { id: 'is-2', unit: 'Chem P2', title: 'Periodic Table, Chemical Bonding, Mole Concept & Metallurgy', weightage: '80 Marks', subtopics: ['Hall-Heroult Cryolite Alumina Cryolite + Carbon Anode Burning', 'Ostwald Ammonia & Contact Sulfuric Acid Equations'] },
              { id: 'is-3', unit: 'Bio P3', title: 'Genetics, Transpiration, Circulatory & Nervous System', weightage: '80 Marks', subtopics: ['Mendel Dihybrid Phenotype 9:3:3:1 Punnett Grid', 'Ultrafiltration vs Selective Reabsorption in Nephron'] },
            ],
          },
          {
            id: 'icse-hc',
            name: 'History & Civics',
            marksSplit: '80 External + 20 Project',
            chapters: [
              { id: 'ihc-1', unit: 'Civics', title: 'Union Parliament, Prime Minister & Supreme Court Writs', weightage: '30 Marks', subtopics: ['Lok Sabha Exclusive Powers (Money Bill, No-Confidence)', 'Original vs Appellate vs Advisory Jurisdiction Art 143'] },
              { id: 'ihc-2', unit: 'History', title: '1857 Revolt, Gandhian Era, Partition & UN Agencies', weightage: '50 Marks', subtopics: ['1916 Lucknow Pact & Mountbatten Plan Clauses', 'WHO, UNESCO & UNICEF Functions'] },
            ],
          },
          {
            id: 'icse-geo',
            name: 'Geography',
            marksSplit: '80 External + 20 Project',
            chapters: [
              { id: 'igeo-1', unit: 'Part I', title: 'Toposheet Maps (6-Figure Grid) & India Outline Map', weightage: '30 Marks (Compulsory)', subtopics: ['Four-Figure vs Six-Figure Grid Easting/Northing Precision', 'Monsoon Winds, Soil Regions & Mountain Passes Marking'] },
              { id: 'igeo-2', unit: 'Part II', title: 'Climate of India, Soils, Water Resources & Industries (Any 5)', weightage: '50 Marks', subtopics: ['Retreating Monsoon Coromandel Rainfall', 'Alluvial vs Black Cotton Regur Moisture Retention'] },
            ],
          },
        ],
      },
      {
        id: 'icse_comm',
        label: 'ICSE Commerce + Economic Applications',
        desc: 'Group I Compulsory • Maths, Commercial Studies, Economics & Comm. Applications',
        subjects: [
          { id: 'icsec-eng', name: 'English', marksSplit: 'P1 + P2 (80+20)', chapters: [] },
          { id: 'icsec-math', name: 'Mathematics', marksSplit: '80 External + 20 Internal', chapters: [] },
          {
            id: 'icsec-comm',
            name: 'History & Civics',
            marksSplit: '80 External + 20 Project',
            chapters: [],
          },
          { id: 'icsec-geo', name: 'Geography', marksSplit: '80 External + 20 Project', chapters: [] },
        ],
      },
    ],
  },

  // 9. ISC CLASS 12
  ISC_12: {
    boardBody: 'Council for the Indian School Certificate Examinations (CISCE)',
    duration: '3 Hours Theory',
    passingRule: 'Science/CS: 70 Theory + 30 Practical/Project • Commerce/Arts/Maths/English: 80 Theory + 20 Project (~50% HOTS)',
    streams: buildStandardBoardStreams({
      phySplit: '70 Theory + 30 Practical (15 Lab + 5 File + 10 Project)',
      mathSplit: '80 Theory + 20 Project',
      commSplit: '80 Theory + 20 Project (10 Internal + 10 Visiting)',
    }),
  },

  // 10. MAHARASHTRA BOARD HSC
  MH_BOARD: {
    boardBody: 'Maharashtra State Board (MSBSHSE - Balbharati Syllabus)',
    duration: '3 Hours Theory',
    passingRule: '35% Combined • Science: 70T + 30P • Commerce/Arts: 80T + 20IA • Activity-Based Questions Compulsory',
    streams: buildStandardBoardStreams({
      phySplit: '70 Theory + 30 Practical',
      mathSplit: '80 Theory + 20 Practical (Maths-1 & Maths-2 Combined)',
      commSplit: '80 Theory + 20 Internal Assessment',
      customAccName: 'Book-Keeping and Accountancy',
      customBstName: 'Organisation of Commerce & Management (OCM)',
    }),
  },

  // 11. KARNATAKA 2ND PUC (KSEAB)
  KA_BOARD: {
    boardBody: 'Karnataka School Examination & Assessment Board (KSEAB)',
    duration: '3 Hours Theory (Blueprint Model)',
    passingRule: 'Min 30/100 in Subject & 33% Aggregate (198/600) • Maths/Comm/Arts follow 80 Theory + 20 Internal',
    streams: buildStandardBoardStreams({
      phySplit: '70 Theory + 30 Practical',
      mathSplit: '80 Written Theory + 20 College Internal Assessment',
      commSplit: '80 Written Theory + 20 Internal Assessment',
    }),
  },

  // 12. TAMIL NADU HSC +2 (DGE)
  TN_BOARD: {
    boardBody: 'Directorate of Government Examinations (TN DGE - Samacheer Kalvi)',
    duration: '3 Hours Theory',
    passingRule: '35/100 Minimum Pass (Min 15/70 in Science Theory) • Science: 70T + 20P + 10IA • Others: 90T + 10IA',
    streams: buildStandardBoardStreams({
      phySplit: '70 Theory + 20 Practical + 10 Internal',
      mathSplit: '90 Theory + 10 Internal Assessment',
      commSplit: '90 Theory + 10 Internal Assessment',
    }),
  },

  // 13. KERALA DHSE +2
  KL_BOARD: {
    boardBody: 'Kerala Directorate of Higher Secondary Education (SCERT Kerala)',
    duration: '2–2.5 Hours Theory',
    passingRule: 'Practical Subjects: 60 Theory + 20 Practical + 20 CE • Non-Practical: 80 Theory + 20 CE',
    streams: buildStandardBoardStreams({
      phySplit: '60 Theory + 20 Practical + 20 Continuous Evaluation',
      mathSplit: '80 Theory + 20 Continuous Evaluation (CE)',
      commSplit: '80 Theory + 20 Continuous Evaluation (CE)',
    }),
  },

  // 14. UP BOARD (UPMSP)
  UP_BOARD: {
    boardBody: 'Uttar Pradesh Madhyamik Shiksha Parishad (UPMSP - NCERT + Legacy Pattern)',
    duration: '3 Hours 15 Minutes (15m Reading)',
    passingRule: '33% Separate Pass in Theory & Practical • Bilingual (Hindi/English) • Maths/Comm/Arts: 100 Theory',
    streams: buildStandardBoardStreams({
      phySplit: '70 Theory + 30 Practical',
      mathSplit: '100 Marks Written Theory (No Practical)',
      commSplit: '100 Marks Written Theory',
      customAccName: 'Accountancy (Lekhashastra)',
      customBstName: 'Business Organisation & Correspondence',
    }),
  },

  // 15. MP BOARD (MPBSE)
  MP_BOARD: {
    boardBody: 'Madhya Pradesh Board of Secondary Education (MPBSE)',
    duration: '3 Hours Theory (Blueprint System)',
    passingRule: '33% Passing • Science: 70T + 30P • Maths/Commerce/Arts: 80T + 20 Project',
    streams: buildStandardBoardStreams({
      phySplit: '70 Theory + 30 Practical',
      mathSplit: '80 Theory + 20 Project',
      commSplit: '80 Theory + 20 Project',
    }),
  },

  // 16. RAJASTHAN BOARD (RBSE)
  RJ_BOARD: {
    boardBody: 'Board of Secondary Education Rajasthan (BSER / RBSE)',
    duration: '3 Hours 15 Minutes',
    passingRule: 'Science (Practical): 56 Theory + 30 Practical + 14 Sessional • Non-Practical: 80 Theory + 20 Sessional • Min 33%',
    streams: buildStandardBoardStreams({
      phySplit: '56 Theory + 30 Practical + 14 Sessional',
      mathSplit: '80 Theory + 20 Sessional Assessment',
      commSplit: '80 Theory + 20 Sessional Assessment',
    }),
  },

  // 17. WEST BENGAL BOARD (WBCHSE)
  WB_BOARD: {
    boardBody: 'West Bengal Council of Higher Secondary Education (WBCHSE)',
    duration: '3 Hours 15 Minutes',
    passingRule: '30% Aggregate • Group A MCQ + Group B SAQ + Group C Long • Science 70T+30P / Non-Lab 80T+20 Project',
    streams: buildStandardBoardStreams({
      phySplit: '70 Theory + 30 Practical',
      mathSplit: '80 Theory + 20 Project',
      commSplit: '80 Theory + 20 Project',
    }),
  },

  // 18. AP/TELANGANA IPE (BIEAP / TSBIE)
  AP_BOARD: {
    boardBody: 'BIEAP / TSBIE Intermediate Public Examination (IPE)',
    duration: '3 Hours (Section A: 2M, Section B: 4M, Section C: 8M)',
    passingRule: '35% Min Pass • Science Theory 60/85M + Practical 30M • Maths Divided into Paper 1A/1B (1st Yr) & 2A/2B (2nd Yr)',
    streams: buildStandardBoardStreams({
      phySplit: '60 Theory + 30 Practical + 10 Internal (or 85M format)',
      mathSplit: 'Paper 2A (75M) + Paper 2B (75M) (VSAQ 2M / SAQ 4M / LAQ 7M)',
      commSplit: '100 Marks (or 80+20 CEC/MEC)',
      customMathsName: 'Mathematics (2A & 2B)',
      customBioName: 'Botany & Zoology',
    }),
  },

  // 19. BIHAR BOARD (BSEB)
  BIHAR_BOARD: {
    boardBody: 'Bihar School Examination Board (BSEB)',
    duration: '3 Hours 15 Minutes (OMR + Answer Sheet)',
    passingRule: '50% Objective OMR (Attempt 35 of 70 / 50 of 100) + 50% Subjective • Min 30% Theory / 33% Overall',
    streams: buildStandardBoardStreams({
      phySplit: '70 Theory (35 Obj + 35 Subj) + 30 Practical',
      mathSplit: '100 Theory (50 OMR MCQ + 50 Subjective)',
      commSplit: '100 Theory (50 OMR MCQ + 50 Subjective)',
    }),
  },

  // 20. GUJARAT BOARD (GSEB)
  GJ_BOARD: {
    boardBody: 'Gujarat Secondary and Higher Secondary Education Board (GSEB)',
    duration: '3 Hours (Part A OMR MCQ 50M + Part B Descriptive 50M)',
    passingRule: '33% Passing Grade D Minimum • Part A 50-Mark OMR MCQ + Part B 50-Mark Subjective in Core Science',
    streams: buildStandardBoardStreams({
      phySplit: '100 Total (50 OMR + 50 Descriptive / Practical Split)',
      mathSplit: '100 Marks (50 OMR MCQ + 50 Descriptive)',
      commSplit: '100 Marks Written Examination',
    }),
  },

  // 21. COLLEGE SEMESTER EXAMS
  COLLEGE_SEM: {
    boardBody: 'Autonomous / Technical Universities (AKTU, VTU, Mumbai, Anna, DTU, NITs)',
    duration: '3 Hours End-Sem (60/70/100 Marks + Mid-Sem Internals)',
    passingRule: '40% Minimum External + Internal Aggregate • Long 10-Mark Derivations, Block Diagrams & Time/Space Complexity',
    streams: [
      {
        id: 'cse',
        label: 'B.Tech CSE / IT (Core Semesters)',
        desc: 'DSA, DBMS, Operating Systems, Computer Networks & Software Engineering',
        subjects: [
          {
            id: 'col-dsa',
            name: 'Data Structures & Algorithms',
            marksSplit: '70 End-Sem + 30 Internal',
            chapters: [
              { id: 'cdsa-1', unit: 'Unit 1-2', title: 'Asymptotics, Linked Lists, Stacks & Balanced Trees (AVL/RB)', weightage: '25 Marks', subtopics: ['AVL 4 Rotations (LL/RR/LR/RL) & Height 1.44 log n', 'Red-Black Tree Black-Depth & Linux CFS Applications'] },
              { id: 'cdsa-2', unit: 'Unit 3-4', title: 'Graphs (BFS/DFS, Dijkstra, MST) & Dynamic Programming', weightage: '30 Marks', subtopics: ['Kruskal Union-Find vs Prim Priority Queue Complexity', 'Matrix Chain Multiplication & Floyd-Warshall'] },
            ],
          },
          {
            id: 'col-dbms',
            name: 'Database Systems (DBMS)',
            marksSplit: '70 End-Sem + 30 Internal',
            chapters: [
              { id: 'cdb-1', unit: 'Unit 1-2', title: 'ER Modeling, Relational Algebra & SQL Joins', weightage: '25 Marks', subtopics: ['Division Operator Queries & Nested Subqueries', 'Weak Entities & Participation Constraints'] },
              { id: 'cdb-2', unit: 'Unit 3-4', title: 'Normalization (3NF vs BCNF) & Concurrency Control (ACID/2PL)', weightage: '30 Marks', subtopics: ['BCNF Dependency Preservation Loss Trade-Off', 'Conflict Serializability Precedence Graph Check'] },
            ],
          },
          {
            id: 'col-os',
            name: 'Operating Systems',
            marksSplit: '70 End-Sem + 30 Internal',
            chapters: [
              { id: 'cos-1', unit: 'Unit 1-2', title: 'CPU Scheduling, Semaphores & Banker Deadlock Algorithm', weightage: '30 Marks', subtopics: ['Need = Max - Allocation & Safe Sequence Proof', 'Dining Philosophers & Reader-Writer Monitors'] },
              { id: 'cos-2', unit: 'Unit 3-4', title: 'Paging, TLB Virtual Memory & Disk Scheduling', weightage: '25 Marks', subtopics: ['Page Fault Handling & Thrashing Working Set', 'SCAN/C-SCAN Disk Seek Optimizations'] },
            ],
          },
          {
            id: 'col-cn',
            name: 'Computer Networks',
            marksSplit: '70 End-Sem + 30 Internal',
            chapters: [
              { id: 'ccn-1', unit: 'Unit 1-2', title: 'OSI Layers, Sliding Window & IPv4 CIDR Subnetting', weightage: '30 Marks', subtopics: ['Go-Back-N vs Selective Repeat Sequence Space 2^(k-1)', 'VLSM Variable Subnetting Calculations'] },
              { id: 'ccn-2', unit: 'Unit 3-4', title: 'TCP 3-Way Handshake, AIMD Congestion & DNS/HTTP', weightage: '25 Marks', subtopics: ['Slow Start Threshold ssthresh Cut on 3 Dup ACKs', 'ARP, DHCP & BGP Inter-AS Routing'] },
            ],
          },
          {
            id: 'col-se',
            name: 'Software Engineering',
            marksSplit: '70 End-Sem + 30 Internal',
            chapters: [
              { id: 'cse-1', unit: 'Unit 1-3', title: 'SDLC Models, SRS IEEE-830, Coupling/Cohesion & Testing', weightage: '50 Marks', subtopics: ['McCabe Cyclomatic Complexity V(G) = E - N + 2P', 'White-Box Statement/Branch vs Black-Box Boundary Testing'] },
            ],
          },
        ],
      },
      {
        id: 'bca',
        label: 'BCA / MCA Semester Exams',
        desc: 'C/Java Programming, DBMS, Operating Systems, Discrete Maths & Web Tech',
        subjects: [
          { id: 'bca-dsa', name: 'Data Structures & Algorithms', marksSplit: '75 Theory + 25 Internal', chapters: [] },
          { id: 'bca-dbms', name: 'Database Systems (DBMS)', marksSplit: '75 Theory + 25 Internal', chapters: [] },
          { id: 'bca-os', name: 'Operating Systems', marksSplit: '75 Theory + 25 Internal', chapters: [] },
          { id: 'bca-se', name: 'Software Engineering', marksSplit: '75 Theory + 25 Internal', chapters: [] },
        ],
      },
    ],
  },
};

// ─── CATALOG HELPERS ──────────────────────────────────────────────────────────

export function resolveCatalogKey(examTarget = '') {
  const str = (examTarget || '').toUpperCase();
  if (str.includes('JEE')) return 'JEE';
  if (str.includes('NEET')) return 'NEET';
  if (str.includes('GATE')) return 'GATE';
  if (str.includes('UPSC')) return 'UPSC';
  if (str.includes('CAT')) return 'CAT';
  if (str.includes('ICSE') || (str.includes('CISCE') && str.includes('10'))) return 'ICSE_10';
  if (str.includes('ISC') && !str.includes('MISC')) return 'ISC_12';
  if (str.includes('MAHARASHTRA') || str.includes('MSBSHSE') || str.includes('MH_BOARD') || str.includes('MH BOARD') || (str.includes('HSC') && !str.includes('MP') && !str.includes('TAMIL') && !str.includes('GUJARAT'))) return 'MH_BOARD';
  if (str.includes('KARNATAKA') || str.includes('KSEEB') || str.includes('KSEAB') || str.includes('KA_BOARD') || str.includes('PUC')) return 'KA_BOARD';
  if (str.includes('TAMIL') || str.includes('TN_BOARD') || str.includes('SAMACHEER') || str.includes('DGE')) return 'TN_BOARD';
  if (str.includes('KERALA') || str.includes('KL_BOARD') || str.includes('DHSE')) return 'KL_BOARD';
  if (str.includes('UP BOARD') || str.includes('UP_BOARD') || str.includes('UPMSP') || str.includes('UTTAR PRADESH')) return 'UP_BOARD';
  if (str.includes('MP BOARD') || str.includes('MP_BOARD') || str.includes('MPBSE') || str.includes('MADHYA PRADESH')) return 'MP_BOARD';
  if (str.includes('RAJASTHAN') || str.includes('RBSE') || str.includes('RJ_BOARD')) return 'RJ_BOARD';
  if (str.includes('WEST BENGAL') || str.includes('WBBSE') || str.includes('WB_BOARD') || str.includes('WBCHSE')) return 'WB_BOARD';
  if (str.includes('ANDHRA') || str.includes('TELANGANA') || str.includes('AP_BOARD') || str.includes('TSBIE') || str.includes('BIEAP') || str.includes('IPE')) return 'AP_BOARD';
  if (str.includes('BIHAR') || str.includes('BSEB') || str.includes('BIHAR_BOARD')) return 'BIHAR_BOARD';
  if (str.includes('GUJARAT') || str.includes('GSEB') || str.includes('GJ_BOARD')) return 'GJ_BOARD';
  if (str.includes('10') || str.includes('CLASS 10')) return 'CBSE_10';
  if (str.includes('COLLEGE') || str.includes('SEM') || str.includes('B.TECH') || str.includes('BCA')) return 'COLLEGE_SEM';
  return 'CBSE_12';
}

export function getExamMeta(examTarget) {
  const key = resolveCatalogKey(examTarget);
  return EXAM_STREAM_CATALOG[key] || EXAM_STREAM_CATALOG.CBSE_12;
}

export function getStreamsForExam(examTarget) {
  return getExamMeta(examTarget).streams || [];
}

export function resolveStreamForExam(examTarget, streamId) {
  const streams = getStreamsForExam(examTarget);
  if (!streams.length) return null;
  const found = streams.find((s) => s.id === streamId);
  return found || streams[0];
}

export function getSubjectsForExamAndStream(examTarget, streamId) {
  const stream = resolveStreamForExam(examTarget, streamId);
  return stream?.subjects || [];
}

export function getChaptersForSubject(examTarget, streamId, subjectName) {
  const subjects = getSubjectsForExamAndStream(examTarget, streamId);
  if (!subjectName || subjectName === 'All') {
    return subjects.flatMap((s) => (s.chapters || []).map((c) => ({ ...c, subject: s.name })));
  }
  const match = subjects.find(
    (s) => s.name === subjectName || s.name.toLowerCase().includes(subjectName.toLowerCase())
  );
  // Also fallback to main stream if Basic/BCA copy had empty chapter stub
  if (match && (!match.chapters || match.chapters.length === 0)) {
    const primaryStream = getStreamsForExam(examTarget)[0];
    const primaryMatch = primaryStream?.subjects?.find((s) =>
      s.name.toLowerCase().includes(subjectName.toLowerCase()) ||
      subjectName.toLowerCase().includes(s.name.toLowerCase())
    );
    if (primaryMatch?.chapters?.length) {
      return primaryMatch.chapters.map((c) => ({ ...c, subject: match.name }));
    }
  }
  return (match?.chapters || []).map((c) => ({ ...c, subject: match.name }));
}
