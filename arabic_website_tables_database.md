## Table `years`

### Columns

| Name          | Type          | Constraints |
| ------------- | ------------- | ----------- |
| `id`          | `uuid`        | Primary     |
| `title`       | `text`        |             |
| `description` | `text`        | Nullable    |
| `order_index` | `int4`        |             |
| `created_at`  | `timestamptz` | Nullable    |

## Table `courses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `year_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `thumbnail_url` | `text` |  Nullable |
| `price` | `numeric` |  Nullable |
| `is_published` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `lessons`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `course_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `content` | `text` |  Nullable |
| `video_url` | `text` |  Nullable |
| `order_index` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `attachment_urls` | `jsonb` |  Nullable |
| `is_published` | `bool` |  Nullable |

## Table `enrollments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `course_id` | `uuid` |  Nullable |
| `enrolled_at` | `timestamptz` |  Nullable |
| `expires_at` | `timestamptz` |  Nullable |

## Table `lesson_progress`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `lesson_id` | `uuid` |  Nullable |
| `completed` | `bool` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |

## Table `profiles`

### Columns

| Name                  | Type          | Constraints     |
| --------------------- | ------------- | --------------- |
| `id`                  | `uuid`        | Primary         |
| `full_name`           | `text`        | Nullable        |
| `email`               | `text`        | Nullable        |
| `phone`               | `text`        | Nullable Unique |
| `student_id`          | `text`        | Nullable Unique |
| `current_year_id`     | `uuid`        | Nullable        |
| `created_at`          | `timestamptz` | Nullable        |
| `updated_at`          | `timestamptz` | Nullable        |
| `governorate_name`    | `text`        | Nullable        |
| `center_name`         | `text`        | Nullable        |
| `parent_phone_number` | `text`        | Nullable        |
| `password`            | `text`        | Nullable        |

## Table `course_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `course_id` | `uuid` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `complaints`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `complaint_text` | `text` |  |
| `phone_number` | `text` |  Nullable |
| `user_name` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `user_id` | `uuid` |  Nullable |

## Table `user_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable Unique |
| `session_token` | `text` |  |
| `device_info` | `text` |  Nullable |
| `last_active` | `timestamp` |  Nullable |
| `created_at` | `timestamp` |  Nullable |

## Table `exams`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `course_id` | `uuid` |  Nullable |
| `year_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `exam_url` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `exam_submissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `exam_id` | `uuid` |  Nullable |
| `submitted_at` | `timestamptz` |  Nullable |

## Table `lesson_access`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `lesson_id` | `uuid` |  |
| `course_id` | `uuid` |  |
| `granted_at` | `timestamptz` |  Nullable |
| `notes` | `text` |  Nullable |
| `expires_at` | `timestamptz` |  Nullable |


### `exam_submissions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow public select` | SELECT | public | PERMISSIVE | `true` | — |
| `Allow public insert` | INSERT | public | PERMISSIVE | — | `true` |
| `Allow public update` | UPDATE | public | PERMISSIVE | `true` | — |
| `Allow public delete` | DELETE | public | PERMISSIVE | `true` | — |

### `user_sessions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow public select on user_sessions` | SELECT | public | PERMISSIVE | `true` | — |
| `Allow public insert on user_sessions` | INSERT | public | PERMISSIVE | — | `true` |
| `Allow public update on user_sessions` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `Allow public delete on user_sessions` | DELETE | public | PERMISSIVE | `true` | — |

### `profiles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow public insert on profiles` | INSERT | public | PERMISSIVE | — | `true` |
| `Allow public update on profiles` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `Allow public select` | SELECT | public | PERMISSIVE | `true` | — |

### `lesson_access`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow public select on lesson_access` | SELECT | public | PERMISSIVE | `true` | — |
| `Allow public insert on lesson_access` | INSERT | public | PERMISSIVE | — | `true` |
| `Allow public delete on lesson_access` | DELETE | public | PERMISSIVE | `true` | — |

### `exams`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow public delete` | DELETE | public | PERMISSIVE | `true` | — |
| `Allow public insert` | INSERT | public | PERMISSIVE | — | `true` |
| `Allow public select` | SELECT | public | PERMISSIVE | `true` | — |
| `Allow public update` | UPDATE | public | PERMISSIVE | `true` | — |

### `lesson_progress`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow all operations on lesson_progress` | ALL | public | PERMISSIVE | `true` | `true` |
| `Allow public select` | SELECT | public | PERMISSIVE | `true` | — |

### `courses`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow public update` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `Allow public delete` | DELETE | public | PERMISSIVE | `true` | — |
| `Allow public select` | SELECT | public | PERMISSIVE | `true` | — |
| `Allow public insert` | INSERT | public | PERMISSIVE | — | `true` |

### `years`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow public select` | SELECT | public | PERMISSIVE | `true` | — |
| `Allow public insert` | INSERT | public | PERMISSIVE | — | `true` |
| `Allow public update` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `Allow public delete` | DELETE | public | PERMISSIVE | `true` | — |

### `enrollments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can view own enrollments` | SELECT | public | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `Allow public select` | SELECT | public | PERMISSIVE | `true` | — |
| `Allow public insert` | INSERT | public | PERMISSIVE | — | `true` |
| `Allow public delete` | DELETE | public | PERMISSIVE | `true` | — |

### `course_requests`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow public select` | SELECT | public | PERMISSIVE | `true` | — |
| `Allow public insert` | INSERT | public | PERMISSIVE | — | `true` |
| `Allow public update` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `Allow public delete` | DELETE | public | PERMISSIVE | `true` | — |

### `lessons`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow public select` | SELECT | public | PERMISSIVE | `true` | — |
| `Allow public insert` | INSERT | public | PERMISSIVE | — | `true` |
| `Allow public update` | UPDATE | public | PERMISSIVE | `true` | `true` |
| `Allow public delete` | DELETE | public | PERMISSIVE | `true` | — |


