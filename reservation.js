document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const start = params.get('slot');
  const end = params.get('end');
  const service = params.get('service');

  const slotField = document.getElementById('slotField');
  const svcSelect = document.getElementById('svcSelect');
  const box = document.getElementById('selectedSlot');

  if (service && svcSelect) {
    for (const o of svcSelect.options) {
      if (o.value && o.value.toLowerCase() === service.toLowerCase()) {
        svcSelect.value = o.value;
        break;
      }
    }
  }

  function fmtDate(d) {
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long' });
  }
  function fmtTime(d) {
    const dt = new Date(d);
    return dt.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
  }

  if (start && slotField) {
    slotField.value = start;
    if (box) {
      const d1 = new Date(start);
      const d2 = end ? new Date(end) : new Date(d1.getTime() + 30*60000);
      box.style.display = 'block';
      box.innerHTML = `Créneau sélectionné : <strong>${fmtDate(d1)}</strong> de <strong>${fmtTime(d1)}</strong> à <strong>${fmtTime(d2)}</strong>.`;
    }
  }

  const form = document.getElementById('bookForm');
  const msg = document.getElementById('bookMsg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = 'Envoi en cours…';

    const data = Object.fromEntries(new FormData(form).entries());
    data.depositConfirmed = document.getElementById('depositOk')?.checked ? 'yes' : 'no';

    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbz2DZPOlTVocach8SD6WhmrM0DaMrAbTrZGNzKU2n3JMGGeXm3sv4HRzowvCvjaZTve/exec", {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(data)
      });
      const out = await res.json();
      if (out?.status === 'ok') {
        msg.textContent = 'Réservation envoyée ✅. Tu recevras une confirmation par e-mail.';
        form.reset();
      } else {
        msg.textContent = 'Échec : ' + (out?.message || 'merci de réessayer.');
      }
    } catch (err) {
      msg.textContent = 'Erreur réseau. Réessaie dans un instant.';
    }
  });
});