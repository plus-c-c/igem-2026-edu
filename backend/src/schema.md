# Database Schema — iGEM 2026 Education

## Overview
- **DB:** PostgreSQL (TypeORM with `synchronize: true` in dev)
- **Entities:** `User`, `Resource`, `UploadedFile`
- **Relationships:** User 1→N Resource, Resource 1→N UploadedFile

---

## Entity: `User`

| Column     | Type                    | Constraints        |
|------------|-------------------------|--------------------|
| id         | uuid (PK, generated)    | auto               |
| email      | varchar                 | unique, NOT NULL   |
| password   | varchar (bcrypt hashed) | NOT NULL           |
| name       | varchar (team name)     | NOT NULL           |
| role       | varchar                 | default `'user'`   |
| createdAt  | timestamp               | auto (CURRENT_TS)  |
| updatedAt  | timestamp               | auto (CURRENT_TS)  |

**Hooks:** `@BeforeInsert` hashes password via bcrypt (10 rounds).
**Methods:** `comparePassword(candidate)` — bcrypt compare.

---

## Entity: `Resource`

| Column         | Type                    | Constraints                    |
|----------------|-------------------------|--------------------------------|
| id             | uuid (PK, generated)    | auto                           |
| userId         | uuid (FK → User.id)     | NOT NULL                       |
| team           | varchar                 | NOT NULL                       |
| title          | varchar                 | NOT NULL                       |
| negotiator     | varchar                 | nullable                       |
| category       | varchar                 | NOT NULL                       |
| acceptsOthers  | varchar                 | default `'yes'`                |
| delivery       | varchar                 | nullable                       |
| audience       | varchar                 | nullable                       |
| duration       | varchar                 | nullable                       |
| location       | varchar                 | nullable                       |
| reimbursement  | varchar                 | nullable                       |
| contact        | varchar                 | nullable                       |
| desc           | text                    | NOT NULL                       |
| materials      | simple-array (text[])   | nullable                       |
| type           | varchar                 | default `'normal'`             |
| subtitle       | varchar                 | nullable                       |
| image          | varchar (URL/path)      | nullable                       |
| format         | varchar                 | nullable                       |
| impact         | varchar                 | nullable                       |
| campaignSteps  | json                    | nullable — see below           |
| createdAt      | timestamp               | auto                           |
| updatedAt      | timestamp               | auto                           |

### `campaignSteps` JSON structure
```json
[
  {
    "id": "unique-id",
    "text": "Step description",
    "files": [
      { "fileId": "uuid", "name": "filename.pdf" }
    ]
  }
]
```

**Indexes:** none explicit (TypeORM auto index on FKs).

---

## Entity: `UploadedFile`

| Column        | Type                    | Constraints                    |
|---------------|-------------------------|--------------------------------|
| id            | uuid (PK, generated)    | auto                           |
| resourceId    | uuid (FK → Resource.id) | NOT NULL                       |
| originalName  | varchar                 | NOT NULL                       |
| storedName    | varchar                 | NOT NULL (unique filename)     |
| mimeType      | varchar                 | NOT NULL                       |
| size          | integer (bytes)         | NOT NULL                       |
| materialLabel | varchar                 | nullable — see below           |
| createdAt     | timestamp               | auto                           |

### `materialLabel` semantics
| Value                  | Meaning                          |
|------------------------|----------------------------------|
| `"cover"`              | Cover image for a campaign       |
| `"campaign-step-{id}"` | File attached to a campaign step |
| `"项目介绍书"`          | Material type (user-defined)     |
| `""` (empty) / other   | Uncategorized file               |

**Storage:** Files on disk at `backend/uploads/{storedName}`. DB stores metadata only.

---

## Key Relationships

```
User (1) ──< Resource (N)
  Resources belong to the user who created them.
  userId FK with ManyToOne relation.

Resource (1) ──< UploadedFile (N)
  Files belong to the resource they were uploaded to.
  resourceId FK with ManyToOne relation.
```

## Notes
- `synchronize: true` in dev — schema syncs automatically on startup
- File deletion cascades manually (code removes disk files before DB records)
- Resource deletion cascades manually (code removes related files from disk + DB)
- No cascade delete at DB level
