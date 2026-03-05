#!/bin/bash

# Set team ID
export VERCEL_ORG_ID="team_XfY2vsfJTYQAMlD7KtzjnAwd"
export VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-}"

# Deploy to Vercel
vercel --yes --scope malhar-sonis-projects
