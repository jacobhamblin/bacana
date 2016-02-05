require('../sass/main.scss');
import demosJson from './demos.json';
import b1 from './b1.js';
import b2 from './b2.js';
import b3 from './b3.js';
import FastClick from './vendor/fastclick.min.js';
import THREE from 'three';

const demosCode = new Object;
demosCode.b1 = b1;
demosCode.b2 = b2;
demosCode.b3 = b3;

let bannerCounter = 0;
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

function hasClass(el, className) {
  var classes = el.className.split(' ');
  var existingIndex = classes.indexOf(className);

  if (existingIndex >= 0)
  return true;
  else
  return false;
}

(function prepareDemos() {
  const demos = demosJson.demos;

  let renderer = initThreeRenderer();
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
      demosCode['b' + (num + 1).toString()].init(divFullscreen, renderer);
    })
    previewContainer.appendChild(preview);
    previewContainer.appendChild(prevOverlay);
    previewContainer.appendChild(prevOverlay1);
    document.querySelectorAll('.previews-container')[0].appendChild(previewContainer);
  }
})();

function initThreeRenderer() {
  let renderer = new THREE.WebGLRenderer();

  return renderer;
};

document.querySelectorAll('div.fullscreen div.close-container')[0]
  .addEventListener('click', function () {
    closeDemo(document.querySelectorAll('div.fullscreen')[0]);
  });

window.addEventListener('keydown', function (e) {
  const divFullscreen = document.querySelectorAll('div.fullscreen')[0];
  if (hasClass(divFullscreen, "active") && e.keyCode === 27) {
    closeDemo(divFullscreen);
  }
});

function closeDemo(demo) {
  toggleClass(demo, "active");
  setTimeout(function () {
    demo.removeChild(document.querySelectorAll('canvas')[0]);
  }, 100);
};

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

document.querySelectorAll('div.box')[0].addEventListener('click', function (e) {
  bannerCounter++;
  toggleClass(document.body, "two");
  toggleClass(document.body, "one");
  toggleClass(document.querySelectorAll('div.previews-container')[0], "two");
  toggleClass(document.querySelectorAll('div.previews-container')[0], "one");
  toggleClass(e.target, "two");
  toggleClass(e.target, "one");
})
