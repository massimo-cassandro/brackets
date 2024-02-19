export default (current_round, tot_rounds) => {
  let round_name;
  switch (tot_rounds - current_round) {
    case 0:
      round_name = 'Finale';
      break;

    case 1:
      round_name = 'Semifinale';
      break;

    case 2:
      round_name = 'Quarti di finale';
      break;

    case 3:
      round_name = 'Ottavi di finale';
      break;

    default:
      round_name = '';
      break;
  }
  return round_name;
};
