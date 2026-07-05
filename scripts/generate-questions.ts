import * as fs from "fs";
import * as path from "path";

type DomainId = "medications" | "federal" | "patient_safety" | "order_entry";

interface Question {
  id: string;
  domain: DomainId;
  subArea: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  isCalculation: boolean;
}

interface DomainTarget {
  domain: DomainId;
  count: number;
  subAreas: string[];
}

const TARGETS: DomainTarget[] = [
  {
    domain: "medications",
    count: 368,
    subAreas: ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"],
  },
  {
    domain: "federal",
    count: 197,
    subAreas: ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"],
  },
  {
    domain: "patient_safety",
    count: 249,
    subAreas: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"],
  },
  {
    domain: "order_entry",
    count: 236,
    subAreas: ["4.1", "4.2", "4.3", "4.4"],
  },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestion(
  partial: Omit<Question, "options" | "correctIndex"> & {
    correct: string;
    distractors: string[];
  }
): Question {
  const options = shuffle(
    Array.from(new Set([partial.correct, ...partial.distractors])).slice(0, 4)
  );
  while (options.length < 4) options.push(`Option ${options.length + 1}`);
  const correctIndex = options.indexOf(partial.correct) as 0 | 1 | 2 | 3;
  return {
    id: partial.id,
    domain: partial.domain,
    subArea: partial.subArea,
    question: partial.question,
    options: [options[0], options[1], options[2], options[3]],
    correctIndex,
    explanation: partial.explanation,
    isCalculation: partial.isCalculation,
  };
}

const drugs = [
  { generic: "lisinopril", brand: "Prinivil", class: "ACE inhibitor", indication: "hypertension", side: "dry cough", storage: "room temperature" },
  { generic: "metformin", brand: "Glucophage", class: "biguanide", indication: "type 2 diabetes", side: "GI upset", storage: "room temperature" },
  { generic: "atorvastatin", brand: "Lipitor", class: "statin", indication: "hyperlipidemia", side: "myalgia", storage: "room temperature" },
  { generic: "levothyroxine", brand: "Synthroid", class: "thyroid hormone", indication: "hypothyroidism", side: "palpitations if overdosed", storage: "room temperature" },
  { generic: "amlodipine", brand: "Norvasc", class: "calcium channel blocker", indication: "hypertension", side: "peripheral edema", storage: "room temperature" },
  { generic: "omeprazole", brand: "Prilosec", class: "proton pump inhibitor", indication: "GERD", side: "headache", storage: "room temperature" },
  { generic: "sertraline", brand: "Zoloft", class: "SSRI", indication: "depression", side: "sexual dysfunction", storage: "room temperature" },
  { generic: "warfarin", brand: "Coumadin", class: "anticoagulant", indication: "atrial fibrillation", side: "bleeding", storage: "room temperature" },
  { generic: "furosemide", brand: "Lasix", class: "loop diuretic", indication: "edema", side: "hypokalemia", storage: "room temperature" },
  { generic: "metoprolol", brand: "Lopressor", class: "beta blocker", indication: "hypertension", side: "bradycardia", storage: "room temperature" },
  { generic: "gabapentin", brand: "Neurontin", class: "anticonvulsant", indication: "neuropathic pain", side: "sedation", storage: "room temperature" },
  { generic: "hydrochlorothiazide", brand: "Microzide", class: "thiazide diuretic", indication: "hypertension", side: "hypokalemia", storage: "room temperature" },
  { generic: "escitalopram", brand: "Lexapro", class: "SSRI", indication: "anxiety", side: "nausea", storage: "room temperature" },
  { generic: "pantoprazole", brand: "Protonix", class: "proton pump inhibitor", indication: "GERD", side: "headache", storage: "room temperature" },
  { generic: "rosuvastatin", brand: "Crestor", class: "statin", indication: "hyperlipidemia", side: "myalgia", storage: "room temperature" },
  { generic: "duloxetine", brand: "Cymbalta", class: "SNRI", indication: "depression", side: "nausea", storage: "room temperature" },
  { generic: "tamsulosin", brand: "Flomax", class: "alpha blocker", indication: "BPH", side: "dizziness", storage: "room temperature" },
  { generic: "montelukast", brand: "Singulair", class: "leukotriene receptor antagonist", indication: "asthma", side: "headache", storage: "room temperature" },
  { generic: "albuterol", brand: "ProAir", class: "short-acting beta agonist", indication: "bronchospasm", side: "tremor", storage: "room temperature" },
  { generic: "insulin glargine", brand: "Lantus", class: "long-acting insulin", indication: "diabetes", side: "hypoglycemia", storage: "refrigerate unopened; room temp in use" },
  { generic: "clopidogrel", brand: "Plavix", class: "antiplatelet", indication: "CAD prevention", side: "bleeding", storage: "room temperature" },
  { generic: "prednisone", brand: "Deltasone", class: "corticosteroid", indication: "inflammation", side: "hyperglycemia", storage: "room temperature" },
  { generic: "ciprofloxacin", brand: "Cipro", class: "fluoroquinolone", indication: "UTI", side: "tendon rupture risk", storage: "room temperature" },
  { generic: "azithromycin", brand: "Zithromax", class: "macrolide", indication: "respiratory infection", side: "GI upset", storage: "room temperature" },
  { generic: "amoxicillin", brand: "Amoxil", class: "penicillin", indication: "bacterial infection", side: "rash", storage: "refrigerate suspension" },
  { generic: "losartan", brand: "Cozaar", class: "ARB", indication: "hypertension", side: "hyperkalemia", storage: "room temperature" },
  { generic: "carvedilol", brand: "Coreg", class: "beta blocker", indication: "heart failure", side: "dizziness", storage: "room temperature" },
  { generic: "spironolactone", brand: "Aldactone", class: "potassium-sparing diuretic", indication: "heart failure", side: "hyperkalemia", storage: "room temperature" },
  { generic: "tramadol", brand: "Ultram", class: "opioid analgesic", indication: "moderate pain", side: "constipation", storage: "room temperature" },
  { generic: "oxycodone", brand: "OxyContin", class: "Schedule II opioid", indication: "severe pain", side: "respiratory depression", storage: "secure storage" },
  { generic: "lorazepam", brand: "Ativan", class: "benzodiazepine", indication: "anxiety", side: "sedation", storage: "room temperature" },
  { generic: "zolpidem", brand: "Ambien", class: "sedative-hypnotic", indication: "insomnia", side: "complex sleep behaviors", storage: "room temperature" },
  { generic: "cyclobenzaprine", brand: "Flexeril", class: "muscle relaxant", indication: "muscle spasm", side: "sedation", storage: "room temperature" },
  { generic: "methylphenidate", brand: "Ritalin", class: "Schedule II stimulant", indication: "ADHD", side: "insomnia", storage: "secure storage" },
  { generic: "sumatriptan", brand: "Imitrex", class: "triptan", indication: "migraine", side: "chest tightness", storage: "room temperature" },
  { generic: "levetiracetam", brand: "Keppra", class: "anticonvulsant", indication: "seizures", side: "irritability", storage: "room temperature" },
  { generic: "allopurinol", brand: "Zyloprim", class: "xanthine oxidase inhibitor", indication: "gout", side: "rash", storage: "room temperature" },
  { generic: "colchicine", brand: "Colcrys", class: "anti-gout", indication: "gout flare", side: "GI upset", storage: "room temperature" },
  { generic: "methotrexate", brand: "Trexall", class: "DMARD", indication: "rheumatoid arthritis", side: "hepatotoxicity", storage: "room temperature" },
  { generic: "etanercept", brand: "Enbrel", class: "TNF inhibitor", indication: "rheumatoid arthritis", side: "infection risk", storage: "refrigerate" },
];

const scheduleDrugs = [
  { drug: "Oxycodone", schedule: "Schedule II" },
  { drug: "Codeine combination (≤90 mg)", schedule: "Schedule III" },
  { drug: "Benzodiazepines", schedule: "Schedule IV" },
  { drug: "Pregabalin (some states)", schedule: "Schedule V" },
  { drug: "Heroin", schedule: "Schedule I" },
];

const sigCodes = [
  { code: "b.i.d.", meaning: "twice daily" },
  { code: "t.i.d.", meaning: "three times daily" },
  { code: "q.i.d.", meaning: "four times daily" },
  { code: "q.d.", meaning: "every day" },
  { code: "q.h.s.", meaning: "at bedtime" },
  { code: "p.r.n.", meaning: "as needed" },
  { code: "a.c.", meaning: "before meals" },
  { code: "p.c.", meaning: "after meals" },
  { code: "q.o.d.", meaning: "every other day" },
  { code: "s.l.", meaning: "sublingual" },
];

const lasaPairs = [
  ["hydroxyzine", "hydralazine"],
  ["clonidine", "clonazepam"],
  ["prednisone", "prednisolone"],
  ["Dulcolax", "Bisacodyl"],
  ["Celexa", "Celebrex"],
];

function distributeCounts(total: number, subAreas: string[]): Record<string, number> {
  const base = Math.floor(total / subAreas.length);
  const remainder = total % subAreas.length;
  const result: Record<string, number> = {};
  subAreas.forEach((sub, i) => {
    result[sub] = base + (i < remainder ? 1 : 0);
  });
  return result;
}

function generateMedicationQuestions(): Question[] {
  const questions: Question[] = [];
  const counts = distributeCounts(368, ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"]);
  let seq = 1;

  for (const drug of drugs) {
    if (questions.filter((q) => q.subArea === "1.1").length >= counts["1.1"]) break;
    questions.push(
      buildQuestion({
        id: `med-1.1-${String(seq++).padStart(4, "0")}`,
        domain: "medications",
        subArea: "1.1",
        question: `What is the brand name for ${drug.generic}?`,
        correct: drug.brand,
        distractors: drugs.filter((d) => d.brand !== drug.brand).slice(0, 5).map((d) => d.brand),
        explanation: `${drug.generic} is the generic name for the brand ${drug.brand}, a ${drug.class}.`,
        isCalculation: false,
      })
    );
    questions.push(
      buildQuestion({
        id: `med-1.1-${String(seq++).padStart(4, "0")}`,
        domain: "medications",
        subArea: "1.1",
        question: `Which drug class does ${drug.generic} belong to?`,
        correct: drug.class,
        distractors: drugs.filter((d) => d.class !== drug.class).slice(0, 5).map((d) => d.class),
        explanation: `${drug.generic} (${drug.brand}) is classified as a ${drug.class}.`,
        isCalculation: false,
      })
    );
  }

  const duplications = [
    ["lisinopril", "enalapril", "Both are ACE inhibitors"],
    ["losartan", "valsartan", "Both are ARBs"],
    ["atorvastatin", "simvastatin", "Both are statins"],
    ["omeprazole", "pantoprazole", "Both are PPIs"],
    ["sertraline", "escitalopram", "Both are SSRIs"],
  ];
  for (let i = 0; i < counts["1.2"]; i++) {
    const item = duplications[i % duplications.length];
    questions.push(
      buildQuestion({
        id: `med-1.2-${String(i + 1).padStart(4, "0")}`,
        domain: "medications",
        subArea: "1.2",
        question: `Which pair represents a therapeutic duplication?`,
        correct: `${item[0]} and ${item[1]}`,
        distractors: [
          `${item[0]} and metformin`,
          `${item[0]} and amoxicillin`,
          "Warfarin and vitamin K",
        ],
        explanation: item[2] as string,
        isCalculation: false,
      })
    );
  }

  const interactions = [
    { pair: "warfarin + NSAIDs", risk: "Increased bleeding risk", severity: "life-threatening" },
    { pair: "MAOIs + tyramine-rich foods", risk: "Hypertensive crisis", severity: "life-threatening" },
    { pair: "methotrexate + NSAIDs", risk: "Increased methotrexate toxicity", severity: "severe" },
    { pair: "ACE inhibitors + potassium supplements", risk: "Hyperkalemia", severity: "severe" },
    { pair: "clopidogrel + omeprazole", risk: "Reduced antiplatelet effect", severity: "moderate" },
  ];
  for (let i = 0; i < counts["1.3"]; i++) {
    const item = interactions[i % interactions.length];
    questions.push(
      buildQuestion({
        id: `med-1.3-${String(i + 1).padStart(4, "0")}`,
        domain: "medications",
        subArea: "1.3",
        question: `What is a significant interaction with ${item.pair.split(" + ")[0]}?`,
        correct: item.risk,
        distractors: ["Increased appetite", "Blue urine", "Hair growth"],
        explanation: `${item.pair} may cause ${item.risk.toLowerCase()}. This is considered ${item.severity}.`,
        isCalculation: false,
      })
    );
  }

  for (let i = 0; i < counts["1.4"]; i++) {
    const drug = drugs[i % drugs.length];
    questions.push(
      buildQuestion({
        id: `med-1.4-${String(i + 1).padStart(4, "0")}`,
        domain: "medications",
        subArea: "1.4",
        question: `A prescription is written for ${drug.generic} 10 mg tablets. What is the strength?`,
        correct: "10 mg per tablet",
        distractors: ["10 mg per day only", "10 mg per mL", "10 mg per pack"],
        explanation: "Strength refers to the amount of active drug per dosage unit.",
        isCalculation: false,
      })
    );
  }

  for (let i = 0; i < counts["1.5"]; i++) {
    const drug = drugs[i % drugs.length];
    questions.push(
      buildQuestion({
        id: `med-1.5-${String(i + 1).padStart(4, "0")}`,
        domain: "medications",
        subArea: "1.5",
        question: `Which is a common side effect of ${drug.generic}?`,
        correct: drug.side,
        distractors: drugs.filter((d) => d.side !== drug.side).slice(0, 3).map((d) => d.side),
        explanation: `${drug.generic} commonly causes ${drug.side}.`,
        isCalculation: false,
      })
    );
  }

  for (let i = 0; i < counts["1.6"]; i++) {
    const drug = drugs[i % drugs.length];
    questions.push(
      buildQuestion({
        id: `med-1.6-${String(i + 1).padStart(4, "0")}`,
        domain: "medications",
        subArea: "1.6",
        question: `${drug.generic} is primarily indicated for:`,
        correct: drug.indication,
        distractors: drugs.filter((d) => d.indication !== drug.indication).slice(0, 3).map((d) => d.indication),
        explanation: `${drug.generic} is used for ${drug.indication}.`,
        isCalculation: false,
      })
    );
  }

  const stabilityItems = [
    { item: "reconstituted amoxicillin suspension", rule: "Discard after 14 days refrigerated" },
    { item: "insulin in use", rule: "Room temperature up to manufacturer limit" },
    { item: "oral reconstituted antibiotic", rule: "Use beyond-use date on label" },
    { item: "multi-dose vial", rule: "Discard per USP beyond-use dating" },
  ];
  for (let i = 0; i < counts["1.7"]; i++) {
    const item = stabilityItems[i % stabilityItems.length];
    questions.push(
      buildQuestion({
        id: `med-1.7-${String(i + 1).padStart(4, "0")}`,
        domain: "medications",
        subArea: "1.7",
        question: `What is appropriate stability handling for ${item.item}?`,
        correct: item.rule,
        distractors: ["Store in freezer indefinitely", "No expiration applies", "Mix with food weekly"],
        explanation: `${item.item} requires ${item.rule.toLowerCase()}.`,
        isCalculation: false,
      })
    );
  }

  for (let i = 0; i < counts["1.8"]; i++) {
    const drug = drugs[i % drugs.length];
    questions.push(
      buildQuestion({
        id: `med-1.8-${String(i + 1).padStart(4, "0")}`,
        domain: "medications",
        subArea: "1.8",
        question: `How should ${drug.generic} typically be stored?`,
        correct: drug.storage,
        distractors: ["Frozen solid", "Direct sunlight", "No container needed"],
        explanation: `${drug.generic} storage: ${drug.storage}.`,
        isCalculation: false,
      })
    );
  }

  return questions.slice(0, 368);
}

function generateFederalQuestions(): Question[] {
  const questions: Question[] = [];
  const counts = distributeCounts(197, ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"]);

  const disposalItems = [
    "Controlled substances must be destroyed using approved methods and documented",
    "Hazardous waste requires segregation from regular trash",
    "Sharps go in puncture-resistant containers",
    "Non-hazardous waste may use regular trash if de-identified",
  ];
  for (let i = 0; i < counts["2.1"]; i++) {
    questions.push(
      buildQuestion({
        id: `fed-2.1-${String(i + 1).padStart(4, "0")}`,
        domain: "federal",
        subArea: "2.1",
        question: `Which statement about pharmaceutical waste disposal is correct?`,
        correct: disposalItems[i % disposalItems.length],
        distractors: disposalItems.filter((_, idx) => idx !== i % disposalItems.length).slice(0, 3),
        explanation: "Federal and state rules require proper segregation and documentation of waste.",
        isCalculation: false,
      })
    );
  }

  for (let i = 0; i < counts["2.2"]; i++) {
    const item = scheduleDrugs[i % scheduleDrugs.length];
    questions.push(
      buildQuestion({
        id: `fed-2.2-${String(i + 1).padStart(4, "0")}`,
        domain: "federal",
        subArea: "2.2",
        question: `Under the DEA, ${item.drug} is classified as:`,
        correct: item.schedule,
        distractors: scheduleDrugs.filter((s) => s.schedule !== item.schedule).map((s) => s.schedule),
        explanation: `${item.drug} is ${item.schedule} due to abuse potential and accepted medical use rules.`,
        isCalculation: false,
      })
    );
  }

  const csRules = [
    "Schedule II prescriptions generally cannot be refilled",
    "Partial fills of Schedule II are limited except under specific conditions",
    "Controlled substance inventory requires biennial counts",
    "Theft or significant loss must be reported to DEA",
  ];
  for (let i = 0; i < counts["2.3"]; i++) {
    questions.push(
      buildQuestion({
        id: `fed-2.3-${String(i + 1).padStart(4, "0")}`,
        domain: "federal",
        subArea: "2.3",
        question: `Which is a federal controlled substance requirement?`,
        correct: csRules[i % csRules.length],
        distractors: ["All controlled drugs may be refilled without limit", "Inventory counts are optional", "Loss never needs reporting"],
        explanation: csRules[i % csRules.length],
        isCalculation: false,
      })
    );
  }

  const restricted = [
    { program: "Pseudoephedrine", rule: "Daily and monthly purchase limits with logbook/EFORCSE" },
    { program: "iPLEDGE (isotretinoin)", rule: "REMS with patient enrollment" },
    { program: "Risk Evaluation and Mitigation Strategies", rule: "May require restricted dispensing" },
  ];
  for (let i = 0; i < counts["2.4"]; i++) {
    const item = restricted[i % restricted.length];
    questions.push(
      buildQuestion({
        id: `fed-2.4-${String(i + 1).padStart(4, "0")}`,
        domain: "federal",
        subArea: "2.4",
        question: `What applies to ${item.program}?`,
        correct: item.rule,
        distractors: ["No documentation required", "Over-the-counter with no tracking", "Pharmacy tech may counsel without oversight"],
        explanation: item.rule,
        isCalculation: false,
      })
    );
  }

  const recalls = [
    { class: "Class I", desc: "Reasonable probability of serious adverse health consequences or death" },
    { class: "Class II", desc: "May cause temporary or medically reversible adverse health consequences" },
    { class: "Class III", desc: "Not likely to cause adverse health consequences" },
  ];
  for (let i = 0; i < counts["2.5"]; i++) {
    const item = recalls[i % recalls.length];
    questions.push(
      buildQuestion({
        id: `fed-2.5-${String(i + 1).padStart(4, "0")}`,
        domain: "federal",
        subArea: "2.5",
        question: `An FDA ${item.class} recall indicates:`,
        correct: item.desc,
        distractors: recalls.filter((r) => r.class !== item.class).map((r) => r.desc),
        explanation: `${item.class}: ${item.desc}.`,
        isCalculation: false,
      })
    );
  }

  const dscsa = [
    "Product identifier verification at each transaction",
    "Quarantine suspect or illegitimate products",
    "Track and trace through supply chain partners",
    "Respond to verification requests within required timeframe",
  ];
  for (let i = 0; i < counts["2.6"]; i++) {
    questions.push(
      buildQuestion({
        id: `fed-2.6-${String(i + 1).padStart(4, "0")}`,
        domain: "federal",
        subArea: "2.6",
        question: `Under DSCSA, pharmacies must:`,
        correct: dscsa[i % dscsa.length],
        distractors: ["Ignore serialization data", "Skip quarantine procedures", "Avoid supplier verification"],
        explanation: `DSCSA requires ${dscsa[i % dscsa.length].toLowerCase()}.`,
        isCalculation: false,
      })
    );
  }

  return questions.slice(0, 197);
}

function generatePatientSafetyQuestions(): Question[] {
  const questions: Question[] = [];
  const counts = distributeCounts(249, ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"]);

  const highAlert = ["insulin", "heparin", "chemotherapy", "opioids", "neuromuscular blockers"];
  for (let i = 0; i < counts["3.1"]; i++) {
    const drug = highAlert[i % highAlert.length];
    const pair = lasaPairs[i % lasaPairs.length];
    questions.push(
      buildQuestion({
        id: `safe-3.1-${String(i + 1).padStart(4, "0")}`,
        domain: "patient_safety",
        subArea: "3.1",
        question: i % 2 === 0 ? `Which medication is considered high-alert?` : `Which pair is a LASA concern?`,
        correct: i % 2 === 0 ? drug : `${pair[0]} / ${pair[1]}`,
        distractors: i % 2 === 0 ? ["Multivitamin", "Docusate", "Artificial tears"] : ["Aspirin / Tylenol", "Fish oil / Vitamin D", "Calcium / Magnesium"],
        explanation: i % 2 === 0 ? `${drug} is high-alert due to serious harm potential if misused.` : `${pair[0]} and ${pair[1]} are look-alike/sound-alike.`,
        isCalculation: false,
      })
    );
  }

  const errorPrevention = [
    "Use Tall Man lettering on labels",
    "Avoid trailing zeros (e.g., 1.0 mg)",
    "Include leading zeros for decimals (e.g., 0.1 mg)",
    "Scan bar codes at dispensing",
    "Separate LASA inventory on shelves",
  ];
  for (let i = 0; i < counts["3.2"]; i++) {
    questions.push(
      buildQuestion({
        id: `safe-3.2-${String(i + 1).padStart(4, "0")}`,
        domain: "patient_safety",
        subArea: "3.2",
        question: `Which is an effective error prevention strategy?`,
        correct: errorPrevention[i % errorPrevention.length],
        distractors: ["Use error-prone abbreviations", "Skip independent double check", "Store LASA drugs together"],
        explanation: errorPrevention[i % errorPrevention.length],
        isCalculation: false,
      })
    );
  }

  const pharmacistIssues = [
    "Drug utilization review alerts for interactions",
    "Therapeutic duplication requiring intervention",
    "Adverse drug event assessment",
    "Immunization screening contraindications",
  ];
  for (let i = 0; i < counts["3.3"]; i++) {
    questions.push(
      buildQuestion({
        id: `safe-3.3-${String(i + 1).padStart(4, "0")}`,
        domain: "patient_safety",
        subArea: "3.3",
        question: `Which issue requires pharmacist intervention?`,
        correct: pharmacistIssues[i % pharmacistIssues.length],
        distractors: ["Routine cash register balance", "Shelf dusting", "Break room scheduling"],
        explanation: pharmacistIssues[i % pharmacistIssues.length],
        isCalculation: false,
      })
    );
  }

  const reporting = ["MedWatch", "VAERS", "ISMP", "Root cause analysis", "Near-miss reporting"];
  for (let i = 0; i < counts["3.4"]; i++) {
    questions.push(
      buildQuestion({
        id: `safe-3.4-${String(i + 1).padStart(4, "0")}`,
        domain: "patient_safety",
        subArea: "3.4",
        question: `Which is used for medication event reporting or quality improvement?`,
        correct: reporting[i % reporting.length],
        distractors: reporting.filter((r) => r !== reporting[i % reporting.length]).slice(0, 3),
        explanation: `${reporting[i % reporting.length]} supports safety reporting and CQI.`,
        isCalculation: false,
      })
    );
  }

  const rxErrors = [
    "Wrong patient selected",
    "Incorrect drug strength",
    "Wrong quantity entered",
    "Incorrect route of administration",
    "Wrong drug product dispensed",
  ];
  for (let i = 0; i < counts["3.5"]; i++) {
    questions.push(
      buildQuestion({
        id: `safe-3.5-${String(i + 1).padStart(4, "0")}`,
        domain: "patient_safety",
        subArea: "3.5",
        question: `Which is a type of prescription error?`,
        correct: rxErrors[i % rxErrors.length],
        distractors: ["Correct patient counseling", "Accurate label printing", "Proper hand hygiene"],
        explanation: `${rxErrors[i % rxErrors.length]} is a dispensing/prescription processing error type.`,
        isCalculation: false,
      })
    );
  }

  const infection = [
    "Perform hand hygiene before dispensing",
    "Use PPE when handling hazardous drugs",
    "Clean counting trays regularly",
    "Disinfect high-touch surfaces",
  ];
  for (let i = 0; i < counts["3.6"]; i++) {
    questions.push(
      buildQuestion({
        id: `safe-3.6-${String(i + 1).padStart(4, "0")}`,
        domain: "patient_safety",
        subArea: "3.6",
        question: `Which supports infection prevention in the pharmacy?`,
        correct: infection[i % infection.length],
        distractors: ["Skip handwashing if gloves used", "Reuse wipes indefinitely", "Ignore spill cleanup"],
        explanation: infection[i % infection.length],
        isCalculation: false,
      })
    );
  }

  return questions.slice(0, 249);
}

function generateOrderEntryQuestions(): Question[] {
  const questions: Question[] = [];
  const counts = distributeCounts(236, ["4.1", "4.2", "4.3", "4.4"]);

  for (let i = 0; i < counts["4.1"]; i++) {
    const sig = sigCodes[i % sigCodes.length];
    if (i % 3 === 0) {
      questions.push(
        buildQuestion({
          id: `ord-4.1-${String(i + 1).padStart(4, "0")}`,
          domain: "order_entry",
          subArea: "4.1",
          question: `What does the sig abbreviation "${sig.code}" mean?`,
          correct: sig.meaning,
          distractors: sigCodes.filter((s) => s.meaning !== sig.meaning).slice(0, 3).map((s) => s.meaning),
          explanation: `${sig.code} means ${sig.meaning}.`,
          isCalculation: false,
        })
      );
    } else if (i % 3 === 1) {
      const tablets = 30 + (i % 10);
      const days = 30;
      const qty = tablets;
      questions.push(
        buildQuestion({
          id: `ord-4.1-${String(i + 1).padStart(4, "0")}`,
          domain: "order_entry",
          subArea: "4.1",
          question: `A patient takes 1 tablet daily. Quantity dispensed is ${qty}. What is the days' supply?`,
          correct: `${days} days`,
          distractors: [`${days + 5} days`, `${days - 5} days`, `${qty + 10} days`],
          explanation: `Days' supply = quantity ÷ daily dose = ${qty} ÷ 1 = ${days} days.`,
          isCalculation: true,
        })
      );
    } else {
      const ml = 473;
      questions.push(
        buildQuestion({
          id: `ord-4.1-${String(i + 1).padStart(4, "0")}`,
          domain: "order_entry",
          subArea: "4.1",
          question: `How many mL are in 1 pint?`,
          correct: "473 mL",
          distractors: ["350 mL", "500 mL", "240 mL"],
          explanation: "1 pint ≈ 473 mL (commonly used in pharmacy conversions).",
          isCalculation: true,
        })
      );
    }
  }

  const supplies = [
    { item: "Inhaler", supply: "Spacer device" },
    { item: "Insulin", supply: "Syringe or pen needle" },
    { item: "Injectable vaccine", supply: "Needle and syringe" },
    { item: "Nebulized medication", supply: "Nebulizer cup and compressor" },
  ];
  for (let i = 0; i < counts["4.2"]; i++) {
    const item = supplies[i % supplies.length];
    questions.push(
      buildQuestion({
        id: `ord-4.2-${String(i + 1).padStart(4, "0")}`,
        domain: "order_entry",
        subArea: "4.2",
        question: `Which supply is commonly needed with ${item.item}?`,
        correct: item.supply,
        distractors: ["Urinal", "Crutch", "Walker"],
        explanation: `${item.item} administration often requires ${item.supply.toLowerCase()}.`,
        isCalculation: false,
      })
    );
  }

  for (let i = 0; i < counts["4.3"]; i++) {
    questions.push(
      buildQuestion({
        id: `ord-4.3-${String(i + 1).padStart(4, "0")}`,
        domain: "order_entry",
        subArea: "4.3",
        question: i % 2 === 0 ? `What does the NDC identify?` : `Why is expiration date verification important?`,
        correct: i % 2 === 0 ? "Specific drug product, strength, and package size" : "To prevent dispensing outdated medication",
        distractors: i % 2 === 0 ? ["Patient insurance tier", "Pharmacist license number", "Store phone number"] : ["It is optional", "Only for cosmetics", "Only for OTC vitamins"],
        explanation: i % 2 === 0 ? "NDC uniquely identifies manufacturer, product, and package." : "Expired drugs may be ineffective or harmful.",
        isCalculation: false,
      })
    );
  }

  const returns = [
    "Return to stock only if integrity is verified and policy allows",
    "Credit return follows wholesaler policy",
    "Reverse distributor handles expired controlled/non-controlled per regulations",
    "Non-dispensable returns require proper documentation",
  ];
  for (let i = 0; i < counts["4.4"]; i++) {
    questions.push(
      buildQuestion({
        id: `ord-4.4-${String(i + 1).padStart(4, "0")}`,
        domain: "order_entry",
        subArea: "4.4",
        question: `Which statement about medication returns is correct?`,
        correct: returns[i % returns.length],
        distractors: returns.filter((r) => r !== returns[i % returns.length]).slice(0, 3),
        explanation: returns[i % returns.length],
        isCalculation: false,
      })
    );
  }

  return questions.slice(0, 236);
}

function validateQuestions(questions: Question[]): void {
  const ids = new Set<string>();
  for (const q of questions) {
    if (ids.has(q.id)) throw new Error(`Duplicate ID: ${q.id}`);
    ids.add(q.id);
    if (q.options.length !== 4) throw new Error(`Question ${q.id} must have 4 options`);
    if (q.correctIndex < 0 || q.correctIndex > 3) throw new Error(`Invalid correctIndex for ${q.id}`);
    if (!q.options[q.correctIndex]) throw new Error(`Correct option missing for ${q.id}`);
  }
}

function printReport(questions: Question[]): void {
  console.log("\n=== Yousif PTCB Question Bank Report ===");
  console.log(`Total questions: ${questions.length}`);
  for (const target of TARGETS) {
    const count = questions.filter((q) => q.domain === target.domain).length;
    const pct = ((count / questions.length) * 100).toFixed(2);
    console.log(`  ${target.domain}: ${count} (${pct}%) target ${target.count}`);
    for (const sub of target.subAreas) {
      const subCount = questions.filter((q) => q.subArea === sub).length;
      console.log(`    ${sub}: ${subCount}`);
    }
  }
}

async function generateWithOpenAI(): Promise<Question[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  console.log("OPENAI_API_KEY detected — optional AI top-up available in future runs.");
  return null;
}

async function main() {
  const aiQuestions = await generateWithOpenAI();
  const questions = [
    ...generateMedicationQuestions(),
    ...generateFederalQuestions(),
    ...generatePatientSafetyQuestions(),
    ...generateOrderEntryQuestions(),
    ...(aiQuestions ?? []),
  ];

  validateQuestions(questions);
  printReport(questions);

  const outputPath = path.join(process.cwd(), "data", "questions.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
  console.log(`\nWrote ${questions.length} questions to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
