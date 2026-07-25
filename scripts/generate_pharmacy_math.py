#!/usr/bin/env python3
"""Generate 2026 PTCE-aligned pharmacy math practice items."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "pharmacy-math.json"


def item(i, title, category, formula, prompt, answer, distractors, explanation, tip, difficulty="standard"):
    return {
        "id": f"math-{i:03d}",
        "title": title,
        "category": category,
        "difficulty": difficulty,
        "formula": formula,
        "prompt": prompt,
        "answer": answer,
        "distractors": distractors,
        "explanation": explanation,
        "ptceTip": tip,
    }


def fmt(x):
    """Pretty number formatting without trailing .0 noise."""
    if abs(x - round(x)) < 1e-9:
        return str(int(round(x)))
    return f"{x:.4g}".rstrip("0").rstrip(".") if "." in f"{x:.4g}" else f"{x:.4g}"


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

    # -------- HARD: IV flow rates (multi-step / conversions) --------
    hard_iv_mlhr = [
        # (volume_mL, time_value, time_unit hours|minutes, note)
        (1000, 6, "hours"),
        (1000, 12, "hours"),
        (500, 6, "hours"),
        (250, 90, "minutes"),
        (100, 45, "minutes"),
        (1000, 480, "minutes"),
        (750, 5, "hours"),
        (125, 60, "minutes"),
        (50, 30, "minutes"),
        (2000, 24, "hours"),
        (1500, 10, "hours"),
        (80, 40, "minutes"),
        (300, 2.5, "hours"),
        (450, 3, "hours"),
        (600, 8, "hours"),
        (120, 90, "minutes"),
        (90, 45, "minutes"),
        (1000, 7.5, "hours"),
        (250, 75, "minutes"),
        (400, 160, "minutes"),
    ]
    for vol, t, unit in hard_iv_mlhr:
        hours = t if unit == "hours" else t / 60
        mlhr = vol / hours
        ans = f"{fmt(mlhr)} mL/hr"
        distractors = [
            f"{fmt(vol / t)} mL/hr",
            f"{fmt(mlhr * 2)} mL/hr",
            f"{fmt(vol)} mL/hr",
        ]
        # ensure distractors != answer
        distractors = [d for d in distractors if d != ans][:3]
        while len(distractors) < 3:
            distractors.append(f"{fmt(mlhr + 5 + len(distractors))} mL/hr")
        time_txt = f"{fmt(t)} {unit}"
        items.append(item(
            n, f"Hard IV · {fmt(vol)} mL / {time_txt}", "IV Flow Rates",
            "mL/hr = volume(mL) ÷ time(hours); convert minutes ÷ 60",
            f"An IV order is {fmt(vol)} mL to infuse over {time_txt}. What pump rate should be set in mL/hr?",
            ans, distractors,
            f"Convert time to hours if needed, then {fmt(vol)} ÷ {fmt(hours)} = {fmt(mlhr)} mL/hr.",
            "Hard items often hide a minutes→hours conversion.",
            "hard",
        )); n += 1

    # gtt/min with rounding
    hard_gtt = [
        (100, 60, 10), (100, 60, 15), (100, 60, 20), (100, 60, 60),
        (50, 30, 10), (50, 30, 15), (50, 30, 60),
        (250, 120, 10), (250, 120, 15), (250, 120, 20),
        (125, 60, 15), (125, 60, 20), (200, 90, 15),
        (75, 45, 20), (500, 240, 10), (500, 180, 15),
        (1000, 480, 10), (1000, 480, 15), (80, 40, 20),
        (150, 75, 60), (300, 150, 15), (40, 20, 60),
        (180, 90, 10), (225, 100, 20), (60, 45, 15),
    ]
    for vol, minutes, gtt in hard_gtt:
        raw = vol * gtt / minutes
        rounded = int(round(raw))
        ans = f"{rounded} gtt/min"
        distractors = [
            f"{int(raw)} gtt/min" if int(raw) != rounded else f"{rounded + 1} gtt/min",
            f"{rounded + 2} gtt/min",
            f"{int(round(vol * gtt / (minutes / 60)))} gtt/min",
        ]
        distractors = [d for d in distractors if d != ans][:3]
        while len(distractors) < 3:
            distractors.append(f"{rounded + 3 + len(distractors)} gtt/min")
        items.append(item(
            n, f"Hard gtt/min · DF {gtt}", "IV Flow Rates",
            "gtt/min = (mL × drop factor) ÷ minutes; round to nearest drop",
            f"Infuse {fmt(vol)} mL over {fmt(minutes)} minutes using a {gtt} gtt/mL set. What is the drip rate (nearest drop)?",
            ans, distractors,
            f"({fmt(vol)} × {gtt}) ÷ {fmt(minutes)} = {fmt(raw)} → round to {rounded} gtt/min.",
            "Macrodrip sets are often 10/15/20 gtt/mL; microdrip is 60 gtt/mL.",
            "hard",
        )); n += 1

    # Find infusion time from rate
    for vol, rate in [(1000, 125), (500, 50), (250, 75), (1000, 83), (750, 100), (200, 40), (100, 20), (1500, 125)]:
        hours = vol / rate
        # express as hours if clean else hours+minutes
        whole = int(hours)
        mins = int(round((hours - whole) * 60))
        if mins == 60:
            whole += 1
            mins = 0
        if mins == 0:
            ans = f"{whole} hours"
            expl = f"{fmt(vol)} ÷ {fmt(rate)} = {fmt(hours)} hours."
        else:
            ans = f"{whole} hr {mins} min"
            expl = f"{fmt(vol)} ÷ {fmt(rate)} = {fmt(hours)} hr ≈ {whole} hr {mins} min."
        distractors = [f"{whole + 1} hours", f"{fmt(rate)} hours", f"{fmt(vol / (rate * 2))} hours"]
        distractors = [d for d in distractors if d != ans][:3]
        while len(distractors) < 3:
            distractors.append(f"{whole + len(distractors) + 2} hours")
        items.append(item(
            n, f"Hard IV · time from {fmt(rate)} mL/hr", "IV Flow Rates",
            "Time(hr) = volume ÷ mL/hr",
            f"A bag contains {fmt(vol)} mL and the pump is set to {fmt(rate)} mL/hr. How long will the infusion last?",
            ans, distractors, expl,
            "Sometimes the exam asks for time, not rate — invert the formula.",
            "hard",
        )); n += 1

    # Volume infused after a period
    for rate, hours in [(125, 4), (83, 6), (50, 8), (100, 2.5), (75, 3), (200, 1.5), (40, 5), (150, 2)]:
        vol = rate * hours
        items.append(item(
            n, f"Hard IV · volume after {fmt(hours)} hr", "IV Flow Rates",
            "Volume = rate × time",
            f"An IV runs at {fmt(rate)} mL/hr for {fmt(hours)} hours. How many mL will infuse?",
            f"{fmt(vol)} mL",
            [f"{fmt(rate + hours)} mL", f"{fmt(rate)} mL", f"{fmt(vol / 2)} mL"],
            f"{fmt(rate)} × {fmt(hours)} = {fmt(vol)} mL.",
            "Useful for checking how much drug/fluid a patient has already received.",
            "hard",
        )); n += 1

    # Additive / concentration + rate (hard multi-step, still exam-style)
    # e.g. 1 g in 250 mL; give 100 mg/hr → mL/hr
    additive_cases = [
        (1000, "mg", 250, 100, "mg/hr"),  # 1 g = 1000 mg
        (1000, "mg", 100, 50, "mg/hr"),
        (500, "mg", 250, 50, "mg/hr"),
        (2, "g", 500, 0.5, "g/hr"),
        (1, "g", 250, 200, "mg/hr"),  # need unit convert
        (400, "mg", 200, 40, "mg/hr"),
        (2, "g", 250, 100, "mg/hr"),
        (500, "mg", 100, 125, "mg/hr"),
        (1, "g", 500, 50, "mg/hr"),
        (750, "mg", 250, 75, "mg/hr"),
    ]
    for amount, unit, bag_ml, dose_rate, rate_unit in additive_cases:
        # normalize to mg
        amount_mg = amount * 1000 if unit == "g" else amount
        if rate_unit == "g/hr":
            dose_mg_hr = dose_rate * 1000
        else:
            dose_mg_hr = dose_rate
        conc = amount_mg / bag_ml  # mg/mL
        mlhr = dose_mg_hr / conc
        items.append(item(
            n, f"Hard IV · drug rate to mL/hr", "IV Flow Rates",
            "mL/hr = (ordered mg/hr) ÷ (mg/mL concentration)",
            f"A bag has {fmt(amount)} {unit} in {fmt(bag_ml)} mL D5W. The order is {fmt(dose_rate)} {rate_unit}. What is the pump rate in mL/hr?",
            f"{fmt(mlhr)} mL/hr",
            [f"{fmt(conc)} mL/hr", f"{fmt(dose_mg_hr)} mL/hr", f"{fmt(mlhr * 2)} mL/hr"],
            f"Concentration = {fmt(amount_mg)} mg ÷ {fmt(bag_ml)} mL = {fmt(conc)} mg/mL. Rate = {fmt(dose_mg_hr)} ÷ {fmt(conc)} = {fmt(mlhr)} mL/hr.",
            "Hard PTCE-style items combine concentration with infusion rate — convert units first.",
            "hard",
        )); n += 1

    # mcg/kg/min style (common hard hospital calc; still calculation not sterile compounding)
    mcg_cases = [
        # weight_kg, mcg/kg/min, concentration mcg/mL → mL/hr
        (70, 5, 400),   # e.g. 100 mg/250 mL = 400 mcg/mL? 100000/250=400 yes
        (80, 3, 200),
        (60, 2, 160),
        (90, 4, 400),
        (50, 5, 250),
        (75, 2.5, 200),
        (65, 1, 100),
        (100, 3, 300),
    ]
    for wt, mcg_kg_min, conc_mcg_ml in mcg_cases:
        mcg_min = wt * mcg_kg_min
        ml_min = mcg_min / conc_mcg_ml
        ml_hr = ml_min * 60
        items.append(item(
            n, f"Hard IV · mcg/kg/min → mL/hr", "IV Flow Rates",
            "mL/hr = (mcg/kg/min × kg × 60) ÷ (mcg/mL)",
            f"Order: {fmt(mcg_kg_min)} mcg/kg/min. Patient weighs {fmt(wt)} kg. Infusion concentration is {fmt(conc_mcg_ml)} mcg/mL. Pump rate in mL/hr?",
            f"{fmt(ml_hr)} mL/hr",
            [f"{fmt(mcg_min)} mL/hr", f"{fmt(ml_min)} mL/hr", f"{fmt(ml_hr / 60)} mL/hr"],
            f"mcg/min = {fmt(wt)}×{fmt(mcg_kg_min)} = {fmt(mcg_min)}. mL/min = {fmt(mcg_min)}/{fmt(conc_mcg_ml)} = {fmt(ml_min)}. ×60 = {fmt(ml_hr)} mL/hr.",
            "Weight-based IV drips need the 60-minute conversion to mL/hr.",
            "hard",
        )); n += 1

    # -------- HARD dilutions / concentration (no alligation) --------
    hard_dilutions = [
        # make V2 mL of C2% from C1% stock
        (10, 1, 250),
        (50, 5, 100),
        (100, 20, 50),
        (25, 2.5, 200),
        (40, 4, 500),
        (70, 7, 100),
        (5, 0.5, 1000),
        (20, 2, 750),
        (15, 3, 300),
        (8, 0.8, 250),
    ]
    for c1, c2, v2 in hard_dilutions:
        v1 = c2 * v2 / c1
        diluent = v2 - v1
        items.append(item(
            n, f"Hard dilution · {fmt(c1)}% → {fmt(c2)}%", "Dilutions",
            "V1 = (C2 × V2) / C1 ; diluent = V2 − V1",
            f"Prepare {fmt(v2)} mL of {fmt(c2)}% solution using {fmt(c1)}% stock. How many mL of stock are needed?",
            f"{fmt(v1)} mL",
            [f"{fmt(v2)} mL", f"{fmt(diluent)} mL", f"{fmt(v1 * 2)} mL"],
            f"V1 = ({fmt(c2)}×{fmt(v2)})/{fmt(c1)} = {fmt(v1)} mL stock; then qs diluent to {fmt(v2)} mL ({fmt(diluent)} mL diluent).",
            "Alligation is off the 2026 PTCE — use C1V1=C2V2 for dilution items.",
            "hard",
        )); n += 1
        items.append(item(
            n, f"Hard dilution · diluent volume", "Dilutions",
            "Diluent = final volume − stock volume",
            f"Using the same setup ({fmt(v2)} mL of {fmt(c2)}% from {fmt(c1)}% stock), how much diluent is added?",
            f"{fmt(diluent)} mL",
            [f"{fmt(v1)} mL", f"{fmt(v2)} mL", f"{fmt(c1)} mL"],
            f"Stock needed is {fmt(v1)} mL, so diluent = {fmt(v2)} − {fmt(v1)} = {fmt(diluent)} mL.",
            "Many techs calculate stock correctly but forget diluent volume.",
            "hard",
        )); n += 1

    # Hard percent / ratio combined
    for mg, ml in [(250, 5), (500, 10), (1000, 50), (40, 2), (125, 5), (80, 2)]:
        pct = (mg / 1000) / ml * 100  # g/100mL
        items.append(item(
            n, f"Hard % from {fmt(mg)} mg/{fmt(ml)} mL", "Percent Strength",
            "% w/v = (g solute ÷ mL solution) × 100",
            f"A solution contains {fmt(mg)} mg in {fmt(ml)} mL. What is the % w/v strength?",
            f"{fmt(pct)}%",
            [f"{fmt(mg / ml)}%", f"{fmt(pct * 10)}%", f"{fmt(mg / 1000)}%"],
            f"Convert {fmt(mg)} mg → {fmt(mg/1000)} g; ({fmt(mg/1000)}/{fmt(ml)})×100 = {fmt(pct)}%.",
            "Watch mg vs g — percent strength uses grams per 100 mL.",
            "hard",
        )); n += 1

    # Hard weight-based with lb conversion + daily total
    for lb, mgkg_dose, times in [(44, 10, 2), (66, 15, 3), (88, 5, 4), (33, 20, 2), (110, 7.5, 2), (55, 12, 3)]:
        kg = lb / 2.2
        per_dose = kg * mgkg_dose
        daily = per_dose * times
        items.append(item(
            n, f"Hard mg/kg · {fmt(lb)} lb", "Weight-Based Dosing",
            "kg = lb ÷ 2.2 ; mg/dose = mg/kg × kg",
            f"Patient weighs {fmt(lb)} lb. Order: {fmt(mgkg_dose)} mg/kg/dose {times}× daily. How many mg per dose?",
            f"{fmt(per_dose)} mg",
            [f"{fmt(daily)} mg", f"{fmt(lb * mgkg_dose)} mg", f"{fmt(kg)} mg"],
            f"{fmt(lb)} ÷ 2.2 = {fmt(kg)} kg; × {fmt(mgkg_dose)} = {fmt(per_dose)} mg/dose.",
            "If the question asks per dose vs per day, that word changes the answer.",
            "hard",
        )); n += 1

    # Hard ratio: powder reconstitution style (exam-relevant reconstitution math)
    recon = [
        # label concentration after recon, desired dose, volume to draw
        (250, 5, 100),  # 250mg/5mL, want 100mg
        (500, 10, 250),
        (125, 5, 200),
        (1000, 20, 750),
        (50, 1, 35),
        (400, 8, 300),
        (200, 4, 150),
        (250, 5, 175),
    ]
    for have_mg, have_ml, want_mg in recon:
        vol = want_mg * have_ml / have_mg
        items.append(item(
            n, f"Hard draw-up · {fmt(want_mg)} mg", "Ratio & Proportion",
            "Volume = desired ÷ concentration",
            f"After reconstitution, a vial is {fmt(have_mg)} mg / {fmt(have_ml)} mL. How many mL are needed for a {fmt(want_mg)} mg dose?",
            f"{fmt(vol)} mL",
            [f"{fmt(have_ml)} mL", f"{fmt(want_mg)} mL", f"{fmt(vol * 2)} mL"],
            f"({fmt(want_mg)}/{fmt(have_mg)}) × {fmt(have_ml)} = {fmt(vol)} mL.",
            "Reconstitution strength is on the label after mixing — use that for draw-up math.",
            "hard",
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
    hard = 0
    hard_iv = 0
    for x in items:
        cats[x["category"]] = cats.get(x["category"], 0) + 1
        if x.get("difficulty") == "hard":
            hard += 1
            if x["category"] == "IV Flow Rates":
                hard_iv += 1
    print(f"Wrote {len(items)} math items to {OUT}")
    print(f"Hard items: {hard} (IV hard: {hard_iv})")
    for k, v in sorted(cats.items()):
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
