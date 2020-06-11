// Файл, содержащий генетический алгоритм для решения N-пазла
const print = require('./print_func');
const aux = require('./aux_func');

function genetic_algorithm(arr, final, N_gen, n, m, p_c, p_m, s, type, func) { // Генетический алгоритм для решения N-пазла
  m = MD(arr,final) + PD(arr,final);
  let chromosomes = []; let chromosomes_info = {};
  let parents = []; let par_fitn = [];
  let old_chromosomes = {};
  let start = new Date; let diff = 0;
  let five_min = 300000;
  for (let j = m;;j++) {
    diff = new Date - start;
    // if (diff > five_min) {
    //   break;
    // }
    chromosomes = gener_chr(n,j,type);
    for (let i = 0; i < N_gen; i++) {
      if (i == 0)
        chromosomes_info = decode_all(chromosomes,arr,final,type);
      else
        chromosomes_info = decode_all(chromosomes_info.chromosomes,arr,final,type);
      if (chromosomes_info.sol == 1) {
        return chromosomes_info;
      }
      chromosomes_info = fitness_count(chromosomes_info,final,func);
      chromosomes_info = probabily_count(chromosomes_info);
      old_chromosomes = save_old(chromosomes_info);
      chromosomes_info = selection(chromosomes_info, s);
      if (chromosomes_info.chromosomes.length < 2) { // Популяция вымерла
        break;
      }
      chromosomes_info = probabily_count(chromosomes_info);
      parents = choose_parents(old_chromosomes)[0];
      //[parents, par_fitn] = choose_parents(old_chromosomes);
      chromosomes_info = crossover(parents, chromosomes_info, p_c, type);
      //chromosomes_info = crossover_new(parents, par_fitn, chromosomes_info, p_c, type);
      chromosomes_info = mutation(chromosomes_info, p_m, type);
    }
    /*if (j < 50)
      j++;
    else {
      j = 10;
    }*/
  }
  return 0;
}

function add_chr(n,chromosomes,type,m) { // Дополнение старых хромосом случайной частью
  let new_chromosomes = [];
  let second_parts = gener_chr(n/8,1,type);
  let true_chr = gener_chr(7*n/8,m,type);
  new_chromosomes = new_chromosomes.concat(true_chr);
  for (var i = 0; i < second_parts.length; i++) {
    if (type == 1)
      new_chromosomes.push(chromosomes[i] + second_parts[i]);
    else
      new_chromosomes.push(chromosomes[i].concat(second_parts[i]));
  }
  return new_chromosomes;
}

function gener_chr(n, m, type) { // Функция, генерирующая начальную популяцию хромосом
  let chromosomes = [];
  if (type == 1) {
    for (let i = 0; i < n; i++) {
      let genes = "";
      for (let j = 0; j < 2*m; j++) {
        if (Math.random() >= 0.5)
          genes += 1;
        else
          genes += 0;
      }
      chromosomes.push(genes)
    }
  }
  else {
    for (let i = 0; i < n; i++) {
      let genes = [];
      for (let j = 0; j < m; j++)
        genes.push(Math.random())
      chromosomes.push(genes)
    }
  }
  return chromosomes;
}


function decode_all(chr,arr,final,type) { // Функция, декодирующая данные всех хромосом
  let chromosomes_info = {
    sol: 0,
    chromosomes: chr,
    paths: [],
    f_states: [],
    fitness: [],
    probability: [],
    acc_probability: []
  }
  let data = [];
  for (let i = 0; i < chr.length; i++) {
    data = decode_ch(chr[i],arr,final,type);
    if (data[2] == 1) {
      let solution = {
        sol: 1,
        length: data[1].length-1,
        path: data[0],
        Q: data[1]
      }
      return solution;
    }
    chromosomes_info.paths.push(data[0]);
    chromosomes_info.f_states.push(data[1]);
  }
  return chromosomes_info;
}

function decode_ch(chr, arr, final, type) { // Функция, декодирующая данные одной хромосомы
  let data = get_paths(chr,arr,final,type);
  let states = data.states;
  let path = data.moves;
  path = print.convert_path(path);
  if (data.found == 1) { // Вернуть решение с последовательностью состояний
    return [path, states, 1];
  }
  return [path, states[states.length - 1], 0]
  //return [path, states, 0];
}

function convert_number(chr) {
  let numbers = [];
  for (let i = 0; i < chr.length; i += 2)
    numbers.push(Number.parseInt(chr.substr(i,2),2));
  return numbers;
}

