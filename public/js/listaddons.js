window.restList = _.sortBy(rawRestList, 'name');

window.searchAutoCompArray = [];
restList.forEach(function(item, index) {
   searchAutoCompArray.push({'value':item['name'], 'data':index}); 
});