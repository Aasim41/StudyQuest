const fs = require('fs');

const targetPath = 'C:/Users/aasim/.gemini/antigravity/scratch/StudyQuest/frontend/src/config/studyGuideData.js';

// We will load the data, inject new verified topics directly into the objects, and rewrite.
// Since studyGuideData.js uses ES module syntax ("export const ..."), we can parse and edit safely or use a node transformer.
let fileContent = fs.readFileSync(targetPath, 'utf8');

// Helper to append topics into a specific exam block in the source code
function appendTopicsToExam(examKey, newTopics) {
  const examRegex = new RegExp(`(${examKey}:\\s*\\{[\\s\\S]*?topics:\\s*\\[)([\\s\\S]*?)(\\]\\s*,\\s*\\n\\s*\\})`);
  const match = fileContent.match(examRegex);
  if (!match) {
    console.error('Could not find exam block for:', examKey);
    return false;
  }
  
  const existingTopics = match[2].trim();
  const topicsJson = newTopics.map(t => JSON.stringify(t, null, 6).replace(/^/gm, '      ')).join(',\n');
  const separator = existingTopics.length > 0 ? ',\n' : '';
  const updatedBlock = match[1] + match[2] + separator + topicsJson + '\n    ' + match[3];
  
  fileContent = fileContent.replace(examRegex, updatedBlock);
  console.log('Appended ' + newTopics.length + ' topics to ' + examKey);
  return true;
}

// 1. CBSE_12 - Add English Core
appendTopicsToExam('CBSE_12', [
  {
    id: 'cbse12-eng-notemaking',
    subject: 'English Core',
    title: 'Note-Making & Abbreviation Key Format',
    examRelevance: 'CBSE 12th Board Reading Skills 5-Marker Guaranteed',
    blindspotCount: 2,
    summary: 'Heading, sub-headings (numbered 1.1, 1.2), indentation, and minimum 4 abbreviations with a dedicated key box.',
    aiBlindspots: [
      {
        point: 'Abbreviation Key Box and Strict Indentation Missing',
        whatAiSays: 'Generic AI outputs notes as bullet points with complete sentences.',
        whatAiMisses: 'CBSE marking scheme strictly deducts marks if full sentences are used in notes. Notes MUST be concise phrases with numbering (1, 1.1, 1.2). A boxed \"Key to Abbreviations\" with at least 4 standard/invented abbreviations is mandatory for full marks.',
        examinerRubric: '1 mark for Title, 2 marks for Numbering & Indentation (no full sentences), 1 mark for Key to Abbreviations (in a box), 1 mark for Summary within 50 words.'
      }
    ],
    coreConcepts: [
      'Format: Title at top, Headings 1, 2, 3 with sub-headings 1.1, 1.2, 1.3.',
      'No full grammatical sentences; use abbreviations and symbols (&, %, w/o).',
      'Boxed Key to Abbreviations containing at least 4 abbreviations used in the text.'
    ],
    examQuestions: [
      {
        question: 'What are the essential elements required in the CBSE Class 12 Note-Making format to secure full 5 marks?',
        marks: 5,
        keyPoints: [
          'Appropriate, concise Title reflecting the central theme (1 mark).',
          'Logical division into at least 3-4 main headings with sub-headings using decimal/letter indentation (2 marks).',
          'Use of phrases only (no complete sentences).',
          'Boxed Key to Abbreviations containing 4-6 abbreviations used in notes (1 mark).',
          'Summary written within the 50-word limit based only on the notes (1 mark).'
        ]
      }
    ],
    quiz: [
      {
        question: 'In CBSE Class 12 Note-Making, which of the following results in a mark deduction?',
        options: [
          'Using abbreviations like \"info.\" for information',
          'Writing complete grammatical sentences in the notes',
          'Putting the Key to Abbreviations in a rectangular box',
          'Using numbers like 1.1 and 1.2 for sub-headings'
        ],
        correctIndex: 1,
        explanation: 'CBSE evaluation guidelines strictly state that notes must be in phrases, not complete grammatical sentences.'
      }
    ]
  }
]);

