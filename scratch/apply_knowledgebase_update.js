const fs = require('fs');
const path = require('path');

const targetPath = 'C:\\Users\\aasim\\.gemini\\antigravity\\scratch\\StudyQuest\\frontend\\src\\config\\studyGuideData.js';
let content = fs.readFileSync(targetPath, 'utf8');

// The new board entries for EXAM_KNOWLEDGEBASE
const newBoards = `
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
`;

// Insert new boards into EXAM_KNOWLEDGEBASE before '};'
const markerRegex = /\r?\n\};\r?\n\r?\n\/\/ ─+/;
const match = markerRegex.exec(content);
if (match) {
  const insertPos = match.index;
  content = content.slice(0, insertPos) + newBoards + content.slice(insertPos);
  console.log('Successfully inserted new board knowledgebases!');
} else {
  console.error('Could not find EXAM_KNOWLEDGEBASE closing boundary with regex!');
  process.exit(1);
}

// Update normalizeExamKey
const oldNormalizer = `export function normalizeExamKey(examTarget = '') {
  const str = (examTarget || '').toUpperCase();
  if (str.includes('JEE')) return 'JEE';
  if (str.includes('NEET')) return 'NEET';
  if (str.includes('GATE')) return 'GATE';
  if (str.includes('UPSC')) return 'UPSC';
  if (str.includes('10') || str.includes('CLASS 10')) return 'CBSE_10';
  if (str.includes('COLLEGE') || str.includes('SEM') || str.includes('B.TECH') || str.includes('BCA')) return 'COLLEGE_SEM';
  if (str.includes('12') || str.includes('BOARD') || str.includes('CBSE')) return 'CBSE_12';
  return 'CBSE_12'; // Default reliable fallback
}`;

const newNormalizer = `export function normalizeExamKey(examTarget = '') {
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
}`;

if (content.includes(oldNormalizer)) {
  content = content.replace(oldNormalizer, newNormalizer);
  console.log('Successfully updated normalizeExamKey!');
} else {
  console.error('Could not find exact oldNormalizer string to replace!');
  process.exit(1);
}

// Add state board plans to getCuratedPlanForExam
const oldPlanCondition = `  } else {
    // Default: CBSE Class 12 Boards / General Board Plan`;

const newPlanCondition = `  } else if (key === 'ICSE_10') {
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
    // Default: CBSE Class 12 Boards / General Board Plan`;

if (content.includes(oldPlanCondition)) {
  content = content.replace(oldPlanCondition, newPlanCondition);
  console.log('Successfully updated getCuratedPlanForExam with state board plans!');
} else {
  console.error('Could not find oldPlanCondition to replace!');
  process.exit(1);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Finished updating studyGuideData.js successfully!');
