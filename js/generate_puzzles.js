// Функции для генерации задач N-пазла
const aux = require('./aux_func');
const read = require('./read_data');
fs = require('fs');

let size = 4; let puzzle = [];
//let arr = read.read_puzzle('init.txt');

function generate_final(size) { // Генерация финального состояния для пазла заданного размера пазла
  let final = [];
  for (let i = 0; i < size; i++) {
    let temp = [];
    for (let j = 0; j < size; j++) {
      if (i == size-1 && j == size-1)
        temp.push(0);
      else
        temp.push(j+1+i*size);
    }
    final.push(temp);
  }
  return final;
}

function generate_puzzles(arr,init_dept,final_dept,amount) {
  let dir = 'all_puzzles.txt';
  if (arr.length == 4) dir = dir.replace('.txt','_2.txt');
  let puzzle_arr = []; let temp_arr = []; let analyze_arr = [];
  let analyze_str = '';
  if (final_dept == 0) {
    while (amount != 0) {
      temp_arr = generate_new(arr,init_dept);
      analyze_str = temp_arr.map(el => '{' + el.join(',') + '}');
      puzzle_arr.push(temp_arr.map(el => el.join(' ')).join('\n'));
      analyze_arr.push('{' + analyze_str.join(',') + '}');
      amount--;
    }
  }
  else {
    for (let i = init_dept; i <= final_dept; i++) {
      temp_arr = generate_new(arr,i);
      analyze_str = temp_arr.map(el => '{' + el.join(',') + '}');
      puzzle_arr.push(temp_arr.map(el => el.join(' ')).join('\n'));
      analyze_arr.push('{' + analyze_str.join(',') + '}')
    }
  }
  let data = puzzle_arr.join('\n\n');
  fs.writeFileSync('./aux_data/'+dir,data);
  fs.writeFileSync('./aux_data/analyze_'+dir,'{' + analyze_arr.join(',') + '};');
}

function generate_new(arr,length) {
  let [i, j] = aux.f_ind(arr,0);
  let clone = arr.map(function(array) {  return array.slice(); });
  let moves = []; let rand = 0; let cond = false;
  for (let k = 0; k < length; k++) {
    cond = false;
    while(cond == false) {
      rand = aux.rand_int(0,3);
      if (rand == 0 && j != 0 && (k == 0 || moves[k-1] != 'right')) {  // Сдвинуть пустое место влево
        clone[i][j] = clone[i][j-1];
        clone[i][j-1] = 0;
        j = j - 1;
        moves.push('left'); cond = true;
      }
      if (rand == 1 && i != clone.length - 1 && (k == 0 || moves[k-1] != 'up')) { // Сдвинуть пустое место вниз
        clone[i][j] = clone[i+1][j];
        clone[i+1][j] = 0;
        i = i + 1;
        moves.push('down'); cond = true;
      }
      if (rand == 2 && j != clone[0].length - 1 && (k == 0 || moves[k-1] != 'left')) { // Сдвинуть пустое место вправо
        clone[i][j] = clone[i][j+1];
        clone[i][j+1] = 0;
        j = j + 1;
        moves.push('right'); cond = true;
      }
      if (rand == 3 && i != 0 && (k == 0 || moves[k-1] != 'down')) { // Сдвинуть пустое место вверх
        clone[i][j] = clone[i-1][j];
        clone[i-1][j] = 0;
        i = i - 1;
        moves.push('up'); cond = true;
      }
    }
  }
  save_puzzle(clone,'data.txt',false);
  return clone;
}

function save_puzzle(puzzle, dir, add) {
  let data = ''; let analyze = '{';
  for (var i = 0; i < puzzle.length; i++) {
    data += puzzle[i].join(' ') + '\n';
    analyze += '{' + puzzle[i].join(',') + '},';
  }
  analyze = analyze.slice(0,-1) + '};';
  data = data.replace(' 0',' ');
  if (add == true) {
    fs.appendFileSync('./aux_data/'+dir,data + '\n\n');
    fs.appendFileSync('./aux_data/'+dir.split('.txt')[0]+'_analyze.txt',analyze);
  }
  else {
    fs.writeFileSync('./aux_data/'+dir,data);
    fs.writeFileSync('./aux_data/for_analyze.txt',analyze);
  }

}



function generate_puzzle(size) {
  let arr = fill_arr(0,size*size);
  do arr = rand_arr(arr);
  while (solvable(arr,size) == false)
  let puzzle = [];
  for (let i = 0; i < arr.length; i += size)
    puzzle.push(arr.slice(i,i+size));
  return puzzle;
}

function solvable(arr, size) {
  let temp_arr = arr.slice();
  temp_arr = shift_zero(temp_arr,size);
  let inverses = 0;

  for (let i = 0; i < temp_arr.length-1; i++) {
    for (let j = i; j < temp_arr.length-1; j++) {
      if (temp_arr[j] != 0 && temp_arr[j] < temp_arr[i])
		     inverses++;
    }
  }

  if (inverses % 2)
    return false;
  else
    return true;
}

function shift_zero(arr,size) {
  let zero_pos = arr.indexOf(0);
  let i = zero_pos;
  if (zero_pos < arr.length-size) {
    while(i < arr.length-size) {
      arr[i] = arr[i+size];
      arr[i+size] = 0;
      i += size;
    }
  }
  while(i != arr.length - 1) {
    arr[i] = arr[i+1];
    arr[i+1] = 0;
    i++;
  }
  return arr;
}

function fill_arr(first, last) {
  let arr = [];
  for (var i = first; i < last; i++)
    arr.push(i);
  return arr;
}

function rand_arr(arr) {
  for(let j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
  return arr;
};


module.exports = {
  generate_puzzle: generate_puzzle,
  generate_puzzles: generate_puzzles,
  save_puzzle: save_puzzle,
  generate_new: generate_new,
  generate_final: generate_final
}
