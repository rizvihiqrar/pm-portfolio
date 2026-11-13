# Release Notes to a Change Brief

| At a Glance | |
|---|---|
| Question | Which changes in a release does a customer need to hear about, and how? |
| Rule | Ask one thing: does the customer have to do something? |
| Output | A one-page change brief, with the actions first |
| Read time | About 2 minutes |

## The Problem

Release notes are written for the people who built the release: "Updated the booking service." A customer reads them looking for one thing, whether anything changes for them. The answer can sit in a long list, so a customer may learn about a change only when it breaks, and support may answer the same email again and again.

## What I Did

- **Sorted every change by one question:** does a customer have to do something?
- **Gave each answer a place.** Yes goes in a box at the top with what to do and by when. No, but the customer will notice, gets one line. Changes nobody outside the team can see stay in the release notes.
- **Kept the brief to one page,** in the order a customer reads: what to do, what is new, who to ask.
- **Wrote the rule as a prompt,** so the brief comes out the same way every release.

```prompt
Here are the release notes for Harbourline 2.4. Write a one-page change brief for customers.
1. Put every change that needs the customer to act in a box at the top, with what to do and by when.
2. Give each other visible change one plain line.
3. Leave out changes a customer cannot see, and list what you left out.
```

## The Result

This is a rule, not a measured result: I have no data on how it changed support emails, and the changes below are made up. Pick one of six changes in an imaginary release to see where it goes. Two need the customer to act, three get one line and one stays in the release notes. The question never asks how big the change is, only whether the reader has to do something.

<!-- site:scope -->

| Sample change | Customer must act? | Where it goes |
|---|---|---|
| Bookings can be moved to another day | No | One line |
| Old booking links stop working | Yes | Action box |
| Password reset email arrives faster | No | One line |
| Sign-in asks for an emailed code | Yes | Action box |
| Database library updated | Not asked | Release notes only |
| Receipts no longer cut off long names | No | One line |

<!-- /site:scope -->

## What I Would Change

- Counting support emails for one release with a brief and one without will show whether it helps.
- Asking support to read the brief before it goes out will catch changes that will cause questions.
- Trying the prompt on ten real sets of release notes will show where its choices differ from a person's.

<!-- site:fold -->

[Read the full version](full/08-release-notes-to-a-change-brief.md)

<!-- /site:fold -->