// 2. NEET - Add Chemistry & Physics
appendTopicsToExam('NEET', [
  {
    id: 'neet-chem-coord-cft',
    subject: 'Chemistry',
    title: 'Coordination Compounds: Crystal Field Splitting (Octahedral vs Tetrahedral)',
    examRelevance: 'NEET 4-Marker Guaranteed (Every Year)',
    blindspotCount: 3,
    summary: 'Degeneracy removal of d-orbitals in octahedral vs tetrahedral crystal fields, pairing energy P, and high-spin vs low-spin complexes.',
    aiBlindspots: [
      {
        point: 'Pairing Energy vs Crystal Field Splitting Δ_o',
        whatAiSays: 'Generic AI calculates magnetic moments without comparing Δ_o to pairing energy P.',
        whatAiMisses: 'For d4 to d7 configurations in octahedral fields, if Δ_o < P, weak field ligands produce high-spin (t2g^3 eg^1 for d4). If Δ_o > P, strong field ligands produce low-spin pairing (t2g^4 eg^0). Tetrahedral Δ_t = (4/9)Δ_o is almost always high spin because Δ_t is rarely greater than P.',
        examinerRubric: 'Examiners award +4 marks for correctly identifying t2g vs eg electron distribution and spin-only magnetic moment formula μ = sqrt(n(n+2)) BM.'
      }
    ],
    coreConcepts: [
      'Octahedral splitting: d-orbitals split into lower energy t2g (dxy, dyz, dxz) and higher energy eg (dx2-y2, dz2) by energy Δ_o.',
      'Tetrahedral splitting: Inverted with lower e and higher t2; Δ_t = (4/9)Δ_o.',
      'Spectrochemical Series: I- < Br- < S2- < SCN- < Cl- < NO3- < F- < OH- < C2O4(2-) < H2O < NCS- < edta4- < NH3 < en < CN- < CO.'
    ],
    examQuestions: [
      {
        question: 'Calculate the spin-only magnetic moment of [CoF6]3- (Atomic number of Co = 27).',
        marks: 4,
        keyPoints: [
          'Co oxidation state is +3: Co(III) electronic configuration is [Ar] 3d6.',
          'F- is a weak field ligand (halide), so Δ_o < P (Pairing Energy).',
          'High-spin configuration: t2g^4 eg^2.',
          'Number of unpaired electrons n = 4.',
          'Spin-only magnetic moment μ = sqrt(4(4+2)) = sqrt(24) ≈ 4.90 BM.'
        ]
      }
    ],
    quiz: [
      {
        question: 'Which of the following complex ions is diamagnetic (has zero unpaired electrons)?',
        options: ['[Fe(CN)6]3-', '[Co(NH3)6]3+', '[FeF6]3-', '[NiCl4]2-'],
        correctIndex: 1,
        explanation: 'Co3+ is 3d6. NH3 acts as a strong field ligand with Co3+, causing Δ_o > P. All 6 electrons pair up into t2g^6 eg^0, giving n = 0 unpaired electrons (diamagnetic).'
      }
    ]
  },
  {
    id: 'neet-phy-semiconductor-diode',
    subject: 'Physics',
    title: 'Semiconductor Diodes: Forward vs Reverse Bias & Zener Breakdown',
    examRelevance: 'NEET 4-Marker Guaranteed (Modern Physics)',
    blindspotCount: 2,
    summary: 'Depletion layer width, barrier potential, V-I characteristics, and Zener diode voltage regulation in reverse breakdown.',
    aiBlindspots: [
      {
        point: 'Zener Diode Operates STRICTLY in Reverse Bias',
        whatAiSays: 'Generic AI states Zener diode regulates voltage under both biases.',
        whatAiMisses: 'In forward bias, a Zener diode behaves just like an ordinary p-n junction diode (cuts in at ~0.7V). It acts as a voltage regulator ONLY in the reverse breakdown (avalanche/Zener) region where voltage remains constant at V_z across a wide range of reverse current.',
        examinerRubric: '+4 for: (1) Connected in reverse bias in parallel with load, (2) Current limiting resistor R_s calculation.'
      }
    ],
    coreConcepts: [
      'Forward bias: External voltage opposes barrier potential; depletion layer narrows; current flows exponentially (mA).',
      'Reverse bias: External voltage aids barrier potential; depletion layer widens; only minority carrier drift current (μA).',
      'Zener breakdown: Heavily doped diode with very thin depletion layer (< 10^-6 m); high electric field breaks covalent bonds.'
    ],
    examQuestions: [
      {
        question: 'In a Zener regulated power supply, a 10V Zener diode is used for regulation. If unregulated DC input is 15V and load resistor is 1 kΩ with minimum Zener current 5 mA, calculate the series resistance R_s.',
        marks: 4,
        keyPoints: [
          'Voltage across load V_L = V_Z = 10V.',
          'Load current I_L = V_L / R_L = 10V / 1000Ω = 10 mA = 0.01 A.',
          'Total current through series resistor I = I_Z + I_L = 5 mA + 10 mA = 15 mA.',
          'Voltage drop across series resistor V_R = V_in - V_Z = 15V - 10V = 5V.',
          'Series resistance R_s = V_R / I = 5V / 0.015A = 333.33 Ω.'
        ]
      }
    ],
    quiz: [
      {
        question: 'When a p-n junction diode is reverse biased, the depletion layer:',
        options: [
          'Increases in width',
          'Decreases in width',
          'Remains constant',
          'Disappears completely'
        ],
        correctIndex: 0,
        explanation: 'In reverse bias, the positive battery terminal attracts electrons in n-region and negative terminal attracts holes in p-region, pulling majority carriers away from the junction and widening the depletion layer.'
      }
    ]
  }
]);

