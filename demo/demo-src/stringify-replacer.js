export default function (data) {

  const replacer = (key, value) => {
    // Filtering out properties
    if (['custom_matches', 'p', 's'].indexOf(key) !== -1
      && value !== null
      && typeof value === 'object'
    ) {
      return '||' + JSON.stringify(value) + '||';
    }
    return value;
  };

  return JSON.stringify(data, replacer, 1)
    .replace(/"(.*?)":/g, '<span class="json-key">$1:</span>')
    .replace(/,([\d,[])/g, ', $1')
    .replace(/"\|\|/g, '')
    .replace(/\|\|"/g, '');
}
