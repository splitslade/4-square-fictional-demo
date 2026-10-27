'use strict';
const $ = id => document.getElementById(id);
const fieldNames = ['incident_number', 'branch', 'incident_title', 'incident_date', 'summary', 'takeaway'];
let state = null;
let fits = true;
let fitFrame = 0;

function element(tag, text, className) {
 const node = document.createElement(tag);
 if (text !== undefined) node.textContent = text;
 if (className) node.className = className;
 return node;
}

function setStatus(message) { $('status').textContent = message; }
function invalidate(message) {
 $('confirm').checked = false;
 $('omissionsConfirmed').checked = false;
 $('readyState').hidden = true;
 if (message) setStatus(message);
}
function omissions() {
 if (!state) return [];
 return [...state.causes, ...state.actions].filter(row => !row.included);
}
function complete() {
 return state && fieldNames.every(name => $(name).value.trim()) &&
  ['causes', 'actions'].every(group => state[group].filter(row => row.included).every(row => row.text.trim()));
}
function updateGate() {
 $('generateBtn').disabled = !complete() || !fits || !$('confirm').checked ||
  (omissions().length > 0 && !$('omissionsConfirmed').checked);
}

function updateOmissions() {
 const omitted = omissions();
 $('omissionPanel').hidden = omitted.length === 0;
 $('omissionSummary').textContent = `${omitted.length} original source item${omitted.length === 1 ? '' : 's'} excluded`;
 $('omissionList').replaceChildren(...omitted.map(row => element('li', `${row.label} · ${row.ref}: ${row.original}`)));
 updateGate();
}

function renderRows(group, container) {
 const rows = state[group].map((row, i) => {
  const wrapper = element('div', undefined, 'review-row');
  const label = element('label', undefined, 'row-label');
  const check = element('input'); check.type = 'checkbox'; check.checked = row.included;
  check.id = `include-${group}-${i}`;
  check.setAttribute('aria-label', `Include ${row.label.toLowerCase()}`);
  label.append(check, document.createTextNode(`${row.label} · ${row.ref}`));
  const editor = element('textarea', undefined, 'field');
  editor.value = row.text; editor.rows = 2; editor.maxLength = 400;
  editor.id = `edit-${group}-${i}`;
  editor.setAttribute('aria-label', `Wording for ${row.label.toLowerCase()}`);
  const quote = element('blockquote', `Original: “${row.original}”`);
  editor.setAttribute('aria-describedby', `original-${group}-${i}`);
  quote.id = `original-${group}-${i}`;
  check.addEventListener('change', () => {
   row.included = check.checked; editor.disabled = !row.included;
   invalidate('Source selection changed. Review omissions and confirm again.');
   updateOmissions(); renderPreview();
  });
  editor.addEventListener('input', () => {
   row.text = editor.value;
   invalidate('Wording changed. Review the original source and confirm again.');
   renderPreview();
  });
  wrapper.append(label, editor, quote);
  return wrapper;
 });
 $(container).replaceChildren(...rows);
}

function loadFixture() {
 const fixture = DEMO_FIXTURES[$('caseSelect').value];
 const source = ['FICTIONAL DEMONSTRATION — NOT A COMPANY RECORD', fixture.name];
 const refs = {};
 function addLine(label, text) {
  const ref = `L${String(source.length + 1).padStart(2, '0')}`;
  source.push(`${ref} | ${label}: ${text}`);
  return ref;
 }
 for (const name of fieldNames.filter(name => name !== 'takeaway')) refs[name] = addLine(name.replaceAll('_', ' '), fixture.fields[name]);
 state = { key: $('caseSelect').value, photos: [true, true, false, false] };
 for (const group of ['causes', 'actions']) {
  state[group] = fixture[group].map((text, i) => {
   const label = `${group === 'causes' ? 'Factor' : 'Action'} ${i + 1}`;
   return { label, original: text, text, included: true, ref: addLine(label, text) };
  });
 }
 refs.takeaway = addLine('Fictional report learning point', fixture.fields.takeaway);
 $('reviewFields').disabled = false;
 $('resetBtn').disabled = false;
 $('confirm').disabled = false;
 for (const name of fieldNames) {
  $(name).value = fixture.fields[name];
  $(`ref-${name}`).textContent = `${refs[name]} · Original: ${fixture.fields[name]}`;
 }
 $('sourceReport').textContent = source.join('\n');
 $('sourcePanel').hidden = false;
 $('fileLine').textContent = `${fixture.fields.incident_number} loaded · simulated extraction · 2 original factors / 3 original actions`;
 renderRows('causes', 'causeRows'); renderRows('actions', 'actionRows');
 renderPhotoOptions();
 invalidate('Fictional report loaded. Review wording, source items and illustrations before confirming.');
 updateOmissions(); renderPreview();
}

