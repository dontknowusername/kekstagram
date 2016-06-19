'use strict';
var IMAGE_SIZE = 182;
var formFilters = document.querySelector('.filters');
formFilters.classList.add('hidden');

var picturesContainer = document.querySelector('.pictures');
var templateElement = document.querySelector('template');
var pictureClone;

var Filter = {
  'ALL': 'filter-popular',
  'NEW': 'filter-new',
  'DISCUSS': 'filter-discussed',
  'TEST': 'filter-test'
};

var pictures = [];

var DEFAULT_FILTER = Filter.ALL;

var PICTURES_LOAD_URL = '//o0.github.io/assets/json/pictures.json';
if ('content' in templateElement) {
  pictureClone = templateElement.content.querySelector('.picture');
} else {
  pictureClone = templateElement.querySelector('.picture');
}

var getPictures = function(callback) {
  var xhr = new XMLHttpRequest();

  xhr.onload = function() {
    if (xhr.status !== 200) {
      picturesContainer.classList.add('pictures-failure');
    }
  };

  xhr.onreadystatechange = function(evt) {
    if(xhr.readyState === 3) {
      picturesContainer.classList.remove('pictures-loading');
    } else if (xhr.readyState === 4) {
      var loadedData = JSON.parse(evt.target.response);
      callback(loadedData);
    }
  };


  picturesContainer.classList.add('pictures-loading');

  xhr.open('GET', PICTURES_LOAD_URL);
  xhr.send();
  //console.log(xhr.readyState);
};

var getPictureElement = function(data, container) {
  var element = pictureClone.cloneNode(true);

  var image = new Image();
  var imgElem = element.querySelector('img');
  image.onload = function() {
    imgElem.src = image.src;
    imgElem.width = IMAGE_SIZE;
    imgElem.height = IMAGE_SIZE;
  };
  image.onerror = function() {
    element.classList.add('picture-load-failure');
  };
  image.src = data.url;

  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;

  container.appendChild(element);
  return element;
};

var labels = document.querySelectorAll('.filters-item');

labels.forEach(function(label) {
  var index = document.createElement('sup');
  label.appendChild(index);
});

var renderPictures = function(pictures) {
  picturesContainer.innerHTML = '';

  pictures.forEach(function(picture) {
    getPictureElement(picture, picturesContainer);
  });
};

var getFilteredPictures = function(loadFilterPic, filter) {
  var loadFilterPic = pictures.slice(0);

  var errorTemplate = function() {
    var upload = document.querySelector('.upload');
    var uploadError = upload.querySelectorAll('.error-text');
    if (uploadError[0]) {
      upload.removeChild(uploadError[0]);
    }
    if (loadFilterPic.length === 0) {
      var templateError = document.querySelector('#error-template');
      var templateErrorContent = 'content' in templateError ? templateError.content : templateError;
      var errorElement = templateErrorContent.querySelector('.error-text').cloneNode(true);
      upload.appendChild(errorElement);
    }
  };

  switch (filter) {
    case Filter.ALL:
      break;

    case Filter.NEW:
      loadFilterPic = loadFilterPic.filter(function(a) {
        var lastFourDays = 4 * 24 * 60 * 60 * 1000;
        var dateImg = new Date(a.date);
        return dateImg >= (Date.now() - lastFourDays) && dateImg < Date.now();
      });
      loadFilterPic = loadFilterPic.sort(function(a, b) {
        return (new Date(b.date) - new Date(a.date));
      });
      break;

    case Filter.DISCUSS:
      loadFilterPic = loadFilterPic.sort(function(a, b) {
        return b.comments - a.comments;
      });
      break;

    case Filter.TEST:
      loadFilterPic = loadFilterPic.filter(function(a) {
        return a.likes > 24000;
      });
      break;
  }
  errorTemplate();
  return loadFilterPic;
};

var setFilterEnabled = function(filter) {
  var filteredPictures = getFilteredPictures(pictures, filter);
  renderPictures(filteredPictures);
};

var setFiltersEnabled = function() {
  var filters = formFilters.querySelectorAll('.filters-radio');
  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function() {
      setFilterEnabled(this.id);
    };
  }
};


getPictures(function(loadPictures) {
  pictures = loadPictures;
  setFiltersEnabled();
  setFilterEnabled(DEFAULT_FILTER);
});

formFilters.classList.remove('hidden');
