---
title: "Text Processing: grep, head, tail & sed Cheat-Sheet"
description: Fast command-line text inspection, stream editing, log monitoring, and regex matching.
---

## 🔍 `grep` Quick Reference

```bash
# Recursive case-insensitive search with line numbers
grep -rnI "database_url" ./src

# Fixed strings search (faster literal matching without regex interpretation)
grep -F "user@example.com" /var/log/auth.log

# Invert match (show lines that do NOT contain the pattern)
grep -v "^#" /etc/hosts | grep -v "^$"

# Display matching filenames only
grep -rl "TODO" ./backend

# Display count of matching lines
grep -c "ERROR" /var/log/app.log

# Context matching: show 3 lines before (-B), after (-A), or both (-C)
grep -C 3 "OutOfMemoryError" /var/log/jvm.log

# Extended regular expression search (-E)
grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" access.log
```

---

## 📜 `head` & `tail` Log Inspection

```bash
# Display first 20 lines of a file
head -n 20 file.txt

# Display all lines except the last 5 lines
head -n -5 file.txt

# Display last 50 lines of a file
tail -n 50 /var/log/syslog

# Follow log updates in real-time
tail -f /var/log/syslog

# Follow log with auto-reconnect on log rotation (capital -F)
tail -F /var/log/nginx/access.log

# Stream starting from line 100 onwards
tail -n +100 file.txt
```

---

## ✂️ `sed` Stream Editor

### Search & Replace

```bash
# Preview replacement on stdout (global flag 'g' replaces all occurrences on each line)
sed 's/old-domain.com/new-domain.com/g' config.yaml

# In-place file modification (-i)
sed -i 's/DEBUG=True/DEBUG=False/g' settings.py

# In-place file modification with backup copy (.bak)
sed -i.bak 's/port: 80/port: 8080/g' nginx.conf

# Use alternative delimiter (avoids escaping slashes in URLs and paths)
sed -i 's|/var/www/v1|/var/www/v2|g' /etc/nginx/sites-available/default
```

### Filtering & Line Manipulation

```bash
# Print only a specific line range (e.g. lines 10 to 25)
sed -n '10,25p' application.log

# Delete matching lines from a file
sed -i '/^#/d' config.ini       # Delete all comment lines starting with #
sed -i '/^$/d' config.ini       # Delete all blank/empty lines

# Delete lines 1 through 5
sed -i '1,5d' data.csv
```
