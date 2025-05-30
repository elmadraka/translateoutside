const version = "1.04.12"

let allFiles = []
const keysForFile = { 
  "Actors.json": ['id:int', 'name:string', 'nickname:string'],
  "Armors.json": ['id:int', 'name:string', 'description:string'],
  "Classes.json": ['id:int', 'name:string', 'note:string'],
  "CommonEvents.json": ['id:int', 'list_index:int', 'code:int', 'text:string'],
  "Enemies.json": ['id:int', 'name:string'],
  "Items.json": ['id:int', 'name:string', 'description:string'],
  "MAPS": ['event_id:int', 'page_index:int', 'list_index:int', 'code:int', 'text:string'],
  "Skills.json": ['id:int', 'name:string', 'description:string', 'message1:string', 'message2:string'],
  "States.json": ['id:int', 'name:string', 'note:string', 'message1:string', 'message2:string', 'message3:string', 'message4:string'],
  "Weapons.json": ['id:int', 'name:string', 'description:string', 'note:string'],
  "Troops.json": ['id:int', 'page_index:int', 'list_index:int', 'code:int', 'text:string'],
  "System.json": ['type:string', 'id:int', 'key:string', 'text:string']
}

function Archivo(name, json, selected, highlighted){
  this.name = name;
  this.json = json;
  this.originalJson = json;
  this.selected = selected || false;
  this.highlighted = highlighted || false;

  try{
    this.header = keysForFile[name.match(/Map[0-9]{3}.json/) !== null ? 'MAPS' : this.name];
  }catch{ console.log(`No header for ${name}`); }  

  try{
    this.tsv = this.toTSV();
  }catch{ console.log(`Unable to generate TSV for ${name}`); }  
}

