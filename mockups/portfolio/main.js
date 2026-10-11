const theme = document.documentElement.dataset.theme;
for (const link of document.querySelectorAll('[data-variant]')) {
  if (link.dataset.variant === theme) link.setAttribute('aria-current', 'page');
}
