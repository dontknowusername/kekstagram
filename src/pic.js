'use strict';

var templateElement = document.querySelector('template');
var IMAGE_LOAD_TIMEOUT = 10000;
var IMAGE_SIZE = 182;
var picturesContainer = document.querySelector('.pictures');

if ('content' in templateElement) {
  pictureClone = templateElement.content.querySelector('.picture');
} else {
  pictureClone = templateElement.querySelector('.picture');
}


var pictureClone;
module.exports = {
  getPictureElement: function(data) {
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
  }

  // var labels = document.querySelectorAll('.filters-item');
  // labels.forEach(function(label) {
  //   var index = document.createElement('sup');
  //   label.appendChild(index);
  // });

};
