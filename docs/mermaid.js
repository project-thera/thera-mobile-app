#!/usr/bin/env node

const fs = require('fs');
const pluralize = require('pluralize')

const rootClass = 'PouchDBDocument'

let rawdata = fs.readFileSync('data/generated_json_schema.json');
let jsonSchema = JSON.parse(rawdata);
let root = jsonSchema.properties

 function classify(text) {
  return pluralize.singular(
    capitalize(
      text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();        
      })
    )
  );
}

function processObject(node, parentClass) {
  Object.keys(node.properties).forEach((key, _) => {
    if(node.properties[key] instanceof Object) {
      if(node.properties[key].type == 'object') {
        console.log(`${parentClass} --> "1" ${classify(key)}`)
      } else if(node.properties[key].type == 'array') {
        console.log(`${parentClass} --> "0..*" ${classify(key)}`)
      }

      processNode(node.properties[key], classify(key))
    } else {
      console.log(`${parentClass} : ${node.properties[key]} ${key}`)
    }
  });
}

function processArray(node, parentClass) {
  //console.log(node.items[0]);
  processObject(node.items[0], parentClass)
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function processNode(node, parentClass) {
  //console.log(node)
  if(node.type == 'object') {
    processObject(node, parentClass);
  } else if(node.type == 'array') {
    //console.log(node);
    processArray(node, parentClass);
  }
  // Object.keys(node).forEach((key, _) => {
  //   if(node[key] instanceof Object) {
  //     if(node[key].type == 'object') {
  //       processObject(node[key])
  //     } else if(node[key].type == 'array') {
  //       processArray(node[key])
  //     }
  //   }
  //   else {
  //     //console.log(`${rootClass} : ${root[key]} ${key}`)
  //   }
  //});
}

console.log("classDiagram")
console.log(`class ${rootClass}`)

Object.keys(root).forEach((key, _) => {
  //console.log(root[key]);
  if(root[key] instanceof Object) {
    if(root[key].type == 'object') {
      console.log(`${rootClass} --> "1" ${classify(key)}`)
    } else if(root[key].type == 'array') {
      console.log(`${rootClass} --> "0..*" ${classify(key)}`)
    }

    processNode(root[key], classify(key))
  }
  else {
    console.log(`${rootClass} : ${root[key]} ${key}`)
  }
});
