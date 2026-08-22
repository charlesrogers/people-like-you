# T-SIM results — matching v2 statistical validation

**Gate: `specs/matching-v2-test-plan.md` §4. Design under test: `matching_algo-v2.md` §7 + §11.**
**Script:** `scripts/matching_v2_sim.py` · **Setup:** `scripts/requirements-sim.txt` · **Full run log:** `specs/matching-v2-tsim-run.txt`
Run 2026-08-22. No app dependencies; numpy/pandas/scipy/statsmodels only.

---

## Verdict

| Gate | Result | Number |
|---|---|---|
| **S1 recovery** | **PASS** | min CI coverage 92.8% (bar: ≥90%); +10pp angle detected in 95.2% of cohorts (bar: ≥80%) |
| **S2 confound separation** | **PASS** | mean \|angle bias\| **0.07pp ± 0.14** (bar: <1pp). Drift leakage ≤ **0.044pp**, indistinguishable from zero |
| **S3 null safety** | **PASS** | per-contrast FPR 5.1–6.6% (bar: ≤5–7%); joint 3-df Wald 6.6% |
| **S4 power honesty** | **PASS** | MDEs below; empirically validated at 78.0% realised power vs 80% target |

**S2 is the gate Charles's C12 concern rides on, and it passes decisively. The design is sound — launch is not blocked on statistics.**

Two things must change before launch, neither in the sequencing design: the **fitter recipe** for
`scripts/matching_v2_analysis.py` (§3 below) and **hypothesis H1/H2 in E-STYLE** (§5).

---

## 1. What was simulated

Exactly the §7.1 assignment scheme, 2,000 cohorts per gate:

- 50 readers × up to 45 pitches (realised N = 2,250 events/cohort, mean fire rate 0.216)
- `k_assigned` ~ {1: .2, 2: .3, 3: .5}; `angle_order` = k distinct angles uniform without replacement from 4
- `lead` = fair coin **per attempt**, not pre-assigned
- fire closes the sequence; soft pass advances; **hard pass (15%, correlated with candidate quality) closes it early** — added beyond the test plan's stated truth because it is real truncation and makes S2 strictly harder. Sensitivity run with hard-pass = 0 is in §6.
- Injected truth: `self_expansion` **+10pp**, `comfort` **−5pp**, `i_sharing` 0, lead(interest) **+5pp**, **position-3 drift +5pp**, `u_reader` ~ N(0, 0.5²), `v_candidate` ~ N(0, 1.0²) — candidate variance deliberately dominant. `β₀` calibrated numerically so the marginal fire rate lands on 20%.

## 2. S1 / S2 — recovery and confound separation (2,000 cohorts)

```
                 term  fitter true_pp mean_pp bias_pp mcse_pp emp_sd med_se coverage  power
angle[self_expansion]  vb+map  +10.00   +9.99   -0.01   +0.15 +0.155 +0.148    93.8%  95.2%
     angle[i_sharing]  vb+map   +0.00   -0.10   -0.10   +0.12 +0.165 +0.156    94.0%   6.0%
       angle[comfort]  vb+map   -5.00   -5.11   -0.11   +0.10 +0.172 +0.164    94.2%  58.5%
       lead[interest]  vb+map   +5.00   +5.11   +0.11   +0.10 +0.117 +0.110    92.8%  74.4%
          position[2]  vb+map   +0.00   +0.09   +0.09   +0.10 +0.134 +0.125    92.8%   7.2%
          position[3]  vb+map   +5.00   +5.19   +0.19   +0.16 +0.185 +0.171    93.2%  42.4%
            pickiness cluster    +0.00   +0.06   +0.06   +0.19 +0.268 +0.251    93.3%   6.7%
recovered RE sd (VB): reader 0.492 (true 0.500), candidate 0.990 (true 1.000)
```

Every coefficient recovers to within 0.2pp. Coverage 92.8–94.2% against a 95% nominal.

### S2, done decisively

