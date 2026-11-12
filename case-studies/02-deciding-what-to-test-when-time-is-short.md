# Testing Decisions

| At a Glance | |
|---|---|
| Question | What do you test first when time is fixed, and what do you tell the person who decides to ship? |
| Rule | Critical first, about 60/30/10 of the time, one whole workflow at a time |
| Surprise | 75% fewer live-site test runs, but not faster |
| Output | A four-line release summary |
| Read time | About 2 minutes |

## The Problem

Every release has more to check than hours to check it. Without a rule, the order depends on who is testing and how they feel that day. The item nobody reached is the one that breaks in production, and nobody knew it was skipped.

## What I Did

- **Wrote a five-part rule.** Critical flows first, split the time about 60/30/10, finish one whole workflow before the next, raise known problem areas, start with what changed.
- **Built it into my test project.** A script runs 16 of 65 browser tests on a pull request, and everything when the change touches the tests, how they run, or carries a label. If it cannot tell, it runs everything.
- **Wrote a four-line release summary:** what I tested, what I did not test and why, what I found, and my recommendation.

```prompt
I have 8 hours to test this release. Notes are in release-notes.md.
1. List every flow. Mark each critical (revenue or core process), medium or low.
2. Raise anything named in a bug report or that failed last time.
3. Plan the hours: 60% critical, 30% medium, 10% low. Finish one whole workflow before the next.
4. When time is up, write four lines: tested, not tested and why, found, recommend.
```

## The Result

Smoke runs make 75% fewer test runs against the live site, but they are not faster: the 60-second performance job is the slowest part either way. The real benefit is less noise, so pitching it as speed would have been wrong. The summary's second line, what was not tested, earns the trust: it turns a quiet risk into a decision someone makes on purpose.

<!-- site:run testing -->

```text
$ plan-release --hours 8
critical      60%  4.8 h
medium        30%  2.4 h
low           10%  0.8 h
pull request  16 of 65 browser tests
summary       tested, not tested, found, recommend
```

<!-- /site:run -->

An illustration of the prompt above: the hours are an example, the 16 of 65 is real.

## What I Would Change

- Counting escaped bugs by tier will show whether 60/30/10 is the right split, and turn a rule of thumb into a measured one.
- Writing the reason for each tier beside the item lets others challenge it and makes the order easier to trust.
- Trying the summary on two releases will show what readers still need from it.

<!-- site:fold -->

[Read the full version](full/02-deciding-what-to-test-when-time-is-short.md)

<!-- /site:fold -->
