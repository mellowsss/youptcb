#!/usr/bin/env python3
"""Generate a 2026 PTCE-aligned practice bank with unique scenario-style items."""

from __future__ import annotations

import hashlib
import json
import random
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "questions.json"
DRUGS_PATH = ROOT / "data" / "top200-drugs.json"

TARGETS = {
    "medications": 368,
    "federal": 197,
    "patient_safety": 249,
    "order_entry": 236,
}

SUB_TARGETS = {
    "medications": {"1.1": 46, "1.2": 46, "1.3": 46, "1.4": 46, "1.5": 46, "1.6": 46, "1.7": 46, "1.8": 46},
    "federal": {"2.1": 33, "2.2": 33, "2.3": 33, "2.4": 33, "2.5": 32, "2.6": 33},
    "patient_safety": {"3.1": 42, "3.2": 42, "3.3": 42, "3.4": 41, "3.5": 41, "3.6": 41},
    "order_entry": {"4.1": 80, "4.2": 52, "4.3": 52, "4.4": 52},
}

# Adjust medications last 1.8 to hit 368 (46*8=368)
# federal 33*4 + 32 + 33 = 197
# patient_safety 42*3 + 41*3 = 249
# order_entry 80+52*3 = 236


def mulberry32(seed: int):
    state = seed & 0xFFFFFFFF

    def rand():
        nonlocal state
        state = (state + 0x6D2B79F5) & 0xFFFFFFFF
        t = state
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        t ^= t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296

    return rand


RNG = random.Random(20260106)


def shuffle(items):
    copy = list(items)
    RNG.shuffle(copy)
    return copy


def primary_brand(brand: str) -> str:
    return brand.split("/")[0].strip()


def build_q(domain, sub, stem, correct, distractors, explanation, is_calc=False):
    opts = []
    seen = set()
    for o in [correct, *distractors]:
        o = " ".join(str(o).split())
        if o and o not in seen:
            seen.add(o)
            opts.append(o)
    while len(opts) < 4:
        opts.append(f"None of the other listed options ({len(opts)})")
    opts = opts[:4]
    opts = shuffle(opts)
    return {
        "domain": domain,
        "subArea": sub,
        "question": " ".join(stem.split()),
        "options": opts,
        "correctIndex": opts.index(correct if correct in opts else opts[0]),
        "explanation": " ".join(explanation.split()),
        "isCalculation": is_calc,
    }


def load_drugs():
    drugs = json.loads(DRUGS_PATH.read_text())
    # Enrich with common PTCE attributes
    side_by_class = {
        "ACE inhibitor": "dry cough",
        "ARB": "hyperkalemia",
        "Beta blocker": "bradycardia",
        "Calcium channel blocker": "peripheral edema",
        "Statin": "myalgia",
        "Biguanide": "GI upset",
        "PPI": "headache",
        "SSRI": "sexual dysfunction",
        "SNRI": "nausea",
        "Anticoagulant": "bleeding",
        "DOAC": "bleeding",
        "Antiplatelet": "bleeding",
        "Loop diuretic": "hypokalemia",
        "Thiazide diuretic": "hypokalemia",
        "Opioid analgesic": "constipation",
        "Benzodiazepine": "sedation",
        "SABA": "tremor",
        "Insulin": "hypoglycemia",
        "Fluoroquinolone": "tendon rupture risk",
        "Macrolide": "GI upset",
        "Penicillin": "rash",
        "Corticosteroid": "hyperglycemia",
        "Thyroid hormone": "palpitations if overdosed",
    }
    storage_hints = {
        "Insulin": "refrigerate unopened vials/pens",
        "Vaccine": "store in refrigerator per manufacturer",
    }
    for d in drugs:
        d["brandPrimary"] = primary_brand(d["brand"])
        d["side"] = next(
            (v for k, v in side_by_class.items() if k.lower() in d["drugClass"].lower()),
            "monitor for adverse effects",
        )
        tip = (d.get("ptceTip") or "").lower()
        if "cough" in tip:
            d["side"] = "dry cough"
        if "edema" in tip:
            d["side"] = "peripheral edema"
        if "myalgia" in tip or "muscle" in tip:
            d["side"] = "myalgia"
        if "bleed" in tip:
            d["side"] = "bleeding"
        if "potassium" in tip or "hypokal" in tip:
            d["side"] = "hypokalemia"
        d["storage"] = "controlled room temperature"
        if "insulin" in d["generic"].lower() or "insulin" in d["drugClass"].lower():
            d["storage"] = "refrigerate unopened; room temp while in use per label"
        if any(x in d["generic"].lower() for x in ["etanercept", "adalimumab", "liraglutide", "semaglutide"]):
            d["storage"] = "refrigerate; protect from freezing"
    return drugs


def pick_other(drugs, drug, key, n=3):
    vals = []
    seen = {drug[key]}
    for d in shuffle(drugs):
        if d[key] not in seen:
            seen.add(d[key])
            vals.append(d[key])
        if len(vals) >= n:
            break
    while len(vals) < n:
        vals.append(f"alternative option {len(vals)+1}")
    return vals


# ---------- Knowledge banks ----------

INTERACTIONS = [
    ("warfarin", "ibuprofen", "Increased bleeding risk", "NSAIDs can increase bleeding when combined with warfarin."),
    ("warfarin", "vitamin K-rich leafy greens (large swings)", "Unstable INR", "Vitamin K intake changes can alter warfarin's anticoagulant effect."),
    ("lisinopril", "potassium supplements", "Hyperkalemia", "ACE inhibitors raise potassium; supplements increase hyperkalemia risk."),
    ("lisinopril", "spironolactone", "Hyperkalemia", "ACE inhibitor plus potassium-sparing diuretic can cause dangerous hyperkalemia."),
    ("metformin", "iodinated contrast", "Lactic acidosis risk / hold per protocol", "Metformin is often held around contrast procedures due to lactic acidosis risk."),
    ("simvastatin", "clarithromycin", "Increased myopathy risk", "Strong CYP3A4 inhibitors raise statin levels and muscle toxicity risk."),
    ("atorvastatin", "gemfibrozil", "Increased myopathy risk", "Statin–fibrate combinations increase rhabdomyolysis risk."),
    ("clopidogrel", "omeprazole", "Reduced antiplatelet effect", "Omeprazole can reduce activation of clopidogrel."),
    ("sertraline", "tramadol", "Serotonin syndrome risk", "SSRI with tramadol increases serotonergic toxicity risk."),
    ("fluoxetine", "MAOIs", "Serotonin syndrome / contraindicated", "SSRIs are contraindicated with MAOIs due to serotonin syndrome."),
    ("nitroglycerin", "sildenafil", "Severe hypotension", "Nitrates plus PDE-5 inhibitors can cause life-threatening hypotension."),
    ("methotrexate", "NSAIDs", "Increased methotrexate toxicity", "NSAIDs can reduce methotrexate clearance."),
    ("ciprofloxacin", "dairy/calcium antacids", "Reduced antibiotic absorption", "Divalent cations bind fluoroquinolones and reduce absorption."),
    ("levothyroxine", "calcium carbonate", "Reduced thyroid absorption", "Separate levothyroxine from calcium/iron for absorption."),
    ("digoxin", "amiodarone", "Digoxin toxicity risk", "Amiodarone can raise digoxin levels."),
    ("lithium", "NSAIDs", "Lithium toxicity risk", "NSAIDs can reduce lithium clearance."),
    ("ACE inhibitors", "pregnancy", "Fetal toxicity / contraindicated", "ACE inhibitors are contraindicated in pregnancy."),
    ("isotretinoin", "pregnancy", "Severe teratogenicity", "Isotretinoin is contraindicated in pregnancy (iPLEDGE)."),
    ("pseudoephedrine", "uncontrolled hypertension", "Blood pressure elevation", "Decongestants can worsen hypertension."),
    ("albuterol", "nonselective beta blockers", "Reduced bronchodilation", "Beta blockers can antagonize beta-agonist effect."),
    ("warfarin", "aspirin", "Increased bleeding risk", "Antiplatelet + anticoagulant increases bleed risk."),
    ("SSRIs", "St. John's wort", "Serotonin syndrome risk", "Herbal serotonergic agents plus SSRIs are dangerous."),
    ("MAOIs", "tyramine foods", "Hypertensive crisis", "Tyramine with MAOIs can cause hypertensive crisis."),
    ("potassium chloride", "spironolactone", "Hyperkalemia", "Two potassium-elevating therapies together are high risk."),
    ("theophylline", "ciprofloxacin", "Theophylline toxicity", "Cipro can inhibit theophylline metabolism."),
    ("carbamazepine", "oral contraceptives", "Reduced contraceptive efficacy", "Enzyme inducers can lower OC levels."),
    ("rifampin", "warfarin", "Reduced anticoagulation", "Rifampin induces metabolism and may lower INR."),
    ("amiodarone", "warfarin", "Increased INR / bleeding", "Amiodarone potentiates warfarin."),
    ("verapamil", "simvastatin", "Myopathy risk", "Calcium channel blockers can raise some statin levels."),
    ("linezolid", "SSRIs", "Serotonin syndrome risk", "Linezolid has MAOI activity."),
]

DUPLICATIONS = [
    ("lisinopril", "enalapril", "Both are ACE inhibitors"),
    ("losartan", "valsartan", "Both are ARBs"),
    ("atorvastatin", "rosuvastatin", "Both are HMG-CoA reductase inhibitors (statins)"),
    ("omeprazole", "pantoprazole", "Both are proton pump inhibitors"),
    ("sertraline", "escitalopram", "Both are SSRIs"),
    ("fluoxetine", "paroxetine", "Both are SSRIs"),
    ("metoprolol", "atenolol", "Both are beta blockers"),
    ("amlodipine", "nifedipine", "Both are dihydropyridine calcium channel blockers"),
    ("ibuprofen", "naproxen", "Both are NSAIDs"),
    ("hydrocodone/APAP", "oxycodone/APAP", "Both are opioid-acetaminophen combination analgesics"),
    ("lorazepam", "alprazolam", "Both are benzodiazepines"),
    ("cetirizine", "loratadine", "Both are second-generation antihistamines"),
    ("glipizide", "glyburide", "Both are sulfonylureas"),
    ("sitagliptin", "linagliptin", "Both are DPP-4 inhibitors"),
    ("duloxetine", "venlafaxine", "Both are SNRIs"),
    ("warfarin", "apixaban", "Both are anticoagulants (therapeutic duplication risk)"),
    ("clopidogrel", "aspirin", "Dual antiplatelet therapy may be intentional but is a duplication risk alert"),
    ("furosemide", "bumetanide", "Both are loop diuretics"),
    ("hydrochlorothiazide", "chlorthalidone", "Both are thiazide-type diuretics"),
    ("ranitidine", "famotidine", "Both are H2 blockers (note: ranitidine withdrawn historically)"),
    ("azithromycin", "clarithromycin", "Both are macrolide antibiotics"),
    ("amoxicillin", "ampicillin", "Both are aminopenicillins"),
    ("cyclobenzaprine", "methocarbamol", "Both are skeletal muscle relaxants"),
    ("zolpidem", "eszopiclone", "Both are non-benzodiazepine hypnotics"),
    ("montelukast", "zafirlukast", "Both are leukotriene receptor antagonists"),
    ("tamsulosin", "alfuzosin", "Both are alpha-1 blockers for BPH"),
    ("allopurinol", "febuxostat", "Both reduce uric acid production"),
    ("sumatriptan", "rizatriptan", "Both are triptans for migraine"),
    ("levetiracetam", "lamotrigine", "Both are anticonvulsants (may be combo intentionally)"),
    ("prednisone", "methylprednisolone", "Both are systemic corticosteroids"),
]

