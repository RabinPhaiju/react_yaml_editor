export default function getAllKeys(obj) {
    let keys = [];
    const pattern = /\d+\./g;
  
    function recurse(obj, current) {
      for (let key in obj) {
        let newKey = current ? `${current}.${key}` : key;
        if (typeof obj[key] === 'object') {
          recurse(obj[key], newKey);
        } else {
          newKey = newKey.replace(pattern, '');
          keys.push(newKey);
        }
      }
    }
  
    recurse(obj, '');
  
    return keys;
  }