function convert_chr(chr, k) {
  if (k == 1)
    return 0;
  else {
    for (let i = 1; i <= k; i++) {
      if (chr < i/k)
        return i-1;
    }
  }
}

function get_paths(chr, arr, final_state, type) { // Функция, получающая все пути, закодированные хромосомой
  let numbers = chr;
  if (type == 1)
    numbers = convert_number(chr);
  let states = [];
  let data_obj = {
    states: [],
    moves: '',
    found: 0
  }
  states.push(arr);
  let [i, j] = aux.f_ind(arr,0);
  let move = [-1,-1,-1,-1]; // Массив отвечающий за направления движения Left-Down-Right-Up
  let moves = []; // Массив абсолютных направлений движения (номеров вершин для перехода)
  let counter = 0; // Счетчик количества доступных направлений
  let inverse = -1; // Обратный элемент к текущему ходу (по умолчанию -1)
  let dir = -1; // Направление движения (текущий относительный номер вершины)
  for (let k = 0; k < numbers.length; k++) {
    if (k != 0) { inverse = (moves[k-1] + 2) % 4; }
    if (j != 0 && inverse != 0) { // Элемент слева (с номером 0) существует
      move[0] = counter;
      counter++;
    }
    if (i != arr.length - 1 && inverse != 1) { // Элемент снизу (с номером 1) существует
      move[1] = counter;
      counter++;
    }
    if (j != arr[0].length - 1 && inverse != 2) { // Элемент справа (с номером 2) существует
      move[2] = counter;
      counter++;
    }
    if (i != 0 && inverse != 3) { // Элемент сверху (с номером 3) существует
      move[3] = counter;
      counter++;
    }
    if (type == 1)
      dir = numbers[k] % counter;
    else
      dir = convert_chr(numbers[k], counter);
    counter = 0;
    moves.push(move.indexOf(dir));
    let data = move_tile(moves,states[states.length-1],i,j);
    states.push(data.new_state);
    if (solution_check(data.new_state, final_state) == true) {
      data_obj = {
        states: states,
        moves: moves.join(''),
        found: 1
      }
      return data_obj;
    }
    else {
      [i, j] = data.new_coords;
      move = [-1,-1,-1,-1];
    }
  }
  data_obj.states = states;
  data_obj.moves = moves.join('');
  return data_obj;
}


function move_tile(moves,arr,i,j) { // Функция, выполняющая один указанный ход в задаче N-пазла
  let cur_move = moves[moves.length-1];
  let clone = arr.map(function(array) {  return array.slice(); });
  let ij = [];
  switch (cur_move) {
    case 0: // Сдвинуть пустое место влево
      clone[i][j] = arr[i][j-1];
      clone[i][j-1] = 0;
      ij = [i, j-1];
      break;
    case 1: // Сдвинуть пустое место вниз
      clone[i][j] = arr[i+1][j];
      clone[i+1][j] = 0;
      ij = [i+1, j];
      break;
    case 2: // Сдвинуть пустое место вправо
      clone[i][j] = arr[i][j+1];
      clone[i][j+1] = 0;
      ij = [i, j+1];
      break;
    case 3: // Сдвинуть пустое место вверх
      clone[i][j] = arr[i-1][j];
      clone[i-1][j] = 0;
      ij = [i-1, j];
      break;
    default:
      console.log("Ошибка в выборе направления");
  }
  let data_obj = {
    new_state: clone,
    new_coords: ij
  }
  return data_obj;
}


function solution_check(arr,final) { // Проверка, совпадает ли текущее состояние с финальным
  let size = arr.length;
  let count = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (arr[i][j] == final[i][j])
        count++;
    }
  }
  if (count == size*size)
    return true;
  else
    return false;
}


function fitness_count(chr_info, final, func) { // Вычисление значения функции приспособленности
  let MPD = 0; let f_value = 0; let summ = 0;
  let size = chr_info.f_states[0].length;
  for (let i = 0; i < chr_info.f_states.length; i++) {
    //MPD = aux.mean(MD, chr_info.f_states[i],final) + aux.mean(PD, chr_info.f_states[i],final);
    MPD = MD(chr_info.f_states[i],final);
    if (func == "MPD")
      MPD += PD(chr_info.f_states[i],final);
    (MPD != 0) ? f_value = 1/MPD : f_value = 2;
    summ += f_value;
    chr_info.fitness.push(f_value);
  }
  //console.log("Общая приспособленность: " + summ);
  return chr_info;
}


