const fs = require('fs');

const targetPath = 'C:\\Users\\aasim\\.gemini\\antigravity\\scratch\\StudyQuest\\frontend\\src\\config\\studyGuideData.js';
let content = fs.readFileSync(targetPath, 'utf8').replace(/\r\n/g, '\n');

const remainingBoards = `
  // ─── KERALA STATE BOARD (DHSE PLUS TWO) ──────────────────────────────────
  KL_BOARD: {
    name: 'Kerala Board (DHSE +2)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'kl-phy-cyclotron',
        subject: 'Physics',
        title: 'Moving Charges: Cyclotron Working Principle & Relativistic Limit',
        examRelevance: 'Kerala DHSE Part III 4-Marker Essay Question',
        blindspotCount: 3,
        summary: 'Resonance frequency f = qB / (2pi * m) and the relativistic mass increase limitation for high energy particles.',
        aiBlindspots: [
          {
            point: 'Relativistic Mass Increase Limitation (m = m0 / sqrt(1 - v^2/c^2))',
            whatAiSays: 'Generic AI states that cyclotrons accelerate all ions to any speed.',
            whatAiMisses: 'DHSE examiners look for the relativistic breakdown: as ion velocity approaches the speed of light, its relativistic mass m increases. Consequently, revolution frequency f = qB/(2pi*m) decreases, throwing the ion out of phase with the high-frequency alternating electric field! Electrons cannot be accelerated due to negligible rest mass.',
            examinerRubric: 'Kerala marking key gives 1.5 marks for stating why electrons cannot be accelerated in a cyclotron and writing the relativistic mass formula.',
          },
        ],
        coreConcepts: [
          'Magnetic force provides centripetal acceleration: qvB = m*v^2 / r => r = mv / (qB).',
          'Period is independent of radius: T = 2*pi*m / (qB). Resonance condition: f_osc = qB / (2*pi*m).',
          'Maximum kinetic energy: K_max = 1/2 * m * v_max^2 = (q^2 * B^2 * R^2) / (2m).',
        ],
        examQuestions: [
          {
            question: 'With a neat schematic diagram, explain the principle and working of a cyclotron. Why can electrons not be accelerated using a cyclotron?',
            marks: 4,
            keyPoints: [
              'Schematic diagram showing Dees D1 and D2, evacuated chamber, and alternating high-frequency oscillator.',
              'Derivation of cyclotron frequency f = qB / (2pi m).',
              'Relativistic limitation: high velocity causes mass increase and out-of-phase condition; tiny electron rest mass makes velocity relativistic almost immediately.',
            ],
          },
        ],
        quiz: [
          {
            question: 'The maximum kinetic energy acquired by a charged particle of charge q and mass m in a cyclotron of Dee radius R is proportional to:',
            options: ['R', 'R^2', '1 / R', 'R^3'],
            correctIndex: 1,
            explanation: 'K_max = (q^2 * B^2 * R^2) / (2m). Kinetic energy is directly proportional to the square of the radius of the Dees.',
          },
        ],
      },
    ],
  },

  // ─── WEST BENGAL BOARD (WBCHSE HIGHER SECONDARY) ──────────────────────────
  WB_BOARD: {
    name: 'West Bengal Board (WBCHSE HS)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'wb-chem-cannizzaro',
        subject: 'Chemistry',
        title: 'Organic Chemistry: Cannizzaro Reaction & Hydride Shift Mechanism',
        examRelevance: 'WBCHSE Group C 3-Marker Compulsory Mechanism',
        blindspotCount: 3,
        summary: 'Disproportionation of non-enolizable aldehydes (e.g. Benzaldehyde, Formaldehyde) under 50% concentrated NaOH.',
        aiBlindspots: [
          {
            point: 'Hydride Ion (H-) Transfer is the Rate-Determining Step',
            whatAiSays: 'Generic AI states one molecule oxidizes and one reduces.',
            whatAiMisses: 'WBCHSE grading keys strictly assess the mechanistic arrows: nucleophilic attack of OH- generates dianion or monoanion. The direct transfer of a hydride ion (H-) from this intermediate to the carbonyl carbon of the second aldehyde molecule is the slow, rate-determining step (RDS).',
            examinerRubric: 'Curved arrows showing H- shift from CH(O-)(OH) to C=O of second benzaldehyde carries 1.5 marks.',
          },
        ],
        coreConcepts: [
          'Pre-condition: Absence of alpha-hydrogens (prevents Aldol condensation).',
          'Self-redox reaction: 2 C6H5CHO + conc. NaOH -> C6H5COONa (Sodium Benzoate) + C6H5CH2OH (Benzyl Alcohol).',
          'Crossed Cannizzaro: Formaldehyde (HCHO) is oxidized preferentially to formic acid (HCOONa) while higher aldehyde is reduced to alcohol.',
        ],
        examQuestions: [
          {
            question: 'Explain the mechanism of the Cannizzaro reaction of benzaldehyde with 50% concentrated sodium hydroxide. What happens when a mixture of benzaldehyde and formaldehyde is treated with conc. NaOH?',
            marks: 3,
            keyPoints: [
              'Step 1: OH- attacks carbonyl carbon to form tetrahedral alkoxide intermediate.',
              'Step 2: Slow hydride ion transfer to second benzaldehyde molecule.',
              'Crossed Cannizzaro: Formaldehyde undergoes oxidation because its carbonyl carbon is more electrophilic (less steric hindrance).',
            ],
          },
        ],
        quiz: [
          {
            question: 'In a crossed Cannizzaro reaction between benzaldehyde and formaldehyde, the major oxidation product is:',
            options: ['Sodium Benzoate', 'Sodium Formate', 'Benzyl Alcohol', 'Benzoic Acid'],
            correctIndex: 1,
            explanation: 'Formaldehyde is much more reactive towards nucleophilic attack by OH- than benzaldehyde, so formaldehyde is oxidized to sodium formate, and benzaldehyde is reduced to benzyl alcohol.',
          },
        ],
      },
    ],
  },

  // ─── AP & TELANGANA STATE BOARDS (IPE INTERMEDIATE) ───────────────────────
  AP_BOARD: {
    name: 'AP/Telangana Board (IPE)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'ap-phy-energy-conservation',
        subject: 'Physics',
        title: 'Work Energy Power: Conservation of Energy in Freely Falling Body',
        examRelevance: 'IPE Section C 8-Marker Guaranteed Long Answer',
        blindspotCount: 3,
        summary: 'Proof that total mechanical energy E = K + U remains constant at all heights (A at height H, B at intermediate x, C at ground).',
        aiBlindspots: [
          {
            point: 'Calculation of Velocity at Intermediate Point B via v^2 - u^2 = 2as',
            whatAiSays: 'Generic AI states energy is conserved.',
            whatAiMisses: 'IPE evaluators require rigorous algebraic proof at exactly three designated points: Point A (height H: K_A = 0, U_A = mgH => E_A = mgH); Point B (fallen distance x: v_B^2 = 2gx, K_B = mgx, U_B = mg(H - x) => E_B = mgH); Point C (just striking ground: v_C^2 = 2gH, K_C = mgH, U_C = 0 => E_C = mgH).',
            examinerRubric: 'BIEAP/TSBIE 8-mark rubric allocates: 2 marks for point A, 3 marks for point B, 2 marks for point C, 1 mark for conclusion statement and diagram.',
          },
        ],
        coreConcepts: [
          'Work-Energy Theorem: Work done by conservative gravitational force equals negative change in potential energy Delta U = -W_g.',
          'Mechanical energy: Total E = K + U = constant.',
          'Height-velocity equivalence: Kinetic energy increases at the exact expense of potential energy.',
        ],
        examQuestions: [
          {
            question: 'State the law of conservation of energy and verify it in the case of a freely falling body. A pump is required to lift 600 kg of water per minute from a well 25 m deep. Find the power.',
            marks: 8,
            keyPoints: [
              'Statement: Energy can neither be created nor destroyed, only transformed.',
              'Derivation showing E = mgH at top, middle, and bottom points.',
              'Numerical: Work = mgh = 600 * 9.8 * 25 = 147,000 J. Time = 60 s. Power = Work/time = 2450 W (2.45 kW).',
            ],
          },
        ],
        quiz: [
          {
            question: 'For a freely falling body from height H, at what height above the ground are its kinetic energy and potential energy equal?',
            options: ['H / 4', 'H / 2', 'H / sqrt(2)', '3H / 4'],
            correctIndex: 1,
            explanation: 'At height h = H/2, potential energy U = mg(H/2). By energy conservation, kinetic energy K = mgH - mg(H/2) = mg(H/2). Therefore K = U at h = H/2.',
          },
        ],
      },
    ],
  },

  // ─── RAJASTHAN STATE BOARD (RBSE) ─────────────────────────────────────────
  RJ_BOARD: {
    name: 'Rajasthan Board (RBSE)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'rj-phy-magnetism',
        subject: 'Physics',
        title: 'Magnetism: Classification of Dia, Para, and Ferromagnetic Substances',
        examRelevance: 'RBSE Class 12 Physics 4-Marker Theory Question',
        blindspotCount: 3,
        summary: 'Distinction based on magnetic susceptibility chi, relative permeability mu_r, Curie Law, and behavior in non-uniform magnetic fields.',
        aiBlindspots: [
          {
            point: 'Temperature Dependence: Curie-Weiss Law vs Diamagnetism Independence',
            whatAiSays: 'Generic AI states that ferromagnets attract strongly.',
            whatAiMisses: 'RBSE evaluators deduct 2 marks if temperature relations are not contrasted: (1) Diamagnetism is strictly INDEPENDENT of temperature, (2) Paramagnetism obeys Curie Law chi = C / T, (3) Ferromagnetism obeys Curie-Weiss Law chi = C / (T - T_c) above Curie temperature T_c where it transitions to paramagnetic.',
            examinerRubric: 'RBSE comparison table requires chi values: Dia (small negative -1 <= chi < 0), Para (small positive 0 < chi < epsilon), Ferro (very large positive chi >> 1000).',
          },
        ],
        coreConcepts: [
          'Diamagnetic substances: Feebly repelled by magnets, move from stronger to weaker field (e.g. Bismuth, Copper, Water).',
          'Paramagnetic substances: Feebly attracted by magnets, move from weaker to stronger field (e.g. Aluminum, Sodium, Oxygen at STP).',
          'Ferromagnetic substances: Strongly attracted, form magnetic domains with spontaneous magnetization (e.g. Iron, Cobalt, Nickel).',
        ],
        examQuestions: [
          {
            question: 'Compare the properties of diamagnetic, paramagnetic, and ferromagnetic substances with respect to: (a) Magnetic susceptibility chi, (b) Relative permeability mu_r, (c) Effect of temperature, (d) Behavior in a non-uniform magnetic field.',
            marks: 4,
            keyPoints: [
              'Tabular comparison with exact ranges of chi and mu_r.',
              'Explain alignment of atomic magnetic dipoles.',
              'Curie temperature definition and Curie-Weiss transition equation.',
            ],
          },
        ],
        quiz: [
          {
            question: 'Above the Curie temperature T_c, a ferromagnetic substance behaves as a:',
            options: ['Diamagnetic substance', 'Paramagnetic substance', 'Superconductor', 'Non-magnetic insulator'],
            correctIndex: 1,
            explanation: 'Above Curie temperature, thermal agitation destroys domain alignment, causing ferromagnetic materials to behave as paramagnetic substances according to the Curie-Weiss law.',
          },
        ],
      },
    ],
  },

  // ─── GUJARAT STATE BOARD (GSEB HSC) ───────────────────────────────────────
  GJ_BOARD: {
    name: 'Gujarat Board (GSEB HSC)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'gj-phy-rectifier',
        subject: 'Physics',
        title: 'Semiconductor Electronics: Full Wave Rectifier Operation & Ripple Factor',
        examRelevance: 'GSEB Class 12 Physics Section D 4-Marker',
        blindspotCount: 3,
        summary: 'Center-tapped transformer with two p-n junction diodes, input-output waveforms, and 81.2% maximum theoretical efficiency.',
        aiBlindspots: [
          {
            point: 'Output Ripple Frequency is TWICE the Input AC Frequency (f_out = 2 * f_in)',
            whatAiSays: 'Generic AI states AC is converted to DC.',
            whatAiMisses: 'In GSEB MCQ and theory papers, questions specifically target: (1) Output frequency of full wave rectifier is 2 * 50 Hz = 100 Hz (half wave remains 50 Hz), (2) Maximum rectification efficiency is 81.2% (eta = 0.812 * R_L / (r_f + R_L)), (3) Ripple factor gamma = 0.48.',
            examinerRubric: 'GSEB answer key: 1 mark circuit diagram with center-tapped transformer, 1 mark waveform diagram, 2 marks working during positive and negative half cycles.',
          },
        ],
        coreConcepts: [
          'Positive half cycle: Diode D1 forward biased (conducts), D2 reverse biased (off).',
          'Negative half cycle: Diode D2 forward biased (conducts), D1 reverse biased (off).',
          'Current through load resistor R_L flows in the same direction during both half cycles.',
        ],
        examQuestions: [
          {
            question: 'Draw a circuit diagram of a full wave rectifier using center-tapped transformer and two p-n junction diodes. Explain its working and draw input and output voltage waveforms.',
            marks: 4,
            keyPoints: [
              'Circuit diagram showing AC mains, center-tap transformer, D1, D2, and load R_L.',
              'Explain current paths during positive and negative cycles.',
              'Draw continuous pulsed DC output waveform.',
            ],
          },
        ],
        quiz: [
          {
            question: 'If the input AC frequency to a full-wave rectifier is 60 Hz, the fundamental ripple frequency in the rectified output is:',
            options: ['30 Hz', '60 Hz', '120 Hz', '240 Hz'],
            correctIndex: 2,
            explanation: 'In a full-wave rectifier, both positive and negative half-cycles produce output pulses in the same direction, doubling the frequency: f_ripple = 2 * 60 Hz = 120 Hz.',
          },
        ],
      },
    ],
  },

  // ─── MADHYA PRADESH BOARD (MPBSE HSSC) ───────────────────────────────────
  MP_BOARD: {
    name: 'MP Board (MPBSE HSSC)',
    syllabusYear: '2026-27',
    lastUpdated: '2026-11-24',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    topics: [
      {
        id: 'mp-phy-transformer',
        subject: 'Physics',
        title: 'Alternating Current: Transformer Working Principle & Energy Losses',
        examRelevance: 'MPBSE Class 12 Physics 5-Marker Blueprint Question',
        blindspotCount: 3,
        summary: 'Mutual induction principle, transformation ratio k = N_s/N_p = V_s/V_p = I_p/I_s, and 4 major core energy losses.',
        aiBlindspots: [
          {
            point: 'Exact Methods to Minimize 4 Specific Transformer Losses',
            whatAiSays: 'Generic AI lists heat loss and sound loss.',
            whatAiMisses: 'MP Board blueprint questions require pairing each loss with its exact engineering remedy: (1) Copper loss (I^2*R) minimized by using thick copper wires, (2) Iron/Eddy current loss minimized by laminated core of soft iron insulated with varnish, (3) Hysteresis loss minimized by soft iron core with narrow hysteresis loop, (4) Flux leakage minimized by winding primary and secondary coils over each other.',
            examinerRubric: 'MPBSE allocates 0.5 marks per loss and 0.5 marks per mitigation technique (total 4 marks).',
          },
        ],
        coreConcepts: [
          'Mutual induction: Changing magnetic flux in primary induces an EMF in secondary.',
          'Transformation ratio: k = V_s / V_p = N_s / N_p. Step-up: k > 1 (V_s > V_p, I_s < I_p). Step-down: k < 1.',
          'Ideal transformer assumption: Input power = Output power (V_p * I_p = V_s * I_s).',
        ],
        examQuestions: [
          {
            question: 'Explain the principle, construction, and working of a transformer. Describe the different types of energy losses in a transformer and how they are minimized.',
            marks: 5,
            keyPoints: [
              'Principle: Mutual induction.',
              'Derivation of V_s / V_p = N_s / N_p.',
              'Detailed explanation of Copper, Eddy Current, Hysteresis, and Flux leakage losses with remedies.',
            ],
          },
        ],
        quiz: [
          {
            question: 'The core of a transformer is laminated to minimize energy loss caused by:',
            options: ['Hysteresis loss', 'Eddy currents', 'Copper resistance', 'Flux leakage'],
            correctIndex: 1,
            explanation: 'Laminating the soft iron core breaks up large continuous conductive loops, drastically reducing circulating eddy currents and associated I^2*R heating.',
          },
        ],
      },
    ],
  },
`;

const insertIndex = content.indexOf('\n};\n\n// ───');
if (insertIndex !== -1) {
  content = content.slice(0, insertIndex) + remainingBoards + content.slice(insertIndex);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('Successfully inserted all remaining state board knowledgebases!');
} else {
  console.error('Could not find insertIndex!');
  process.exit(1);
}