// Original neutral diagrams drawn with SVG primitives; no external assets or images.
function illustration(index, title) {
 const ns = 'http://www.w3.org/2000/svg';
 const svg = document.createElementNS(ns, 'svg');
 svg.setAttribute('viewBox', '0 0 240 120'); svg.setAttribute('role', 'img');
 svg.setAttribute('aria-label', `Generic illustration: ${title}`);
 const desc = document.createElementNS(ns, 'title'); desc.textContent = `Generic illustration: ${title}`; svg.append(desc);
 const shape = (tag, attrs) => {
  const node = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  svg.append(node); return node;
 };
 shape('rect', { x: 0, y: 0, width: 240, height: 120, fill: '#edf2f5' });
 shape('path', { d: 'M15 105H225', stroke: '#b5c2cc', 'stroke-width': 2 });
 if (index === 0 && state.key === 'equipment') {
  shape('rect', { x: 57, y: 40, width: 113, height: 46, rx: 3, fill: '#8596a3' });
  shape('path', { d: 'M170 42L190 20H213M68 86V93M157 86V93', fill: 'none', stroke: '#374956', 'stroke-width': 7 });
  for (const x of [76, 151]) shape('circle', { cx: x, cy: 94, r: 11, fill: '#374956' });
  shape('path', { d: 'M89 48H130V72H89Z', fill: '#dce5eb', stroke: '#516575', 'stroke-width': 3 });
 } else if (index === 0) {
  shape('path', { d: 'M53 105L93 18H150L190 105Z', fill: '#d6e0e8' });
  shape('path', { d: 'M55 104L94 20M189 104L149 20', stroke: '#b5842d', 'stroke-width': 5, 'stroke-dasharray': '9 5' });
  shape('path', { d: 'M75 75Q125 35 172 72', fill: 'none', stroke: '#516575', 'stroke-width': 6 });
 } else if (index === 1) {
  shape('path', { d: 'M65 104V35M178 104V35', stroke: '#485c6b', 'stroke-width': 9 });
  shape('rect', { x: 45, y: 43, width: 153, height: 30, fill: '#f6d48a', stroke: '#a17e3d', 'stroke-width': 2 });
  for (const x of [60, 100, 140, 180]) shape('path', { d: `M${x} 45l-19 26`, stroke: '#7a632e', 'stroke-width': 10 });
 } else if (index === 2) {
  shape('path', { d: 'M65 25V85H153', fill: 'none', stroke: '#718a9b', 'stroke-width': 17 });
  for (const [cx, cy] of [[65, 47], [93, 85]]) shape('circle', { cx, cy, r: 5, fill: '#eaf0f5', stroke: '#364d60', 'stroke-width': 2 });
  shape('circle', { cx: 164, cy: 45, r: 27, fill: '#fff', stroke: '#526d84', 'stroke-width': 4 });
  shape('path', { d: 'M151 44l9 10 18-22', fill: 'none', stroke: '#526d84', 'stroke-width': 5 });
 } else {
  shape('rect', { x: 72, y: 14, width: 95, height: 91, rx: 5, fill: 'white', stroke: '#668096', 'stroke-width': 3 });
  shape('rect', { x: 97, y: 8, width: 44, height: 14, rx: 4, fill: '#668096' });
  for (const y of [39, 63, 87]) {
   shape('path', { d: `M85 ${y}l5 5 9-11M110 ${y}h43`, fill: 'none', stroke: '#668096', 'stroke-width': 3 });
  }
 }
 return svg;
}

