![Product Portfolio: decisions explained, with the numbers shown](docs/assets/banner.svg)

# Product portfolio

Small case studies from real work on my own projects. Each one shows how I find the problem, decide what to build, and check whether it worked, with the numbers in the open. I am a QA analyst moving toward product and program roles, so the pieces lean on quality, risk and measurement. No made-up users and no borrowed company data: where a piece needs real people (user research), it waits until I have real, consented interviews.

> **If you have five minutes**, read these two. Each is about two pages and ends with what I would change:
>
> - [**Prioritizing a backlog of 570 ideas with one person's time**](case-studies/01-prioritizing-the-ideas-plan.md): how I cleaned a list of 843 entries to 570 real ideas, sorted them, and kept the percent done honest when the list grew
> - [**Deciding what to test when time is short**](case-studies/02-deciding-what-to-test-when-time-is-short.md): a five-part rule, how the same rule is built into a public test project, and a measurement that surprised me

## In plain English

A product decision is a choice with a cost: what to build first, what to leave out, what to check before shipping. Each case study here shows one real choice: the problem, the limits, what I did, what I measured, and what I got wrong or would change.

## At a glance

- 2 case studies so far, with more planned (see [the pieces](#the-pieces))
- Every study uses the same frame: problem, constraints, the method, what I measured, what I would change
- Real numbers from my own work, each traceable to a plan or a public repository; a rule of thumb is labelled as one
- One measured surprise: a change I expected to be faster was not, and the study says so
- A short release summary template: what was tested, what was not, what was found, my recommendation
- A [check](scripts/check-readme.mjs) that fails the build if this page links to a missing file or forgets a new case study

## The pieces

| # | Piece | What it shows | Status |
|---|---|---|---|
| 1 | [Prioritizing a backlog of 570 ideas](case-studies/01-prioritizing-the-ideas-plan.md) | Sorting by fit, size and dependency; honest progress tracking | In review |
| 2 | [Deciding what to test when time is short](case-studies/02-deciding-what-to-test-when-time-is-short.md) | Risk-based choices, and telling a decision maker what was not covered | In review |
| 3 | Metrics case study | A North Star metric, a funnel, and how to investigate a metric drop | Planned |
| 4 | Requirements document for one feature | Problem, goals, success measures, user stories, edge cases, trade-offs | Planned |
| 5 | Low-fidelity prototype with a validation plan | A key flow and how to test it with users | Planned |
| 6 | Product teardown | What works, what does not, what to improve, for one public app | Planned |
| 7 | User research case study | Five consented interviews, recurring pain points, a problem statement | Planned (waits for real interviews) |

## How each study is built

| Part | What it answers |
|---|---|
| Problem | What was wrong or unknown, in plain words |
| Constraints | Time, people, money and rules I could not change |
| The method (headed "What I did" or "The rule I use") | What I did and why, not only the result |
| What I measured | Numbers, where they came from, and anything that surprised me |
| What I would change | Honest weaknesses and the next test |

## Words used on this page

| Term | Meaning |
|---|---|
| Prioritization | Deciding what to do first, and what not to do |
| Smoke test | A short check of the most important paths, run first because it is fast |
| Regression test | A test that checks something that used to work still works |
| Tier | A group of items with the same importance: critical, medium or low |
| North Star metric | The one number that best shows whether the product is delivering value |
| Funnel | The steps people go through, with how many drop out at each step |
| Acceptance criteria | The conditions a feature must meet to count as done |

## Roadmap

One small piece at a time, each through its own pull request, and this page is updated with every piece. The test automation work behind these studies is in [qa-automation-platform](https://github.com/rizvihiqrar/qa-automation-platform), and my courses and lesson plans are in [training-portfolio](https://github.com/rizvihiqrar/training-portfolio).
