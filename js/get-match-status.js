// restituisce un array di status del match dato

export default function (match) {
  let status = {};
  if(match) {
    status = {
      isBye: [
        // player1 mancante
        match.p.length === 2 && match.p[0] === null && match.p[1] !== null &&
        (match.w === match.p[1] || match.w === 0), // match.w === 0 => noshow del player 2

        // player2 mancante
        (match.p.length === 1 || (match.p.length === 2 && match.p[1] === null)) &&
        match.p[0] !== null &&
        (match.w === match.p[0] || match.w === 0) // match.w === 0 => noshow del player 1
      ],
      isPlayed: match.w !== null,

      winnerIdx: null // indice del giocatore in match.p vincente
    };

    // noshow: quando un giocatore non si presenta
    // il noshow è identificato dal fatto che i giocatori sono 2, lo score è vuoto
    // e il winner è impostato
    status.isNoshow = [
      // noshow player 1
      !status.isBye[0] &&
      match.p.length === 2 && match.p[0] !== null && match.p[1] !== null &&
      match.s.length === 0 &&
      match.w === match.p[1],

      // noshow player 2
      !status.isBye[1] &&
      match.p.length === 2 && match.p[0] !== null && match.p[1] !== null &&
      match.s.length === 0 &&
      match.w === match.p[0]
    ];

    status.isDoubleNoshow = !status.isBye[0] && !status.isBye[1] &&
      match.p.length === 2 && match.p[0] !== null && match.p[1] !== null &&
      match.s.length === 0 &&
      match.w === 0;

    // noshow con bye dell'altro giocatore
    if(status.isBye[1] && match.w === 0) {
      status.isNoshow[0] = true;
    }
    if(status.isBye[0] && match.w === 0) {
      status.isNoshow[1] = true;
    }

    if(status.isDoubleNoshow) {
      status.isNoshow[0] = true;
      status.isNoshow[1] = true;
    }


    // true se il match è stato composto in modo definitivo
    status.defined = (match.p.length === 2 && match.p[0] !== null && match.p[1] !== null) ||
      status.isBye[0] || status.isBye[1];


    if (match.p[0] && match.w !== null && match.p[0] === match.w) {
      status.winnerIdx = 0;

    } else if (match.p[1] && match.w !== null && match.p[1] === match.w) {
      status.winnerIdx = 1;

    // queste non dovrebbero verificarsi perché il winner è solitamente impostato
    // salvo che per i match non completamente definiti
    // (= una delle due partore precedenti non ancora svolta)
    } else if(match.p[0] && match.w !== null &&
      !status.isNoshow[0] && !status.isBye[0] && (status.isBye[1] || status.isNoshow[1])) {
      status.winnerIdx = 0;

    } else if (match.p[1] && match.w !== null &&
        !status.isNoshow[1] && !status.isBye[1] && (status.isBye[0] || status.isNoshow[0])) {
      status.winnerIdx = 1;
    }

  }

  return status;
}
