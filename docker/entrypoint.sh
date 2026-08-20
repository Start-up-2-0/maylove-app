#!/bin/sh
set -e

PORT="${PORT:-8080}"
MAYLOVE_API_ORIGIN="${MAYLOVE_API_ORIGIN:-http://maylove-api.railway.internal:8080}"
export PORT
export MAYLOVE_API_ORIGIN
envsubst '${PORT} ${MAYLOVE_API_ORIGIN}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
