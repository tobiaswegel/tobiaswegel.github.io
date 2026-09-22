const header = document.querySelector('.header');
    const themeToggle = document.querySelector('.theme-toggle');
    const systemTheme = matchMedia('(prefers-color-scheme: dark)');
    let manualTheme = false;
    try { manualTheme = ['light', 'dark'].includes(localStorage.getItem('theme')); } catch (_) {}
    const applyTheme = (theme) => {
      document.documentElement.dataset.theme = theme;
      const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.title = label;
      document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#17212d' : '#ffffff';
    };
    applyTheme(document.documentElement.dataset.theme);
    themeToggle.addEventListener('click', () => {
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      manualTheme = true;
      applyTheme(theme);
      try { localStorage.setItem('theme', theme); } catch (_) {}
    });
    systemTheme.addEventListener('change', event => {
      if (!manualTheme) applyTheme(event.matches ? 'dark' : 'light');
    });
    const headerSlot = document.querySelector('.header-slot');
    let compactThreshold = 0;

    const updateHeader = () => {
      header.classList.toggle('is-compact', window.scrollY > compactThreshold);
    };

    const measureHeader = () => {
      header.classList.remove('is-compact');
      headerSlot.style.height = 'auto';
      headerSlot.style.height = `${header.offsetHeight}px`;
      compactThreshold = headerSlot.getBoundingClientRect().bottom + window.scrollY;
      updateHeader();
    };

    measureHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', measureHeader);
    window.addEventListener('pageshow', measureHeader);

    const paperToggles = document.querySelectorAll('.paper-toggle');
    paperToggles.forEach(button => {
      button.addEventListener('click', () => {
        const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
        paperToggles.forEach(toggle => {
          const isOpen = toggle === button && shouldOpen;
          toggle.setAttribute('aria-expanded', String(isOpen));
          document.getElementById(toggle.getAttribute('aria-controls')).hidden = !isOpen;
        });
      });
    });

    if (document.querySelector('.work-list')) {
    const publications = document.querySelectorAll('.work-list > li');
    const topicChips = document.querySelectorAll('.topic-chip');
    const selectedTopics = new Set();
    const filterStatus = document.querySelector('.filter-status');
    const researchHeading = document.getElementById('research-heading');
    const filterPublications = () => {
      let count = 0;
      publications.forEach(paper => {
        const topics = (paper.dataset.topics || '').split(' ');
        const matches = [...selectedTopics].every(topic => topics.includes(topic));
        paper.hidden = !matches;
        if (matches) count++;
        if (!matches) {
          const toggle = paper.querySelector('.paper-toggle');
          toggle.setAttribute('aria-expanded', 'false');
          document.getElementById(toggle.getAttribute('aria-controls')).hidden = true;
        }
      });
      topicChips.forEach(chip => {
        chip.setAttribute('aria-pressed', String(selectedTopics.has(chip.dataset.topic)));
      });
      filterStatus.textContent = count === 0
        ? 'No publications match all selected topics. Deselect a topic or show all.'
        : selectedTopics.size === 0
          ? `All ${count} publications`
          : `${count} ${count === 1 ? 'publication matches' : 'publications match'} ${selectedTopics.size > 1 ? 'all selected topics' : 'this topic'}`;
    };

    topicChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const topic = chip.dataset.topic;
        if (selectedTopics.has(topic)) selectedTopics.delete(topic);
        else selectedTopics.add(topic);
        filterPublications();
      });
    });

    document.querySelectorAll('a[data-topic]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        selectedTopics.clear();
        selectedTopics.add(link.dataset.topic);
        filterPublications();
        researchHeading.focus({ preventScroll: true });
        document.getElementById('research').scrollIntoView();
      });
    });

    document.querySelector('.clear-filter').addEventListener('click', () => {
      selectedTopics.clear();
      filterPublications();
    });
    document.querySelectorAll('nav a[href="#research"]').forEach(link => {
      link.addEventListener('click', () => {
        selectedTopics.clear();
        filterPublications();
      });
    });
    filterPublications();

    }

    document.querySelectorAll('.copy-bibtex').forEach(button => {
      let resetTimer;
      button.addEventListener('click', async () => {
        const citation = document.getElementById(button.dataset.citation);
        const status = document.querySelector('.copy-status');
        clearTimeout(resetTimer);
        let copied = false;
        // The modern API works on HTTPS/localhost. The selection fallback also
        // supports browsers viewing the website directly from a local file.
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(citation.value);
            copied = true;
          }
        } catch (_) {}
        if (!copied) {
          citation.hidden = false;
          citation.focus({ preventScroll: true });
          citation.select();
          try { copied = document.execCommand('copy'); } catch (_) {}
        }
        if (copied) {
          citation.hidden = true;
          button.focus({ preventScroll: true });
          button.textContent = 'Copied!';
          status.textContent = 'BibTeX citation copied to clipboard.';
        } else {
          button.textContent = 'Select & copy';
          status.textContent = 'Automatic copying is unavailable. The citation is selected below; press Command+C or Ctrl+C to copy.';
        }
        resetTimer = setTimeout(() => { button.textContent = 'BibTeX'; }, 2500);
      });
    });

    document.querySelectorAll('a[href]').forEach(link => {
      const url = new URL(link.href);

      if (
        ['http:', 'https:'].includes(url.protocol) &&
        url.origin !== window.location.origin
      ) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    });
