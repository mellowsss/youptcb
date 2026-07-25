#!/usr/bin/env python3
"""Generate 2026 PTCE-aligned pharmacy math practice items."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "pharmacy-math.json"


def item(i, title, category, formula, prompt, answer, distractors, explanation, tip):
    return {
        "id": f"math-{i:03d}",
        "title": title,
        "category": category,
        "formula": formula,
        "prompt": prompt,
        "answer": answer,
        "distractors": distractors,
        "explanation": explanation,
        "ptceTip": tip,
    }


def main():
    items = []
    n = 1

    # Days' supply
    for qty, times, label in [
        (30, 1, "once daily"),
        (60, 2, "twice daily"),
        (90, 3, "three times daily"),
        (120, 4, "four times daily"),
        (28, 1, "once daily"),
        (56, 2, "twice daily"),
        (84, 3, "t.i.d."),
        (14, 1, "daily"),
        (21, 3, "three times daily"),
        (40, 2, "b.i.d."),
        (100, 2, "twice daily"),
        (45, 3, "t.i.d."),
        (15, 1, "q.d."),
        (36, 3, "three times daily"),
        (48, 4, "q.i.d."),
    ]:
        ds = qty // times
        wrong = [f"{ds + 5} days", f"{ds - 2 if ds > 2 else ds + 3} days", f"{qty} days"]
        items.append(item(
            n, f"Days' supply · {qty} tabs {label}", "Days' Supply",
            "Days' supply = quantity ÷ doses per day",
            f"A patient takes 1 tablet {label}. Quantity dispensed is {qty}. What is the days' supply?",
            f"{ds} days", wrong,
            f"{qty} ÷ {times} = {ds} days.",
            "Always convert the SIG to doses/day before dividing.",
        )); n += 1

    # 2 tablets at a time
    for qty, dose, times in [(60, 2, 1), (60, 2, 2), (90, 3, 1), (120, 2, 3), (30, 2, 1)]:
        daily = dose * times
        ds = qty // daily
        items.append(item(
            n, f"Days' supply · {dose} tabs × {times}/day", "Days' Supply",
            "Days' supply = quantity ÷ (dose × frequency)",
            f"SIG: take {dose} tablets {times} time(s) daily. Dispense {qty}. Days' supply?",
            f"{ds} days", [f"{qty // times} days", f"{qty // dose} days", f"{daily} days"],
            f"Daily use = {dose}×{times} = {daily}; {qty}÷{daily} = {ds}.",
            "Watch for multi-tablet doses — don't treat every fill as 1 tab/day.",
        )); n += 1

    # Quantity to dispense
    for dose_ml, times, days in [
        (5, 2, 10), (5, 3, 7), (10, 2, 5), (2.5, 2, 10), (7.5, 2, 10),
        (5, 4, 5), (15, 1, 10), (5, 1, 14), (10, 3, 7), (1, 4, 10),
        (12.5, 2, 8), (3, 3, 10), (20, 2, 5), (4, 2, 15),
    ]:
        total = dose_ml * times * days
        items.append(item(
            n, f"Liquid quantity · {dose_ml} mL", "Quantity to Dispense",
            "Total volume = dose × frequency × days",
            f"Dose {dose_ml} mL {times}× daily for {days} days. How much volume to dispense?",
            f"{total:g} mL", [f"{total + 10:g} mL", f"{dose_ml * days:g} mL", f"{total - dose_ml:g} mL"],
            f"{dose_ml} × {times} × {days} = {total:g} mL.",
            "Round up to an available bottle size only after calculating exact need.",
        )); n += 1

    for tabs_dose, times, days in [(1, 2, 30), (2, 1, 30), (1, 3, 14), (2, 2, 10), (1, 4, 7)]:
        qty = tabs_dose * times * days
        items.append(item(
            n, f"Tablet quantity · {days} days", "Quantity to Dispense",
            "Quantity = tablets per dose × times/day × days",
            f"Take {tabs_dose} tablet(s) {times}× daily for {days} days. Quantity to dispense?",
            f"{qty} tablets", [f"{tabs_dose * days} tablets", f"{times * days} tablets", f"{qty + 10} tablets"],
            f"{tabs_dose}×{times}×{days} = {qty}.",
            "Quantity and days' supply are inverse relationships — know both.",
        )); n += 1

    # Conversions
    conversions = [
        ("1 teaspoon (tsp) = ? mL", "5 mL", ["15 mL", "30 mL", "3 mL"], "1 tsp = 5 mL", "Household spoons vary — prefer oral syringes."),
        ("1 tablespoon (tbsp) = ? mL", "15 mL", ["5 mL", "30 mL", "10 mL"], "1 tbsp = 15 mL", "3 tsp = 1 tbsp = 15 mL."),
        ("1 fluid ounce ≈ ? mL", "30 mL", ["15 mL", "5 mL", "100 mL"], "1 fl oz ≈ 30 mL", "Common pharmacy approx: 30 mL/oz."),
        ("1 pint ≈ ? mL", "473 mL", ["240 mL", "1000 mL", "30 mL"], "1 pint ≈ 473 mL", "Memorize pint/quart conversions for the PTCE."),
        ("1 quart ≈ ? mL", "946 mL", ["473 mL", "500 mL", "1000 mL"], "1 quart ≈ 946 mL", "1 quart = 2 pints."),
        ("1 kg = ? g", "1000 g", ["100 g", "10 g", "500 g"], "1 kg = 1000 g", "Metric moves by powers of 1000."),
        ("1 g = ? mg", "1000 mg", ["100 mg", "10 mg", "500 mg"], "1 g = 1000 mg", "Don't confuse mg and mcg."),
        ("1 mg = ? mcg", "1000 mcg", ["100 mcg", "10 mcg", "500 mcg"], "1 mg = 1000 mcg", "mcg errors are classic 1000× mistakes."),
        ("2.2 lb ≈ ? kg", "1 kg", ["2 kg", "0.5 kg", "10 kg"], "1 kg ≈ 2.2 lb", "Divide pounds by 2.2 for kg."),
        ("A patient weighs 154 lb. Approx kg?", "70 kg", ["154 kg", "35 kg", "100 kg"], "154 ÷ 2.2 = 70 kg", "Weight-based dosing needs kg."),
        ("1 grain (gr) ≈ ? mg (approx)", "65 mg", ["5 mg", "100 mg", "30 mg"], "1 gr ≈ 65 mg (often 60–65)", "Know grain approximations for older orders."),
        ("How many mL in 8 fl oz?", "240 mL", ["80 mL", "120 mL", "480 mL"], "8 × 30 = 240 mL", "Multiply ounces by ~30."),
        ("500 mL = ? L", "0.5 L", ["5 L", "50 L", "0.05 L"], "Divide mL by 1000", "Move decimal 3 places."),
        ("0.25 g = ? mg", "250 mg", ["25 mg", "2.5 mg", "2500 mg"], "0.25 × 1000 = 250 mg", "g→mg multiply by 1000."),
        ("2500 mcg = ? mg", "2.5 mg", ["25 mg", "0.25 mg", "250 mg"], "2500 ÷ 1000 = 2.5 mg", "mcg→mg divide by 1000."),
    ]
    for prompt, answer, distractors, expl, tip in conversions:
        items.append(item(
            n, prompt.split("=")[0].strip()[:40], "Conversions",
            "Use standard pharmacy conversion factors",
            prompt, answer, distractors, expl, tip,
        )); n += 1

    # Ratio & proportion
    for have_mg, have_ml, want_mg in [(250, 5, 100), (500, 10, 250), (125, 5, 75), (40, 1, 10), (80, 2, 20), (100, 2, 50), (200, 5, 120), (10, 1, 4)]:
        want_ml = want_mg * have_ml / have_mg
        items.append(item(
            n, f"Proportion · {have_mg} mg/{have_ml} mL", "Ratio & Proportion",
            "want/have = x / volume → cross multiply",
            f"Stock is {have_mg} mg / {have_ml} mL. How many mL provide {want_mg} mg?",
            f"{want_ml:g} mL", [f"{want_ml*2:g} mL", f"{have_ml:g} mL", f"{want_mg:g} mL"],
            f"({want_mg}/{have_mg}) × {have_ml} = {want_ml:g} mL.",
            "Set up ratios carefully and keep units aligned.",
        )); n += 1

    # Percent strength
    for pct, ml in [(1, 100), (2, 50), (0.9, 1000), (5, 20), (10, 30), (0.45, 1000), (2.5, 40), (0.1, 10)]:
        grams = pct / 100 * ml
        items.append(item(
            n, f"{pct:g}% w/v in {ml:g} mL", "Percent Strength",
            "g = (%/100) × mL for % w/v",
            f"How many grams of drug are in {ml:g} mL of a {pct:g}% w/v solution?",
            f"{grams:g} g", [f"{pct:g} g", f"{ml:g} g", f"{grams*10:g} g"],
            f"({pct:g}/100) × {ml:g} = {grams:g} g.",
            "% w/v means grams per 100 mL.",
        )); n += 1

    items.append(item(
        n, "Normal saline percent", "Percent Strength",
        "% w/v = g/100 mL",
        "0.9% sodium chloride contains how many grams of NaCl per 100 mL?",
        "0.9 g", ["9 g", "0.09 g", "90 g"],
        "0.9% w/v = 0.9 g per 100 mL.",
        "NS is 0.9% NaCl — a high-yield percent example.",
    )); n += 1

    # Dilutions C1V1=C2V2
    for c1, v1, c2 in [(10, 5, 2), (20, 10, 5), (100, 2, 10), (50, 4, 10), (25, 8, 5), (40, 5, 8), (5, 20, 1)]:
        v2 = c1 * v1 / c2
        items.append(item(
            n, f"Dilution · {c1}% → {c2}%", "Dilutions",
            "C1V1 = C2V2",
            f"How many total mL of {c2}% solution can be made from {v1} mL of {c1}% stock?",
            f"{v2:g} mL", [f"{v1:g} mL", f"{c1:g} mL", f"{v2/2:g} mL"],
            f"V2 = (C1×V1)/C2 = ({c1}×{v1})/{c2} = {v2:g} mL.",
            "Solve for the unknown; don't mix up stock vs final volume.",
        )); n += 1

    # cleaner dilution prompts
    for c1, v2, c2 in [(10, 100, 1), (20, 50, 5), (50, 200, 10), (100, 50, 20)]:
        v1 = c2 * v2 / c1
        items.append(item(
            n, f"Stock volume for {c2}% final", "Dilutions",
            "C1V1 = C2V2 → V1 = (C2V2)/C1",
            f"You need {v2:g} mL of {c2}% solution. Stock is {c1}%. How much stock is required?",
            f"{v1:g} mL", [f"{v2:g} mL", f"{c1:g} mL", f"{v1*2:g} mL"],
            f"V1 = ({c2}×{v2})/{c1} = {v1:g} mL; qs with diluent to {v2:g} mL.",
            "After calculating stock volume, qs (quantity sufficient) with diluent.",
        )); n += 1

    # Weight-based
    for wt, mgkg, times in [(10, 15, 1), (20, 10, 2), (12, 5, 3), (25, 8, 2), (18, 12, 1), (30, 5, 2), (8, 20, 1), (15, 10, 2), (22, 7, 2), (40, 2, 1)]:
        per_dose = wt * mgkg
        items.append(item(
            n, f"mg/kg dose · {wt} kg", "Weight-Based Dosing",
            "mg/dose = mg/kg × weight(kg)",
            f"Child weighs {wt} kg. Order: {mgkg} mg/kg/dose given {times}× daily. mg per dose?",
            f"{per_dose:g} mg", [f"{per_dose * times:g} mg", f"{wt:g} mg", f"{mgkg:g} mg"],
            f"{mgkg} × {wt} = {per_dose:g} mg per dose.",
            "Convert lb→kg first if weight is in pounds.",
        )); n += 1

    # IV flow rates
    for vol, hours in [(1000, 8), (500, 4), (250, 2), (1000, 10), (100, 1), (750, 6), (500, 5), (200, 2)]:
        mlhr = vol / hours
        items.append(item(
            n, f"IV mL/hr · {vol} mL / {hours} hr", "IV Flow Rates",
            "mL/hr = total volume ÷ hours",
            f"Infuse {vol} mL over {hours} hours. What is the rate in mL/hr?",
            f"{mlhr:g} mL/hr", [f"{vol:g} mL/hr", f"{hours:g} mL/hr", f"{mlhr*2:g} mL/hr"],
            f"{vol} ÷ {hours} = {mlhr:g} mL/hr.",
            "Pump rates are usually mL/hr on the PTCE.",
        )); n += 1

    for vol, min_, gtt in [(100, 60, 15), (50, 30, 20), (100, 30, 10), (250, 120, 15), (100, 45, 20)]:
        rate = vol * gtt / min_
        items.append(item(
            n, f"gtt/min · {gtt} drop factor", "IV Flow Rates",
            "gtt/min = (mL × drop factor) ÷ minutes",
            f"Infuse {vol} mL over {min_} minutes with a {gtt} gtt/mL set. Drops per minute?",
            f"{rate:g} gtt/min", [f"{vol:g} gtt/min", f"{gtt:g} gtt/min", f"{rate*2:g} gtt/min"],
            f"({vol} × {gtt}) ÷ {min_} = {rate:g} gtt/min.",
            "Round to a whole drop when required by the question.",
        )); n += 1

    # Sig & Roman
    sigs = [
        ("b.i.d.", "twice daily"),
        ("t.i.d.", "three times daily"),
        ("q.i.d.", "four times daily"),
        ("q.h.s.", "at bedtime"),
        ("a.c.", "before meals"),
        ("p.c.", "after meals"),
        ("p.o.", "by mouth"),
        ("p.r.n.", "as needed"),
        ("q4h", "every 4 hours"),
        ("q6h", "every 6 hours"),
        ("q8h", "every 8 hours"),
        ("q12h", "every 12 hours"),
        ("stat", "immediately"),
        ("gtt", "drop"),
        ("ung.", "ointment"),
    ]
    meanings = [m for _, m in sigs]
    for code, meaning in sigs:
        distractors = [m for m in meanings if m != meaning][:3]
        items.append(item(
            n, f"SIG {code}", "Sig & Roman Numerals",
            "Translate SIG abbreviations before calculating",
            f"What does the SIG abbreviation '{code}' mean?",
            meaning, distractors,
            f"{code} means {meaning}.",
            "Wrong SIG translation causes wrong days' supply.",
        )); n += 1

    romans = [("X", "10"), ("V", "5"), ("ii", "2"), ("iii", "3"), ("iv", "4"), ("vi", "6"), ("iss", "1.5"), ("vii", "7"), ("ix", "9"), ("xx", "20")]
    for r, val in romans:
        others = [v for _, v in romans if v != val][:3]
        items.append(item(
            n, f"Roman {r}", "Sig & Roman Numerals",
            "Convert Roman numerals in older prescriptions",
            f"In pharmacy notation, Roman numeral '{r}' equals?",
            val, others,
            f"{r} = {val}.",
            "iss = 1.5 appears on classic exam items.",
        )); n += 1

    # Mixed applied
    items.append(item(
        n, "Amoxicillin suspension days' supply", "Days' Supply",
        "Days' supply = total mL ÷ mL per day",
        "150 mL bottle; SIG 5 mL t.i.d. Days' supply?",
        "10 days", ["15 days", "30 days", "5 days"],
        "Daily use = 5×3 = 15 mL; 150÷15 = 10 days.",
        "Liquid days' supply uses mL/day, not tablet counts.",
    )); n += 1

    items.append(item(
        n, "Insulin units days' supply", "Days' Supply",
        "Days' supply = units in vial ÷ units per day",
        "A 10 mL vial of U-100 insulin (1000 units). Patient uses 40 units daily. Days' supply?",
        "25 days", ["10 days", "40 days", "100 days"],
        "1000 ÷ 40 = 25 days.",
        "U-100 means 100 units/mL — 10 mL = 1000 units.",
    )); n += 1

    items.append(item(
        n, "Eye drop quantity estimate", "Quantity to Dispense",
        "Approx 20 drops/mL for many solutions (estimate)",
        "Using 20 drops/mL, how many mL are needed for 2 drops OU q.i.d. for 7 days?",
        "5.6 mL", ["2.8 mL", "14 mL", "7 mL"],
        "2 drops × 2 eyes × 4 × 7 = 112 drops; 112/20 = 5.6 mL.",
        "OU = both eyes; include both eyes in the count.",
    )); n += 1

    OUT.write_text(json.dumps(items, indent=2) + "\n")
    cats = {}
    for x in items:
        cats[x["category"]] = cats.get(x["category"], 0) + 1
    print(f"Wrote {len(items)} math items to {OUT}")
    for k, v in sorted(cats.items()):
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
