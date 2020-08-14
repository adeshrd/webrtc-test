#!/bin/sh

number=$1
url=$2
shift
for i in `seq $number`; do
  node scale.js $url &
done

