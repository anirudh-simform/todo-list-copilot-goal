# Agent Hooks

This directory contains hooks that automate and monitor agent session lifecycle and tool execution.

## Configured Hooks

### 1. Session Start Recording

**Event:** `SessionStart` — Triggers when an agent session begins

**Configuration:** [tool-logger.json](./tool-logger.json) → [record-session-start.sh](../scripts/record-session-start.sh)

**Behavior:**

- Records detailed session metadata on startup
- Captures: timestamp, session ID, user, workspace path, git branch/commit, git changes count, recent files
- Logs to `.github/logs/sessions.log`
- **Blocking:** Session startup is blocked if recording fails (exit code 2)
- Timeout: 10 seconds

**Log Format:**

```
[SESSION_START] timestamp=2026-05-07T14:30:45Z | session_id=a1b2c3d4 | user=anirudh.nair | workspace=todo-list | path=/home/anirudh.nair@simform.dom/todo-list | git_branch=main | git_commit=abc1234 | git_changes=3 | recent_files=src/App.jsx,package.json
```

### 2. Tool Execution Logging

**Event:** `PreToolUse` — Triggers before each tool invocation

**Configuration:** [tool-logger.json](./tool-logger.json) → [log-tool-execution.sh](../scripts/log-tool-execution.sh)

**Behavior:**

- Captures tool name, ID, and input parameters
- Logs a timestamped entry to `.github/logs/tool-executions.log`
- Allows the tool execution to proceed (`permissionDecision: "allow"`)
- Non-blocking: tool execution continues regardless of logging success
- Timeout: 5 seconds

## Log Format

Each tool execution log entry follows this format:

```
[2026-05-07T14:30:45Z] Tool: run_in_terminal | ID: abc123 | Params: {"command":"npm install","timeout":60000}
```

## Viewing Logs

**View all session records:**

```bash
cat .github/logs/sessions.log
```

**View all tool executions:**

```bash
cat .github/logs/tool-executions.log
```

**Tail live logs (real-time):**

```bash
tail -f .github/logs/sessions.log
tail -f .github/logs/tool-executions.log
```

**Analyze session patterns:**

```bash
# Count sessions by user
grep SESSION_START .github/logs/sessions.log | grep -o 'user=[^ |]*' | sort | uniq -c

# Find sessions on a specific branch
grep SESSION_START .github/logs/sessions.log | grep 'git_branch=main'

# List recent sessions
tail -20 .github/logs/sessions.log
```

## Testing Hooks

### Verify SessionStart Hook

Start a new agent session and verify recording:

```bash
tail .github/logs/sessions.log
```

You should see an entry with timestamp, user, workspace, git status, and recent files.

### Verify PreToolUse Hook

Run any tool and verify logging:

```bash
tail .github/logs/tool-executions.log
```

You should see an entry with tool name and parameters.

### Test Blocking Behavior

The SessionStart hook will block session startup if:

- `.github/logs/` directory cannot be created
- Session log file cannot be written

To test: Try removing write permissions and start a new session:

```bash
chmod 444 .github/logs/
# SessionStart should fail with "Failed to record session start" error
chmod 755 .github/logs/
```

## Scope

- **Location:** `.github/hooks/tool-logger.json` (workspace-scoped)
- **Applies to:** All agent sessions in this workspace
- **Logs location:** `.github/logs/` (git-ignored, local only)

## Notes

- Logs are local to your workspace and not committed to version control
- Tool parameters longer than 200 characters are truncated in logs
- SessionStart hook has a 10-second timeout; PreToolUse has a 5-second timeout
- Session IDs are 8-character UUIDs for cross-referencing related logs
- Git information requires a valid git repository in the workspace
