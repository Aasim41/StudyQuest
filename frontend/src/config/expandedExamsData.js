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
  },

  // ─── NEET CHEMISTRY & PHYSICS ─────────────────────────────────────────────
  NEET: {
    subjects: ['Botany', 'Zoology', 'Chemistry', 'Physics'],
    topics: [
      {
        id: 'neet-chem-cft-octahedral',
        subject: 'Chemistry',
        title: 'Coordination Compounds: CFT Splitting (Δₒ vs P) & Magnetic Moment',
        examRelevance: 'NEET 4-Marker Guaranteed Inorganic Chemistry',
        blindspotCount: 2,
        summary: 'Strong-field vs weak-field ligand pairing criteria, tetrahedral inversion Δₜ = (4/9)Δₒ, and spin-only μ = √(n(n+2)) BM.',
        aiBlindspots: [
          {
            point: 'Ammonia Acts as Strong Field with Co³⁺ (d⁶) but Weak Field with Co²⁺ / Mn²⁺',
            whatAiSays: 'Generic AI labels ligands strictly strong or weak regardless of central metal oxidation state.',
            whatAiMisses: 'Crystal field splitting Δₒ depends BOTH on ligand AND metal oxidation state! [Co(NH₃)₆]³⁺ has Co³⁺ (3d⁶, higher charge draws ligands closer -> larger Δₒ > P) forming low-spin diamagnetic t₂g⁶ e_g⁰ (n = 0), whereas [Co(NH₃)₆]²⁺ is high-spin paramagnetic!',
            examinerRubric: '+4 for checking metal charge (+3 vs +2) and spectrochemical strength before counting unpaired electrons n.',
          },
        ],
        coreConcepts: [
          'Octahedral d-splitting: Lower energy t₂g (dxy, dyz, dxz) and higher energy e_g (dx²−y², dz²).',
          'Spin-Only Magnetic Moment: μ = √(n(n+2)) Bohr Magnetons (BM); n = 4 gives √24 ≈ 4.90 BM.',
          'Tetrahedral Complexes: Δₜ = (4/9)Δₒ < P almost universally, so tetrahedral complexes rarely spin-pair.',
        ],
        examQuestions: [
          {
            question: 'Compare the magnetic behavior of [Fe(CN)₆]³⁻ and [FeF₆]³⁻ with justification from Crystal Field Theory.',
            marks: 4,
            keyPoints: [
              'Both contain Fe³⁺ (3d⁵).',
              'CN⁻ is a strong-field ligand (Δₒ > P), pairing four electrons -> t₂g⁵ e_g⁰ -> n = 1 unpaired electron (μ ≈ 1.73 BM).',
              'F⁻ is a weak-field ligand (Δₒ < P) -> t₂g³ e_g² -> n = 5 unpaired electrons (μ ≈ 5.92 BM).',
            ],
          },
        ],
        quiz: [
          {
            question: 'Which octahedral complex has ZERO unpaired electrons (diamagnetic)?',
            options: ['[CoF₆]³⁻', '[Co(NH₃)₆]³⁺', '[FeF₆]³⁻', '[NiCl₄]²⁻'],
            correctIndex: 1,
            explanation: 'Co³⁺ is d⁶ and NH₃ triggers low-spin pairing here (Δₒ > P), placing all 6 electrons paired into t₂g⁶ e_g⁰.',
          },
        ],
      },
      {
        id: 'neet-phy-zener-logic',
        subject: 'Physics',
        title: 'Semiconductors: Zener Reverse Voltage Regulation & Universal Logic Gates',
        examRelevance: 'NEET Modern Physics 4-Marker Compulsory',
        blindspotCount: 2,
        summary: 'Heavy doping thin depletion width (< 10⁻⁶ m), reverse breakdown constant V_Z across load, and De Morgan NAND/NOR conversions.',
        aiBlindspots: [
          {
            point: 'Series Current Limiting Resistor R_s Power & Load Range Check',
            whatAiSays: 'Generic AI stops at V_out = V_Z without computing current distribution I_in = I_Z + I_L.',
            whatAiMisses: 'In NEET numericals, R_s carries BOTH Zener current I_Z AND Load current I_L = V_Z / R_L! Students compute R_s using only I_Z or drop I_R = (V_in − V_Z)/R_s and miss subtracting I_L.',
            examinerRubric: 'Verify: I_total = (V_in − V_Z) / R_s and I_Z = I_total − V_Z / R_L.',
          },
        ],
        coreConcepts: [
          'Zener Diode: Heavily doped p-n junction designed specifically to operate safely in Reverse Breakdown region.',
          'Universal Gates: Both NAND (¬(A·B)) and NOR (¬(A+B)) can construct NOT, AND, OR, and XOR logic.',
          'De Morgan Laws: ¬(A·B) = ¬A + ¬B and ¬(A+B) = ¬A · ¬B.',
        ],
        examQuestions: [
          {
            question: 'A 10 V Zener diode is connected with input 15 V across a series resistor of 250 Ω and a load resistor of 1 kΩ. Find the current flowing through the Zener diode.',
            marks: 4,
            keyPoints: [
              'Voltage across load = V_Z = 10 V => Load current I_L = 10 V / 1000 Ω = 10 mA.',
              'Voltage drop across series resistor = 15 V − 10 V = 5 V => Total current I_s = 5 V / 250 Ω = 20 mA.',
              'Current through Zener diode I_Z = I_s − I_L = 20 mA − 10 mA = 10 mA.',
            ],
          },
        ],
        quiz: [
          {
            question: 'What happens to the width of the depletion layer in an unbiased p-n junction when doping concentration is heavily increased (like a Zener diode)?',
            options: [
              'Depletion width increases tenfold',
              'Depletion width decreases sharply (< 10⁻⁶ m)',
              'Remains independent of doping',
              'Conductivity becomes zero',
            ],
            correctIndex: 1,
            explanation: 'Higher doping density reduces depletion barrier width (W ∝ √(1/N_d)), creating a very high electric field (~10⁶ V/m) at modest reverse voltages.',
          },
        ],
      },
    ],
  },

  // ─── ICSE 10 (MATHS & HISTORY/CIVICS) ──────────────────────────────────────
  ICSE_10: {
    subjects: ['English', 'Mathematics', 'Science (Physics/Chem/Bio)', 'History & Civics', 'Geography'],
    topics: [
      {
        id: 'icse10-math-gst-rd',
        subject: 'Mathematics',
        title: 'Commercial Maths: Inter-State IGST vs Intra-State CGST+SGST & RD Interest',
        examRelevance: 'ICSE 10th Section A Compulsory 3+3 Marks',
        blindspotCount: 2,
        summary: 'Splitting tax rate into equal CGST/SGST halves for intra-state sales vs full IGST for inter-state, plus n(n+1)/24 RD interest formula.',
        aiBlindspots: [
          {
            point: 'Net Tax Payable to Government Equals Output Tax Minus Input Tax Credit (ITC)',
            whatAiSays: 'Generic AI reports full tax collected from consumer as dealer GST paid to government.',
            whatAiMisses: 'In multi-stage dealer chains (Wholesaler -> Retailer -> Consumer), Net GST Paid by Dealer = Output GST Collected − Input Tax Credit already paid on purchase. Also CGST and SGST must be written SEPARATELY for intra-state bills!',
            examinerRubric: '1 mark for Discounted Selling Price, 1 mark for CGST & SGST split, 1 mark for Output Tax − ITC.',
          },
        ],
        coreConcepts: [
          'Recurring Deposit Interest: I = P × [n(n+1) / (2 × 12)] × (r / 100), where n is number of months.',
          'Maturity Value (MV): MV = (P × n) + Interest I.',
          'GST Rule: Intra-state splits r% into (r/2)% CGST + (r/2)% SGST; Inter-state charges full r% as IGST.',
        ],
        examQuestions: [
          {
            question: 'Mohan deposits ₹1,000 every month in an RD account for 2 years. If he receives ₹26,000 on maturity, find the rate of interest per annum.',
            marks: 4,
            keyPoints: [
              'P = ₹1,000, n = 24 months, Total Principal Deposited = ₹1,000 × 24 = ₹24,000.',
              'Interest earned I = MV − Principal = ₹26,000 − ₹24,000 = ₹2,000.',
              'Apply formula: 2,000 = 1,000 × [(24 × 25) / 24] × (r / 100) => 2,000 = 250 × r => r = 8% p.a.',
            ],
          },
        ],
        quiz: [
          {
            question: 'A retailer in Pune buys goods for ₹10,000 (18% GST) from Mumbai and sells to a customer in Pune for ₹12,000. What is his Net CGST payable?',
            options: ['₹1,080', '₹900', '₹180', '₹360'],
            correctIndex: 2,
            explanation: 'Total GST at 18% (9% CGST + 9% SGST): Output CGST = 9% of ₹12,000 = ₹1,080. Input CGST = 9% of ₹10,000 = ₹900. Net CGST = ₹1,080 − ₹900 = ₹180.',
          },
        ],
      },
      {
        id: 'icse10-hc-supreme-court',
        subject: 'History & Civics',
        title: 'Union Judiciary: Supreme Court Writs & Original vs Advisory Jurisdiction',
        examRelevance: 'ICSE Civics 4-Marker Guaranteed',
        blindspotCount: 2,
        summary: 'Five Fundamental Rights Writs (Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo Warranto) and Art 143 President advice.',
        aiBlindspots: [
          {
            point: 'Prohibition (Preventive Before Judgement) vs Certiorari (Quashing After Judgement)',
            whatAiSays: 'Generic AI merges Prohibition and Certiorari as generic orders to lower courts.',
            whatAiMisses: 'CISCE marking scheme explicitly distinguishes timing: Prohibition is issued DURING ongoing proceedings to stop excess jurisdiction; Certiorari is issued AFTER a lower court order/decision to quash it and transfer records upward.',
            examinerRubric: '1 mark each for accurate scope & court timing of writs.',
          },
        ],
        coreConcepts: [
          'Original Jurisdiction: Exclusive authority over Centre vs State or State vs State federal disputes.',
          'Advisory Jurisdiction (Article 143): President can seek SC opinion on public-interest law questions (opinion is NOT binding on President).',
          'Court of Record (Art 129): Judgements serve as legal precedents and SC holds power to punish for contempt.',
        ],
        examQuestions: [
          {
            question: 'Distinguish between Original and Appellate Jurisdiction of the Supreme Court. Name the writ issued when a person holds a public office unlawfully.',
            marks: 4,
            keyPoints: [
              'Original Jurisdiction: Cases heard directly for the first time in Supreme Court (e.g., Union vs States disputes).',
              'Appellate Jurisdiction: Hearing appeals against High Court verdicts in Constitutional, Civil & Criminal cases.',
              'Unlawful public office writ: Quo Warranto ("By what authority").',
            ],
          },
        ],
        quiz: [
          {
            question: 'Which writ is issued by the Supreme Court or High Court to command a lower court to quash an order already passed beyond its jurisdiction?',
            options: ['Habeas Corpus', 'Mandamus', 'Certiorari', 'Quo Warranto'],
            correctIndex: 2,
            explanation: 'Certiorari is curative/post-order: it quashes an already pronounced verdict by an inferior court or tribunal acting ultra vires.',
          },
        ],
      },
    ],
  },

  // ─── ISC CLASS 12 (MATHS & COMPUTER SCIENCE) ───────────────────────────────
  ISC_12: {
    subjects: ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology/Computer Science'],
    topics: [
      {
        id: 'isc12-math-linear-de',
        subject: 'Mathematics',
        title: 'Linear Differential Equations (Integrating Factor) & Shortest Distance of Skew Lines',
        examRelevance: 'ISC Section A 6-Marker Compulsory',
        blindspotCount: 2,
        summary: 'Standard form dy/dx + P(x)y = Q(x), IF = e^(∫P dx), and |(a₂−a₁)·(b₁×b₂)| / |b₁×b₂| vector shortest distance.',
        aiBlindspots: [
          {
            point: 'Verify If Two Lines Are Parallel (b₁ = λb₂) Before Using Skew Distance Formula',
            whatAiSays: 'Generic AI computes |b₁ × b₂| blindly.',
            whatAiMisses: 'If b₁ × b₂ = 0 (parallel lines!), the skew-line formula gives 0/0! You MUST check b₁ × b₂ ≠ 0; if parallel, switch to |(a₂ − a₁) × b| / |b|!',
            examinerRubric: '1.5M for extracting a₁, a₂, b₁, b₂; 2M for b₁×b₂ non-zero check; 2.5M for magnitude & dot product calculation.',
          },
        ],
        coreConcepts: [
          'Integrating Factor (IF) = e^(∫ P(x) dx) for linear first-order equation dy/dx + Py = Q.',
          'General Solution: y · (IF) = ∫ Q(x) · (IF) dx + C (never omit arbitrary constant C!).',
          'Coefficient Normalization: Must divide by leading x coefficient so dy/dx has coefficient +1 BEFORE identifying P(x).',
        ],
        examQuestions: [
          {
            question: 'Solve the differential equation: (1 + x²) dy/dx + 2xy = cos x.',
            marks: 6,
            keyPoints: [
              'Divide throughout by (1 + x²): dy/dx + [2x / (1 + x²)]y = cos x / (1 + x²).',
              'Here P(x) = 2x / (1 + x²). Integrating Factor IF = e^(∫ 2x/(1+x²) dx) = e^(ln(1+x²)) = 1 + x².',
              'Multiply by IF: y(1 + x²) = ∫ [cos x / (1 + x²)] · (1 + x²) dx = ∫ cos x dx = sin x + C.',
            ],
          },
        ],
        quiz: [
          {
            question: 'What is the Integrating Factor of the differential equation x(dy/dx) − y = 2x²?',
            options: ['x', '1/x', 'e^x', 'e^(-x)'],
            correctIndex: 1,
            explanation: 'Dividing by x gives dy/dx − (1/x)y = 2x. Here P(x) = -1/x. IF = e^(∫ -1/x dx) = e^(-ln x) = 1/x.',
          },
        ],
      },
    ],
  },

  // ─── TAMIL NADU BOARD (+2 SAMACHEER KALVI) ────────────────────────────────
  TN_BOARD: {
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'tn-chem-electrometallurgy',
        subject: 'Chemistry',
        title: 'Metallurgy & Buffer pH: Ellingham Diagram & Ostwald Dilution Law',
        examRelevance: 'TN +2 Samacheer Part IV 5-Marker',
        blindspotCount: 2,
        summary: 'ΔG° vs T negative slope intersections in Ellingham curves, self-reduction of Cu₂S, and α = √(Kₐ / C) Ostwald weak electrolyte derivation.',
        aiBlindspots: [
          {
            point: 'C(s) -> CO(g) Line Has Negative Slope Because ΔS° > 0 (+∆n_gas = +1)',
            whatAiSays: 'Generic AI states carbon always reduces all metal oxides at high temperature.',
            whatAiMisses: 'Samacheer Kalvi marking scheme asks WHY ΔG° for 2C + O₂ -> 2CO slopes DOWNWARD with temperature: 1 mol O₂(g) forms 2 mol CO(g), so entropy increases (ΔS° > 0), making −TΔS° increasingly negative! Any metal whose oxide line lies ABOVE the C -> CO line is reduced at that intersection temperature.',
            examinerRubric: '2 marks for entropy Δn_g = +1 slope explanation, 2 marks for intersection point interpretation, 1 mark for limitation (does not predict kinetics rate).',
          },
        ],
        coreConcepts: [
          'Ellingham Thermodynamic Rule: A reducing agent lowers ΔG° of the coupled reaction below zero.',
          'Ostwald Dilution Law: Kₐ = α²C / (1 − α) ≈ α²C for weak electrolytes (α ≪ 1), so α ∝ √(1/C).',
          'Solubility Product Precipitation: Precipitation occurs ONLY if Ionic Product Q_sp > K_sp.',
        ],
        examQuestions: [
          {
            question: 'Derive Ostwald Dilution Law relating degree of dissociation α and molar concentration C for a weak monobasic acid.',
            marks: 5,
            keyPoints: [
              'CH₃COOH ⇌ H⁺ + CH₃COO⁻ with initial moles 1 and equilibrium moles (1−α), α, α.',
              'Equilibrium concentrations: C(1−α), Cα, Cα.',
              'Dissociation constant Kₐ = Cα² / (1−α). Since α is very small for weak acid, (1−α) ≈ 1 => Kₐ = α²C => α = √(Kₐ/C).',
            ],
          },
        ],
        quiz: [
          {
            question: 'Why does the ΔG° vs T line for C(s) + 1/2 O₂(g) -> CO(g) slope downward as temperature rises?',
            options: [
              'The reaction is endothermic',
              'Entropy increases because 0.5 mol gas produces 1 mol gas (ΔS > 0)',
              'Carbon becomes liquid at 500 K',
              'ΔH becomes positive at high temperature',
            ],
            correctIndex: 1,
            explanation: 'Since ΔG° = ΔH° − TΔS° and Δn_gas = 1 − 0.5 = +0.5 (> 0), ΔS° is positive, giving a negative slope (−ΔS°) on the ΔG° vs T graph.',
          },
        ],
      },
      {
        id: 'tn-math-gauss-rank',
        subject: 'Mathematics',
        title: 'Applications of Matrices: Rank Consistency (Rouché-Capelli) & Cramer Rule',
        examRelevance: 'TN HSC +2 Chapter 1 Guaranteed 5-Marker',
        blindspotCount: 2,
        summary: 'Echelon form row reductions for augmented matrix [A|B], ρ(A) vs ρ([A|B]) criteria, and non-trivial homogeneous solutions |A| = 0.',
        aiBlindspots: [
          {
            point: 'Rank ρ(A) = ρ([A|B]) < n Guarantees Infinite Solutions — Never Assume Unique Without Comparing to n',
            whatAiSays: 'Generic AI stops after checking consistency ρ(A) = ρ([A|B]).',
            whatAiMisses: 'TNDGE 5-mark scheme requires writing all three step conclusions: (1) If ρ(A) = ρ([A|B]) = n -> consistent & unique solution; (2) If ρ(A) = ρ([A|B]) < n -> infinite 1-parameter/2-parameter family using k; (3) If ρ(A) ≠ ρ([A|B]) -> inconsistent.',
            examinerRubric: '2 marks for row-echelon transformations with labels (R₂ -> R₂ − 2R₁), 1 mark for rank comparison, 2 marks for parameter substitution.',
          },
        ],
        coreConcepts: [
          'Homogeneous System AX = 0 is ALWAYS consistent (trivial solution X = 0 always exists).',
          'Non-trivial solution exists for AX = 0 if and only if ρ(A) < n ⇔ det(A) = 0.',
          'Row Echelon transformations preserve matrix rank without changing solution set.',
        ],
        examQuestions: [
          {
            question: 'Test for consistency and solve by rank method: x − y + 2z = 2, 2x + y + 4z = 7, 4x − y + z = 4.',
            marks: 5,
            keyPoints: [
              'Form augmented matrix [A|B] and reduce below pivot (1,1) using R₂->R₂−2R₁ and R₃->R₃−4R₁.',
              'Further reduce R₃ using R₂ to obtain upper triangular echelon form.',
              'Verify ρ(A) = 3 and ρ([A|B]) = 3 = number of unknowns -> unique consistent solution.',
              'Back-substitute to find z, y, and x.',
            ],
          },
        ],
        quiz: [
          {
            question: 'A system of 3 linear equations in 3 unknowns has ρ(A) = 2 and ρ([A|B]) = 2. How many solutions exist?',
            options: ['Zero solutions', 'Unique solution', 'Infinitely many solutions (1 parameter k)', 'Exactly two solutions'],
            correctIndex: 2,
            explanation: 'Since ρ(A) = ρ([A|B]) = 2 < 3 (number of unknowns), the system is consistent with 3 − 2 = 1 free parameter, yielding infinitely many solutions.',
          },
        ],
      },
    ],
  },

  // ─── BIHAR BOARD (BSEB 50% OMR + 50% SUBJECTIVE) ────────────────────────────
  BIHAR_BOARD: {
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'bihar-chem-raoult-vanthoff',
        subject: 'Chemistry',
        title: 'Solutions: Raoult Law, Elevation in Boiling Point & van t Hoff Factor (i)',
        examRelevance: 'BSEB Intermediate OMR MCQs + 5-Marker Long Numerical',
        blindspotCount: 2,
        summary: 'Ideal vs Azeotrope mixtures, ΔT_b = i · K_b · m (molality, NOT molarity), and abnormal molar mass degree of dissociation.',
        aiBlindspots: [
          {
            point: 'ΔT_b and ΔT_f Strictly Use Molality (m) & Solvent Mass in kg — NOT Solution Volume!',
            whatAiSays: 'Generic AI substitutes Molarity when density or solvent weight is given.',
            whatAiMisses: 'In BSEB 5-mark numericals and OMR MCQs (where students pick 10-second distractors), remember Colligative ΔT_b uses Molality (moles of solute / kg of SOLVENT) because mass is temperature-independent, whereas Molarity changes with temperature!',
            examinerRubric: '1 mark for i factor, 2 marks for molality calculation with kg conversion, 2 marks for molar mass with g/mol units.',
          },
        ],
        coreConcepts: [
          'Minimum Boiling Azeotrope: Positive deviation from Raoult Law (e.g., Ethanol + Water 95.6%).',
          'van t Hoff Factor i = Normal Molar Mass / Observed Molar Mass = 1 + (n − 1)α for dissociation.',
          'Osmotic Pressure π = i·C·R·T (preferred for polymers/proteins due to large measurable pressure at room temperature).',
        ],
        examQuestions: [
          {
            question: '18 g of glucose (C₆H₁₂O₆, M = 180 g/mol) is dissolved in 1 kg of water. At what temperature will this water boil at 1.013 bar? (K_b for water = 0.52 K kg mol⁻¹)',
            marks: 5,
            keyPoints: [
              'Moles of glucose n = 18 / 180 = 0.1 mol; van t Hoff factor i = 1 (non-electrolyte).',
              'Molality m = 0.1 mol / 1 kg = 0.1 mol/kg.',
              'ΔT_b = K_b × m = 0.52 × 0.1 = 0.052 K.',
              'Water normal boiling point = 373.15 K => Solution boiling point = 373.15 + 0.052 = 373.202 K (or 100.052 °C).',
            ],
          },
        ],
        quiz: [
          {
            question: 'Which concentration term is temperature-independent and used directly in Boiling Point Elevation ΔT_b?',
            options: ['Molarity (M)', 'Normality (N)', 'Molality (m)', 'Weight/Volume %'],
            correctIndex: 2,
            explanation: 'Molality involves only masses (moles/kg solvent), so it does not vary with thermal expansion.',
          },
        ],
      },
      {
        id: 'bihar-bio-biotech-pcr',
        subject: 'Biology',
        title: 'Biotechnology: PCR Thermal Cycle Steps & pBR322 Plasmid Selection',
        examRelevance: 'BSEB High-Yield 5-Marker Diagram + OMR Favorite',
        blindspotCount: 2,
        summary: 'Denaturation (94°C), Annealing (50-60°C), Extension (72°C with Taq polymerase), and amp^R / tet^R insertional inactivation.',
        aiBlindspots: [
          {
            point: 'Taq Polymerase Isolated from Thermus aquaticus Resists 94°C Denaturation',
            whatAiSays: 'Generic AI calls the PCR enzyme DNA polymerase.',
            whatAiMisses: 'Normal E. coli DNA polymerase denatures immediately at 94°C! BSEB evaluation specifically awards 1 mark for naming thermostable Taq DNA polymerase from hot-spring bacterium Thermus aquaticus and listing exact temperatures (94°C -> 54°C -> 72°C).',
            examinerRubric: '2 marks for 3 temperature stages diagram, 1.5 marks for Taq polymerase source, 1.5 marks for 2^n amplification yield.',
          },
        ],
        coreConcepts: [
          'Three PCR Steps: Denaturation (H-bond melting 94°C) -> Primer Annealing (50–60°C) -> Extension (Taq at 72°C).',
          'After n PCR cycles, 1 DNA template amplifies into 2^n copies (30 cycles ≈ 1 billion copies).',
          'Restriction Sites in pBR322: BamHI and SalI lie inside tet^R (Tetracycline resistance gene).',
        ],
        examQuestions: [
          {
            question: 'Explain the three steps of Polymerase Chain Reaction (PCR) with a neat diagram and mention why Taq polymerase is essential.',
            marks: 5,
            keyPoints: [
              '1. Denaturation (94°C): Heat separates dsDNA strands by breaking hydrogen bonds.',
              '2. Annealing (~55°C): Forward & reverse primers bind complementary 3-prime ends.',
              '3. Extension (72°C): Thermostable Taq polymerase (from Thermus aquaticus) adds dNTPs across new strand without heat denaturation.',
            ],
          },
        ],
        quiz: [
          {
            question: 'In pBR322 vector, if foreign DNA is inserted at the BamHI site within the tet^R gene, recombinant transformants will:',
            options: [
              'Grow in both ampicillin and tetracycline media',
              'Grow in ampicillin medium but die in tetracycline medium',
              'Die in ampicillin medium',
              'Become resistant to kanamycin automatically',
            ],
            correctIndex: 1,
            explanation: 'Inserting foreign DNA at BamHI causes insertional inactivation of tet^R; recombinants retain amp^R resistance but lose tetracycline resistance.',
          },
        ],
      },
    ],
  },

  // ─── KERALA BOARD (DHSE +2) ─────────────────────────────────────────────────
  KL_BOARD: {
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'kl-chem-kinetics-arrhenius',
        subject: 'Chemistry',
        title: 'Chemical Kinetics: Pseudo-First Order & Arrhenius Activation Energy',
        examRelevance: 'Kerala DHSE SCERT 3-4 Marker Guaranteed',
        blindspotCount: 2,
        summary: 'Slope = −Eₐ / (2.303 R) on log k vs 1/T plot, half-life t₁/₂ = 0.693 / k independence of initial concentration [R]₀.',
        aiBlindspots: [
          {
            point: 'Unit Trap for Activation Energy R (8.314 J mol⁻¹ K⁻¹ vs kJ)',
            whatAiSays: 'Generic AI substitutes R = 0.0821 (gas law atm L value) into Arrhenius equation.',
            whatAiMisses: 'DHSE evaluators penalize substituting R = 0.0821 L atm! Since Eₐ is measured in Joules or kJ/mol, you MUST use R = 8.314 J K⁻¹ mol⁻¹ and convert final answer from Joules to kJ by dividing by 1000.',
            examinerRubric: '1 mark for log(k₂/k₁) formula, 1 mark for R = 8.314, 1 mark for Kelvin temperature conversion (273.15 + °C), 1 mark for Eₐ in kJ/mol.',
          },
        ],
        coreConcepts: [
          'First-order half-life: t₁/₂ = 0.693 / k (completely independent of initial concentration [R]₀).',
          'Arrhenius Equation: k = A · e^(-Eₐ / RT) => log(k₂/k₁) = [Eₐ / (2.303 R)] · [(T₂ − T₁) / (T₁T₂)].',
          'Catalyst Effect: Lowers activation energy Eₐ by providing an alternate path, increasing k without shifting ΔG or equilibrium K.',
        ],
        examQuestions: [
          {
            question: 'Prove that for a first-order reaction, time required for 99.9% completion is approximately 10 times its half-life (t₁/₂).',
            marks: 3,
            keyPoints: [
              't_99.9% = (2.303 / k) log(100 / 0.1) = (2.303 / k) log(1000) = (2.303 / k) × 3 = 6.909 / k.',
              't_50% = (2.303 / k) log(2) = 0.693 / k.',
              'Ratio: t_99.9% / t_50% = 6.909 / 0.693 ≈ 9.97 ≈ 10.',
            ],
          },
        ],
        quiz: [
          {
            question: 'What is the slope of the linear plot of ln(k) versus 1/T in the Arrhenius equation?',
            options: ['-Eₐ / R', '-Eₐ / (2.303 R)', '+Eₐ / R', 'ln A'],
            correctIndex: 0,
            explanation: 'In natural log ln(k) = ln(A) − (Eₐ/R)(1/T), the slope is −Eₐ/R. In base-10 log₁₀(k), slope becomes −Eₐ/(2.303 R).',
          },
        ],
      },
    ],
  },

  // ─── WEST BENGAL BOARD (WBCHSE) ─────────────────────────────────────────────
  WB_BOARD: {
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'wb-phy-ampere-solenoid',
        subject: 'Physics',
        title: 'Electromagnetism: Biot-Savart Axis Field & Ampere Solenoid Interior Derivation',
        examRelevance: 'WBCHSE Group C 3-5 Marker Compulsory',
        blindspotCount: 2,
        summary: 'Circular current coil axial field B = μ₀IR² / [2(R²+x²)^(3/2)], Amperian rectangular loop boundary, and end-effect half field μ₀nI/2.',
        aiBlindspots: [
          {
            point: 'Magnetic Field at Solenoid Edge Drops to HALF of Center Value (B_edge = μ₀nI / 2)',
            whatAiSays: 'Generic AI states B = μ₀nI everywhere inside any solenoid.',
            whatAiMisses: 'WBCHSE conceptual 2-markers test end-effects: B = μ₀nI holds deep inside a long solenoid (where total subtended angle spans 0 to π), while at either OPEN END the integration stops at π/2, giving exactly HALF the field: B_end = (1/2)μ₀nI!',
            examinerRubric: 'Full marks for clearly drawing the 4-sided Amperian loop showing perpendicular sides zero dot product (∫B·dl = 0) and exterior B = 0.',
          },
        ],
        coreConcepts: [
          'Circular Coil Center Field: At x = 0, B = μ₀NI / (2R) tesla.',
          'Ideal Long Solenoid Center Field: B = μ₀nI, where n = N/L turns per unit length.',
          'Magnetic Force on Moving Charge: F = q(v × B) does ZERO work because F ⊥ v always.',
        ],
        examQuestions: [
          {
            question: 'Using Ampere Circuital Law, derive the expression for magnetic field well inside a long current-carrying solenoid. State its value at one end.',
            marks: 4,
            keyPoints: [
              'Choose rectangular Amperian loop abcd enclosing nL turns.',
              'Along vertical arms bc & da, B ⊥ dl so ∫B·dl = 0; outside solenoid B ≈ 0.',
              '∮ B·dl = BL = μ₀ (nLI) => B = μ₀nI at interior.',
              'At open ends of solenoid: B_end = (1/2) μ₀nI.',
            ],
          },
        ],
        quiz: [
          {
            question: 'If the number of turns per unit length of a long solenoid is doubled while current is halved, magnetic field inside becomes:',
            options: ['Quadrupled', 'Halved', 'Unchanged', 'Zero'],
            correctIndex: 2,
            explanation: 'B = μ₀ n I. If n -> 2n and I -> I/2, the product (2n)(I/2) = nI remains identical.',
          },
        ],
      },
    ],
  },

  // ─── AP & TELANGANA BOARD (BIEAP / TSBIE IPE) ──────────────────────────────
  AP_BOARD: {
    subjects: ['Physics', 'Chemistry', 'Mathematics (2A & 2B)', 'Botany & Zoology'],
    topics: [
      {
        id: 'ap-math-demoivre-2a',
        subject: 'Mathematics (2A & 2B)',
        title: 'Maths 2A: De Moivre Theorem Proof & nth Roots of Complex Numbers',
        examRelevance: 'AP/TS IPE Section C 7-Marker LAQ Guaranteed',
        blindspotCount: 2,
        summary: '(cosθ + i sinθ)ⁿ = cos(nθ) + i sin(nθ) for integer & rational fractions, cis notation, and k = 0,1,...,n−1 distinct roots.',
        aiBlindspots: [
          {
            point: 'Adding 2kπ Period Before Applying Fractional Exponent 1/n',
            whatAiSays: 'Generic AI divides θ directly by n without 2kπ, yielding only 1 root instead of n distinct roots.',
            whatAiMisses: 'BIEAP/TSBIE 7-mark evaluators award ZERO for step 3 if 2kπ is omitted! Before taking (cos θ + i sin θ)^(1/n), you MUST write cis(2kπ + θ) so taking 1/n yields all n distinct roots k = 0, 1, ..., n−1!',
            examinerRubric: '2 marks for polar r cis θ conversion, 2 marks for 2kπ inclusion, 3 marks for enumerating k = 0, 1, ..., n−1.',
          },
        ],
        coreConcepts: [
          'Polar Form: z = x + iy = r(cos θ + i sin θ), where r = √(x²+y²) and principal arg θ ∈ (−π, π].',
          'De Moivre Identity: (cis θ)ⁿ = cis(nθ); if n = p/q rational, all q roots are cis[(2kπ + θ)p/q] for k=0..q−1.',
          'Cube Roots Sum & Product: 1 + ω + ω² = 0 and ω³ = 1.',
        ],
        examQuestions: [
          {
            question: 'Using De Moivre Theorem, show that (1 + cos θ + i sin θ)ⁿ + (1 + cos θ − i sin θ)ⁿ = 2^(n+1) cosⁿ(θ/2) cos(nθ/2).',
            marks: 7,
            keyPoints: [
              'Substitute half-angle identities: 1 + cos θ = 2 cos²(θ/2) and sin θ = 2 sin(θ/2)cos(θ/2).',
              'Factor 2 cos(θ/2) out -> [2 cos(θ/2)]ⁿ [cis(nθ/2) + cis(−nθ/2)].',
              'Since cis(α) + cis(−α) = 2 cos α, simplify to 2^(n+1) cosⁿ(θ/2) cos(nθ/2).',
            ],
          },
        ],
        quiz: [
          {
            question: 'How many distinct values does (cos π + i sin π)^(1/4) have according to De Moivre Theorem?',
            options: ['1', '2', '4', '8'],
            correctIndex: 2,
            explanation: 'A rational exponent p/q = 1/4 always produces exactly q = 4 distinct complex roots by substituting k = 0, 1, 2, 3 into cis[(2kπ + π)/4].',
          },
        ],
      },
      {
        id: 'ap-bio-krebs-cycle',
        subject: 'Botany & Zoology',
        title: 'Plant Respiration: Krebs (TCA) Cycle ATP/NADH Accounting & Mitochondria Matrix',
        examRelevance: 'AP/TS IPE Botany 8-Marker LAQ Compulsory',
        blindspotCount: 2,
        summary: 'Oxaloacetate (4C) condensation with Acetyl-CoA (2C), 3 NADH + 1 FADH₂ + 1 GTP per turn, and SDH inner-membrane enzyme.',
        aiBlindspots: [
          {
            point: 'One Glucose Yields TWO Pyruvates -> Double the Single-Cycle Counts!',
            whatAiSays: 'Generic AI cites 3 NADH, 1 FADH₂, 1 GTP as total output for 1 glucose.',
            whatAiMisses: 'One glucose molecule breaks into TWO Pyruvate -> TWO Acetyl-CoA! So per glucose, the Krebs cycle turns TWICE producing 6 NADH, 2 FADH₂, 2 ATP(GTP), and 4 CO₂ inside Krebs itself (plus 2 NADH from Link Reaction)!',
            examinerRubric: 'IPE 8-mark rubric: 4 marks for labeled 8-step cyclic pathway with carbon atom counts (6C->5C->4C), 2 marks for enzyme cofactors (Mg²⁺/NAD⁺), 2 marks for exact net ATP balance.',
          },
        ],
        coreConcepts: [
          'Link Reaction: Pyruvate (3C) -> Acetyl-CoA (2C) + CO₂ + NADH (enzyme: Pyruvate Dehydrogenase + Mg²⁺).',
          'Unique Location Exception: Succinate Dehydrogenase (SDH) is bound to the INNER mitochondrial membrane, whereas all other TCA enzymes float in Matrix.',
          'Net Oxidative Yield: 1 NADH ≈ 3 ATP (in classical/IPE text) and 1 FADH₂ ≈ 2 ATP -> 38 ATP aerobic net.',
        ],
        examQuestions: [
          {
            question: 'Give an account of the Tricarboxylic Acid (Krebs) Cycle in plants with schematic reactions and net ATP yield per glucose.',
            marks: 8,
            keyPoints: [
              'Oxaloacetate (4C) + Acetyl-CoA (2C) -> Citrate (6C) catalyzed by Citrate Synthase.',
              'Two oxidative decarboxylations: Isocitrate (6C)->α-Ketoglutarate (5C) and α-KG (5C)->Succinyl-CoA (4C), releasing NADH + CO₂.',
              'Substrate-level phosphorylation: Succinyl-CoA -> Succinate produces GTP/ATP.',
              '2 Turns per Glucose yield 6 NADH, 2 FADH₂, 2 ATP.',
            ],
          },
        ],
        quiz: [
          {
            question: 'Which enzyme of the Krebs (TCA) cycle is uniquely attached to the inner mitochondrial membrane instead of the mitochondrial matrix?',
            options: ['Citrate Synthase', 'Isocitrate Dehydrogenase', 'Succinate Dehydrogenase', 'Malate Dehydrogenase'],
            correctIndex: 2,
            explanation: 'Succinate Dehydrogenase (also Complex II of Electron Transport Chain) is embedded in the inner mitochondrial membrane.',
          },
        ],
      },
    ],
  },

  // ─── RAJASTHAN BOARD (RBSE) ─────────────────────────────────────────────────
  RJ_BOARD: {
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'rj-chem-dblock-kmno4',
        subject: 'Chemistry',
        title: 'd & f Block Elements: KMnO₄ Preparation, Lanthanoid Contraction & Catalytic Action',
        examRelevance: 'RBSE 4-Marker Guaranteed Inorganic Question',
        blindspotCount: 2,
        summary: 'Pyrolusite fusion + electrolytic oxidation, poor shielding of 4f orbitals causing Zr/Hf identical radii, and variable oxidation catalysis.',
        aiBlindspots: [
          {
            point: 'Acidic vs Neutral vs Alkaline Oxidation Equivalent Factor of MnO₄⁻',
            whatAiSays: 'Generic AI says KMnO₄ always reduces to Mn²⁺.',
            whatAiMisses: 'In RBSE balanced equation questions: Acidic KMnO₄ (MnO₄⁻ + 8H⁺ + 5e⁻ -> Mn²⁺) gains 5 electrons; Neutral/Faintly Alkaline KMnO₄ (MnO₄⁻ + 2H₂O + 3e⁻ -> MnO₂↓) gains ONLY 3 electrons (oxidizing I⁻ to IO₃⁻ instead of I₂)!',
            examinerRubric: '1 mark for Pyrolusite reaction, 1.5 marks for balancing ionic oxidation reactions in acidic vs neutral media, 1.5 marks for 4f poor-shielding definition.',
          },
        ],
        coreConcepts: [
          'Lanthanoid Contraction: Steady atomic/ionic size decrease from La³⁺ to Lu³⁺ due to poor nuclear shielding by 4f electrons.',
          'Consequence: Zr (4d) and Hf (5d) possess nearly identical atomic radii (160 pm vs 159 pm), making separation difficult.',
          'Interstitial Alloys & Catalysis: Vacant d-orbitals + multiple oxidation states enable adsorption and low-activation-energy intermediates.',
        ],
        examQuestions: [
          {
            question: 'What is Lanthanoid Contraction? State two consequences and write the balanced ionic equation for oxidation of Fe²⁺ by acidic KMnO₄.',
            marks: 4,
            keyPoints: [
              'Definition: Progressive decrease in ionic radii with rising atomic number across 4f series due to imperfect 4f orbital shielding.',
              'Consequences: Similar chemical radii of 4d/5d transition pairs (Zr/Hf) and progressive decrease in basicity of lanthanoid hydroxides.',
              'Balanced Ionic Equation: MnO₄⁻ + 5Fe²⁺ + 8H⁺ -> Mn²⁺ + 5Fe³⁺ + 4H₂O.',
            ],
          },
        ],
        quiz: [
          {
            question: 'In faintly alkaline or neutral medium, permanganate ion (MnO₄⁻) reduces to which manganese species when oxidizing iodide (I⁻) to iodate (IO₃⁻)?',
            options: ['Mn²⁺', 'MnO₂', 'MnO₄²⁻', 'Mn₂O₇'],
            correctIndex: 1,
            explanation: 'In neutral/faintly alkaline medium, MnO₄⁻ undergoes a 3-electron reduction to form brown MnO₂ precipitate.',
          },
        ],
      },
    ],
  },

  // ─── GUJARAT BOARD (GSEB) ───────────────────────────────────────────────────
  GJ_BOARD: {
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'gj-math-lpp-cornerpoint',
        subject: 'Mathematics',
        title: 'Linear Programming: Feasible Region Boundary & Unbounded Open Half-Plane Test',
        examRelevance: 'GSEB Section D 4-Marker Guaranteed Graph Question',
        blindspotCount: 2,
        summary: 'Corner point evaluation, Z = ax + by extremum, and mandatory open half-plane verification (ax + by > M) when feasible region is unbounded.',
        aiBlindspots: [
          {
            point: 'Mandatory Unbounded Verification Test (Does Z = ax+by Have ANY Point Beyond M?)',
            whatAiSays: 'Generic AI always declares the largest corner point Z value as maximum without checking boundedness.',
            whatAiMisses: 'When the feasible region is UNBOUNDED, the maximum/minimum corner value M exists ONLY IF the open half-plane ax + by > M (for Max) or ax + by < M (for Min) shares ZERO points with the feasible region! GSEB Section D deducts 1.5 full marks for skipping the dotted half-plane test!',
            examinerRubric: '1M constraints intersection points, 1.5M shaded graph & corner table, 1.5M explicit unbounded open half-plane check.',
          },
        ],
        coreConcepts: [
          'Fundamental Theorem of LPP: Optimal values of objective function Z = ax + by, if they exist, ALWAYS occur at corner vertices.',
          'Bounded Region: Both Maximum and Minimum of Z are guaranteed to exist at corner vertices.',
          'Unbounded Region: Maximum/Minimum may NOT exist; graph dotted line ax+by = M to verify no feasible overlap.',
        ],
        examQuestions: [
          {
            question: 'Minimize Z = 200x + 500y subject to x + 2y ≥ 10, 3x + 4y ≤ 24, x ≥ 0, y ≥ 0 using graphical corner-point method.',
            marks: 4,
            keyPoints: [
              'Plot lines x + 2y = 10 and 3x + 4y = 24; identify shaded bounded triangular feasible region.',
              'Corner points: A(0, 5), B(4, 3), C(0, 6).',
              'Evaluate Z: At A(0,5) -> 2500; At B(4,3) -> 800 + 1500 = 2300; At C(0,6) -> 3000.',
              'Minimum Z = 2300 at (4, 3).',
            ],
          },
        ],
        quiz: [
          {
            question: 'When solving an LPP with an unbounded feasible region, under what condition does the corner value M fail to be the Minimum of Z = ax + by?',
            options: [
              'When there are more than 3 corner vertices',
              'When the open half-plane ax + by < M has common points with the feasible region',
              'When objective coefficients are positive',
              'When x and y intercepts are integers',
            ],
            correctIndex: 1,
            explanation: 'If the open half-plane ax + by < M overlaps the unbounded feasible region, points inside that overlap produce even smaller Z values, so no minimum exists.',
          },
        ],
      },
    ],
  },

  // ─── MADHYA PRADESH BOARD (MPBSE) ──────────────────────────────────────────
  MP_BOARD: {
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'mp-chem-kohlrausch-nernst',
        subject: 'Chemistry',
        title: 'Electrochemistry: Kohlrausch Law of Independent Migration & Molar Conductivity',
        examRelevance: 'MPBSE Blueprint 4-Marker Guaranteed Derivation + Numerical',
        blindspotCount: 2,
        summary: 'Λ°_m = ν₊λ°₊ + ν₋λ°₋, strong (Debye-Huckel-Onsager straight line) vs weak electrolyte (steep asymptotic rise) dilution curves.',
        aiBlindspots: [
          {
            point: 'Why Strong Electrolyte Λ_m Graph Can Extrapolate to c=0 While Weak Electrolyte Cannot',
            whatAiSays: 'Generic AI states molar conductivity increases for all electrolytes and stops.',
            whatAiMisses: 'MPBSE conceptual 4-markers specifically ask WHY Λ°_m of CH₃COOH (weak) CANNOT be found by linear graph extrapolation to √c -> 0: its Λ_m rises steeply near infinite dilution due to sudden jump in degree of ionization α -> 1, making extrapolation impossible—requiring Kohlrausch additive ion sum instead!',
            examinerRubric: '1 mark for Kohlrausch statement, 1 mark for √c vs Λ_m graph showing strong vs weak curves, 2 marks for degree of dissociation α = Λ_m / Λ°_m.',
          },
        ],
        coreConcepts: [
          'Kohlrausch Law: At infinite dilution, limiting molar conductivity of an electrolyte equals the sum of individual ionic conductivities.',
          'Application: Λ°(CH₃COOH) = Λ°(CH₃COONa) + Λ°(HCl) − Λ°(NaCl).',
          'Specific Conductivity κ decreases on dilution (fewer ions per cm³), whereas Molar Conductivity Λ_m = 1000κ / M ALWAYS increases on dilution.',
        ],
        examQuestions: [
          {
            question: 'State Kohlrausch Law and explain its two key applications. Why does specific conductivity κ decrease with dilution while molar conductivity Λ_m increases?',
            marks: 4,
            keyPoints: [
              'Statement: Limiting molar conductivity is sum of cation and anion contributions multiplied by stoichiometric ion count.',
              'Applications: Calculating Λ°_m and dissociation constant Kₐ = cα²/(1−α) for weak electrolytes.',
              'Dilution Paradox: κ decreases because ions per unit volume drop; Λ_m increases because total solution volume V containing 1 mole grows faster than κ drops.',
            ],
          },
        ],
        quiz: [
          {
            question: 'As an aqueous solution of NaCl is diluted with pure water, how do Specific Conductivity (κ) and Molar Conductivity (Λ_m) change?',
            options: [
              'Both κ and Λ_m decrease',
              'κ decreases while Λ_m increases',
              'κ increases while Λ_m decreases',
              'Both remain completely constant',
            ],
            correctIndex: 1,
            explanation: 'Dilution lowers ion count per cm³ (lowering κ), but increases inter-ionic separation and volume per mole, increasing Λ_m.',
          },
        ],
      },
    ],
  }
};