function MD(p,q) { // Функция, вычисляющая расстояние городских кварталов между двумя конфигурациями
  let MD = 0;
  let N = p.length*p.length;
  let [i_p, j_p] = [0, 0]; let [i_q, j_q] = [0, 0];
  for (let x = 1; x < N; x++) {
    [i_p, j_p] = aux.f_ind(p,x); [i_q, j_q] = aux.f_ind(q,x);
    MD += (Math.abs(i_p - i_q) + Math.abs(j_p - j_q));
  }
  return MD;
}

function PD(p,q) { // Функция, вычисляющая расстояние пар между двумя конфигурациями
  let PD = 0;
  let row_list = []; let col_list = [];
  let N = p.length*p.length;
  let [i_p, j_p] = [0, 0]; let [i_q, j_q] = [0, 0];
  let y = 0;
  for (let x = 1; x < N; x++) {
    if (row_list.indexOf(x) == -1) {
      y = Row(x,p,q);
      if (row_list.indexOf(y) == -1 && y != 0) {
        row_list.push(x,y);
        PD += 2;
      }
    }
    if (col_list.indexOf(x) == -1) {
      y = Col(x,p,q);
      if (col_list.indexOf(y) == -1 && y != 0) {
        col_list.push(x,y);
        PD += 2;
      }
    }
  }
  return PD;
}

function Row(x,p,q) { // Функция, возвращающая смежный элемент к заданному из той же строки
  let m = p.length;
  let [i_p, j_p] = aux.f_ind(p,x);
  let [i_q, j_q] = aux.f_ind(q,x);
  let y = 0;
  if (i_p == i_q && j_p != j_q) {
    for (let j = 0; j < m; j++) {
      if (j != j_p && j != aux.f_ind(q,p[i_p][j])[1] && aux.f_ind(q,p[i_p][j])[0] == i_p && ((j_p < aux.f_ind(p,p[i_p][j])[1] && j_q > aux.f_ind(q,p[i_p][j])[1]) || (j_p > aux.f_ind(p,p[i_p][j])[1] && j_q < aux.f_ind(q,p[i_p][j])[1]))) {
        y = p[i_p][j];
        break;
      }
    }
  }
  return y;
}

function Col(x,p,q) { // Функция, возвращающая смежный элемент к заданному из того же столбца
  let m = p.length;
  let [i_p, j_p] = aux.f_ind(p,x);
  let [i_q, j_q] = aux.f_ind(q,x);
  let y = 0;
  if (j_p == j_q && i_p != i_q) {
    for (let i = 0; i < m; i++) {
      if (i != i_p && i != aux.f_ind(q,p[i][j_p])[0] && aux.f_ind(q,p[i][j_p])[1] == j_p && ((i_p < aux.f_ind(p,p[i][j_p])[0] && i_q > aux.f_ind(q,p[i][j_p])[0]) || (i_p > aux.f_ind(p,p[i][j_p])[0] && i_q < aux.f_ind(q,p[i][j_p])[0]))) {
        y = p[i][j_p];
        break;
      }
    }
  }
  return y;
}


function probabily_count(chr_info) { // Вычисление вероятностей выживания и размножения для каждой хромосомы
  let pr = []; let acc_pr = [];
  let summ = chr_info.fitness.reduce(function(a, b) { return a + b; }, 0)
  for (let i = 0; i < chr_info.fitness.length; i++)
    pr.push(chr_info.fitness[i]/summ);
  acc_pr.push(pr[0]);
  for (let i = 1; i < pr.length; i++)
    acc_pr.push(pr[i] + acc_pr[i-1])
  chr_info.probability = pr;
  chr_info.acc_probability = acc_pr;
  return chr_info
}

function save_old(chr_info) { // Сохранение старых хромосом
  let old = {
    chromosomes: chr_info.chromosomes,
    fitness: chr_info.fitness,
    probability: chr_info.probability,
    acc_probability: chr_info.acc_probability
  }
  return old;
}

function selection(chr_info, s) { // Отбор заданного количества выживших при помощи турнирной селекции
  let amount = Math.round(chr_info.chromosomes.length*s); // Общее количество выживших особей
  let [rem_chr, rem_fitn] = roullete_weel(chr_info, amount,'selection');
  //let [rem_chr, rem_fitn] = tournament(chr_info, amount);
  //let [rem_chr, rem_fitn] = rang_selection(chr_info, amount);
  chr_info.f_states = [];
  chr_info.paths = [];
  chr_info.chromosomes = rem_chr;
  chr_info.fitness = rem_fitn;
  return chr_info;
}