Archivo.prototype.toTSV = function(){
  if(this.header === undefined){
    document.getElementById('output').value = '';
    this.rows = 'n/a';
    console.log(`Unable to generate TSV for ${this.name} withtout header`);
  }else{
    if(this.name.match(/Map[0-9]{3}.json/)){
      let start = this.json.events;
      let rows = []
      start.filter((row) => row!==null).forEach((row) => {
        row.pages.forEach((page, page_index) => {
          page.list?.forEach((list, list_index) => {
            if(list.code === 401){
              text = list.parameters[0].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
              rows.push([row.id, page_index, list_index, list.code, text].join('\t'))
            }else if(list.code === 402){
              text = list.parameters[1].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
              rows.push([row.id, page_index, list_index, list.code, text].join('\t'))
            }else if(list.code === 102){
              text = list.parameters[0].map(elem => elem.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"'));
              rows.push([row.id, page_index, list_index, list.code, text.join('|')].join('\t'))
            }else if(list.code === 101 && ['Portrait_Recruits2', 'Portrait_NPCs'].includes(list.parameters[0])){
              text = list.parameters[4].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
              rows.push([row.id, page_index, list_index, list.code, text].join('\t'))
            }
          })
        })
      });

      let pre_tsv = [this.header.map((key) => key.split(':')[0]).join('\t'), rows.join('\r\n')].join('\r\n');

      this.tsv = pre_tsv;
      this.rows = rows.length;
      
      if(this.rows === 0)
        document.getElementById('output').value = '';

      return this.tsv;
    }else if(this.name.match("System.json")){
      let start = this.json;
      let rows = []

      const tkeys = ["armorTypes", "elements", "equipTypes", "locale", "skillTypes", 
                     "terms:basic", "terms:commands", "terms:messages", "terms:params", 
                     "weaponTypes"];
      

      tkeys.forEach((tkey, index) => {
        let pkey = tkey.split(':')[0];
        let skey = tkey.split(':')[1] !== undefined ? tkey.split(':')[1] : null;
        
        if(start[pkey] !== undefined){
          if(start[pkey][skey] !== undefined){
            if(Array.isArray(start[pkey][skey]))
              start[pkey][skey].forEach((value, index) => {
                if(value !== null)
                  rows.push([tkey, index, null, value].join('\t'));
              });
            else if(typeof(start[pkey][skey]) === 'object'){
              let index = 0;
              for (const [key, value] of Object.entries(start[pkey][skey])){
                if(value !== null){
                  rows.push([tkey, index, key, value].join('\t'));
                }
                index++;
              };
            }else{
              if(start[pkey][skey] !== null)
                rows.push([tkey, 0, null, start[pkey][skey]].join('\t'));
            }
          }else{
            if(Array.isArray(start[pkey]))
              start[pkey].forEach((value, index) => {
                if(value !== null && value !== '')
                  rows.push([tkey, index, null, value].join('\t'));
              });
            else{
              if(start[pkey] !== null)
                rows.push([tkey, 0, null, start[pkey]].join('\t'));
            }
          }
        };
      });

      let pre_tsv = [this.header.map((key) => key.split(':')[0]).join('\t'), rows.join('\r\n')].join('\r\n');

      this.tsv = pre_tsv.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
      this.rows = rows.length;

      return this.tsv;
    }else if(this.name.match("Troops.json")){
      let start = this.json;
      let rows = []
      start.filter((row) => row!==null).forEach((row) => {
        row.pages.forEach((page, page_index) => {
          page.list?.forEach((list, list_index) => {
            if(list.code === 401){
              text = list.parameters[0].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
              rows.push([row.id, page_index, list_index, list.code, text].join('\t'))
            }else if(list.code === 402){
              text = list.parameters[1].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
              rows.push([row.id, page_index, list_index, list.code, text].join('\t'))
            }else if(list.code === 102){
              text = list.parameters[0].map(elem => elem.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"'));
              rows.push([row.id, page_index, list_index, list.code, text.join('|')].join('\t'))
            }else if(list.code === 101 && ['Portrait_Recruits2', 'Portrait_NPCs'].includes(list.parameters[0])){
              text = list.parameters[4].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
              rows.push([row.id, page_index, list_index, list.code, text].join('\t'))
            }
          })
        })
      });

      let pre_tsv = [this.header.map((key) => key.split(':')[0]).join('\t'), rows.join('\r\n')].join('\r\n');

      this.tsv = pre_tsv;
      this.rows = rows.length;

      return this.tsv;
    }else if(this.name.match("CommonEvents.json")){
      let start = this.json;
      let rows = []
      start.filter((row) => row!==null).forEach((row) => {
        row.list?.forEach((list, list_index) => {
          if(list.code === 401){
            text = list.parameters[0].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
            rows.push([row.id, list_index, list.code, text].join('\t'))
          }else if(list.code === 402){
            text = list.parameters[1].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
            rows.push([row.id, list_index, list.code, text].join('\t'))
          }else if(list.code === 102){
            text = list.parameters[0].map(elem => elem.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"'));
            rows.push([row.id, list_index, list.code, text.join('|')].join('\t'))
          }else if(list.code === 122){
            //console.log('wip: code 122 -> last position: ', list.parameters.slice(-1));
          }else if(list.code === 101 && ['Portrait_Recruits2', 'Portrait_NPCs'].includes(list.parameters[0])){
            text = list.parameters[4].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
            rows.push([row.id, list_index, list.code, text].join('\t'))
          }
        })
      });

      let pre_tsv = [this.header.map((key) => key.split(':')[0]).join('\t'), rows.join('\r\n')].join('\r\n');

      this.tsv = pre_tsv;
      this.rows = rows.length;

      return this.tsv;
    }else{
      let rows = []
      this.json.filter((row) => row!==null).forEach((row) => {
        formatted_row = this.header.map((key) => key.split(':')[1] === 'int' ? row[key.split(':')[0]] : row[key.split(':')[0]].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"').replace(/\n/ig, '\\n'));
        if(!formatted_row.slice(1).every(elem => elem === null || elem === ''))
          rows.push(formatted_row.join('\t'));
      });

      let pre_tsv = [this.header.map((key) => key.split(':')[0]).join('\t'), rows.join('\r\n')].join('\r\n');

      this.tsv = pre_tsv;
      this.rows = rows.length;

      return this.tsv;
    }
  }
}

Archivo.prototype.mergeTranslation = function(){
  const file = this;
  var exportJson = this.json;
  const translations = document.getElementById('merge-input').value
  
  document.getElementById('console').value = '';

  if(this.name.match(/Map[0-9]{3}.json/)){
    translations.split('\n').slice(1).forEach(function(row, index){
      row = row.split('\t').map((col, idx) => file.header[idx].split(':')[1] === 'int' ? parseInt(col) : col);

      try{
        let code = exportJson.events.find((line) => line?.id === row[0])?.pages[row[1]]?.list[row[2]]?.code;
        if(code === 401){
          exportJson.events.find((line) => line?.id === row[0]).pages[row[1]].list[row[2]].parameters = [row[4].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"')];
        }else if(code === 402){
          exportJson.events.find((line) => line?.id === row[0]).pages[row[1]].list[row[2]].parameters[1] = row[4].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"');
        }else if(code === 102){
          exportJson.events.find((line) => line?.id === row[0]).pages[row[1]].list[row[2]].parameters[0] = row[4].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"').split('|');
        }else if(code === 101 && ['Portrait_Recruits2', 'Portrait_NPCs'].includes(exportJson.events.find((line) => line?.id === row[0]).pages[row[1]].list[row[2]].parameters[0])){
          exportJson.events.find((line) => line?.id === row[0]).pages[row[1]].list[row[2]].parameters[4] = row[4].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"');
        }
      }catch(e){
        console.log(`translation:${index + 1} - line skipped [${row}]`);
      }
    })
  }else if(this.name.match("Troops.json")){
    translations.split('\n').slice(1).forEach(function(row, index){
      row = row.split('\t').map((col, idx) => file.header[idx].split(':')[1] === 'int' ? parseInt(col) : col);

      try {
        let code = exportJson.find((line) => line?.id === row[0])?.pages[row[1]]?.list[row[2]]?.code;
        if(code === 401){
          exportJson.find((line) => line?.id === row[0]).pages[row[1]].list[row[2]].parameters = [row[4].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"')];
        }else if(code === 402){
          exportJson.find((line) => line?.id === row[0]).pages[row[1]].list[row[2]].parameters[1] = row[4].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"');
        }else if(code === 102){
          exportJson.find((line) => line?.id === row[0]).pages[row[1]].list[row[2]].parameters[0] = row[4].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"').split('|');
        }else if(code === 101 && ['Portrait_Recruits2', 'Portrait_NPCs'].includes(exportJson.find((line) => line?.id === row[0]).pages[row[1]].list[row[2]].parameters[0])){
          exportJson.find((line) => line?.id === row[0]).pages[row[1]].list[row[2]].parameters[4] = row[4].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"');
        }
      } catch(e) {
        console.log(`translation:${index + 1} - line skipped [${row}]`);
      };
    });
  }else if(this.name.match("CommonEvents.json")){
    translations.split('\n').slice(1).forEach(function(row, index){
      row = row.split('\t').map((col, idx) => file.header[idx].split(':')[1] === 'int' ? parseInt(col) : col);

      try {
        let code = exportJson.find((line) => line?.id === row[0])?.list[row[1]]?.code;
        if(code === 401){
          exportJson.find((line) => line?.id === row[0]).list[row[1]].parameters = [row[3].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"')];
        }else if(code === 402){
          exportJson.find((line) => line?.id === row[0]).list[row[1]].parameters[1] = row[3].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"');
        }else if(code === 102){
          exportJson.find((line) => line?.id === row[0]).list[row[1]].parameters[0] = row[3].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"').split('|');
        }else if(code === 101 && ['Portrait_Recruits2', 'Portrait_NPCs'].includes(exportJson.find((line) => line?.id === row[0]).list[row[1]].parameters[0])){
          exportJson.find((line) => line?.id === row[0]).list[row[1]].parameters[4] = row[3].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"');
        }
      } catch(e) {
        console.log(`translation:${index + 1} - line skipped [${row}]`);
      };
    });
  }else if(this.name.match("System.json")){
    translations.split('\n').slice(1).forEach(function(row, index){
      row = row.split('\t').map((col, idx) => file.header[idx].split(':')[1] === 'int' ? parseInt(col) : col);

      if(row[0].split(':')[1] === undefined){

      }

      let pkey = row[0].split(':')[0];
      let skey = row[0].split(':')[1] !== undefined ? row[0].split(':')[1] : null;
      
      if(exportJson[pkey] !== undefined){
        if(exportJson[pkey][skey] !== undefined){
          //key and subkey present
          if(Array.isArray(exportJson[pkey][skey]))
            exportJson[pkey][skey][row[1]] = row[3].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"');
          else if(typeof(exportJson[pkey][skey]) === 'object')
            exportJson[pkey][skey][row[2]] = row[3].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"');
        }else{
          //only primary key present
          if(typeof(exportJson[pkey]) === 'string')
            exportJson[pkey] = row[3].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"');
          else
            exportJson[pkey][row[1]] = row[3].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"');
        }
      }
    });
  }else{
    translations.split('\n').slice(1).forEach(function(row, index){
      row = row.split('\t').map((col, idx) => file.header[idx].split(':')[1] === 'int' ? parseInt(col) : col);
      
      try{
        file.header.slice(1).forEach((key, idx) => {
          exportJson.find((line) => line?.id === row[0])[key.split(':')[0]] = row[idx+1].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"').replace(/\\n/g, '\n');
        })        
      }catch(e){
        console.log(`translation:${index + 1} - line skipped [${row}]`);
      }
    })
  }

  return exportJson;
}

function fileSelected(event) {
  allFiles = [];
  const files = document.getElementById('json-file-input').files;
  Array.from(files).forEach((file, idx, array) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      allFiles.push(new Archivo(file.name, JSON.parse(reader.result)));
    }
    reader.readAsText(file);
  });
  setTimeout(() => updateFileExplorer(), 200);
};

function updateFileExplorer(){
  allFiles = allFiles.sort((a, b) => a.name.localeCompare(b.name));
  if(!allFiles.filter((file) => file.highlighted)[0] && allFiles.filter((file) => file.rows > 0)[0]){
    allFiles.filter((file) => file.rows > 0)[0].highlighted = true;
  }
  document.getElementById('files-list').innerHTML = '';
  let table_row = '';
  allFiles.forEach((row) => {
    table_row = document.createElement('tr');
    if(row.rows > 0){
      table_row.innerHTML += `<td scope="row"><input class="form-check-input" type="checkbox" ${row.selected ? 'checked' : ''} id="${row.name}" value="${row.name}"></td>`
    }else{
      table_row.innerHTML = '<td scope="row"></td>';  
    }
    table_row.innerHTML += `<td>${row.name}</td><td class="text-center">${row.rows}</td>`;
    table_row.addEventListener("click", clickTableRow);
    if(row.highlighted){
      table_row.classList.add('table-primary');
      document.querySelector('.row-number').innerHTML = `${row.rows} rows`
      document.querySelectorAll('.file-name').forEach((elem) => elem.innerHTML = row.name);
      document.getElementById('output').value = row.tsv;
    }
    document.getElementById('files-list').appendChild(table_row);
  });
}

function enableDownloadTSVButton(){
  var selected = document.getElementById('files-list').querySelectorAll('input[type=checkbox]:checked').length;
  document.getElementById('download-tsv-button').disabled = selected < 1;
  document.getElementById('download-tsv-count').innerHTML = selected == 1 ? `${selected} TSV FILES` : `${selected} TSV FILE`
}

function selectAll(){
  allFiles.filter((file) => file.rows > 0).forEach((file) => file.selected = this.checked );
  updateFileExplorer();
  enableDownloadTSVButton();
}

function clickTableRow(elem){
  if(event.target.classList.contains('form-check-input')){
    data = allFiles.filter((file) => file.name === elem.target.parentNode.querySelector('input[type=checkbox]').id)[0];
    data.selected = !data.selected;
    enableDownloadTSVButton();
  }else if(!elem.target.parentNode.classList.contains('table-primary')){
    allFiles.filter((file) => file.highlighted).map((file) => file.highlighted = false );
    data = allFiles.filter((file) => file.rows > 0).filter((file) => file.name === elem.target.parentNode.querySelector('input[type=checkbox]')?.id)[0];
    if(!data) return;
    data.highlighted = true;
    document.getElementById('output').value = data.tsv;
  }
  updateFileExplorer();
}

function downloadFiles(){
  allFiles.filter((file) => file.selected).forEach((file, idx) => {
    setTimeout(() => {
        downloadBlob(file.tsv, file.name, 'tsv');
      },
      idx * 200 // Delay download every 200ms
    );
  });
}

/**
 * Download contents as a file
 * Source: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
 */
function downloadBlob(content, filename, type) {
  // Create a link to download it
  let dataStr = '';
  if(type === 'tsv'){
    dataStr = "data:text/tsv;charset=utf-8," + encodeURI(content);
  }else{
    dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content, null, 2));  
  }
  
  var dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", filename.replace('.json', `.${type}`));
  dlAnchorElem.click();
}

(()=>{
  const console_log = window.console.log;
  window.console.log = function(...args){
    console_log(...args);
    var textarea = document.getElementById('console');
    if(!textarea) return;
    args.forEach(arg => textarea.value = `${JSON.stringify(arg).replace(/"/g, '')}\n${textarea.value}`);
  }
})();

function activateMergeButton(){
  document.getElementById('merge-button').disabled = !(document.getElementById('merge-input').value.length > 0 && document.getElementById('json-file-input').files.length > 0);
}

function coolify(should){
  if(should){
    document.body.classList.add('cool');
    document.cookie = `cool=true; path=/; max-age=${60 * 60 * 24 * 14};`;
  }else{
    document.body.classList.remove('cool');
    document.cookie = "cool=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  document.querySelector('#version > span').innerHTML = version;
  document.getElementById('version').addEventListener('click', function(){
    coolify(!document.body.classList.contains('cool'));
  });
  document.getElementById('json-file-input').addEventListener('change', fileSelected);
  document.querySelector('button.reload').addEventListener('click', fileSelected);
  document.getElementById('merge-input').addEventListener('input', activateMergeButton);
  document.getElementById('merge-button').addEventListener('click', function(){
    const selectedFile = allFiles.filter((file) => file.highlighted)[0]
    downloadBlob(selectedFile.mergeTranslation(), selectedFile.name, 'json');
  });
  document.getElementById('selectAll').addEventListener('change', selectAll);
  document.getElementById('download-tsv-button').addEventListener('click', downloadFiles);

  coolify(document.cookie.split(';').find(cookie => cookie.split('=')[0].trim() === 'cool'));
});