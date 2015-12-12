require('../sass/main.scss');
import demosJson from './demos.json';
import b1 from './b1.js';

const demosCode = new Object;
demosCode.b1 = b1;

const demos = demosJson.demos;
for (var i =  0; i < demos.length; i++) {
  let demo = demos[i];
  let div = document.createElement('div');
  div.className = 'preview';
  div.style.backgroundImage = 'url(' + demo.preview + ')';
  let num = i;
  div.addEventListener('click', function (e) {
    event.preventDefault();
    // move css
    demosCode['b' + (num + 1).toString()].init();
  })
  document.querySelectorAll('.previews-container')[0].appendChild(div);
}
