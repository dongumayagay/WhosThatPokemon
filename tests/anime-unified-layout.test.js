import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
const read = path => existsSync(path) ? readFileSync(path,'utf8') : '';
const theme=read('src/lib/styles/anime-unified.css');
const control=read('src/lib/components/Control.svelte');
const html=read('src/app.html');
const layout=read('src/routes/+layout.svelte');
const grid=read('static/vendor/bootstrap-grid.min.css');
test('Bootstrap grid is included locally',()=>{
 assert.match(grid,/Bootstrap Grid v5.3.3/);
 assert.match(html,/vendor\/bootstrap-grid.min.css/);
 assert.match(control,/class="row [^"]*wtp-answer-row"/);
 assert.match(control,/class="col-6 col-md-3 wtp-answer-cell"/);
});
test('one shared anime background reaches beyond the TV frame',()=>{
 assert.match(layout,/anime-unified.css/);
 assert.match(theme,/classic-1998-rays.svg/);
 assert.match(theme,/\.site-shell::before/);
 assert.match(theme,/\.anime-stage[^{]*\{[^}]*overflow: visible;/s);
 assert.match(theme,/\.anime-burst[^{]*\{[^}]*display: none;/s);
});
test('buttons and menus use one visual theme',()=>{
 assert.match(theme,/--wtp-gold:/);
 assert.match(theme,/--wtp-blue:/);
 assert.match(theme,/\.answer-option\.anime-option/);
 assert.match(theme,/\.wtp-menu-panel/);
 assert.match(theme,/prefers-reduced-motion/);
 assert.match(theme,/max-width: 400px/);
 assert.match(theme,/min-height: 52px/);
});