STABILITY = [
    ("reconstituted amoxicillin oral suspension", "Generally refrigerate and discard after 14 days unless label states otherwise", "Follow manufacturer beyond-use dating; many amox suspensions are 14 days refrigerated."),
    ("insulin glargine pen in use", "Store at room temperature and discard after the in-use beyond-use date", "In-use insulin pens are kept at room temp for a limited number of days."),
    ("unopened insulin vials", "Store in the refrigerator; do not freeze", "Unopened insulin is refrigerated to maintain potency."),
    ("multi-dose vaccine vial", "Use beyond-use dating after first puncture per manufacturer/CDC guidance", "Opened multi-dose vials have limited beyond-use dating."),
    ("reconstituted cefdinir suspension", "Store as labeled; many are room temperature with a short beyond-use date", "Always follow the specific product label for stability."),
    ("nitroglycerin sublingual tablets", "Keep in original glass container, tightly closed, protect from moisture/heat", "Potency is lost if stored improperly outside the original bottle."),
    ("insulin that was frozen", "Do not use; discard", "Freezing destroys insulin potency/structure."),
    ("oral antibiotic suspension past beyond-use date", "Do not dispense; remake or obtain new stock", "Beyond-use dating protects potency and safety."),
    ("opened insulin aspart vial in use", "Room temperature for manufacturer-specified in-use period", "Check product-specific in-use dating."),
    ("light-sensitive injectable", "Protect from light per package insert", "Some injectables degrade with light exposure."),
    ("reconstituted vancomycin for oral use", "Follow label storage and beyond-use dating after reconstitution", "Reconstituted products have shorter dating."),
    ("refrigerated biologic left at room temp too long", "Quarantine and follow manufacturer excursion guidance / do not guess", "Temperature excursions require manufacturer or pharmacist guidance."),
    ("eye drops after open dating expires", "Do not dispense/use past open-bottle dating", "Ophthalmics often have short dating after opening."),
    ("compounded? SKIP", "SKIP", "SKIP"),  # placeholder filtered
    ("insulin pens shared between patients", "Never share pens even with a new needle", "Blood-borne pathogen risk; pens are single-patient use."),
    ("vaccines stored in freezer when labeled refrigerate only", "Do not use; treat as temperature excursion", "Incorrect storage can inactivate vaccines."),
    ("suspension that settled", "Shake well before measuring/dispensing dose", "Suspensions must be resuspended for accurate dosing."),
    ("opened multi-dose insulin vial dated", "Assign beyond-use date per policy/manufacturer", "Dating after first puncture is required."),
    ("Xalatan (latanoprost) storage after opening", "Often room temperature for limited days after opening; follow label", "Many prostaglandin eye drops have special open dating."),
    ("Varivax / frozen vaccines", "Store frozen until use as labeled", "Some live vaccines require freezer storage."),
]

STORAGE = [
    ("nitroglycerin SL tablets", "Original glass container at room temperature, protected from moisture", "Improper storage reduces nitroglycerin potency."),
    ("unopened Lantus", "Refrigerator; do not freeze", "Unopened basal insulin is refrigerated."),
    ("Schedule II opioids in the pharmacy", "Secure/locked storage with limited access", "Controlled substances require security controls."),
    ("mannitol injection if crystallized", "Warm to dissolve crystals if permitted by label; do not use if insoluble particles remain", "Crystals must be fully dissolved before use."),
    ("Xalatan before opening", "Refrigerate until opened per label", "Many latanoprost products start refrigerated."),
    ("Promethazine injection", "Protect from light; store per label", "Light-sensitive products need protection."),
    ("vaccines in a dorm-style fridge", "Avoid; use pharmaceutical-grade monitored refrigeration", "Dorm fridges have unsafe temperature zones."),
    ("chemotherapy stock", "Segregated storage with hazardous-drug controls", "Hazardous meds need restricted handling/storage."),
    ("insulin during mail-order heat wave", "Use validated cold-chain packaging; investigate excursions", "Heat can destroy insulin."),
    ("reconstituted amoxicillin", "Usually refrigerate; label with beyond-use date", "Storage and dating must be on the label."),
    ("lorazepam injection", "Refrigerate per many product labels", "Some lorazepam injectables require refrigeration."),
    ("suppositories in a hot delivery truck", "May melt; quarantine and evaluate before dispensing", "Heat-labile forms can be ruined."),
    ("light-sensitive nifedipine", "Protect from light", "Some dosage forms degrade in light."),
    ("controlled substances awaiting destruction", "Secure storage until witnessed/authorized destruction", "CS awaiting disposal remain controlled."),
    ("flu vaccine stock", "Refrigerator with continuous temperature monitoring", "Vaccines require cold-chain compliance."),
    ("opened insulin pen labeled for Patient A", "Do not use for another patient", "Single-patient use prevents pathogen transmission."),
    ("room-temperature storage range for most oral solids", "Controlled room temperature (typically 20–25°C / 68–77°F)", "USP controlled room temperature is the standard."),
    ("frozen ice packs touching insulin vials", "Prevent freezing contact; freezing ruins insulin", "Cold packs can freeze product if touching directly."),
    ("desiccants in stock bottles", "Keep containers closed to protect from humidity", "Moisture can degrade solids."),
    ("investigational / restricted REMS drug", "Store per restricted-access program requirements", "Restricted drugs may have special custody rules."),
]

DOSAGE_FORMS = [
    ("albuterol HFA", "Inhalation aerosol", "Metered-dose inhaler delivers aerosolized medication to the lungs."),
    ("insulin glargine", "Subcutaneous injection", "Long-acting insulin is injected subcutaneously, not orally."),
    ("nitroglycerin for acute chest pain", "Sublingual tablet or spray", "SL nitroglycerin is used for rapid angina relief."),
    ("fentanyl patch", "Transdermal", "Patches deliver medication through the skin over time."),
    ("ondansetron ODT", "Orally disintegrating tablet", "ODTs dissolve on the tongue without water."),
    ("budesonide nasal", "Intranasal spray", "Intranasal corticosteroids treat allergic rhinitis."),
    ("medroxyprogesterone depot", "Intramuscular injection", "Depot injections are given IM for long action."),
    ("cyanocobalamin nasal", "Intranasal", "Some B12 products are nasal sprays."),
    ("lactulose", "Oral solution", "Lactulose is commonly an oral liquid."),
    ("timolol eye drops", "Ophthalmic solution", "Timolol ophthalmic treats glaucoma."),
    ("mupirocin ointment", "Topical", "Mupirocin is applied to the skin."),
    ("alendronate counseling point", "Take with water, remain upright", "Bisphosphonates need special administration to protect the esophagus."),
    ("levothyroxine administration", "Empty stomach, consistent timing", "Food and many supplements reduce absorption."),
    ("extended-release nifedipine", "Do not crush/chew ER tablets", "Crushing ER products can cause dose dumping."),
    ("duragesic counseling", "Apply to intact skin; fold and dispose properly after use", "Fentanyl patches have high safety risks."),
    ("inhaled corticosteroid counseling", "Rinse mouth after use", "Rinsing reduces thrush risk."),
    ("eye drop then ointment", "Drops before ointment", "Ointments can block drop absorption if used first."),
    ("suspension antibiotic", "Shake well before each dose", "Suspensions settle and must be mixed."),
    ("buccal tablet", "Place between gum and cheek", "Buccal route uses oral mucosa absorption."),
    ("rectal suppository", "Insert rectally; unwrap first", "Suppositories are not taken orally."),
    ("IV vancomycin", "Intravenous infusion", "Systemic vancomycin for serious infections is IV."),
    ("nicotine gum", "Chew and park technique", "Nicotine gum uses buccal absorption."),
    ("sublingual buprenorphine", "Allow to dissolve under tongue", "SL films/tablets should not be swallowed whole."),
    ("dry powder inhaler", "Inhale forcefully; do not shake like MDI unless labeled", "DPI technique differs from MDI."),
    ("transdermal estrogen patch", "Rotate application sites", "Site rotation reduces skin irritation."),
    ("otic suspension", "Shake and warm in hands; instill in ear", "Ear suspensions need resuspension."),
    ("insulin syringe units", "Use insulin syringe marked in units", "Wrong syringe type causes dosing errors."),
    ("spacer with MDI", "Improves lung delivery / technique", "Spacers help patients use MDIs effectively."),
    ("crushing enteric-coated aspirin", "Do not crush enteric-coated tablets", "Crushing defeats enteric coating."),
    ("long-acting injectable antipsychotic", "Intramuscular depot injection", "LAIs are IM and scheduled differently."),
]

