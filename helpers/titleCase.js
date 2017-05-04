exports.titleCase = (str) => {
  return str.toLowerCase().trim().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
};
