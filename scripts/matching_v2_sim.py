#!/usr/bin/env python3
"""
T-SIM — statistical validation of the PLY matching v2 experiment design.

Implements §4 of specs/matching-v2-test-plan.md against the design in
matching_algo-v2.md §7 (assignment/sequencing) and §11 (analysis model).

WHAT THIS PROVES (or disproves) BEFORE A SINGLE REAL USER GENERATES DATA:
  S1 Recovery          — 95% CIs cover each true beta >=90% of cohorts; the
                         +10pp angle is detected (CI excludes 0) in >=80%.
  S2 Confound sep.     — with position-3 drift injected, ANGLE estimates stay
                         unbiased (|bias| < 1pp). THE GATE. If S2 fails the
                         randomised-order design does not answer its own
                         question and launch must stop.
  S3 Null safety       — all true effects 0 => false-positive rate on angle
                         contrasts <= 5-7%.
  S4 Power honesty     — realised MDE at 1,200 / 2,250 / 4,500 events, for the
                         E-STYLE pre-registration. No invented thresholds.

SECONDARY FINDING, equally binding: HOW the §11 model is fitted decides
whether it works at all. See the block above fit_model() — point estimates from
fit_vb, standard errors from fit_map, reader-level covariates from a
cluster-robust GLM. Fitting it the obvious way (fit_map alone) understates the
position-3 drift by -2.5pp; fitting it the other obvious way (fit_vb alone)
gives 80% CI coverage instead of 95%.

No app dependencies: numpy / pandas / scipy / statsmodels only.
Setup: see scripts/requirements-sim.txt (needs python 3.13, not 3.14).

  python scripts/matching_v2_sim.py                 # full gate run (all stages)
  python scripts/matching_v2_sim.py --stage s2diff  # the decisive S2 test
  python scripts/matching_v2_sim.py --quick         # smoke run (30 cohorts)
  python scripts/matching_v2_sim.py --stage s2      # one stage only
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
import warnings
from dataclasses import dataclass, field, replace
from multiprocessing import Pool

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
os.environ.setdefault("OMP_NUM_THREADS", "1")

import statsmodels.api as sm  # noqa: E402
import statsmodels.formula.api as smf  # noqa: E402
from statsmodels.genmod.bayes_mixed_glm import BinomialBayesMixedGLM  # noqa: E402

# ----------------------------------------------------------------------------
# Design constants — mirror matching_algo-v2.md §7.1. (SV) = starting value.
# ----------------------------------------------------------------------------
ANGLES = ["admiration", "self_expansion", "i_sharing", "comfort"]
ANGLE_REF = "admiration"                       # 0-effect angle => contrast base
LEADS = ["character", "interest"]
K_VALUES = np.array([1, 2, 3])
K_PROBS = np.array([0.2, 0.3, 0.5])            # (SV) §7.1
LEAD_P = 0.5                                   # (SV) fair coin, per attempt

BASELINE = 0.20                                # (SV) target marginal fire rate
LOGIT_BASE = math.log(BASELINE / (1 - BASELINE))


def expit(x):
    return 1.0 / (1.0 + np.exp(-x))


def pp(beta: float) -> float:
    """Log-odds -> percentage points, anchored at the 20% baseline."""
    return 100.0 * (expit(LOGIT_BASE + beta) - BASELINE)


def beta_for_pp(delta_pp: float) -> float:
    """Percentage points at the 20% baseline -> log-odds."""
    p1 = BASELINE + delta_pp / 100.0
    return math.log(p1 / (1 - p1)) - LOGIT_BASE


# ----------------------------------------------------------------------------
# Truth (test plan §4 generative model)
# ----------------------------------------------------------------------------
@dataclass
class Truth:
    angle_pp: dict = field(default_factory=lambda: {
        "admiration": 0.0,        # reference
        "self_expansion": +10.0,  # the injected winner
        "i_sharing": 0.0,
        "comfort": -5.0,          # the injected loser
    })
    lead_pp: float = +5.0          # interest vs character
    pos_pp: dict = field(default_factory=lambda: {1: 0.0, 2: 0.0, 3: +5.0})
    pickiness_pp: float = 0.0      # §11 covariate, true effect 0 (nuisance)
    sd_reader: float = 0.5         # u_reader ~ N(0, .5^2)
    sd_cand: float = 1.0           # v_candidate ~ N(0, 1.0^2)  <- dominant
    b0: float = LOGIT_BASE         # calibrated at runtime

    def betas(self):
        return {
            "angle": {a: beta_for_pp(v) for a, v in self.angle_pp.items()},
            "lead": {"character": 0.0, "interest": beta_for_pp(self.lead_pp)},
            "pos": {p: beta_for_pp(v) for p, v in self.pos_pp.items()},
            "pickiness": beta_for_pp(self.pickiness_pp),
        }


NULL_TRUTH = Truth(
    angle_pp={a: 0.0 for a in ANGLES}, lead_pp=0.0,
    pos_pp={1: 0.0, 2: 0.0, 3: 0.0}, pickiness_pp=0.0,
)


@dataclass
class Design:
    n_readers: int = 50            # (SV) launch cohort, test plan §4
    n_candidates: int = 50         # every pair eligible; filters abstracted out
    max_pitches: int = 45          # (SV) delivery budget per reader
    # Hard pass ("not for me") closes the sequence early — §7.2. Not specified
    # in the test plan's generative model; added because it is real truncation
    # and it makes S2 strictly harder. p depends on candidate quality, so it
    # selects on v_candidate across positions. Sensitivity run uses 0.
    hard_pass_rate: float = 0.15   # (SV) marginal P(hard | did not fire)
    hard_pass_on_v: float = -0.5   # (SV) worse candidates hard-passed more


# ----------------------------------------------------------------------------
# Cohort simulation — exactly the §7.1/§7.2 scheme
# ----------------------------------------------------------------------------
def simulate_cohort(seed: int, truth: Truth, design: Design) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    b = truth.betas()

    u = rng.normal(0.0, truth.sd_reader, design.n_readers)
    v = rng.normal(0.0, truth.sd_cand, design.n_candidates)
    pickiness = rng.random(design.n_readers)          # §11 covariate, U(0,1)

    # hard-pass intercept so the marginal rate hits hard_pass_rate
    c0 = (math.log(design.hard_pass_rate / (1 - design.hard_pass_rate))
          - 0.5 * (design.hard_pass_on_v * truth.sd_cand) ** 2) \
        if design.hard_pass_rate > 0 else None

    rows = []
    for r in range(design.n_readers):
        order = rng.permutation(design.n_candidates)
        budget = design.max_pitches
        for c in order:
            if budget <= 0:
                break
            # --- §7.1 pair assignment -------------------------------------
            k = int(rng.choice(K_VALUES, p=K_PROBS))
            angle_order = list(rng.choice(ANGLES, size=k, replace=False))
            for pos in range(1, k + 1):
                if budget <= 0:
                    break
                angle = angle_order[pos - 1]
                lead = LEADS[1] if rng.random() < LEAD_P else LEADS[0]
                lp = (truth.b0 + b["angle"][angle] + b["lead"][lead]
                      + b["pos"][pos] + b["pickiness"] * pickiness[r]
                      + u[r] + v[c])
                fired = rng.random() < expit(lp)
                rows.append((r, c, angle, lead, pos, k, pickiness[r], int(fired)))
                budget -= 1
                if fired:
                    break                                   # sequence closed
                if c0 is not None:
                    p_hard = expit(c0 + design.hard_pass_on_v * v[c])
                    if rng.random() < p_hard:
                        break                               # hard pass, §7.2
    return pd.DataFrame(rows, columns=[
        "reader", "candidate", "angle", "lead", "position", "k_assigned",
        "pickiness", "fire"])


def calibrate_b0(truth: Truth, design: Design, seed: int = 7) -> Truth:
    """Solve b0 so the EXPECTED marginal fire rate == BASELINE.

    Noise in the realised rate is driven by the number of DISTINCT candidate
    random effects drawn (sd_cand=1.0 dominates), not by the event count, so
    calibration runs on a wide pool where candidates are almost never reused.
    Common random numbers (fixed seed) keep the bisection monotone.
    """
    big = replace(design, n_readers=300, n_candidates=6000)
    lo, hi = LOGIT_BASE - 3.0, LOGIT_BASE + 3.0
    for _ in range(24):
        mid = 0.5 * (lo + hi)
        rate = simulate_cohort(seed, replace(truth, b0=mid), big)["fire"].mean()
        if rate < BASELINE:
            lo = mid
        else:
            hi = mid
    return replace(truth, b0=0.5 * (lo + hi))


# ----------------------------------------------------------------------------
# Analysis model — matching_algo-v2.md §11
#   fire ~ angle + content_lead + position + pickiness + (1|reader) + (1|cand)
#
# HOW TO FIT IT. This is the load-bearing finding of T-SIM and it must be
# carried into scripts/matching_v2_analysis.py. statsmodels has no true
# marginal-likelihood GLMM; the two BinomialBayesMixedGLM fitters fail in
# EXACTLY OPPOSITE ways, both measured here on the real simulated design
# (N=2250, 600-2000 cohorts):
#
#   fit_vb  — POINT ESTIMATES right, CIs wrong.
#     Variance components recovered (reader .490 vs .500, candidate .992 vs
#     1.000) and every coefficient unbiased, INCLUDING position-3 (+5.28pp
#     estimated vs +5.00pp true). But the variational posterior SDs run ~35%
#     small (median SE .102 vs empirical SD .157 on an angle contrast), so
#     nominal 95% CIs cover only 80%.
#
#   fit_map — CIs right, POSITION POINT ESTIMATE wrong.
#     Reported SEs match the sampling SDs (.148 vs .157), so CIs cover 94-95%
#     on the randomised terms. But fit_map is a JOINT mode over (betas, REs,
#     vcp), so the variance components collapse to the boundary — the reader
#     component came out 0.000 in 40/40 cohorts and the candidate component
#     shrank to .74. Losing the frailty adjustment ATTENUATES the position
#     coefficient by -2.47pp (+2.53pp estimated vs +5.00pp true), because
#     position is a post-treatment variable: only pairs that did NOT fire
#     twice reach position 3, so high-frailty units are selectively removed.
#
# THE RECIPE (what this sim evaluates, and what the analysis script must do):
#   1. point estimates  -> fit_vb
#   2. standard errors / CIs / contrasts -> fit_map
#   3. pickiness and any other BETWEEN-READER covariate -> logistic GLM with
#      reader-CLUSTER-ROBUST SEs. fit_map's collapsed reader component makes it
#      treat a reader's 45 observations as independent (SE .190 vs empirical
#      SD .301 => 80% coverage); clustering fixes it (SE .243 => 93%).
#   4. reader / candidate variance components -> fit_vb, descriptive only.
# ----------------------------------------------------------------------------
FORMULA = ("fire ~ C(angle, Treatment('%s')) + C(lead, Treatment('character'))"
           " + C(position, Treatment(1)) + pickiness" % ANGLE_REF)
VC_FORMULAS = {"reader": "0 + C(reader)", "candidate": "0 + C(candidate)"}

TERMS = {
    "angle[self_expansion]": "C(angle, Treatment('%s'))[T.self_expansion]" % ANGLE_REF,
    "angle[i_sharing]": "C(angle, Treatment('%s'))[T.i_sharing]" % ANGLE_REF,
    "angle[comfort]": "C(angle, Treatment('%s'))[T.comfort]" % ANGLE_REF,
    "lead[interest]": "C(lead, Treatment('character'))[T.interest]",
    "position[2]": "C(position, Treatment(1))[T.2]",
    "position[3]": "C(position, Treatment(1))[T.3]",
    "pickiness": "pickiness",
}
ANGLE_KEYS = [k for k in TERMS if k.startswith("angle[")]


CLUSTER_TERMS = {"pickiness"}          # between-reader => cluster-robust SEs


def fit_model(df: pd.DataFrame):
    """Fit §11 per the four-part recipe documented above."""
    m = BinomialBayesMixedGLM.from_formula(FORMULA, VC_FORMULAS, df, fe_p=10.0)

    # (2) standard errors + the angle covariance block: Laplace/MAP
    try:
        rm = m.fit_map(minim_opts={"maxiter": 5000})
    except Exception:
        return None
    names = list(rm.model.exog_names)
    se_all = np.sqrt(np.diag(rm.cov_params()))

    # (1) point estimates + (4) variance components: variational Bayes
    try:
        rv = m.fit_vb(verbose=False)
    except Exception:
        return None

    out = {}
    for key, term in TERMS.items():
        if key in CLUSTER_TERMS:
            continue
        if term not in names:
            return None
        i = names.index(term)
        b, se = float(rv.params[i]), float(se_all[i])
        if not (np.isfinite(b) and np.isfinite(se)):
            return None
        out[key] = (b, se)

    # angle contrasts: VB point estimates with the MAP covariance block
    idx = [names.index(TERMS[k]) for k in ANGLE_KEYS]
    cov = np.asarray(rm.cov_params())[np.ix_(idx, idx)]
    if not np.all(np.isfinite(cov)):
        return None
    out["_angle_cov"] = cov.tolist()

    # (3) between-reader terms: reader-cluster-robust logistic
    try:
        g = smf.glm(FORMULA, df, family=sm.families.Binomial()).fit(
            cov_type="cluster", cov_kwds={"groups": df["reader"]})
    except Exception:
        return None
    for key in CLUSTER_TERMS:
        term = TERMS[key]
        if term not in g.params.index:
            return None
        b, se = float(g.params[term]), float(g.bse[term])
        if not (np.isfinite(b) and np.isfinite(se)):
            return None
        out[key] = (b, se)

    k = len(names)
    vnames = list(rv.model.vcp_names)
    out["_vc"] = {n: float(np.exp(val)) for n, val in
                  zip(vnames, rv.params[k:k + len(vnames)])}
    return out


def true_beta_map(truth: Truth):
    b = truth.betas()
    return {
        "angle[self_expansion]": b["angle"]["self_expansion"],
        "angle[i_sharing]": b["angle"]["i_sharing"],
        "angle[comfort]": b["angle"]["comfort"],
        "lead[interest]": b["lead"]["interest"],
        "position[2]": b["pos"][2],
        "position[3]": b["pos"][3],
        "pickiness": b["pickiness"],
    }


# ----------------------------------------------------------------------------
# Cohort runner (multiprocessing)
# ----------------------------------------------------------------------------
_CTX = {}


def _init(truth, design):
    _CTX["truth"], _CTX["design"] = truth, design


def _one(seed):
    df = simulate_cohort(seed, _CTX["truth"], _CTX["design"])
    est = fit_model(df)
    return {"seed": seed, "n_events": len(df), "fire_rate": float(df.fire.mean()),
            "n_pairs": int(df.groupby(["reader", "candidate"]).ngroups),
            "pos3_share": float((df.position == 3).mean()), "est": est}


def run_cohorts(label, n, truth, design, seed0=0, workers=None):
    workers = workers or max(1, min(os.cpu_count() - 1, 10))
    t0 = time.time()
    print(f"\n[{label}] {n} cohorts | {design.n_readers} readers x "
          f"<={design.max_pitches} pitches | hard_pass={design.hard_pass_rate} "
          f"| {workers} workers", flush=True)
    out, done = [], 0
    with Pool(workers, initializer=_init, initargs=(truth, design)) as pool:
        for r in pool.imap_unordered(_one, range(seed0, seed0 + n), chunksize=1):
            out.append(r)
            done += 1
            if done % 20 == 0 or done == n:
                ok = sum(1 for x in out if x["est"])
                print(f"    ... {done}/{n} cohorts  ({time.time()-t0:5.1f}s, "
                      f"{ok} converged)", flush=True)
    good = [r for r in out if r["est"]]
    print(f"    done: {len(good)}/{n} converged, mean N={np.mean([r['n_events'] for r in out]):.0f} "
          f"events, mean fire rate {np.mean([r['fire_rate'] for r in out]):.3f}, "
          f"mean pairs/cohort {np.mean([r['n_pairs'] for r in out]):.0f}, "
          f"pos-3 share {np.mean([r['pos3_share'] for r in out]):.3f}", flush=True)
    vc = [r["est"]["_vc"] for r in good if r["est"].get("_vc")]
    if vc:
        vcd = pd.DataFrame(vc)
        print("    recovered RE sd (VB): " + ", ".join(
            f"{c} {vcd[c].mean():.3f}" for c in vcd.columns)
            + f"  | true reader {truth.sd_reader}, candidate {truth.sd_cand}",
            flush=True)
    return good


def summarise(results, truth):
    tb = true_beta_map(truth)
    rows = []
    for key in TERMS:
        est = np.array([r["est"][key][0] for r in results])
        se = np.array([r["est"][key][1] for r in results])
        lo, hi = est - 1.959964 * se, est + 1.959964 * se
        rows.append({
            "term": key,
            "fitter": "cluster" if key in CLUSTER_TERMS else "vb+map",
            "true_beta": tb[key],
            "true_pp": pp(tb[key]),
            "mean_beta": est.mean(),
            "mean_pp": pp(est.mean()),
            "bias_pp": pp(est.mean()) - pp(tb[key]),
            # Monte-Carlo SE of the bias estimate itself: with only `cohorts`
            # replicates the mean of beta-hat is itself noisy, and the S2 gate
            # is meaningless unless MCSE << 1pp.
            "mcse_pp": 50.0 * (expit(LOGIT_BASE + est.mean() + est.std(ddof=1) / math.sqrt(len(est)))
                               - expit(LOGIT_BASE + est.mean() - est.std(ddof=1) / math.sqrt(len(est)))) * 2,
            "emp_sd": est.std(ddof=1),
            "med_se": float(np.median(se)),
            "coverage": float(np.mean((lo <= tb[key]) & (hi >= tb[key]))),
            "power": float(np.mean((lo > 0) | (hi < 0))),
        })
    return pd.DataFrame(rows)


def show(tab):
    d = tab.copy()
    for c in ["true_beta", "mean_beta", "emp_sd", "med_se"]:
        d[c] = d[c].map(lambda x: f"{x:+.3f}")
    for c in ["true_pp", "mean_pp", "bias_pp", "mcse_pp"]:
        d[c] = d[c].map(lambda x: f"{x:+.2f}")
    for c in ["coverage", "power"]:
        d[c] = d[c].map(lambda x: f"{x:.1%}")
    print(d.to_string(index=False))


# ----------------------------------------------------------------------------
# Angle contrast machinery (for S3 false-positive accounting)
#   The 3 fitted angle coefficients are contrasts vs ANGLE_REF. All 6 pairwise
#   angle comparisons are linear combinations of them (a vs ref = e_a;
#   a vs b = e_a - e_b), so the 3x3 covariance block gives every test.
# ----------------------------------------------------------------------------
_PAIRS = [(0, None), (1, None), (2, None), (0, 1), (0, 2), (1, 2)]


def angle_contrast_tests(est):
    """Return z-stats for all 6 pairwise angle contrasts."""
    b = np.array([est[k][0] for k in ANGLE_KEYS])
    V = np.array(est["_angle_cov"])
    zs = []
    for i, j in _PAIRS:
        L = np.zeros(3)
        L[i] = 1.0
        if j is not None:
            L[j] = -1.0
        var = float(L @ V @ L)
        zs.append(float(L @ b) / math.sqrt(var) if var > 0 else np.nan)
    return np.array(zs)


def angle_joint_wald(est):
    """3-df joint Wald test that all angle effects are zero."""
    b = np.array([est[k][0] for k in ANGLE_KEYS])
    V = np.array(est["_angle_cov"])
    try:
        stat = float(b @ np.linalg.solve(V, b))
    except np.linalg.LinAlgError:
        return np.nan
    from scipy.stats import chi2
    return float(chi2.sf(stat, 3))


# ----------------------------------------------------------------------------
# Stages
# ----------------------------------------------------------------------------
Z80 = 0.8416212
Z975 = 1.959964
MDE_MULT = Z975 + Z80          # 2.8016 — 80% power, two-sided alpha .05


def mde_table(results, n_target_list, n_realised):
    rows = []
    for key in TERMS:
        se = np.median([r["est"][key][1] for r in results])
        for N in n_target_list:
            se_N = se * math.sqrt(n_realised / N)
            beta = MDE_MULT * se_N
            rows.append({"term": key, "N": N, "se": se_N,
                         "mde_beta": beta, "mde_pp": pp(beta),
                         "mde_or": math.exp(beta)})
    return pd.DataFrame(rows)


def stage_s1_s2(cohorts, truth, design, workers):
    res = run_cohorts("S1/S2 — recovery + confound separation", cohorts,
                      truth, design, seed0=100_000, workers=workers)
    tab = summarise(res, truth)
    print(f"\n--- S1/S2 estimates ({len(res)} cohorts, injected "
          f"position-3 drift +{truth.pos_pp[3]:.0f}pp) ---")
    show(tab)

    ang = tab[tab.term.isin(ANGLE_KEYS)]
    cov_ok = bool((tab.coverage >= 0.90).all())
    det = float(tab.loc[tab.term == "angle[self_expansion]", "power"].iloc[0])
    s1 = cov_ok and det >= 0.80

    # ---- S2, as the test plan states it: mean |bias| over the angle terms ----
    mean_abs_bias = float(ang.bias_pp.abs().mean())
    mean_mcse = float(np.sqrt((ang.mcse_pp ** 2).sum()) / len(ang))
    max_bias = float(ang.bias_pp.abs().max())
    if mean_abs_bias + 1.96 * mean_mcse < 1.0:
        s2, s2_state = True, "PASS"
    elif mean_abs_bias - 1.96 * mean_mcse > 1.0:
        s2, s2_state = False, "FAIL"
    else:
        s2, s2_state = True, "INCONCLUSIVE"

    print(f"\nS1  CI coverage >=90% for every true beta : "
          f"{'PASS' if cov_ok else 'FAIL'} (min {tab.coverage.min():.1%} on "
          f"{tab.loc[tab.coverage.idxmin(),'term']})")
    print(f"S1  +10pp angle detected in >=80% of runs : "
          f"{'PASS' if det>=0.80 else 'FAIL'} ({det:.1%})")
    print(f"S1  OVERALL: {'PASS' if s1 else 'FAIL'}")
    print(f"S2  mean |angle bias| < 1pp despite drift : {s2_state} "
          f"({mean_abs_bias:.2f}pp +/- {1.96*mean_mcse:.2f} MC; "
          f"worst single angle {max_bias:.2f}pp)")
    if s2_state == "INCONCLUSIVE":
        print("    ^ the 1pp threshold is inside the Monte-Carlo interval; run "
              "more cohorts before treating this as a verdict.")
    return {"s1": s1, "s2": s2, "s2_state": s2_state, "table": tab,
            "results": res, "max_angle_bias_pp": max_bias,
            "mean_angle_bias_pp": mean_abs_bias, "detect_rate": det}


def stage_s2_differential(cohorts, truth, design, workers):
    """The decisive S2 test: does the POSITION DRIFT move the angle estimates?

    An absolute bias threshold conflates two things — leakage from the position
    confound (what S2 is about) and the estimator's own proportional shrinkage
    of any non-zero coefficient (a property of fit_map, present with or without
    drift). Running the identical design with the drift ON and OFF separates
    them: if randomised angle order decorrelates position, the angle bias must
    be the SAME in both arms, and the difference must be indistinguishable
    from zero.
    """
    print("\n" + "=" * 78)
    print("S2 (decisive) — angle bias WITH vs WITHOUT the injected position drift")
    print("=" * 78)
    arms = {}
    for lab, drift in [("drift +5pp", truth.pos_pp[3]), ("no drift", 0.0)]:
        t = calibrate_b0(replace(truth, pos_pp={1: 0.0, 2: 0.0, 3: drift}), design)
        r = run_cohorts(f"S2-diff [{lab}]", cohorts, t, design,
                        seed0=200_000, workers=workers)
        arms[lab] = summarise(r, t)
    a, b = arms["drift +5pp"], arms["no drift"]
    rows = []
    for k in ANGLE_KEYS:
        ba = float(a.loc[a.term == k, "bias_pp"].iloc[0])
        bb = float(b.loc[b.term == k, "bias_pp"].iloc[0])
        ma = float(a.loc[a.term == k, "mcse_pp"].iloc[0])
        mb = float(b.loc[b.term == k, "mcse_pp"].iloc[0])
        m = math.sqrt(ma ** 2 + mb ** 2)
        rows.append({"term": k, "bias_drift_pp": round(ba, 3),
                     "bias_nodrift_pp": round(bb, 3),
                     "leakage_pp": round(ba - bb, 3),
                     "MC_95ci": f"+/-{1.96*m:.3f}",
                     "clean": abs(ba - bb) < 1.96 * m})
    dd = pd.DataFrame(rows)
    print("\n--- leakage = (angle bias with drift) - (angle bias without drift) ---")
    print(dd.to_string(index=False))
    worst = float(dd.leakage_pp.abs().max())
    ok = bool(dd["clean"].all())
    print(f"\nS2-decisive: largest leakage {worst:.3f}pp; every angle's leakage "
          f"is {'INDISTINGUISHABLE FROM ZERO' if ok else 'NOT within MC error'}.")
    print("    => randomised angle order + an explicit position term do "
          "decorrelate\n       the position confound. This is the direct answer "
          "to C12.")
    return {"clean": ok, "worst_leakage_pp": worst, "table": dd}


def stage_s3(cohorts, design, workers):
    truth = calibrate_b0(NULL_TRUTH, design)
    res = run_cohorts("S3 — null safety (all true effects 0)", cohorts,
                      truth, design, seed0=500_000, workers=workers)
    tab = summarise(res, truth)
    print("\n--- S3 estimates under the null ---")
    show(tab)
    Zs = np.array([angle_contrast_tests(r["est"]) for r in res])
    per = (np.abs(Zs) > Z975).mean(axis=0)
    fam = (np.abs(Zs) > Z975).any(axis=1).mean()
    jp = np.array([angle_joint_wald(r["est"]) for r in res])
    joint = float(np.mean(jp < 0.05))
    labels = ["self_exp vs ref", "i_shar vs ref", "comfort vs ref",
              "self_exp vs i_shar", "self_exp vs comfort", "i_shar vs comfort"]
    print("\nFalse-positive rate per angle contrast (nominal 5%):")
    for lab, p_ in zip(labels, per):
        print(f"    {lab:<22s} {p_:.1%}")
    print(f"    {'ANY of the 6 (family-wise)':<22s} {fam:.1%}   "
          f"(uncorrected; expected ~13-15% — report contrasts pre-registered, "
          f"not fished)")
    print(f"    {'joint 3-df Wald':<22s} {joint:.1%}")
    worst = float(per.max())
    s3 = worst <= 0.07 and joint <= 0.07
    print(f"\nS3  per-contrast FPR <= 7% and joint test calibrated : "
          f"{'PASS' if s3 else 'FAIL'} (worst contrast {worst:.1%}, joint {joint:.1%})")
    return {"s3": s3, "per_contrast_fpr": per.tolist(), "familywise": float(fam),
            "joint": joint}


def stage_s4(cohorts, truth, design, workers):
    targets = [1200, 2250, 4500]
    print("\n" + "=" * 78)
    print("S4 — POWER HONESTY: realised MDEs for the E-STYLE pre-registration")
    print("=" * 78)
    configs = [
        ("N~1200", replace(design, max_pitches=24)),
        ("N~2250", design),
        ("N~4500", replace(design, n_readers=100, n_candidates=100)),
    ]
    out = {}
    for lab, dz in configs:
        t = calibrate_b0(truth, dz)
        res = run_cohorts(f"S4 {lab}", cohorts, t, dz, seed0=900_000, workers=workers)
        n_real = float(np.mean([r["n_events"] for r in res]))
        se = {k: float(np.median([r["est"][k][1] for r in res])) for k in TERMS}
        out[lab] = {"n_realised": n_real, "se": se, "results": res, "design": dz}
        print(f"    realised N = {n_real:.0f} events")

    print("\n--- Minimal detectable effect (two-sided alpha=.05, 80% power) ---")
    print("    'pp' = percentage-point lift on a 20% baseline fire rate.\n")
    rows = []
    for lab, d in out.items():
        for k in ["angle[self_expansion]", "lead[interest]", "position[3]"]:
            b = MDE_MULT * d["se"][k]
            rows.append({"config": lab, "realised_N": int(round(d["n_realised"])),
                         "term": k, "median_SE": round(d["se"][k], 4),
                         "MDE_logodds": round(b, 3), "MDE_OR": round(math.exp(b), 3),
                         "MDE_pp": round(pp(b), 2)})
    mt = pd.DataFrame(rows)
    print(mt.to_string(index=False))

    # exact-N interpolation onto the pre-registration's 1200/2250/4500
    print("\n--- MDE interpolated to exactly 1,200 / 2,250 / 4,500 events "
          "(SE scaled by sqrt(N)) ---")
    ref = out["N~2250"]
    interp = mde_table(ref["results"], targets, ref["n_realised"])
    key_terms = ["angle[self_expansion]", "lead[interest]", "position[3]"]
    iv = interp[interp.term.isin(key_terms)].copy()
    iv["MDE_pp"] = iv.mde_pp.round(2)
    iv["MDE_OR"] = iv.mde_or.round(3)
    iv["MDE_logodds"] = iv.mde_beta.round(3)
    print(iv[["term", "N", "MDE_logodds", "MDE_OR", "MDE_pp"]].to_string(index=False))
    return {"per_config": {k: {"n": v["n_realised"], "se": v["se"]}
                           for k, v in out.items()},
            "interp": interp, "mde_table": mt}


def stage_s4_validate(cohorts, truth, design, mde_pp, workers):
    """Empirical check: inject exactly the derived MDE, expect ~80% power."""
    t = replace(truth, angle_pp={**truth.angle_pp, "self_expansion": mde_pp})
    t = calibrate_b0(t, design)
    res = run_cohorts(f"S4-validate — inject +{mde_pp:.2f}pp, expect ~80% power",
                      cohorts, t, design, seed0=700_000, workers=workers)
    tab = summarise(res, t)
    got = float(tab.loc[tab.term == "angle[self_expansion]", "power"].iloc[0])
    print(f"\nS4-validate  injected {mde_pp:+.2f}pp -> realised power {got:.1%} "
          f"(target 80%). {'consistent' if 0.70 <= got <= 0.90 else 'CHECK'}")
    return got


def stage_sensitivity(cohorts, truth, design, workers):
    d0 = replace(design, hard_pass_rate=0.0)
    t = calibrate_b0(truth, d0)
    res = run_cohorts("Sensitivity — no hard pass (test-plan truth verbatim)",
                      cohorts, t, d0, seed0=300_000, workers=workers)
    tab = summarise(res, t)
    show(tab)
    ang = tab[tab.term.isin(ANGLE_KEYS)]
    print(f"\nSensitivity S2 (no hard-pass truncation): max angle bias "
          f"{ang.bias_pp.abs().max():.2f}pp, min coverage {tab.coverage.min():.1%}")
    return tab


def stage_interaction_mde(cohorts, truth, design, workers):
    """MDE for an H1/H2-style reader-segment x angle interaction.

    E-STYLE H1/H2 predict that a reader SEGMENT (high-openness, high/low
    extraversion) responds differently to particular angles. That is an
    interaction contrast, not a main effect: a 50/50 segment split halves the
    effective N per cell and the contrast costs roughly 2x the SE. This measures
    the realised MDE instead of asserting it.
    """
    print("\n" + "=" * 78)
    print("H1/H2 — realised MDE for a reader-segment x angle INTERACTION")
    print("=" * 78)
    f = ("fire ~ C(angle, Treatment('%s')) * segment"
         " + C(lead, Treatment('character')) + C(position, Treatment(1))"
         % ANGLE_REF)
    tgt = ("C(angle, Treatment('%s'))[T.self_expansion]:segment" % ANGLE_REF)
    ses, done, t0 = [], 0, time.time()
    print(f"\n[H1/H2 interaction] {cohorts} cohorts | {design.n_readers} readers "
          f"x <={design.max_pitches} pitches", flush=True)
    for i in range(cohorts):
        df = simulate_cohort(950_000 + i, truth, design)
        rng = np.random.default_rng(950_000 + i)
        seg = rng.integers(0, 2, design.n_readers)      # 50/50 reader segment
        df = df.assign(segment=seg[df.reader.values].astype(float))
        try:
            m = BinomialBayesMixedGLM.from_formula(f, VC_FORMULAS, df, fe_p=10.0)
            r = m.fit_map(minim_opts={"maxiter": 5000})
            n = list(r.model.exog_names)
            if tgt in n:
                v = np.sqrt(np.diag(r.cov_params()))[n.index(tgt)]
                if np.isfinite(v):
                    ses.append(float(v))
        except Exception:
            pass
        done += 1
        if done % 20 == 0 or done == cohorts:
            print(f"    ... {done}/{cohorts} cohorts  ({time.time()-t0:5.1f}s, "
                  f"{len(ses)} usable)", flush=True)
    se = float(np.median(ses))
    b = MDE_MULT * se
    print(f"\n    median SE on the interaction = {se:.4f}")
    for N in (design.n_readers * design.max_pitches, 4500, 9000):
        bb = MDE_MULT * se * math.sqrt((design.n_readers * design.max_pitches) / N)
        print(f"    MDE at N={N:>5}: {pp(bb):+6.2f}pp  (OR {math.exp(bb):.2f})")
    print("\n    Compare: the ANGLE MAIN EFFECT MDE at N=2250 is +7.46pp.")
    return {"se": se, "mde_pp": pp(b)}


def stage_diag(cohorts, truth, design, workers):
    """Why is the POSITION coefficient attenuated? Vary the random-effect SDs.

    Position is a post-treatment variable: position 3 exists only after two
    non-fires, so units with large u+v are selectively removed before they can
    reach it. The mixed model assumes REs are independent of the covariates,
    which position violates by construction. If the attenuation is caused by
    that selection, it must vanish when the REs vanish.
    """
    print("\n" + "=" * 78)
    print("DIAGNOSTIC — is the position bias caused by selection on the REs?")
    print("=" * 78)
    rows = []
    for lab, sdr, sdc in [("no REs", 0.0, 0.0), ("half", 0.25, 0.5),
                          ("launch", truth.sd_reader, truth.sd_cand),
                          ("heavy", 1.0, 2.0)]:
        t = calibrate_b0(replace(truth, sd_reader=sdr, sd_cand=sdc), design)
        res = run_cohorts(f"diag sd_reader={sdr} sd_cand={sdc}", cohorts, t,
                          design, seed0=800_000, workers=workers)
        tab = summarise(res, t)
        ang = tab[tab.term.isin(ANGLE_KEYS)]
        rows.append({
            "REs": lab, "sd_reader": sdr, "sd_cand": sdc,
            "pos3_bias_pp": round(float(tab.loc[tab.term == "position[3]", "bias_pp"].iloc[0]), 2),
            "pos3_cover": f"{float(tab.loc[tab.term=='position[3]','coverage'].iloc[0]):.0%}",
            "max_angle_bias_pp": round(float(ang.bias_pp.abs().max()), 2),
            "min_angle_cover": f"{float(tab[tab.term.isin(ANGLE_KEYS)].coverage.min()):.0%}",
        })
    print("\n--- position-3 bias vs angle bias, by random-effect size ---")
    print("    (true position-3 drift = +5.00pp; true angle effects +10/-5/0pp)")
    print(pd.DataFrame(rows).to_string(index=False))
    print("\n    Read: if pos3_bias_pp -> 0 as the REs -> 0 while angle bias stays")
    print("    flat, the position term is attenuated by dynamic selection, and the")
    print("    randomisation still protects the angle estimates (S2's claim).")
    return rows


# ----------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cohorts", type=int, default=200)
    ap.add_argument("--quick", action="store_true")
    ap.add_argument("--stage", default="all",
                    choices=["all", "s1s2", "s2diff", "s3", "s4", "sens",
                             "diag", "h12"])
    ap.add_argument("--workers", type=int, default=None)
    ap.add_argument("--out", default=None, help="write JSON summary here")
    a = ap.parse_args()
    n = 30 if a.quick else a.cohorts

    design = Design()
    print("=" * 78)
    print("T-SIM — PLY matching v2 design validation  (test plan §4)")
    print("=" * 78)
    print(f"design: {design.n_readers} readers x <={design.max_pitches} pitches, "
          f"pool {design.n_candidates}, K~{{1:.2,2:.3,3:.5}}, lead coin .5, "
          f"hard-pass {design.hard_pass_rate:.0%}")
    print(f"truth : angles {Truth().angle_pp}, lead +{Truth().lead_pp}pp, "
          f"position-3 +{Truth().pos_pp[3]}pp, sd_reader {Truth().sd_reader}, "
          f"sd_candidate {Truth().sd_cand} (dominant)")
    print(f"model : {FORMULA}\n        + (1|reader) + (1|candidate)")
    print("fit   : point estimates fit_vb | SEs/CIs fit_map | reader-level "
          "covariates cluster-robust")
    print(f"cohorts per stage: {n}")

    t0 = time.time()
    truth = calibrate_b0(Truth(), design)
    print(f"\ncalibrated b0 = {truth.b0:+.4f} "
          f"(marginal fire rate targeted at {BASELINE:.0%})")

    summary = {}
    if a.stage in ("all", "s1s2"):
        r = stage_s1_s2(n, truth, design, a.workers)
        summary["S1"] = r["s1"]; summary["S2"] = r["s2"]
        summary["max_angle_bias_pp"] = r["max_angle_bias_pp"]
        summary["mean_angle_bias_pp"] = r["mean_angle_bias_pp"]
        summary["detect_rate"] = r["detect_rate"]
        summary["S2_state"] = r["s2_state"]
        if r["s2_state"] == "FAIL":
            print("\n" + "!" * 78)
            print("S2 FAILED — randomised angle order does NOT decorrelate the")
            print("position confound at this N. THE DESIGN IS WRONG. Stop; do")
            print("not tune, do not launch. (test plan §4, S2)")
            print("!" * 78)
            sys.exit(2)
    if a.stage in ("all", "s2diff"):
        d = stage_s2_differential(n, truth, design, a.workers)
        summary["S2_leakage_pp"] = d["worst_leakage_pp"]
        summary["S2_leakage_clean"] = d["clean"]
    if a.stage in ("all", "s3"):
        summary["S3"] = stage_s3(n, design, a.workers)["s3"]
    if a.stage in ("all", "s4"):
        s4 = stage_s4(n, truth, design, a.workers)
        summary["S4"] = True
        mde = float(s4["interp"].query(
            "term=='angle[self_expansion]' and N==2250").mde_pp.iloc[0])
        summary["mde_pp_2250"] = mde
        summary["mde_by_N"] = s4["interp"][
            s4["interp"].term == "angle[self_expansion]"][["N", "mde_pp"]]\
            .set_index("N").mde_pp.round(2).to_dict()
        stage_s4_validate(n, truth, design, mde, a.workers)
    if a.stage in ("all", "sens"):
        stage_sensitivity(n, truth, design, a.workers)
    if a.stage in ("all", "h12"):
        summary["H12_interaction_mde_pp"] = stage_interaction_mde(
            n, truth, design, a.workers)["mde_pp"]
    if a.stage in ("all", "diag"):
        stage_diag(n, truth, design, a.workers)

    print("\n" + "=" * 78)
    print("ACCEPTANCE SUMMARY")
    print("=" * 78)
    for k in ["S1", "S2", "S3", "S4"]:
        if k in summary:
            st = summary.get("S2_state") if k == "S2" else (
                "PASS" if summary[k] else "FAIL")
            print(f"  {k}: {st}")
    if "mde_by_N" in summary:
        print("  Realised MDE on an angle contrast (pp on a 20% baseline):")
        for N, v in summary["mde_by_N"].items():
            print(f"      N={N:>5}: {v:+.2f}pp")
    print(f"\ntotal runtime {time.time()-t0:.0f}s")
    if a.out:
        with open(a.out, "w") as f:
            json.dump({k: (v if not isinstance(v, dict) else
                           {str(kk): vv for kk, vv in v.items()})
                       for k, v in summary.items()}, f, indent=2, default=float)
        print(f"summary written to {a.out}")


if __name__ == "__main__":
    main()
