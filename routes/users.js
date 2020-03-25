var express = require('express');
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');
var router = express.Router();

/* GET users listing. */

const options = {
  rowForHeadings: 0,  // extract th cells from this row for column headings (zero-based)
  ignoreHeadingRow: true, // Don't tread the heading row as data
  ignoreRows: [],
}
router.get('/', function (req, res, next) {
  const uri = 'https://www.mohfw.gov.in/';
  request(uri, (error, response, body) => {
    // console.log('statusCode:', response && response.statusCode);
    const $ = cheerio.load(body);
    // const resposeData = data.find('#cases').children();


    // Print generated time and data
    // const lastUpdateTimeStamp = $('#cases').children().find('p').text();
    // console.log("lastUpdateTimeStamp - ", lastUpdateTimeStamp);

    const jsonReponse = []
    const columnHeadings = []
    $('#cases .table-responsive').each((i, table) => {
      let trs = $(table).find('tr');

      // Set up the column heading names
      getColHeadings($(trs[options.rowForHeadings]))

      // Process rows for data
      $(table).find('tr').each(processRow)
    })
    // console.log(options);
    // console.log(jsonReponse);
    // console.log(columnHeadings);
    fs.writeFile('doodle.json', JSON.stringify(jsonReponse), () => console.log("Table data written into file."));

    // let tHead = $('#cases').find('table');     //.find('tr');//.children();
    // console.log(">>> thead ", tHead.length);

    // let trs = [];
    // data.find('thead').each((i, e) => {
    //   trs[i] = e.next;
    //   // console.log(i);
    // })
    // for (i = 0; i < trs.length; i++) {
    //   console.log(trs[i]);
    // }




    function getColHeadings(headingRow) {
      const alreadySeen = {}

      $(headingRow).find('th').each(function (j, cell) {
        let tr = $(cell).text().trim()

        if (alreadySeen[tr]) {
          let suffix = ++alreadySeen[tr]
          tr = `${tr}_${suffix}`
        } else {
          alreadySeen[tr] = 1
        }

        columnHeadings.push(tr)
      })
    }

    function processRow(i, row) {
      const rowJson = {}

      if (options.ignoreHeadingRow && i === options.rowForHeadings) return
      // TODO: Process options.ignoreRows

      $(row).find('td').each(function (j, cell) {
        rowJson[columnHeadings[j]] = $(cell).text().trim()
      })

      // Skip blank rows
      if (JSON.stringify(rowJson) !== '{}') jsonReponse.push(rowJson)
    }
  });
  res.send('respond with a resource');
});
module.exports = router;
