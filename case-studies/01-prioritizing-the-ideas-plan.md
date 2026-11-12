# Organizing Ideas

| At a Glance | |
|---|---|
| Question | What do you build first when one person has far more ideas than time? |
| Method | Clean the list, sort three ways, bundle the small ones, date milestones |
| Key number | 29 of 171 first-choice ideas built (17%) |
| Read time | About 2 minutes |

## The Problem

I collected 843 ideas from job postings, courses and my own gaps, and I can build one small piece a day. The raw list did not say what to build next, what to skip, or how far along I was.

## What I Did

- **Cleaned the list first.** 65 entries were notes and 209 were duplicates, which left 570 real ideas.
- **Sorted three ways instead of scoring.** Who is it for, how big is it, and does it wait on money or a setting only I can change.
- **Bundled the small ones.** Two or three Small ideas for the same package go in one pull request, so setup is paid once.
- **Dated milestones, not items.** One change then moves one date, not hundreds.
- **Left some things out on purpose,** such as anything needing a paid account.

```prompt
Read ideas.md (one idea per line).
1. Remove entries that are notes or duplicates of another entry.
2. Tag each idea: tier 1, 2 or 3; size Small, Medium or Large; depends on money, a setting, people or nothing.
3. Print the count after each step.
4. Group the Small ideas by package so each group fits one pull request.
```

## The Result

29 of the 171 ideas for my first-choice roles are built (17%, as of 10 November), each in a public package with tests, at about one build day per working day. That is the number to watch. The overall 7.4% is smaller on purpose, because the list also holds ideas I only build when a posting asks for one. When I added 46 entries the percent fell from 7.7% to 7.4%, and I left it falling, so the number stays honest.

<!-- site:run ideas -->

```text
$ sort-ideas ideas.md
read     843 entries
removed  65 notes and 209 duplicates
570      real ideas
171      for first-choice roles
29       built (17%)
```

<!-- /site:run -->

An illustration of the prompt above, using the real counts.

## What I Would Change

- A simple score (fit times size, minus dependency risk) will make the order defensible, not gut feel.
- An ID and a size the day each idea is written will close the gap in the 13 unnumbered sections.
- Re-checking sizes on build day will shrink the Medium total, which was sized from titles.

<!-- site:fold -->

[Read the full version](full/01-prioritizing-the-ideas-plan.md)

<!-- /site:fold -->
