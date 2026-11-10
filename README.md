![Product Portfolio: decisions explained, with the numbers shown](docs/assets/banner.svg)

# Product portfolio

Small case studies from real work on my own projects. Each one shows how I find the problem, decide what to build, and check whether it worked, with the numbers in the open. I am a QA analyst moving toward product and program roles, so the studies lean on quality, risk and measurement. No made-up users and no borrowed company data: where a study needs real people (user research), it waits until I have real, consented interviews.

> **If you have five minutes**, read these two. Each takes about five minutes and ends with what I would change:
>
> - [**Prioritizing a backlog of 570 ideas with one person's time**](case-studies/01-prioritizing-the-ideas-plan.md): how I cleaned a list of 843 entries to 570 real ideas, sorted them, and kept the percent done honest when the list grew
> - [**Deciding what to test when time is short**](case-studies/02-deciding-what-to-test-when-time-is-short.md): a five-part rule, how the same rule is built into a public test project, and a measurement that surprised me

## In plain English

A product decision is a choice with a cost: what to build first, what to leave out, what to check before shipping. Each case study here shows one real choice: the problem, the limits, what I did, what I measured, and what I got wrong or would change.

## At a glance

- 2 case studies so far, with more on the way (see [coming next](#coming-next))
- Every study uses the same frame: problem, constraints, the method, what I measured, what I would change
- Real numbers from my own work, each traceable to a plan or a public repository; a rule of thumb is labelled as one
- One measured surprise: a change I expected to be faster was not, and the study says so
- A short release summary template: what was tested, what was not, what was found, my recommendation
- A [check](.github/scripts/check-readme.mjs) that fails the build if this page links to a missing file or forgets a new case study

## The case studies

### 1. Prioritizing a backlog of 570 ideas

*Read time: about 5 minutes. Shows: sorting by fit, size and dependency; honest progress tracking.*

**The question:** how do you decide what to build when one person has far more ideas than time?

**The short answer:** clean the list first (843 entries became 570 real ideas), then sort on three questions I can answer from a title, and track progress in a way that shows when the list grows faster than the work.

**[Read the case study](case-studies/01-prioritizing-the-ideas-plan.md)**

### 2. Deciding what to test when time is short

*Read time: about 4 minutes. Shows: risk-based choices, and telling a decision maker what was not covered.*

**The question:** a release is ready and the time to test it is fixed. What gets tested first, and what do you tell the person who decides to ship?

**The short answer:** critical flows first, a rough 60/30/10 split of the time, one whole workflow before the next, and a four-line summary that says what was not tested. The same idea runs as code in a public project, where a measured surprise changed what I would claim for it.

**[Read the case study](case-studies/02-deciding-what-to-test-when-time-is-short.md)**

## How each study is built

| Part | What it answers |
|---|---|
| Problem | What was wrong or unknown, in plain words |
| Constraints | Time, people, money and rules I could not change |
| The method (headed "What I did" or "The rule I use") | What I did and why, not only the result |
| What I measured | Numbers, where they came from, and anything that surprised me |
| What I would change | Honest weaknesses and the next test |

## Coming next

Added one piece at a time; this page is updated with each one.

- A metrics case study: a North Star metric, a funnel, and how to investigate a metric drop
- A requirements document for one feature: problem, goals, success measures, user stories, edge cases
- A low-fidelity prototype with a plan to test it with users
- A teardown of one public app: what works, what does not, what to improve
- A user research study, once I have five real, consented interviews

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

## Related work

The test automation work behind these studies is in [qa-automation-platform](https://github.com/rizvihiqrar/qa-automation-platform), and my courses and lesson plans are in [training-portfolio](https://github.com/rizvihiqrar/training-portfolio).
