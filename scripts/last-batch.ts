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

// ============================================================
// LAST BATCH - FILLING IN GAPS
// ============================================================

// MORE FEDERAL
const lastFederal = [
  { q: "What is the purpose of the FDA's Purple Book?", o: ["Lists licensed biological products and biosimilar information", "Lists controlled substances", "Lists pharmacies", "Lists insurance formularies"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "The Purple Book lists FDA-approved reference biological products and biosimilars." },
  { q: "Which schedule contains drugs with lowest abuse potential?", o: ["Schedule V", "Schedule I", "Schedule II", "Schedule III"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Schedule V has the lowest abuse potential (e.g., cough syrups with codeine)." },
  { q: "Phenobarbital is which DEA schedule?", o: ["Schedule IV", "Schedule II", "Schedule III", "Schedule V"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Phenobarbital is Schedule IV despite being a barbiturate." },
  { q: "An OTC monograph:", o: ["Sets standards for ingredients, dosing, and labeling of OTC drugs", "Requires prescription", "Is for controlled substances", "Is issued by DEA"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "FDA OTC monographs establish which ingredients/doses are GRAS/GRAE for specific conditions." },
  { q: "The FDA requires what information on OTC Drug Facts labels?", o: ["Active ingredients, uses, warnings, directions, and inactive ingredients", "Only price", "Only expiration", "Only quantity"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "Drug Facts label format is standardized by FDA for consumer understanding." },
  { q: "Which organization certifies pharmacy technicians nationally?", o: ["PTCB (Pharmacy Technician Certification Board)", "FDA", "DEA", "CMS"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "PTCB offers the PTCE exam for national pharmacy technician certification." },
  { q: "NPI numbers are:", o: ["10 digits for provider identification in claims", "DEA numbers", "State license numbers", "Controlled substance codes"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "NPI is a unique 10-digit identifier for healthcare providers." },
  { q: "What is the purpose of USP <1163>?", o: ["Quality assurance in pharmaceutical compounding", "Controlled substance scheduling", "Insurance billing", "Patient counseling"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "USP <1163> provides guidance on quality assurance for compounding activities." },
  { q: "What does the acronym OSHA stand for?", o: ["Occupational Safety and Health Administration", "Order and Safety Health Act", "Office of State Health Affairs", "Organization for Safe Healthcare"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "OSHA sets workplace safety standards including hazardous drug handling requirements." },
  { q: "SDS (Safety Data Sheets) provide:", o: ["Hazard and safety information about chemicals", "Patient medication information", "Prescription information", "Insurance data"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "SDS contain hazard identification, handling, and emergency information for chemicals." },
  { q: "FDA-approved patient labeling includes:", o: ["Package inserts and Medication Guides", "Insurance forms", "Inventory records", "DEA forms"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "Patient labeling includes the detailed package insert and FDA-approved Medication Guides." },
  { q: "Which statement about generic drugs is TRUE?", o: ["They must demonstrate bioequivalence to the brand", "They are always inferior", "They never work as well", "They cost the same as brand"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "FDA-approved generics must demonstrate bioequivalence to the reference brand product." },
  { q: "The Kefauver-Harris Amendment (1962) required:", o: ["Proof of drug efficacy before marketing", "Child-resistant packaging", "DEA registration", "Generic substitution"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "After thalidomide tragedy, this amendment required demonstration of safety AND efficacy." },
  { q: "How are Schedule III prescriptions authorized for refill?", o: ["Prescriber may authorize up to 5 refills in 6 months", "No refills allowed", "Unlimited refills", "Only by pharmacist decision"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "C-III to C-V may have up to 5 refills within 6 months of the date written." },
  { q: "What is a formulary?", o: ["A list of drugs covered by an insurance plan", "A prescription form", "A pharmacy license", "A DEA registration"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Formularies are insurance-approved drug lists that determine coverage and copays." },
];

for (const q of lastFederal) {
  addQ("federal", q.s, q.q, q.o, q.c, q.e);
}

// MORE PATIENT SAFETY
const lastSafety = [
  { q: "Which is a critical site on a needle?", o: ["The needle hub and tip", "The plunger", "The barrel markings", "The finger flange"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Critical sites (needle hub, tip, vial top) must never be touched during aseptic technique." },
  { q: "A direct compounding area (DCA) is:", o: ["The space within the ISO 5 PEC where sterile compounding occurs", "The entire pharmacy", "The waiting area", "The storage closet"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "The DCA is the ISO 5 environment where critical compounding occurs." },
  { q: "Why are cytotoxic drugs prepared in a negative pressure environment?", o: ["To protect the operator from drug exposure", "To protect the drug from contamination", "For faster preparation", "For better visibility"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Negative pressure keeps hazardous drug vapors/aerosols from escaping to protect personnel." },
  { q: "What is the meaning of ISO in cleanroom classification?", o: ["International Organization for Standardization", "Internal Safety Organization", "Isolated Sterile Operation", "Intensive Sterility Order"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "ISO standards define air cleanliness levels for controlled environments." },
  { q: "Low-risk level CSPs prepared in ISO 5 with BUD of refrigerated storage:", o: ["14 days", "48 hours", "30 days", "7 days"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Per USP 797, low-risk CSPs stored refrigerated have a 14-day BUD without further testing." },
  { q: "Morphine sulfate and magnesium sulfate are LASA drugs because:", o: ["Both can be abbreviated as 'MS' causing confusion", "They look alike", "Same drug class", "Same manufacturer"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "MS abbreviation is prohibited because it can mean either morphine or magnesium sulfate." },
  { q: "HYDROmorphone and morPHINE:", o: ["Are frequently confused LASA opioids", "Are the same drug", "Are safe to interchange", "Have no confusion risk"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Hydromorphone is ~5x more potent than morphine; confusion causes serious harm." },
  { q: "Oxytocin is a high-alert medication because:", o: ["Incorrect dosing can cause uterine rupture or fetal distress", "It is expensive", "It requires refrigeration", "It is a controlled substance"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Oxytocin requires careful dosing during labor; errors can be catastrophic." },
  { q: "Potassium phosphate and sodium phosphate:", o: ["Are LASA medications that can cause serious electrolyte errors", "Are the same drug", "Have no safety concerns", "Are controlled substances"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Phosphate salt confusion can cause dangerous electrolyte imbalances." },
  { q: "Medication reconciliation should occur:", o: ["At every transition of care (admission, transfer, discharge)", "Only at discharge", "Only at admission", "Once per year"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Med rec at every transition reduces errors from incomplete medication information." },
  { q: "A closed-loop medication system:", o: ["Uses barcoding at every step to verify right patient, drug, dose", "Has no safety checks", "Only tracks inventory", "Is optional"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Closed-loop systems verify medication at each step using electronic verification." },
  { q: "The hierarchy of controls for error prevention (most to least effective):", o: ["Forcing functions, automation, standardization, education", "Education, warnings, documentation", "Punishment, retraining, termination", "All equally effective"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Physical barriers (forcing functions) are most effective; education alone is least effective." },
  { q: "A workaround in medication safety:", o: ["Is a shortcut that bypasses safety checks and increases risk", "Is a best practice", "Improves efficiency safely", "Is encouraged"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Workarounds circumvent safety systems and increase error potential." },
  { q: "Alert fatigue occurs when:", o: ["Staff become desensitized to excessive alarms and warnings", "Alerts are insufficient", "Systems work perfectly", "Patients complain"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Too many alerts cause staff to ignore them, missing important warnings." },
  { q: "The purpose of a discharge medication list for patients:", o: ["To clearly communicate what medications to take at home", "To bill insurance", "For pharmacy inventory", "For DEA reporting"] as [string, string, string, string], c: 0 as const, s: "3.3", e: "Clear discharge instructions reduce post-discharge medication errors." },
  { q: "A potential error that is caught before reaching the patient is:", o: ["A near-miss (good catch)", "Not important", "An adverse event", "A sentinel event"] as [string, string, string, string], c: 0 as const, s: "3.4", e: "Near-misses are opportunities to learn and improve systems before harm occurs." },
  { q: "Which is NOT a characteristic of a just culture?", o: ["Punishing all errors equally regardless of circumstances", "Distinguishing between human error and reckless behavior", "Learning from mistakes", "Supporting reporting"] as [string, string, string, string], c: 0 as const, s: "3.4", e: "Just culture differentiates types of errors; blanket punishment discourages reporting." },
  { q: "The purpose of a safety huddle is:", o: ["Brief meetings to discuss safety concerns and share information", "To discipline staff", "To review finances", "For patient complaints only"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Safety huddles facilitate quick communication about safety issues and concerns." },
  { q: "Which documentation is needed after a medication error?", o: ["Incident report, patient chart documentation, and error analysis", "Nothing", "Only telling supervisor verbally", "Only patient chart"] as [string, string, string, string], c: 0 as const, s: "3.4", e: "Proper documentation allows investigation, learning, and quality improvement." },
  { q: "Which is true about cleanroom garbing?", o: ["Remove jewelry, makeup, and artificial nails before entering", "Jewelry is allowed", "Artificial nails are acceptable", "Street clothes are fine"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Jewelry, makeup, and artificial nails harbor microorganisms and aren't allowed." },
];

for (const q of lastSafety) {
  addQ("patient_safety", q.s, q.q, q.o, q.c, q.e);
}

// MORE ORDER ENTRY
const lastOrderEntry = [
  { q: "What does QOD mean?", o: ["Every other day (now on 'do not use' list)", "Four times daily", "Once daily", "Quarterly"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "QOD = every other day. It's error-prone and on ISMP's Do Not Use list." },
  { q: "How many drops (gtts) equal 1 mL?", o: ["Approximately 15-20 gtts (varies by dropper)", "Exactly 1", "Exactly 5", "Exactly 100"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Standard droppers deliver 15-20 gtts/mL; varies by solution viscosity and dropper." },
  { q: "What does the abbreviation 'NTE' mean?", o: ["Not to exceed", "Normal therapeutic effect", "New tablet entry", "No treatment expected"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "NTE = not to exceed, indicating maximum dose or quantity." },
  { q: "The Roman numeral 'XV' equals:", o: ["15", "10", "5", "20"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "XV = X (10) + V (5) = 15." },
  { q: "The Roman numeral 'XLVIII' equals:", o: ["48", "43", "58", "38"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "XLVIII = XL (40) + VIII (8) = 48." },
  { q: "A script calls for 'gtt ii OS TID'. This means:", o: ["2 drops in the left eye three times daily", "2 drops in each ear", "2 drops in right eye", "Two tablets"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "gtt = drop, ii = 2, OS = left eye, TID = three times daily." },
  { q: "When reconstituting a powder for oral suspension, you should:", o: ["Tap powder loose, add water in portions, and shake well", "Add all water at once", "Never shake", "Mix with hands"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Tap to loosen powder, add water in parts, shake after each addition for proper reconstitution." },
  { q: "The purpose of a 'shake well' auxiliary label is:", o: ["To ensure uniform distribution of suspended medication", "For patient entertainment", "To improve taste", "For storage indication"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Suspensions settle; shaking ensures accurate dose of uniformly distributed medication." },
  { q: "A master formula record contains:", o: ["Complete instructions for preparing a compounded medication", "Only patient name", "Only drug name", "Only price"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "Master formula records document all ingredients, procedures, and quality checks." },
  { q: "A compounding log documents:", o: ["Each time a compound is prepared with lot numbers and preparer", "Only inventory counts", "Only patient complaints", "Nothing specific"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "Compounding logs track every batch for quality control and recall capability." },
  { q: "What is the purpose of lot tracking?", o: ["To identify all products from a specific batch if a problem occurs", "To track employees", "To track patients", "For insurance purposes"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "Lot tracking enables identification and recall of specific production batches." },
  { q: "A prescription written for 'PRN pain' should include:", o: ["Maximum daily dose or frequency limits", "No other information", "Only the drug name", "Only patient name"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "PRN medications should have maximum dose/frequency to prevent overuse." },
  { q: "What happens when a prescription is transferred?", o: ["The transferring pharmacy invalidates their copy", "Both pharmacies keep active copies", "The patient keeps the prescription", "Nothing changes"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Transfer requires invalidating the original prescription to prevent duplicate fills." },
  { q: "E-prescribing (eRx) benefits include:", o: ["Reduced errors from illegible handwriting and automatic DUR", "Higher costs", "More paperwork", "Slower processing"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "E-prescribing eliminates handwriting errors and enables electronic safety checks." },
  { q: "Adjudication is the process of:", o: ["Submitting a claim to insurance and receiving approval/rejection", "Counting pills", "Labeling bottles", "Counseling patients"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Adjudication is the real-time insurance claim processing and response." },
  { q: "BIN and PCN numbers are used for:", o: ["Insurance claim routing and identification", "DEA registration", "Patient identification", "Drug identification"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "BIN (Bank ID Number) and PCN route claims to the correct insurance processor." },
  { q: "A rejection for 'refill too soon' means:", o: ["Insurance won't pay because too much medication is on hand", "Patient doesn't need it", "Drug is recalled", "Prescription expired"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Insurance calculates days' supply and rejects if requesting before expected run-out." },
  { q: "What does coordination of benefits (COB) involve?", o: ["Determining which of multiple insurances pays primary vs. secondary", "Paying cash only", "Ignoring insurance", "Transferring prescriptions"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "COB determines payment order when a patient has multiple insurance plans." },
  { q: "The primary insurance is:", o: ["The plan that pays first before other coverage is applied", "Always Medicare", "Always the cheapest", "Always the employer plan"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Primary insurance processes first; secondary pays remaining covered amounts." },
  { q: "An NDC mismatch rejection occurs when:", o: ["The billed NDC doesn't match the dispensed product", "Patient name is wrong", "Insurance is expired", "Quantity is wrong"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "NDC mismatches require verifying the correct product code is being billed." },
];

for (const q of lastOrderEntry) {
  addQ("order_entry", q.s, q.q, q.o, q.c, q.e);
}

// MORE MEDICATIONS
const lastMedications = [
  { q: "What is the brand name for escitalopram?", o: ["Lexapro", "Celexa", "Prozac", "Zoloft"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Escitalopram is marketed as Lexapro, an SSRI for depression and anxiety." },
  { q: "What is the generic name for Norvasc?", o: ["Amlodipine", "Lisinopril", "Metoprolol", "Losartan"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Norvasc (amlodipine) is a calcium channel blocker for hypertension." },
  { q: "What is the brand name for carvedilol?", o: ["Coreg", "Toprol", "Lopressor", "Tenormin"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Carvedilol (Coreg) is a non-selective beta blocker with alpha-blocking activity." },
  { q: "What is the generic name for Plavix?", o: ["Clopidogrel", "Aspirin", "Warfarin", "Rivaroxaban"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Plavix (clopidogrel) is an antiplatelet medication for stroke/MI prevention." },
  { q: "What is the brand name for duloxetine?", o: ["Cymbalta", "Pristiq", "Effexor", "Savella"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Duloxetine (Cymbalta) is an SNRI for depression, anxiety, neuropathy, and fibromyalgia." },
  { q: "Which medication requires dosing with a calendar blister pack (28-day cycle)?", o: ["Oral contraceptives", "Lisinopril", "Metformin", "Omeprazole"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Birth control pills come in 21 or 28-day packs with calendar dosing." },
  { q: "Which form of insulin can be given IV?", o: ["Regular insulin", "NPH insulin", "Insulin glargine", "Insulin detemir"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Only regular (short-acting) insulin can be administered intravenously." },
  { q: "Nitroglycerin sublingual tablets should:", o: ["Be kept in original glass container and replaced every 6 months", "Be stored in plastic", "Last indefinitely", "Be refrigerated"] as [string, string, string, string], c: 0 as const, s: "1.8", e: "Nitroglycerin degrades with heat, light, moisture; store in original container." },
  { q: "Which medication requires a 'must take with food' label?", o: ["Rivaroxaban (15mg or 20mg doses)", "Levothyroxine", "Omeprazole", "Alendronate"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Rivaroxaban 15-20mg doses require food for adequate absorption." },
  { q: "Amlodipine commonly causes:", o: ["Peripheral edema (swelling)", "Cough", "Hyperkalemia", "Bradycardia"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "CCBs like amlodipine cause peripheral edema due to vasodilation." },
  { q: "Metoclopramide (Reglan) black box warning is for:", o: ["Tardive dyskinesia with long-term use", "Bleeding", "Liver damage", "Kidney failure"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Long-term metoclopramide use can cause irreversible tardive dyskinesia." },
  { q: "Finasteride is contraindicated in:", o: ["Women who are or may become pregnant", "Men over 50", "Patients with diabetes", "Patients with hypertension"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Finasteride causes birth defects; women shouldn't handle crushed tablets." },
  { q: "Which antidepressant is associated with weight gain?", o: ["Mirtazapine", "Bupropion", "Fluoxetine", "Sertraline"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Mirtazapine commonly causes weight gain and sedation." },
  { q: "Which statin is dosed at bedtime?", o: ["Simvastatin", "Atorvastatin", "Rosuvastatin", "Pravastatin"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Simvastatin has short half-life; bedtime dosing aligns with peak cholesterol synthesis." },
  { q: "Warfarin interacts with many foods containing:", o: ["Vitamin K", "Vitamin C", "Vitamin B12", "Calcium"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Vitamin K promotes clotting and antagonizes warfarin's effect." },
  { q: "Which diabetic medication class causes urinary tract infections?", o: ["SGLT2 inhibitors (e.g., empagliflozin)", "Sulfonylureas", "DPP-4 inhibitors", "Biguanides"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "SGLT2 inhibitors increase glucose in urine, promoting UTIs and genital infections." },
  { q: "Isotretinoin is teratogenic, meaning it:", o: ["Causes birth defects", "Causes cancer", "Causes liver damage", "Causes weight gain"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Isotretinoin is highly teratogenic, requiring iPLEDGE REMS program." },
  { q: "Valproic acid can cause:", o: ["Neural tube defects if taken during pregnancy", "Hair growth", "Weight loss", "Blood pressure increase"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Valproic acid is highly teratogenic, particularly causing spina bifida." },
  { q: "Which medication requires checking for hepatotoxicity?", o: ["Acetaminophen (in overdose)", "Calcium supplements", "Vitamin C", "Antacids"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Acetaminophen overdose causes severe liver damage (max 4g/day for healthy adults)." },
  { q: "Which medication increases sun sensitivity?", o: ["Doxycycline", "Amoxicillin", "Azithromycin", "Cephalexin"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Tetracyclines cause photosensitivity; patients should avoid sun exposure." },
  { q: "Benzodiazepines should not be combined with:", o: ["Opioids (increased respiratory depression)", "Vitamins", "Antacids", "Antibiotics"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Benzodiazepine + opioid combination significantly increases overdose death risk." },
  { q: "What is first-line treatment for H. pylori infection?", o: ["Triple therapy: PPI + clarithromycin + amoxicillin or metronidazole", "Antacids alone", "Surgery", "Just a PPI"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "H. pylori eradication requires combination antibiotic therapy with acid suppression." },
  { q: "Allopurinol is used to prevent:", o: ["Gout attacks by reducing uric acid", "Infections", "Bleeding", "High blood pressure"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Allopurinol inhibits xanthine oxidase, reducing uric acid production." },
  { q: "Which medication is used for opioid use disorder maintenance?", o: ["Buprenorphine/naloxone (Suboxone)", "Naloxone alone", "Tramadol", "Hydrocodone"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Suboxone provides opioid maintenance therapy to reduce cravings and withdrawal." },
  { q: "Spironolactone is contraindicated with:", o: ["Potassium supplements (risk of hyperkalemia)", "Calcium supplements", "Vitamin D", "Iron supplements"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Spironolactone is potassium-sparing; additional K+ risks dangerous hyperkalemia." },
];

for (const q of lastMedications) {
  addQ("medications", q.s, q.q, q.o, q.c, q.e);
}

// Output and save
console.log("\nFinal batch added!");
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