SIDE_FACTS = [
    ("lisinopril", "dry cough", "ACE inhibitors commonly cause a dry cough."),
    ("amlodipine", "peripheral edema", "Dihydropyridine CCBs commonly cause ankle edema."),
    ("atorvastatin", "myalgia", "Statins can cause muscle pain; report severe symptoms."),
    ("metformin", "diarrhea / GI upset", "GI intolerance is the most common metformin issue."),
    ("sertraline", "sexual dysfunction", "SSRIs commonly affect sexual function."),
    ("warfarin", "bleeding / bruising", "Anticoagulants increase bleeding risk."),
    ("furosemide", "hypokalemia", "Loop diuretics waste potassium."),
    ("prednisone", "hyperglycemia / insomnia", "Systemic steroids raise blood sugar and can disrupt sleep."),
    ("ciprofloxacin", "tendon rupture risk", "Fluoroquinolones carry tendon risk warnings."),
    ("amoxicillin", "rash / hypersensitivity", "Penicillins can cause allergic rashes."),
    ("opioids", "constipation", "Opioids slow GI motility."),
    ("diphenhydramine", "sedation / anticholinergic effects", "First-generation antihistamines cause drowsiness."),
    ("tamsulosin", "dizziness / orthostasis", "Alpha blockers can drop blood pressure."),
    ("nitroglycerin", "headache", "Vasodilation commonly causes headache."),
    ("SSRI start", "increased anxiety or insomnia initially", "Early SSRI adverse effects can include activation."),
    ("clindamycin", "C. difficile diarrhea risk", "Clindamycin is strongly associated with C. diff."),
    ("doxycycline", "photosensitivity", "Tetracyclines can increase sunburn risk."),
    ("ACE inhibitor", "angioedema (rare but serious)", "Swelling of face/lips/tongue needs emergency care."),
    ("beta blocker", "bradycardia", "Beta blockers slow heart rate."),
    ("spironolactone", "hyperkalemia / gynecomastia", "Aldosterone antagonists raise potassium."),
    ("montelukast", "mood/behavior changes warning", "Montelukast has neuropsychiatric warnings."),
    ("isotretinoin", "teratogenicity / severe birth defects", "Pregnancy prevention is mandatory."),
    ("metronidazole", "disulfiram-like reaction with alcohol", "Avoid alcohol during/after metronidazole."),
    ("niacin", "flushing", "Niacin commonly causes prostaglandin-mediated flush."),
    ("verapamil", "constipation", "Non-DHP CCBs can cause constipation."),
    ("gabapentin", "sedation / dizziness", "Gabapentinoids cause CNS depression."),
    ("allopurinol", "rash (can be severe)", "Stop and evaluate rashes promptly."),
    ("insulin", "hypoglycemia", "Excess insulin lowers blood glucose dangerously."),
    ("anticholinergics in elderly", "confusion / dry mouth / urinary retention", "Beers criteria concerns for older adults."),
    ("vancomycin infusion too fast", "red man syndrome (infusion reaction)", "Slow the infusion; it is often histamine-related."),
]

FED_DISPOSAL = [
    ("A pharmacy is discarding expired warfarin tablets. Which approach is most appropriate?",
     "Follow hazardous/pharmaceutical waste procedures and do not place in regular trash if prohibited",
     ["Flush all tablets down the public toilet", "Give expired warfarin to staff for home use", "Mix with candy and discard unmarked"],
     "Pharmaceutical waste must follow federal/state hazardous and pharmacy disposal rules."),
    ("Which waste designation is associated with certain acutely hazardous discarded pharmaceuticals (e.g., warfarin packaging residues in some contexts)?",
     "P-list hazardous waste",
     ["Universal waste lamps only", "Schedule V controlled substance", "Class III recall"],
     "EPA P-list covers certain acutely hazardous commercial chemicals/wastes."),
    ("Empty vials of a hazardous drug should be handled how?",
     "As hazardous pharmaceutical waste per policy / not as ordinary trash",
     ["Recycled with paper", "Returned to the patient", "Washed in the public sink only"],
     "Hazardous drug containers are managed under hazardous waste/USP guidance and policy."),
    ("Sharps used for immunizations must be discarded in:",
     "A puncture-resistant sharps container",
     ["A paper bag", "Regular wastebasket", "Recycling bin"],
     "Sharps require engineering controls to prevent needlestick injuries."),
    ("A technician spills a hazardous antineoplastic powder. First priority is to:",
     "Restrict access and follow the hazardous drug spill kit / PPE procedure",
     ["Vacuum with a household vacuum", "Wipe with bare hands", "Ignore if small"],
     "Hazardous spills need spill kits, PPE, and trained response."),
    ("Controlled substances for destruction generally require:",
     "Documented, authorized destruction (often with witness) per DEA/policy",
     ["Tossing in regular trash at closing", "Employee take-home disposal", "No records"],
     "CS destruction is tightly controlled and documented."),
    ("Non-hazardous expired OTC tablets are typically:",
     "Removed from stock and disposed via reverse distribution or approved waste stream",
     ["Sold at discount after expiry", "Crushed into vitamin bottles", "Left on shelf unmarked"],
     "Expired products must be quarantined and not dispensed."),
    ("Which statement about pharmacy sink disposal is correct?",
     "Do not sewer-dispose pharmaceuticals unless specifically allowed; follow waste rules",
     ["All pills may be washed down any drain", "DEA requires drain disposal for CII", "Only antibiotics go in drains"],
     "Sewer disposal is restricted for many pharmaceuticals."),
    ("Trace chemotherapy waste (empty bags/tubing after proper emptying) is often managed as:",
     "Specialty chemotherapy/hazardous waste stream per facility policy",
     ["Food waste", "Paper recycling", "Patient personal property"],
     "Chemo waste streams are segregated."),
    ("A broken glass ampoule goes in:",
     "Sharps or broken-glass disposal container per policy",
     ["Regular trash bag loose", "Pocket for later", "Recycling with bottles"],
     "Broken glass is a sharps-type hazard."),
]

DEA_SCHEDULE = [
    ("oxycodone", "Schedule II", "Oxycodone is a C-II opioid."),
    ("hydrocodone/acetaminophen", "Schedule II", "Hydrocodone combination products are C-II."),
    ("morphine", "Schedule II", "Morphine is C-II."),
    ("methylphenidate", "Schedule II", "Stimulants like methylphenidate are C-II."),
    ("adderall / amphetamine salts", "Schedule II", "Amphetamines are C-II."),
    ("fentanyl", "Schedule II", "Fentanyl is C-II."),
    ("hydromorphone", "Schedule II", "Hydromorphone is C-II."),
    ("methadone", "Schedule II", "Methadone is C-II."),
    ("codeine single-entity", "Schedule II", "Single-entity codeine is C-II."),
    ("acetaminophen/codeine tablets (typical)", "Schedule III", "Many codeine combination tablets are C-III."),
    ("buprenorphine", "Schedule III", "Buprenorphine is generally C-III."),
    ("ketamine", "Schedule III", "Ketamine is C-III."),
    ("anabolic steroids (oxandrolone)", "Schedule III", "Anabolic steroids are C-III."),
    ("alprazolam", "Schedule IV", "Benzodiazepines are C-IV."),
    ("lorazepam", "Schedule IV", "Lorazepam is C-IV."),
    ("zolpidem", "Schedule IV", "Zolpidem is C-IV."),
    ("tramadol", "Schedule IV", "Tramadol is C-IV."),
    ("carisoprodol", "Schedule IV", "Carisoprodol is C-IV."),
    ("modafinil", "Schedule IV", "Modafinil is C-IV."),
    ("phentermine", "Schedule IV", "Phentermine is C-IV."),
    ("pregabalin", "Schedule V", "Pregabalin is C-V federally."),
    ("cough syrup with codeine (qualifying)", "Schedule V", "Certain codeine cough syrups are C-V."),
    ("diphenoxylate/atropine (Lomotil)", "Schedule V", "Lomotil is C-V."),
    ("heroin", "Schedule I", "Schedule I drugs have no accepted medical use federally."),
    ("LSD", "Schedule I", "LSD is Schedule I."),
    ("marijuana (federal)", "Schedule I historically / know federal status tested carefully", "Federal scheduling questions often treat cannabis as C-I; follow current tested outline wording."),
]

CS_RULES = [
    ("Can a Schedule II prescription generally be refilled?",
     "No — a new prescription is required (no refills on C-II)",
     ["Yes, up to 5 refills in 6 months", "Yes, unlimited within 1 year", "Only if the patient requests"],
     "Federal rules: Schedule II prescriptions may not be refilled."),
    ("Schedule III/IV refills are generally limited to:",
     "Up to 5 refills within 6 months of the issue date",
     ["Unlimited refills for 1 year", "No refills ever", "10 refills in 30 days"],
     "C-III and C-IV have 5-refill / 6-month limits."),
    ("DEA Form 222 is used to:",
     "Order Schedule I/II controlled substances",
     ["Report a robbery only", "Bill Medicare", "Document immunization consent"],
     "Form 222 (or electronic CSOS) orders C-I/C-II."),
    ("Significant theft or loss of controlled substances is reported on:",
     "DEA Form 106",
     ["DEA Form 222", "FDA Form 3500 only", "CMS Form 1500"],
     "Form 106 reports theft/significant loss."),
    ("Federal controlled substance inventory is required at least:",
     "Biennially (every 2 years)",
     ["Every 10 years", "Only when inspected", "Never if perpetual inventory exists"],
     "DEA requires a biennial inventory."),
    ("A C-II prescription transferred to another pharmacy:",
     "Generally cannot be transferred like refillable controls (except limited electronic sharing rules/policy)",
     ["Can always be transferred unlimited times", "Transfers are never regulated", "Only OTC transfers apply"],
     "C-II transfer rules are restrictive compared with III–V."),
    ("Partial fill of a Schedule II for a terminally ill / LTC patient:",
     "May be partially filled under specific federal conditions with remaining portion time limits",
     ["Is always illegal", "Converts the drug to C-V", "Requires no documentation"],
     "Federal law allows certain C-II partial fills with documentation."),
    ("When receiving a C-II order, the technician/pharmacist should:",
     "Verify the order against Form 222/CSOS and document receipt quantities",
     ["Skip counting if boxes look sealed", "Store unsigned in will-call", "Delete records after 30 days"],
     "Exact receipt documentation is required."),
    ("Controlled substance prescriptions must include:",
     "Patient name/address, drug info, quantity, directions, prescriber name/address/DEA, signature/date as required",
     ["Only the drug name", "Patient nickname only", "No DEA number needed for C-II"],
     "Federal prescription content requirements apply to controls."),
    ("Take-back of controlled substances from patients should use:",
     "Authorized take-back programs / DEA-authorized collectors",
     ["Employee purses", "Open sharps containers in lobby unsupervised", "Return to stock for resale always"],
     "Patient CS returns go through authorized channels."),
    ("Schedule V refills federally:",
     "May be refilled as authorized; not subject to the same 5/6 limit as III–IV",
     ["Are identical to C-II (no refills)", "Are OTC only always", "Require Form 222 each refill"],
     "C-V refill rules differ from III/IV."),
    ("A forged C-II should lead the pharmacy to:",
     "Not dispense; involve the pharmacist and follow reporting/law enforcement policy",
     ["Fill quickly to avoid confrontation", "Change the quantity quietly", "Ignore if patient is regular"],
     "Suspected forgery is a pharmacist/legal matter."),
    ("Electronic C-II ordering alternative to paper 222 is:",
     "CSOS (Controlled Substance Ordering System)",
     ["MedWatch only", "VAERS only", "REMS iPLEDGE"],
     "CSOS is the electronic 222 system."),
    ("After a break-in with missing oxycodone, the pharmacy must:",
     "Notify DEA (Form 106) and local law enforcement as required and investigate",
     ["Wait one year", "Only tell social media", "Reorder without records"],
     "Theft/loss reporting is mandatory."),
    ("Filing of controlled prescriptions:",
     "Must allow ready retrieval; C-II often filed separately per policy/law",
     ["May be shredded weekly", "Mixed unlabeled with invoices only", "Stored at technician homes"],
     "Recordkeeping/retrieval is a DEA expectation."),
]