// 3. GATE - Add TOC & Operating Systems & Computer Networks
appendTopicsToExam('GATE', [
  {
    id: 'gate-toc-decidability',
    subject: 'Theory of Computation',
    title: 'Decidability, Rice Theorem & CFL Closure Properties',
    examRelevance: 'GATE CS 2-Mark Decider Question',
    blindspotCount: 3,
    summary: 'Rice Theorem condition application, Halting Problem reduction, and Context-Free Language non-closure under intersection.',
    aiBlindspots: [
      {
        point: 'Rice Theorem Applies ONLY to Semantic Properties of RE Languages',
        whatAiSays: 'Generic AI applies Rice theorem to syntactic questions about Turing Machines like \"Does TM have 5 states?\".',
        whatAiMisses: 'Rice Theorem applies STRICTLY to semantic properties of the language recognized by the TM (i.e. L(M)), NOT the TM description or encoding itself. \"Does M have 5 states?\" is DECIDABLE by inspecting the finite state table. \"Is L(M) regular?\" is UNDECIDABLE by Rice Theorem because it is a non-trivial property of the RE language.',
        examinerRubric: '+2 marks for checking: (1) Is the property about L(M)? (2) Is it non-trivial (satisfied by at least one but not all RE languages)?'
      }
    ],
    coreConcepts: [
      'CFL Closure: Context-Free Languages are closed under Union, Concatenation, and Kleene Star; but NOT closed under Intersection or Complement.',
      'Rice Theorem (Part 1): Any non-trivial property of the language recognized by a Turing Machine is undecidable.',
      'Halting Problem: Given TM M and input w, determining whether M halts on w is undecidable but Turing-recognizable (semi-decidable).'
    ],
    examQuestions: [
      {
        question: 'Which of the following problems is decidable for Context-Free Languages: (A) Emptiness (Is L = ∅?), (B) Universality (Is L = Σ*?), (C) Equivalence (Is L1 = L2?)',
        marks: 2,
        keyPoints: [
          'Emptiness (Is L = ∅?): DECIDABLE for CFLs using CFG reachability algorithm (eliminate non-generating symbols).',
          'Universality (Is L = Σ*?): UNDECIDABLE for CFLs (reducible from valid computation history of TM).',
          'Equivalence (Is L1 = L2?): UNDECIDABLE for CFLs.',
          'Correct answer: Only Emptiness is decidable.'
        ]
      }
    ],
    quiz: [
      {
        question: 'Let L1 and L2 be two context-free languages. Which of the following is NOT guaranteed to be context-free?',
        options: ['L1 ∪ L2', 'L1 · L2', 'L1 ∩ L2', 'L1*'],
        correctIndex: 2,
        explanation: 'Context-free languages are NOT closed under intersection (e.g., L1 = {a^n b^n c^m} and L2 = {a^m b^n c^n} are both CFLs, but their intersection is {a^n b^n c^n}, which is not context-free).'
      }
    ]
  },
  {
    id: 'gate-os-virtual-memory',
    subject: 'Operating Systems',
    title: 'Virtual Memory: Belady Anomaly & Inverted Page Tables',
    examRelevance: 'GATE CS 2-Mark Numerical Question',
    blindspotCount: 2,
    summary: 'Page replacement algorithms (FIFO vs LRU vs Optimal), page fault rate, and Belady anomaly conditions.',
    aiBlindspots: [
      {
        point: 'Belady Anomaly Exists in FIFO but NEVER in Stack Algorithms (LRU/OPT)',
        whatAiSays: 'Generic AI states that increasing page frame allocation always decreases page faults.',
        whatAiMisses: 'FIFO suffers from Belady Anomaly, where increasing the number of allocated physical frames actually INCREASES page faults for certain reference strings (e.g. 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5). Stack algorithms (LRU, LFU, Optimal) mathematically satisfy the inclusion property: page set with n frames is a subset of page set with n+1 frames, so Belady anomaly is mathematically impossible.',
        examinerRubric: '+2 for identifying inclusion property of stack algorithms.'
      }
    ],
    coreConcepts: [
      'Page Fault: Generated by MMU hardware trap when the valid-invalid bit in the page table entry is 0 (page not in physical RAM).',
      'Effective Memory Access Time (EMAT): EMAT = (1 - p) * t_mem + p * t_fault (where p is page fault rate).',
      'Belady Anomaly: More page frames leading to more page faults in FIFO replacement.'
    ],
    examQuestions: [
      {
        question: 'A system has a memory access time of 100 ns. Page fault service time is 10 ms (10,000,000 ns). What is the maximum acceptable page fault rate p to achieve an effective memory access time of no more than 200 ns?',
        marks: 2,
        keyPoints: [
          'EMAT = (1 - p) * 100 + p * 10,000,000 ≤ 200.',
          '100 - 100p + 10,000,000p ≤ 200.',
          '9,999,900p ≤ 100.',
          'p ≤ 100 / 9,999,900 ≈ 10^-5 (or 0.001%).'
        ]
      }
    ],
    quiz: [
      {
        question: 'Which of the following page replacement algorithms is immune to Belady Anomaly?',
        options: ['FIFO', 'Second-Chance', 'LRU (Least Recently Used)', 'Random'],
        correctIndex: 2,
        explanation: 'LRU is a stack algorithm satisfying the inclusion property (the set of pages in an n-frame system is always a subset of an (n+1)-frame system), making Belady anomaly impossible.'
      }
    ]
  }
]);

