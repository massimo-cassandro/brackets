// calcola la sequenze delle teste di serie e il loro
// posizionamento nel primo round

// v1: sequenza TdS hardcoded

export default function (num_matches = 0, num_tds = 0) {

  let match_id = 1,
    tds_position = [];

  if(num_matches && num_tds) {
    const step_tds = num_matches / num_tds,
      tds_seq = {
        2:  [1, 2],
        4:  [1, 4, 3, 2],
        8:  [1, 8, 5, 4, 3, 6, 7, 2],
        16: [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 15, 2],
        32: [1, 32, 17, 16, 9, 24, 25, 8, 5, 28, 21, 12, 13, 20, 29, 4, 3, 30, 19, 14, 11, 22, 27, 6, 7, 26, 23, 10, 15, 18, 31, 2],
        64: [1, 64, 33, 32, 17, 48, 49, 16, 9, 56, 41, 24, 25, 40, 57, 8, 5, 60, 37, 28, 21, 44, 53, 12, 13, 52, 45, 20, 29, 36, 61, 4, 3, 62, 35, 30, 19, 46, 51, 14, 11, 54, 43, 22, 27, 38, 59, 6, 7, 58, 39, 26, 23, 42, 55, 10, 15, 50, 47, 18, 31, 34, 63, 2]
      };

    for(let t = 0; t < num_tds; t++) {

      // al superamento della metà delle TdS viene aggiunto un intervallo extra
      // per simmetria del posizionamento rispetto alla metà del tabellone
      if(t === num_tds/2) {
        match_id += step_tds - 1;
      }

      tds_position.push({
        tds: tds_seq[num_tds][t],
        match_id: match_id,
      });

      match_id += step_tds;
    }
  }
  return tds_position;
}