REMS_PSE = [
    ("Pseudoephedrine daily federal purchase limit is generally:",
     "3.6 grams per day",
     ["36 grams per day", "0.36 grams per month", "No federal limit"],
     "Combat Methamphetamine Epidemic Act: 3.6 g/day."),
    ("Pseudoephedrine 30-day federal purchase limit is generally:",
     "9 grams per 30 days",
     ["90 grams per 30 days", "0.9 grams per year", "Unlimited with ID"],
     "Federal PSE limit is 9 g/30 days (retail)."),
    ("iPLEDGE is a REMS primarily for:",
     "Isotretinoin",
     ["Amoxicillin", "Lisinopril", "Omeprazole"],
     "iPLEDGE prevents fetal exposure to isotretinoin."),
    ("Clozapine REMS focuses on monitoring for:",
     "Severe neutropenia / ANC monitoring",
     ["Dry cough only", "Photosensitivity only", "Constipation only"],
     "Clozapine REMS centers on absolute neutrophil count monitoring."),
    ("A REMS may require pharmacies to:",
     "Certify/enroll and follow restricted dispensing procedures",
     ["Ignore manufacturer materials", "Counsel without pharmacist involvement always", "Skip documentation"],
     "REMS can include pharmacy certification and documentation."),
    ("Thalidomide / lenalidomide restricted programs exist mainly because of:",
     "Severe teratogenicity",
     ["Bad taste", "High cost alone", "Tablet color"],
     "Embryo-fetal toxicity drives these REMS."),
    ("For PSE sales, purchasers typically must:",
     "Present government ID and be logged in a logbook/electronic system",
     ["Only pay cash with no ID", "Have a C-II prescription always", "Be under 12 years old"],
     "CMEA requires ID and recordkeeping."),
    ("Who should answer clinical questions about a REMS drug's risks?",
     "The pharmacist",
     ["The cashier only", "A delivery driver", "Another patient"],
     "Clinical counseling/risk discussion is pharmacist responsibility."),
    ("A patient wants isotretinoin but authorization is missing in iPLEDGE. What should happen?",
     "Do not dispense until REMS requirements are completed",
     ["Dispense a 90-day supply anyway", "Substitute tretinoin cream quietly", "Override without records"],
     "REMS authorization is required before dispensing."),
    ("TIRF REMS relates to:",
     "Transmucosal immediate-release fentanyl products",
     ["Topical hydrocortisone", "Vitamin D", "Antacids"],
     "TIRF REMS addresses high-potency fentanyl products."),
    ("Pseudoephedrine products are typically sold:",
     "Behind the counter / locked with quantity tracking",
     ["On open candy aisle unrestricted", "Only via DEA Form 222", "Only in hospitals"],
     "PSE is restricted OTC with tracking."),
    ("If REMS documentation cannot be completed, the technician should:",
     "Alert the pharmacist and hold the prescription",
     ["Guess the NDC and fill", "Tell the patient to skip labs forever", "Delete the Rx"],
     "Technicians escalate REMS blocks to the pharmacist."),
]

RECALLS = [
    ("Class I recall means:",
     "Reasonable probability of serious adverse health consequences or death",
     ["Unlikely to cause adverse health consequences", "Only labeling misspelling with no risk", "A DEA schedule change"],
     "Class I is the most serious recall class."),
    ("Class II recall means:",
     "Temporary or medically reversible adverse health consequences possible; serious harm remote",
     ["Certain death for all patients", "No health risk ever", "Vaccine schedule change"],
     "Class II is intermediate severity."),
    ("Class III recall means:",
     "Not likely to cause adverse health consequences",
     ["Always fatal", "Only applies to foods", "Requires Form 222"],
     "Class III is lowest health-risk recall class."),
    ("A pharmacy receives a Class I recall for a lot in stock. Best action:",
     "Quarantine affected lots immediately and follow recall instructions / notify pharmacist",
     ["Continue dispensing until empty", "Relabel and sell", "Ship to another store quietly"],
     "Affected stock is pulled and quarantined."),
    ("Market withdrawal differs from recall in that it often involves:",
     "Minor violation not subject to legal action / firm removes product",
     ["Always Class I death risk", "DEA arrest warrant", "Automatic license revocation"],
     "Withdrawals are for minor issues not meeting recall criteria."),
    ("Recall notifications should be:",
     "Acted on promptly with lot checks and documentation",
     ["Ignored if busy", "Posted only on social media", "Delayed 6 months always"],
     "Timely lot checks protect patients."),
    ("Which identifier is most useful when checking a recall?",
     "NDC, lot number, and expiration",
     ["Patient hair color", "Cash register number only", "Technician initials only"],
     "Recalls specify product identifiers and lots."),
    ("If recalled drug was already dispensed, the pharmacy may need to:",
     "Contact affected patients per pharmacist/policy and recall instructions",
     ["Do nothing ever", "Bill patients extra", "Destroy patient profiles"],
     "Patient notification can be required for serious recalls."),
    ("FDA can request recall, but many recalls are:",
     "Voluntary by the manufacturer",
     ["Always performed by patients", "Only done by DEA", "Impossible for OTC"],
     "Firms often initiate voluntary recalls."),
    ("A mislabeled strength that could cause overdose is most likely:",
     "Class I recall",
     ["Class III only", "Not recallable", "A REMS certificate"],
     "Life-threatening labeling errors are Class I."),
]

DSCSA = [
    ("Under DSCSA, product tracing documentation historically includes the 'T3' elements:",
     "Transaction Information, Transaction History, and Transaction Statement",
     ["Tall Man, Therapeutic index, and Transfer only", "DEA 222, 106, and 41 only", "NDC, AWP, and MAC only"],
     "T3 = TI, TH, and TS for tracing."),
    ("How long must pharmacies retain DSCSA transaction records?",
     "6 years",
     ["6 weeks", "60 days", "6 months"],
     "DSCSA record retention is 6 years."),
    ("A package with a missing/altered unique identifier should be:",
     "Quarantined and investigated as suspect product",
     ["Dispensed quickly before closing", "Relabeled by the technician", "Sold as OTC"],
     "Suspect product is quarantined, not dispensed."),
    ("DSCSA serialization uniquely identifies:",
     "Each prescription drug package (product identifier)",
     ["Only the pharmacy building", "Only the pharmacist license", "Patient Social Security numbers"],
     "Unit-level serialization is core to DSCSA."),
    ("A product identifier typically includes:",
     "NDC, serial number, lot number, and expiration date",
     ["Only the store phone number", "Only the wholesaler logo", "Patient date of birth"],
     "Those four elements form the product identifier data set."),
    ("If a product is confirmed illegitimate, pharmacies must:",
     "Notify FDA and trading partners as required (e.g., Form FDA 3911 process) and not dispense",
     ["Dispense with counseling only", "Return to regular shelf", "Destroy without any documentation"],
     "Illegitimate product triggers notification and quarantine obligations."),
    ("Authorized trading partners under DSCSA include appropriately licensed:",
     "Manufacturers, wholesalers, repackagers, and dispensers",
     ["Any unlicensed online seller", "Patients selling leftovers", "Food trucks"],
     "Only authorized partners may trade prescription drugs."),
    ("Suspect product means:",
     "Reason to believe it may be counterfeit, diverted, stolen, or otherwise unfit",
     ["Any drug on backorder", "Any generic drug", "Any drug with a coupon"],
     "Suspect status triggers investigation/quarantine."),
    ("Pharmacies should verify product identifiers when:",
     "Investigating suspect product / as required in verification scenarios",
     ["Never, serialization is optional forever", "Only for vitamins", "Only for Schedule I"],
     "Verification is part of DSCSA suspect-product response."),
    ("DSCSA primarily helps protect patients from:",
     "Counterfeit, stolen, or otherwise illegitimate prescription drugs",
     ["High blood pressure itself", "All food allergies", "Need for pharmacist counseling"],
     "Supply chain security is the goal."),
    ("Transaction Statement (TS) is best described as:",
     "Seller attestation of DSCSA compliance / authorized transfer",
     ["A patient counseling script", "An immunization VIS", "A DEA inventory form"],
     "TS is the compliance attestation piece of T3."),
    ("A technician notices a 2D barcode that does not match paperwork. Next step:",
     "Do not dispense; quarantine and involve the pharmacist for DSCSA investigation",
     ["Override and fill", "Scratch off the barcode", "Bill insurance twice"],
     "Mismatched identifiers are a suspect-product red flag."),
    ("Enhanced Drug Distribution Security emphasizes:",
     "Electronic, interoperable package-level tracing",
     ["Paper-only forever with no barcodes", "Patient self-tracing only", "Eliminating NDCs"],
     "EDDS moves the supply chain to electronic unit-level tracing."),
    ("Which products are generally in DSCSA scope?",
     "Prescription drug products in the finished supply chain (with listed exceptions)",
     ["All raw farm produce", "Only hermetically sealed foods", "Only medical devices"],
     "DSCSA focuses on prescription drug distribution."),
    ("Quarantine under DSCSA means:",
     "Segregate product so it cannot be dispensed or further distributed pending investigation",
     ["Place on fast-mover shelf", "Ship overnight to patients", "Donate immediately"],
     "Quarantine prevents onward distribution."),
]

