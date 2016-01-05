require('../sass/main.scss');
import demosJson from './demos.json';
import b1 from './b1.js';

const demosCode = new Object;
demosCode.b1 = b1;

function toggleClass(el, className) {
  if (el.classList) {
    el.classList.toggle(className);
  } else {
    var classes = el.className.split(' ');
    var existingIndex = classes.indexOf(className);

    if (existingIndex >= 0)
      classes.splice(existingIndex, 1);
    else
      classes.push(className);

    el.className = classes.join(' ');
  }
}

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
    toggleClass(document.querySelectorAll('div.fullscreen')[0], "active");
    demosCode['b' + (num + 1).toString()].init();
  })
  previewContainer.appendChild(preview);
  document.querySelectorAll('.previews-container')[0].appendChild(previewContainer);

}


document.querySelectorAll('div.fullscreen div.close-container')[0]
  .addEventListener('click', function () {
    toggleClass(document.querySelectorAll('div.fullscreen')[0], "active")
  })
