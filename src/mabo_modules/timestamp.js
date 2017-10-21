let timestamp = function timestamp() {
  
  let now    = new Date();
  let year   = padding(4, now.getFullYear()).toString();
  let month  = padding(2, now.getMonth() + 1).toString();
  let date   = padding(2, now.getDate()).toString();
  let hour   = padding(2, now.getHours()).toString();
  let minute = padding(2, now.getMinutes()).toString();
  let second = padding(2, now.getSeconds()).toString();
  return year + month + date + hour + minute + second;
  
  function padding(num, target) {
    if (target.length >= num) return target;
    
    return ('0000' + target).slice(-num);
  }
};

module.exports = timestamp;