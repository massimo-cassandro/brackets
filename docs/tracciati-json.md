# Tracciati json (eliminazione diretta)

## iscritti e partite

Elenco degli iscritti (members) al torneo e delle partite (matches) giocate o definite:

```json
{
  "config": {
    "show_seeded": true,
    "is_team": false
  },

  "members": [
    {
      "id": 12,
      "n": "SchiappettaBoss",
      "rk": 1,
      "ts": 1
    },
    ...
  ],
  
  "matches": [
    // partita giocata
    {
      "r": 1,
      "m": 1,
      "p": [2, 3],
      "s": [3, 8],
      "w": 3
    },
    // partita definita ma non giocata
    {
      "r": 1,
      "m": 2,
      "p": [4, 5],
      "s": [],
      "w": null
    },
    // partita non definita
    {
      "r": 1,
      "m": 3,
      "p": [],
      "s": [],
      "w": null
    },

    ...
  ]
}
```

### `config`:

Parametri di configurazione specifici del torneo

* `show_seeded`: (default `false`) indica se evidenziare o meno le teste di serie nel tabellone
* `is_team`: (default `false`) `true` se il brackets riguarda partite di teams, `false` se si tratta di giocatori singoli


### `members`:

Iscritti al torneo

* `id`: (num) Id iscrizione
* `n`: (str) Nickame player o Nome Team
* `rk`: (num) ranking per il gioco del torneo in corso (stagione corrente)
* `ts`: (num) facoltativo, se presente, indica la posizione come testa di serie. Se il giocatore non è testa di serie, il campo non è presente.


### `matches`:

Composizione e risultati delle partite

