/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

var browserCookies = require('browser-cookies');

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    return true;
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  function setCookie(cookieName, cookieValue, cookieExpires) {
    var dateNow = Date.now();
    var year = new Date(dateNow).getFullYear();
    var birthDay = new Date(year + '-04-24').getTime();
    if (dateNow <= birthDay) {
      birthDay = new Date(year - 1 + '-04-24').getTime();
    }

    var timeExpires = dateNow - birthDay;
    var dateToExpires = timeExpires + dateNow;
    if (!cookieExpires) {
      cookieExpires = new Date(dateToExpires);
    }
    browserCookies.set(cookieName, cookieValue, {expires: cookieExpires});
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */

  var resize = document.querySelector('#resize-fwd');
  var leftVal = document.querySelector('#resize-x');
  var topVal = document.querySelector('#resize-y');
  var sideVal = document.querySelector('#resize-size');

  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();

          sideVal.min = 1;
          leftVal.min = 0;
          topVal.min = 0;

          if (currentResizer._image.naturalWidth > currentResizer._image.naturalHeight) {
            sideVal.setAttribute('value', currentResizer._image.naturalHeight);
            sideVal.max = currentResizer._image.naturalHeight;
          } else {
            sideVal.setAttribute('value', currentResizer._image.naturalWidth);
            sideVal.max = currentResizer._image.naturalWidth;
          }

          leftVal.addEventListener('input', function() {
            sideVal.max = currentResizer._image.naturalWidth - leftVal.value;
            var sumLeftSideVal = parseInt(leftVal.value, 10) + parseInt(sideVal.value, 10);
            if (sumLeftSideVal > currentResizer._image.naturalWidth) {
              resize.setAttribute('disabled', true);
              resize.classList.add('disabled');
            } else if (sumLeftSideVal <= currentResizer._image.naturalWidth) {
              resize.removeAttribute('disabled');
              resize.classList.remove('disabled');
            }
          });

          topVal.addEventListener('input', function() {
            sideVal.max = currentResizer._image.naturalHeight - topVal.value;
            var sumTopSideVal = parseInt(topVal.value, 10) + parseInt(sideVal.value, 10);
            if (sumTopSideVal > currentResizer._image.naturalHeight) {
              resize.setAttribute('disabled', true);
              resize.classList.add('disabled');
            } else if (sumTopSideVal <= currentResizer._image.naturalHeight) {
              resize.removeAttribute('disabled');
              resize.classList.remove('disabled');
            }
          });

          sideVal.addEventListener('input', function() {
            if (sideVal.validity.rangeOverflow || sideVal.validity.rangeUnderflow) {
              sideVal.setCustomValidity('сумма значений слева или сверху и стороны корявые');
            } else {
              sideVal.setCustomValidity('');
            }
          });

          var filterChrome = document.querySelector('#upload-filter-chrome');
          var filterSepia = document.querySelector('#upload-filter-sepia');
          var filter = document.querySelector('#filter-fwd');

          filter.addEventListener('click', function() {
            if (filterChrome.checked) {
              setCookie('chrome', filterChrome.value);
              setCookie('sepia', '', 0);
            } else if (filterSepia.checked) {
              setCookie('sepia', filterSepia.value);
              setCookie('chrome', '', 0);
            } else {
              setCookie('chrome', '', 0);
              setCookie('sepia', '', 0);
            }
          });

          resize.addEventListener('click', function() {
            var cookieChrome = browserCookies.get('chrome');
            var cookieSepia = browserCookies.get('sepia');
            if (cookieSepia === 'sepia') {
              filterSepia.setAttribute('checked', 'checked');
            } else if (cookieChrome === 'chrome') {
              filterChrome.setAttribute('checked', 'checked');
            } else {
              console.log('кук нет, фильтер не назначен');
            }
          });

        });

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  resizeForm.addEventListener('input', function(evt) {
    if(evt.target.type === 'number') {
      switch (evt.target.name) {
        case 'x':
        case 'y': currentResizer.setConstraint(+leftVal.value, +topVal.value, +sideVal.value);
          break;
        case 'size':
          var resizer = currentResizer.getConstraint();
          var newX = +leftVal.value + (resizer.side - sideVal.value) / 2;
          var newY = +topVal.value + (resizer.side - sideVal.value) / 2;
          currentResizer.setConstraint(newX, newY, +sideVal.value);
          break;
      }
    }

  });

  window.addEventListener('resizerchange', function() {
    var resizer = currentResizer.getConstraint();
    leftVal.value = resizer.x;
    topVal.value = resizer.y;
    sideVal.value = resizer.side;
    //console.log(resizer.x);
  });


  cleanupResizer();
  updateBackground();
})();
