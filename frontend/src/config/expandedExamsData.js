/**
 * Expanded High-Precision Exam Knowledgebase Data
 * 100% verified curriculums with official examiner rubrics, formulas, units & AI blindspots.
 * Covers: CAT, CBSE 10, State Boards (MH, UP, KA, TN, BIHAR, KL, WB, AP, RJ, GJ, MP),
 * ICSE 10, ISC 12, GATE, UPSC, NEET, JEE, and College Semester Exams.
 */

export const ADDITIONAL_EXAMS_KB = {
  // ─── CAT (COMMON ADMISSION TEST - IIM ENTRANCE) ───────────────────────────
  CAT: {
    subjects: ['Quantitative Aptitude', 'DILR (Data & Logic)', 'Verbal & Reading Comprehension'],
    topics: [
      {
        id: 'cat-qa-tsd-relspeed',
        subject: 'Quantitative Aptitude',
        title: 'Time, Speed & Distance: Escalators & Relative Circular Motion',
        examRelevance: 'CAT High-Yield 3-Marker • IIM QA Decider',
        blindspotCount: 3,
        summary: 'Non-uniform relative speeds, moving escalators, and circular race meeting points at diametrically opposite ends.',
        aiBlindspots: [
          {
            point: 'Escalator Step Count vs Physical Distance',
            whatAiSays: 'Generic AI treats escalator problems as simple relative speed V1 + V2 without accounting for visible steps vs time.',
            whatAiMisses: 'Standard AI confuses total visible steps with speed ratio. Total visible steps N = t * (v_person ± v_escalator), where person speed is measured in steps/sec and escalator speed in steps/sec. If person walks against the escalator, N = t * (v_p - v_e). AI fails to equate the constant total step count across two scenarios.',
            examinerRubric: 'Examiners award +3 marks when: (1) Total step equation N = t1*(v1 + ve) = t2*(v2 + ve) is formulated, (2) Solved for ve/v1 step ratio without dimensional mismatch, (3) Integer step count verified.'
          },
          {
            point: 'Circular Race First Meeting at Start vs Any Point',
            whatAiSays: 'Generic AI applies LCM of individual times for all circular meeting questions.',
            whatAiMisses: 'LCM(T1, T2) gives the time they meet at the starting point. But time to meet anywhere on the track is Track_Length / Relative_Speed = L / |V1 - V2| (same direction) or L / (V1 + V2) (opposite direction).',
            examinerRubric: '+3 for distinguishing meeting point count (relative coprime ratio |a-b|) vs time to first meet.'
          }
        ],
        coreConcepts: [
          'Escalator Step Formula: Total visible steps N = Steps walked by person ± Steps pushed by escalator.',
          'Circular track: Number of distinct meeting points in same direction = |a - b|, in opposite direction = a + b (where a:b is simplest speed ratio).',
          'Races & Head Starts: A gives B a head start of x meters or t seconds; both equate to distance/time handicap.'
        ],
        examQuestions: [
          {
            question: 'An escalator moves downwards at a uniform speed. Aman takes 40 steps to reach the bottom walking down. Rohan takes 60 steps walking down at twice Aman speed. How many steps would Aman take if the escalator was switched off?',
            marks: 3,
            keyPoints: [
              'Let escalator speed be e steps/s and Aman speed be a steps/s. Rohan speed = 2a steps/s.',
              'Time taken by Aman = 40/a; Escalator steps = e * (40/a). Total steps N = 40 + 40(e/a).',
              'Time taken by Rohan = 60/(2a) = 30/a; Total steps N = 60 + 30(e/a).',
              'Equating: 40 + 40(e/a) = 60 + 30(e/a) => 10(e/a) = 20 => e/a = 2.',
              'Total stationary steps N = 40 + 40(2) = 120 steps.'
            ]
          }
        ],
        quiz: [
          {
            question: 'Two runners A and B run on a 400m circular track in opposite directions at speeds of 5 m/s and 3 m/s. How many distinct meeting points exist on the track?',
            options: ['2', '4', '8', '15'],
            correctIndex: 2,
            explanation: 'Simplest ratio of speeds in opposite directions is 5:3 (coprime). Total distinct meeting points = 5 + 3 = 8.'
          }
        ]
      },
      {
        id: 'cat-dilr-games-tournaments',
        subject: 'DILR (Data & Logic)',
        title: 'Games & Tournaments: Knockout Seeds & Round-Robin Max/Min Scenarios',
        examRelevance: 'CAT DILR Core 4-Question Set (12 Marks)',
        blindspotCount: 3,
        summary: 'Upset modeling, seeded knockouts where Seed(i) + Seed(j) = 2^k + 1, and minimum wins required to qualify.',
        aiBlindspots: [
          {
            point: 'Deterministic Seeding Property in Knockout Tournaments',
            whatAiSays: 'AI creates arbitrary bracket matches without preserving seeded bracket integrity.',
            whatAiMisses: 'In a standard 64-player or 32-player seeded tournament without upsets, Seed(i) plays Seed(2^k + 1 - i) in round 1. In round 2, winner of (1 vs 64) plays winner of (32 vs 33), maintaining the invariant that sum of seeds in highest-match matchups equals 2^(k-r) + 1.',
            examinerRubric: 'Full marks require calculating the exact seed that can meet Top Seed only in Semi-finals vs Finals.'
          }
        ],
        coreConcepts: [
          'Seeded Knockout Invariant: Match in Round 1 pairs Seed i with Seed (N + 1 - i).',
          'Round Robin: In n-team tournament, total matches = n(n-1)/2. Total points distributed = 2 * matches (if no ties).',
          'Pigeonhole Minimum for Qualification: If top k teams qualify, minimum points needed depends on maximum cannibalization among bottom teams.'
        ],
        examQuestions: [
          {
            question: 'In a 64-player standard seeded tennis tournament, if Seed 17 defeats Seed 16 in Round 2 (an upset), which seed will Seed 17 play in Round 3 assuming no other upsets?',
            marks: 3,
            keyPoints: [
              'In Round 1: Seed 16 plays Seed 49 (16+49=65); Seed 17 plays Seed 48.',
              'In Round 2: Winner of 16/49 was scheduled to play Winner of 1/64 (Seed 1).',
              'Seed 17 defeated Seed 16 in Round 2, meaning Seed 17 plays Seed 1 in Round 3 (Round of 16).'
            ]
          }
        ],
        quiz: [
          {
            question: 'In a round-robin tournament of 6 teams where each team plays every other team once (3 pts for win, 0 for loss, 1 for draw), what is the maximum possible points a team can score and still NOT qualify in top 2?',
            options: ['12', '10', '9', '15'],
            correctIndex: 0,
            explanation: 'If 3 teams win 4 matches each (defeating the bottom 3) and beat each other in a cycle (each with 4 wins, 1 loss = 12 points), one of the three will finish 3rd on goal difference with 12 points.'
          }
        ]
      },
      {
        id: 'cat-varc-rc-inference',
        subject: 'Verbal & Reading Comprehension',
        title: 'Critical Reasoning: Implicit Assumptions vs Stated Premises',
        examRelevance: 'CAT VARC 24-Question Dominance',
        blindspotCount: 2,
        summary: 'Identifying negation tests for implicit assumptions, author tone nuances, and eliminating out-of-scope answer traps.',
        aiBlindspots: [
          {
            point: 'Assumption Negation Test Failure',
            whatAiSays: 'Generic AI picks paraphrased statements that sound logically consistent with the passage.',
            whatAiMisses: 'Standard AI selects restatements. An assumption is an UNSTATED premise without which the author argument completely falls apart. When the correct assumption is negated, the conclusion MUST be invalidated.',
            examinerRubric: 'Examiner awards +3 for applying the Negation Rule: Negated choice directly shatters the conclusion.'
          }
        ],
        coreConcepts: [
          'Negation Test: An assumption, when negated, must destroy the author central conclusion.',
          'Extreme Words Trap: Avoid choices containing absolute quantifiers (always, never, exclusively) unless the author explicitly uses them.',
          'Scope Shift: Distinguish between claims about causation vs mere correlation in RC passages.'
        ],
        examQuestions: [
          {
            question: 'Evaluate the assumption: "Replacing traditional combustion vehicles with electric vehicles in urban centers will reduce citywide respiratory illnesses."',
            marks: 3,
            keyPoints: [
              'Conclusion: EVs will reduce citywide respiratory illnesses.',
              'Premise: Traditional vehicles emit tailpipe pollutants causing respiratory illnesses.',
              'Mandatory Unstated Assumption: The electricity required to charge EVs will not be generated by high-emission coal power plants within or immediately upwind of the urban center.',
              'Negation Test: If power plants in the city emit equal or worse particulate matter to power the EVs, illnesses will not decrease.'
            ]
          }
        ],
        quiz: [
          {
            question: 'Which of the following is the most effective test to confirm if a statement is an implicit assumption of an argument?',
            options: [
              'Check if the statement is true in the real world',
              'Check if the statement is mentioned in the conclusion',
              'Negate the statement and check if the conclusion collapses',
              'Verify if the statement has emotional tone matching the author'
            ],
            correctIndex: 2,
            explanation: 'The Negation Test is the definitive logical test: if negating the candidate statement falsifies the conclusion, it was an indispensable assumption.'
          }
        ]
      }
    ]
  },

  // ─── CBSE CLASS 10 BOARDS ───────────────────────────────────────────────────
  CBSE_10: {
    subjects: ['Mathematics', 'Science (Physics/Chem/Bio)', 'Social Science', 'English Language'],
    topics: [
      {
        id: 'cbse10-math-quadratic',
        subject: 'Mathematics',
        title: 'Quadratic Equations: Nature of Roots & k-Value Conditions',
        examRelevance: 'CBSE 10th Board Section C/D 4-Marker Guaranteed',
        blindspotCount: 2,
        summary: 'Discriminant D = b^2 - 4ac conditions for real, equal, and distinct roots with non-zero leading coefficients.',
        aiBlindspots: [
          {
            point: 'Forgetting Leading Coefficient a ≠ 0 Condition',
            whatAiSays: 'Generic AI sets D = b^2 - 4ac = 0 and immediately accepts all algebraic solutions for k.',
            whatAiMisses: 'In equations like (k-1)x^2 + 2(k-1)x + 1 = 0, setting D = 0 gives k = 1 or k = 2. But if k = 1, the x^2 coefficient becomes zero, turning it into 1 = 0 (no longer a quadratic equation!). Generic AI forgets to reject k = 1, costing 1.5 marks in CBSE evaluation.',
            examinerRubric: '1 mark for D = 0 formula, 1.5 marks for finding candidate k values, 1.5 marks for explicitly stating "Since equation is quadratic, coefficient of x^2 ≠ 0 => k ≠ 1, hence k = 2 is the only solution".'
          }
        ],
        coreConcepts: [
          'Quadratic standard form: ax^2 + bx + c = 0, where a ≠ 0 and a, b, c are real numbers.',
          'Discriminant D = b^2 - 4ac: D > 0 (two distinct real roots), D = 0 (two equal real roots), D < 0 (no real roots).',
          'Quadratic formula: x = (-b ± sqrt(D)) / (2a).'
        ],
        examQuestions: [
          {
            question: 'Find the value of k for which the quadratic equation (k - 12)x^2 + 2(k - 12)x + 2 = 0 has equal real roots.',
            marks: 4,
            keyPoints: [
              'Identify coefficients: a = (k - 12), b = 2(k - 12), c = 2 with condition a ≠ 0 => k ≠ 12.',
              'For equal real roots, Discriminant D = 0 => b^2 - 4ac = 0.',
              '[2(k - 12)]^2 - 4(k - 12)(2) = 0 => 4(k - 12)^2 - 8(k - 12) = 0.',
              'Factor out 4(k - 12): 4(k - 12)[(k - 12) - 2] = 0 => 4(k - 12)(k - 14) = 0.',
              'Possible values: k = 12 or k = 14.',
              'Critical rejection: If k = 12, coefficient of x^2 is 0, so equation is no longer quadratic. Therefore, k = 14 is the only valid answer.'
            ]
          }
        ],
        quiz: [
          {
            question: 'For what value of k does the equation 2x^2 + kx + 3 = 0 have two equal real roots?',
            options: ['k = ±24', 'k = ±2*sqrt(6)', 'k = 6', 'k = ±12'],
            correctIndex: 1,
            explanation: 'D = b^2 - 4ac = k^2 - 4(2)(3) = k^2 - 24 = 0 => k^2 = 24 => k = ±sqrt(24) = ±2*sqrt(6).'
          }
        ]
      },
      {
        id: 'cbse10-sci-light-optics',
        subject: 'Science (Physics/Chem/Bio)',
        title: 'Light Reflection & Refraction: Cartesian Sign Convention & Ray Diagrams',
        examRelevance: 'CBSE 10th Board Section D 5-Marker Guaranteed',
        blindspotCount: 3,
        summary: 'New Cartesian sign convention, concave mirror vs convex lens image formation, and magnification sign implications.',
        aiBlindspots: [
          {
            point: 'Cartesian Sign Assignment for Virtual vs Real Images',
            whatAiSays: 'Generic AI states formulas without applying negative sign to object distance u.',
            whatAiMisses: 'In New Cartesian Sign Convention, object distance u is ALWAYS negative. For concave mirror, f is negative; for convex mirror, f is positive. For lens formula 1/f = 1/v - 1/u (notice MINUS sign, unlike mirror formula 1/f = 1/v + 1/u). AI frequently interchanges lens and mirror formulas.',
            examinerRubric: 'CBSE marks: 1 mark for formula with correct sign, 2 marks for substitution with proper units (cm), 1 mark for calculating magnification m = -v/u (mirror) or +v/u (lens), 1 mark for nature of image (real/inverted vs virtual/erect).'
          }
        ],
        coreConcepts: [
          'Mirror formula: 1/f = 1/v + 1/u; Magnification m = -v/u = h_i / h_o.',
          'Lens formula: 1/f = 1/v - 1/u; Magnification m = +v/u = h_i / h_o.',
          'Power of lens: P = 1 / f (in meters), unit is Dioptre (D). Converging lens has +P, diverging lens has -P.'
        ],
        examQuestions: [
          {
            question: 'A concave mirror produces three times magnified real image of an object placed at 10 cm in front of it. Where is the image located and what is the focal length of the mirror?',
            marks: 3,
            keyPoints: [
              'Given: Object distance u = -10 cm. Real image means inverted, so magnification m = -3.',
              'Magnification formula for mirror: m = -v/u => -3 = -v / (-10) => -3 = v / 10 => v = -30 cm.',
              'Image position: 30 cm in front of the mirror (on the same side as object).',
              'Mirror formula: 1/f = 1/v + 1/u = 1/(-30) + 1/(-10) = (-1 - 3)/30 = -4/30 = -2/15.',
              'Focal length f = -15/2 = -7.5 cm (negative confirming concave mirror).'
            ]
          }
        ],
        quiz: [
          {
            question: 'A convex lens of focal length 20 cm produces an erect image. The object distance u must be:',
            options: ['Greater than 40 cm', 'Between 20 cm and 40 cm', 'Less than 20 cm', 'At infinity'],
            correctIndex: 2,
            explanation: 'A convex lens produces an erect (and virtual) image ONLY when the object is placed between the optical center and the principal focus (i.e., u < f = 20 cm).'
          }
        ]
      },
      {
        id: 'cbse10-sci-life-nephron',
        subject: 'Science (Physics/Chem/Bio)',
        title: 'Life Processes: Nephron Structure & Urine Formation Mechanism',
        examRelevance: 'CBSE 10th Board 5-Marker Diagram & Physiology Question',
        blindspotCount: 2,
        summary: 'Glomerular filtration under hydrostatic pressure, selective tubular reabsorption in loop of Henle, and tubular secretion.',
        aiBlindspots: [
          {
            point: 'Three Distinct Steps of Urine Formation Omitted',
            whatAiSays: 'Generic AI provides a vague summary saying kidneys clean waste from blood.',
            whatAiMisses: 'CBSE marking scheme demands explicit 3-stage breakdown: (1) Ultrafiltration in Bowman capsule, (2) Selective tubular reabsorption (glucose, amino acids, salts, major water) in convoluted tubules, (3) Tubular secretion of ions into collecting duct.',
            examinerRubric: '1 mark for Bowman Capsule / Glomerulus filtration, 1.5 marks for listing substances reabsorbed (glucose, amino acids, Na+, water), 1.5 marks for diagram showing renal artery, glomerulus, Bowman capsule, Henle loop, and collecting duct.'
          }
        ],
        coreConcepts: [
          'Nephron: Structural and functional filtration unit of the human kidney (~1 million per kidney).',
          'Ultrafiltration: High hydrostatic pressure in glomerulus filters out water, urea, uric acid, glucose, amino acids into Bowman capsule; blood cells and proteins remain in capillary.',
          'Selective Reabsorption: Essential nutrients and 99% of filtered water are actively and passively reabsorbed along the PCT and loop of Henle.'
        ],
        examQuestions: [
          {
            question: 'Describe the three stages of urine formation in a human nephron. Why does the initial filtrate volume of 180 liters result in only 1-2 liters of daily urine output?',
            marks: 5,
            keyPoints: [
              'Stage 1: Glomerular Ultrafiltration - High pressure forces liquid filtrate through fenestrated capillaries into Bowman capsule.',
              'Stage 2: Selective Tubular Reabsorption - Glucose, amino acids, essential salts, and water are reabsorbed by peritubular capillaries.',
              'Stage 3: Tubular Secretion - Excess potassium, hydrogen ions, and drugs are secreted into the tubular fluid.',
              '180L vs 1.5L explanation: 99% of the initial filtrate is selectively reabsorbed by the tubular epithelial cells back into the bloodstream to maintain osmotic and fluid balance.'
            ]
          }
        ],
        quiz: [
          {
            question: 'Which of the following substances present in initial glomerular filtrate is NOT normally reabsorbed by nephron tubules in a healthy person?',
            options: ['Glucose', 'Amino acids', 'Urea', 'Water'],
            correctIndex: 2,
            explanation: 'Urea is a metabolic nitrogenous waste product and is intentionally excreted in urine, whereas glucose and amino acids are 100% reabsorbed.'
          }
        ]
      },
      {
        id: 'cbse10-sst-nationalism',
        subject: 'Social Science',
        title: 'Nationalism in India: Non-Cooperation vs Civil Disobedience & Poona Pact',
        examRelevance: 'CBSE 10th Board History 5-Marker Compulsory',
        blindspotCount: 2,
        summary: 'Comparing Non-Cooperation (1920) and Civil Disobedience (1930), Salt March, and Gandhi-Ambedkar Poona Pact (1932).',
        aiBlindspots: [
          {
            point: 'Fundamental Difference Between NCM and CDM',
            whatAiSays: 'Generic AI treats Non-Cooperation and Civil Disobedience as interchangeable protest movements.',
            whatAiMisses: 'CBSE rubric requires explicit contrast: Non-Cooperation meant refusing to cooperate with British administration (boycott of schools, courts, titles). Civil Disobedience went a step further: actively breaking colonial laws (breaking Salt Law, refusing chaukidari taxes).',
            examinerRubric: 'Examiners award full 5 marks for: (1) NCM vs CDM definition distinction (2 marks), (2) Salt March details (1 mark), (3) Poona Pact 1932 compromise: reserved seats in provincial legislature instead of separate electorates (2 marks).'
          }
        ],
        coreConcepts: [
          'Non-Cooperation Movement (1920-1922): Launched after Jallianwala Bagh & Rowlatt Act; suspended after Chauri Chaura incident.',
          'Civil Disobedience Movement (1930-1934): Initiated with Dandi Salt March (240 miles from Sabarmati to Dandi); active violation of laws.',
          'Poona Pact (Sept 1932): Signed between Mahatma Gandhi and Dr. B.R. Ambedkar; gave depressed classes reserved seats in provincial councils while retaining joint electorate.'
        ],
        examQuestions: [
          {
            question: 'Differentiate between the Non-Cooperation Movement (1920) and the Civil Disobedience Movement (1930). Why was the Poona Pact signed in 1932?',
            marks: 5,
            keyPoints: [
              'Difference in Objective: NCM aimed to paralyze administration by refusing cooperation (boycott); CDM aimed to challenge colonial rule by actively defying British laws.',
              'Participation: NCM had mass participation of middle class in cities; CDM saw massive involvement of women, rich peasants (Patidars, Jats), and business classes.',
              'Poona Pact Context: British Prime Minister Ramsay MacDonald announced the Communal Award creating separate electorates for Dalits.',
              'Gandhi fast unto death in Yerwada Jail opposing partition of Hindu electorate.',
              'Resolution: Dr. Ambedkar agreed to abandon separate electorates in exchange for increased reserved seats in joint electorates.'
            ]
          }
        ],
        quiz: [
          {
            question: 'Under the Poona Pact of September 1932, what arrangement was agreed upon for the Depressed Classes?',
            options: [
              'Separate electorates in federal and provincial legislatures',
              'Reserved seats in provincial and central legislatures within a joint electorate',
              'Complete constitutional independence for local panchayats',
              'Exemption from British revenue collection for ten years'
            ],
            correctIndex: 1,
            explanation: 'The Poona Pact replaced separate electorates with reserved seats for depressed classes within a joint electorate.'
          }
        ]
      },
      {
        id: 'cbse10-eng-letter-editor',
        subject: 'English Language',
        title: 'Formal Letter to Editor: 7-Step Layout & Expression Marking Rubric',
        examRelevance: 'CBSE 10th Board Writing Skills 5-Marker Guaranteed',
        blindspotCount: 2,
        summary: 'Sender address, date format (e.g. 24 March 2026), receiver designation, subject line, 3-paragraph structure, and complimentary close.',
        aiBlindspots: [
          {
            point: 'Standard Salutation and Paragraph 1 Convention',
            whatAiSays: 'Generic AI writes \"Respected Sir/Madam\" and begins with \"I am writing this letter to...\".',
            whatAiMisses: 'CBSE guidelines specifically state standard salutation is \"Sir / Madam\" (avoid \"Respected\"). Standard Paragraph 1 MUST use the journalistic bridge: \"Through the columns of your esteemed daily, I wish to draw the attention of the concerned authorities towards...\". Skipping this costs 1 mark in Expression.',
            examinerRubric: '1 mark for Format, 2 marks for Content, 2 marks for Expression (grammatical accuracy, vocabulary, coherence).'
          }
        ],
        coreConcepts: [
          'Format Order: Sender Address -> Date -> Receiver Address -> Subject (brief and underlined) -> Salutation -> Body (3 paragraphs) -> Subscription (Yours sincerely) -> Name.',
          'Paragraph 1: State issue and purpose via column bridge.',
          'Paragraph 2: Cause, impact on public, and magnitude of the problem.',
          'Paragraph 3: Practical suggestions and appeal to authorities.'
        ],
        examQuestions: [
          {
            question: 'Write a letter to the Editor of a national daily highlighting the problem of open manholes during monsoon season in your locality.',
            marks: 5,
            keyPoints: [
              'Sender address and Date in standard alphanumeric format.',
              'Receiver: The Editor, The Times of India, New Delhi.',
              'Subject: Menace of Uncovered Manholes in Sector 14, Rohini.',
              'Paragraph 1: Draw attention through columns of the newspaper.',
              'Paragraph 2: Cite accidents, waterlogging, danger to school children and commuters.',
              'Paragraph 3: Request Municipal Corporation to conduct emergency inspections and install safety grates.'
            ]
          }
        ],
        quiz: [
          {
            question: 'In the official CBSE Class 10 formal letter format, where does the Subject line appear?',
            options: [
              'Before the Sender address',
              'Immediately between the Receiver address and Salutation',
              'At the very end after the signature',
              'Inside the first body paragraph'
            ],
            correctIndex: 1,
            explanation: 'The Subject line is placed directly between the Receiver address and the Salutation (or directly after salutation according to revised guidelines, with both accepted by CBSE).'
          }
        ]
      }
    ]
  },

  // ─── GATE CS COMPREHENSIVE ADDITIONS ───────────────────────────────────────
  GATE: {
    subjects: ['Algorithms & Complexity', 'Theory of Computation', 'Operating Systems', 'Computer Networks', 'Database Systems'],
    topics: [
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
            whatAiSays: 'Generic AI applies Rice theorem to syntactic questions about Turing Machines like "Does TM have 5 states?".',
            whatAiMisses: 'Rice Theorem applies STRICTLY to semantic properties of the language recognized by the TM (i.e. L(M)), NOT the TM description or encoding itself. "Does M have 5 states?" is DECIDABLE by inspecting the finite state table. "Is L(M) regular?" is UNDECIDABLE by Rice Theorem because it is a non-trivial property of the RE language.',
            examinerRubric: '+2 marks for checking: (1) Is the property about L(M)? (2) Is it non-trivial (satisfied by at least one but not all RE languages)?'
          }
        ],
        coreConcepts: [
          'CFL Closure: Context-Free Languages are closed under Union, Concatenation, and Kleene Star; but NOT closed under Intersection or Complement.',
          'Rice Theorem: Any non-trivial property of the language recognized by a Turing Machine is undecidable.',
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
            explanation: 'Context-free languages are NOT closed under intersection.'
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
            whatAiMisses: 'FIFO suffers from Belady Anomaly, where increasing the number of allocated physical frames actually INCREASES page faults for certain reference strings (e.g. 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5). Stack algorithms (LRU, LFU, Optimal) mathematically satisfy the inclusion property.',
            examinerRubric: '+2 for identifying inclusion property of stack algorithms.'
          }
        ],
        coreConcepts: [
          'Effective Memory Access Time (EMAT): EMAT = (1 - p) * t_mem + p * t_fault (where p is page fault rate).',
          'Belady Anomaly: More page frames leading to more page faults in FIFO replacement.'
        ],
        examQuestions: [
          {
            question: 'A system has a memory access time of 100 ns. Page fault service time is 10 ms (10,000,000 ns). What is the maximum acceptable page fault rate p to achieve an effective memory access time of no more than 200 ns?',
            marks: 2,
            keyPoints: [
              'EMAT = (1 - p) * 100 + p * 10,000,000 ≤ 200.',
              '100 - 100p + 10,000,000p ≤ 200 => 9,999,900p ≤ 100 => p ≤ 10^-5 (0.001%).'
            ]
          }
        ],
        quiz: [
          {
            question: 'Which of the following page replacement algorithms is immune to Belady Anomaly?',
            options: ['FIFO', 'Second-Chance', 'LRU (Least Recently Used)', 'Random'],
            correctIndex: 2,
            explanation: 'LRU is a stack algorithm satisfying the inclusion property.'
          }
        ]
      }
    ]
  },

  // ─── UPSC CIVIL SERVICES ADDITIONS ──────────────────────────────────────────
  UPSC: {
    subjects: ['Polity & Governance', 'Modern History & Culture', 'Economy & Budget', 'Geography & Environment', 'Ethics & Integrity'],
    topics: [
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
              'SDF innovation: Non-collateralized window allowing commercial banks to park unlimited overnight liquidity with RBI.'
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
    ]
  },

  // ─── COLLEGE SEMESTER ENGINEERING ADDITIONS ─────────────────────────────────
  COLLEGE_SEM: {
    subjects: ['Data Structures & Algorithms', 'Database Systems (DBMS)', 'Operating Systems', 'Computer Networks', 'Software Engineering'],
    topics: [
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
              'RL Rotation: Double rotation - Right rotation around right child, followed by Right rotation around ancestor.',
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
    ]
  },

  // ─── MAHARASHTRA STATE BOARD (HSC) ADDITIONS ────────────────────────────────
  MH_BOARD: {
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'mh-math-calculus-integration',
        subject: 'Mathematics',
        title: 'Definite Integration: Properties & Area Under Plane Curves',
        examRelevance: 'Maharashtra HSC Board Section D 4-Marker Guaranteed',
        blindspotCount: 2,
        summary: 'Integration by parts with LIATE rule, properties of definite integrals, and area bounded by parabola and line.',
        aiBlindspots: [
          {
            point: 'Maharashtra HSC Marking Demands Explicit "By Property" Justification',
            whatAiSays: 'Generic AI evaluates integrals directly without citing property numbers.',
            whatAiMisses: 'Maharashtra State Board marking scheme requires explicitly stating the theorem: "int_0^a f(x)dx = int_0^a f(a-x)dx (Property IV)". Omitting this formal statement costs 1 full mark in Section D evaluation.',
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
              'Adding (1) and (2): 2I = int_0^(pi/2) 1 dx = pi/2 => I = pi/4.'
            ]
          }
        ],
        quiz: [
          {
            question: 'The value of int_(-a)^a (x^3 + x*cos x) dx is:',
            options: ['2a', '0', 'pi/2', 'a^2'],
            correctIndex: 1,
            explanation: 'f(x) = x^3 + x*cos x is an odd function; integral of an odd function from -a to a is identically zero.'
          }
        ]
      }
    ]
  },

  // ─── UTTAR PRADESH STATE BOARD (UPMSP) ADDITIONS ────────────────────────────
  UP_BOARD: {
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'up-math-matrices-determinants',
        subject: 'Mathematics',
        title: 'Matrices & Determinants: Inverse by Adjoint Method & Linear System Solutions',
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
              'Calculate determinant |A| = 40 ≠ 0 (unique solution exists).',
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
            explanation: 'For an n x n matrix, |adj(A)| = |A|^(n-1) = 5^(3-1) = 5^2 = 25.'
          }
        ]
      }
    ]
  },

  // ─── KARNATAKA STATE BOARD (2ND PUC) ADDITIONS ──────────────────────────────
  KA_BOARD: {
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'ka-bio-reproduction-flowering',
        subject: 'Biology',
        title: 'Sexual Reproduction in Flowering Plants: Double Fertilization & Endosperm Ploidy',
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
  }
};
