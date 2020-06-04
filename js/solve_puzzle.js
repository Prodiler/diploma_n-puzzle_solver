// Основной файл для получения результатов работы алгоритма, решающего N-пазл
const gen = require('./generate_puzzles');
const alg = require('./gen_alg');
const print = require('./print_func');
const read = require('./read_data');
const readline = require('readline');
fs = require('fs');

var size = 4; let type = 2; var iter = 500; let N_gen = 50;
let n = 500; let m = 2; let p_c = 0.4; let p_m = 0.8; let s = 0.4;
var final = []; var arr = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

task_select();

function task_select() {
  rl.question("\nВыберите задачу программы: \n1. Запуск алгоритма\n2. Генерация данных\n", (input) => {
    if (input == 1) {
      console.log("Вы выбрали запуск алгоритма");
      puzzle_select();
    }
    if (input == 2) {
      console.log("Вы выбрали генерацию данных");
      final = gen.generate_final(size);
      gen.generate_puzzles(final,12,0,15);
      console.log("Данные сгенерированы!");
      rl.close();
    }
    else if (input != 1 && input != 2) {
      console.log("Введены некорректные данные");
      task_select()
    }
  });
}


function puzzle_select() {
  console.log("\nВыберите тип N-пазла: ");
  console.log("1. 3-пазл (доска 2x2)");
  console.log("2. 8-пазл (доска 3x3)");
  console.log("3. 15-пазл (доска 4x4)");

  rl.question('', (input) => {
    if (input == 1) {
      console.log("Вы выбрали 3-пазл");
      size = 2;
    }
    if (input == 2) {
      console.log("Вы выбрали 8-пазл");
      size = 3;
    }
    if (input == 3) {
      console.log("Вы выбрали 15-пазл");
      size = 4;
    }
    if (input == 4) {
      console.log("Вы выбрали 24-пазл");
      size = 5;
    }
    else if (input != 1 && input != 2 && input != 3 && input != 4) {
      console.log("Введены некорректные данные");
      puzzle_select()
    }
    final = gen.generate_final(size);
    mode_select();
  });
}


function mode_select() {
  rl.question("\nВыберите режим работы алгоритма: \n1. Режим демонстрации\n2. Режим анализа\n", (input) => {
    if (input == 1) {
      console.log("Вы выбрали режим демонстрации");
      view_mode();
    }
    if (input == 2) {
      console.log("Вы выбрали режим анализа");
      analysis_mode();
    }
    else if (input != 1 && input != 2) {
      console.log("Введены некорректные данные");
      mode_select()
    }
  });
}


function view_mode() {
  rl.question("\nВыберите тип задания данных: \n1. Из файла\n2. Автоматическая генерация\n", (input) => {
    if (input == 1) {
      arr = read.read_puzzle('./user_data.txt');
      console.log("Вы выбрали ввод данных из файла");
      details_choose();
    }
    if (input == 2) {
      arr = gen.generate_puzzle(size);
      console.log("Вы выбрали автоматическую генерацию");
      details_choose();
    }
    else if (input != 1 && input != 2) {
      console.log("Введены некорректные данные");
      view_mode()
    }
  });
}


function details_choose() {
  console.log("\nВыберите уровень детализации работы алгоритма: ")
  console.log("1. Вывод всех преобразований для решения " + (size*size - 1) + "-пазла")
  console.log("2. Вывод последовательности шагов");
  console.log("3. Вывод только времени работы алгоритма и длины решения");
  rl.question('', (input) => {
    if (input == 1) {
      console.log("Вы выбрали полную детализацию алгоритма");
      GA_full(arr, final, N_gen, n, m, p_c, p_m, s, type, 2, "MPD");
      rl.close();
    }
    if (input == 2) {
      console.log("Вы выбрали частичную детализацию алгоритма");
      GA_full(arr, final, N_gen, n, m, p_c, p_m, s, type, 1, "MPD");
      rl.close();
    }
    if (input == 3) {
      console.log("Вы выбрали минимальную детализацию алгоритма\n");
      let [time, len] = GA_full(arr, final, N_gen, n, m, p_c, p_m, s, type, 0, "MPD");
      console.log("Время работы алгоритма: " + time + " мс");
      console.log("Длина найденного решения: " + len);
      rl.close();
    }
    else if (input != 1 && input != 2 && input != 3) {
      console.log("Введены некорректные данные");
      details_choose()
    }
  });
}