function renderPhotoOptions() {
 $('photoEmpty').hidden = true;
 const names = DEMO_FIXTURES[state.key].photos;
 $('photoGrid').replaceChildren(...names.map((name, i) => {
  const tile = element('div', undefined, 'photo-option');
  const label = element('label');
  const check = element('input'); check.type = 'checkbox'; check.checked = state.photos[i];
  check.id = `photo-${i}`; check.setAttribute('aria-label', `Include illustration ${i + 1}: ${name}`);
  check.addEventListener('change', () => {
   state.photos[i] = check.checked;
   invalidate('Illustration selection changed. Review and confirm again.'); renderPreview();
  });
  label.append(check, element('span', `${name} · illustration`));
  tile.append(illustration(i, name), label); return tile;
 }));
}
function bullets(id, group) {
 const selected = state[group].filter(row => row.included);
 $(id).replaceChildren(...(selected.length ? selected.map(row => element('li', row.text.trim() || '[Wording required]')) : [element('li', 'All original items intentionally excluded — review omissions.') ]));
}
function renderPreview() {
 if (state) {
  $('previewTitle').textContent = `IMS ${$('incident_number').value.trim()} – ${$('branch').value.trim()} ${$('incident_title').value.trim()}`;
  $('previewSummary').textContent = $('summary').value.trim() || '[Summary required]';
  $('previewTakeaway').textContent = `Take-aways: ${$('takeaway').value.trim() || '[Take-away required]'}`;
  bullets('previewCauses', 'causes'); bullets('previewActions', 'actions');
  const names = DEMO_FIXTURES[state.key].photos;
  const figures = state.photos.flatMap((selected, i) => {
   if (!selected) return [];
   const fig = element('figure'); fig.append(illustration(i, names[i]), element('figcaption', `${names[i]} · illustration`)); return [fig];
  });
  $('previewPhotos').replaceChildren(...(figures.length ? figures : [element('div', 'No illustrations selected', 'photo-placeholder')]));
 }
 updateGate();
 cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(fitSlide);
}

// Fit visible content within the original 16:9 geometry, then block finalization
// if edits cannot fit at the minimum size. Nothing is truncated or ellipsized.
function fitSlide() {
 const slide = $('slidePreview');
 const base = slide.clientWidth / 72;
 const regions = [...slide.querySelectorAll('.slide-body'), $('previewTitle'), $('previewTakeaway')];
 const overflow = () => regions.some(node => {
  const box = node === $('previewTakeaway') ? node.parentElement : node;
  if (node === $('previewTitle')) return node.scrollHeight > slide.querySelector('.slide-top').clientHeight - slide.clientWidth * .04 + 1 || node.scrollWidth > node.clientWidth + 1;
  return node.scrollHeight > box.clientHeight + 1 || node.scrollWidth > box.clientWidth + 1;
 });
 let scale = 1;
 slide.style.fontSize = `${base}px`;
 while (overflow() && scale > .72) {
  scale = Math.max(.72, scale - .04);
  slide.style.fontSize = `${base * scale}px`;
 }
 fits = !overflow();
 $('fitWarning').hidden = fits;
 if (!fits) {
  $('readyState').hidden = true;
  $('confirm').checked = false;
 }
 updateGate();
}

for (const name of fieldNames) $(name).addEventListener('input', () => {
 invalidate('Content changed. Verify the source and confirm again.'); renderPreview();
});
$('loadDemoBtn').addEventListener('click', loadFixture);
$('resetBtn').addEventListener('click', () => {
 if (state) $('caseSelect').value = state.key;
 loadFixture(); setStatus('Original fictional source and illustration selections restored. Review again.');
});
$('caseSelect').addEventListener('change', () => {
 // Choosing a menu option alone never changes the loaded report.
 setStatus('Click Load fictional investigation to replace the current report.');
});
$('confirm').addEventListener('change', updateGate);
$('omissionsConfirmed').addEventListener('change', updateGate);
$('generateBtn').addEventListener('click', () => {
 updateGate(); if ($('generateBtn').disabled) return;
 $('readyState').hidden = false;
 setStatus('Reviewed browser preview ready. Output is simulated; no file or PowerPoint was generated.');
 $('slidePreview').setAttribute('tabindex', '-1');
 $('slidePreview').focus({ preventScroll: true });
});
new ResizeObserver(() => { cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(fitSlide); }).observe($('slidePreview'));
renderPreview();
