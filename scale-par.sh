#!/bin/sh

number=$1
env=$2
shift
for i in `seq $number`; do
  node scale.js prod &
done

