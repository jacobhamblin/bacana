require('../sass/main.scss');
import demosJson from './demos.json';
import b1 from './b1.js';
import b2 from './b2.js';
import FastClick from './vendor/fastclick.min.js';

const demosCode = new Object;
demosCode.b1 = b1;
demosCode.b2 = b2;

(function attachFastClick() {
  if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
    }, false);
  }
})

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
  let prevOverlay = document.createElement('div');
  let prevOverlay1 = document.createElement('div');
  prevOverlay.className = "preview-overlay";
  prevOverlay1.className = "preview-overlay";
  preview.className = 'preview';
  preview.style.backgroundImage = 'url(' + demo.preview + ')';
  let num = i;
  preview.addEventListener('click', function (e) {
    event.preventDefault();
    // move css
    const divFullscreen = document.querySelectorAll('div.fullscreen')[0];
    toggleClass(divFullscreen, "active");
    demosCode['b' + (num + 1).toString()].init(divFullscreen);
  })
  previewContainer.appendChild(preview);
  previewContainer.appendChild(prevOverlay);
  previewContainer.appendChild(prevOverlay1);
  document.querySelectorAll('.previews-container')[0].appendChild(previewContainer);
}


document.querySelectorAll('div.fullscreen div.close-container')[0]
  .addEventListener('click', function () {
    const divFullscreen = document.querySelectorAll('div.fullscreen')[0];
    toggleClass(divFullscreen, "active");
    setTimeout(function () {
      divFullscreen.removeChild(document.querySelectorAll('canvas')[0]);
    }, 500)
  })

const prevsNodeList = document.querySelectorAll('div.preview-container');
const prevsArray = Array.prototype.slice.call(prevsNodeList, 0);

prevsArray.forEach(p => {
  p.addEventListener('mouseenter', (e) => {
    toggleClass(e.target, "hovered");
  })
  p.addEventListener('mouseleave', (e) => {
    toggleClass(e.target, "hovered");
  })
});
