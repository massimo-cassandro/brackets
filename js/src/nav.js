export default function (outer_container, num_rounds) {

  outer_container.insertAdjacentHTML('beforeend',
    `<div class="brk-nav-outer">
      <div class="brk-nav-trigger" role="button" aria-label="Navigazione rounds" aria-controls="brk-nav-menu">
        ${'<span></span>'.repeat(3)}
      </div>
    </div>
    <nav id="brk-nav-menu" class="brk-nav-menu"></nav>`
  );

  let menu = outer_container.querySelector('.brk-nav-menu'),
    trigger = outer_container.querySelector('.brk-nav-trigger');

  for( let i = 1; i<= num_rounds; i++ ) {
    menu.insertAdjacentHTML('beforeend',
      `<button class="brk-nav-item" type="button" data-r="${i}" aria-label="Vai al round ${i}">Round ${i}</button>`
    );
  }

  trigger.addEventListener('click', () => {
    trigger.classList.toggle('open');
    menu.classList.toggle('show');
  }, false);


  menu.querySelectorAll('.brk-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      // primo match del round richiesto
      const match_to_show = outer_container
        .querySelector(`.brk-round-inner-wrapper[data-r="${item.dataset.r}"] .brk-match`);

      match_to_show.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});

      menu.classList.remove('show');
      trigger.classList.remove('open');
    }, false);
  });

  // clic outside
  document.body.addEventListener('click', e => {

    // il secondo e il terzo caso sono ridondanti ma prevengono eventuali sovrapposizioni
    if(!e.target.closest('.brk-nav-menu') &&
      e.target !== trigger &&
      !e.target.closest('.brk-nav-trigger') &&
      trigger.classList.contains('open')
    ) {
      trigger.click();
    }

  }, false);

  // esc key
  document.body.addEventListener('keydown', function(e) {
    if(e.key === 'Escape' && trigger.classList.contains('open')) {
      trigger.click();
    }
  }, true);

}
