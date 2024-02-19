/* eslint-env node */
// https://stackoverflow.com/questions/5892569/responding-with-a-json-object-in-node-js-converting-object-array-to-json-string/5893611
// https://github.com/sindresorhus/open
// https://techsparx.com/nodejs/esnext/dirname-es-modules.html

import data_generator from '../demo-src/brackets-data-generator.js';

// const fs = require('fs');
// const express = require('express');
// const app = express();
// const { exec } = require('child_process');
// const path = require('child_process');

import { exec } from 'child_process';
import path from 'path';
import express from 'express';
const app = express();

// console.log(JSON.stringify(import.meta)); // eslint-disable-line
// const moduleURL = new URL(import.meta.url);
// console.log(`pathname ${moduleURL.pathname}`); // eslint-disable-line
// console.log(`dirname ${path.dirname(moduleURL.pathname)}`); // eslint-disable-line
// const __dirname = path.dirname(moduleURL.pathname);

app.listen(5501, () => {
  console.log('Server is up and running on 5500 ...'); // eslint-disable-line
});

// https://stackoverflow.com/a/26118076/743443
// app.use(express.static(path.join(__dirname, '/')));

// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname, '/index.html'));
// });


// app.get('/json', (req, res) => {
//   res.setHeader('Content-Type', 'text/html');
//   res.send(
//     `<!DOCTYPE html>
//     <html lang="it">
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
//         <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
//         <title>JSON</title>
//       </head>
//       <body>
//         <h1>JSON</h1>
//         <p>NB: questi json sono solo per visualizzazione e debug.
//         I dati sono generati in modo random e vanno generati tutti contemporaneamente.</p>
//         <ul>
//           <li><a href="/json/iscritti">iscritti</a></li>
//           <li><a href="/json/partite">partite</a></li>
//         </ul>
//       </body>
//     </html>`
//   );
// });

// app.get('/json/iscritti', (req, res) => {
//   res.set('Cache-Control', 'public, max-age=-1, s-maxage=-1');
//   res.json(data_generator('iscritti'));
//   res.end();
// });

// app.get('/json/partite', (req, res) => {
//   res.set('Cache-Control', 'public, max-age=-1, s-maxage=-1');
//   res.json(data_generator('partite'));
//   res.end();
// });


// https://stackoverflow.com/questions/39404588/prevent-cache-when-serving-a-json-response-in-node-js-api

app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', 0);
  res.setHeader('Surrogate-Control', 'no-store');
  res.json(data_generator());
  res.end();
});

exec('open http://localhost:5501/', (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`); // eslint-disable-line
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`); // eslint-disable-line
    return;
  }
  console.log(`stdout: ${stdout}`); // eslint-disable-line
});


// fs.writeFileSync('./data/partite.json',
//   JSON.stringify(partite, null, 2)
// );