function rang_selection(chr_info, N) {
  let elems_chr = []; let elems_fitn = [];
  let ind = 0;
  let temp_arr = chr_info.fitness.slice();
  temp_arr.sort(function (a, b) { return b - a; });
  for (let i = 0; i < N; i++) {
    ind = chr_info.fitness.indexOf(temp_arr[i]);
    elems_chr.push(chr_info.chromosomes[ind]);
    elems_fitn.push(temp_arr[i]);
  }
  return [elems_chr, elems_fitn];
}

function tournament(chr_info,N) {
  let elems_chr = []; let elems_fitn = [];
  let f_ind = 0; let s_ind = 0;
  for (let i = 0; i < N; i++) {
    f_ind = aux.rand_int(0,chr_info.chromosomes.length-1); s_ind = aux.rand_int(0,chr_info.chromosomes.length-1);
    if (chr_info.fitness[f_ind] > chr_info.fitness[s_ind]) {
      elems_chr.push(chr_info.chromosomes[f_ind]); elems_fitn.push(chr_info.fitness[f_ind]);
    }
    else {
      elems_chr.push(chr_info.chromosomes[s_ind]); elems_fitn.push(chr_info.fitness[s_ind]);
    }
  }
  return [elems_chr, elems_fitn];
}

function roullete_weel(chr_info,N,mode) {
  let elems_chr = []; let elems_fitn = [];
  let r_n = 0; let ind = 0;
  let elem_chr = ''; let elem_fitn = 0;
  for (var i = 0; i < N; i++) {
    r_n = Math.random();
    ind = chr_info.acc_probability.findIndex(function(el,ind,array) { return el >= r_n; })
    elem_chr = chr_info.chromosomes[ind];
    elem_fitn = chr_info.fitness[ind];
    if (mode == 'selection') { // Выбор рулетки для отбора хромосом
      if ((i == 0) || (i != 0 && aux.unique(elems_chr, elem_chr))) {
        elems_chr.push(elem_chr); elems_fitn.push(elem_fitn);
      }
      else {
        let elem = elems_chr[i-1]; let ind = 0; let count = 0;
        while(!aux.unique(elems_chr, elem) && count <= chr_info.chromosomes.length) {
          r_n = Math.random();
          ind = chr_info.acc_probability.findIndex(function(el,ind,array) { return el >= r_n; })
          elem = chr_info.chromosomes[ind];
          count++;
        }
        elems_chr.push(elem);
        elems_fitn.push(chr_info.fitness[ind]);
      }
    }

    else { // Выбор рулетки для формирования пар
      if ((i % 2 == 0) || (i % 2 != 0 && elems_chr[i-1] != elem_chr)) {
        elems_chr.push(elem_chr); elems_fitn.push(elem_fitn);
      }
      else {
        let elem = elems_chr[i-1]; let ind = 0; let count = 0;
        while(elem == elems_chr[i-1] && count <= chr_info.chromosomes.length) {
          r_n = Math.random();
          ind = chr_info.acc_probability.findIndex(function(el,ind,array) { return el >= r_n; })
          elem = chr_info.chromosomes[ind];
          count++;
        }
        elems_chr.push(elem);
        elems_fitn.push(chr_info.fitness[ind]);
      }
    }
  }
  return [elems_chr, elems_fitn];
}


/*function roullete_weel(chr_info,N,mode) { // Функция, реализующуя метод выбора рулетки
  let elems_chr = []; let elem_chr = '';
  let elems_fitn = []; let elem_fitn = 0;
  let r_n = 0; let ind = 0;
  for (var i = 0; i < N; i++) {
    r_n = Math.random();
    ind = chr_info.acc_probability.findIndex(function(el,ind,array) { return el >= r_n; })
    elem_chr = chr_info.chromosomes[ind];
    elem_fitn = chr_info.fitness[ind];
    if ((i % 2 == 0) || (i % 2 != 0 && elems_chr[i-1] != elem_chr)) {
        elems_chr.push(elem_chr); elems_fitn.push(elem_fitn);
    }
    else {
      let elem = elems_chr[i-1]; let ind = 0; let count = 0;
      while(elem == elems_chr[i-1] && count <= chr_info.chromosomes.length) {
        r_n = Math.random();
        ind = chr_info.acc_probability.findIndex(function(el,ind,array) { return el >= r_n; })
        elem = chr_info.chromosomes[ind];
        count++;
      }
      elems_chr.push(elem);
      elems_fitn.push(chr_info.fitness[ind]);
    }
  }
  return [elems_chr, elems_fitn];
}*/