function analysis_mode() {
  rl.question("\nВведите объём выборки/количество повторных вычислений " + (size*size - 1) +"-пазла: ", (input) => {
    console.log("Вы ввели: " + input);
    iter = input;
    type_choose();
  });
}

function type_choose() {
  console.log("\nВыберите тип анализа: ")
  console.log("1. Анализ зависимости точности и времени работы алгоритма от глубины для " + (size*size - 1) + "-пазла")
  console.log("2. Анализ эффективности работы алгоритма на случайной выборке заданного размера");
  console.log("3. Многократный запуск алгоритма на конкретной задаче " + (size*size - 1) + "-пазла");
  rl.question('', (input) => {
    if (input == 1) {
      console.log("Запуск полного анализа алгоритма на сформированном наборе задач " + (size*size - 1) + "-пазла...\n");
      //array = read.scan_puzzles("all_" + (size*size - 1) + "-Puzzles.txt");
      array = read.scan_puzzles("./aux_data/all_puzzles_2.txt");
      //array = [read.read_puzzle('./init.txt')];
      deep_analyze(array, final, N_gen, n, m, p_c, p_m, s, iter, type, "MPD")
      rl.close();
    }
    if (input == 2) {
      console.log("Запуск алгоритма на случайной выборке размера " + iter + "...\n");
      analyze_rand(final, N_gen, n, m, p_c, p_m, s, type, iter);
      rl.close();
    }
    if (input == 3) {
      arr = read.read_puzzle('./init.txt');
      console.log("Выполняется многократная обработка указанной задачи " + (size*size - 1) + "-пазла...\n");
      alg_analyze(arr, final, N_gen, n, m, p_c, p_m, s, iter, type, "MPD", iter, 0, 0);
      rl.close();
    }
    else if (input != 1 && input != 2 && input != 3) {
      console.log("Введены некорректные данные");
      type_choose()
    }
  });
}



function deep_analyze(arr, final, N_gen, n, m, p_c, p_m, s, iter, type, func) {
  let data = []; let min_rate = 1; let i = 0;
  let add_data = []; let res = []; let MPD = 0;
  for (let i = 0; i < arr.length; i++) {
    gen.save_puzzle(arr[i],'cur_puzzle.txt',true);
    MPD = alg.MD(arr[i],final) + alg.PD(arr[i],final);
    fs.appendFileSync('./aux_data/all_metrixes.txt', MPD + '\n');
    res = alg_analyze(arr[i], final, N_gen, n, m, p_c, p_m, s, iter, type, func, i, 0, 1);
    fs.appendFileSync('./analysis_res/deep_data.txt', res.main_info.join(' ').replace(/\./g,',') + '\n')
    data.push(res.main_info); add_data.push(res.add_info.join('\n'));
    fs.appendFileSync('./analysis_res/deep_add_data.txt', res.add_info.join('\n').replace(/\,/g,' ').replace(/\./g,',') + '\n\n');
  }
}

function analyze_rand(final, N_gen, n, m, p_c, p_m, s, type, iter) { // Функция для анализа работы алгоритма на случайных данных
  let times_1 = []; let lengths_1 = []; let times_2 = []; let lengths_2 = [];
  let time_1 = 0; let length_1 = 0; let failure = 0;
  let time_2 = 0; let length_2 = 0;
  let puzzle = []; let data = [];
  for (var i = 0; i < iter; i++) {
    puzzle = gen.generate_puzzle(size);
    gen.save_puzzle(puzzle,'rand_data.txt',false);

    [time_1, length_1] = GA_full(puzzle, final, N_gen, n, m, p_c, p_m, s, 2, 0, 'MPD');
    //[time_2, length_2] = GA_full(arr, final, N_gen, n, m, p_c, p_m, s, 2, 0, 'MPD');
    if (time_1 == -1)
      failure++;
    else {
      times_1.push(time_1); times_2.push(time_2);
      lengths_1.push(length_1); lengths_2.push(length_2);
    }
  }
  //aux.form_stat_data(lengths_1, lengths_2, times_1, times_2);
  let avg_t = times_1.reduce(function(a,b) { return a+b; })/times_1.length;
  let avg_l = lengths_1.reduce(function (a,b) { return a+b; })/lengths_1.length
  print.print_analyze(iter,avg_t,avg_l,failure,lengths_1);
}


