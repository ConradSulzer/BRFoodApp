var app = {
    init: function() {
        //Checks sessionStorage to see if there is a settings object.
        //Creates one defaulted to all false if not. 
        var settings = app.sessStore('settings');
        if(!Boolean(settings)) {
            var obj = {
                delivery: false,
                onlineOrder: false,
                patio: false
            }; 
            app.sessStore('settings', obj);
        }

        //Check coordinates expiration time and delete if stale.
        var expire = app.store('locExpire');
        if(Boolean(expire)) {
            var d = new Date();
            var now = d.getTime();
            if(now > (expire + 1000*60*60*24)){
                localStorage.clear();
            }
        }
        
        app.prepData()

        $('#autocomplete').autocomplete({
            lookup: searchAutoCompArray,
            lookupLimit: 6,
            width: 'auto',
            showNoSuggestionNotice: true,
            noSuggestionNotice: 'No matching results...',

            onSelect: function (suggestion) {
                document.getElementById('autocomplete').value = '';
                app.popUpCard(restList[suggestion.data]);
            }
        });

        window.sessionStorage.removeItem('filter');
        view.render(); 
        app.eventliseners();
    },

    eventliseners: function() {
        var toggles = document.getElementById('toggleRow');
        var loadMore = document.getElementsByClassName('loadMoreClass');
        var randomizerClose = document.getElementById('randomizerClose'); 

        toggles.addEventListener('change', function(e) {
            if(e.target.id === 'onlineOnly') {
                var value = event.target.checked;
                var settings = app.sessStore('settings');
                settings['onlineOrder'] = value;
                app.sessStore('settings', settings);
                view.render();
            }

            if(e.target.id === 'deliveryOnly') {
                var value = event.target.checked;
                var settings = app.sessStore('settings');
                settings['delivery'] = value;
                app.sessStore('settings', settings);
                view.render();
            }
            if(e.target.id === 'patioToggle') {
                var value = event.target.checked;
                var settings = app.sessStore('settings');
                settings['patio'] = value;
                app.sessStore('settings', settings);
                view.render();
            }
        });

        for(var i = 0; i < loadMore.length; i++) {
            loadMore[i].addEventListener('click', function() {
                var loadMoreDivs = document.getElementsByClassName('loadMoreDiv');
                for(var i = 0; i < loadMoreDivs.length; i++) {
                    loadMoreDivs[i].style.display = 'none';
                }
                setTimeout(view.populateList, 15);
            })
        }
    },
    
    autoComp: function() {
        //Specifies which input field the autocomplete will reside in and then places it there 
        var input = document.getElementById('searchInput');
        var userLoc = app.store('userLoc');  
        autocomplete = new google.maps.places.Autocomplete(input);
        //Event listener, fires when address is picked from the autocompleted list
        google.maps.event.addListener(autocomplete, 'place_changed', function (result) {
            //Fetches the address data from the 'place_changed' event
            var place = autocomplete.getPlace();         
            //Creates an 'address' array with the user's coordinates and street address
            var addressCoords = [place.geometry.location.lat(),place.geometry.location.lng(), place.name];
            //Clear any previous values from localStorage
            window.localStorage.clear();
            //Write new address array to local storage
            if(Boolean(userLoc)){
                localStorage.removeItem('userLoc');
                localStorage.removeItem('locExpire');
            }
            app.store('userLoc', addressCoords); 
            app.prepData();
            view.render();
        });
    },

    prepData: function() {
        //Will take the universal restuarant array, create a new array, sort it based on which locations
        //are closest to the user and store it in localStorage. This way we don't have to run
        //this function every time a user refreshes the page or visits the site.  
        var data = fetch('https://brfoodapp.herokuapp.com/restList').then((dataArray) => {
            return dataArray
        }).catch((e) => {
            console.log(e);
        });

        console.log(data);

        var userLoc = app.store('userLoc');
        var uLat = userLoc[0];
        var uLng = userLoc[1];

        //Create a new array of restuarants with a distance property representing user's distance
        //to each restaurant.
        var arrayMapped = data.map(function(record) {
            record['distance'] = app.findDist(uLat, uLng, record['lat'], record['long']) * 1;
            return record;
        });
        //Sort the array based on which records are closest to user's location
        arraySorted = _.sortBy(arrayMapped, 'distance');
          
        //Store to local storage so we don't have to run this function every time
        //the user loads or revisits the page.
        app.store('restArray', arraySorted);
    },

    findDist: function(lat1, lon1, lat2, lon2) {
        //Haversine calculation of distance from user's lat/long and resturant's lat/long.
        //Returns distance in miles rounded to 2 decimals.
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var radlon1 = Math.PI * lon1/180;
        var radlon2 = Math.PI * lon2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        return dist.toFixed(2);
    },

    geoFindMe: function() {        
        var userLoc = app.store('userLoc');
        function success(position) {
            var d = new Date();
            var expire = d.getTime();
            var geoCoords = [position.coords.latitude, position.coords.longitude];
            if(Boolean(userLoc)){
                localStorage.removeItem('userLoc');
                localStorage.removeItem('locExpire');
            }
            app.store('userLoc', geoCoords);
            app.store('locExpire', expire);
            app.prepData();
            view.render();
        }
        function error() {
            alert('Whoops, that\'s not supposed to happen. Please, try again.');
        }
        if (!navigator.geolocation) {
             alert('Geolocation is not supported by your browser');
        } else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
        
    },

    popUpCard: function(obj) {
        var randomizerDiv = document.getElementById('injectRandomCard');
        var cardTemplate = document.getElementById("cardTemplate").innerHTML;
        var templateFn = _.template(cardTemplate);
        var templateHTML = templateFn(obj);
        randomizerDiv.innerHTML = templateHTML;
        document.querySelector('.mainListChild').className = '';
        $('#randomBox').modal('show');
        app.screenDimmer(false);
    },

    store: function (namespace, obj) {
        //If you only give the data set name as an argument it will return that data set from local storage.
        //If you give a name and a data object it will add that data object to local storage under the name provided.
        //'namespace' should be a string
        if (arguments.length > 1) {
            return localStorage.setItem(namespace, JSON.stringify(obj));
        } else {
            var store = localStorage.getItem(namespace);
            return (store && JSON.parse(store));
        }
    },

    sessStore: function(namespace, obj) {
        //If you only give the data set name as an argument it will return that data set from sessionStorage.
        //If you give a name and a data object it will add that data object to sessionStorage under the name provided.
        //'namespace' should be a string
        if (arguments.length > 1) {
            return sessionStorage.setItem(namespace, JSON.stringify(obj));
        } else {
            var store = sessionStorage.getItem(namespace);
            return (store && JSON.parse(store));
        } 
    },

    screenDimmer: function(bool) {
    document.getElementById('screenDimmer').style.display=(bool ? 'block' : 'none');
    document.getElementById('loadFlasher').style.display =(bool ? 'block' : 'none');
    },

    triggerRandom: function() {
        app.screenDimmer(true);
        var restArray = app.store('restArray');
        var maxDist;
        if(Boolean(restArray)){
            maxDist = restArray.findIndex(function(index){
                return index['distance'] > 5;
            });
        }
        var randInt = Math.floor(Math.random() * Math.floor(maxDist > 1 ? maxDist : restList.length));
        var winner = maxDist > 1 ? restArray[randInt] : restList[randInt];

        setTimeout(function() {app.popUpCard(winner)}, 3000);
    }
}

