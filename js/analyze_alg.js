// Функции для обработки полученных данных
fs = require('fs');
data_count();

function data_count() {
  let all = fs.readFileSync('./analysis_1/stat_data.json','utf8');
  let obj = JSON.parse(all);
  let counted_obj = { length1: [], length2: [], time1: [], time2: [] };
  let mean_disp_obj = { length1: [], length2: [], time1: [], time2: [] };
  let type = '';
  for (var variable in obj) {
    mean_disp_obj[variable].push(mean_count(obj[variable]));
    mean_disp_obj[variable].push(disp_count(obj[variable],mean_disp_obj[variable][0]));
    variable.indexOf('i') != -1 ? type = 't' : type = 'l';
    counted_obj[variable] = order(obj[variable],type).map(function(elem,ind,arr) { return elem/arr.length; })
  }
  fs.writeFileSync('./analysis_1/finished_data.json',JSON.stringify(counted_obj));
  fs.writeFileSync('./analysis_1/mean_disp_data.json', JSON.stringify(mean_disp_obj))
  let pr_data = form_pretty(counted_obj);
  fs.writeFileSync('./analysis_1/pretty_data.txt', pr_data)
}

function disp_count(arr, mean) {
  let len = arr.length; let s = 0;
  for (let i = 0; i < arr.length; i++)
    s += (arr[i] - mean)*(arr[i] - mean);
  return s/len
}

function mean_count(arr) {
  let len = arr.length;
  let summ = arr.reduce((a,b) => a + b);
  return summ/len
}

function form_pretty(obj) {
  let data = '';
  for (var vars in obj)
    data += obj[vars].join('\n').replace(/\./g,',') + '\n\n';
  return data;
}

function order(param, cmp_t) {
  let values = [20, 40, 60, 80];
  let counts = [0, 0, 0, 0, 0];
  if (cmp_t == 't')
    values = [1000, 2000, 3000, 4000]
  for (let i = 0; i < param.length; i++) {
    if (param[i] <= values[0]) {
      counts[0]++;
    }
    else if (param[i] <= values[1]){
      counts[1]++;
    }
    else if (param[i] <= values[2]) {
      counts[2]++;
    }
    else if (param[i] <= values[3]) {
      counts[3]++;
    }
    else if (param[i] > values[3]) {
      counts[4]++;
    }
  }
  return counts;
}


module.exports = {

}
