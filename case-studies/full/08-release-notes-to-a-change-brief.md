# Release Notes to a Change Brief: Full Version

The longer version of the case study: the rule, the brief, the sample changes and the limits. Every change, date and name here is made up to show the idea; none comes from a real project or employer.

## The Question

A release ships with a list of changes. Before anyone writes to customers, someone has to decide which of them the customer needs to hear about. Two lists look alike and are not:

- **Release notes** record what changed, for the team and for anyone who audits the release. They are complete, and every line is true.
- **A change brief** tells a customer what changes for them. It is short, and it leaves things out on purpose.

Sending the release notes as the brief can hide the few lines that matter among the many that do not. Sending a brief with no actions can leave customers to find out when something stops working. Neither effect was measured for this study.

## The Rule

Ask one question of every change: **does the customer have to do something?**

- Yes: it goes in an action box at the top of the brief, with what to do and by when.
- No, but the customer will notice: it gets one plain line.
- No, and the customer cannot see it: it stays in the release notes. The question is not asked of these, because there is nobody to ask it of.

The question does not ask how big or how hard the change was. A one-line change to a sign-in page can need an action box. A month of work on a database can need nothing.

## The Brief

One page, in the order a customer reads:

```text
Harbourline 2.4: what changes for you
Do this (action box)
  What changes, what to do, by when
New and improved
  One plain line for each visible change
Who to ask
  One support address and the date of the next release
```

## Six Sample Changes

These are made up, for the release of an imaginary booking app.

| Sample change | Kind | Customer must act? | Where it goes | Why |
|---|---|---|---|---|
| Bookings can be moved to another day | New feature | No | One line | A customer will notice it, and nothing breaks if they ignore it. |
| Old booking links stop working | Change or removal | Yes | Action box | A saved link will fail, so the customer needs to replace it before the date. |
| Password reset email arrives faster | Fix | No | One line | A customer will notice it; nothing to do. |
| Sign-in asks for an emailed code | Change or removal | Yes | Action box | The customer needs access to the email address on the account, and must know before the day. |
| Database library updated | Behind the scenes | Not asked | Release notes only | No customer can see it. |
| Receipts no longer cut off long names | Fix | No | One line | A customer will notice it; nothing to do. |

## The Prompt

The same rule written for an AI helper, so the brief comes out the same way every release:

```prompt
Here are the release notes for Harbourline 2.4. Write a one-page change brief for customers.
1. Put every change that needs the customer to act in a box at the top, with what to do and by when.
2. Give each other visible change one plain line.
3. Leave out changes a customer cannot see, and list what you left out.
```

The last instruction matters: a person who reads the list of what was left out can catch a change that was wrongly hidden.

## What I Do Not Know

- Whether it reduces support emails. I have not measured it.
- Whether a customer reads a brief at all. A brief nobody opens has the same effect as no brief.
- How often a change that looks internal is not. A database library that changes how long a report takes is invisible in the notes and visible to the customer. The rule trusts the person reading the notes to know.
- How to word an action box for a change that needs action from some customers and not others. The sample changes do not cover it.

## What I Would Change

- Count support emails for one release with a brief and one without.
- Ask support to read the brief before it goes out, because they know which changes cause questions.
- Try the prompt on ten real sets of release notes and note where its choices differ from a person's.

## Related Piece

In the training portfolio, [Jira for New Testers](https://rizvihiqrar.github.io/training-portfolio/04-technical-enablement/jira-workflow-guide/) teaches how a ticket reaches Done. A fixed ticket is the raw material for a line in the release notes, and this rule decides whether a customer ever reads about it.
