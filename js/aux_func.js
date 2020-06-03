// Вспомогательные функции

function find_indexes(arr,elem) { // Функция, возвращающая координаты заданного элемента в двумерном массиве
  let i = arr.findIndex(function(el, ind) {  return el.indexOf(elem) != -1 });
  let j = arr[i].indexOf(elem);
  return [i, j]
}

function mean(f_name, arr, q) { // Функция, вычисляющая среднее значение заданной эвристической функции на пути
  let mean = 0;
  for (var i = 0; i < arr.length; i++)
    mean += f_name(arr[i],q);
  return mean/arr.length;
}

function unique(arr,el) { // Проверка, что заданный элемент не появляется в массиве
  let count = 0;
  for (var elem of arr) { if (elem == el) count++; }
  return count == 0 ? 1 : 0;
}

function rand_int(min, max) { // Генерация случайного целого на заданном промежутке
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}


function form_stat_data(l1,l2,t1,t2) {
  let data = {
    length1: l1,
    length2: l2,
    time1: t1,
    time2: t2
  };
  fs.writeFileSync('./analysis_1/stat_data.json',JSON.stringify(data));
}

module.exports = {
  f_ind: find_indexes,
  mean: mean,
  rand_int: rand_int,
  unique: unique,
  form_stat_data: form_stat_data
}
