#!/bin/bash
PROJDIR="$1"
TARGETDIR="$2"
FILE="$PROJDIR/Dockerfile"
TFILE="$TARGETDIR/Dockerfile"


doperline () {
    # runs $2 for each line in the file $1
    local PROCLINE="$2"
    while IFS= read -r line; do
        "$2" "$line"
    done < "$1"
}

sedmultline () {
    # Replaces pattern $2 in file $1
    local line="$1"
    local pattern="${2:-%%%.*%%%}"
    if [[ "$line" =~ $pattern ]]; then
        cat "$PROJDIR/${line:3:-3}.em"
        echo ""
    else
        echo "$line"
    fi
}

echo "Creating file $TFILE"
doperline "$FILE" sedmultline > "$TFILE"

for f in $PROJDIR/*.em; do
    fname=$(basename $f)
    echo "rm '$TARGETDIR/$fname'"
    rm "$TARGETDIR/$fname"
done
