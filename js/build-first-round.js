/*
  genera le partire del primo round e restituisce il relativo array
*/
import shuffle from './src/shuffle-array';
import get_bracket_params, {get_match_params} from './get-bracket-params';
import calcolo_tds from './src/calcolo-TdS';

export default function(opts = {members: [], custom_matches: []}) {
  /*
    opts = {
      members: [
        {
          "id": 12,
          "n": "SchiappettaTheBoss",
          "rk": 1,
          "ts": 1
        },
        ...
      ],

      custom_matches : [
        [123, 124],      <== id dei giocatori da inserire nella stessa partita
        [125],           <== partita con bye
        ...
      ]
    }

    // array matches da restiture (vedi docs -> tracciati-json.md):
    [
      {
        r: 1,          <== numero round (sempre 1 in questa procedura)
        m: n,          <== match id (progressivo dei match)
        p: [p1, p2],   <== array dei player, p2 è null in caso di bye
        s: [],         <== score, array vuoto in questa procedura
        w: null | p1   <== winner, null o p1 se è un bye
      },
      ...
    ]

  */

  const default_opts = {
    members: [],
    custom_matches: []
  };
  opts = Object.assign({}, default_opts, opts);

  // calcolo numero giocatori necessari, numero rounds, partite, bye, ecc
  const bracket_params = get_bracket_params({num_iscritti: opts.members.length});

  // =>> bye da assegnare
  // quelle riservate per i custom_matches vengono momentaneamente separate
  // ad evitare che vengano utilizzate dalle TdS
  let bye_da_assegnare = bracket_params.num_bye,
    bye_cm = 0;
  if(opts.custom_matches.length) {
    // i custom matches con bye sono quelli con un solo elemento
    bye_cm = opts.custom_matches.filter(item => item.length === 1).length;
    bye_da_assegnare -= bye_cm;
  }


  // console.log('bracket_params', bracket_params);
  // console.log('num members', opts.members.length);
  // console.log('num custom_matches', opts.custom_matches.length);
  // console.log('num_tds', opts.members.filter(item => item.ts !== null).length);

  // =>> sparse array partite e contatore id match
  let matches = Array(bracket_params.matches_round1);

  // =>> array degli iscritti ordinati per tds ASC e ranking DESC
  let iscritti = opts.members.slice(0);
  iscritti.sort((a,b) => {
    let ts = (a.ts === null) - (b.ts === null) || a.ts - b.ts;
    let rk = b.rk - a.rk;
    return ts || rk;
  });


  // =>> conteggio e controlli teste di serie
  const num_tds = iscritti.filter(item => item.ts !== null).length;

  // le teste di serie devono essere una potenza di 2
  // https://stackoverflow.com/a/30924352/743443
  if(num_tds !== 0 && Math.log2(num_tds) % 1 !== 0) {
    throw new Error('Le TdS non sono un potenza di 2' );
  }

  // genera l'oggetto match base
  let round2_players = {}; // contiene i player da impostare nel round 2 in seguito a bye nel round 1

  const createMatch = (round, match_id, players, winner) => {
    const match_params = get_match_params({m: match_id, r: round}, bracket_params);

    // in caso di bye, vengono impostati il vincitore e il player nel match figlio
    if(winner) {
      if(!round2_players[match_params.child_match]) {
        round2_players[match_params.child_match] = [];
      }
      round2_players[match_params.child_match][match_id % 2 !== 0? 0 : 1] = winner;
    }


    return {
      r: round,
      m: match_id,
      p: players,
      s: [],
      w: winner,
      child_match: match_params.child_match
    };
  };

  // match id delle partite con TdS
  /*
    è un array con questa forma:
      [
        {
          tds       <== valore tds
          match_id  <== match_id della partita in cui collocare la tds
        },
        ...
      ]
  */
  const tds_position = calcolo_tds(bracket_params.matches_round1, num_tds);
  let tds_assegnate = 0; // serve a saltare eventuali bòocchi di codici non necessari
  // =>> funzione creazione match
  // nel caso di bye inserire solo l'id 1 o impostare a null il secondo
  const addMatchRound1 = (player1, player2 = null, random_match = false) => {

    let match_id;

    if(tds_assegnate < num_tds) { // salta questo blocco se non necessario
      // verifica se uno due player è tds (NB: può essere uno solo)
      let playerTS = [player1, player2].filter(item => item !== null && item.ts !== null);
      if(playerTS.length) {
        match_id = tds_position.filter(item => item.tds === playerTS[0].ts)[0].match_id;
        tds_assegnate++;
      }
    }

    // se il match_id non è ancora definito (non tds), viene recuperato un
    // indice disponibile (in modo random se `random_match` === true) nell'array matches
    if(match_id === undefined) {
      let idx;
      if(random_match) {

        let empty_indexes = [...matches]
          .map((item, idx) => item === undefined? idx : null)
          .filter(item => item !== null);

        if (!empty_indexes.length) {
          throw new Error('addMatchRound1: nessun slot vuoto disponibile (random_match)');
        }
        idx = empty_indexes[Math.floor(Math.random() * empty_indexes.length)];
      } else {
        idx = matches.findIndex(item => item === undefined);
        if (idx === -1) {
          throw new Error('addMatchRound1: nessun slot vuoto disponibile' );
        }
      }

      match_id = idx + 1;
    }

    // child_match viene generato solo per la registrazione sul db, non è necessario
    // per il rendering del bracket
    matches[match_id - 1] = createMatch(
      /* round    */ 1,
      /* match_id */ match_id,
      /* players  */ [player1.id, (player2? player2.id : null)],
      /* winner   */ player2 !== null? null : player1.id
    );
  };


  // =>> aggiunta teste di serie
  // (ad esclusione di quelle eventualmente presenti nei custom_matches)
  // queste assegnazioni vanno per prime, per evitare che le posizioni
  // delle TdS siano occupate da altre partite
  iscritti.filter(item => item.ts !== null).forEach(player1 => {
    if(opts.custom_matches.flat().indexOf(player1.id) === -1) {
      let player2;

      if(bye_da_assegnare) {
        player2 = null;
        bye_da_assegnare--;

      } else {
        // player2 viene preso alla fine, l'array iscritti è ordinato per ranking DESC
        // quindi ha il ranking più basso disponibile
        player2 = iscritti.filter(item => item.ts === null).slice(-1)[0];
        iscritti.splice(iscritti.findIndex(item => item.id === player2.id), 1);
      }

      // rimozione di player1 dall'array iscritti
      iscritti.splice(iscritti.findIndex(item => item.id === player1.id), 1);

      addMatchRound1(player1, player2? player2 : null);

    }
  }); // end tds

  // i bye riservati alle cm vengono riaggiunti al totale dei bye disponibili
  bye_da_assegnare += bye_cm;

  // =>> aggiunta custom_matches
  // ed eliminazione dall'array iscritti (se c'è un solo giocatore si tratta di un bye)
  // se il match contiene una tds viene utilizzata la posizione in tds_position
  // queste assegnazioni vanno eseguite subito dopo le TdS per il corretto conteggio
  // dei bye disponibili
  opts.custom_matches.forEach( item => {

    // recupero e rimozione dei record relativi dall'array iscritti
    let players = [];
    item.forEach(player_id => {
      players.push(
        iscritti.splice(iscritti.findIndex(item => item.id === player_id), 1)[0]
      );
    });


    if(players.length === 2 && players[0].ts !== null && players[1].ts !== null ) {

      throw new Error('addMatchRound1: custom match con due TdS ' +
        `(#${players[0].id} “${players[0].n}” vs #${players[1].id} “${players[1].n}”)` );
    }

    if(players.length === 1) {
      if(bye_da_assegnare <= 0) {
        throw new Error(`custom matches: Bye non disponibile (match con #${players[0].id} “${players[0].n}”)` );
      }
      bye_da_assegnare--;
      players.push(null);
    }
    addMatchRound1(...players, true);
  }); // end custom_matches


  // =>> aggiunta altre partite con bye
  // vengono assegnati ai giocatori con ranking più alto
  // (l'array iscritti è già stato ordinato in modo che i ranking più alti siano
  // all'inizio, in modo che abbiano la preferenza nell'assegnazione dei bye)
  iscritti.splice(0, bye_da_assegnare).forEach(player => {
    addMatchRound1(player, null, true);
  });

  // =>> array degli iscritti RIMANENTI randomizzato
  iscritti = shuffle(iscritti);


  // =>> il numero degli iscritti (esclusi i bye) deve essere pari
  if((iscritti.length) % 2 !== 0) {
    throw new Error('Il numero di iscritti risultante dalle precedenti elaborazioni non è pari');
  }

  // =>> aggiunta nel round 1 degli iscritti non tds o cm
  if(iscritti.length) {
    iscritti.forEach((player, idx) => {
      if(idx % 2 === 0) { // salta gli indici pari
        addMatchRound1(player, iscritti[idx+1]);
      }
    });
  }

  // console.log('total matches',  matches.length);
  // console.log('not empty matches: ', matches.filter(item => item).length);
  // console.log('tds_position', tds_position);
  // console.log(matches);

  // =>> controlli finali
  if(matches.length !== bracket_params.matches_round1) {
    throw new Error(`Sono presenti ${matches.length} partite invece di ${bracket_params.matches_round1}`);
  }
  if(matches.findIndex(item => item === undefined) !== -1) {
    throw new Error('Sono presenti partite non definite');
  }

  // matches turni successivi
  let num_matches_round = bracket_params.matches_round1, // matchs round corrente
    tot_matches = num_matches_round, // match già aggiunti a matches
    match_id = num_matches_round + 1; // prossimo match_id

  for( let round = 2; round <= bracket_params.num_rounds; round++) {

    // matches di questo round
    num_matches_round = num_matches_round / 2;
    tot_matches += num_matches_round;

    for(let i = match_id; i <= tot_matches; i++) {
      // conversione eventuali undefined -> null
      if(round2_players[i]) {
        round2_players[i][0] ??= null;
        round2_players[i][1] ??= null;
      }
      matches.push(
        createMatch(
          /* round    */ round,
          /* match_id */ i,
          /* players  */ round2_players[i]? round2_players[i] : [],
          /* winner   */ null
        )
      );
    }
    match_id += num_matches_round;
  }
  return matches;
}
