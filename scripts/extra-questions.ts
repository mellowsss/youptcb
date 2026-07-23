import * as fs from "fs";

interface Question {
  id: string;
  domain: "medications" | "federal" | "patient_safety" | "order_entry";
  subArea: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  isCalculation: boolean;
}

const existingQuestions: Question[] = JSON.parse(fs.readFileSync("./data/questions.json", "utf-8"));
const questions: Question[] = [...existingQuestions];

let questionCounter: Record<string, number> = {};
for (const q of existingQuestions) {
  const key = `${q.domain}-${q.subArea}`;
  questionCounter[key] = (questionCounter[key] || 0) + 1;
}

function addQ(
  domain: Question["domain"],
  subArea: string,
  question: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
  isCalculation = false
) {
  const key = `${domain}-${subArea}`;
  questionCounter[key] = (questionCounter[key] || 0) + 1;
  const num = String(questionCounter[key]).padStart(4, "0");
  
  questions.push({
    id: `${domain.substring(0, 3)}-${subArea}-${num}`,
    domain,
    subArea,
    question,
    options,
    correctIndex,
    explanation,
    isCalculation,
  });
}

// Additional diverse questions to reach 1050

// MORE MEDICATIONS
const extraMeds = [
  { q: "What is the generic name for Januvia?", o: ["Sitagliptin", "Linagliptin", "Saxagliptin", "Alogliptin"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Januvia (sitagliptin) is a DPP-4 inhibitor for type 2 diabetes." },
  { q: "Which medication class is metoprolol?", o: ["Beta blocker", "ACE inhibitor", "ARB", "Calcium channel blocker"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Metoprolol is a beta-1 selective beta blocker." },
  { q: "What is the brand name for quetiapine?", o: ["Seroquel", "Zyprexa", "Risperdal", "Abilify"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Quetiapine (Seroquel) is an atypical antipsychotic." },
  { q: "What is the generic name for Eliquis?", o: ["Apixaban", "Rivaroxaban", "Dabigatran", "Edoxaban"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Eliquis (apixaban) is a direct oral anticoagulant (factor Xa inhibitor)." },
  { q: "Gabapentin is commonly used for:", o: ["Neuropathic pain and seizures", "Hypertension", "Diabetes", "Depression only"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Gabapentin treats seizures, neuropathic pain, and is used off-label for anxiety." },
  { q: "Which medication requires dose adjustment in renal impairment?", o: ["Metformin", "Atorvastatin", "Amlodipine", "Lisinopril (titrated carefully)"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Metformin accumulates in renal impairment and requires dose adjustment or discontinuation." },
  { q: "What is the antidote for benzodiazepine overdose?", o: ["Flumazenil", "Naloxone", "N-acetylcysteine", "Vitamin K"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Flumazenil reverses benzodiazepine effects but is used cautiously (seizure risk)." },
  { q: "Digoxin toxicity is associated with which electrolyte imbalance?", o: ["Hypokalemia", "Hyperkalemia", "Hypernatremia", "Hypercalcemia"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Low potassium increases digoxin's effects on the heart, raising toxicity risk." },
  { q: "Which anticoagulant has vitamin K as its antidote?", o: ["Warfarin", "Apixaban", "Rivaroxaban", "Heparin"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Warfarin is reversed by vitamin K (phytonadione)." },
  { q: "What is the antidote for heparin overdose?", o: ["Protamine sulfate", "Vitamin K", "Flumazenil", "Naloxone"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Protamine sulfate binds to heparin and reverses its anticoagulant effect." },
  { q: "Acetaminophen overdose can be treated with:", o: ["N-acetylcysteine (NAC)", "Flumazenil", "Naloxone", "Vitamin K"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "NAC is the antidote for acetaminophen toxicity, replenishing glutathione." },
  { q: "Which medication is used to treat ADHD?", o: ["Methylphenidate", "Sertraline", "Quetiapine", "Gabapentin"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Methylphenidate (Ritalin, Concerta) is a first-line ADHD medication." },
  { q: "Hydroxychloroquine is used for:", o: ["Rheumatoid arthritis and lupus", "Hypertension", "Diabetes", "Depression"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Hydroxychloroquine is a DMARD used for autoimmune conditions." },
  { q: "Which vitamin should be supplemented with methotrexate?", o: ["Folic acid", "Vitamin D", "Vitamin K", "Vitamin B12"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Folic acid supplementation reduces methotrexate side effects." },
  { q: "Colchicine is specifically used for:", o: ["Acute gout flares", "Rheumatoid arthritis", "Osteoarthritis", "Fibromyalgia"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Colchicine treats and prevents acute gout attacks." },
  { q: "Sildenafil is contraindicated with:", o: ["Nitrates", "ACE inhibitors", "Beta blockers", "Statins"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Combining sildenafil with nitrates causes dangerous hypotension." },
  { q: "Which beta blocker is used for eye drops?", o: ["Timolol", "Metoprolol", "Atenolol", "Carvedilol"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Timolol eye drops (Timoptic) are used for glaucoma." },
  { q: "Latanoprost eye drops should be stored:", o: ["Refrigerated before opening, room temperature after", "Always refrigerated", "In direct sunlight", "In a warm area"] as [string, string, string, string], c: 0 as const, s: "1.8", e: "Latanoprost is refrigerated before opening; room temp is acceptable for 6 weeks after." },
  { q: "Which medication can cause a disulfiram-like reaction with alcohol?", o: ["Metronidazole", "Amoxicillin", "Azithromycin", "Doxycycline"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Metronidazole causes nausea, vomiting, and flushing if alcohol is consumed." },
  { q: "Amiodarone requires monitoring of:", o: ["Thyroid, liver, and lung function", "Only blood pressure", "Only kidney function", "Only heart rate"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Amiodarone can cause thyroid, hepatic, and pulmonary toxicity requiring monitoring." },
  { q: "What is the brand name for venlafaxine?", o: ["Effexor", "Cymbalta", "Pristiq", "Lexapro"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Venlafaxine (Effexor) is an SNRI antidepressant." },
  { q: "Pantoprazole belongs to which drug class?", o: ["Proton pump inhibitor", "H2 blocker", "Antacid", "Prokinetic"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Pantoprazole (Protonix) is a PPI for acid-related disorders." },
  { q: "What is the maximum daily dose of acetaminophen for healthy adults?", o: ["4 grams (4000 mg)", "2 grams", "6 grams", "8 grams"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Maximum 4g/day for healthy adults; lower for liver disease or alcohol use." },
  { q: "Which medication should be taken 30 minutes before the first meal?", o: ["Levothyroxine", "Metformin", "Lisinopril", "Atorvastatin"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Levothyroxine absorption is reduced by food; take on empty stomach." },
  { q: "Fluoxetine has a long half-life of:", o: ["1-6 days (active metabolite even longer)", "4-6 hours", "12 hours", "24 hours"] as [string, string, string, string], c: 0 as const, s: "1.7", e: "Fluoxetine has the longest half-life of SSRIs, reducing withdrawal symptoms." },
];

for (const q of extraMeds) {
  addQ("medications", q.s, q.q, q.o, q.c, q.e);
}

// MORE FEDERAL
const extraFed = [
  { q: "Who can prescribe controlled substances?", o: ["DEA-registered practitioners within their scope", "Anyone with a medical degree", "Pharmacists", "Nurses without prescriptive authority"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Only DEA-registered practitioners can prescribe controlled substances." },
  { q: "What is the purpose of a state PDMP?", o: ["Track controlled substance prescriptions to identify misuse", "Process insurance claims", "Order medications", "Train technicians"] as [string, string, string, string], c: 0 as const, s: "2.3", e: "PDMPs track CS prescriptions to identify doctor shopping and diversion." },
  { q: "Butalbital-containing products are typically which schedule?", o: ["Schedule III", "Schedule II", "Schedule IV", "Not scheduled"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Butalbital combinations (Fioricet with codeine) are typically Schedule III." },
  { q: "Carisoprodol (Soma) is which schedule?", o: ["Schedule IV in most states", "Schedule II", "Schedule III", "Not scheduled federally"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Carisoprodol is Schedule IV in many states due to abuse potential." },
  { q: "How should a pharmacy handle expired medications awaiting return?", o: ["Quarantine separately from dispensing stock", "Continue dispensing until returned", "Mix with current inventory", "Discard immediately"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "Expired medications must be segregated to prevent accidental dispensing." },
  { q: "The NDC number uniquely identifies:", o: ["Drug product, strength, and package size", "Patient", "Prescriber", "Insurance company"] as [string, string, string, string], c: 0 as const, s: "2.6", e: "NDC identifies the specific drug product by labeler, product, and package code." },
  { q: "What form is used to register a pharmacy with the DEA?", o: ["DEA Form 224", "DEA Form 222", "DEA Form 106", "DEA Form 41"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "DEA Form 224 is used for pharmacy registration (or renewal)." },
  { q: "An expired DEA registration:", o: ["Means the pharmacy cannot dispense controlled substances", "Has no effect", "Allows 30 more days", "Is automatically renewed"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Operating with expired DEA registration is a federal violation." },
  { q: "USP standards are:", o: ["Legally enforceable compendial standards", "Suggestions only", "State guidelines", "Insurance requirements"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "USP standards are legally enforceable and referenced in federal regulations." },
  { q: "Child-resistant packaging can be waived by:", o: ["Patient written request or prescriber directive", "Pharmacy preference", "Insurance company", "Anyone"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "Patients can request non-compliant packaging; some medications are exempt." },
  { q: "MedWatch reports are submitted to:", o: ["FDA", "DEA", "CMS", "CDC"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "FDA MedWatch is for reporting adverse events and product problems." },
  { q: "State pharmacy laws that are stricter than federal:", o: ["Must be followed (more stringent law applies)", "Can be ignored", "Are illegal", "Are only guidelines"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "The more stringent law (state or federal) always applies." },
  { q: "The Hatch-Waxman Act established:", o: ["Pathway for generic drug approval (ANDAs)", "Controlled substance scheduling", "Child-resistant packaging", "HIPAA regulations"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "The 1984 Hatch-Waxman Act created the ANDA process for generic drugs." },
  { q: "Medicare Part D covers:", o: ["Outpatient prescription drugs", "Hospital stays", "Physician visits", "Medical equipment only"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Medicare Part D is the outpatient prescription drug benefit program." },
  { q: "A BIN number on an insurance card identifies:", o: ["The insurance processor/PBM", "The patient", "The pharmacy", "The drug"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "BIN (Bank Identification Number) routes claims to the correct processor." },
];

for (const q of extraFed) {
  addQ("federal", q.s, q.q, q.o, q.c, q.e);
}

// MORE PATIENT SAFETY
const extraSafety = [
  { q: "What is the purpose of a medication error reduction program (MERP)?", o: ["Systematically analyze and reduce medication errors", "Punish staff", "Increase revenue", "Process claims faster"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "MERPs analyze errors to identify system improvements and prevent recurrence." },
  { q: "The ISMP List of Error-Prone Abbreviations should be:", o: ["Avoided in all prescription communications", "Used routinely", "Used for emergencies only", "Optional guidance only"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Error-prone abbreviations should be avoided to prevent medication errors." },
  { q: "Which is true about sound-alike drug pairs?", o: ["They require extra verification procedures", "They are interchangeable", "They have the same ingredients", "They are not a concern"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Sound-alike drugs need extra verification to prevent mix-ups." },
  { q: "Daily maximum dose checking helps prevent:", o: ["Overdose errors", "Inventory shortages", "Insurance rejections", "Late fills"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Maximum dose alerts catch potential overdoses before dispensing." },
  { q: "The purpose of pharmacy quality metrics includes:", o: ["Identifying areas for improvement and measuring performance", "Punishing staff", "Reducing hours", "Eliminating positions"] as [string, string, string, string], c: 0 as const, s: "3.4", e: "Quality metrics track performance to identify improvement opportunities." },
  { q: "A critical site on a syringe is:", o: ["The tip where the needle attaches", "The barrel", "The plunger", "The finger flange"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Syringe tips are critical sites that must remain sterile during compounding." },
  { q: "First air should contact:", o: ["Critical sites before any other surface", "Nothing", "The back of the hood first", "The technician's gloves"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "First air (sterile HEPA-filtered air) should reach critical sites first." },
  { q: "When wiping down surfaces in a laminar flow hood:", o: ["Wipe toward the HEPA filter, not away from it", "Wipe away from the filter", "Use circular motions only", "No specific direction needed"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Wipe toward dirty areas (toward the back/filter) to prevent contamination of clean areas." },
  { q: "Particle testing in cleanrooms measures:", o: ["Airborne particulate counts", "Temperature only", "Humidity only", "Light levels"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Particle testing verifies the cleanroom meets ISO air quality standards." },
  { q: "Surface sampling in sterile compounding:", o: ["Checks for microbial contamination on surfaces", "Measures air pressure", "Tests drug potency", "Checks expiration dates"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Surface sampling identifies contamination on work surfaces." },
  { q: "Gloved fingertip sampling tests:", o: ["Personnel aseptic technique through microbial growth", "Drug identification", "Inventory accuracy", "Label quality"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Fingertip testing verifies that personnel maintain aseptic technique." },
  { q: "Non-shedding gowns are required because:", o: ["They minimize particle contamination in the cleanroom", "They look professional", "They are less expensive", "They are more comfortable"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Non-shedding materials reduce particle release that could contaminate products." },
  { q: "Which statement about medication dispensing is correct?", o: ["Independent double-checks are more effective than single checks", "Single checks are sufficient", "Automation eliminates the need for checks", "Pharmacist checks are optional"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Independent double-checks catch errors that single-person checks miss." },
  { q: "Heparin is considered high-alert because:", o: ["Dosing errors can cause serious bleeding or clotting", "It is expensive", "It is difficult to store", "It expires quickly"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Heparin's narrow therapeutic index makes dosing errors dangerous." },
  { q: "Neuromuscular blocking agents are high-alert because:", o: ["They cause paralysis and respiratory arrest if given incorrectly", "They are controlled substances", "They are expensive", "They require refrigeration"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "NMBAs cause paralysis; accidental administration without ventilatory support is fatal." },
  { q: "What is the recommended maximum number of interruptions during medication preparation?", o: ["Zero - minimize all interruptions", "5 per prescription", "Unlimited", "10 per hour"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Interruptions during medication preparation significantly increase error risk." },
];

for (const q of extraSafety) {
  addQ("patient_safety", q.s, q.q, q.o, q.c, q.e);
}

// MORE ORDER ENTRY
const extraOrder = [
  { q: "Calculate: If 250 mg are needed and tablets are 50 mg each, how many tablets?", o: ["5 tablets", "2.5 tablets", "25 tablets", "50 tablets"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "250 mg ÷ 50 mg/tablet = 5 tablets.", calc: true },
  { q: "A vial contains 10 mL. If each dose is 0.5 mL, how many doses?", o: ["20 doses", "5 doses", "10 doses", "50 doses"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "10 mL ÷ 0.5 mL/dose = 20 doses.", calc: true },
  { q: "Convert 2.5 liters to milliliters:", o: ["2500 mL", "250 mL", "25 mL", "25000 mL"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "2.5 L × 1000 mL/L = 2500 mL.", calc: true },
  { q: "If a patient needs 15 mg/kg and weighs 60 kg, what is the dose?", o: ["900 mg", "90 mg", "15 mg", "4 mg"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "15 mg/kg × 60 kg = 900 mg.", calc: true },
  { q: "A suspension of 200 mg/5 mL needs to provide 400 mg. What volume?", o: ["10 mL", "5 mL", "20 mL", "2.5 mL"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "400 mg ÷ 200 mg × 5 mL = 10 mL.", calc: true },
  { q: "How many 100 mg capsules for a 30-day supply at BID dosing?", o: ["60 capsules", "30 capsules", "90 capsules", "120 capsules"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "BID = 2/day. 2 × 30 days = 60 capsules.", calc: true },
  { q: "The abbreviation 'supp' means:", o: ["Suppository", "Supply", "Supplemental", "Suspension"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Supp = suppository." },
  { q: "What does 'non rep' mean on a prescription?", o: ["No refills", "Not required", "New prescription", "Normal repeat"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Non rep (non repetatur) = do not repeat = no refills." },
  { q: "The abbreviation 'NAS' refers to:", o: ["Nasal", "Nausea", "Normal adult size", "Not as scheduled"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "NAS = nasal (route of administration)." },
  { q: "What does 'SOB' mean in a patient chart?", o: ["Shortness of breath", "Send our best", "Sign of bleeding", "Standard of behavior"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "SOB = shortness of breath (a clinical symptom)." },
  { q: "A compounding slab is used for:", o: ["Mixing ointments and creams", "Counting tablets", "Labeling bottles", "Storing medications"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Glass or ointment slabs provide a surface for mixing semi-solid compounds." },
  { q: "When preparing hazardous drugs in a BSC, the blower should run:", o: ["Continuously, including during and after use", "Only during compounding", "Only after compounding", "Never"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "BSC blower should run continuously to maintain negative pressure protection." },
  { q: "A repeater pump is used to:", o: ["Dispense consistent volumes of liquid quickly", "Grind tablets", "Label bottles", "Store medications"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Repeater pumps dispense pre-set volumes for efficient filling." },
  { q: "When must an invoice be signed?", o: ["Upon receipt of controlled substances", "For every order", "Only for recalls", "Never required"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "Controlled substance invoices must be signed and maintained." },
  { q: "What is checked during order verification?", o: ["Drug name, quantity, NDC, lot, expiration vs. invoice", "Only drug name", "Only quantity", "Nothing specific"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "Complete verification ensures accuracy and prevents errors." },
  { q: "Medications near expiration should be:", o: ["Placed in front to be dispensed first (FEFO)", "Hidden in back", "Returned immediately", "Discarded immediately"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "FEFO (First Expired, First Out) minimizes waste." },
  { q: "A reverse distributor credit memo:", o: ["Documents the credit issued for returned medications", "Is a patient receipt", "Is a prescription", "Is a DEA form"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Credit memos verify the credit received for pharmaceutical returns." },
  { q: "Which products typically cannot be returned for credit?", o: ["Opened or expired refrigerated items", "Sealed tablets", "Unopened bottles", "Current inventory"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Cold chain products and opened items usually cannot be returned." },
  { q: "Medication returns must be processed:", o: ["According to manufacturer and distributor policies", "At pharmacy discretion", "Immediately always", "Never - keep all expired stock"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Return policies vary; follow specific manufacturer/distributor guidelines." },
  { q: "Workflow management in pharmacy involves:", o: ["Organizing tasks to maximize efficiency and safety", "Working as fast as possible", "Ignoring protocols", "Processing claims only"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Effective workflow balances efficiency with accuracy and safety." },
];

for (const q of extraOrder) {
  addQ("order_entry", q.s, q.q, q.o, q.c, q.e, q.calc || false);
}

// Output and save
console.log("\nExtra questions added!");
console.log(`Total questions: ${questions.length}`);
console.log("\nBy domain:");
const byDomain: Record<string, number> = {};
for (const q of questions) {
  byDomain[q.domain] = (byDomain[q.domain] || 0) + 1;
}
for (const [domain, count] of Object.entries(byDomain)) {
  console.log(`  ${domain}: ${count}`);
}

fs.writeFileSync("./data/questions.json", JSON.stringify(questions, null, 2));
console.log("\nSaved to ./data/questions.json");
