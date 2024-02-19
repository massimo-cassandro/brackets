import data_generator from '../demo-src/brackets-data-generator';
import stringify from '../demo-src/stringify-replacer';

import get_bracket_params from '../../js/get-bracket-params';
import build_first_round from '../../js/build-first-round';
import build_brackets from '../../js/single-elimination-brackets';

// TODO ottimizzare, riorganizzare variabili, ecc.
// TODO rifare gioca round
// TODO popup edit match

(() => {
  'use strict';
  const json_partite_wrapper = document.getElementById('json-partite'),
    json_iscritti_wrapper = document.getElementById('json-iscritti');

  let data = {},
    brk_params,
    brackets_options = {},
    matches = [], //match salvati nello storage
    iscritti = []; //iscritti salvati nello storage

  // impostazioni di configurazione dei bracket da unire a quelle del torneo
  const demo_config = {
    noshow_icon      : '<img src="/demo/icone-demo/noshow.svg" class="brk-noshow-icon" alt="noshow icon">',
    match_callback   : match_container => { // questo non ha effetto se player_callback è impostato
      const data = match_container.dataset;
      alert(`Match ${data.m}`);
    },
    // player_callback  : player_container => {
    //   const data = player_container.dataset;
    //   alert(`Player #${data.pid}`);
    // }
  };

  // input generazione dati brackets
  const input_num_iscritti = document.getElementById('num-iscritti'),
    input_num_match_pers = document.getElementById('num-match'),
    input_num_tds = document.getElementById('num-tds'),
    input_show_tds = document.getElementById('show-tds');

  // pulsanti
  const btn_primo_round = document.querySelector('.primo-round'),
    btn_gioca_round = document.querySelector('.gioca-round');


  // verifica se un numero è primo. Usato per estrarre casualmente elementi
  // https://stackoverflow.com/a/49842625/743443
  const isPrime = num => { // returns boolean
    if (num <= 1) return false; // negatives
    if (num % 2 === 0 && num > 2) return false; // even numbers
    const s = Math.sqrt(num); // store the square to loop faster
    for(let i = 3; i <= s; i += 2) { // start from 3, stop at the square, increment in twos
      if(num % i === 0) return false; // modulo shows a divisor was found
    }
    return true;
  };

  const crea_dati_demo = function() {

    data = data_generator(
      +input_num_iscritti.value,
      +input_num_match_pers.value,
      +input_num_tds.value,
      input_show_tds.checked
    );

    brk_params = get_bracket_params({
      num_iscritti: +input_num_iscritti.value
    });

    // const stringify = (data) => {
    //   return JSON.stringify(data, null, 2);
    // };

    document.getElementById('json-parametri-demo').innerHTML = `
      <div id="stats" class="stats"></div>
      <h4>Parametri dati demo</h4>
      <div class="json">${stringify(data.demo_params)}</div>
      <h4>Parametri torneo</h4>
      <div class="json">${stringify(data.config)}</div>
    `;
    document.getElementById('stats').innerHTML = data.stats.join('');

    json_iscritti_wrapper.innerHTML = stringify(iscritti.length? iscritti : data.members);
    json_partite_wrapper.innerHTML = stringify(matches.length? matches : data.matches);

    // crea struttura vuota brackets
    brackets_options = {
      container   : document.getElementById('bracket-demo-container'),
      members     : iscritti.length? iscritti : data.members,
      matches     : matches.length? matches : data.matches,
      config      : {...demo_config, ...data.config}
    };

    build_brackets(brackets_options);


  }; // end crea_dati_demo

  // =>> generazione dati brackets
  document.querySelector('.genera-dati').addEventListener('click', () => {
    if(!input_num_iscritti.checkValidity() ||
      !input_num_match_pers.checkValidity() ||
      !input_num_tds.checkValidity()
    ) {
      alert('Errore nei parametri');

    // tds minore della metà degli iscritti
    } else if(+input_num_tds.value > Math.floor(+input_num_iscritti.value/2)) {
      alert('Il numero delle Teste di Serie deve essere una potenza di due e ' +
        'deve essere minore della metà degli iscritti');

    } else {
      matches = [];
      localStorage.removeItem('demo_matches');
      iscritti = [];
      localStorage.removeItem('demo_members');

      crea_dati_demo();
      btn_primo_round.disabled = false;
      btn_gioca_round.disabled = true;

      localStorage.setItem('demo_params', JSON.stringify({
        input_num_iscritti: input_num_iscritti.value,
        input_num_match_pers: input_num_match_pers.value,
        input_num_tds: input_num_tds.value,
        input_show_tds: input_show_tds.checked
      }));
    }
  }, false);


  // =>> pulsante generazione brackets
  btn_primo_round.addEventListener('click', () => {

    matches = build_first_round({
      members        : data.members,
      custom_matches : data.demo_params.custom_matches
    });

    brackets_options.matches = matches;
    build_brackets(brackets_options);

    localStorage.setItem('demo_matches', JSON.stringify(matches));
    localStorage.setItem('demo_members', JSON.stringify(data.members));
    json_partite_wrapper.innerHTML = stringify(matches);

    btn_primo_round.disabled = true;
    btn_gioca_round.disabled = false;

  }, false);


  // // =>> pulsante gioca round
  // btn_gioca_round.addEventListener('click', () => {
  //   last_round_idx = last_round_idx || get_last_round_idx();
  //   const new_round_idx = last_round_idx + 1;

  //   let last_match_id = matches.reduce((prev, curr) => {
  //     return Math.max(prev, curr.m);
  //   }, 0);

  //   // aggiunta punteggio
  //   const max_score = 9, min_score = 0;
  //   matches.forEach((item, idx) => {
  //     if(item.w === null) {
  //       for(let i = 0; i < 2; i++) {
  //         matches[idx].s
  //           .push(Math.floor(Math.random() * (max_score - min_score + 1) + min_score));
  //       }
  //       // parità
  //       if(matches[idx].s[0] === matches[idx].s[1]) {
  //         matches[idx].s[0]++;
  //       }

  //       let winner_index = item.s.indexOf(Math.max(...item.s));
  //       matches[idx].w = item.p[winner_index];

  //       // dati prova noshow
  //       // prime due partite round 2
  //       let first_match_round_2 = brk_params.matches_round1 + 1;
  //       if(item.m === first_match_round_2) {
  //         matches[idx].w = item.p[1];
  //         matches[idx].s = [];
  //       }
  //       if(item.m === first_match_round_2+1) { // doppio noshow
  //         matches[idx].w = 0;
  //         matches[idx].s = [];
  //       }

  //     }
  //   });

  //   // round successivi
  //   if(last_round_idx < brk_params.num_rounds) {
  //     let next_round = [];

  //     const prev_round = matches.filter(item => item.r === last_round_idx);

  //     for(let i = 0; i < prev_round.length; i = i + 2) {

  //       let players = [
  //         prev_round[i].w,
  //         prev_round[i+1].w
  //       ];

  //       // random noshow
  //       // viene incluso il bye se un numero a caso preso tra 0 e 10000 è primo
  //       let isNoshow = isPrime(Math.floor(Math.random() * (10000 - 1 + 1) + 1)),
  //         player_noshow = null, winner = null;
  //       if (isNoshow) { // viene scelto a caso uno dei due giocatori
  //         player_noshow = Math.floor(Math.random() * 2);
  //         winner = player_noshow === 0? players[1] : players[0];
  //       }

  //       next_round.push({
  //         r: new_round_idx,
  //         m: ++last_match_id,
  //         p: players,
  //         s: [],
  //         w: player_noshow === null? null : winner
  //       });

  //     } // end for

  //     matches = matches.concat(next_round);

  //   } // end if(new_round_idx < brk_params.num_rounds) {

  //   brackets_options.matches = matches.slice(0);
  //   build_brackets(brackets_options);
  //   document.getElementById('json-partite').innerHTML = stringify(matches);
  //   localStorage.setItem('demo_matches', JSON.stringify(matches));

  //   if(last_round_idx === brk_params.num_rounds) {
  //     btn_gioca_round.disabled = true;
  //   }
  //   last_round_idx++;

  // }, false); // end btn_gioca_round listener

  // =>> acquisisci dati da box
  document.querySelector('.acquisisci-box-dati').addEventListener('click', () => {

    iscritti = JSON.parse(json_iscritti_wrapper.innerText.replace(/(\w+):/g, '"$1":')),
    matches = JSON.parse(json_partite_wrapper.innerText.replace(/(\w+):/g, '"$1":'));
    localStorage.setItem('demo_matches', JSON.stringify(matches));
    localStorage.setItem('demo_members', JSON.stringify(iscritti));

    brackets_options.members = iscritti;
    brackets_options.matches = matches;

    build_brackets(brackets_options);
  }, false);

  // ==> recupero dati da localStorage
  if(localStorage.demo_params) {
    const stored_values         = JSON.parse(localStorage.demo_params);
    input_num_iscritti.value    = stored_values.input_num_iscritti;
    input_num_match_pers.value  = stored_values.input_num_match_pers;
    input_num_tds.value         = stored_values.input_num_tds;
    input_show_tds.checked      = stored_values.input_show_tds;
  }

  if(localStorage.demo_members) {
    iscritti = JSON.parse(localStorage.demo_members);
  }

  if(localStorage.demo_matches) {
    matches = JSON.parse(localStorage.demo_matches);
    btn_primo_round.disabled = true;
    btn_gioca_round.disabled = false;
  }

  crea_dati_demo(); // init
})();