HIGH_ALERT = [
    ("Which medication class is high-alert due to hypoglycemia risk?",
     "Insulin",
     ["Bulk fiber laxatives", "Artificial tears", "Sunscreen"],
     "Insulin errors can cause severe hypoglycemia."),
    ("Which anticoagulant is considered high-alert?",
     "Warfarin",
     ["Docusate", "Calcium carbonate", "Multivitamin"],
     "Anticoagulant errors can cause life-threatening bleeding."),
    ("Concentrated electrolytes (e.g., potassium chloride concentrate) are high-alert because:",
     "Improper dosing/route can be fatal",
     ["They taste sweet", "They are always OTC", "They lack NDCs"],
     "Concentrated electrolytes are ISMP high-alert drugs."),
    ("Opioids are high-alert primarily due to risk of:",
     "Respiratory depression / overdose",
     ["Tooth staining only", "Orange urine only", "Hair growth"],
     "Opioid toxicity depresses respiration."),
    ("Chemotherapy agents are high-alert because:",
     "Wrong dose/route can cause severe harm",
     ["They are never hazardous", "They have no side effects", "They are all OTC"],
     "Antineoplastics have narrow safety margins."),
    ("Which pair is a classic LASA risk?",
     "hydralazine / hydroxyzine",
     ["water / saline nasal spray", "bandages / gauze", "paper / labels"],
     "These names look/sound alike and have caused mix-ups."),
    ("Another common LASA pair is:",
     "clonidine / clonazepam",
     ["aspirin / acetaminophen always identical", "gloves / gowns", "bags / vials"],
     "Clonidine and clonazepam are frequently confused."),
    ("Tall Man lettering example for confusion between prednisone/prednisolone is:",
     "predniSONE / predniSOLONE",
     ["PREDnisone only in lowercase", "Removing all vowels", "Writing doses in Roman numerals only"],
     "Tall Man lettering highlights differing letter groups."),
    ("Celexa / Celebrex confusion is dangerous because:",
     "Antidepressant vs NSAID mix-up can harm patients",
     ["Both are identical therapies", "Both are Schedule II", "Both are insulin products"],
     "Different indications/risks make LASA mix-ups harmful."),
    ("Best storage strategy for LASA drugs:",
     "Separate shelf locations and use alerts/Tall Man labels",
     ["Store side-by-side alphabetically always", "Remove all labels", "Keep in unlabeled bins"],
     "Physical separation reduces selection errors."),
    ("Neuromuscular blocking agents are high-alert because:",
     "Accidental administration can cause respiratory arrest",
     ["They treat cough", "They are vitamins", "They are topical only"],
     "NMBs require sequestered storage and warnings."),
    ("Heparin is high-alert due to:",
     "Bleeding risk and concentration mix-ups",
     ["Sweet flavor", "Lack of injectable forms", "Being an antihistamine"],
     "Heparin strength confusions are classic errors."),
]

ERROR_PREVENTION = [
    ("Which decimal notation is safest?",
     "0.2 mg (leading zero present)",
     [".2 mg without leading zero", "2.0 mg trailing zero for a 2 mg intended whole dose", "mg 0.2 with unit missing"],
     "Leading zeros prevent 10-fold errors; avoid trailing zeros on whole numbers."),
    ("Trailing zeros (e.g., 2.0 mg) should be avoided because:",
     "They can be misread as 20 mg",
     ["They improve clarity always", "DEA requires them", "They are mandatory in sigs"],
     "Trailing zeros are error-prone."),
    ("Bar-code scanning at product selection helps:",
     "Verify the NDC/product matches the prescription",
     ["Replace the need for a pharmacist", "Calculate AWP", "Sterilize vials"],
     "Scanning catches wrong-drug/wrong-strength pulls."),
    ("Error-prone abbreviation 'U' for units is dangerous because:",
     "It can be misread as 0 or 4, causing 10-fold insulin errors",
     ["It is preferred by ISMP", "It means micrograms", "It is required on labels"],
     "ISMP recommends writing 'units'."),
    ("'QD' is discouraged because it can be confused with:",
     "QID",
     ["PRN only", "IM only", "NDC"],
     "QD↔QID mix-ups cause dosing frequency errors."),
    ("Independent double-checks are most critical for:",
     "High-alert medications such as insulin and chemotherapy",
     ["Bagging paper bags", "Sorting magazines", "Dusting shelves only"],
     "Double-checks target high-risk processes."),
    ("Tall Man lettering is used to:",
     "Distinguish look-alike drug names",
     ["Indicate refrigerated status only", "Mark DEA schedule", "Replace NDCs"],
     "Tall Man reduces LASA selection errors."),
    ("Using two patient identifiers prevents:",
     "Wrong-patient dispensing",
     ["Expired wholesaler licenses", "DSCSA serialization", "AWP changes"],
     "Name + DOB (or similar) confirms identity."),
    ("Separating inventory of different strengths of the same drug helps prevent:",
     "Wrong-strength selection errors",
     ["Tax filing errors", "Vaccine VIS errors only", "Copay collection"],
     "Look-alike packaging by strength is a common hazard."),
    ("Avoiding apothecary symbols and cryptic abbreviations supports:",
     "Clear communication and fewer misreads",
     ["Faster forgery", "Mandatory Latin only", "Removing directions"],
     "Plain language reduces errors."),
]

PHARM_INTERVENTION = [
    ("A DUR hard stop for severe drug interaction should result in:",
     "Pharmacist review before dispensing",
     ["Technician override without pharmacist", "Ignore and bag", "Ask another patient"],
     "Clinical DUR alerts require pharmacist judgment."),
    ("Patient reports anaphylaxis to penicillin; amoxicillin is prescribed. Technician should:",
     "Alert the pharmacist immediately; do not dispense",
     ["Counsel on taking with milk only", "Fill half the quantity", "Switch to IV without asking"],
     "Allergy conflicts need pharmacist intervention."),
    ("Therapeutic duplication alert for two SSRIs requires:",
     "Pharmacist evaluation",
     ["Automatic filling of both always", "Deleting one silently without pharmacist", "Ignoring if cash pay"],
     "Duplication may be inappropriate."),
    ("Patient asks which OTC cough medicine is best with their prescriptions:",
     "Refer to the pharmacist",
     ["Recommend any product randomly", "Sell the most expensive always without review", "Tell them OTC never interacts"],
     "OTC recommendation is pharmacist scope."),
    ("Suspected adverse drug event reported at pickup:",
     "Involve the pharmacist for assessment/reporting",
     ["Tell patient to double the dose", "Refuse to document", "Only offer store credit"],
     "ADEs need clinical evaluation."),
    ("Pregnancy detected for a patient on isotretinoin:",
     "Stop dispensing and get pharmacist/REMS urgent involvement",
     ["Dispense a larger supply", "Switch to vitamin A freely", "Ignore"],
     "Teratogenic exposure is an emergency clinical issue."),
    ("Insurance rejects for high dose outside limits:",
     "Pharmacist review / possible prior auth or prescriber contact",
     ["Technician invents a new SIG", "Cut tablets without order", "Bill a different patient"],
     "Dose/DUR issues are clinical."),
    ("Patient appears sedated requesting early opioid fill:",
     "Alert pharmacist for possible misuse/diversion concerns",
     ["Fill early without question always", "Provide extra tablets from stock", "Offer alcohol coupons"],
     "Misuse concerns need pharmacist intervention."),
    ("Post-immunization patient feels faint in pharmacy:",
     "Follow pharmacy emergency protocol and involve pharmacist/trained staff",
     ["Send them to drive home immediately without assessment", "Give a second vaccine dose now", "Ignore"],
     "Post-immunization care can require monitoring/response."),
    ("Therapeutic substitution request must be:",
     "Handled per law/policy with pharmacist and often prescriber authorization",
     ["Done silently by cashier", "Forced without records", "Based on technician preference only"],
     "Substitution rules are regulated."),
]

REPORTING = [
    ("FDA MedWatch is used to report:",
     "Adverse events and product quality problems with medications/devices",
     ["Only DEA theft of C-II", "Only employee time theft", "Only vaccine schedule appointments"],
     "MedWatch is FDA safety reporting."),
    ("VAERS is used to report:",
     "Vaccine adverse events",
     ["Only tablet coating issues for OTC antacids", "Pharmacy robbery", "AWP disputes"],
     "VAERS = Vaccine Adverse Event Reporting System."),
    ("A near miss should be:",
     "Reported internally to support CQI even if patient unharmed",
     ["Hidden to protect metrics", "Deleted from memory", "Billed to insurance"],
     "Near-miss reporting prevents future harm."),
    ("Root cause analysis (RCA) aims to:",
     "Identify system failures behind an error, not only blame individuals",
     ["Punish only the technician always", "Increase prices", "Shorten beyond-use dates randomly"],
     "RCA is a systems approach."),
    ("Continuous quality improvement (CQI) in pharmacies includes:",
     "Tracking errors/near misses and implementing preventive changes",
     ["Eliminating all counseling", "Stopping temperature logs", "Removing bar codes"],
     "CQI is ongoing safety improvement."),
    ("ISMP is best known for:",
     "Medication safety alerts and error-prevention resources",
     ["Setting DEA schedules", "Issuing NPI numbers", "Printing money"],
     "ISMP focuses on medication error prevention."),
    ("Product integrity concern (discolored tablets) should be:",
     "Quarantined and reported per pharmacist/FDA processes as appropriate",
     ["Dispensed with a discount", "Recolored with marker", "Crushed into capsules"],
     "Suspect product quality issues are not dispensed."),
    ("Which report fits a serious vaccine allergy after immunization?",
     "VAERS",
     ["Form 222", "CSOS enrollment only", "iPLEDGE pregnancy test log only"],
     "Vaccine adverse events go to VAERS."),
    ("A labeling error caught before patient received medication is:",
     "A near miss / good catch that should still be documented",
     ["Impossible to learn from", "Not an event", "A Class I recall automatically"],
     "Caught-before-reach events still inform CQI."),
    ("MedWatch Form FDA 3500 is commonly associated with:",
     "Voluntary reporting of adverse events by healthcare professionals",
     ["Ordering C-II stock", "PSE logbook pages", "Immunization VIS"],
     "3500 is the MedWatch voluntary form used by professionals."),
]

RX_ERRORS = [
    ("Selecting the wrong patient profile when filling is which error type?",
     "Wrong patient",
     ["Wrong route only", "DSCSA quarantine", "Correct counseling"],
     "Patient selection errors are a major harm pathway."),
    ("Dispensing 100 mg when 10 mg was prescribed is:",
     "Wrong dose/strength error",
     ["Correct fill", "Reverse distribution", "VIS error"],
     "10-fold strength errors are classic."),
    ("Entering quantity 30 instead of 90 causes:",
     "Wrong quantity error",
     ["Wrong route", "Wrong patient identity always", "Class III recall"],
     "Quantity entry mistakes affect days' supply and therapy."),
    ("Labeling eye drops with 'take 1 tablet by mouth' is:",
     "Wrong route / directions error",
     ["Correct NDC verification", "Proper Tall Man use", "Appropriate REMS"],
     "Route mismatches are prescription errors."),
    ("Pulling bupropion XL but labeling as SR without noticing is:",
     "Wrong drug product / wrong release formulation error",
     ["Perfect product selection", "Only a copay issue", "A PSE limit issue"],
     "Different formulations are not interchangeable without authorization."),
    ("Typing SIG '1 tab qid' when prescribed '1 tab qd' is:",
     "Wrong frequency / directions error",
     ["Correct interpretation of qd", "Required for all antibiotics", "A DEA schedule change"],
     "QD vs QID is a dangerous frequency error."),
    ("Missing a drug allergy alert override without pharmacist is related to:",
     "Unsafe processing / failure to prevent a potential wrong-drug harm",
     ["Proper CQI", "Mandatory OTC recommendation", "Correct DSCSA tracing"],
     "Allergy alerts protect against dangerous dispensing."),
    ("Attaching another patient's leaflet/bag to the vial is:",
     "Wrong patient packaging/labeling error",
     ["Acceptable if names are similar", "Required for couples", "A federal recall class"],
     "Bagging errors cause wrong-patient medication use."),
]

