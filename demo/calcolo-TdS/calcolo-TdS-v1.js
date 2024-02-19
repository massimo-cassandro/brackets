/*
  * https://en.wikipedia.org/wiki/Template:2TeamBracket
  * https://en.wikipedia.org/wiki/Template:4TeamBracket
  * https://en.wikipedia.org/wiki/Template:8TeamBracket
  * https://en.wikipedia.org/wiki/Template:16TeamBracket
    * https://en.wikipedia.org/wiki/Template:Round16
  * https://en.wikipedia.org/wiki/Template:32TeamBracket
  * https://en.wikipedia.org/wiki/Template:64TeamBracket
  * https://en.wikipedia.org/wiki/Template:128TeamBracket
*/

// Versione 1 con la squenza delle TdS non calcolata al momento
// ma preregistrata

// run → node demo/calcolo-TdS/calcolo-TdS-v1.js

let num_matches = 32; // numero match round 1
let num_tds = 16;     // numero Teste di Serie

// porzione di partite per ogni TdS
// corrisponde al numero di partite tra un tds e l'altra
// (compresa la tds stessa)
const step_tds = num_matches / num_tds,

  tds_seq = {
    4:  [1, 4, 3, 2],
    8:  [1, 8, 5, 4, 3, 6, 7, 2],
    16: [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 15, 2],
    32: [1, 32, 17, 16, 9, 24, 25, 8, 5, 28, 21, 12, 13, 20, 29, 4, 3, 30, 19, 14, 11, 22, 27, 6, 7, 26, 23, 10, 15, 18, 31, 2]
  };

let match_id = 1,
  tds_position = [];

for(let t = 0; t < num_tds; t++) {

  // al superamento della metà delle TdS viene aggiunto un intervallo extra
  // per simmetria del posizionamento rispetto alla metà del tabellone
  if(t === num_tds/2) {
    match_id += step_tds - 1;
  }

  tds_position.push({
    t: t,
    tds: tds_seq[num_tds][t],
    match_id: match_id,
  });

  match_id += step_tds;

}
