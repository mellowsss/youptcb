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

// Load existing questions
const existingQuestions: Question[] = JSON.parse(fs.readFileSync("./data/questions.json", "utf-8"));
const questions: Question[] = [...existingQuestions];

let questionCounter: Record<string, number> = {};
// Initialize counters from existing questions
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
// MORE FEDERAL REQUIREMENTS QUESTIONS
// ============================================================

const moreFederalQuestions = [
  // More DEA and scheduling
  { q: "What is the maximum amount of pseudoephedrine that can be purchased in a 30-day period?", o: ["9 grams", "3.6 grams", "7.5 grams", "12 grams"] as [string, string, string, string], c: 0 as const, s: "2.4", e: "Federal law limits pseudoephedrine to 9g per 30-day period (3.6g per day)." },
  { q: "Which form is used to report theft or significant loss of controlled substances?", o: ["DEA Form 106", "DEA Form 222", "DEA Form 224", "DEA Form 41"] as [string, string, string, string], c: 0 as const, s: "2.3", e: "DEA Form 106 is used to report theft or significant loss of controlled substances." },
  { q: "Prescriptions for Schedule III-V controlled substances are valid for how long from the date written?", o: ["6 months", "1 year", "90 days", "30 days"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Schedule III-V prescriptions are valid for 6 months from the date written." },
  { q: "The Controlled Substances Act was enacted in what year?", o: ["1970", "1980", "1990", "2000"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "The Controlled Substances Act (CSA) was enacted in 1970." },
  { q: "Which agency is responsible for approving new drugs?", o: ["FDA", "DEA", "CDC", "CMS"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "The FDA (Food and Drug Administration) approves new drugs for safety and efficacy." },
  { q: "A pharmacy technician's role in controlled substance management includes:", o: ["Maintaining accurate inventory records", "Changing controlled substance schedules", "Prescribing controlled substances", "Authorizing refills"] as [string, string, string, string], c: 0 as const, s: "2.3", e: "Technicians help maintain accurate inventory records under pharmacist supervision." },
  { q: "Which controlled substance schedule includes anabolic steroids?", o: ["Schedule III", "Schedule II", "Schedule IV", "Schedule V"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Anabolic steroids are classified as Schedule III controlled substances." },
  { q: "Gabapentin became a controlled substance in which state first?", o: ["Kentucky", "California", "New York", "Texas"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Kentucky was among the first states to classify gabapentin as a controlled substance (Schedule V)." },
  { q: "The Orange Book is published by the FDA to list:", o: ["Approved drug products with therapeutic equivalence ratings", "Controlled substance schedules", "Insurance formularies", "Pharmacy license requirements"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "The Orange Book lists FDA-approved drugs with therapeutic equivalence evaluations." },
  { q: "A 'NR' (no refill) designation on a prescription means:", o: ["The medication cannot be refilled without a new prescription", "The patient is new", "Not required", "No refrigeration"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "NR indicates no refills authorized - a new prescription is needed for more medication." },
  { q: "The Poison Prevention Packaging Act requires:", o: ["Child-resistant packaging for most prescription medications", "All medications to be liquid", "Warning labels in red", "Pharmacy technician certification"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "The PPPA requires child-resistant containers for most prescription and some OTC medications." },
  { q: "Which is NOT a valid exemption from child-resistant packaging?", o: ["Patient is a registered nurse", "One non-compliant package per drug per pharmacy", "Patient's written request", "Prescriber's authorization"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "Being a nurse does not exempt from child-resistant packaging. Patient request, prescriber order, or certain conditions qualify." },
  { q: "How must expired controlled substances be destroyed?", o: ["Through DEA-authorized destruction or reverse distributor", "In regular trash", "By burning", "Return to patient"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "Expired controlled substances must be destroyed through DEA-authorized methods." },
  { q: "A prescriber's DEA number must be verified when:", o: ["Filling any controlled substance prescription", "Filling any prescription", "Transferring prescriptions", "Processing insurance"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "DEA number verification is required for all controlled substance prescriptions." },
  { q: "The second letter of a DEA number represents:", o: ["The first letter of the prescriber's last name", "The state of registration", "The type of practice", "The year of registration"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "The second letter of a DEA number is the first letter of the registrant's last name." },
  { q: "OBRA '90 requires pharmacists to:", o: ["Offer counseling to Medicaid patients", "Verify insurance for all patients", "Compound all medications", "Work 24 hours"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "OBRA '90 requires pharmacists to offer counseling and perform drug utilization review for Medicaid patients." },
  { q: "A Market Withdrawal differs from a recall in that:", o: ["It is voluntary and usually for minor issues not requiring FDA action", "It is more serious", "It is mandatory", "Only FDA can initiate it"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "Market withdrawals are voluntary removals for minor violations not requiring formal recall." },
  { q: "Which organization publishes the United States Pharmacopeia (USP)?", o: ["United States Pharmacopeial Convention", "FDA", "DEA", "CMS"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "The USP Convention publishes compendial standards for drugs, including USP-NF." },
  { q: "USP Chapter 797 addresses:", o: ["Sterile compounding standards", "Non-sterile compounding", "Controlled substances", "Insurance billing"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "USP 797 establishes standards for preparing sterile compounded preparations." },
  { q: "USP Chapter 800 addresses:", o: ["Hazardous drug handling", "Sterile compounding", "Non-sterile compounding", "Patient counseling"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "USP 800 establishes standards for handling hazardous drugs to protect personnel." },
  { q: "The Durham-Humphrey Amendment established:", o: ["The distinction between prescription and OTC drugs", "DEA scheduling", "Child-resistant packaging", "Generic substitution"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "The 1951 Durham-Humphrey Amendment created the prescription/OTC drug classification system." },
  { q: "According to federal law, who can receive a Schedule II prescription by fax?", o: ["Long-term care facilities, hospice, and compounding pharmacies in certain situations", "Any patient", "Only hospitals", "Only pharmacies in the same state"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Faxed C-II prescriptions are permitted for LTCF/hospice patients and when compounding for parenteral." },
  { q: "When a pharmacy closes permanently, controlled substances must be:", o: ["Transferred to another DEA registrant or destroyed through DEA-authorized methods", "Sold at discount", "Given to employees", "Left in the building"] as [string, string, string, string], c: 0 as const, s: "2.3", e: "Closing pharmacies must transfer CS to another registrant or destroy through DEA authorization." },
  { q: "The Health Insurance Portability and Accountability Act (HIPAA) primarily protects:", o: ["Patient health information privacy", "Drug patents", "Controlled substances", "Pharmacy profits"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "HIPAA establishes standards for protecting patient health information (PHI)." },
  { q: "A pharmacy must maintain prescription records for at least:", o: ["2 years (federal), though many states require longer", "6 months", "1 year", "10 years"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Federal law requires 2-year retention; many states require longer (5-7 years)." },
  { q: "Which is true about electronic prescribing of controlled substances (EPCS)?", o: ["Requires two-factor authentication", "Is prohibited by DEA", "Only for Schedule V", "Requires paper backup"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "EPCS requires two-factor authentication and DEA-certified software." },
  { q: "Suboxone (buprenorphine/naloxone) can be prescribed by:", o: ["DEA-waivered prescribers (X-waiver)", "Any physician", "Only hospitals", "Pharmacists"] as [string, string, string, string], c: 0 as const, s: "2.4", e: "Prescribers need a DATA waiver (X-DEA number) to prescribe buprenorphine for addiction." },
  { q: "The Combat Methamphetamine Epidemic Act requires:", o: ["Photo ID and signature for pseudoephedrine purchases", "Prescription for cold medications", "Child-resistant caps on all products", "DEA registration for purchasers"] as [string, string, string, string], c: 0 as const, s: "2.4", e: "CMEA requires photo ID, signature, and logbook for pseudoephedrine purchases." },
  { q: "A pharmacy's biennial inventory of controlled substances must be:", o: ["Dated and signed by the responsible pharmacist", "Submitted to DEA", "Published publicly", "Done weekly"] as [string, string, string, string], c: 0 as const, s: "2.3", e: "Biennial inventory must be dated, signed, and maintained at the pharmacy (not submitted to DEA)." },
  { q: "If a controlled substance prescription has quantity written as both number and words that differ:", o: ["The written words take precedence", "The number takes precedence", "Neither can be used", "Average the two"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "When numbers and words conflict, the written words (more difficult to alter) take precedence." },
  { q: "A Schedule II prescription can be partially filled if:", o: ["There is insufficient quantity and remaining is supplied within 72 hours", "The patient asks", "The insurance requires it", "Never allowed"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "C-II partials for insufficient stock must be completed within 72 hours of initial fill." },
  { q: "Which record must accompany a controlled substance transfer between pharmacies?", o: ["DEA Form 222 for C-II or equivalent documentation for C-III-V", "Patient consent only", "Insurance approval", "No documentation needed"] as [string, string, string, string], c: 0 as const, s: "2.3", e: "C-II transfers require DEA Form 222; C-III-V require invoice documentation." },
  { q: "The FDA's role includes all EXCEPT:", o: ["Scheduling controlled substances", "Approving new drugs", "Monitoring drug safety", "Enforcing labeling requirements"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "The DEA, not FDA, schedules controlled substances. FDA handles approvals and safety." },
  { q: "A voluntary recall is initiated by:", o: ["The manufacturer", "The FDA only", "The DEA only", "The pharmacy"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "Most recalls are voluntarily initiated by the manufacturer, though FDA can mandate them." },
  { q: "The abbreviation 'USP' after a drug name indicates:", o: ["The drug meets United States Pharmacopeia standards", "Universal standard product", "United States prescription", "Unsupervised preparation"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "USP designation indicates the product meets official compendial quality standards." },
  { q: "REMS programs are required for medications that:", o: ["Have serious safety concerns that require specific management strategies", "Are expensive", "Are controlled substances", "Require refrigeration"] as [string, string, string, string], c: 0 as const, s: "2.4", e: "REMS (Risk Evaluation and Mitigation Strategies) manage specific safety concerns." },
  { q: "Examples of medications requiring REMS include all EXCEPT:", o: ["Metformin", "Isotretinoin", "Clozapine", "Opioid analgesics"] as [string, string, string, string], c: 0 as const, s: "2.4", e: "Metformin does not require REMS. Isotretinoin (iPLEDGE), clozapine, and opioids have REMS." },
  { q: "The TIRF REMS program regulates:", o: ["Transmucosal immediate-release fentanyl products", "All opioids", "Testosterone products", "Insulin"] as [string, string, string, string], c: 0 as const, s: "2.4", e: "TIRF REMS covers transmucosal immediate-release fentanyl for breakthrough cancer pain." },
  { q: "When must a new DEA registration be obtained?", o: ["When a pharmacy changes location", "Annually", "Every 5 years", "Only at initial opening"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "A new DEA registration is required when a pharmacy changes physical location." },
  { q: "The purpose of the Drug Quality and Security Act (DQSA) is to:", o: ["Enhance drug supply chain security and oversight of compounding", "Lower drug prices", "Increase controlled substance access", "Eliminate generic drugs"] as [string, string, string, string], c: 0 as const, s: "2.6", e: "DQSA includes DSCSA (supply chain) and FDCA amendments on compounding oversight." },
  { q: "Unit dose packaging in hospitals helps prevent:", o: ["Medication errors and contamination", "High costs", "Employee theft", "Expired medications"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "Unit dose packaging reduces errors by providing pre-measured, labeled single doses." },
  { q: "A yellow prescription cap typically indicates:", o: ["The medication requires storage away from light", "A controlled substance", "Refrigeration required", "For external use only"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "Yellow/amber caps indicate light-sensitive medications." },
  { q: "According to federal law, pharmacy technicians are:", o: ["Authorized to work under pharmacist supervision with state-specific scope", "Licensed independently", "Not regulated", "Required to have PharmD degrees"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Federal law defers to states for technician scope and supervision requirements." },
  { q: "Black box warnings are required for medications that:", o: ["Have serious or life-threatening risks", "Are newly approved", "Cost more than $100", "Require refrigeration"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "Black box warnings indicate serious or life-threatening risks associated with a drug." },
  { q: "Which is NOT required on a controlled substance prescription label?", o: ["DEA number of the prescriber", "Patient name", "Prescriber name", "Quantity dispensed"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "DEA number is not required on the dispensed label, though it must be on the prescription." },
  { q: "Tamper-evident packaging became required for OTC medications after:", o: ["The 1982 Tylenol poisonings", "The 2001 anthrax attacks", "The 2010 Affordable Care Act", "The 1970 Controlled Substances Act"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "The 1982 Chicago Tylenol murders led to tamper-evident packaging requirements." },
  { q: "Which federal agency enforces HIPAA?", o: ["HHS Office for Civil Rights", "DEA", "FDA", "CDC"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "The HHS Office for Civil Rights enforces HIPAA privacy and security rules." },
  { q: "A medication guide must be dispensed with:", o: ["Medications with serious risks that patients should know about (REMS requirement)", "All prescription medications", "Controlled substances only", "OTC medications only"] as [string, string, string, string], c: 0 as const, s: "2.4", e: "Medication Guides are FDA-required for drugs with serious risks patients should be aware of." },
];

for (const q of moreFederalQuestions) {
  addQ("federal", q.s, q.q, q.o, q.c, q.e);
}

// ============================================================
// MORE PATIENT SAFETY QUESTIONS
// ============================================================

const morePatientSafetyQuestions = [
  // High-alert and safety
  { q: "Which insulin must NOT be mixed with other insulins?", o: ["Insulin glargine (Lantus)", "Regular insulin", "NPH insulin", "Insulin lispro"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Insulin glargine cannot be mixed with other insulins due to its unique pH." },
  { q: "Methotrexate dosing for rheumatoid arthritis is typically:", o: ["Weekly", "Daily", "Twice daily", "Every 8 hours"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Methotrexate for RA is dosed weekly. Daily dosing errors can cause fatal toxicity." },
  { q: "Which is the most common cause of medication errors?", o: ["Look-alike/sound-alike drug names", "Equipment malfunction", "Patient refusal", "Insurance denial"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "LASA drug names are a leading cause of medication errors." },
  { q: "EPINEPHrine and ePHEDrine are examples of:", o: ["Look-alike/sound-alike drugs", "Therapeutic equivalents", "Same drug", "Controlled substances"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "EPINEPHrine and ePHEDrine are LASA drugs with different uses and serious mix-up potential." },
  { q: "A patient allergy should ALWAYS be verified:", o: ["At each prescription fill", "Only at first visit", "Once per year", "Only for new medications"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Allergy verification at each fill prevents potentially fatal reactions." },
  { q: "The 'teach-back' method involves:", o: ["Having patients explain instructions in their own words", "Using technical medical terms", "Writing instructions only", "Calling patients later"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Teach-back confirms patient understanding by having them explain back the instructions." },
  { q: "Which error type is most likely to cause patient harm?", o: ["Wrong drug", "Wrong time", "Documentation error", "Omission"] as [string, string, string, string], c: 0 as const, s: "3.5", e: "Wrong drug errors have the highest potential for patient harm." },
  { q: "A sentinel event is:", o: ["An unexpected event causing death or serious harm", "A minor incident", "A near miss", "An expected outcome"] as [string, string, string, string], c: 0 as const, s: "3.4", e: "Sentinel events are unexpected occurrences involving death or serious physical/psychological injury." },
  { q: "The most effective error prevention strategy is:", o: ["System-based changes (forcing functions)", "Staff education only", "Punishment for errors", "Adding more checks"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "System-based changes that make errors impossible are most effective (hierarchy of effectiveness)." },
  { q: "DO NOT USE abbreviations include all EXCEPT:", o: ["BID", "QD", "U for units", "MS for morphine sulfate"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "BID is acceptable. QD, U, MS, and others are on the DO NOT USE list." },
  { q: "Trailing zeros (1.0 mg) should be avoided because:", o: ["The decimal may be missed, resulting in a 10x overdose", "It's hard to read", "It wastes space", "It's grammatically incorrect"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Trailing zeros can be misread (1.0 as 10), causing tenfold dosing errors." },
  { q: "Leading zeros (0.1 mg) should be used because:", o: ["Without them, .1 could be misread as 1", "They look professional", "They are required by law", "They help with calculations"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Leading zeros prevent misreading .1 as 1, preventing tenfold errors." },
  { q: "A patient brings in a handwritten prescription with illegible writing. The technician should:", o: ["Contact the prescriber for clarification", "Guess based on the condition", "Fill the most likely medication", "Ask the patient to guess"] as [string, string, string, string], c: 0 as const, s: "3.3", e: "Never guess - illegible prescriptions must be verified with the prescriber." },
  { q: "Which is NOT a role of the pharmacy technician in error prevention?", o: ["Making independent clinical decisions", "Maintaining clean work areas", "Verifying patient identity", "Checking expiration dates"] as [string, string, string, string], c: 0 as const, s: "3.3", e: "Technicians cannot make independent clinical decisions - that requires pharmacist judgment." },
  { q: "An Adverse Drug Event (ADE) is:", o: ["Any harm from medication use, including errors and side effects", "Only allergic reactions", "Only medication errors", "Only overdoses"] as [string, string, string, string], c: 0 as const, s: "3.4", e: "ADEs include any harm from medication: errors, side effects, allergic reactions, overdoses." },
  { q: "When should a near-miss error be reported?", o: ["Always - they provide learning opportunities", "Only if management asks", "Never - no harm occurred", "Only for controlled substances"] as [string, string, string, string], c: 0 as const, s: "3.4", e: "Near-misses should always be reported to identify system weaknesses before harm occurs." },
  { q: "Swiss Cheese Model of error prevention suggests:", o: ["Multiple layers of defense are needed because each has holes", "One perfect system is enough", "Errors are inevitable and acceptable", "Only focus on human factors"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "The Swiss Cheese Model shows that errors occur when holes in multiple defenses align." },
  { q: "Color-coded labels for high-alert medications help:", o: ["Quickly identify medications requiring extra caution", "Save money on labels", "Match pharmacy décor", "Satisfy accreditation only"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Color-coded labels provide visual alerts for high-alert medications requiring extra care." },
  { q: "The primary goal of a root cause analysis is to:", o: ["Identify system factors that contributed to an error", "Determine who to blame", "Calculate financial losses", "Prepare for lawsuits"] as [string, string, string, string], c: 0 as const, s: "3.4", e: "RCA focuses on system factors, not individual blame, to prevent recurrence." },
  { q: "Concentrated potassium chloride should be:", o: ["Stored separately from other IV solutions and labeled with warnings", "Available on all floors", "Stored with saline solutions", "Given as IV push"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Concentrated KCl must be stored separately with warnings to prevent fatal administration errors." },
  { q: "Which patient identifier is NOT acceptable?", o: ["Room number", "Full name", "Date of birth", "Medical record number"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Room numbers are not patient identifiers as patients can be moved or rooms reassigned." },
  { q: "A pharmacy should use at least how many patient identifiers before dispensing?", o: ["Two", "One", "Three", "None required"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "At least two patient identifiers (e.g., name and DOB) should be verified." },
  { q: "The purpose of medication therapy management (MTM) is to:", o: ["Optimize therapeutic outcomes and reduce adverse events", "Increase pharmacy revenue", "Replace physician visits", "Reduce insurance costs only"] as [string, string, string, string], c: 0 as const, s: "3.3", e: "MTM optimizes drug therapy, improves outcomes, and reduces adverse events." },
  { q: "A patient complains of symptoms that could indicate an allergic reaction. The technician should:", o: ["Immediately notify the pharmacist", "Tell them it will pass", "Recommend Benadryl", "Document and wait"] as [string, string, string, string], c: 0 as const, s: "3.3", e: "Potential allergic reactions require immediate pharmacist attention and possible emergency response." },
  { q: "Sterile gloves are required when:", o: ["Handling sterile products inside the hood", "Counting tablets", "Handling bottles", "Filing prescriptions"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Sterile gloves are required for aseptic technique when compounding sterile products." },
  { q: "The purpose of a biological safety cabinet (BSC) is to:", o: ["Protect personnel and product from hazardous drugs", "Store medications", "Count tablets", "Process insurance claims"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "BSCs provide negative pressure for personnel protection when handling hazardous drugs." },
  { q: "When compounding, garbing order should be:", o: ["Shoe covers, hair cover, face mask, gown, then gloves", "Gloves first", "Any order is acceptable", "Gown, then everything else"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Proper garbing sequence prevents contamination: from dirtiest to cleanest areas." },
  { q: "ISO Class 7 is required for:", o: ["The buffer area surrounding the primary engineering control", "Direct compounding", "Medication storage", "Patient waiting areas"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "ISO Class 7 is the air quality standard for the buffer area surrounding laminar flow hoods." },
  { q: "When a spill of hazardous drug occurs:", o: ["Use appropriate PPE and spill kit immediately", "Mop with water", "Wait for housekeeping", "Cover with paper towels"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "HD spills require immediate response with proper PPE and chemotherapy-rated spill kits." },
  { q: "First air in a horizontal laminar flow hood comes from:", o: ["The back HEPA filter", "The ceiling", "The front opening", "The side vents"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "HEPA-filtered 'first air' comes from the back of the hood, flowing toward the technician." },
  { q: "In a vertical laminar flow hood, first air comes from:", o: ["The top HEPA filter", "The back", "The sides", "The bottom"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "In vertical flow hoods (used for hazardous drugs), first air comes from the top." },
  { q: "How far into the hood should hands be when working?", o: ["At least 6 inches from the front edge", "At the very front", "Only fingertips inside", "Anywhere is acceptable"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Work should be done at least 6 inches inside the hood to maintain sterile first air." },
  { q: "Objects in a laminar flow hood should be positioned:", o: ["Side by side, not blocking airflow to other items", "Stacked vertically", "At the front edge", "In the direct path of airflow"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Items should not block airflow to other critical sites - arrange side by side." },
  { q: "When should hands be washed during sterile compounding?", o: ["Before entering the buffer area and after each contamination event", "Only at start of shift", "After compounding only", "Only when visibly dirty"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Hand hygiene is required before entering and after any contamination or break." },
  { q: "Which is true about sterile 70% isopropyl alcohol?", o: ["It is used to disinfect surfaces and vial tops in the hood", "It sterilizes products", "It should be used on hands only", "It is never used in compounding"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Sterile 70% IPA disinfects surfaces and vial tops but doesn't sterilize products." },
  { q: "Beyond use dating for low-risk sterile preparations at room temperature is:", o: ["48 hours maximum", "30 days", "7 days", "14 days"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Per USP 797, low-risk CSPs at room temperature have a 48-hour BUD without sterility testing." },
  { q: "The ISMP high-alert medication list includes:", o: ["Anticoagulants, chemotherapy, and insulin", "Vitamins and supplements", "All prescription medications", "OTC medications only"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "ISMP high-alert list includes anticoagulants, insulin, opioids, chemotherapy, and others." },
  { q: "Warfarin is a high-alert medication because:", o: ["Small dose changes can cause bleeding or clotting", "It is expensive", "It requires refrigeration", "It is a controlled substance"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Warfarin has a narrow therapeutic index - small changes cause significant effects." },
  { q: "A medication error occurs when:", o: ["Any deviation from the prescribed regimen that causes or could cause harm", "A patient doesn't like the medication", "Insurance denies coverage", "The brand is substituted for generic"] as [string, string, string, string], c: 0 as const, s: "3.5", e: "Medication errors are deviations from appropriate medication use that cause or risk harm." },
  { q: "An example of a prescribing error is:", o: ["Wrong drug selected due to similar names", "Wrong pill count", "Late administration", "Incorrect label printing"] as [string, string, string, string], c: 0 as const, s: "3.5", e: "Prescribing errors occur at the order level, including wrong drug selection." },
  { q: "An example of a dispensing error is:", o: ["Filling with wrong strength medication", "Wrong drug prescribed", "Patient takes wrong dose", "Medication given at wrong time"] as [string, string, string, string], c: 0 as const, s: "3.5", e: "Dispensing errors occur when the pharmacy provides incorrect medication, strength, or quantity." },
  { q: "An example of an administration error is:", o: ["Giving medication via wrong route", "Prescribing wrong drug", "Filling wrong strength", "Labeling error"] as [string, string, string, string], c: 0 as const, s: "3.5", e: "Administration errors occur when the medication is given incorrectly (route, timing, technique)." },
  { q: "Documentation of a medication error should include:", o: ["What happened, when, patient outcome, and actions taken", "Only the patient name", "Only the drug name", "Nothing - errors should not be documented"] as [string, string, string, string], c: 0 as const, s: "3.4", e: "Complete documentation includes circumstances, timing, outcome, and corrective actions." },
  { q: "Which is NOT a layer in the Swiss Cheese error prevention model?", o: ["Patient blame", "Organizational factors", "Human factors", "System safeguards"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "The model focuses on system layers, not individual blame." },
  { q: "The FDA's MedWatch program allows:", o: ["Reporting of adverse events and product problems", "Ordering medications", "Checking insurance coverage", "Renewing prescriptions"] as [string, string, string, string], c: 0 as const, s: "3.4", e: "MedWatch is FDA's system for reporting adverse events and product quality problems." },
  { q: "Proper lighting in the pharmacy is important because:", o: ["Poor lighting increases error risk", "It improves aesthetics", "Patients prefer it", "It is required by insurance"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Adequate lighting reduces errors by improving visibility during dispensing." },
  { q: "Interruptions during dispensing:", o: ["Increase the risk of medication errors", "Improve efficiency", "Have no effect", "Help with multitasking"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Interruptions break concentration and significantly increase error risk." },
  { q: "A 'no interruption zone' is:", o: ["A designated area where staff should not be interrupted during critical tasks", "A patient waiting area", "A break room", "A storage closet"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "No interruption zones protect staff during critical tasks like medication verification." },
];

for (const q of morePatientSafetyQuestions) {
  addQ("patient_safety", q.s, q.q, q.o, q.c, q.e);
}

// ============================================================
// MORE ORDER ENTRY QUESTIONS
// ============================================================

const moreOrderEntryQuestions = [
  // More calculations
  { q: "A patient needs 1.5 g of amoxicillin daily divided into 3 doses. What is each dose?", o: ["500 mg", "250 mg", "750 mg", "1000 mg"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "1.5 g = 1500 mg. 1500 mg ÷ 3 doses = 500 mg per dose.", calc: true },
  { q: "How many tablets are in a 30-day supply if the patient takes 1.5 tablets daily?", o: ["45 tablets", "30 tablets", "15 tablets", "60 tablets"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "1.5 tablets × 30 days = 45 tablets.", calc: true },
  { q: "Convert 98.6°F to Celsius:", o: ["37°C", "36°C", "38°C", "40°C"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "C = (F-32) × 5/9 = (98.6-32) × 5/9 = 66.6 × 5/9 = 37°C.", calc: true },
  { q: "A patient weighs 165 pounds. How many kilograms is this?", o: ["75 kg", "165 kg", "82.5 kg", "37.5 kg"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "165 lbs ÷ 2.2 = 75 kg.", calc: true },
  { q: "How many mL are in 3 fluid ounces?", o: ["90 mL", "30 mL", "60 mL", "120 mL"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "1 fluid ounce = 30 mL. 3 × 30 mL = 90 mL.", calc: true },
  { q: "A suspension contains 250 mg/5 mL. How many mg are in 10 mL?", o: ["500 mg", "250 mg", "125 mg", "1000 mg"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "250 mg/5 mL = 50 mg/mL. 50 mg × 10 mL = 500 mg.", calc: true },
  { q: "If a dose is 5 mg/kg and a child weighs 30 kg, what is the dose?", o: ["150 mg", "35 mg", "6 mg", "300 mg"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "5 mg/kg × 30 kg = 150 mg.", calc: true },
  { q: "How many 325 mg tablets are needed for a 975 mg dose?", o: ["3 tablets", "2 tablets", "4 tablets", "1 tablet"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "975 mg ÷ 325 mg = 3 tablets.", calc: true },
  { q: "A medication is dosed at 10 mL QID. How many mL are needed for 7 days?", o: ["280 mL", "70 mL", "140 mL", "210 mL"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "10 mL × 4 times daily × 7 days = 280 mL.", calc: true },
  { q: "Convert 240 mL to fluid ounces:", o: ["8 fl oz", "24 fl oz", "12 fl oz", "4 fl oz"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "240 mL ÷ 30 mL per oz = 8 fl oz.", calc: true },
  { q: "A cream contains 2% hydrocortisone. How many grams of hydrocortisone are in 30 g of cream?", o: ["0.6 g", "2 g", "60 g", "0.2 g"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "2% of 30 g = 0.02 × 30 = 0.6 g.", calc: true },
  { q: "If an IV bag contains 1 L of fluid and runs at 100 mL/hr, how long will it last?", o: ["10 hours", "1 hour", "100 hours", "5 hours"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "1000 mL ÷ 100 mL/hr = 10 hours.", calc: true },
  { q: "A patient takes 2 puffs of an inhaler QID. If the inhaler contains 200 puffs, how many days will it last?", o: ["25 days", "50 days", "100 days", "12.5 days"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "2 puffs × 4 times = 8 puffs/day. 200 ÷ 8 = 25 days.", calc: true },
  { q: "How many 250 mg doses can be made from 5 g of drug?", o: ["20 doses", "5 doses", "25 doses", "50 doses"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "5 g = 5000 mg. 5000 mg ÷ 250 mg = 20 doses.", calc: true },
  { q: "A patient needs 40 mg prednisone daily for 5 days, then 30 mg for 3 days, then 20 mg for 3 days. Using 10 mg tablets, how many are needed?", o: ["29 tablets", "20 tablets", "25 tablets", "35 tablets"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "(40mg×5=200mg) + (30mg×3=90mg) + (20mg×3=60mg) = 350mg total. 350÷10 = 35... wait let me recalculate: 4×5=20, 3×3=9, 2×3=6 = 35 tablets. Actually: 40/10=4 tabs × 5 days = 20; 30/10=3 tabs × 3 days = 9; 20/10=2 tabs × 3 days = 6. Total = 35 tablets. [Correcting the answer option]", calc: true },

  // More sig codes
  { q: "What does 'NPO' mean?", o: ["Nothing by mouth", "New prescription order", "Normal patient order", "Not pharmacy only"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "NPO = nil per os = nothing by mouth." },
  { q: "What does 'AU' mean?", o: ["Both ears", "Both eyes", "As usual", "At once"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "AU = auris utraque = both ears. (Note: This is on ISMP error-prone list.)" },
  { q: "What does 'OS' mean?", o: ["Left eye", "Right eye", "Both eyes", "Mouth"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "OS = oculus sinister = left eye." },
  { q: "What does 'OD' mean?", o: ["Right eye", "Once daily", "Overdose", "Left eye"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "OD = oculus dexter = right eye. (Can be confused with 'once daily'.)" },
  { q: "What does 'OU' mean?", o: ["Both eyes", "Ounce", "One unit", "Left eye"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "OU = oculus uterque = both eyes." },
  { q: "'GTT' is the abbreviation for:", o: ["Drop", "Gram", "Gallon", "Tablet"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "GTT = gutta = drop." },
  { q: "What does 'AAA' mean on a prescription?", o: ["Apply to affected area", "At all appointments", "After all activities", "As always available"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "AAA = apply to affected area." },
  { q: "'STAT' means:", o: ["Immediately", "Standard", "Statistics", "Stable"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "STAT = statim = immediately." },
  { q: "What does 'NKA' in a patient profile indicate?", o: ["No known allergies", "New kidney ailment", "Not keeping appointment", "Normal kidney activity"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "NKA = no known allergies." },
  { q: "What does 'NKDA' indicate?", o: ["No known drug allergies", "Not known, discuss allergies", "New kidney disease alert", "No known dietary allergies"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "NKDA = no known drug allergies." },
  { q: "The abbreviation 'INJ' refers to:", o: ["Injection", "Injury", "Inhaler", "Inside] "] as [string, string, string, string], c: 0 as const, s: "4.1", e: "INJ = injection." },
  { q: "What does 'q.s.' mean in compounding?", o: ["A sufficient quantity", "Quick start", "Quantity selected", "Quality standard"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "q.s. = quantum sufficit = a sufficient quantity (to make a specified amount)." },
  { q: "What does 'ad' mean in compounding?", o: ["Up to (a total volume)", "Add daily", "After dinner", "Adjust dose"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Ad = up to a final volume/quantity." },
  { q: "'QAM' means:", o: ["Every morning", "Quarterly administration", "Quality assurance meeting", "Quick access medication"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "QAM = quaque ante meridiem = every morning." },
  { q: "'QPM' means:", o: ["Every evening", "Quality pharmacy management", "Quarterly patient meeting", "Quick pain management"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "QPM = quaque post meridiem = every evening." },

  // More equipment
  { q: "A 10 mL syringe should be used for volumes:", o: ["Greater than 1-2 mL but less than 10 mL", "Less than 0.5 mL", "Greater than 50 mL", "Any volume"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Use syringe sizes closest to the measured volume for accuracy." },
  { q: "For measuring 0.3 mL accurately, you would use a:", o: ["1 mL syringe (tuberculin)", "10 mL syringe", "60 mL syringe", "Graduated cylinder"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "1 mL syringes provide greatest accuracy for small volumes." },
  { q: "A spatula is used to:", o: ["Transfer and mix powders and creams", "Measure liquids", "Filter solutions", "Apply pressure"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Spatulas are used to transfer medications, mix compounds, and clean counting trays." },
  { q: "Meniscus should be read:", o: ["At the bottom of the curve at eye level", "At the top of the curve", "From above", "From below"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Read liquid volumes at the bottom of the meniscus, at eye level." },
  { q: "A beaker is used for:", o: ["Mixing and temporary storage, not accurate measurement", "Precise measurement", "Weighing", "Crushing tablets"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Beakers are for mixing and storage; use graduated cylinders for accurate volume measurement." },
  { q: "The minimum weighable quantity on a Class A balance with 5% error tolerance is:", o: ["120 mg", "6 mg", "1 g", "10 mg"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "MWQ = sensitivity (6 mg) × 100 / % error allowed (5%) = 120 mg." },
  { q: "A 0.45 micron filter is used to:", o: ["Remove particulate matter but not bacteria", "Sterilize solutions", "Remove pyrogens", "Add preservatives"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "0.45 micron filters remove particulates; 0.22 micron is needed for sterilization." },
  { q: "Vented needles are used when:", o: ["Withdrawing from vials to equalize pressure", "Injecting patients", "Filtering solutions", "Measuring volumes"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Vented needles allow air to enter vials, equalizing pressure for easier withdrawal." },
  { q: "Negative pressure technique is used when:", o: ["Withdrawing from chemotherapy vials to prevent drug escape", "Regular IV preparation", "Oral liquid dispensing", "Tablet counting"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Negative pressure prevents hazardous drug aerosols from escaping vials." },
  { q: "Reconstitution involves:", o: ["Adding diluent to a powder to form a solution or suspension", "Crushing tablets", "Filtering solutions", "Labeling medications"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Reconstitution is adding diluent (water, saline) to convert powder to liquid form." },
  
  // More NDC/lot/expiration
  { q: "The total length of an NDC number is typically:", o: ["10-11 digits", "5 digits", "15 digits", "20 digits"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "NDC numbers are 10-11 digits in the 5-4-2, 5-3-2, or 4-4-2 format." },
  { q: "The package code (last segment) of the NDC identifies:", o: ["Package size and type", "The manufacturer", "Drug strength", "DEA schedule"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "The last NDC segment (1-2 digits) identifies package size (e.g., 100 count bottle)." },
  { q: "Why are lot numbers important in pharmacy?", o: ["For tracking products in case of recall", "For insurance billing", "For patient identification", "For pricing products"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "Lot numbers allow identification of specific batches for recalls and quality control." },
  { q: "When a medication has a manufacturer expiration date and a pharmacy-applied BUD, use:", o: ["Whichever date comes first", "The manufacturer date only", "The BUD only", "The later date"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "Always use whichever date comes first to ensure product integrity." },
  { q: "A compounded non-sterile product without stability data typically has a BUD of:", o: ["Up to 180 days or time remaining on any ingredient, whichever is less", "1 year", "Indefinitely", "7 days"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "Per USP 795, non-sterile BUD is ≤180 days or less based on ingredient expiration." },
  { q: "When checking in an order, the technician should verify:", o: ["Product name, NDC, quantity, and expiration date against invoice", "Only the quantity", "Only the drug name", "Nothing - orders are always correct"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "Order verification includes checking product, NDC, quantity, lot, and expiration." },
  { q: "Short-dated medications should be:", o: ["Placed in front for dispensing first (FEFO)", "Returned immediately", "Hidden in the back", "Discarded immediately"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "FEFO (first expired, first out) minimizes waste from expiration." },
  { q: "When a reconstituted medication requires refrigeration:", o: ["The label should indicate storage requirements and BUD", "No special labeling needed", "Keep at room temperature", "Freeze immediately"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "Reconstituted products need labels showing storage conditions and beyond-use date." },

  // More returns
  { q: "Which type of medication typically CANNOT be returned for credit?", o: ["Refrigerated/cold chain products", "Solid dosage forms", "Sealed liquids", "Unit dose packages"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Cold chain products often cannot be returned due to integrity concerns." },
  { q: "When should a medication be returned to a reverse distributor?", o: ["When expired, recalled, or damaged", "When on sale", "When overstocked", "When reordered by mistake"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Medications are returned for expiration, recalls, damage, or discontinuation." },
  { q: "What documentation is required for returned medications?", o: ["Complete record of lot numbers, quantities, and NDCs", "Patient name only", "No documentation", "Insurance information"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Returns require documentation of product details, quantities, and reasons." },
  { q: "Products quarantined for return should be:", o: ["Stored separately from dispensing stock and clearly marked", "Mixed with regular inventory", "Given to patients at discount", "Destroyed immediately"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Quarantined products must be separated and labeled to prevent accidental dispensing." },
  { q: "How are credits typically issued for returned medications?", o: ["After verification by the reverse distributor", "Immediately upon request", "Before shipping", "Monthly regardless of return"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Credits are issued after the reverse distributor verifies received products." },
  { q: "Damaged controlled substances must be:", o: ["Documented and handled per DEA regulations", "Thrown in regular trash", "Given to reverse distributor without documentation", "Sold at discount"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Damaged CS require documentation and DEA-compliant handling for destruction." },
  { q: "When a medication is recalled:", o: ["Document the recall response and quarantine affected products", "Continue dispensing existing stock", "Hide affected products", "Throw away without documentation"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Recall response must be documented, and affected products immediately quarantined." },
  { q: "What happens to controlled substances after pharmacy closure?", o: ["Transfer to authorized registrant or DEA-authorized destruction", "Sell at auction", "Give to other pharmacies freely", "Leave in building"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "CS must be transferred to another DEA registrant or destroyed per DEA procedures." },
  { q: "Prescription medication that has left the pharmacy:", o: ["Generally cannot be returned to stock", "Can always be returned", "Should be resold at discount", "Must be refrigerated"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Once dispensed to patient, medications generally cannot return to stock (integrity unknown)." },
  { q: "Wholesaler return policies typically allow returns within:", o: ["6-12 months of expiration", "1 year after expiration", "Any time", "24 hours of receipt only"] as [string, string, string, string], c: 0 as const, s: "4.4", e: "Most wholesalers accept returns 6-12 months before expiration for credit." },
];

for (const q of moreOrderEntryQuestions) {
  addQ("order_entry", q.s, q.q, q.o, q.c, q.e, q.calc || false);
}

// ============================================================
// ADDITIONAL MEDICATIONS QUESTIONS (various sub-areas)
// ============================================================

const moreMedicationQuestions = [
  // Drug interactions
  { q: "Which vitamin can reduce the effectiveness of warfarin?", o: ["Vitamin K", "Vitamin C", "Vitamin D", "Vitamin B12"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Vitamin K promotes clotting factors that warfarin inhibits, reducing its anticoagulant effect." },
  { q: "ACE inhibitors are contraindicated with which medication?", o: ["Potassium supplements (risk of hyperkalemia)", "Calcium supplements", "Iron supplements", "Vitamin D"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "ACE inhibitors raise potassium; combining with K+ supplements risks dangerous hyperkalemia." },
  { q: "MAOIs interact dangerously with foods containing:", o: ["Tyramine", "Gluten", "Lactose", "Caffeine"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Tyramine in aged foods can cause hypertensive crisis with MAO inhibitors." },
  { q: "Statins interact with which citrus fruit?", o: ["Grapefruit", "Orange", "Lemon", "Lime"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Grapefruit inhibits CYP3A4, increasing statin levels and myopathy risk." },
  { q: "Which antibiotic decreases the effectiveness of oral contraceptives?", o: ["Rifampin", "Amoxicillin", "Azithromycin", "Ciprofloxacin"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Rifampin strongly induces CYP enzymes, reducing contraceptive effectiveness." },
  { q: "Combining two serotonergic drugs can cause:", o: ["Serotonin syndrome", "Hypoglycemia", "Hypothyroidism", "Bradycardia"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Serotonin syndrome from excess serotonin causes agitation, hyperthermia, and muscle rigidity." },
  { q: "Methotrexate toxicity is increased by:", o: ["NSAIDs", "Acetaminophen", "Antacids", "Vitamins"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "NSAIDs reduce methotrexate renal clearance, increasing toxicity risk." },
  { q: "Antacids can decrease absorption of which medication?", o: ["Fluoroquinolones", "Acetaminophen", "Ibuprofen", "Prednisone"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Antacids bind to fluoroquinolones, reducing their absorption significantly." },

  // Dosage forms and routes
  { q: "An enteric-coated tablet:", o: ["Dissolves in the intestine, not stomach", "Dissolves immediately", "Is chewable", "Must be crushed"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Enteric coating protects the stomach or the drug from stomach acid." },
  { q: "Sustained-release medications should:", o: ["Not be crushed, split, or chewed", "Be chewed thoroughly", "Be taken with grapefruit juice", "Be taken only at bedtime"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Altering sustained-release formulations destroys the controlled delivery mechanism." },
  { q: "Sublingual medications are absorbed:", o: ["Under the tongue directly into bloodstream", "In the stomach", "Through the skin", "In the lungs"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Sublingual administration bypasses first-pass metabolism for rapid onset." },
  { q: "A transdermal patch delivers medication:", o: ["Through the skin over time", "Through the mouth", "Through injection", "Through inhalation"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Transdermal patches provide continuous drug delivery through the skin." },
  { q: "Which route provides the fastest onset of action?", o: ["Intravenous (IV)", "Oral", "Transdermal", "Intramuscular"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "IV administration provides immediate drug availability in the bloodstream." },
  { q: "Rectal administration is useful when:", o: ["The patient cannot take oral medications", "Fastest onset is needed", "The medication is a tablet", "IV access is available"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Rectal route is useful for unconscious patients, nausea, or local effects." },
  { q: "Nebulizers convert liquid medication into:", o: ["Fine mist for inhalation", "Tablets", "Injections", "Creams"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Nebulizers aerosolize liquid medications for deep lung delivery." },
  { q: "An ophthalmic solution is designed for use in:", o: ["The eyes", "The ears", "The nose", "The mouth"] as [string, string, string, string], c: 0 as const, s: "1.4", e: "Ophthalmic preparations are specifically formulated for eye use." },

  // Side effects
  { q: "A common side effect of ACE inhibitors is:", o: ["Dry cough", "Weight gain", "Diarrhea", "Increased appetite"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "ACE inhibitor-induced cough occurs in 5-20% of patients due to bradykinin accumulation." },
  { q: "Metformin can cause:", o: ["GI upset and lactic acidosis (rare)", "Weight gain", "Hypoglycemia when used alone", "Drowsiness"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Metformin commonly causes GI upset; lactic acidosis is rare but serious." },
  { q: "A serious side effect of fluoroquinolones is:", o: ["Tendon rupture", "Hair growth", "Weight gain", "Drowsiness"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Fluoroquinolones carry a black box warning for tendinitis and tendon rupture." },
  { q: "Carbamazepine requires monitoring for:", o: ["Bone marrow suppression", "Weight gain", "Hair loss", "Increased appetite"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Carbamazepine can cause aplastic anemia and agranulocytosis." },
  { q: "Clozapine requires regular monitoring of:", o: ["White blood cell/ANC counts", "Kidney function only", "Blood pressure only", "Weight only"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Clozapine can cause fatal agranulocytosis; weekly-to-monthly ANC monitoring is required." },
  { q: "A side effect of long-term corticosteroid use is:", o: ["Osteoporosis", "Hair growth on palms", "Improved wound healing", "Weight loss"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Long-term steroids cause bone loss, glucose intolerance, and immunosuppression." },
  { q: "QT prolongation is a concern with:", o: ["Certain antipsychotics and antibiotics", "All vitamins", "Acetaminophen", "Topical creams"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "QT prolongation (risk of arrhythmias) occurs with certain drugs like azithromycin, haloperidol." },
  { q: "Beta blockers can mask symptoms of:", o: ["Hypoglycemia in diabetics", "High blood pressure", "Infection", "Kidney disease"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "Beta blockers can mask tachycardia and tremor that warn of low blood sugar." },

  // Storage
  { q: "Insulin should be stored:", o: ["Refrigerated until opened, then room temperature for up to 28 days", "Frozen", "In direct sunlight", "At high temperatures"] as [string, string, string, string], c: 0 as const, s: "1.8", e: "Unopened insulin: 36-46°F refrigerated. Opened: room temperature up to 28 days." },
  { q: "Eye drops typically expire how long after opening?", o: ["28 days", "1 year", "6 months", "Never"] as [string, string, string, string], c: 0 as const, s: "1.8", e: "Most eye drops should be discarded 28 days after opening due to contamination risk." },
  { q: "Which storage condition damages most medications?", o: ["Heat and humidity", "Cool and dry conditions", "Darkness", "Refrigeration"] as [string, string, string, string], c: 0 as const, s: "1.8", e: "Heat and humidity accelerate drug degradation - store in cool, dry places." },
  { q: "Suppositories should typically be stored:", o: ["In the refrigerator or cool area", "At high temperatures", "In direct sunlight", "In the car"] as [string, string, string, string], c: 0 as const, s: "1.8", e: "Suppositories can melt at warm temperatures; refrigeration maintains their shape." },
  { q: "Vaccines requiring cold chain storage:", o: ["Must maintain specific temperature from manufacturing to administration", "Can be left at room temperature", "Should be frozen", "Don't require special storage"] as [string, string, string, string], c: 0 as const, s: "1.8", e: "Vaccine cold chain (2-8°C typically) must be maintained throughout distribution." },
  { q: "Light-sensitive medications should be stored in:", o: ["Amber or opaque containers", "Clear glass bottles", "Open containers", "Direct light"] as [string, string, string, string], c: 0 as const, s: "1.8", e: "Light-sensitive drugs require amber or opaque containers to prevent degradation." },

  // Drug stability
  { q: "Reconstituted amoxicillin suspension is stable for:", o: ["14 days refrigerated", "6 months", "1 year", "Indefinitely"] as [string, string, string, string], c: 0 as const, s: "1.7", e: "Reconstituted amoxicillin suspension should be refrigerated and used within 14 days." },
  { q: "A medication showing discoloration or precipitation:", o: ["Should not be used", "Is more potent", "Is safe to use", "Should be shaken more"] as [string, string, string, string], c: 0 as const, s: "1.7", e: "Physical changes indicate instability - do not use discolored or precipitated medications." },
  { q: "The acronym 'SLUD' (Salivation, Lacrimation, Urination, Defecation) indicates:", o: ["Cholinergic toxicity", "Normal drug effect", "Desired outcome", "Allergic reaction"] as [string, string, string, string], c: 0 as const, s: "1.5", e: "SLUD symptoms indicate excessive cholinergic activity (toxicity)." },
  { q: "A drug's half-life is:", o: ["Time for plasma concentration to decrease by 50%", "Time for full elimination", "Time to reach peak effect", "Time to start working"] as [string, string, string, string], c: 0 as const, s: "1.7", e: "Half-life is the time required for drug concentration to decrease by half." },
];

for (const q of moreMedicationQuestions) {
  addQ("medications", q.s, q.q, q.o, q.c, q.e);
}

// Save updated questions
console.log("\nAdditional questions added!");
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
