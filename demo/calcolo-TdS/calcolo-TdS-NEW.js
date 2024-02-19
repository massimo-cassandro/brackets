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

/*

  TODO
    * l'uso di direction non funziona
    * approfondire la sequenza immaginando le due metà come speculari
      Es (8 tds):
          1 8 5 4 | 3 6 7 2

          1 8 5 4    <== prima metà
          2 7 6 3 ↲  <== seconda metà invertita

    * la sequenza di confronto attuale potrebbe non essere corretta
*/


let params = {match_ides_round1: 16};
let num_tds = 8;

// porzione di partite per ogni TdS
// corrisponde al numero di partite tra un tds e l'altra
// (compresa la tds stessa)
let step_tds = params.match_ides_round1 / num_tds,

  tds_position = [];

let match_id = 1;
let tds_seq = Array(num_tds).fill().map((item, index) => 1 + index);

console.log(tds_seq);
let direction = 0;

for(let t = 0; t < num_tds; t++) {

  // al superamento della metà delle TdS viene aggiunto un intervallo extra
  // per simmetria del posizionamento rispetto alla metà del tabellone
  if(t === num_tds/2) {
    match_id += step_tds - 1;
  }

  let tds;
  let _tdSeq = JSON.stringify(tds_seq);
  if(direction % 2 === 0) {
    tds= t % 2 === 0? tds_seq.shift() : tds_seq.pop();
  } else {
    tds= t % 2 === 0? tds_seq.pop() : tds_seq.shift();

  }

  tds_position.push({
    t: t,
    tds: tds,
    match_id: match_id,
    tds_seq: _tdSeq
  });
  match_id += step_tds;
  if(t % 2 !== 0) {

    direction++;
  }

}

console.log(tds_position);
