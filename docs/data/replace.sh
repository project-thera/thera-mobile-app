#!/bin/bash

filename="json_schema.json"
temp_file="temp_generated_json_schema.json"
generated_file="generated_json_schema.json"

cp -f $filename $temp_file

cat $temp_file | tr -d " \t\n\r" | sed 's/{"type":"string"}/"string"/g' | sed 's/{"type":"integer"}/"integer"/g' | sed 's/{"type":"null"}/"string"/g' | sed 's/{"type":"boolean"}/"boolean"/g' > $generated_file

rm $temp_file

jq 'del(.. | .required?)' $generated_file > $temp_file

cp -f $temp_file $generated_file

rm $temp_file
