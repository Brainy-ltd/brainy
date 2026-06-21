# Editable data files

These JSON files are the data source for the app. Edit them and the app updates —
no code changes needed. In dev (`npm run dev`) the page hot-reloads on save; for a
deployed build, redeploy after editing.

---

## `users.json` — all users (Trainees, Trainers, Admins)

An array of users. Each object:

| Field           | Required | Notes                                                                 |
| --------------- | -------- | --------------------------------------------------------------------- |
| `id`            | yes      | Unique id, e.g. `"u-trainee-3"`.                                       |
| `name`          | yes      | Display name.                                                          |
| `email`         | yes      | Email address.                                                         |
| `role`          | yes      | One of `"Trainee"`, `"Trainer"`, `"Admin"`.                           |
| `academicYear`  | yes      | e.g. `"Senior"`, `"Faculty"`, `"Staff"`.                              |
| `major`         | yes      | Field of study / department.                                          |
| `status`        | yes      | One of `"Learning Now"`, `"Away"`, `"On Break"`.                      |
| `password`      | yes      | Login password for this user (used by the login screen).             |
| **`avatarUrl`** | yes      | **👉 Put the profile image URL here** (see below).                    |
| `isCurrentUser` | one user | Set `true` on exactly one user — that user pre-fills the login form. |

### Login / credentials

Login is validated **only** against this file — there are no hardcoded credentials
anywhere else. A user signs in with their `email` + `password`; if the pair does not
match any user here, the login screen shows a validation error. After a successful
login, that user becomes the active profile shown throughout the app.

### Where to put a user's profile image

Set the **`avatarUrl`** field to a public image URL. Two easy options:

1. **External URL** — paste any public image link, e.g.
   `"avatarUrl": "https://example.com/photos/jane.jpg"`
2. **Local image** — drop the file into the `public/` folder (e.g.
   `public/avatars/jane.jpg`) and reference it with a root-relative path:
   `"avatarUrl": "/avatars/jane.jpg"`

Use a square image (e.g. 200×200) for best results.

---

## `feedbacks.json` — feedback board entries

An array of feedback items. Each object:

| Field            | Required | Notes                                                              |
| ---------------- | -------- | ----------------------------------------------------------------- |
| `id`             | yes      | Unique id, e.g. `"fb-5"`.                                          |
| `title`          | yes      | Short headline.                                                    |
| `description`    | yes      | Full feedback text.                                                |
| `userType`       | yes      | One of `"Trainee"`, `"Trainer"`, `"Admin"`.                       |
| `classification` | yes      | One of `"Problem"`, `"Suggestion"`, `"User Experience"`.          |
| `severity`       | yes      | One of `"Critical"`, `"Medium"`, `"Low"`.                         |
| `votes`          | yes      | Number of upvotes (affects prioritization ranking).               |
| `date`           | yes      | Display date, e.g. `"May 24, 2026"`.                              |
| `courseName`     | no       | Related course, or `"General Platform Feedback"`.                |
| `userName`       | no       | Author's display name.                                            |
| `userAvatar`     | no       | Author's image URL (same rules as `avatarUrl` above).            |

> Note: feedback submitted inside the app is saved in your browser between reloads.
> As soon as you edit `feedbacks.json`, the app re-seeds from the file so your edits
> always appear (any in-browser test submissions are cleared at that point).

---

## `library.json` — the digital library (RTB / Rwanda based)

A single object with three arrays: `resources`, `recommendations`, `activityLogs`.

### `resources` — the main catalog

| Field          | Required | Notes                                                                          |
| -------------- | -------- | ------------------------------------------------------------------------------ |
| `id`           | yes      | Unique id, e.g. `"res-7"`.                                                      |
| `title`        | yes      | Resource title.                                                                |
| `author`       | yes      | Author / trainer name.                                                         |
| `category`     | yes      | Free text trade/subject (e.g. `"Software Development"`). Filters are built from these automatically. |
| `status`       | yes      | One of `"Draft"`, `"Under Review"`, `"Feedback Stage"`, `"Approved"`, `"Published"`. |
| `format`       | yes      | One of `"PDF"`, `"Video"`, `"Link"`, `"Document"`, `"Dataset"`, `"Slide"`.     |
| `thumbnailUrl` | yes      | Cover image URL (same rules as avatars).                                       |
| `description`  | yes      | Short summary.                                                                 |
| `size`         | yes      | e.g. `"4.8 MB"`.                                                                |
| `views`        | yes      | Number.                                                                        |
| `downloads`    | yes      | Number.                                                                        |
| `createdAt`    | yes      | e.g. `"May 12, 2026"`.                                                          |
| `versions`     | yes      | Array of `{ version, date, author, changelog }`.                               |
| `feedbacks`    | yes      | Array of `{ id, author, avatar, comment, suggestion?, rating, timestamp }`.    |

### `recommendations` — the "Staff Recommendations" sidebar

Array of `{ id, title, author, category, size }`.

### `activityLogs` — the recent activity feed

Array of `{ id, text, time, resourceTitle, type }` (`type` is usually `"upload"`).

> Same reload behavior as feedbacks: edit `library.json` and the app re-seeds from
> the file (clearing any in-browser test uploads).
