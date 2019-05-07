#!/bin/bash
PROJTYPE=$1
TARGET=$2
if [ ! -d $TARGET ]; then
   mkdir -p $TARGET;
fi
cp -bvur $(dirname ${BASH_SOURCE})/project-$PROJTYPE/* $TARGET
SCRIPT=$(dirname ${BASH_SOURCE})/project-$PROJTYPE.sh
if [ -f $SCRIPT ]; then
    $SCRIPT $*
fi
