# Testing the Assistant

The evaluation harness compares prompt variants with the same model, source facts, and questions. It freezes instructions, source content, criteria, request settings, and code hashes before making API calls.

## Coverage

- Regression cases cover previously observed behavior and failure cases.
- New holdout cases are reserved until a candidate is fixed. Once inspected, they become regression data.
- Difficult scenarios run three times to check consistency; repeats are not independent scenarios.
- Offline tests cover citation resolution, streaming failures, conversation state, and spend controls.

## Review

An accepted answer must complete, use valid source IDs, satisfy each scenario requirement, and receive full scores for factual grounding, citation support, and applicable uncertainty handling. Missing reviews do not count as passes. Review records bind to the exact answer hash.

**Model + manual review:** recorded model reviews and human reviews are distinguished in the metadata. Independent manual review is pending for the current results. The same model-based workflow helped design and review the cases, so scores are not independent human accuracy estimates. A valid citation ID alone does not prove a claim is supported.

The README summarizes the latest completed comparison. Detailed plans, answers, reviews, timing, costs, and historical reports stay in Git-ignored `outputs/evaluation/`. Failed and incomplete attempts are retained. Removing reports from the current tree does not remove older Git history.

Experimental prompts live in `evals/candidates/`, separate from the application's guidance. Neither v3 nor v4 was adopted: v3 accepted 23/28 responses versus 25/28 for the current prompt; v4 accepted 14/18 versus 15/18. These use different question sets and must not be compared as a trend. The v4 failures included missing the fellowship title and a required perspective citation. Both candidates helped some observed development cases, but did not improve overall acceptance on their new holdouts.

## Run

```sh
npm test
# Prepare against an explicitly reviewed public content commit:
npm run eval:portfolio -- prepare --suite development-v4 --ref 0c27829 --budget-usd 0.20
# Use the plan path printed above. This is a no-network dry run:
npm run eval:portfolio -- run --plan outputs/evaluation/<run>/plan.json
# Explicit paid inference with the development key in .env.local:
npm run eval:portfolio -- run --plan outputs/evaluation/<run>/plan.json --run
npm run eval:portfolio -- report --plan outputs/evaluation/<run>/plan.json
```

Inspect the review packet against the frozen sources and complete `reviews.json` using `reviewer: "model"` or `"human"`. Do not infer factual passes from keyword matches. Add `--export` to the report command to write a consolidated local `review-report.json`; it does not publish to GitHub or deploy.

The runner never imports dirty profile files as context. It persists each attempt before sending it, prevents concurrent runs of a plan, stops on failures or missing usage, and does not silently retry recorded attempts. Code changes invalidate a frozen run. Cost estimates include a conservative reservation guard but are not provider invoices.

For a fresh holdout, freeze a new dataset after tuning and before viewing its responses. Re-running an already observed suite is regression testing, not new held-out evidence.
