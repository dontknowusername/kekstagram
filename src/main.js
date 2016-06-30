'use strict';

require('./upload');
var filter = require('./filter/filter');
var filterType = require('./filter/filter-type.js');
var load = require('./load');
var pic = require('./pic');


var PAGE_SIZE = 12;
var THROTTLE_DELAY = 100;
var DEFAULT_FILTER = filterType.ALL;


var picturesContainer = document.querySelector('.pictures');
var filteredPictures = [];
var pictures = [];
var pageNumber = 0;
var formFilters = document.querySelector('.filters');


formFilters.classList.add('hidden');

var renderPictures = function(picturesa, page, replace) {
  if (replace) {
    picturesContainer.innerHTML = '';
  }

  var from = page * PAGE_SIZE;
  var to = from + PAGE_SIZE;

  picturesa.slice(from, to).forEach(function(picture) {
    pic.getPictureElement(picture);
  });
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

var setFilterEnabled = function(filtersType) {
  filteredPictures = filter(pictures, filtersType);
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

var isBottomReached = function() {
  var picturesPosition = picturesContainer.getBoundingClientRect();
  return picturesPosition.bottom - window.innerHeight - 100 <= 0;
};

var isNextPageAvailable = function(pict, page, pageSize) {
  return page < Math.floor(pict.length / pageSize);
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

load(function(loadPictures) {
  pictures = loadPictures;
  setFiltersEnabled();
  setFilterEnabled(DEFAULT_FILTER);
  setScrollEnabled();
});

formFilters.classList.remove('hidden');
