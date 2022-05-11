# Generate puchdb.json 

1. First of all generatea console.log of the PouchDB document (the current user) like the one in `data/pouchdb_example.json`

2. Generate the JSON schema with [https://www.liquid-technologies.com/online-json-to-schema-converter](https://www.liquid-technologies.com/online-json-to-schema-converter) and paste the file in `data/json_schema.json`

3. Run `replace.sh` in `data` folder

4. Then go to [http://www.plantuml.com/](http://www.plantuml.com/) and paste:

```
@startjson
[data in data/generated_json_schema.json file]
@endjson
```
