'use strict';

var filterType = require('./filter-type.js');

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
    case filterType.ALL:
      break;

    case filterType.NEW:
      picturesToFilter = picturesToFilter.filter(function(a) {
        var lastFourDays = 4 * 24 * 60 * 60 * 1000;
        var dateImg = new Date(a.date);
        return dateImg >= (Date.now() - lastFourDays) && dateImg < Date.now();
      });
      picturesToFilter = picturesToFilter.sort(function(a, b) {
        return (new Date(b.date) - new Date(a.date));
      });
      break;

    case filterType.DISCUSS:
      picturesToFilter = picturesToFilter.sort(function(a, b) {
        return b.comments - a.comments;
      });
      break;

    case filterType.TEST:
      picturesToFilter = picturesToFilter.filter(function(a) {
        return a.likes > 24000;
      });
      break;
  }
  errorTemplate();
  return picturesToFilter;
};

module.exports = getFilteredPictures;
