#!/bin/sh

PATH_TO_SCRIPT=$(dirname $0)

if [ -f "${PATH_TO_SCRIPT}/cli.ts" ]; then
  export TS_NODE_COMPILER=ttypescript
  node -r ts-node/register "${PATH_TO_SCRIPT}/cli.ts" "$@"
  exit $?
fi

if [ -f "${PATH_TO_SCRIPT}/cli.js" ]; then
  node "${PATH_TO_SCRIPT}/cli.js" "$@"
  exit $?
fi

echo "could not find cli.ts or cli.js, can't execute cli"
exit 1