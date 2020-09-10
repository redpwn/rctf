#!/bin/bash

set -eo pipefail

do_check() {
	set -eo pipefail

	base="$1"
	head="$2"
	log="$(git log --pretty='format:%h %s' --no-merges "${base}..${head}")"
	if [ -z "$log" ]; then
		echo 'WARNING: no commits in specified range' >&2
	fi
	grep -vE '^[0-9a-f]+ (feat|fix|refactor|docs|chore|build|test|ci|style)(\([a-zA-Z-]+\))?:' <<<"$log" || true
}

if [ $# -ne 2 ]; then
	cat >&2 <<EOF
Usage:
    $0 BASE HEAD
EOF
	exit 1
fi

output="$(do_check "$1" "$2")"
if [ -n "$output" ]; then
	echo 'Bad commit messages:'
	echo "$output"
	exit 1
else
	echo 'All commit messages OK'
fi
