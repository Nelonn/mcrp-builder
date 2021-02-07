const path = require('path');
const fs = require('fs').promises;
const fsh = require('./utils/fsh');

const Util = require('./utils/Util');

const wconfig = require('../../config.json');
const config = require(`../../workspaces/${wconfig.workspace}.json`);

let default_mcmeta = `{
  "pack": {
    "pack_format": 6,
    "description": "Builded resource pack"
  }
}`;

let fileWhiteList = ['.git'];
let mergeFiles = ['sounds.json'];

let sourceFolder = config.source_folder;
let buildFolder = config.build_folder;

const base64json = require('base64json');
const extendify = require('extendify');
const extend = extendify({
  inPlace: false,
  isDeep: true,
  arrays: 'merge'
});

async function buildRP(rps = [], buildDir = '') {
  const dirs = [];
  const files = {};
  const priorityes = {};

  for (let rp of rps) {
    for (let dir of rp.dirs) {
      if (!dirs.includes(dir)) dirs.push(dir);
    }
    for (const [file, data] of Object.entries(rp.files)) {
      if (path.basename(file).endsWith('.priority')) {
        let priorityName = file.slice(0, -9);
        if (!priorityes[priorityName]) priorityes[priorityName] = [];
        priorityes[priorityName].push(rp.files[priorityName]);
      } else {
        if (!files[file]) files[file] = [];
        files[file].push(data);
      }
    }
  }
  
  // Init minecraft resourcepack
  let mcmeta = default_mcmeta;
  for (let file of await fs.readdir(sourceFolder)) {
    const filePath = path.join(sourceFolder, file);
    if (file == 'pack.mcmeta') {
      mcmeta = await fs.readFile(filePath, 'utf-8');
    } else if (file == 'pack.png') {
      await fs.copyFile(filePath, path.join(buildDir, 'pack.png'));
    }
  }
  await fs.writeFile(path.join(buildDir, 'pack.mcmeta'), mcmeta, 'utf-8');

  // Main
  for (let dir of dirs) {
    let dirPath = path.join(buildDir, dir);
    if (await fsh.has(dirPath) != 'DIR') await fsh.mkdir(dirPath, true);
  }

  const niceJSON = (jsonobj) => {
    return JSON.stringify(jsonobj, null, '  ');
  }

  for (const [file, allFiles] of Object.entries(files)) {
    let fileName = path.basename(file);

    let FilePriorityes = priorityes[file] || [];
    if (FilePriorityes.length > 0) {
      if (fileName.endsWith('.json')) await fs.writeFile(path.join(buildDir, file), niceJSON(base64json.parse(FilePriorityes[0])));
      else await fs.writeFile(path.join(buildDir, file), FilePriorityes[0], 'base64');
    } else {
      if (fileName.endsWith('.json')) {
        if (allFiles.length > 1) {
          const jsons = [];
          for (let jsonFile of allFiles) {
            let parsedJson = null;
            try {
              parsedJson = base64json.parse(jsonFile);
            } catch {}
            //console.log(parsedJson);
            if (parsedJson) jsons.push(parsedJson);
          }
          
          if (mergeFiles.includes(fileName)) {
            const extendedJSON = extend(...jsons);
            await fs.writeFile(path.join(buildDir, file), niceJSON(extendedJSON),(err)=>{
              if(err) console.log(err)
            });
          } else {
            let newJSON = jsons[0];

            let mergeType = 'NONE';

            for (let json of jsons) {
              if (json.overrides) mergeType = 'OVERRIDES';
              else if (json.providers) mergeType = 'PROVIDERS';
            }

            if (mergeType == 'OVERRIDES') {
              //newJSON.build = 'overrides';
              let allOverrides = [];
              for (let json of jsons) {
                if (json.overrides) {
                  for (let override of json.overrides) {
                    allOverrides.push(override);
                  }
                }
              }

              var id = 'custom_model_data'
                , data = {}
                , temp_i = 0;
              [].concat(...allOverrides).forEach(function(item) {
                if (id in item.predicate) {
                  var key = item.predicate[id]+99999;
                  data[key] = data[key] || {};
                  Object.keys(item).forEach(function(property) {
                    data[key][property] = item[property];
                  });
                } else {
                  temp_i++;
                  data[temp_i] = data[temp_i] || {};
                  Object.keys(item).forEach(function(property) {
                    data[temp_i][property] = item[property];
                  });
                }
              });
              allOverrides = Object.values(data);
              newJSON.overrides = allOverrides;
            } else if (mergeType == 'PROVIDERS') {
              let allProviders = [];
              for (let json of jsons) {
                if (json.providers) {
                  for (let providers of json.providers) {
                    allProviders.push(providers);
                  }
                }
              }
              newJSON.providers = allProviders;
            }

            await fs.writeFile(path.join(buildDir, file), niceJSON(newJSON), (err)=>{
              if(err) console.log(err)
            });
          }
        } else {
          /*try {
            await fs.writeFile(path.join(buildDir, file), niceJSON(base64json.parse(allFiles[0])), (err)=>{
              if(err) console.log(err)
            });
          } catch {}*/
          await fs.writeFile(path.join(buildDir, file), allFiles[0], 'base64');
        }
      } else {
        await fs.writeFile(path.join(buildDir, file), allFiles[0], 'base64');
      }
    }
  }
}


(async () => {
  if (config.clear.enable) {
    await require('./clear');
  }

  const buildHas = await fsh.has(buildFolder);
  if (buildHas == 'DIR') {
    console.log(` Clearing build folder`);
    await Util.clearDir(buildFolder, fileWhiteList);
  } else {
    console.log(` Making build folder`);
    await fsh.mkdir(buildFolder, true);
  }
  
  console.log(` Reading resource packs`);
  const rps = await Util.readRPs(sourceFolder);
  
  console.log(` Building resource pack`);
  await buildRP(rps, buildFolder);
  // РАЗДОКУМЕНТИРУЙ ЧТОБЫ УДИВИТСА // console.log(rps);

  console.log(` Done`);
})();