var getMessage = function(a, b) {

  var i = 0,
    sum = 0,
    square = 0;

  if (typeof a  == 'boolean') {
    if (a) {
      return 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';  
    } else {
      return 'Переданное GIF-изображение не анимировано'; 
    }
  } else if (typeof a == 'number') {  
      return 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + b * 4 + ' атрибутов';    
  } else if (typeof a == 'object' && typeof b == 'object') {
    for (i < 0; i < a.length; i++) {
      square += a[i] * b[i];
    }   
    return 'Общая площадь артефактов сжатия: ' + square + ' пикселей';    
  } else if (typeof a == 'object') {
    for (i = 0; i < a.length; i++) {
      sum += a[i];
    }   
    return 'Количество красных точек во всех строчках изображения: ' + sum;   
  }
}