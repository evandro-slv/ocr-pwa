const worker = Tesseract.createWorker({ logger: m => console.log(m) });

const loadAll = () => {
  document.querySelector('.loading-bar').style.display = 'block';
  document.querySelectorAll('.content').forEach(e => {
    e.style.display = 'none';
  });
  document.querySelector('.preview').style.display = 'none';
  document.querySelector('.placeholder').style.display = 'block';
};

const load = () => {
  document.querySelector('.loading-bar').style.display = 'block';

  document.querySelector('.preview').style.display = 'block';
  document.querySelector('.placeholder').style.display = 'none';
};

const selectText = () => {
  const range = document.createRange();
  range.selectNode(document.getElementById('result'));
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
};

const finishLoad = () => {
  document.querySelector('.loading-bar').style.display = 'none';
  document.querySelectorAll('.content').forEach(e => {
    e.style.display = 'block';
  });

  selectText();
};

const recognize = async (worker) => {
  let { data: { text } } = await worker.recognize(document.querySelector('.preview'));

  text = text.replace(/‘/g, "'");

  document.querySelector('#result').dataset.original = text;

  if(document.querySelector('#remove-spaces').checked) {
    text = text.split(' ').join('');
  }

  document.querySelector('#result').innerHTML = text;

  finishLoad();
};

loadAll();

(async () => {
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  finishLoad();

  window.addEventListener('paste', (event) => {
    const items = event.clipboardData.items;
    console.log(JSON.stringify(items));
    const blob = items[ 0 ].getAsFile();
    const reader = new FileReader();

    reader.onload = function(event){
      document.querySelector('.preview').src = event.target.result;

      (async () => {
        load();
        await recognize();
      })();
    };

    reader.readAsDataURL(blob);
  });

  document.querySelector('#upload-file').addEventListener('change', (e) => {
    load();

    const files = e.target.files;
    const reader = new FileReader();

    reader.onload = async (event) => {
      document.querySelector('.preview').src = event.target.result;
      await recognize();
    };

    reader.readAsDataURL(files[0]);
  });

})();

document.querySelector('#remove-spaces').addEventListener('change', () => {
  if(document.querySelector('#remove-spaces').checked) {
    document.querySelector('#result').innerHTML = document.querySelector('#result').innerHTML.split(' ').join('');
  } else {
    document.querySelector('#result').innerHTML = document.querySelector('#result').dataset.original;
  }

  selectText();
}, false);

// PWA Config
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
