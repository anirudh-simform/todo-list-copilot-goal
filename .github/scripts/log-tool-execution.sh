#!/bin/bash

# Script: log-tool-execution.sh
# Purpose: PreToolUse hook that logs all tool executions to a file
# Input: JSON from stdin containing tool execution details
# Output: JSON to stdout allowing or denying the execution

set -o pipefail

# Define log file location in the workspace
LOG_FILE="${PWD}/.github/logs/tool-executions.log"
LOG_DIR="${PWD}/.github/logs"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Read JSON input from stdin
INPUT=$(cat)

# Extract tool information from JSON
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolUse.toolName // "unknown"' 2>/dev/null)
TOOL_ID=$(echo "$INPUT" | jq -r '.toolUse.id // "unknown"' 2>/dev/null)
TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

# Extract parameters (truncate if too long)
PARAMS=$(echo "$INPUT" | jq -r '.toolUse.toolUseBlock.input // {}' 2>/dev/null | jq -c '.')
PARAMS_TRUNCATED=$(echo "$PARAMS" | cut -c1-200)

# Log the execution
LOG_ENTRY=$(cat <<EOF
[$TIMESTAMP] Tool: $TOOL_NAME | ID: $TOOL_ID | Params: $PARAMS_TRUNCATED
EOF
)

echo "$LOG_ENTRY" >> "$LOG_FILE"

# Output success JSON response
cat << 'EOF'
{
  "continue": true,
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow"
  }
}
EOF

exit 0
