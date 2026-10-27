/* =========================================================
   Dampak — Propuesta 06
   Interacción: tema, menú, avance de lectura, vista previa
   giratoria y validación del formulario.
   Sin dependencias externas.
   ========================================================= */

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Tema claro / oscuro ------------------------------------ */

  const root = document.documentElement;
  const themeToggle = $('[data-theme-toggle]');
  const themeLabel = $('[data-theme-label]');
  const themeMeta = $('[data-theme-color]');
  const THEME_KEY = 'dampak-tema-propuesta-06';
  const DARK_COLOR = '#100e11';
  const LIGHT_COLOR = '#f6f3ed';

  const currentTheme = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
    if (themeLabel) themeLabel.textContent = theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro';
    if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? LIGHT_COLOR : DARK_COLOR);
  };

  applyTheme(currentTheme());

  themeToggle?.addEventListener('click', () => {
    const next = currentTheme() === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  /* --- Menú móvil --------------------------------------------- */

  const header = $('[data-header]');
  const menuToggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  const progress = $('[data-progress]');

  const setMenu = (open, restoreFocus = false) => {
    if (!menuToggle || !menu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
    else if (restoreFocus) menuToggle.focus({ preventScroll: true });
  };

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true', true);
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    const target = link.getAttribute('href')?.startsWith('#') ? $(link.getAttribute('href')) : null;
    setMenu(false);
    const heading = target?.querySelector('h1, h2') || target;
    if (heading) window.requestAnimationFrame(() => heading.focus({ preventScroll: true }));
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu && !menu.hidden) setMenu(false, true);
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 960 && menu && !menu.hidden) setMenu(false); });

  /* --- Avance de lectura -------------------------------------- */

  const teamProcess = $('[data-team-process]');
  const teamSteps = $$('[data-team-step]');
  const teamTrack = $('.team-track', teamProcess || document);
  const teamFill = $('[data-team-fill]');
  const teamMarker = $('[data-team-marker]');

  const updateTeamProcess = () => {
    if (!teamProcess || !teamSteps.length) return;
    const rect = teamProcess.getBoundingClientRect();
    const start = window.innerHeight * 0.86;
    const end = window.innerHeight * 0.58;
    const span = Math.max(1, rect.height + start - end);
    const value = Math.min(1, Math.max(0, (start - rect.top) / span));
    const active = Math.min(teamSteps.length - 1, Math.max(0, Math.floor(value * teamSteps.length)));

    teamSteps.forEach((step, index) => {
      step.classList.toggle('is-active', index === active);
      step.classList.toggle('is-done', index < active);
      if (index === active) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });

    if (reduceMotion || !teamTrack) return;
    const vertical = window.matchMedia('(max-width: 960px)').matches;
    const distance = vertical ? teamTrack.clientHeight : teamTrack.clientWidth;
    if (teamFill) teamFill.style.transform = vertical ? `scaleY(${value})` : `scaleX(${value})`;
    if (teamMarker) {
      teamMarker.style.transform = vertical
        ? `translate3d(0, ${distance * value}px, 0) translate(-50%, -50%)`
        : `translate3d(${distance * value}px, 0, 0) translate(-50%, -50%)`;
    }
  };

  const updateScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    if (progress) progress.style.transform = `scaleX(${value})`;
    header?.classList.toggle('is-scrolled', window.scrollY > 20);
    updateTeamProcess();
  };
  let scrollQueued = false;
  const onScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(() => { updateScroll(); scrollQueued = false; });
  };
  updateScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', updateScroll);

  /* --- Aparición al hacer scroll ------------------------------ */

  const reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((element) => observer.observe(element));
  }

  /* --- Vista previa que se renueva sola ----------------------- */

  const ROTATE_MS = 4200;
  const TICK_MS = 100;

  const rows = $$('.index-row');
  const previewImage = $('[data-preview-image]');
  const previewType = $('[data-preview-type]');
  const previewName = $('[data-preview-name]');
  const previewDomain = $('[data-preview-domain]');
  const previewBar = $('[data-preview-progress]');
  const previewList = $('[data-preview-list]');
  const previewBox = $('.index-preview');

  if (rows.length && previewImage) {
    let selected = 0;
    let elapsed = 0;
    let timer = null;
    let onList = false;
    let onScreen = true;
    let swapToken = 0;

    /* Precarga: las imágenes ya están cuando hay que cambiar. */
    rows.forEach((row) => {
      const loader = new Image();
      loader.src = row.dataset.image;
    });

    const paint = (row) => {
      if (!row) return;
      const token = ++swapToken;
      previewImage.classList.add('is-fading');
      window.setTimeout(() => {
        if (token !== swapToken) return;
        previewImage.src = row.dataset.image;
        previewImage.alt = row.dataset.alt || `Vista del sitio ${row.dataset.name}`;
        previewImage.classList.remove('is-fading');
      }, 180);
      if (previewType) previewType.textContent = row.dataset.type;
      if (previewName) previewName.textContent = row.dataset.name;
      if (previewDomain) previewDomain.textContent = row.dataset.domain || '';
    };

    const select = (index) => {
      selected = index;
      rows.forEach((row, i) => {
        const isCurrent = i === index;
        row.classList.toggle('is-active', isCurrent);
        row.setAttribute('aria-pressed', String(isCurrent));
      });
    };

    const tick = () => {
      if (onList || !onScreen || document.hidden) return;
      elapsed += TICK_MS;
      if (previewBar) previewBar.style.transform = `scaleX(${Math.min(elapsed / ROTATE_MS, 1)})`;
      if (elapsed >= ROTATE_MS) {
        elapsed = 0;
        const next = (selected + 1) % rows.length;
        select(next);
        paint(rows[next]);
      }
    };

    const start = () => {
      if (reduceMotion) return;
      window.clearInterval(timer);
      timer = window.setInterval(tick, TICK_MS);
    };

    rows.forEach((row, index) => {
      row.addEventListener('click', () => {
        select(index);
        paint(row);
        elapsed = 0;
        if (previewBar) previewBar.style.transform = 'scaleX(0)';
      });
      row.addEventListener('mouseenter', () => { onList = true; paint(row); });
      row.addEventListener('focus', () => { onList = true; paint(row); });
    });

    const restore = () => {
      onList = false;
      paint(rows[selected]);
    };
    previewList?.addEventListener('mouseleave', restore);
    previewList?.addEventListener('focusout', (event) => {
      if (!previewList.contains(event.relatedTarget)) restore();
    });

    if ('IntersectionObserver' in window && previewBox) {
      const seen = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { onScreen = entry.isIntersecting; });
      }, { threshold: 0.1 });
      seen.observe(previewBox);
    }

    if (!reduceMotion) {
      start();
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) window.clearInterval(timer);
        else start();
      });
    }
  }

  /* --- Testimonios: slider con avance automático ---------------- */

  const voiceSlider = $('[data-voices]');
  const voices = $$('[data-voice]');
  const voicePrev = $('[data-voice-prev]');
  const voiceNext = $('[data-voice-next]');
  const voiceToggle = $('[data-voice-toggle]');
  const voiceCurrent = $('[data-voice-current]');
  const voiceSteps = $$('.voice-steps i');
  const voiceProgress = $('[data-voice-progress]');
  const voiceWindow = $('.voice-window');
  const VOICE_MS = 7000;
  let voiceIndex = 0;
  let voiceElapsed = 0;
  let voiceLast = 0;
  let voiceFrame = null;
  let voiceHovered = false;
  let voiceFocused = false;
  let voiceInView = false;
  let voicePaused = false;
  let voiceLeaveTimer = null;

  const syncVoiceLive = () => {
    if (voiceWindow) voiceWindow.setAttribute('aria-live', (voicePaused || voiceFocused) ? 'polite' : 'off');
  };

  const canAutoPlay = () => !reduceMotion && !voicePaused && voiceInView && !document.hidden && !voiceHovered && !voiceFocused && voices.length > 1;

  const paintVoiceProgress = () => {
    if (voiceProgress) voiceProgress.style.transform = `scaleX(${Math.min(voiceElapsed / VOICE_MS, 1)})`;
  };

  const showVoice = (index, direction = 1, animate = true) => {
    if (!voices.length) return;
    const next = (index + voices.length) % voices.length;
    const previous = voices[voiceIndex];
    voiceIndex = next;
    if (voiceSlider) voiceSlider.dataset.direction = direction < 0 ? 'prev' : 'next';

    voices.forEach((voice, i) => {
      const active = i === voiceIndex;
      voice.classList.remove('is-leaving');
      if (active) {
        voice.classList.remove('is-active');
        void voice.offsetWidth;
        voice.classList.add('is-active');
        voice.setAttribute('aria-hidden', 'false');
      } else {
        voice.classList.remove('is-active');
        voice.setAttribute('aria-hidden', 'true');
      }
    });

    if (animate && previous && previous !== voices[voiceIndex]) {
      previous.classList.add('is-leaving');
      window.clearTimeout(voiceLeaveTimer);
      voiceLeaveTimer = window.setTimeout(() => previous.classList.remove('is-leaving'), 380);
    }

    voiceSteps.forEach((step, i) => step.classList.toggle('is-active', i === voiceIndex));
    if (voiceCurrent) voiceCurrent.textContent = String(voiceIndex + 1).padStart(2, '0');
    voiceElapsed = 0;
    paintVoiceProgress();
  };

  const stopVoiceAuto = () => {
    if (voiceFrame) window.cancelAnimationFrame(voiceFrame);
    voiceFrame = null;
    voiceLast = 0;
  };

  const voiceLoop = (now) => {
    if (!canAutoPlay()) {
      voiceFrame = null;
      voiceLast = 0;
      return;
    }
    if (!voiceLast) voiceLast = now;
    voiceElapsed += now - voiceLast;
    voiceLast = now;
    paintVoiceProgress();
    if (voiceElapsed >= VOICE_MS) showVoice(voiceIndex + 1, 1);
    voiceFrame = window.requestAnimationFrame(voiceLoop);
  };

  const startVoiceAuto = () => {
    if (!canAutoPlay() || voiceFrame) return;
    voiceLast = 0;
    voiceFrame = window.requestAnimationFrame(voiceLoop);
  };

  const setVoicePaused = (paused) => {
    voicePaused = paused;
    if (!voiceToggle) return;
    voiceToggle.setAttribute('aria-pressed', String(paused));
    voiceToggle.setAttribute('aria-label', paused ? 'Reanudar cambio automático' : 'Pausar cambio automático');
    if (paused) stopVoiceAuto();
    else startVoiceAuto();
    syncVoiceLive();
  };

  if (voiceToggle && reduceMotion) voiceToggle.hidden = true;
  voiceToggle?.addEventListener('click', () => setVoicePaused(!voicePaused));
  voicePrev?.addEventListener('click', () => showVoice(voiceIndex - 1, -1));
  voiceNext?.addEventListener('click', () => showVoice(voiceIndex + 1, 1));

  voiceSlider?.addEventListener('mouseenter', () => { voiceHovered = true; stopVoiceAuto(); });
  voiceSlider?.addEventListener('mouseleave', () => { voiceHovered = false; startVoiceAuto(); });
  voiceSlider?.addEventListener('focusin', () => { voiceFocused = true; stopVoiceAuto(); syncVoiceLive(); });
  voiceSlider?.addEventListener('focusout', (event) => {
    if (!voiceSlider.contains(event.relatedTarget)) {
      voiceFocused = false;
      startVoiceAuto();
      syncVoiceLive();
    }
  });

  if ('IntersectionObserver' in window && voiceSlider) {
    const voiceSeen = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        voiceInView = entry.isIntersecting;
        if (voiceInView) startVoiceAuto();
        else stopVoiceAuto();
      });
    }, { threshold: 0.18 });
    voiceSeen.observe(voiceSlider);
  } else {
    voiceInView = true;
    startVoiceAuto();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopVoiceAuto();
    else startVoiceAuto();
  });

  showVoice(0, 1, false);
  paintVoiceProgress();

  /* --- Formulario --------------------------------------------- */

  const form = $('[data-form]');
  const status = $('[data-form-status]');

  if (form) {
    const fields = {
      nombre: $('#p6-nombre'),
      email: $('#p6-email'),
      mensaje: $('#p6-mensaje'),
      datos: $('#p6-datos')
    };
    const errors = {
      nombre: $('#p6-nombre-error'),
      email: $('#p6-email-error'),
      mensaje: $('#p6-mensaje-error'),
      datos: $('#p6-datos-error')
    };

    const setError = (key, message) => {
      const field = fields[key];
      const box = errors[key];
      if (!field || !box) return;
      box.textContent = message;
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    };

    const validate = () => {
      let firstInvalid = null;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      const name = (fields.nombre?.value || '').trim();
      const email = (fields.email?.value || '').trim();
      const message = (fields.mensaje?.value || '').trim();

      if (name.length < 2) {
        setError('nombre', 'Escribe tu nombre.');
        firstInvalid ||= fields.nombre;
      } else setError('nombre', '');

      if (!emailPattern.test(email)) {
        setError('email', 'Revisa el correo: parece incompleto.');
        firstInvalid ||= fields.email;
      } else setError('email', '');

      if (message.length < 10) {
        setError('mensaje', 'Cuéntanos un poco más (mínimo 10 caracteres).');
        firstInvalid ||= fields.mensaje;
      } else setError('mensaje', '');

      if (!fields.datos?.checked) {
        setError('datos', 'Necesitamos tu autorización para tratar tus datos.');
        firstInvalid ||= fields.datos;
      } else setError('datos', '');

      return firstInvalid;
    };

    Object.entries(fields).forEach(([key, field]) => {
      field?.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') setError(key, '');
      });
      field?.addEventListener('change', () => {
        if (field.getAttribute('aria-invalid') === 'true') setError(key, '');
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const firstInvalid = validate();
      if (firstInvalid) {
        firstInvalid.focus();
        if (status) {
          status.textContent = 'Revisa los campos marcados antes de continuar.';
          status.className = 'form-status is-error';
        }
        return;
      }
      if (status) {
        status.textContent = 'Demostración local: el mensaje no se envió. En la versión final, este formulario se conecta con el canal de contacto de Dampak.';
        status.className = 'form-status is-success';
      }
    });
  }
})();
