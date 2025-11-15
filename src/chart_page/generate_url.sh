#!/bin/bash

HTML_URL="http://xxxxxx.s3-website-us-east-1.amazonaws.com"

if [ -z "$1" ]; then
  echo "Usage: $0 data.json"
  exit 1
fi

JSON_FILE=$1

# Step 1: Get minified JSON
MINIFIED=$(jq -c . "$JSON_FILE")

# Step 2: Encode to UTF-8 SAFE string WITHOUT adding extra quotes
SAFE=$(printf "%s" "$MINIFIED" | jq -s -R -r @uri)

# Step 3: base64 encode the SAFE string
B64=$(printf "%s" "$SAFE" | base64 | tr -d '\n')

# Step 4: Replace '=' with '%3D'
URLSAFE=$(printf "%s" "$B64" | sed 's/=/%3D/g')

echo "${HTML_URL}?data=${URLSAFE}"
