const fs = require('fs');

const targetPath = 'C:/Users/aasim/.gemini/antigravity/scratch/StudyQuest/frontend/src/config/studyGuideData.js';
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Definition of CAT
const CAT_KB = `
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
`;

// 2. Definition of CBSE_10
const CBSE_10_KB = `
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
            examinerRubric: '1 mark for D = 0 formula, 1.5 marks for finding candidate k values, 1.5 marks for explicitly stating \"Since equation is quadratic, coefficient of x^2 ≠ 0 => k ≠ 1, hence k = 2 is the only solution\".'
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
      }
    ]
  },
`;

// Inject CAT and CBSE_10 right before closing }; of EXAM_KNOWLEDGEBASE
// Find the closing line "};" before "// CURATION ENGINE HELPER FUNCTIONS"
const pattern = /\n\};\r?\n\r?\n\/\/\s*─+\r?\n\/\/\s*CURATION ENGINE HELPER FUNCTIONS/;
if (!content.match(pattern)) {
  console.error('Could not find pattern for end of EXAM_KNOWLEDGEBASE');
  process.exit(1);
}

const replacement = '\n' + CAT_KB + CBSE_10_KB + '};\n\n// ─────────────────────────────────────────────────────────────────────────────\n// CURATION ENGINE HELPER FUNCTIONS';
content = content.replace(pattern, replacement);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully injected CAT and CBSE_10 into studyGuideData.js!');
