/*
  Generazione brackets eliminazione diretta
*/

import round_namer from './src/round-namer';
import get_match_status from './get-match-status';
import get_bracket_params, {get_match_params} from './get-bracket-params';
import drag_scroller from './src/drag-scroller';
import nav from './src/nav';

/*
  opts: {
    container: dom element,
    members: array,
    matches: array,
    config:  object, // configurazioni torneo
  }
*/
export default function(opts) {

  /*
    config:
    ------------------------------
    show_seeded         : se true, le teste di serie sono evidenziate
    is_team             : se true si tratta di un torneo teams
    noshow_icon         : se presente mostra l'icona indicata nei no-show
    match_callback      : funzione richiamata quando si fa clic su un match
    match_cbk_selector  : selettore dei match a cui applicare il callback
    player_callback     : funzione richiamata quando si fa clic su un player
    player_cbk_selector : selettore dei player a cui applicare il callback
    extra_info          : se true, al markup vengono aggiunte classi e attributi
                          data-* non necessari per la visualizzazione ma utili
                          ma per l'editing e la gestione dei dati

    Se sia `match_callback` che `player_callback` sono presenti,
    `player_callback` prevale

    All'elemento target è aggiunta la classe `brk-has-cbk`

    Entrambe le funzioni sono invocate avendo come argomento il target
    e il parametro `is_team`

  */
  const default_config = {
    show_seeded         : false, // modificabile da config torneo
    is_team             : false, // modificabile da config torneo
    noshow_icon         : null,
    bracket_callback    : null,
    match_cbk_selector  : '.brk-match-wrapper:not(.brk-undef) .brk-match',
    player_callback     : null,
    player_cbk_selector : '.brk-match-player:not([data-pid=""])',
    extra_info          : false
  };


  opts.config = Object.assign({}, default_config, opts.config || {});

  const num_rounds = Math.ceil(Math.log2(opts.members.length));
  // num_players_round_1 = Math.pow(2, params.num_rounds);

  opts.container.innerHTML = '';
  opts.container.insertAdjacentHTML('afterbegin',
    `<div class="brk-outer-wrapper">
      <div class="brk-container">
        <div class="brk-wrapper"></div>
      </div>
    </div>`
  );

  const bracket_container = opts.container.querySelector('.brk-wrapper'),
    bracket_params = get_bracket_params({ num_iscritti: opts.members.length }),

    brackets = match => { // elemento base singola partita

      let match_status = get_match_status(match),
        bracket_title = `Round ${match.r} / Match ${match.m}`;

      const players = [0,1].map(idx => {
        let this_player = {
          p:  (match.p[idx]? opts.members.filter(i => +i.id === match.p[idx])[0] : null), // record dati player
          tds: '', // stringa numero testa di serie
          title: '', // porzione bracket_title di questo player
        };

        if(opts.config.show_seeded && this_player.p && this_player.p?.ts !== null/*  && match.r === 1 */) {
          this_player.tds = `<span class="brk-seeded">${this_player.p.ts }</span> `;
        }

        if(match_status.defined) {
          if(this_player.p) {
            this_player.title = this_player.p.n + (match_status.isNoshow[idx]? ' (no show)' : '');
          } else {
            this_player.title = '[bye]';
          }
        }
        return this_player;
      });

      if(match_status.defined) {
        bracket_title += ': ' + [players[0].title, players[1].title]
          .join((players[0].p && players[1].p)? ' vs ' : ' / ');
      }

      let wrapper_class = [];
      if(match_status.isPlayed) {
        wrapper_class.push('brk-played');
      }
      if(match_status.isBye[0]) {
        wrapper_class.push('bye1');
      } else if (match_status.isBye[1]) {
        wrapper_class.push('bye2');
      } else if (match_status.isDoubleNoshow) {
        wrapper_class.push('no-show1', 'no-show2');
      } else if (match_status.isNoshow[0]) {
        wrapper_class.push('no-show1');
      } else if (match_status.isNoshow[1]) {
        wrapper_class.push('no-show2');
      }

      // extra_info class e data-*
      let extra_attr = [];
      if(opts.config.extra_info) {
        const match_params = get_match_params(match, bracket_params),
          child_match_status = get_match_status(
            opts.matches.filter(match => match.m === match_params.child_match)[0]
          );

        if(!match_status.defined) {
          wrapper_class.push('brk-undef');
        }
        if(child_match_status.isPlayed) {
          wrapper_class.push('brk-cm-played');
        }
        extra_attr = [
          `data-cm="${match_params.child_match}"`
        ];
      }

      const isByeOrNoshow = match_status.isBye[0] || match_status.isNoshow[0] || match_status.isBye[1] || match_status.isNoshow[1];

      const players_rows = players.map((player, idx) => {

        let isBye = match_status.isBye[idx],
          isNoshow = match_status.isNoshow[idx],
          // isBye_altro_player = match_status.isBye[idx === 0? 1 : 0],
          // isNoshow_altro_player = match_status.isNoshow[idx === 0? 1 : 0],
          player_class= idx === 0? 'one' : 'two';

        return `<div class="brk-match-player ${player_class} ${match_status.winnerIdx === idx? 'winner' : ''}" data-pid="${player.p?.id?? ''}">
          <div>
            ${(isNoshow && opts.config.noshow_icon)? opts.config.noshow_icon : ''}
            ${player.tds}${isBye? 'Bye' : (player.p?.n?? '')}
          </div>
        </div>
        <div class="brk-match-score ${player_class} ${match_status.winnerIdx === idx? 'winner' : ''}">
          ${/* match.s[idx] ?? ((isBye_altro_player || isNoshow_altro_player)? '&ndash;' : '') */''}
          ${match.s[idx] ?? (isByeOrNoshow? '&ndash;' : '')}
        </div>`;

      });


      // data-p in `brk-match-wrapper` è usato come selettore per l'evidenziazione del percorso di un player
      return `<div class="brk-match-wrapper ${wrapper_class.join(' ')}"
          data-p="${match.p.filter(pid => pid !== null).join(' ')}" role="banner">
        <div class="brk-connector rear" aria-hidden="true"></div>
        <div class="brk-match" title="${bracket_title}" data-m="${match.m}" ${extra_attr.join(' ')}>
          <div class="brk-match-idx"><span>${match.m}</span></div>
          ${players_rows.join('')}
        </div>
        <div class="brk-connector front" aria-hidden="true"></div>
      </div>`;

    }; // end brackets func


  // ordinamento matches per match_id
  opts.matches.sort((a,b) => a.m - b.m);

  for( let r = 1; r <= num_rounds; r++ ) {
    let round_name = round_namer(r, num_rounds);
    if(round_name) {
      round_name = `Round ${r}<br><strong>${round_name}</strong>`;
    } else {
      round_name = `Round ${r}`;
    }


    // partite del round
    let partite_round = opts.matches.filter(p => +p.r === r);

    // `data-r` è utilizzato per la navigazione da menu
    bracket_container.insertAdjacentHTML('beforeend',
      `<div class="brk-round-wrapper">
        <div class="brk-round-header">${round_name}</div>
        <div class="brk-round-inner-wrapper" data-r="${r}">
          ${partite_round.map(brackets).join('')}
        </div>
      </div>`
    );

  } // end for

  // aggiunta listener per clic su match o player
  if(opts.config.player_callback && opts.config.player_cbk_selector && typeof opts.config.player_callback === 'function') {
    bracket_container.querySelectorAll(opts.config.player_cbk_selector)
      .forEach(item => {
        item.classList.add('brk-has-cbk');
        item.addEventListener('click', () => {
          opts.config.player_callback(item, opts.config.is_team);
        }, false);
      });

  } else if (opts.config.match_callback && opts.config.match_cbk_selector && typeof opts.config.match_callback === 'function') {
    bracket_container.querySelectorAll(opts.config.match_cbk_selector)
      .forEach(item => {
        item.classList.add('brk-has-cbk');
        item.addEventListener('click', () => {
          opts.config.match_callback(item, opts.config.is_team);
        }, false);
      });
  }


  // drag to scroll
  drag_scroller(opts.container.querySelector('.brk-container'));

  nav(opts.container.querySelector('.brk-outer-wrapper'), num_rounds);

}
