# Rejected-Ticket Triage

| At a Glance | |
|---|---|
| Question | When a tester rejects a ticket, whose job is the fix? |
| Rule | Ask one thing: do the written acceptance criteria already say it? |
| Output | A label (spec gap or implementation gap) and the next step |
| Read time | About 2 minutes |

## The Problem

Rejected tickets can bounce between the tester, the developer and the owner. The developer says it was never in the ticket, the tester says it is obvious. The time goes on the argument, while the real cause, if there is one, is a missing line in the requirement.

## What I Did

- **Reduced the argument to one question:** does a written acceptance criterion already say what was expected?
- **Gave each answer a label and an owner.** Yes is an implementation gap: back to the developer, with the criterion that fails. No is a spec gap: to the requirement owner, with the missing criterion written out.
- **Wrote the rule as a prompt,** so the label and the missing line come out the same way each time.

```prompt
Here is a rejected ticket and its acceptance criteria.
1. Quote the criterion the build breaks. If there is none, say "no criterion".
2. If a criterion is broken, label it an implementation gap and say what to fix.
3. If none is, label it a spec gap and write the missing criterion.
```

## The Result

This is a rule, not a measured result: I have no data on how it changed a team, and the tickets below are made up. Pick one of six sample tickets to see where it goes. Three go back to the developer and three go to the owner. The question never asks who is at fault, only where the sentence is missing.

<!-- site:scope -->

| Sample ticket | Criteria say it? | Where it goes |
|---|---|---|
| Export button does nothing | Yes | Implementation gap |
| Export has no totals row | No | Spec gap |
| Dates show in the wrong format | Yes | Implementation gap |
| Customer expected a PDF | No | Spec gap |
| A large file freezes the export | No | Spec gap |
| Columns are in the wrong order | Yes | Implementation gap |

<!-- /site:scope -->

## What I Would Change

- Counting each label for a few releases will show whether the same spec gaps repeat, and which kind of requirement needs a template.
- Asking the owner to add every missing criterion to the ticket, not only answer it, makes the fix last.
- Trying the prompt on ten real rejected tickets will show where its labels disagree with a person.

<!-- site:fold -->

[Read the full version](full/03-rejected-ticket-triage.md)

<!-- /site:fold -->
