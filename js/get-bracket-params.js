// calcola e restituisce una serie di parametri del tabellone

export default function (opts) { // get_bracket_params

  const default_opts = {
    num_iscritti: 0
  };

  opts = Object.assign({}, default_opts, opts);
  let bracket_params =  {
    num_rounds        : Math.ceil(Math.log2(opts.num_iscritti)),
    num_players       : 0,
    matches_round1    : 0,
    num_bye           : 0
  };
  bracket_params.num_players = Math.pow(2, bracket_params.num_rounds);
  bracket_params.matches_round1 = bracket_params.num_players / 2;
  bracket_params.num_bye = bracket_params.num_players - opts.num_iscritti;

  return bracket_params;
}

// determina alcuni dati del match dato
export function get_match_params(match, bracket_params) {
  let match_params = {
    child_match : Math.ceil(match.m / 2) + bracket_params.matches_round1,
    next_round  : match.r + 1
  };
  if(match_params.next_round > bracket_params.num_rounds) {
    match_params = {
      child_match : null,
      next_round  : null
    };
  }
  return match_params;
}
