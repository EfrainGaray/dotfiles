#!/bin/bash
# Stitch MCP tool caller
# Usage: stitch-call.sh <tool_name> '<json_arguments>'
export PATH="/usr/local/share/google-cloud-sdk/bin:$PATH"
export STITCH_API_KEY="${STITCH_API_KEY:-AQ.Ab8RN6LVfYLX7Evit0husOuse68JGKudHqzJ2UXb4I24Gcz5_w}"
export GOOGLE_CLOUD_PROJECT="${GOOGLE_CLOUD_PROJECT:-operating-realm-488304-c7}"

TOOL="$1"
ARGS="$2"

printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"claude","version":"1.0"}}}\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"%s","arguments":%s}}\n' "$TOOL" "$ARGS" | npx -y stitch-mcp 2>/dev/null | grep '"id":2' | python3 -c "
import json,sys
for line in sys.stdin:
    data = json.loads(line)
    if 'result' in data and 'content' in data['result']:
        for c in data['result']['content']:
            if c['type'] == 'text':
                try:
                    print(json.dumps(json.loads(c['text']), indent=2))
                except:
                    print(c['text'])
    elif 'result' in data and 'structuredContent' in data['result']:
        print(json.dumps(data['result']['structuredContent'], indent=2))
"
