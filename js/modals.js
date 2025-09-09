export function openModal(selector) {
  const modal = document.querySelector(selector);
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

export function closeModal(selector) {
  const modal = document.querySelector(selector);
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

export function bindModalCloseButtons() {
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close')));
  });
}

