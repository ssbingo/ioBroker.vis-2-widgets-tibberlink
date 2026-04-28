import css from './style.css?inline';

if (typeof document !== 'undefined' && !document.getElementById('__vis2-tibber-css')) {
    const el = document.createElement('style');
    el.id = '__vis2-tibber-css';
    el.textContent = css;
    document.head.appendChild(el);
}
