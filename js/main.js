require('../sass/main.scss');
import demosJson from './demos.json';
import b1 from './b1.js';

const demosCode = new Object;
demosCode.b1 = b1;

const demos = demosJson.demos;
for (var i =  0; i < demos.length; i++) {
  let demo = demos[i];
  let previewContainer = document.createElement('div');
  previewContainer.className = 'preview-container';
  let preview = document.createElement('div');
  preview.className = 'preview';
  preview.style.backgroundImage = 'url(' + demo.preview + ')';
  let num = i;
  preview.addEventListener('click', function (e) {
    event.preventDefault();
    // move css
    demosCode['b' + (num + 1).toString()].init();
  })
  previewContainer.appendChild(preview);
  document.querySelectorAll('.previews-container')[0].appendChild(previewContainer);

}