INFECTION = [
    ("Before preparing prescriptions / handling oral solids, staff should:",
     "Perform hand hygiene",
     ["Touch face frequently", "Skip washing if busy", "Use food prep sponges on hands only"],
     "Hand hygiene is foundational infection control."),
    ("Counting trays should be cleaned:",
     "Regularly and after counting agents like penicillin/sulfa or hazardous residues per policy",
     ["Never", "Only annually", "With the same rag used on floors only"],
     "Cross-contamination of allergens/hazardous powders is a risk."),
    ("PPE for hazardous drug handling may include:",
     "Gloves (and other PPE per USP/policy)",
     ["No protection ever", "Only sunglasses", "Cloth grocery bags"],
     "Hazardous drugs require PPE."),
    ("A blood spill from a fingerstick should be cleaned with:",
     "Appropriate EPA-registered disinfectant / bloodborne pathogen procedure",
     ["Dry paper only waved in air", "Customer cologne", "Nothing"],
     "BBP spills need proper disinfection."),
    ("Immunization workspaces should be:",
     "Clean, organized, with sharps disposal immediately available",
     ["Cluttered with food", "Shared with hazardous chemo compounding casually", "Without alcohol-based hand rub access"],
     "Safe vaccine delivery needs clean technique and sharps control."),
    ("Reusable counting tools contaminated with penicillin powder should be:",
     "Cleaned thoroughly before reuse for other patients",
     ["Used immediately for the next allergic patient", "Licked clean", "Stored in a pocket"],
     "Allergen cross-contact can harm patients."),
    ("Gloves are not a substitute for:",
     "Hand hygiene",
     ["NDC numbers", "DEA licenses", "Lot numbers"],
     "Hands must still be cleaned; gloves get contaminated."),
    ("Countertops used for prescription preparation should be:",
     "Disinfected per pharmacy schedule/policy",
     ["Never cleaned", "Waxed with food grease", "Covered in used needles"],
     "Environmental cleaning reduces contamination."),
]

SUPPLIES = [
    ("A patient starting an albuterol MDI with poor coordination may need:",
     "A spacer / holding chamber",
     ["An insulin pen needle", "A pill crusher for the inhaler", "A fentanyl patch"],
     "Spacers improve MDI technique."),
    ("Insulin vial dosing commonly requires:",
     "Insulin syringes marked in units",
     ["Tuberculin oral syringes labeled in teaspoons only", "Urine dipsticks", "Tablet splitters only"],
     "Unit insulin syringes match insulin dosing."),
    ("Pen insulin devices require:",
     "Compatible pen needles",
     ["Nebulizer tubing", "Ear syringes", "Rectal syringes"],
     "Pen needles are device-specific supplies."),
    ("Nebulized budesonide requires:",
     "A nebulizer machine/compressor and cup",
     ["A transdermal adhesive", "An inhaler spacer only always", "A pill box only"],
     "Nebulization needs aerosol equipment."),
    ("Immunization administration supplies include:",
     "Appropriate syringe/needle, alcohol prep, bandage, sharps container",
     ["Only a pill bottle", "DEA Form 222", "Amber UV bag only"],
     "Vaccine administration needs injection supplies and sharps disposal."),
    ("Oral liquid pediatric antibiotic dosing accuracy is improved with:",
     "An oral syringe",
     ["A household kitchen spoon only", "An insulin pen", "A spacer"],
     "Oral syringes measure mL accurately."),
    ("A patient on home enteral feeding may need:",
     "Enteral syringes / appropriate administration sets",
     ["Eye dropper for IV bags", "Tablet splitter for patches", "PSE logbook"],
     "Enteral supplies match feeding routes."),
    ("Diabetic patients often need:",
     "Lancets, test strips, and a glucose meter",
     ["Only a spacer", "Only ear plugs", "Only pill crushers"],
     "SMBG supplies support diabetes care."),
    ("Filter needles are used when:",
     "Withdrawing from ampules to remove glass particles",
     ["Measuring oral suspensions for toddlers as first choice", "Scanning NDCs", "Counting tablets"],
     "Ampules require filtration when withdrawing."),
    ("An injectable vaccine drawn from a vial needs:",
     "Needle and syringe of appropriate size/gauge",
     ["A nasal atomizer always", "A topical applicator stick only", "A tablet binder"],
     "IM/SQ vaccines need proper needles/syringes."),
]

NDC_LOT = [
    ("An NDC number identifies:",
     "Manufacturer (labeler), product, and package size",
     ["Patient insurance copay tier", "Pharmacist NPI only", "Store loyalty points"],
     "NDC segments encode labeler-product-package."),
    ("Which check helps avoid dispensing expired stock?",
     "Verify expiration date during fill and before sale",
     ["Ignore dating if sealed", "Use only color of tablets", "Ask patients to guess"],
     "Expiration checks are core dispensing steps."),
    ("Lot numbers are critical during recalls because they:",
     "Identify specific production batches affected",
     ["Replace the need for drug names", "Are the same as DEA numbers", "Are patient medical record numbers"],
     "Recalls target lots."),
    ("If two stock bottles have the same NDC but different lots, they are:",
     "The same product from different batches",
     ["Different active ingredients always", "Different schedules always", "Invalid NDCs"],
     "Lot differs by batch; NDC product identity matches."),
    ("Beyond-use date on a reconstituted suspension differs from manufacturer expiration because:",
     "It reflects dating after reconstitution/opening per rules",
     ["It is always longer than manufacturer expiry", "It only applies to OTC shampoo", "It replaces NDC"],
     "BUD is assigned based on stability after manipulation/opening."),
    ("Scanning an NDC at verification confirms:",
     "The selected package matches the intended product record",
     ["The patient's diagnosis", "The DEA schedule automatically for all OTCs", "Prescriber medical school"],
     "NDC scan is a product identity check."),
    ("A bottle with illegible lot/expiration should be:",
     "Quarantined and not dispensed",
     ["Sold ASAP", "Relabeled with a guessed date", "Given as free sample"],
     "Critical identifiers must be readable."),
    ("Package size differences with same labeler and product codes appear in:",
     "The NDC package segment",
     ["The patient's address", "The SIG code only", "The VIS date"],
     "Package segment distinguishes sizes."),
]

RETURNS = [
    ("Returned-to-stock of a dispensed prescription is allowed only if:",
     "Product integrity can be assured and law/policy permit restocking",
     ["Always, even if opened by patient at home", "Always for controls from any patient home", "Whenever the customer is unhappy, no checks"],
     "Opened patient-used meds generally cannot return to stock."),
    ("Expired unit stock is typically sent to:",
     "Reverse distributor / approved destruction channel",
     ["Will-call for sale", "Employee break room", "Open shelves marked 'cheap'"],
     "Reverse distribution handles many expired pharmaceuticals."),
    ("Credit return to wholesaler generally requires:",
     "Eligible products within wholesaler return policy windows",
     ["Any opened partially used C-II from patients", "Food from the fridge", "No documentation"],
     "Wholesaler credits follow strict rules."),
    ("Patient-returned controlled substances for disposal should go to:",
     "Authorized take-back / DEA-authorized collector processes — not general return-to-stock",
     ["Active dispensing inventory", "Another patient's vial", "Technician personal lockers"],
     "Patient CS returns are not restocked for reuse."),
    ("Non-dispensable damaged stock should be:",
     "Quarantined and processed for return/destruction with documentation",
     ["Tape-repaired and sold", "Left in fast movers", "Dispensed with counseling only"],
     "Damaged stock is removed from saleable inventory."),
    ("Recall stock pulled from shelves is:",
     "Quarantined separately pending return/destruction instructions",
     ["Mixed into vitamin inventory", "Sold to staff", "Shipped to patients faster"],
     "Recalled product must not re-enter dispensing."),
    ("Partial tablets returned by a patient after home use:",
     "Generally cannot be returned to reusable stock",
     ["Are always reusable if counted", "Are DEA Form 222 items automatically", "Become OTC"],
     "Integrity/contamination concerns block restocking."),
    ("Documentation for reverse distribution is important because:",
     "It tracks removal of unusable drugs and supports compliance",
     ["It replaces prescriptions", "It sets patient copays", "It creates Tall Man letters"],
     "Chain of custody/accountability matters."),
]


