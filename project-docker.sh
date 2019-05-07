#!/bin/bash
PROJDIR=$1
TARGETDIR=$2
FILE=$PROJDIR/Dockerfile
TFILE=$TARGETDIR/Dockerfile

echo "Creating file $TFILE"
echo "" > $TFILE

doperline () {
    while IFS= read -r line; do
        ${@:2} "$line"
    done < "$1"
}

sedmultline () {
    pattern="$1"
    tfile="$2"
    line="$3"
    if [[ "$line" =~ $pattern ]]; then
        cat "$PROJDIR/${line:3:-3}.em" >> $tfile
        echo "" >> $tfile
    else
        echo "$line" >> $tfile
    fi
}

sedpartial () { sedmultline "%%%.*%%%" $TFILE "$1"; }

doperline $FILE sedpartial

for f in $PROJDIR/*.em; do
    fname=$(basename $f)
    rm $TARGETDIR/$fname
done
