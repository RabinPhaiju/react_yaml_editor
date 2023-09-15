export default function getAllKeys(obj,type='text',detail = 'local') {
    let keys = [];
    const pattern = /\d+\./g;
  
    function recurse(obj, current) {
      for (let key in obj) {
        let newKey = current ? `${current}.${key}` : key;
        if (typeof obj[key] === 'object' && ! Array.isArray(obj[key])) {
          recurse(obj[key], newKey);
        } else {
          newKey = newKey.replace(pattern, '');
          keys.push( {label: newKey, type: type, apply: newKey, detail: detail});
        }
      }
    }
  
    recurse(obj, '');
  
    return keys;
  }