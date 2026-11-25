/**
 * Verified Stream-Specific Topic Bank (Commerce, Humanities, Computer Science, Applied Sciences & State Boards)
 * Uses clean Unicode math notation for crisp native mobile rendering.
 */

export const STREAM_SHARED_TOPICS = {
  Accountancy: [
    {
      id: 'acc-partnership-goodwill',
      subject: 'Accountancy',
      title: 'Partnership Admission: Hidden Goodwill & Pro-Rata Capital Adjustment',
      examRelevance: 'Class 12 Boards 6-Marker Compulsory (Part A)',
      blindspotCount: 3,
      summary: 'Revaluation surplus treatment, Sacrificing Ratio deduction, Hidden Goodwill computation from new partner capital, and Workmen Compensation Reserve.',
      aiBlindspots: [
        {
          point: 'Hidden Goodwill Formula Uses Total Implied Capital Minus Combined Actual Capital',
          whatAiSays: 'Generic AI applies Average Profit or Super Profit formula when goodwill is not explicitly given.',
          whatAiMisses: 'In Hidden Goodwill questions, if incoming partner C brings ₹2,50,000 for 1/5th share, Total Implied Capital = ₹2,50,000 × 5 = ₹12,50,000. You MUST subtract ALL partners adjusted capitals (A + B after Revaluation + Reserves + C capital) to find firm goodwill, then multiply by C share.',
          examinerRubric: 'Examiners award 2 marks for Goodwill valuation working note, 2 marks for Revaluation A/c, and 2 marks for Partner Capital A/c balances & Cash adjustment.',
        },
        {
          point: 'Sacrificing Ratio vs Old Ratio for Existing Goodwill Write-Off',
          whatAiSays: 'Generic AI distributes both existing Balance Sheet goodwill and premium for goodwill in sacrificing ratio.',
          whatAiMisses: 'Per AS-26, Goodwill already appearing in the Balance Sheet MUST be written off among OLD partners in their OLD profit-sharing ratio (not sacrificing ratio!). Only incoming partner Premium for Goodwill is credited in Sacrificing Ratio.',
          examinerRubric: 'Distinguishing Old Ratio (write-off) vs Sacrificing Ratio (premium distribution) carries a 1.5 mark journal penalty if swapped.',
        },
      ],
      coreConcepts: [
        'Sacrificing Ratio = Old Share − New Share (used for distributing incoming Premium for Goodwill).',
        'AS-26 Compliance: Existing purchased goodwill in Balance Sheet is debited to Old Partners Capital A/c in Old Ratio.',
        'Workmen Compensation Reserve: Excess reserve above claim liability is distributed in Old Ratio; deficit is debited to Revaluation A/c.',
      ],
      examQuestions: [
        {
          question: 'A and B share profits 3:2 with capitals ₹3,00,000 and ₹2,00,000. General Reserve is ₹50,000. C is admitted for 1/4th share bringing ₹2,50,000 as capital. Pass the journal entry for Hidden Goodwill.',
          marks: 4,
          keyPoints: [
            'Total Implied Capital of Firm based on C share = ₹2,50,000 × (4/1) = ₹10,00,000.',
            'Combined Adjusted Capital = ₹3,00,000 + ₹2,00,000 + ₹50,000 (Gen Res) + ₹2,50,000 (C) = ₹8,00,000.',
            'Firm Hidden Goodwill = ₹10,00,000 − ₹8,00,000 = ₹2,00,000.',
            'C share of Goodwill = ₹2,00,000 × 1/4 = ₹50,000 (debited to C Current A/c, credited to A & B in Sacrificing Ratio 3:2 -> ₹30,000 & ₹20,000).',
          ],
        },
      ],
      quiz: [
        {
          question: 'When a new partner cannot bring their share of goodwill in cash, which account is debited under CBSE/ISC AS-26 rules?',
          options: [
            'Cash / Bank Account',
            'Goodwill Account (Asset)',
            'Incoming Partner Current Account',
            'Revaluation Account',
          ],
          correctIndex: 2,
          explanation: 'Under AS-26, Goodwill account is not raised in books; instead, Incoming Partner Current A/c is debited so their fixed/fluctuating capital remains intact.',
        },
      ],
    },
    {
      id: 'acc-shares-forfeiture',
      subject: 'Accountancy',
      title: 'Issue of Shares: Pro-Rata Allotment, Forfeiture & Capital Reserve Transfer',
      examRelevance: 'Class 12 Boards 6-Marker Compulsory (Company Accounts)',
      blindspotCount: 2,
      summary: 'Securities Premium debit condition on forfeiture, pro-rata excess application adjustment, and proportional Capital Reserve formula.',
      aiBlindspots: [
        {
          point: 'Securities Premium Is Debited on Forfeiture ONLY When Unpaid',
          whatAiSays: 'Generic AI debits Securities Premium Reserve whenever forfeited shares were originally issued at a premium.',
          whatAiMisses: 'Under Section 52 of Companies Act 2013, if the shareholder ALREADY paid the Securities Premium (e.g., paid with Application/Allotment, defaulted only on First Call), Securities Premium CANNOT be reversed/debited on forfeiture! Debit it ONLY for the unpaid premium amount.',
          examinerRubric: 'Examiners deduct 1–2 marks if Securities Premium is wrongly debited when allotment money (including premium) has already been received.',
        },
      ],
      coreConcepts: [
        'Pro-Rata Capital Reserve: Capital Reserve = (Total Forfeited Amount on Reissued Shares) − (Discount allowed on Reissue).',
        'Proportionate Rule: If 600 shares are forfeited and only 400 are reissued, calculate Forfeited Credit strictly for 400 shares first.',
        'Calls-in-Arrears with Pro-Rata: Excess application money is first adjusted toward Allotment capital, then Allotment premium.',
      ],
      examQuestions: [
        {
          question: 'X Ltd forfeited 500 shares of ₹10 each issued at ₹2 premium (payable on Allotment) for non-payment of First & Final call of ₹3. Allotment ₹5 (incl. ₹2 premium) was received. 300 shares were reissued at ₹8 fully paid. Find Capital Reserve.',
          marks: 4,
          keyPoints: [
            'Since Allotment (incl. ₹2 premium) was already received, do NOT debit Securities Premium Reserve on forfeiture.',
            'Share Capital A/c Dr ₹5,000; To Share Forfeiture A/c ₹3,500 (₹7/share received on capital); To Calls-in-Arrears ₹1,500.',
            'For 300 reissued shares: Pro-rata forfeited balance = (3,500 / 500) × 300 = ₹2,100.',
            'Reissue discount on 300 shares = 300 × ₹2 = ₹600. Capital Reserve = ₹2,100 − ₹600 = ₹1,500.',
          ],
        },
      ],
      quiz: [
        {
          question: 'If 800 shares of ₹10 each (₹8 called up) are forfeited after receiving ₹5 per share, what amount is credited to Share Forfeiture A/c?',
          options: ['₹8,000', '₹6,400', '₹4,000', '₹2,400'],
          correctIndex: 2,
          explanation: 'Share Forfeiture Account is credited strictly with the amount actually received towards share capital (800 × ₹5 = ₹4,000).',
        },
      ],
    },
  ],

  Economics: [
    {
      id: 'econ-macro-multiplier',
      subject: 'Economics',
      title: 'Income Determination: Keynesian Multiplier k = 1/(1 − MPC) & Excess Demand',
      examRelevance: 'Macroeconomics 6-Marker Numerical & Diagram Guaranteed',
      blindspotCount: 2,
      summary: 'Ex-ante Savings = Investment equilibrium, working mechanism of Investment Multiplier across rounds, and RBI monetary vs fiscal deflationary tools.',
      aiBlindspots: [
        {
          point: 'Round-by-Round Consumption Generation Proof Required in Long Answers',
          whatAiSays: 'Generic AI states k = 1/MPS and stops after calculating final ∆Y.',
          whatAiMisses: 'Board rubrics for 4–6 mark Multiplier questions demand showing at least 3 rounds in a structured table (Round 1: ∆I = ₹100 Cr -> ∆Y = ₹100 Cr -> ∆C = MPC × 100 -> ∆S = MPS × 100) AND explicitly explaining "one person expenditure is another person income".',
          examinerRubric: '1 mark for formula k = ∆Y/∆I = 1/(1−MPC), 3 marks for 3-round tabular schedule, 2 marks for final convergence sum.',
        },
      ],
      coreConcepts: [
        'Equilibrium Condition: AD = AS  ⇔  Ex-ante Saving (S) = Ex-ante Investment (I).',
        'Multiplier Range: Since 0 ≤ MPC ≤ 1, Multiplier k ranges from 1 (when MPC=0) to ∞ (when MPC=1).',
        'Deficient Demand Fix: Decrease Repo Rate / Bank Rate / CRR / SLR & Buy Government Securities via OMO (increases credit creation).',
      ],
      examQuestions: [
        {
          question: 'In an economy, equilibrium income is ₹2,000 Cr while Full Employment income is ₹2,500 Cr. If MPC = 0.8, calculate the required additional Investment expenditure to bridge this Deflationary Gap.',
          marks: 4,
          keyPoints: [
            'Required increase in National Income ∆Y = ₹2,500 − ₹2,000 = ₹500 Crore.',
            'Investment Multiplier k = 1 / (1 − MPC) = 1 / (1 − 0.8) = 1 / 0.2 = 5.',
            'Since k = ∆Y / ∆I => 5 = 500 / ∆I.',
            'Required additional Investment ∆I = 500 / 5 = ₹100 Crore.',
          ],
        },
      ],
      quiz: [
        {
          question: 'If the Marginal Propensity to Save (MPS) increases from 0.2 to 0.25, what happens to the value of the Investment Multiplier?',
          options: [
            'Increases from 4 to 5',
            'Decreases from 5 to 4',
            'Remains constant at 5',
            'Decreases from 2 to 1.25',
          ],
          correctIndex: 1,
          explanation: 'k = 1 / MPS. When MPS = 0.2, k = 5. When MPS rises to 0.25, k falls to 1 / 0.25 = 4 because households save more and spend less per round.',
        },
      ],
    },
    {
      id: 'econ-national-income-doublecount',
      subject: 'Economics',
      title: 'National Income Accounting: Operating Surplus, Factor Cost vs Market Price',
      examRelevance: 'Macroeconomics 6-Marker Numerical Guaranteed',
      blindspotCount: 2,
      summary: 'Converting GDP_MP to NNP_FC (National Income), Mixed Income of Self-Employed, and Double Counting avoidance.',
      aiBlindspots: [
        {
          point: 'Do NOT Add Profit Separately When Operating Surplus Is Already Given',
          whatAiSays: 'Generic AI sums every income component blindly without noticing sub-components.',
          whatAiMisses: 'Operating Surplus ALREADY equals Rent + Royalty + Interest + Profit (where Profit = Dividend + Corporate Tax + Undistributed Profit). Students/AI frequently double-add Dividend or Corporate Tax alongside Profit or Operating Surplus, ruining the 6-mark numerical!',
          examinerRubric: 'Income Method: NDP_FC = Compensation of Employees + Operating Surplus + Mixed Income (1.5M), Depreciation & NFIA signs (3M), Final answer in ₹ Crore (1.5M).',
        },
      ],
      coreConcepts: [
        'Market Price to Factor Cost: FC = MP − Net Indirect Taxes (NIT = Indirect Taxes − Subsidies).',
        'Gross to Net: Net = Gross − Depreciation (Consumption of Fixed Capital).',
        'Domestic to National: National = Domestic + NFIA (Factor Income from Abroad − Factor Income to Abroad).',
      ],
      examQuestions: [
        {
          question: 'Explain why "Intermediate Goods" and "Transfer Incomes" are excluded from National Income (NNP_FC), giving one example of each.',
          marks: 4,
          keyPoints: [
            'Intermediate Goods (e.g., flour bought by a bakery) are excluded to avoid Double Counting because their value is already embedded in the final bread price.',
            'Transfer Incomes (e.g., old-age pension, scholarship) are unilateral payments with zero corresponding flow of goods or factor services in the current period.',
          ],
        },
      ],
      quiz: [
        {
          question: 'Which adjustment converts Net Domestic Product at Market Price (NDP_MP) into Net National Product at Factor Cost (NNP_FC)?',
          options: [
            'Add Depreciation and subtract NFIA',
            'Add NFIA and subtract Net Indirect Taxes (NIT)',
            'Subtract NFIA and add Net Indirect Taxes (NIT)',
            'Subtract Depreciation and add Subsidies only',
          ],
          correctIndex: 1,
          explanation: 'To go from Domestic -> National add NFIA; to go from Market Price -> Factor Cost subtract Net Indirect Taxes (Indirect Taxes - Subsidies).',
        },
      ],
    },
  ],

  'Business Studies': [
    {
      id: 'bst-trading-on-equity',
      subject: 'Business Studies',
      title: 'Financial Management: Trading on Equity Numerical Proof (EPS Maximisation)',
      examRelevance: 'Class 12 Commerce 6-Marker Numerical Case Study',
      blindspotCount: 2,
      summary: 'Comparing Equity-only vs Debt+Equity capital structures across EBIT, EBT, Tax, and Earnings Per Share (EPS) when ROI > Cost of Debt.',
      aiBlindspots: [
        {
          point: 'Unfavorable Financial Leverage Occurs When ROI < Interest Rate on Debt',
          whatAiSays: 'Generic AI claims issuing debt always increases Earnings Per Share (EPS) due to tax shield.',
          whatAiMisses: 'Trading on Equity ONLY increases EPS when Return on Investment (ROI = EBIT / Total Capital × 100) is STRICTLY GREATER than the Cost of Debt (r_d). If ROI < r_d, debt causes EPS to DROP sharply (Unfavorable Financial Leverage)!',
          examinerRubric: 'Full 6 marks require computing the full EBIT->Interest->EBT->Tax->EAT->EPS comparative table for both Situations and stating the ROI > Cost of Debt test.',
        },
      ],
      coreConcepts: [
        'EPS Formula: EPS = (EBIT − Interest)(1 − Tax Rate) / Number of Equity Shares.',
        'ROI Formula: ROI = (EBIT / Total Capital Employed) × 100.',
        'Decision Rule: Favorable Leverage iff ROI > Rate of Interest on Debt.',
      ],
      examQuestions: [
        {
          question: 'A firm needs ₹40 Lakhs and faces tax rate 30%. Option A: 4,00,000 Equity shares of ₹10. Option B: 2,00,000 Equity shares of ₹10 + ₹20 Lakhs 10% Debt. If EBIT = ₹6 Lakhs, prove which option maximizes EPS.',
          marks: 6,
          keyPoints: [
            'Calculate ROI = (6,00,000 / 40,00,000) × 100 = 15%, which is GREATER than 10% Interest rate (Favorable Leverage).',
            'Option A: Interest = 0 => EBT = 6L => Tax (30%) = 1.8L => EAT = 4.2L => EPS = 4.2L / 4L = ₹1.05.',
            'Option B: Interest = 2L => EBT = 4L => Tax (30%) = 1.2L => EAT = 2.8L => EPS = 2.8L / 2L = ₹1.40.',
            'Conclusion: Option B yields higher EPS (₹1.40 > ₹1.05) due to Trading on Equity.',
          ],
        },
      ],
      quiz: [
        {
          question: 'When does Trading on Equity become unfavorable for equity shareholders?',
          options: [
            'When Corporate Tax Rate increases',
            'When Rate of Interest on Debt exceeds Return on Investment (ROI)',
            'When Return on Investment (ROI) exceeds Rate of Interest on Debt',
            'When Equity share face value is ₹10',
          ],
          correctIndex: 1,
          explanation: 'If the firm earns less ROI (say 8%) than the interest cost it must pay on borrowed debt (say 12%), debt drags down EPS for equity holders.',
        },
      ],
    },
  ],

  History: [
    {
      id: 'hist-revolt-1857',
      subject: 'History',
      title: '1857 Revolt: Awadh Annexation, Taluqdars & Rebel Proclamations (Azamgarh)',
      examRelevance: 'Boards & UPSC High-Yield 8-Marker Source Question',
      blindspotCount: 2,
      summary: 'Subsidiary Alliance + 1856 Awadh Summary Settlement, sepoy-peasant linkage ("uniformed peasant"), and 1857 Hindu-Muslim unity proclamations.',
      aiBlindspots: [
        {
          point: 'Visualizing Sepoys as "Peasants in Uniform" Connecting Village & Cantonment',
          whatAiSays: 'Generic AI limits 1857 causes solely to the greased Enfield rifle cartridges.',
          whatAiMisses: 'Awadh contributed a majority of Bengal Army sepoys. After Dalhousie annexed Awadh (1856) and dispossessed Taluqdars via the Summary Settlement (displacing 67% -> 38% holdings), peasant anger immediately flowed back into the sepoy barracks.',
          examinerRubric: 'Full 8 marks require linking: (1) Annexation of Awadh on pretext of misgovernance, (2) Disempowerment of Taluqdars, (3) Azamgarh Proclamation appeal to zamindars, merchants & sepoys.',
        },
      ],
      coreConcepts: [
        'Summary Settlement (1856): Bypassed Taluqdars to settle revenue directly with cultivators, yet over-assessed revenue.',
        'Dalhousie Doctrine of Lapse (1848–1856): Annexed Satara, Jhansi, Nagpur when rulers lacked natural male heirs.',
        'Azamgarh Proclamation (Aug 1857): Emphasized restoration of traditional rights across communities under Badshahi rule.',
      ],
      examQuestions: [
        {
          question: 'Why was the annexation of Awadh described as taking away "the life of the body"? Explain the impact of the 1856 Summary Settlement on Taluqdars and peasants.',
          marks: 8,
          keyPoints: [
            'Nawab Wajid Ali Shah dethroned and exiled to Calcutta in 1856 on grounds of misgovernance despite deep popular loyalty.',
            'Chain of grievance linked prince, taluqdar, peasant, and sepoy.',
            'Summary Settlement stripped Taluqdars of forts and troops while peasants faced rigid, non-flexible British revenue collection.',
          ],
        },
      ],
      quiz: [
        {
          question: 'Which statement accurately describes the British 1856 Summary Settlement in Awadh?',
          options: [
            'It doubled the land holdings and military powers of Taluqdars',
            'It removed Taluqdars as middlemen and over-assessed peasants directly',
            'It abolished all land taxes in rural Awadh for five years',
            'It gave Awadh autonomy under the Mughal Emperor',
          ],
          correctIndex: 1,
          explanation: 'The 1856 Summary Settlement bypassed Taluqdars, stripping their forts and reducing village control from 67% to 38%, while overburdening peasants with rigid revenue.',
        },
      ],
    },
  ],

  'Political Science': [
    {
      id: 'polsci-emergency-1975',
      subject: 'Political Science',
      title: '1975 National Emergency (Art 352) & 44th Constitutional Amendment Safeguards',
      examRelevance: 'Boards & UPSC High-Yield 6-Marker Guaranteed',
      blindspotCount: 2,
      summary: 'Shah Commission findings, misuse of "Internal Disturbance", Preventive Detention, and 44th Amendment (1978) structural checks.',
      aiBlindspots: [
        {
          point: '44th Amendment Replaced "Internal Disturbance" with "Armed Rebellion" + Written Cabinet Rule',
          whatAiSays: 'Generic AI mentions Emergency ended in 1977 without detailing constitutional fixes.',
          whatAiMisses: 'Evaluators specifically award marks for ALL THREE 44th Amendment (1978) reforms: (1) Replaced ambiguous "internal disturbance" with "armed rebellion", (2) Required WRITTEN recommendation from the Union Cabinet to the President (not PM alone), (3) Made Art 20 & Art 21 non-suspendable even during National Emergency.',
          examinerRubric: '2 marks each for: Reason replacement ("armed rebellion"), Written Cabinet approval rule, and Non-suspendability of Articles 20 & 21.',
        },
      ],
      coreConcepts: [
        'Proclamation Date: 25 June 1975 under Article 352; lasted 21 months until March 1977.',
        'Shah Commission (1977): Appointed by Janata Government; documented censorship, MISA detentions, and extrajudicial excesses.',
        '44th Amendment Act 1978: Parliamentary approval needed within 1 month by Special Majority; Art 20 & 21 protected.',
      ],
      examQuestions: [
        {
          question: 'Analyze three structural lessons learnt from the 1975 Emergency and explain how the 44th Constitutional Amendment (1978) prevented future misuse.',
          marks: 6,
          keyPoints: [
            'Word "Internal Disturbance" narrowed strictly to "Armed Rebellion".',
            'President can proclaim Emergency ONLY on written advice of the Union Cabinet.',
            'Fundamental Rights under Article 20 (Conviction protection) and Article 21 (Right to Life) cannot be suspended during Emergency.',
          ],
        },
      ],
      quiz: [
        {
          question: 'Which constitutional safeguard was introduced by the 44th Amendment Act (1978) regarding National Emergency under Article 352?',
          options: [
            'Prime Minister can declare Emergency verbally via phone call',
            'Articles 20 and 21 can never be suspended during an Emergency',
            'State Governors hold veto power over Parliament ratification',
            '"Internal Disturbance" remained unchanged as a valid ground',
          ],
          correctIndex: 1,
          explanation: 'The 44th Amendment protected Articles 20 and 21 from suspension even during National Emergency and replaced "internal disturbance" with "armed rebellion".',
        },
      ],
    },
  ],

  Geography: [
    {
      id: 'geo-dtm-population',
      subject: 'Geography',
      title: 'Demographic Transition Theory & India Occupational Structure',
      examRelevance: 'Human Geography 5-Marker Diagram Question',
      blindspotCount: 2,
      summary: 'Three stages of Demographic Transition (High Fluctuating -> Expanding -> Low Stationary), CBR vs CDR curves, and workforce shift.',
      aiBlindspots: [
        {
          point: 'Stage 2 Sub-Division: Early Expanding vs Late Expanding',
          whatAiSays: 'Generic AI merges all developing countries into a single "growing population" block.',
          whatAiMisses: 'NCERT Human Geography emphasizes how Stage II begins with Crude Birth Rate (CBR) remaining high while Crude Death Rate (CDR) drops rapidly due to sanitation & healthcare (causing maximum natural population explosion gap), before birth rates begin declining in the later phase.',
          examinerRubric: '2 marks for drawing labeled Birth/Death Curve vs Time diagram across Stages I, II, III; 3 marks for identifying stage characteristics with country examples.',
        },
      ],
      coreConcepts: [
        'Stage I (High Fluctuating): High fertility + high mortality; slow net growth; pre-industrial agrarian societies.',
        'Stage II (Expanding): Steep decline in CDR first due to medical sanitation; fertility declines slowly -> high net natural growth.',
        'Stage III (Low Fluctuating): Both fertility and mortality are low; population stabilizes or grows slowly (e.g., Canada, Japan).',
      ],
      examQuestions: [
        {
          question: 'Describe the three stages of the Demographic Transition Theory with the help of a neat labeled diagram of Birth Rate vs Death Rate.',
          marks: 5,
          keyPoints: [
            'Stage 1: High CBR & High CDR (~35 per 1000) -> Low net increase.',
            'Stage 2: High CBR, falling CDR -> High population explosion gap.',
            'Stage 3: Low CBR & Low CDR -> Stable/zero growth with aging population pyramid.',
          ],
        },
      ],
      quiz: [
        {
          question: 'During which transition phase does the gap between Birth Rate and Death Rate reach its widest maximum?',
          options: [
            'Stage I (High Stationary)',
            'Stage II (Early Expanding)',
            'Stage III (Low Stationary)',
            'Post-Industrial Decline',
          ],
          correctIndex: 1,
          explanation: 'In Stage II, Death Rates drop sharply due to sanitation and medicine while Birth Rates stay high culturally, producing the maximum gap (rapid population growth).',
        },
      ],
    },
  ],

  'Computer Science': [
    {
      id: 'cs12-sql-groupby-having',
      subject: 'Computer Science',
      title: 'SQL Aggregate Queries: WHERE vs HAVING & Python Binary File (pickle) EOFError',
      examRelevance: 'Class 12 CS 083 Board Section C/D 8-Marker Guaranteed',
      blindspotCount: 2,
      summary: 'Aggregate filtering rules (WHERE pre-grouping vs HAVING post-grouping), NULL exclusion in COUNT(col) vs COUNT(*), and pickle EOF loop handling.',
      aiBlindspots: [
        {
          point: 'COUNT(*) Counts NULL Rows While COUNT(column) Ignores NULLs',
          whatAiSays: 'Generic AI claims COUNT(*) and COUNT(col) always return identical integers.',
          whatAiMisses: 'In SQL output questions (4 marks in CBSE CS 083), COUNT(*) counts ALL rows in a table including NULLs, whereas COUNT(Salary) skips every row where Salary is NULL. Also aggregate functions like AVG() or SUM() CANNOT appear inside a WHERE clause—only in HAVING!',
          examinerRubric: '1 mark per SQL output line; placing aggregate inside WHERE scores 0 marks for that query.',
        },
      ],
      coreConcepts: [
        'WHERE filters individual rows BEFORE GROUP BY; HAVING filters grouped rows AFTER GROUP BY.',
        'Python pickle module: Always wrap sequential pickle.load(f) reads inside "while True: try: ... except EOFError: break".',
        'Stack Overflow/Underflow: Pop function must check "if len(stack) == 0: print(\'Underflow\')" before calling stack.pop().',
      ],
      examQuestions: [
        {
          question: 'Differentiate between WHERE and HAVING clauses in SQL. Given a table EMPLOYEE(Dept, Salary) with 1 NULL Salary in IT, compare COUNT(*) and COUNT(Salary) for Dept="IT".',
          marks: 4,
          keyPoints: [
            'WHERE filters rows before grouping and cannot contain aggregate functions.',
            'HAVING filters aggregated groups after GROUP BY and works with SUM/COUNT/AVG/MAX/MIN.',
            'COUNT(*) includes the row with NULL Salary; COUNT(Salary) ignores NULL values and returns 1 less.',
          ],
        },
      ],
      quiz: [
        {
          question: 'Which exception must be caught when reading all serialized records from a Python binary file using pickle.load() in a loop?',
          options: ['IndexError', 'EOFError', 'KeyError', 'ValueError'],
          correctIndex: 1,
          explanation: 'When pickle.load() reaches the end of a binary file, Python raises EOFError, which cleanly terminates the try/except read loop.',
        },
      ],
    },
  ],
};