function choose_parents(chr_info) { // Выбор хромосом родителей
  let amount = Math.round(chr_info.chromosomes.length*0.7); // Общее количество родителей
  if (amount % 2 != 0)
    amount--;
  let [pairs,fitn] = roullete_weel(chr_info,amount);
  return [pairs, fitn];
}

function crossover_new(parents, fitness, chr_info, p_c, type) {
  let children = []; let rand = 0;
  pairs = make_pairs(parents, fitness);
  for (let i = 0; i < pairs.length; i++) {
    rand = Math.random();
    if (rand <= p_c) {
      if (type == 1)
        children.push(single_point(pairs[i][0], pairs[i][1]))
      else
        children.push(cut_n_splice(pairs[i][0], pairs[i][1]))
    }
  }
  chr_info.chromosomes = chr_info.chromosomes.concat(children);
  return chr_info
}

function make_pairs(parents, fitness) {
  let pairs = []; let couple = [];
  let first; let second;
  for (var i = 0; i < parents.length; i++) {
    couple = [];
    first = parents[i];
    couple.push(first); // Выбор первого родителя
    second = parents[inbriding(fitness,i)];
    couple.push(second);
    pairs.push(couple);
  }
  return pairs;
}

function inbriding(fitness,cur) {
  let dist = []; let the_one;
  for (let i = 0; i < fitness.length; i++) {
    if (i != cur)
      dist.push(fitness[i] - fitness[cur]);
    else
      dist.push(Infinity);
  }
  the_one = dist.indexOf(Math.min.apply(null,dist));
  return the_one;
}

function outbriding(fitness,cur) {
  let dist = []; let the_one;
  for (let i = 0; i < fitness.length; i++) {
    if (i != cur)
      dist.push(fitness[i] - fitness[cur]);
    else
      dist.push(-Infinity);
  }
  the_one = dist.indexOf(Math.max.apply(null,dist));
  return the_one;
}

function crossover(parents, chr_info, p_c, type) { // Выполнение операции кроссинговера с вероятностью p_c
  let children = []; let rand = 0;
  for (let i = 0; i < parents.length - 1; i += 2) {
    rand = Math.random();
    if (rand <= p_c) {
      //children = children.concat(single_point(parents[i], parents[i+1]));
      if (type == 1)
        children.push(single_point(parents[i], parents[i+1]))
      else
        children.push(cut_n_splice(parents[i], parents[i+1]))
    }
  }
  chr_info.chromosomes = chr_info.chromosomes.concat(children);
  return chr_info
}

function single_point(elem1, elem2) { // Одноточечный кроссинговер
  let m = elem1.length/2;
  let new_elems = elem1.substr(0,m) + elem2.substr(m);//, elem2.substr(0,m) + elem1.substr(m)]
  return new_elems;
}

function cut_n_splice(elem1, elem2) { // Кроссинговер со случайными точками пересечения
  let m1 = aux.rand_int(1,elem1.length-1);
  let m2 = aux.rand_int(0,elem2.length-1);
  let new_elems = elem1.slice(0,m1).concat(elem2.slice(m2));//, elem2.substr(0,m) + elem1.substr(m)]
  //let new_elems = elem1.substr(0,m1) + elem2.substr(m2);
  return new_elems;
}


function mutation(chr_info, p_m, type) { // Выполнение операции мутации с вероятностью p_m
  let my_arr = chr_info.chromosomes;
  let rand = 0;
  for (let i = 0; i < my_arr.length; i++) {
    rand = Math.random();
    if (rand <= p_m) {
      rand = aux.rand_int(0,my_arr[i].length-1);
      if (type == 1)
        my_arr[i] = my_arr[i].substr(0,rand) + (Number.parseInt(my_arr[i][rand],2) ^ 1 << 0) + my_arr[i].substr(rand+1);
      else
        my_arr[i] = my_arr[i].slice(0,rand).concat(Math.random(), my_arr[i].slice(rand+1));
    }
  }
  chr_info.chromosomes = my_arr;
  return chr_info;
}


module.exports = {
  genetic_algorithm: genetic_algorithm,
  solution_check: solution_check
}
