---
title: Text Processing Cheat Sheet
description: High-density command reference for grep pattern matching, head and tail log monitoring, and sed stream editing.
sidebar:
  label: "Text Processing"
  order: 30
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: Users, Permissions & sudo](./user-permissions-cheatsheet.md) · [Cheat Sheet: Console & Localization](./localization-cheatsheet.md) · [Cheat Sheet: Git CLI](../tools/git-cheatsheet.md)

This reference covers daily Linux text processing, log triage, stream replacement, and pattern filtering using `grep`, `head`, `tail`, and `sed`.

---

## ⚡ Quick Start & Core Commands

```bash
# Search recursively for string, displaying line numbers and ignoring binary files
grep -rnI "DATABASE_URL" ./src

# Stream log file in real-time, following rotations
tail -F /var/log/nginx/access.log

# Replace pattern in-place across file
sed -i 's/DEBUG=True/DEBUG=False/g' settings.py

# Filter out comments and blank lines from configuration
grep -v "^#" /etc/hosts | grep -v "^$"
```

---

## 📊 Command & Flag Matrix

| Tool / Flag       | Syntax                                      | Purpose / When Useful                                       |
| :---------------- | :------------------------------------------ | :---------------------------------------------------------- |
| **`grep -rnI`**   | `grep -rnI "pattern" .`                     | Recursive search, line numbers, ignore binary files.        |
| **`grep -F`**     | `grep -F "user@domain.com" file`            | Fixed-string literal match (skips regex parsing for speed). |
| **`grep -v`**     | `grep -v "^#" file`                         | Inverts match (suppresses lines matching pattern).          |
| **`grep -rl`**    | `grep -rl "TODO" ./backend`                 | Lists filenames containing match rather than lines.         |
| **`grep -c`**     | `grep -c "ERROR" app.log`                   | Returns count of matching lines.                            |
| **`grep -C <N>`** | `grep -C 3 "Exception" app.log`             | Prints $N$ context lines before and after matches.          |
| **`grep -E`**     | `grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" log` | Evaluates extended POSIX regular expressions.               |
| **`head -n <N>`** | `head -n 20 file.txt`                       | Displays the first $N$ lines.                               |
| **`tail -n <N>`** | `tail -n 50 file.txt`                       | Displays the last $N$ lines.                                |
| **`tail -F`**     | `tail -F /var/log/syslog`                   | Follows file and reopens descriptor when logrotate runs.    |
| **`sed -i`**      | `sed -i 's/foo/bar/g' file`                 | In-place modification without temporary files.              |
| **`sed -i.bak`**  | `sed -i.bak 's/foo/bar/g' file`             | In-place modification while preserving `.bak` backup copy.  |

---

## 🛠️ Common Patterns & Workflows

### Advanced Log Inspection with `head` & `tail`

```bash
# View all lines except the trailing 5 lines
head -n -5 file.txt

# Stream lines starting from line 100 to the end of the file
tail -n +100 file.txt

# Inspect recent errors with surrounding stack trace
grep -C 5 "OutOfMemoryError" /var/log/jvm.log
```

### Stream Editing with `sed`

#### Safe In-Place Replacements

```bash
# Replace string globally on each line
sed -i 's/old-domain.com/new-domain.com/g' config.yaml

# Use alternate delimiter when modifying URLs or filesystem paths
sed -i 's|/var/www/v1|/var/www/v2|g' /etc/nginx/sites-available/default
```

#### Line Filtering and Deletion

```bash
# Print a specific line range (lines 10 to 25)
sed -n '10,25p' application.log

# Strip all comment lines beginning with '#'
sed -i '/^#/d' config.ini

# Strip all blank or empty lines
sed -i '/^$/d' config.ini

# Delete lines 1 through 5
sed -i '1,5d' data.csv
```

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: Users, Permissions & sudo](./user-permissions-cheatsheet.md)
- [Cheat Sheet: Console & Localization](./localization-cheatsheet.md)
- [Cheat Sheet: Git CLI](../tools/git-cheatsheet.md)