// 4. UPSC - Add Economy & Geography
appendTopicsToExam('UPSC', [
  {
    id: 'upsc-econ-monetary-policy',
    subject: 'Economy & Budget',
    title: 'Monetary Policy Framework: MPC, Liquidity Adjustment Facility (LAF) & Inflation Targeting',
    examRelevance: 'UPSC Prelims 2-4 Questions & Mains GS3 15-Marker',
    blindspotCount: 3,
    summary: 'RBI Monetary Policy Committee (6 members), repo rate vs standing deposit facility (SDF), and flexible inflation targeting (4% ± 2%).',
    aiBlindspots: [
      {
        point: 'SDF Requires NO Collateral Unlike Reverse Repo',
        whatAiSays: 'Generic AI defines reverse repo and standing deposit facility as the exact same thing.',
        whatAiMisses: 'Under Reverse Repo, RBI MUST provide government securities as collateral to commercial banks. Under the Standing Deposit Facility (SDF, introduced 2022 under Section 17 of RBI Act), RBI absorbs excess liquidity from banks WITHOUT pledging any collateral/government securities. This enables unconstrained liquidity absorption without depleting RBI G-Sec portfolio.',
        examinerRubric: 'Mains GS3: 5 marks for LAF corridor diagram (MSF at top, Repo in middle, SDF at bottom), 5 marks for collateral distinction, 5 marks for transmission challenges.'
      }
    ],
    coreConcepts: [
      'MPC Composition: 6 members (3 from RBI including Governor with casting vote, 3 external experts appointed by Central Government for 4 years).',
      'Flexible Inflation Targeting (FIT): Target is 4% CPI headline inflation with tolerance band of 2% to 6% under RBI Act 1934.',
      'Policy Corridor: Marginal Standing Facility (MSF) rate as upper bound (Repo + 25 bps), Policy Repo Rate in middle, Standing Deposit Facility (SDF) as floor (Repo - 25 bps).'
    ],
    examQuestions: [
      {
        question: 'Examine the operational mechanics of the Liquidity Adjustment Facility (LAF) corridor. How did the introduction of the Standing Deposit Facility (SDF) strengthen RBI liquidity absorption framework?',
        marks: 15,
        keyPoints: [
          'LAF corridor structure: MSF (ceiling) and SDF (floor) symmetric around the policy Repo rate.',
          'Pre-SDF constraint: Reverse repo required RBI to pledge government securities, limiting absorption capacity during demonetization or huge forex inflows.',
          'SDF innovation: Non-collateralized window allowing commercial banks to park unlimited overnight liquidity with RBI.',
          'Financial stability benefit: Prevents distortion in collateral markets and provides clean monetary transmission.'
        ]
      }
    ],
    quiz: [
      {
        question: 'Under the Reserve Bank of India framework, what is the key difference between the Standing Deposit Facility (SDF) and the traditional Reverse Repo window?',
        options: [
          'SDF charges a higher penalty interest rate',
          'SDF operates without requiring the RBI to provide collateral (G-Secs)',
          'SDF is accessible only to non-banking financial companies (NBFCs)',
          'SDF requires approval from the Union Finance Minister'
        ],
        correctIndex: 1,
        explanation: 'The fundamental feature of SDF is uncollateralized liquidity absorption: RBI does not pledge government securities to absorb liquidity.'
      }
    ]
  }
]);