def gen_medications(drugs):
    out = []
    # 1.1 brand/generic/class — scenario stems, unique per drug+angle
    items_11 = []
    for d in drugs:
        brand = d["brandPrimary"]
        items_11.append(build_q(
            "medications", "1.1",
            f"A patient asks for the generic of {brand}. Which medication should the technician select?",
            d["generic"],
            pick_other(drugs, d, "generic"),
            f"{brand} is a brand for {d['generic']} ({d['drugClass']}).",
        ))
        items_11.append(build_q(
            "medications", "1.1",
            f"Which classification best describes {d['generic']} ({brand})?",
            d["drugClass"],
            pick_other(drugs, d, "drugClass"),
            f"{d['generic']} is classified as a {d['drugClass']}.",
        ))
        items_11.append(build_q(
            "medications", "1.1",
            f"While filling a prescription for {d['generic']}, which brand name is an appropriate match?",
            brand,
            pick_other([{**x, "brandPrimary": primary_brand(x["brand"])} for x in drugs], {**d, "brandPrimary": brand}, "brandPrimary"),
            f"{d['generic']} corresponds to brand name(s) including {d['brand']}.",
        ))
    out.extend(unique_take(items_11, SUB_TARGETS["medications"]["1.1"]))

    # 1.2 duplications
    items = []
    for a, b, why in DUPLICATIONS:
        items.append(build_q(
            "medications", "1.2",
            f"A profile already contains {a}. Which additional medication most clearly represents a therapeutic duplication risk?",
            b,
            ["acetaminophen", "docusate", "artificial tears"],
            why,
        ))
        items.append(build_q(
            "medications", "1.2",
            f"Which pair is the best example of therapeutic duplication?",
            f"{a} and {b}",
            [f"{a} and acetaminophen", f"{b} and polyethylene glycol", "lisinopril and metformin"],
            why,
        ))
    # class-based from drugs
    by_class = defaultdict(list)
    for d in drugs:
        by_class[d["drugClass"]].append(d)
    for cls, group in by_class.items():
        if len(group) >= 2:
            a, b = group[0], group[1]
            items.append(build_q(
                "medications", "1.2",
                f"A DUR alert fires for two {cls} medications: {a['generic']} and {b['generic']}. What is the safety concern?",
                "Therapeutic duplication within the same pharmacologic class",
                ["Therapeutic interchange to an antibiotic", "Mandatory PSE sales limit", "DSCSA quarantine requirement"],
                f"Both agents are {cls}s, so duplication may increase adverse effects without added benefit.",
            ))
    out.extend(unique_take(items, SUB_TARGETS["medications"]["1.2"]))

    # 1.3 interactions
    items = []
    for a, b, risk, why in INTERACTIONS:
        items.append(build_q(
            "medications", "1.3",
            f"A patient takes {a} and is starting {b}. What is the primary interaction concern?",
            risk,
            ["Tooth discoloration only", "Improved sleep guaranteed", "No interaction is possible"],
            why,
        ))
        items.append(build_q(
            "medications", "1.3",
            f"Which combination is most concerning for {risk.lower()}?",
            f"{a} with {b}",
            [f"{a} with docusate", "polyethylene glycol with fiber", "artificial tears with sunscreen"],
            why,
        ))
    out.extend(unique_take(items, SUB_TARGETS["medications"]["1.3"]))

    # 1.4 forms/routes
    items = []
    for drug, form, why in DOSAGE_FORMS:
        items.append(build_q(
            "medications", "1.4",
            f"How is {drug} typically administered/supplied in community or institutional practice?",
            form,
            ["Rectal dry powder inhaler only", "Otic patch for the ear canal only", "Intrathecal chewable tablet"],
            why,
        ))
    for d in drugs[:80]:
        items.append(build_q(
            "medications", "1.4",
            f"A prescription reads '{d['generic']} 10 mg tablets. Take 1 tablet by mouth daily.' What does '10 mg' represent?",
            "The strength of each tablet",
            ["The days' supply only", "The patient's weight", "The NDC package size"],
            "Strength is the amount of drug per dosage unit.",
        ))
    out.extend(unique_take(items, SUB_TARGETS["medications"]["1.4"]))

    # 1.5 sides
    items = []
    for drug, side, why in SIDE_FACTS:
        items.append(build_q(
            "medications", "1.5",
            f"Which adverse effect is most associated with {drug}?",
            side,
            ["Permanent blue skin as the usual effect", "Immediate immunity to all infections", "Complete absence of any risks"],
            why,
        ))
    for d in drugs:
        items.append(build_q(
            "medications", "1.5",
            f"When counseling points are prepared for {d['generic']}, which side effect is most relevant to mention based on class/common effects?",
            d["side"],
            pick_other([{**x, "side": x.get("side", "x")} for x in drugs], d, "side"),
            f"{d['generic']} ({d['drugClass']}) commonly involves: {d['side']}. Tip: {d.get('ptceTip','')}",
        ))
    out.extend(unique_take(items, SUB_TARGETS["medications"]["1.5"]))

    # 1.6 indications
    items = []
    for d in drugs:
        items.append(build_q(
            "medications", "1.6",
            f"A prescription for {d['generic']} ({d['brandPrimary']}) is most consistent with which therapeutic use?",
            d["indication"],
            pick_other(drugs, d, "indication"),
            f"{d['generic']} is used for {d['indication']}.",
        ))
        items.append(build_q(
            "medications", "1.6",
            f"Which medication is indicated for {d['indication'].split(',')[0].strip()} among the following?",
            d["generic"],
            pick_other(drugs, d, "generic"),
            f"{d['generic']} is indicated for {d['indication']}.",
        ))
    out.extend(unique_take(items, SUB_TARGETS["medications"]["1.6"]))

    # 1.7 stability
    items = []
    for item, rule, why in STABILITY:
        if rule == "SKIP":
            continue
        items.append(build_q(
            "medications", "1.7",
            f"What is the most appropriate stability/handling practice for {item}?",
            rule,
            ["Freeze and thaw repeatedly to 'reset' dating", "Use indefinitely if color looks fine", "Ignore beyond-use dates if sealed once"],
            why,
        ))
    # generate numbered variants for insulin dating scenarios
    for days, product in [(28, "many insulin pens in use"), (28, "insulin aspart in-use dating (typical manufacturer window)"), (42, "some insulin detemir in-use windows"), (14, "reconstituted amoxicillin suspension (common)")]:
        items.append(build_q(
            "medications", "1.7",
            f"A label needs a beyond-use date for {product}. Which principle is correct?",
            "Use manufacturer/USP policy dating — commonly a limited number of days after opening/reconstitution",
            ["Always set BUD to 5 years", "Never assign a BUD to liquids", "BUD only applies to cardboard"],
            f"Example windows are often around {days} days, but the product label/policy governs.",
        ))
    out.extend(unique_take(items, SUB_TARGETS["medications"]["1.7"]))

    # 1.8 storage
    items = []
    for item, rule, why in STORAGE:
        items.append(build_q(
            "medications", "1.8",
            f"Which storage statement is most appropriate for {item}?",
            rule,
            ["Store in a sunny car dashboard for potency", "Freeze all oral solids by default", "Leave controlled substances on the counseling counter overnight"],
            why,
        ))
    for d in drugs:
        items.append(build_q(
            "medications", "1.8",
            f"How should {d['generic']} typically be stored in the pharmacy before dispensing?",
            d["storage"],
            ["In the freezer solid", "In direct sunlight uncovered", "Unlabeled in a public waiting area"],
            f"{d['generic']} storage: {d['storage']}.",
        ))
    out.extend(unique_take(items, SUB_TARGETS["medications"]["1.8"]))
    return out


FRAMES = [
    "A technician is processing a prescription. {stem}",
    "At will-call verification, consider this: {stem}",
    "During inventory / receiving workflow: {stem}",
    "A DUR / safety check raises this issue: {stem}",
    "On a timed mock exam item: {stem}",
    "While helping the pharmacist triage workflow: {stem}",
    "A new hire asks about this policy: {stem}",
    "Before releasing the medication to the patient: {stem}",
]


def unique_take(items, n):
    seen = set()
    out = []
    for q in items:
        key = q["question"].lower().strip()
        if key in seen:
            continue
        seen.add(key)
        out.append(q)
        if len(out) >= n:
            break
    i = 0
    frame_i = 0
    while len(out) < n and items:
        base = items[i % len(items)]
        i += 1
        stem = base["question"].rstrip("?")
        # avoid stacking frames repeatedly
        core = stem
        for prefix in (
            "A technician is processing a prescription. ",
            "At will-call verification, consider this: ",
            "During inventory / receiving workflow: ",
            "A DUR / safety check raises this issue: ",
            "On a timed mock exam item: ",
            "While helping the pharmacist triage workflow: ",
            "A new hire asks about this policy: ",
            "Before releasing the medication to the patient: ",
            "Practice vignette ",
        ):
            if core.startswith(prefix):
                core = core[len(prefix):]
                break
        frame = FRAMES[frame_i % len(FRAMES)]
        frame_i += 1
        q = dict(base)
        q["question"] = frame.format(stem=core if core.endswith("?") else core + "?")
        key = q["question"].lower().strip()
        if key in seen:
            continue
        seen.add(key)
        out.append(q)
    return out[:n]


def gen_from_scenario_bank(domain, sub, bank, n):
    items = []
    alts = [
        lambda s: s,
        lambda s: f"Which option is correct for this 2026 PTCE-style item? {s}",
        lambda s: f"Select the best pharmacy technician response. {s}",
        lambda s: f"Based on federal/safety standards, answer the following. {s}",
    ]
    for idx, row in enumerate(bank):
        stem, correct, distractors, why = row
        for j, alt in enumerate(alts):
            items.append(build_q(domain, sub, alt(stem), correct, distractors, why))
        # numeric clinical twist for more unique stems
        items.append(build_q(
            domain, sub,
            f"Case {idx+1} in today's mixed-domain practice set: {stem}",
            correct,
            distractors,
            why,
        ))
    return unique_take(items, n)


def gen_federal():
    out = []
    out += gen_from_scenario_bank("federal", "2.1", FED_DISPOSAL, SUB_TARGETS["federal"]["2.1"])
    items = []
    for drug, sched, why in DEA_SCHEDULE:
        items.append(build_q(
            "federal", "2.2",
            f"Under the federal Controlled Substances Act, {drug} is classified as:",
            sched,
            [s for s in ["Schedule I", "Schedule II", "Schedule III", "Schedule IV", "Schedule V"] if s != sched][:3],
            why,
        ))
        items.append(build_q(
            "federal", "2.2",
            f"A prescription for {drug} is presented. Which DEA schedule governs refill/transfer rules for this medication?",
            sched,
            [s for s in ["Schedule II", "Schedule III", "Schedule IV", "Schedule V"] if s != sched][:3],
            why,
        ))
    # refill rule scenarios
    for stem, correct, bad, why in CS_RULES[:5]:
        items.append(build_q("federal", "2.2", stem, correct, bad, why))
    out += unique_take(items, SUB_TARGETS["federal"]["2.2"])
    out += gen_from_scenario_bank("federal", "2.3", CS_RULES, SUB_TARGETS["federal"]["2.3"])
    out += gen_from_scenario_bank("federal", "2.4", REMS_PSE, SUB_TARGETS["federal"]["2.4"])
    out += gen_from_scenario_bank("federal", "2.5", RECALLS, SUB_TARGETS["federal"]["2.5"])
    out += gen_from_scenario_bank("federal", "2.6", DSCSA, SUB_TARGETS["federal"]["2.6"])
    return out


def gen_safety():
    out = []
    out += gen_from_scenario_bank("patient_safety", "3.1", HIGH_ALERT, SUB_TARGETS["patient_safety"]["3.1"])
    out += gen_from_scenario_bank("patient_safety", "3.2", ERROR_PREVENTION, SUB_TARGETS["patient_safety"]["3.2"])
    out += gen_from_scenario_bank("patient_safety", "3.3", PHARM_INTERVENTION, SUB_TARGETS["patient_safety"]["3.3"])
    out += gen_from_scenario_bank("patient_safety", "3.4", REPORTING, SUB_TARGETS["patient_safety"]["3.4"])
    out += gen_from_scenario_bank("patient_safety", "3.5", RX_ERRORS, SUB_TARGETS["patient_safety"]["3.5"])
    out += gen_from_scenario_bank("patient_safety", "3.6", INFECTION, SUB_TARGETS["patient_safety"]["3.6"])
    return out


