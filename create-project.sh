#!/bin/bash
PROJTYPE=$1
SRCDIR=$(dirname ${BASH_SOURCE})
PROJDIR=$SRCDIR/../share/project-$PROJTYPE.d
TARGET=$2
if [ ! -d $TARGET ]; then
   mkdir -p $TARGET;
fi
cp -bvur $PROJDIR/* $TARGET
SCRIPT=$(dirname ${BASH_SOURCE})/project-$PROJTYPE.sh
if [ -f $SCRIPT ]; then
    $SCRIPT $PROJDIR $TARGET
fi
