let allFiles = []

function Archivo(name, json, selected, highlighted){
  this.id = parseInt(name.match(/\d+/)[0]);
  this.name = name;
  this.json = json;
  this.selected = selected || false;
  this.highlighted = highlighted || false;

  try{
    this.header = keysForFile[name.match(/Map[0-9]{3}.json/) !== null ? 'MAPS' : this.name]['keys'];  
  }catch{ console.log(`No header for ${name}`); }  

  try{
    this.tsv = this.toTSV();
  }catch{ console.log(`Unable to generate TSV for ${name}`); }  
}

Archivo.prototype.toTSV = function(){
  if(this.header === undefined){
    console.log(`Unable to generate TSV for ${name} withtout header`);   
  }else{
    let rows = []
    this.json.events.filter((row) => row!==null).forEach((row) => {
      row.pages.forEach((page, page_index) => {
        page.list?.forEach((list, list_index) => {
          if(list.code === 401){
            text = list.parameters[0].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
            rows.push([row.id, page_index, list_index, text].join('\t'))
          }else if(list.code === 101 && ['Portrait_Recruits2', 'Portrait_NPCs'].includes(list.parameters[0])){
            text = list.parameters[4].replace(/\\/g, '\\\\').replace(/\"/g, '\\\"');
            rows.push([row.id, page_index, list_index, text].join('\t'))
          }
        })
      })
    });

    let pre_tsv = [this.header.join('\t'), rows.join('\r\n')].join('\r\n');

    this.tsv = pre_tsv;
    this.rows = rows.length;

    return this.tsv;
  }
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
  allFiles = allFiles.sort((a, b) => a.id - b.id);
  if(allFiles.filter((file) => file.highlighted).length < 1){
    allFiles.filter((file) => file.rows > 0)[0].highlighted = true;
  }
  document.getElementById('files-list').innerHTML = '';
  let table_row = '';
  allFiles.forEach((row) => {
    table_row = document.createElement('tr');
    if(row.rows > 0){
      table_row.innerHTML += `<td scope="row"><input class="form-check-input" type="checkbox" ${row.selected ? 'checked' : ''} id="${row.id}" value="${row.name}"></td>`
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
    data = allFiles.filter((file) => file.id === parseInt(elem.target.parentNode.querySelector('input[type=checkbox]').id))[0];
    data.selected = !data.selected;
    enableDownloadTSVButton();
  }else if(!elem.target.parentNode.classList.contains('table-primary')){
    allFiles.filter((file) => file.highlighted).map((file) => file.highlighted = false );
    data = allFiles.filter((file) => file.rows > 0).filter((file) => file.id === parseInt(elem.target.parentNode.querySelector('input[type=checkbox]')?.id))[0];
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

let jsonFile, fileHeader, FileName, exportFile;
const keysForFile = { 
  "Items.json": { 
    'keys': ['id', 'description', 'name'] 
  },
  "MAPS": { 
    'lookup': {
      'id': ['events'],
      'parameters': ['events', 'pages', 'list@code=401']
    }, 
    'keys': ['event_id', 'page_index', 'list_index', 'text'] 
  },
  "Enemies.json": ['id', 'name'] 
}

function reset(){
  document.getElementById('controls').innerHTML = '';
  document.getElementById('output').innerHTML = '';
  fileHeader = null;
}



function onReaderLoad(event){
  jsonFile = JSON.parse(event.target.result);
  loadCsv();
}

function setHeader(){
  fileHeader = [...document.querySelectorAll('#controls > input[type=checkbox]:checked')].map((elem) => elem.id)
  loadCsv();
}

function loadCsv(file){
  const items = file || jsonFile
  
  if(!fileHeader){ setHeader(); }
  else{
    const header = fileHeader;
    const replacer = (key, value) => value === null ? '' : value

    rows = []
    items.events.filter((row) => row!==null).forEach((row) => {
      row.pages.forEach((page, page_index) => {
        page.list?.forEach((list, list_index) => {
          if(list.code === 401){
            text = list.parameters[0].replace(/\\/g, '\\\\');
            rows.push([row.id, page_index, list_index, text].join('\t'))
          }else if(list.code === 101 && ['Portrait_Recruits2', 'Portrait_NPCs'].includes(list.parameters[0])){
            text = list.parameters[4].replace(/\\/g, '\\\\');
            rows.push([row.id, page_index, list_index, text].join('\t'))
          }
        })
      })
    });

    const csv = [header.join('\t'), rows.join('\r\n')].join('\r\n');

    document.querySelector('.row-number').innerHTML = `${rows.length} rows`
    document.getElementById('output').value = csv;
    return csv;
  }
}

function mergeFile(){
  document.getElementById('console').value = '';
  exportFile = allFiles.filter((file) => file.highlighted)[0];
  const translations = document.getElementById('merge-input').value

  translations.split('\n').slice(1).forEach(function(row, index){
    row = row.split('\t').map((col, index) => index > 2 ? col: parseInt(col));
    
    try{
      if (['Portrait_Recruits2', 'Portrait_NPCs'].includes(exportFile.json.events.find((event) => event?.id === row[0])?.pages[row[1]]?.list[row[2]]?.parameters[0])){
        exportFile.json.events.find((event) => event?.id === row[0]).pages[row[1]].list[row[2]].parameters[4] = row[3].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"');
      }else{
        exportFile.json.events.find((event) => event?.id === row[0]).pages[row[1]].list[row[2]].parameters = [row[3].replace(/\\\\/g, '\\').replace(/\\\"/g, '\"')];
      }
    }catch(e){
      console.log(`Skipped line ${index} invalid data: ${row}`);
    }
  })
  return exportFile.json;
}

(()=>{
  const console_log = window.console.log;
  window.console.log = function(...args){
    console_log(...args);
    var textarea = document.getElementById('console');
    if(!textarea) return;
    args.forEach(arg => textarea.value = `${JSON.stringify(arg)}\n${textarea.value}`);
  }
})();

function activateMergeButton(){
  document.getElementById('merge-button').disabled = !(document.getElementById('merge-input').value.length > 0 && document.getElementById('json-file-input').files.length > 0);
}
/* NEW STUFF */

/*function fileSelected(event) {
  const files = document.getElementById('json-file-input').files;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      downloadBlob(toTSV(JSON.parse(reader.result), file.name), file.name, 'tsv');
    }
    reader.readAsText(file);
  })
};
*/
function toTSV(file, name){
  file_key = name.match(/Map[0-9]{3}.json/) !== null ? 'MAPS' : name
  fileHeader = keysForFile[file_key]['keys']

  rows = []
  file.events.filter((row) => row!==null).forEach((row) => {
    row.pages.forEach((page, page_index) => {
      page.list?.forEach((list, list_index) => {
        if(list.code === 401){
          text = list.parameters[0].replace(/\\/g, '\\\\');
          rows.push([row.id, page_index, list_index, text].join('\t'))
        }else if(list.code === 101 && ['Portrait_Recruits2', 'Portrait_NPCs'].includes(list.parameters[0])){
          text = list.parameters[4].replace(/\\/g, '\\\\');
          rows.push([row.id, page_index, list_index, text].join('\t'))
        }
      })
    })
  });

  let tsv = [fileHeader.join('\t'), rows.join('\r\n')].join('\r\n');

  document.querySelector('.row-number').innerHTML = `${rows.length} rows`
  document.getElementById('output').value = tsv;

  return tsv;
}


document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById('json-file-input').addEventListener('change', fileSelected);
  document.querySelector('button.reload').addEventListener('click', fileSelected);
  document.getElementById('merge-input').addEventListener('input', activateMergeButton);
  document.getElementById('merge-button').addEventListener('click', function(){
    downloadBlob(mergeFile(), allFiles.filter((file) => file.highlighted)[0].name, 'json');
  });
  document.getElementById('selectAll').addEventListener('change', selectAll);
  document.getElementById('download-tsv-button').addEventListener('click', downloadFiles);
});