// 5. COLLEGE_SEM - Add DSA & Computer Networks
appendTopicsToExam('COLLEGE_SEM', [
  {
    id: 'sem-dsa-avl-redblack',
    subject: 'Data Structures & Algorithms',
    title: 'Balanced Search Trees: Red-Black vs AVL Tree Invariants & Rotations',
    examRelevance: 'University Semester Exam 10-15 Marker Compulsory',
    blindspotCount: 3,
    summary: 'Balance factor calculation, 4 rotation cases (LL, RR, LR, RL), and Red-Black tree color invariants.',
    aiBlindspots: [
      {
        point: 'Trade-off Between AVL vs Red-Black Trees in Insertion-Heavy Systems',
        whatAiSays: 'Generic AI states AVL and Red-Black trees have identical performance because both are O(log n).',
        whatAiMisses: 'University exam rubric expects exact structural comparison: AVL trees are more strictly balanced (height ≤ 1.44 log n), giving faster lookups. Red-Black trees are less strictly balanced (height ≤ 2 log n), but require at most 2 rotations on insertion and 3 on deletion, making them far superior for write-heavy applications (used in Linux kernel CFS, C++ std::map, Java TreeMap).',
        examinerRubric: '10-marker rubric: 3 marks for definitions & balance condition, 4 marks for drawing LL/RR/LR/RL rotations with step-by-step pointers, 3 marks for lookup vs insertion complexity comparison table.'
      }
    ],
    coreConcepts: [
      'AVL Balance Factor: BF(node) = height(left_subtree) - height(right_subtree) ∈ {-1, 0, +1}.',
      'Red-Black Tree Properties: Root is black; Red node cannot have red children; Every path from node to descendant leaf has same black-depth.',
      'Time Complexity: Search, Insert, Delete are all O(log n) worst-case in both trees.'
    ],
    examQuestions: [
      {
        question: 'Explain the four rotation cases in an AVL tree with suitable diagrams. Contrast AVL tree performance with Red-Black tree performance.',
        marks: 10,
        keyPoints: [
          'LL Rotation: Right rotation around unbalanced ancestor when insertion occurs in left subtree of left child.',
          'RR Rotation: Left rotation around unbalanced ancestor when insertion occurs in right subtree of right child.',
          'LR Rotation: Double rotation - Left rotation around left child, followed by Right rotation around ancestor.',
          'RL Rotation: Double rotation - Right rotation around right child, followed by Left rotation around ancestor.',
          'Performance Comparison: AVL is strictly balanced (faster search); Red-Black has fewer rebalancing rotations (faster insert/delete).'
        ]
      }
    ],
    quiz: [
      {
        question: 'What is the maximum number of rotations required to restore the AVL tree property after inserting a single element?',
        options: ['1', '2', 'O(log n)', 'O(n)'],
        correctIndex: 1,
        explanation: 'After insertion in an AVL tree, either a single rotation (LL or RR) or a double rotation (LR or RL, which is 2 single rotations) completely restores balance along the entire path to the root.'
      }
    ]
  }
]);

