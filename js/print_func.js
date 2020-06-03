// Вспомогательные функции для печати

function print_well(array) {
  print_border(array.length);
  array.forEach((item, i) => {
    item.forEach((it, i) => {
      let str_it = it + ''; let wall = ' | ';
      if (str_it.length == 2)
        wall = ' | ';
      else if (array.length > 3) {
        wall = '  | ';
      }
      if (i == 0)
        process.stdout.write('| ' + it + wall);
      else if (i != item.length - 1)
        process.stdout.write(it + wall);
      else
        process.stdout.write(it + wall + '\n');
    });
  });
  print_border(array.length);
}

function convert_path(path) {
  path = path.replace(/0/g,"Left-").replace(/1/g,"Down-").replace(/2/g,"Right-").replace(/3/g,"Up-")
  return path.slice(0,-1)
}

function print_chr(chr_info) {
  console.log("Все хромосомы: ");
  console.log(chr_info.chromosomes);
  //console.log("Все сформированные пути: ");
  //console.log(chr_info.paths);
  console.log("Все значения функции приспособленности: ");
  console.log(chr_info.fitness);
}

function print_border(len) {
  let par = 3;
  if (len > 3) par = 4;
  process.stdout.write('+');
  for (let i = 0; i < len*par + len-1; i++)
    process.stdout.write('-');
  console.log('+');
}

function print_states(states) {
  let len = states[0].length;
  let par = 3; let size = 0;
  if (len > 3) par = 4;
  size = len*par + len + 1;
  console.log("\nПоследовательность преобразований для решения задачи: ");
  for (let i in states) {
    print_well(states[i]);
    if (i != states.length - 1) {
      print_arrows(size, 'start');
      print_arrows(size, 'end');
    }
  }

}
  function print_arrows(size, type) {
    for (let i = 0; i < size; i++) {
      if (i == Math.floor(size/2))
        type == 'start' ? process.stdout.write('|') : process.stdout.write('v')
      else
        process.stdout.write(' ');
    }
    console.log('')
  }

function print_analyze(iter,avg_t,avg_l,failure,lengths,mode) {
  console.log("Среднее время работы: " + avg_t + " мс");
  console.log("Вероятность успеха: " + (iter - failure)/iter);
  console.log("Средняя длина решения " + avg_l);
  if (mode == 0) {
    console.log("Массив длин решения: " + lengths);
    console.log("Всего попыток: " + iter);
  }

}


module.exports = {
  print_well: print_well,
  convert_path: convert_path,
  print_chr: print_chr,
  print_states: print_states,
  print_arrows: print_arrows,
  print_analyze: print_analyze
}
