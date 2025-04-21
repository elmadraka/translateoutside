//Google script recipe for importing tsv files from a google drive folder into a spreadsheet
function importarTSVsDeCarpeta() {
  // Reemplaza 'ID_DE_TU_CARPETA' con el ID real de tu carpeta en Google Drive donde se encuentren los archivos .tsv
  const folderId = 'ID_DE_TU_CARPETA-';
  const folder = DriveApp.getFolderById(folderId);
  const filesIterator = folder.getFilesByType('text/tab-separated-values');
  const files = [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  while (filesIterator.hasNext()) {
    files.push(filesIterator.next());
  }

  function getNumberFromName(fileName) {
    const match = fileName.match(/\d+/); // Busca uno o más dígitos
    return match ? parseInt(match[0]) : -Infinity; // Devuelve el número o -Infinity si no hay
  }

  files.sort((a, b) => getNumberFromName(a.getName()) - getNumberFromName(b.getName()));

  for (const file of files) {
    //Si el proceso para en el archivo 200 cambiar el 0 por ese número para saltar todos los anteriores y continuar desde ahí
    if(getNumberFromName(file.getName()) < 0)
      continue;

    const fileName = file.getName().replace('.tsv', ''); // Obtener el nombre sin la extensión
    console.log(fileName);
    const csvData = file.getBlob().getDataAsString();
    const data = Utilities.parseCsv(csvData, "\t");
    
    // Intentar obtener la hoja existente por su nombre
    let sheet = ss.getSheetByName(fileName);

    // Si la hoja existe, la borra; si no, crea una nueva
    if (sheet) {
      ss.deleteSheet(sheet);
      sheet = ss.insertSheet(fileName);
    } else {
      sheet = ss.insertSheet(fileName);
    }

    // Escribir los datos en la nueva hoja
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  }

  SpreadsheetApp.getUi().alert('¡Proceso completado! Los archivos CSV se han importado.');
}

function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('Importar TSVs')
      .addItem('Importar desde Drive', 'importarTSVsDeCarpeta')
      .addToUi();
}