An absolute bias threshold conflates two different things — leakage from the position confound (what
S2 is about) and the estimator's own shrinkage of any non-zero coefficient (present with or without
drift). So the same design was run twice, drift ON and drift OFF, 2,000 cohorts each:

```
                 term  bias_drift_pp  bias_nodrift_pp  leakage_pp  MC_95ci  clean
angle[self_expansion]          0.107            0.063       0.044 +/-0.409   True
     angle[i_sharing]         -0.088           -0.078      -0.010 +/-0.331   True
       angle[comfort]         -0.105           -0.062      -0.043 +/-0.274   True
```

Injecting a +5pp position-3 drift moves the angle estimates by at most **0.044pp**, well inside
Monte-Carlo error. **Randomised angle order plus an explicit position term do decorrelate the
confound.** That is the direct answer to C12.

## 3. The fitter recipe — a binding finding for `matching_v2_analysis.py`

The §11 model is right. **How you fit it decides whether it works.** statsmodels has no true
marginal-likelihood GLMM, and its two `BinomialBayesMixedGLM` fitters fail in exactly opposite ways:

| | `fit_vb` | `fit_map` |
|---|---|---|
| Variance components | **correct** (reader .490/.500, cand .992/1.000) | **collapse** — reader 0.000 in 40/40 cohorts, cand → .74 |
| Angle point estimate | **unbiased** (+10.15 vs +10.00pp) | shrunk (+9.20pp) |
| Position-3 point estimate | **unbiased** (+5.28 vs +5.00pp) | **attenuated −2.47pp** (+2.53pp) |
| CI coverage on angle | **80%** (SE .102 vs empirical SD .157) | **94–95%** (SE .148) |

`fit_map`'s position failure has a mechanism: it is a joint mode over (β, random effects, variance
components), so the frailty adjustment collapses to the boundary. Position is a *post-treatment*
variable — only pairs that failed to fire twice reach position 3 — so without frailty adjustment the
high-frailty units that were selectively removed drag the estimate down. Under the **pure null** with
`fit_map` alone, `position[3]` reads **−1.79pp with an 8.6% false-positive rate**: it manufactures
drift out of nothing. `fit_vb` estimates it at +0.07pp under the null.

Scaling the random effects confirms the mechanism (300 cohorts each, `--stage diag`):

```
   REs  sd_reader  sd_cand   fit_map pos3 bias    corrected recipe pos3 bias
no REs       0.00      0.0          +0.27pp                      +0.67pp
  half       0.25      0.5          -1.76pp                      +0.20pp
launch       0.50      1.0          -2.40pp                      +0.08pp
 heavy       1.00      2.0          -4.03pp                      -0.52pp
```

**Required recipe:**
1. **Point estimates** → `fit_vb`
2. **Standard errors, CIs, contrasts** → `fit_map`
3. **`pickiness` and any other between-reader covariate** → logistic GLM with **reader-cluster-robust** SEs. `fit_map`'s collapsed reader component treats a reader's 45 observations as independent (SE .190 vs empirical SD .301 → 80% coverage); clustering fixes it (SE .243 → 93%).
4. **Variance components** → `fit_vb`, descriptive only.

## 4. S3 — null safety (2,000 cohorts, all true effects 0)

Every coefficient recovers to within 0.16pp of zero. False-positive rates:

```
    self_exp vs ref        6.2%        self_exp vs i_shar     6.0%
    i_shar vs ref          5.1%        self_exp vs comfort    6.6%
    comfort vs ref         5.7%        i_shar vs comfort      5.5%
    joint 3-df Wald        6.6%        ANY of the 6           23.6%   <-- uncorrected
```

Per-contrast rates sit in the 5–7% band. **The 23.6% family-wise rate is the thing to guard**: all six
pairwise angle comparisons are available, and testing them all uncorrected produces a spurious
"winning angle" in nearly a quarter of null cohorts. Pre-register the specific contrasts, or gate on
the joint 3-df Wald test (6.6%) first.