* `r`: (num) (=round id) indice del round del torneo. Il valore massimo è il logaritmo in base 2 del numero giocatori del primo turno. La finale è l'ultimo round
* `m`: (num) (=match id) indice partita nel torneo corrente. L'indice delle partite è univoco in tutto il tutto il torneo (cioè non si riazzera ad ogni round)
* `p`: (array) (=players) array di id dei giocatori/teams che partecipano alla partita se è presente un solo player, o se uno dei due è `null`, la partita ha un **bye**
* `s`: (array) (=score) array di due interi che rappresentano i punteggi della partita array determina il vincitore della partita (l'indice dei punteggi corrisponde a quello dei players). Se la partita non è stata ancora giocata o se è un bye, l'array è vuoto
* `w`: (num) (=winner) id del player vincitore della partita, `null` se la partita non è stata giocata

I match i cui giocatori non sono ancora definiti, hanno l'array `p` vuoto (o con un solo giocatore se solo una delle due partire precedenti deve essere ancora giocata), l'array `s` vuoto e l'elemento `w` == `null`


#### Bye e no-show
* se è presente solo un giocatore, o se uno dei due è `null` si tratta di un **bye**, il vincitore (automaticamente assegnato all'elemento `w`) è il giocatore presente

```json
{
  "matches": [
    // bye player 2
    {
      "r": 1,
      "m": 2,
      "p": [4, null],
      "s": [],
      "w": 4
    },
    // bye player 2
    {
      "r": 2,
      "m": 3,
      "p": [5],
      "s": [],
      "w": 5
    },
    // bye player 1
    {
      "r": 2,
      "m": 4,
      "p": [null, 6],
      "s": [],
      "w": 6
    },
  ]
}
```

* se sono presenti entrambi i giocatori, l'elemento `s` è un array vuoto e il vincitore è assegnato (`w`) si tratta di un **no-show** del giocatore non vincitore

```json
{
  "matches": [
    // no-show player 1
    {
      "r": 1,
      "m": 2,
      "p": [4, 5],
      "s": [],
      "w": 5
    },
    // no-show player 2
    {
      "r": 1,
      "m": 3,
      "p": [6, 7],
      "s": [],
      "w": 6
    }
  ]
}
```

* se sono presenti entrambi i giocatori, l'elemento `s` è un array vuoto e `w` è `0` si tratta di un **no-show di entrambi i giocatori**, che diventa quindi un bye nel turno successivo

```json
{
  "matches": [
    // doppio no-show
    {
      "r": 1,
      "m": 2,
      "p": [4, 5],
      "s": [],
      "w": 0
    }
  ]
}
```

* se sono presenti entrambi i giocatori ma uno dei due è `null`, l'elemento `s` è un array vuoto e `w` è `0` si tratta di un **no-show** del giocatore non `null` in contemporanea ad un bye delll'altro giocatore. Anche in questo caso ci sarà un bye nel turno successivo

```json
{
  "matches": [
    // no-show player 1 con bye del player 2
    {
      "r": 1,
      "m": 4,
      "p": [8, null],
      "s": [],
      "w": 0
    },
  ]
}
```



### Salvataggio iniziale matches

Solo alla prima generazione dei matches, nel relativo array è presente un elemento aggiuntivo (`child_match`) necessario per le successive operazioni di registrazione dei risultati.

L'elemento riporta l'indice del match in cui dovrà essere collocato il vincitore del match corrente: come *player 1* se il *match id`* corrente è dispari, come *player 2* se pari.

```json
{

  "matches": [
    {
      "r": 1,
      "m": 1,
      "p": [2, 3],
      "s": [],
      "w": null,
      "child_match": 65
    },
    {
      "r": 1,
      "m": 2,
      "p": [4, 5],
      "s": [],
      "w": null,
      "child_match": 65
    },
    
    ...
    
    {
      "r": 2,
      "m": 65,
      "p": [],
      "s": [],
      "w": null,
      "child_match": 97
    },

    ...
  ]
}
```

## Info giocatore

Informazioni sul giocatore selezionato

```json
{
  "id": 123,
  "slug": null,
  "nickname": "schiappettatheboss",
  "crYear": "2020",
  "foto": {
    "id": 251,
    "width": 1440,
    "height": 810,
    "mime": "image/jpeg",
    "size": 92916
  },
  "badge": {
    "id": 3,
    "badge": "Gold",
    "icona": "badge-gold"
  },
  "medaglie" : [
    {
      "torneo": "FIFA Masterclass",
      "data": "2021-03-02",
      "medaglia": {
        "nome": "Secondo classificato",
        "icona": "premi-secondo.svg"
      }
    },
    ...
  ]
}
```

* `id`: (num) id del giocatore
* `slug`: (str) slug della pagina di presentazione del giocatore (attualmente non utilizzato, può essere omesso)
* `nickname`: (str) nickname
* `crYear`: (num) anno iscrizione ad (da `utenti.cr_timestamp`)
* `foto`: [obj o null] oggetto file Symfony, stringa o `null` se immagine non presente. Nel caso sia una stringa, si tratta del percorso dell'immagine ed il parametro `viewer` presente in `brackets-config.js` viene ignorato
* `badge`: [obj o null] oggetto dell'eventuale badge conquistato (`null` se non presente):
  * `id`: (num) id badge (dalla tabella `badge`)
  * `badge`: (str) nome badge (`badge.badge`)
  * `icona`: (str) icona badge (`badge.icona`)
* `medaglie`: (array) array delle ultime 4 medaglie conseguite (array vuoto se nessuna medaglia è presente). Per ogni medaglia:
  * `torneo`: (str) Nome del torneo in cui è stata ottenuta la medaglia (`tornei.nome`)
  * `data`: [str data ISO] data di svolgimento del torneo (`tornei.data_inizio`)
  * `medaglia`:
    * `nome`: (str) nome medaglia (`tornei_medaglie.nome`)
    * `icona`: (str) icona medaglia (`tornei_medaglie.icona`)



## Info team

Informazioni sul team selezionato

```json
{
  "id": 123,
  "slug": null,
  "nickname": "schiappettatheboss",
  "crYear": "2020",
  "foto": {
    "id": 251,
    "width": 1440,
    "height": 810,
    "mime": "image/jpeg",
    "size": 92916
  },
  "badge": {
    "id": 3,
    "badge": "Gold",
    "icona": "badge-gold"
  },
  "medaglie" : [
    {
      "torneo": "FIFA Masterclass",
      "data": "2021-03-02",
      "medaglia": {
        "nome": "Secondo classificato",
        "icona": "premi-secondo.svg"
      }
    },
    ...
  ]
}
```

* `id`: (num) id del giocatore
* `slug`: (str) slug della pagina di presentazione del giocatore (attualmente non utilizzato, può essere omesso)
* `nickname`: (str) nickname
* `crYear`: (num) anno iscrizione ad (da `utenti.cr_timestamp`)
* `foto`: [obj o null] oggetto file Symfony, stringa o `null` se immagine non presente. Nel caso sia una stringa, si tratta del percorso dell'immagine ed il parametro `viewer` presente in `brackets-config.js` viene ignorato
* `badge`: [obj o null] oggetto dell'eventuale badge conquistato (`null` se non presente):
  * `id`: (num) id badge (dalla tabella `badge`)
  * `badge`: (str) nome badge (`badge.badge`)
  * `icona`: (str) icona badge (`badge.icona`)
* `medaglie`: (array) array delle ultime 4 medaglie conseguite (array vuoto se nessuna medaglia è presente). Per ogni medaglia:
  * `torneo`: (str) Nome del torneo in cui è stata ottenuta la medaglia (`tornei.nome`)
  * `data`: [str data ISO] data di svolgimento del torneo (`tornei.data_inizio`)
  * `medaglia`:
    * `nome`: (str) nome medaglia (`tornei_medaglie.nome`)
    * `icona`: (str) icona medaglia (`tornei_medaglie.icona`)
