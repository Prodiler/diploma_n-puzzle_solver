// Функции для считывания данных из файла
function scan_puzzles(file) {
  let data = fs.readFileSync(file,'utf8');
  let array = data.split(/\n\n|\r\n\r\n/);
  array[array.length - 1] = array[array.length - 1].slice(0,-1);
  array = array.map(elem => elem.split(/\n|\r\n/).map(el => el.split(' ').map(e => Number.parseInt(e))))
  return array;
}

function read_puzzle(dir) {
  let data = fs.readFileSync(dir,'utf8');
  let arr_str = []; let final_arr = [];
  for (let i = 0; i < data.split('\n').length - 1; i++) {
    arr_str.push(data.split('\n')[i]); final_arr[i] = [];
    for (let j = 0; j < arr_str[i].split(' ').length; j++) {
      if (arr_str[i].split(' ')[j] == '' || arr_str[i].split(' ')[j] == '\r') {
        final_arr[i].push(0);
      }
      else {
        final_arr[i].push(Number.parseInt(arr_str[i].split(' ')[j]));
      }
    }
  }
  return final_arr;
}

module.exports = {
  scan_puzzles: scan_puzzles,
  read_puzzle: read_puzzle
}