function alg_analyze(arr, final, N_gen, n, m, p_c, p_m, s, attempts, type, func, len, gen_sol, mode) { // Функция для анализа эффективности ГА на одной задаче
  let lengths = []; let time = [];
  let real_sol = 0; let failure = 0;
  let start = 0; let diff = 0; let data = 0;
  let solution = {
    sol: 1,
    length: 0,
    path: "",
    Q: arr
  };
  if (gen_sol == 1) {
    gen.generate_new(arr,len);
    arr = read.read_puzzle('./aux_data/data.txt');
  }
  let pr_data = "";
  for (let i = 0; i < attempts; i++) {
    start = new Date;
    if (alg.solution_check(arr, final) != true)
      solution = alg.genetic_algorithm(arr, final, N_gen, n, m, p_c, p_m, s, type, func);
    diff = new Date - start;
    console.log("Решение найдено!");
    console.log("Время: " + diff);
    console.log("Длина: " + solution.length);
    console.log("Вычислено задач: " + (i+1));
    pr_data = diff + ' ' + solution.length + "\n";
    fs.appendFileSync('./aux_data/backup.txt',pr_data);
    time.push(diff);
    console.log("Текущее среднее время работы: " + time.reduce(function(a,b) { return a+b; })/time.length + " мс");
    if (solution != 0)
      lengths.push(solution.length);
    else if (solution == 0)
      failure++;
  }
  let avg_t = time.reduce(function(a,b) { return a+b; })/time.length;
  let max_time = Math.max.apply(null,time);
  let min_time = Math.min.apply(null,time);
  let avg_l = -1; let min_l = -1; let min_rate = 0;
  if (failure != 1) {
    avg_l = lengths.reduce(function(a,b) { return a+b; })/lengths.length;
    min_l = Math.min.apply(null,lengths);
    for (let i = 0; i < lengths.length; i++) { if (lengths[i] == min_l) real_sol++; }
    min_rate = real_sol/lengths.length;
  }
  print.print_analyze(attempts,avg_t,avg_l,failure,lengths,mode);
  console.log("Вероятность минимальной глубины: " + min_rate);
  console.log("Минимальная глубина: " + min_l + "\n");
  let data_obj = {
    main_info: [avg_t, max_time, min_time, min_rate, avg_l, min_l],
    add_info: [lengths, time]
  }
  return data_obj;
}


function GA_full(arr, final, N_gen, n, m, p_c, p_m, s, type, details, func) { // Функция для вывода результатов вычисления решения при помощи ГА
  if (details > 0) {
    console.log("\nНачальная конфигурация " + (size*size - 1) + "-пазла: ");
    print.print_well(arr);
  }
  let start = new Date;
  let solution = {
    sol: 1,
    length: 0,
    path: "",
    Q: arr
  };
  if (alg.solution_check(arr, final) != true)
    solution = alg.genetic_algorithm(arr, final, N_gen, n, m, p_c, p_m, s, type, func);
  let time = 0;
  if (solution != 0) {
    time = new Date - start;
    if (details > 0) {
      if (details > 1)
        print.print_states(solution.Q)
      console.log("Общий путь: " + solution.path);
      console.log("Его длина: " + solution.length);
      console.log("Решение найдено за " + time + " мс");
    }
    return [time, solution.length];
  }
  else if (solution == 0 && details > 0)
    console.log("Решение не найдено");
  return [-1, -1];
}
