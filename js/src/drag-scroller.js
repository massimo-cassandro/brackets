// funzione per il trascinamento del riquadro
// https://htmldom.dev/drag-to-scroll/

// opzione alternativa: https://htmldom.dev/create-a-custom-scrollbar/

export default function (container) {

  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    container.scrollTop = pos.top - dy;
    container.scrollLeft = pos.left - dx;
  };

  const mouseUpHandler = function () {
    container.removeEventListener('mousemove', mouseMoveHandler);
    container.removeEventListener('mouseup', mouseUpHandler);

    container.style.cursor = 'grab';
    container.style.removeProperty('user-select');
  };

  const mouseDownHandler = function (e) {
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
    pos = {
      // The current scroll
      left: container.scrollLeft,
      top: container.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    };

    container.addEventListener('mousemove', mouseMoveHandler);
    container.addEventListener('mouseup', mouseUpHandler);
  };

  container.addEventListener('mousedown', mouseDownHandler);
}