## 5. S4 — realised MDEs for the E-STYLE pre-registration

Two-sided α = .05, 80% power, percentage points on a 20% baseline fire rate. Derived from median
realised SEs; the N=2,250 figure was validated by injecting exactly +7.46pp and measuring **78.0%**
realised power.

| Term | N = 1,200 | N = 2,250 | N = 4,500 |
|---|---|---|---|
| **Angle contrast** (vs reference) | **+10.62pp** (OR 1.77) | **+7.46pp** (OR 1.51) | **+5.11pp** (OR 1.34) |
| **Content lead** (interest vs character) | **+7.58pp** (OR 1.52) | **+5.37pp** (OR 1.36) | **+3.70pp** (OR 1.24) |
| **Position-3 drift** | **+12.50pp** (OR 1.93) | **+8.75pp** (OR 1.61) | **+5.96pp** (OR 1.40) |

*(Realised-N configurations: 50 readers × 24 pitches = 1,200; 50 × 45 = 2,250; 100 × 45 = 4,500. Exact-N figures interpolate the median SE by √N.)*

**Consequences for the pre-registered hypotheses (test plan §5):**

- **H3** (interest-led beats character-led overall) is the best-powered: detectable at **+5.4pp** by the Phase-R exit gate of 1,200 events… only if the true effect is that large. At the 1,200-event exit gate the lead MDE is +7.58pp.
- **H4** (position-3 drift, +2–8pp) is **underpowered across the whole range**: MDE +8.75pp at 2,250 events, +5.96pp at 4,500. Most of the pre-registered interval is undetectable. Either widen the predicted magnitude, register it as descriptive-only, or accept it reads out at 4,500+ events.
- **H1 and H2 are reader-segment × angle interactions** (high-O → `self_expansion`/`i_sharing`; high-E → `i_sharing`, low-E → `comfort`). Measured directly (`--stage h12`, 100 cohorts, 50/50 reader segment, `fire ~ angle * segment + lead + position`, median interaction SE 0.2996):

  | | N = 2,250 | N = 4,500 | N = 9,000 |
  |---|---|---|---|
  | Segment × angle interaction MDE | **+16.66pp** (OR 2.31) | **+11.16pp** (OR 1.81) | **+7.56pp** (OR 1.52) |

  That is **2.2× the main-effect MDE at the same N**. **H1 and H2 cannot be tested at launch cohort size** — an interaction would have to be larger than the entire baseline fire rate to register. Reclassify them as exploratory, powered for a ≥9,000-event cohort, not as launch hypotheses.

## 6. Sensitivity — no hard-pass truncation (500 cohorts)

Test-plan truth verbatim, `hard_pass_rate = 0`: max angle bias **0.11pp**, min coverage 92.8%,
position-3 bias −0.01pp. The hard-pass mechanic does not change any conclusion.

## 7. Reproducing

```
uv venv --python 3.13 .venv-sim
uv pip install --python .venv-sim/bin/python -r scripts/requirements-sim.txt
.venv-sim/bin/python scripts/matching_v2_sim.py --cohorts 2000 --stage s1s2
.venv-sim/bin/python scripts/matching_v2_sim.py --cohorts 2000 --stage s2diff
.venv-sim/bin/python scripts/matching_v2_sim.py --cohorts 2000 --stage s3
.venv-sim/bin/python scripts/matching_v2_sim.py --cohorts 200  --stage s4
.venv-sim/bin/python scripts/matching_v2_sim.py --cohorts 500  --stage sens
.venv-sim/bin/python scripts/matching_v2_sim.py --cohorts 300  --stage diag
```

Full-gate wall time ≈ 38 min on 10 workers. `--quick` (30 cohorts) smoke-tests every stage in ~1 min,
but 30 cohorts leaves ±1.3pp of Monte-Carlo error on the S2 statistic — the script reports
`INCONCLUSIVE` rather than a verdict when the 1pp threshold sits inside the MC interval.
