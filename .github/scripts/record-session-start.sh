#!/bin/bash

# Script: record-session-start.sh
# Purpose: SessionStart hook that records detailed agent session information
# Input: JSON from stdin containing session context
# Output: JSON to stdout allowing or denying the session

set -o pipefail

# Define log file location in the workspace
LOG_FILE="${PWD}/.github/logs/sessions.log"
LOG_DIR="${PWD}/.github/logs"

# Create logs directory if it doesn't exist
if ! mkdir -p "$LOG_DIR" 2>/dev/null; then
    cat << 'EOF'
{
  "continue": false,
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "decision": "deny"
  },
  "stopReason": "Failed to create logs directory"
}
EOF
    exit 2
fi

# Capture session metadata
TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
SESSION_ID=$(python3 -c "import uuid; print(str(uuid.uuid4())[:8])" 2>/dev/null || echo "unknown")
WORKSPACE_PATH=$(pwd)
WORKSPACE_NAME=$(basename "$WORKSPACE_PATH")

# Get current user
CURRENT_USER="${USER:-unknown}"

# Get current file if available (from stdin or environment)
CURRENT_FILE=$(echo "$PWD" | sed 's|.*/||') # fallback to workspace name

# Git status info
GIT_BRANCH="N/A"
GIT_COMMIT="N/A"
GIT_STATUS="N/A"

if git rev-parse --git-dir > /dev/null 2>&1; then
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    GIT_STATUS=$(git status --short 2>/dev/null | wc -l)
fi

# Get recent files in workspace (last 5 modified files)
RECENT_FILES=$(find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \) -mtime -1 2>/dev/null | head -5 | tr '\n' ',' | sed 's/,$//')

# Build detailed session record
LOG_ENTRY=$(cat <<EOF
[SESSION_START] timestamp=$TIMESTAMP | session_id=$SESSION_ID | user=$CURRENT_USER | workspace=$WORKSPACE_NAME | path=$WORKSPACE_PATH | git_branch=$GIT_BRANCH | git_commit=$GIT_COMMIT | git_changes=$GIT_STATUS | recent_files=$RECENT_FILES
EOF
)

# Write the log entry
if echo "$LOG_ENTRY" >> "$LOG_FILE" 2>/dev/null; then
    # Success - allow session to continue
    cat << 'EOF'
{
  "continue": true,
  "systemMessage": "Session recording created successfully",
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "decision": "allow"
  }
}
EOF
    exit 0
else
    # Failure - block session and report error
    cat << 'EOF'
{
  "continue": false,
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "decision": "deny"
  },
  "stopReason": "Failed to record session start - cannot write to session log"
}
EOF
    exit 2
fi