var view = {

    render: function() {
        //If there is address data in localStorage the page will load using that address
        //data and display the restuarants in order from closest to furthest from the 
        //stored (user's) address. Otherwise we will load the restuarants in the order they appear
        //in the master list. 
        
        mainList.innerHTML = '';
        //Determines whether or not to show 'Results near...' text 
        var userLoc = app.store('userLoc');
        if(Boolean(userLoc)) {
            searchInput = document.getElementById('searchInput');
            searchInput.placeholder = userLoc[2] ? userLoc[2] : 'Current Location';
        }

        //Set filter toggles from sessionStorage
        var settings = app.sessStore('settings');
        document.getElementById('onlineOnly').checked = settings['onlineOrder'];
        document.getElementById('deliveryOnly').checked = settings['delivery'];
        document.getElementById('patioToggle').checked = settings['patio'];
        
        view.populateList();
        view.renderFilter();
    },

    populateList: function() {
        app.screenDimmer(true);

        //Check is the pre-sorted restArray is in local storage
        //If not we will use the main restuarant list in it's original order.
        var restArray = app.store('restArray');
        if(!Boolean(restArray)) {
            var restArray = restList;
        }

        var mainListNodes = document.querySelectorAll('div.mainListChild');
        var mainListNodesLength = mainListNodes.length
        var indexSetter = mainListNodesLength;
        var resultsToShow = mainListNodesLength + 18;
        var mainList = document.getElementById('mainList');
        var settings = app.sessStore('settings');
        var filter = app.sessStore('filter');
        
        //Figure out where to begin when "Loading More". Basically looks at the node
        //list of the mainlist div and finds the id of the last restaurant in the list,
        //searches the array for the index of that restaurant by it's ID and returns the 
        //index. This way we can start populating more entries to the list 
        //from the ID where it left off. 
        if(indexSetter > 0) {
            indexSetter = restArray.findIndex(function(element, index){
                if(element['_id'] === mainListNodes[mainListNodesLength - 1]['id']) {
                    return index;
                }  
            }) + 1;
        }

        if(Boolean(filter)) {
            document.getElementById('pickRandomBtn').style.display = 'none';
            document.getElementById('clearFilter').style.display = ''; 
            document.getElementById('filterListP').innerHTML = 'Filters: ' + filter['filterArray'].join(', ');
            document.getElementById('filterListP').style.display = '';
        }
        
        for(indexSetter; mainList.children.length < resultsToShow; indexSetter++) {
            var rest = restArray[indexSetter];
        
            if(indexSetter < restArray.length) {    
                if(settings.delivery && !rest.delivery) {     
                    continue;
                }
                if(settings.onlineOrder && !rest.onlineOrder) {
                    continue;
                }
                if(settings.patio && !rest.patio) {
                    continue;
                } 
                if(Boolean(filter)) {
                    //Underscore function, intersection, returns an array of the items that were the same from each array.
                    if(!Array.isArray(rest['genre'])) {
                        rest['genre'] = [rest['genre']];
                    }
                    var matches = _.intersection(rest['genre'], filter['filterArray']);
                    if(matches.length < 1) {
                        continue;
                    }
                }
                
                //This creates and populates the template:
                //Grab the HTML from index.html file to use as the template string. Use the id 
                //of the script tag the HTML code resides in.
                var cardTemplate = document.getElementById("cardTemplate").innerHTML;
                //Setup the template by passing in the HTML we jut grabbed
                var templateFn = _.template(cardTemplate);
                
                //Creates a variable with the template populated using the values
                //from the JSON object you pass in here.
                var templateHTML = templateFn(rest);
                //Add the template to you HTML file similar to appendChild().
                //'mainList' define at the top of function.
                mainList.innerHTML += templateHTML;
            }else {
                console.log('end of list');
                break;
            }
        }   
        
        var loadMoreDivs = document.getElementsByClassName('loadMoreDiv');
        for(var i = 0; i < loadMoreDivs.length; i++) {
            if(indexSetter < restArray.length) {
                loadMoreDivs[i].style.display = '';
            } else {
                loadMoreDivs[i].style.display = 'none';
            }
        }   
        app.screenDimmer(false);
    },

    renderFilter: function() {
        var filterBody = document.getElementById('filterBody');
        filterBody.innerHTML = '';
        var filterArray = ['American','Asian','BBQ','Breakfast','Burgers','Cajun/Creole','Chinese','Crawfish','Desserts','Greek','Italian','Japanese','Lebanese','Mexican','Pizza','Salads','Sandwiches','Seafood','Southern','Sushi','Thai','Vietnamese','Wings'];
       
        //Same underscore template process as populateList()
        //Populates the main filter
        filterArray.forEach(function(item) {
            item = {"type":item};
       
            var filterTemplate = document.getElementById('filterTemplate').innerHTML;
            var templateFn = _.template(filterTemplate);

            var templateHTML = templateFn(item);
            filterBody.innerHTML += templateHTML;
        });
        //Populates the cuisine type in the add restaurant modal
        var addRestModalCuisine = document.getElementById('cusineList');
        addRestModalCuisine.innerHTML = '';
        
        filterArray.forEach(function(item) {
            item = {"type":item};
       
            var filterTemplate = document.getElementById('restCuisineType').innerHTML;
            var templateFn = _.template(filterTemplate);

            var templateHTML = templateFn(item);
            addRestModalCuisine.innerHTML += templateHTML;
        });
    },

    filterList: function() {
        var filterObj = {
            filterArray: []
        };
        
        items = document.getElementsByClassName('filterCheck');
        for(var i= 0; i < items.length; i++) {
            if(items[i]['checked']){
                filterObj['filterArray'].push(items[i].value);
            }
        }
        
        if(filterObj['filterArray'].length < 1) {
            return;
        }

        app.sessStore('filter', filterObj);
        view.render();
    },

    clearFilters: function() {
        window.sessionStorage.removeItem('filter');
        document.getElementById('clearFilter').style.display = 'none';
        document.getElementById('filterListP').style.display = 'none';
        document.getElementById('pickRandomBtn').style.display = '';
        view.render(); 
    },
}
app.init();
