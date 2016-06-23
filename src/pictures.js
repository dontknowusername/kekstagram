'use strict';
var IMAGE_SIZE = 182;
var PICTURES_LOAD_URL = '//o0.github.io/assets/json/pictures.json';
var PAGE_SIZE = 12;
var THROTTLE_DELAY = 100;
var IMAGE_LOAD_TIMEOUT = 10000;

var pageNumber = 0;
var filteredPictures = [];
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
var DEFAULT_FILTER = Filter.ALL;
var pictures = [];


if ('content' in templateElement) {
  pictureClone = templateElement.content.querySelector('.picture');
} else {
  pictureClone = templateElement.querySelector('.picture');
}


var getPictureElement = function(data) {
  var element = pictureClone.cloneNode(true);

  var image = new Image();
  var imgElem = element.querySelector('img');
  var imageTimeout;

  image.onload = function() {
    clearTimeout(imageTimeout);
    imgElem.src = image.src;
    imgElem.width = IMAGE_SIZE;
    imgElem.height = IMAGE_SIZE;
  };

  image.onerror = function() {
    element.classList.add('picture-load-failure');
  };

  imageTimeout = setTimeout(function() {
    image.src = '';
    element.classList.add('picture-load-failure');
  }, IMAGE_LOAD_TIMEOUT);

  image.src = data.url;

  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;

  picturesContainer.appendChild(element);
  return element;
};

var labels = document.querySelectorAll('.filters-item');
labels.forEach(function(label) {
  var index = document.createElement('sup');
  label.appendChild(index);
});


var renderPictures = function(picturesa, page, replace) {
  if (replace) {
    picturesContainer.innerHTML = '';
  }

  var from = page * PAGE_SIZE;
  var to = from + PAGE_SIZE;

  picturesa.slice(from, to).forEach(function(picture) {
    getPictureElement(picture);
  });
};

var getFilteredPictures = function(loadFilterPic, filter) {
  var picturesToFilter = loadFilterPic.slice(0);

  var errorTemplate = function() {
    var upload = document.querySelector('.upload');
    var uploadError = upload.querySelectorAll('.error-text');
    if (uploadError[0]) {
      upload.removeChild(uploadError[0]);
    }
    if (picturesToFilter.length === 0) {
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
      picturesToFilter = picturesToFilter.filter(function(a) {
        var lastFourDays = 4 * 24 * 60 * 60 * 1000;
        var dateImg = new Date(a.date);
        return dateImg >= (Date.now() - lastFourDays) && dateImg < Date.now();
      });
      picturesToFilter = picturesToFilter.sort(function(a, b) {
        return (new Date(b.date) - new Date(a.date));
      });
      break;

    case Filter.DISCUSS:
      picturesToFilter = picturesToFilter.sort(function(a, b) {
        return b.comments - a.comments;
      });
      break;

    case Filter.TEST:
      picturesToFilter = picturesToFilter.filter(function(a) {
        return a.likes > 24000;
      });
      break;
  }
  errorTemplate();
  return picturesToFilter;
};
var picturesAdd = function() {
  while (isBottomReached() && isNextPageAvailable(pictures, pageNumber, PAGE_SIZE)) {
    renderPictures(filteredPictures, ++pageNumber, false);
  }
};

var setResize = function() {
  window.addEventListener('resize', function() {
    picturesAdd();
  });
};
setResize();

var setFilterEnabled = function(filter) {
  filteredPictures = getFilteredPictures(pictures, filter);
  pageNumber = 0;
  renderPictures(filteredPictures, pageNumber, true);

  picturesAdd();
};

var setFiltersEnabled = function() {
  formFilters.addEventListener('click', function(evt) {
    if (evt.target.classList.contains('filters-radio')) {
      setFilterEnabled(evt.target.id);
    }
  });
};

var getPictures = function(callback) {
  var xhr = new XMLHttpRequest();

  xhr.onload = function() {
    if (xhr.status !== 200) {
      picturesContainer.classList.add('pictures-failure');
    }
  };

  xhr.onreadystatechange = function(evt) {
    if(xhr.readyState === xhr.LOADING) {
      picturesContainer.classList.remove('pictures-loading');
    } else if (xhr.readyState === xhr.DONE) {
      var loadedData = JSON.parse(evt.target.response);
      callback(loadedData);
    }
  };


  picturesContainer.classList.add('pictures-loading');

  xhr.open('GET', PICTURES_LOAD_URL);
  xhr.send();
};


var isBottomReached = function() {
  var picturesPosition = picturesContainer.getBoundingClientRect();
  return picturesPosition.bottom - window.innerHeight - 100 <= 0;
};

var isNextPageAvailable = function(pic, page, pageSize) {
  return page < Math.floor(pic.length / pageSize);
};

var throttle = function(callback, delay) {
  var lastCall = Date.now();
  return function() {
    if (Date.now() - lastCall >= delay) {
      callback();
      lastCall = Date.now();
    }
  };
};

var optimizedScroll = throttle(function() {
  if(isBottomReached() && isNextPageAvailable(pictures, pageNumber, PAGE_SIZE)) {
    pageNumber++;
    renderPictures(filteredPictures, pageNumber, false);
  }
}, THROTTLE_DELAY);

var setScrollEnabled = function() {
  window.addEventListener('scroll', optimizedScroll);
};

getPictures(function(loadPictures) {
  pictures = loadPictures;
  setFiltersEnabled();
  setFilterEnabled(DEFAULT_FILTER);
  setScrollEnabled();
});

formFilters.classList.remove('hidden');