// 6. State Boards - Expand MH, KA, TN, UP, BIHAR, WB, AP, RJ, GJ, MP
const stateBoardAdditions = {
  MH_BOARD: [
    {
      id: 'mh-math-calculus-integration',
      subject: 'Mathematics',
      title: 'Definite Integration: Properties & Area Under Plane Curves',
      examRelevance: 'Maharashtra HSC Board Section D 4-Marker Guaranteed',
      blindspotCount: 2,
      summary: 'Integration by parts with LIATE rule, properties of definite integrals, and area bounded by parabola and line.',
      aiBlindspots: [
        {
          point: 'Maharashtra HSC Marking Demands Explicit \"By Property\" Justification',
          whatAiSays: 'Generic AI evaluates integrals directly without citing property numbers.',
          whatAiMisses: 'Maharashtra State Board marking scheme requires explicitly stating the theorem: \"int_0^a f(x)dx = int_0^a f(a-x)dx (Property IV)\". Omitting this formal statement costs 1 full mark in Section D evaluation.',
          examinerRubric: '1 mark for stating property theorem, 1 mark for adding equations (2I), 1 mark for integration, 1 mark for final value.'
        }
      ],
      coreConcepts: [
        'Property: int_0^a f(x) dx = int_0^a f(a-x) dx.',
        'Area: A = int_a^b |y1 - y2| dx between intersecting curves.',
        'Integration by Parts: int u*v dx = u*int v dx - int (du/dx * int v dx) dx.'
      ],
      examQuestions: [
        {
          question: 'Evaluate: int_0^(pi/2) [sqrt(sin x) / (sqrt(sin x) + sqrt(cos x))] dx using properties of definite integrals.',
          marks: 4,
          keyPoints: [
            'Let I = int_0^(pi/2) [sqrt(sin x) / (sqrt(sin x) + sqrt(cos x))] dx  --- (1)',
            'Apply property: int_0^a f(x) dx = int_0^a f(a-x) dx.',
            'I = int_0^(pi/2) [sqrt(sin(pi/2 - x)) / (sqrt(sin(pi/2 - x)) + sqrt(cos(pi/2 - x)))] dx = int_0^(pi/2) [sqrt(cos x) / (sqrt(cos x) + sqrt(sin x))] dx  --- (2)',
            'Adding (1) and (2): 2I = int_0^(pi/2) [(sqrt(sin x) + sqrt(cos x)) / (sqrt(sin x) + sqrt(cos x))] dx = int_0^(pi/2) 1 dx = [x]_0^(pi/2) = pi/2.',
            'Therefore, I = pi/4.'
          ]
        }
      ],
      quiz: [
        {
          question: 'The value of int_(-a)^a (x^3 + x*cos x) dx is:',
          options: ['2a', '0', 'pi/2', 'a^2'],
          correctIndex: 1,
          explanation: 'f(x) = x^3 + x*cos x is an odd function because f(-x) = (-x)^3 + (-x)*cos(-x) = -x^3 - x*cos x = -f(x). The integral of any odd function from -a to a is identically zero.'
        }
      ]
    }
  ],
  UP_BOARD: [
    {
      id: 'up-math-matrices-determinants',
      subject: 'Mathematics',
      title: 'Matrices & Determinants: Inverse by Adjoint Method & System of Linear Equations',
      examRelevance: 'UP Board (UPMSP) 8-Marker Long Answer Guaranteed',
      blindspotCount: 2,
      summary: 'Adjoint matrix calculation, cofactor matrix signs, and solving AX = B via X = A^(-1)B.',
      aiBlindspots: [
        {
          point: 'UPMSP 8-Marker Demands Explicit 9-Cofactor Expansion Matrix',
          whatAiSays: 'Generic AI shortcuts cofactors and jumps to the final answer.',
          whatAiMisses: 'UP Board evaluators require writing out each individual cofactor C_11, C_12, C_13 ... C_33 with correct (-1)^(i+j) signs. Skipping these intermediary steps results in a deduction of 4 out of 8 marks.',
          examinerRubric: '1 mark for det(A) ≠ 0 check, 4 marks for 9 cofactors, 1 mark for adj(A) transpose, 2 marks for X = A^(-1)B multiplication.'
        }
      ],
      coreConcepts: [
        'Inverse formula: A^(-1) = (1 / |A|) * adj(A), provided |A| ≠ 0.',
        'Matrix equation: AX = B => X = A^(-1)B.',
        'Cofactor formula: C_ij = (-1)^(i+j) * M_ij.'
      ],
      examQuestions: [
        {
          question: 'Solve the system of linear equations using matrix method: 2x + 3y + 3z = 5, x - 2y + z = -4, 3x - y - 2z = 3.',
          marks: 8,
          keyPoints: [
            'Express in matrix form AX = B.',
            'Calculate determinant |A| = 2(4+1) - 3(-2-3) + 3(-1+6) = 10 + 15 + 15 = 40 ≠ 0 (unique solution exists).',
            'Compute cofactors C_11 to C_33 systematically.',
            'Construct Adjoint matrix adj(A) = [Cofactor matrix]^T.',
            'Compute X = (1/40) * adj(A) * B to obtain x = 1, y = 2, z = -1.'
          ]
        }
      ],
      quiz: [
        {
          question: 'If A is an invertible square matrix of order 3 and |A| = 5, then |adj(A)| equals:',
          options: ['5', '25', '125', '1/5'],
          correctIndex: 1,
          explanation: 'For an n x n matrix, |adj(A)| = |A|^(n-1). Here n = 3, so |adj(A)| = 5^(3-1) = 5^2 = 25.'
        }
      ]
    }
  ],
  KA_BOARD: [
    {
      id: 'ka-bio-reproduction-flowering',
      subject: 'Biology',
      title: 'Sexual Reproduction in Flowering Plants: Double Fertilization & Endosperm',
      examRelevance: 'Karnataka 2nd PUC Board 5-Marker Mandatory',
      blindspotCount: 2,
      summary: 'Microsporogenesis, megasporogenesis, 7-celled 8-nucleate female gametophyte, syngamy, and triple fusion.',
      aiBlindspots: [
        {
          point: 'Double Fertilization Involves Two Distinct Fusion Events',
          whatAiSays: 'Generic AI describes fertilization in plants as a single sperm fusing with an egg.',
          whatAiMisses: 'Karnataka PUC marking scheme demands exact definition of Double Fertilization: (1) Syngamy: One male gamete (n) fuses with egg cell (n) to form diploid Zygote (2n), (2) Triple Fusion: Second male gamete (n) fuses with two polar nuclei (2n) in central cell to form triploid Primary Endosperm Nucleus (PEN, 3n).',
          examinerRubric: '1 mark for Syngamy definition, 1 mark for Triple Fusion definition, 1 mark for chromosome ploidy numbers (2n vs 3n), 2 marks for labeled embryo sac diagram.'
        }
      ],
      coreConcepts: [
        'Ploidy Levels: Zygote is 2n (diploid); Endosperm is 3n (triploid); Synergids and antipodals are n (haploid).',
        'Double Fertilization: Unique characteristic of angiosperms discovered by S.G. Nawaschin.',
        'Mature embryo sac has 7 cells and 8 nuclei at maturity.'
      ],
      examQuestions: [
        {
          question: 'Explain the events of double fertilization in angiosperms. Mention the ploidy of zygote and primary endosperm nucleus.',
          marks: 5,
          keyPoints: [
            'Pollen tube enters embryo sac through micropylar end and releases two male gametes.',
            'Syngamy: Male gamete (n) + Egg cell (n) -> Zygote (2n).',
            'Triple Fusion: Second male gamete (n) + Secondary nucleus (2n) -> Primary Endosperm Nucleus (3n).',
            'Significance: Ensures endosperm formation only when fertilization is successful, conserving plant energy.'
          ]
        }
      ],
      quiz: [
        {
          question: 'What is the ploidy of the Primary Endosperm Nucleus (PEN) in angiosperms?',
          options: ['Haploid (n)', 'Diploid (2n)', 'Triploid (3n)', 'Tetraploid (4n)'],
          correctIndex: 2,
          explanation: 'Primary Endosperm Nucleus is formed by triple fusion (one haploid sperm nucleus fusing with two haploid polar nuclei), resulting in a triploid (3n) tissue.'
        }
      ]
    }
  ]
};

for (const [examKey, topics] of Object.entries(stateBoardAdditions)) {
  appendTopicsToExam(examKey, topics);
}

fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log('Successfully completed comprehensive knowledgebase enrichment!');
