import '../sass/main.scss';
import demosJson from './demos.json';
import b1 from './b1.js';
import b2 from './b2.js';
import b3 from './b3.js';
import b4 from './b4.js';
// import b5 from './b5.js';
import FastClick from './vendor/fastclick.min.js';
import THREE from 'three';

const demosCode = new Object;
demosCode.b1 = b1;
demosCode.b2 = b2;
demosCode.b3 = b3;
demosCode.b4 = b4;
// demosCode.b5 = b5;

const interaction = new Object;
interaction.open = false;
interaction.activeDemo = null;

let bannerCounter = 0;
(function attachFastClick() {
  if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
      FastClick.attach(document.body);
    }, false);
  }
})

function checkURL() {
  var url = window.location.hash.match(/#\/b\d+/);
  if (url) {
    beginDemo(url[0].slice(2));
  } else {
    closeDemo(document.querySelector('div.fullscreen'));
  }
}

(function initialLoad() {
  window.renderer = initThreeRenderer();
  prepareDemos()
  checkURL();
}());

function beginDemo(demo) {
  let renderer = window.renderer;
  interaction.open = true;
  // move css
  const divFullscreen = document.querySelector('div.fullscreen');
  if (document.querySelector('canvas') && interaction.open) {
    divFullscreen.removeChild(document.querySelector('canvas'));
  }
  toggleClass(divFullscreen, "active");
  interaction.activeDemo = demosCode[demo]
    .init({container: divFullscreen, renderer});
}

window.addEventListener('popstate', e => {
  checkURL();
})

function toggleClass(el, className) {
  if (el.classList) {
    el.classList.toggle(className);
  } else {
    var classes = el.className.split(' ');
    var existingIndex = classes.indexOf(className);

    if (existingIndex >= 0) {
      classes.splice(existingIndex, 1);
    } else {
      classes.push(className);
    }

    el.className = classes.join(' ');
  }
}

function hasClass(el, className) {
  var present = false;
  el.className.split(' ').indexOf(className) > 0 ? present = true : present = false;
  return present;
}

function prepareDemos() {
  const demos = demosJson.demos;

  for (var i = 0; i < demos.length; i++) {
    let demo = demos[i];
    let previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    let preview = document.createElement('div');
    let title = document.createElement('div');
    let text = document.createElement('h6');
    let prevOverlay = document.createElement('div');
    let prevOverlay1 = document.createElement('div');
    prevOverlay.className = "preview-overlay";
    prevOverlay1.className = "preview-overlay";
    preview.className = 'preview';
    title.className = 'title';
    text.innerText = ("0" + (i + 1)).slice(-2);

    preview.style.backgroundImage = 'url(' + demo.preview + ')';
    let num = i;
    preview.addEventListener('click', function (e) {
      event.preventDefault();
      if (interaction.open) {
        window.location = "#/";
      } else {
        window.location = "#/" + "b" + (num + 1).toString();
      }
    })
    previewContainer.appendChild(preview);
    previewContainer.appendChild(preview);
    previewContainer.appendChild(prevOverlay);
    previewContainer.appendChild(prevOverlay1);
    title.appendChild(text);
    previewContainer.appendChild(title);
    document.querySelector('.previews-container').appendChild(previewContainer);
  }
};

function initThreeRenderer() {
  let renderer = new THREE.WebGLRenderer();

  return renderer;
};

document.querySelector('div.fullscreen div.close-container')
  .addEventListener('click', function () {
    closeDemo(document.querySelector('div.fullscreen'));
  });

window.addEventListener('keydown', function (e) {
  const divFullscreen = document.querySelector('div.fullscreen');
  if (hasClass(divFullscreen, "active") && e.keyCode === 27) {
    closeDemo(divFullscreen);
  }
});

function closeDemo(demoEl) {
  if (document.querySelector('canvas') && interaction.open) {
    toggleClass(demoEl, "active");
    document.body.style.cursor = "initial";
    let canvas = document.querySelector('canvas');
    interaction.open = false;

    interaction.activeDemo.destroy();
    setTimeout(function () {
      if (demoEl && interaction.open === false)
      demoEl.removeChild(canvas)
    }, 500);
    window.location = "#/";
  }
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