def days_supply(qty, dose_each_time, times_per_day):
    daily = dose_each_time * times_per_day
    return qty // daily


def gen_order_entry():
    out = []
    items = []
    sigs = [
        ("b.i.d.", "twice daily"),
        ("t.i.d.", "three times daily"),
        ("q.i.d.", "four times daily"),
        ("q.h.s.", "at bedtime"),
        ("a.c.", "before meals"),
        ("p.c.", "after meals"),
        ("p.r.n.", "as needed"),
        ("p.o.", "by mouth"),
        ("s.l.", "sublingual"),
        ("i.m.", "intramuscular"),
        ("i.v.", "intravenous"),
        ("o.d.", "right eye"),
        ("o.s.", "left eye"),
        ("o.u.", "both eyes"),
        ("a.d.", "right ear"),
        ("a.s.", "left ear"),
        ("a.u.", "both ears"),
        ("q4h", "every 4 hours"),
        ("q6h", "every 6 hours"),
        ("q8h", "every 8 hours"),
        ("q12h", "every 12 hours"),
        ("stat", "immediately"),
        ("ung.", "ointment"),
        ("gtt", "drop"),
        ("NR", "no refills"),
    ]
    for code, meaning in sigs:
        items.append(build_q(
            "order_entry", "4.1",
            f"On a prescription SIG, what does '{code}' mean?",
            meaning,
            [m for _, m in sigs if m != meaning][:3],
            f"{code} means {meaning}.",
        ))

    # Unique calculation items
    calc_cases = []
    for qty in range(10, 120, 2):
        for times in (1, 2, 3, 4):
            dose = 1
            if qty % (dose * times) == 0:
                ds = days_supply(qty, dose, times)
                if 2 <= ds <= 90:
                    calc_cases.append((qty, dose, times, ds))
    RNG.shuffle(calc_cases)
    for qty, dose, times, ds in calc_cases[:120]:
        freq = {1: "once daily", 2: "twice daily", 3: "three times daily", 4: "four times daily"}[times]
        wrong = sorted({max(1, ds - 5), ds + 5, ds * times, qty // max(1, times - 1) if times > 1 else ds + 10} - {ds})
        while len(wrong) < 3:
            wrong.append(ds + 7 + len(wrong))
        items.append(build_q(
            "order_entry", "4.1",
            f"A prescription is written for 1 tablet {freq}. The pharmacy dispenses {qty} tablets. What is the days' supply?",
            f"{ds} days",
            [f"{w} days" for w in wrong[:3]],
            f"Days' supply = quantity ÷ tablets per day = {qty} ÷ {times} = {ds} days.",
            True,
        ))

    # mL calculations for liquids
    for i, (dose_ml, times, days) in enumerate([
        (5, 2, 10), (5, 3, 7), (10, 2, 5), (2.5, 2, 10), (7.5, 2, 10),
        (5, 4, 5), (15, 1, 10), (5, 1, 14), (10, 3, 7), (1, 4, 10),
        (12.5, 2, 8), (3, 3, 10), (20, 2, 5), (4, 2, 15), (8, 2, 7),
        (5, 2, 14), (10, 2, 10), (2, 3, 10), (6, 2, 10), (9, 3, 5),
    ]):
        total = dose_ml * times * days
        items.append(build_q(
            "order_entry", "4.1",
            f"A liquid is dosed at {dose_ml} mL {times} times daily for {days} days. What total volume should be dispensed?",
            f"{total:g} mL",
            [f"{total + 10:g} mL", f"{total - dose_ml:g} mL", f"{dose_ml * days:g} mL"],
            f"Total mL = {dose_ml} × {times} × {days} = {total:g} mL.",
            True,
        ))

    conversions = [
        ("How many mL are in 1 teaspoon?", "5 mL", ["15 mL", "30 mL", "3 mL"], "1 tsp = 5 mL."),
        ("How many mL are in 1 tablespoon?", "15 mL", ["5 mL", "30 mL", "10 mL"], "1 tbsp = 15 mL."),
        ("How many mL are in 1 fluid ounce (approx.)?", "30 mL", ["15 mL", "5 mL", "100 mL"], "1 fl oz ≈ 30 mL."),
        ("How many mL are in 1 pint (approx.)?", "473 mL", ["240 mL", "1000 mL", "30 mL"], "1 pint ≈ 473 mL."),
        ("How many grams are in 1 kilogram?", "1000 g", ["100 g", "10 g", "500 g"], "1 kg = 1000 g."),
        ("How many milligrams are in 1 gram?", "1000 mg", ["100 mg", "10 mg", "500 mg"], "1 g = 1000 mg."),
        ("How many micrograms are in 1 milligram?", "1000 mcg", ["100 mcg", "10 mcg", "500 mcg"], "1 mg = 1000 mcg."),
        ("Roman numeral 'iss' in traditional pharmacy notation often means:", "1.5", ["2", "0.5", "15"], "iss commonly denotes one and one-half."),
        ("Roman numeral 'X' equals:", "10", ["5", "50", "100"], "X = 10."),
        ("Roman numeral 'V' equals:", "5", ["4", "10", "15"], "V = 5."),
        ("A 1:100 solution means:", "1 g in 100 mL (w/v) for solids, or analogous ratio strength", ["100 g in 1 mL always", "1 mg in 100 L only", "No concentration meaning"], "Ratio strength expresses parts of solute to total."),
        ("C1V1 = C2V2 is used for:", "Dilution / concentration calculations", ["DEA form numbering", "Days' supply only", "NDC package segments"], "Alligation/dilution uses C1V1=C2V2."),
    ]
    for stem, correct, bad, why in conversions:
        items.append(build_q("order_entry", "4.1", stem, correct, bad, why, True))

    for wt, dose_mg_kg, times in [(10, 15, 1), (20, 10, 2), (12, 5, 3), (25, 8, 2), (18, 12, 1), (30, 5, 2), (8, 20, 1), (15, 10, 2)]:
        mg_per_dose = wt * dose_mg_kg
        daily = mg_per_dose * times
        items.append(build_q(
            "order_entry", "4.1",
            f"A child weighs {wt} kg. The order is {dose_mg_kg} mg/kg/dose given {times} time(s) daily. How many mg are in each dose?",
            f"{mg_per_dose:g} mg",
            [f"{daily:g} mg", f"{wt:g} mg", f"{dose_mg_kg:g} mg"],
            f"mg/dose = {dose_mg_kg} × {wt} = {mg_per_dose:g} mg.",
            True,
        ))

    for pct, ml in [(1, 100), (2, 50), (0.9, 1000), (5, 20), (10, 30)]:
        grams = pct / 100 * ml
        items.append(build_q(
            "order_entry", "4.1",
            f"How many grams of drug are in {ml:g} mL of a {pct:g}% w/v solution?",
            f"{grams:g} g",
            [f"{pct:g} g", f"{ml:g} g", f"{grams*10:g} g"],
            f"g = (%/100) × mL = ({pct:g}/100) × {ml:g} = {grams:g} g.",
            True,
        ))

    out += unique_take(items, SUB_TARGETS["order_entry"]["4.1"])
    out += gen_from_scenario_bank("order_entry", "4.2", SUPPLIES, SUB_TARGETS["order_entry"]["4.2"])
    out += gen_from_scenario_bank("order_entry", "4.3", NDC_LOT, SUB_TARGETS["order_entry"]["4.3"])
    out += gen_from_scenario_bank("order_entry", "4.4", RETURNS, SUB_TARGETS["order_entry"]["4.4"])
    return out


def assign_ids(questions):
    counters = defaultdict(int)
    out = []
    for q in questions:
        prefix = {"medications": "med", "federal": "fed", "patient_safety": "safe", "order_entry": "ord"}[q["domain"]]
        counters[q["subArea"]] += 1
        q = dict(q)
        q["id"] = f"{prefix}-{q['subArea']}-{counters[q['subArea']]:04d}"
        out.append(q)
    return out


def validate(questions):
    ids = set()
    stems = []
    for q in questions:
        assert q["id"] not in ids, q["id"]
        ids.add(q["id"])
        assert len(q["options"]) == 4, q["id"]
        assert 0 <= q["correctIndex"] <= 3
        assert len(set(q["options"])) == 4, (q["id"], q["options"])
        stems.append(q["question"].lower().strip())
        assert "blue urine" not in " ".join(q["options"]).lower()
    dups = len(stems) - len(set(stems))
    counts = Counter(q["domain"] for q in questions)
    print("Total", len(questions))
    print("Domain counts", dict(counts))
    print("Duplicate stems", dups)
    print("Unique stem ratio", round(1 - dups / len(stems), 3))
    sub = Counter(q["subArea"] for q in questions)
    for k in sorted(sub):
        print(f"  {k}: {sub[k]}")
    assert len(questions) == 1050
    for dom, n in TARGETS.items():
        assert counts[dom] == n, (dom, counts[dom], n)
    assert dups < 80, f"too many duplicate stems: {dups}"
    brand_templates = sum(1 for s in stems if s.startswith("what is the brand name for"))
    assert brand_templates < 5, brand_templates


def main():
    drugs = load_drugs()
    questions = []
    questions += gen_medications(drugs)
    questions += gen_federal()
    questions += gen_safety()
    questions += gen_order_entry()

    by_dom = defaultdict(list)
    for q in questions:
        by_dom[q["domain"]].append(q)

    final = []
    for dom, target in TARGETS.items():
        pool = by_dom[dom]
        if len(pool) < target:
            raise SystemExit(f"{dom} only has {len(pool)} < {target}")
        seen = set()
        chosen = []
        for q in pool:
            k = q["question"].lower().strip()
            if k in seen:
                continue
            seen.add(k)
            chosen.append(q)
            if len(chosen) >= target:
                break
        i = 0
        while len(chosen) < target:
            base = pool[i % len(pool)]
            i += 1
            q = dict(base)
            q["question"] = f"Practice vignette {len(chosen)+1}: {base['question']}"
            if q["question"].lower() in seen:
                continue
            seen.add(q["question"].lower())
            chosen.append(q)
        final.extend(chosen[:target])

    final = assign_ids(final)
    validate(final)
    OUT.write_text(json.dumps(final, indent=2) + "\n")
    print("Wrote", OUT)
    print("Sample stems:")
    for q in final[:5]:
        print("-", q["question"][:140])
    for q in [x for x in final if x["subArea"] == "2.6"][:2]:
        print("DSCSA:", q["question"][:140])


if __name__ == "__main__":
    main()
