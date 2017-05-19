import { FIELDS_TO_SHOW } from './constants';



const isArray = (arr) => {
  return (arr !== null) && (typeof arr === "object") && (toString.call(arr) === "[object Array]");
};

const isObject = (obj) => {
  return (arr !== null) && (typeof arr === "object");
}

const reducer = (acc, val) => {
  return acc[val];
};

export default class Utility{
  static getFieldName(searchType, index) {
    searchType = searchType.toUpperCase();
    const fields = FIELDS_TO_SHOW[searchType];
    if(isArray(fields[index])) {
      if(fields[index][0] === 'array') {
        return fields[index][1];
      }
      return fields[index][0];
    }
    return fields[index];
  }

  static getFieldValue(searchType, index, object) {
    searchType = searchType.toUpperCase();
    const fields = FIELDS_TO_SHOW[searchType];
    
    if(isArray(fields[index])) {
      if(fields[index][0] === 'array') {
        return object[fields[index][1]].reduce((acc, val) => {
          acc.push(val[fields[index][2]]);
          return acc;
        }, []).join();
      }
      return fields[index].reduce(reducer, object);
    }
    if(isArray(object[fields[index]])) {
      return object[fields[index]].join();
    }
    return object[fields[index]];
  }

  static getColumnCount(searchType) {
    searchType = searchType.toUpperCase();
    return FIELDS_TO_SHOW[searchType].length;
  }
}
