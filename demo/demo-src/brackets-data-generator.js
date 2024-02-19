export default function (num_iscritti = 12, num_match_pers = 2, num_tds = 4, show_tds = true) {

  // vedi `tracciati-json.md` per info sul tracciato dei dati

  // impostazioni manuali partite
  // gli id dei players devono essere compatibili con il valore num_iscritti
  let custom_matches = [];

  for (let i = 0; i < num_match_pers; i++) {
    let this_match = [];
    for(let j = 0; j < 2; j++) {
      let player_id;
      while (this_match.length < 2) {
        player_id = Math.ceil(Math.random() * num_iscritti);
        // evita duplicati

        if(custom_matches.concat(this_match).flat().indexOf(player_id) === -1) {
          this_match.push(player_id);
        }
      }
    }
    custom_matches.push(this_match);
  }


  // =>> ISCRITTI
  let iscritti = [];
  for(let i = 1; i <= num_iscritti; i++){

    let nick =  i + ' Nickname';
    if( i % 5 === 0 ){
      nick = `${i} long long long long nickame`;
    }

    nick += i === num_iscritti? ' *** ultimo' : '';

    iscritti.push({
      id: i,
      n: nick,
      rk: Math.floor(Math.random() * 100),
      ts: null
    });
  }

  // assegnazione random TdS (non devono essere inclusi nei match personalizzati)
  let tds_assegnate = 0; // è anche il valore gerarchico della tds
  while (tds_assegnate < num_tds) {
    let random_idx = Math.floor(Math.random() * iscritti.length);

    if(custom_matches.flat().indexOf(iscritti[random_idx].id) === -1 && iscritti[random_idx].ts === null) {
      iscritti[random_idx].ts = ++tds_assegnate;
    }
  }

  const num_rounds = Math.ceil(Math.log2(num_iscritti));
  const demo_config = {
    show_seeded: show_tds
  };

  let num_players_round_1 = Math.pow(2, num_rounds),
    num_partite = num_players_round_1 / 2;
  let num_bye = num_players_round_1 - iscritti.length;
  // let bye_at = num_partite - num_bye;


  let stats = [ // dati statistici, per controllo generazione dati
    `<ul>
      <li>totale iscritti: <strong>${num_iscritti}</strong></li>
      <li>players richiesti round 1: <strong>${num_players_round_1}</strong></li>
      <li>totale partire round 1 round 1: <strong>${num_partite}</strong></li>
      <li>round totali: <strong>${num_rounds}</strong></li>
      <li>partite round 1 con bye: <strong>${num_bye}</strong></li>
      <li>Match personalizzati: <strong>${custom_matches.length}</strong></li>
    </ul>`
  ];


  return {
    stats: stats,
    demo_params: {
      num_iscritti: num_iscritti,
      num_tds: num_tds,
      custom_matches: custom_matches
    },
    config:  demo_config,
    members: iscritti,
    matches: []
  };
}
