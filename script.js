document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const visible = menu.style.display === 'flex';
      menu.style.display = visible ? 'none' : 'flex';
    });
  }

  const grid = document.getElementById('slotGrid');
  const select = document.getElementById('serviceSelect');
  let lastData = [];

  async function fetchSlots() {
    if (!window.API_URL) return;
    const svc = select?.value || '';
    const mins = (window.SVC_MINS && window.SVC_MINS[svc]) ? window.SVC_MINS[svc] : 30;
    try {
      const res = await fetch(window.API_URL + '?days=14&min=' + encodeURIComponent(mins), { cache: 'no-store' });
      const data = await res.json();
      lastData = Array.isArray(data.slots) ? data.slots : [];
      renderSlots();
    } catch (e) {
      console.warn('Slots fetch failed', e);
      if (grid) grid.innerHTML = `<p class="muted">Impossible de charger les créneaux pour l’instant.</p>`;
    }
  }

  function formatDate(d) {
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { weekday:'short', day:'2-digit', month:'short' });
  }
  function formatTime(d) {
    const dt = new Date(d);
    return dt.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
  }

  function renderSlots() {
    if (!grid) return;
    const service = select?.value || '';
    if (!service) {
      grid.innerHTML = `<p class="muted">Choisis d’abord une prestation pour afficher des créneaux adaptés à sa durée.</p>`;
      return;
    }
    const slots = lastData.slice(0, 48);
    if (!slots.length) {
      grid.innerHTML = `<p class="muted">Aucun créneau disponible pour le moment.</p>`;
      return;
    }
    grid.innerHTML = slots.map(s => {
      const qs = new URLSearchParams({
        slot: s.startISO,
        end: s.endISO,
        service
      }).toString();
      return `
      <article class="slot">
        <div class="time">${formatTime(s.startISO)} — ${formatTime(s.endISO)}</div>
        <div class="day">${formatDate(s.startISO)}</div>
        <div class="actions">
          <a class="btn small" href="reservation.html?${qs}">Réserver</a>
        </div>
      </article>`;
    }).join('');
  }

  if (select) select.addEventListener('change', fetchSlots);
});
