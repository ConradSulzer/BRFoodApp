function submitAddRestForm(){
    var cuisineArray = [];
    var cuisineClassChecked = $('.addRestCuisineType:checkbox:checked');
    for(var i = 0; i < cuisineClassChecked.length; i++){
        cuisineArray.push(cuisineClassChecked[i]['value']);
    }   

    function messageOff(id) {
        document.getElementById(id).style.display = 'none';
    }

    var restName = $('#restaurantName').val();
    var restAddress = $('#restAddress').val();
    var restCuisine = cuisineArray.join(', '); 


    if(restName.trim() == '' ){
        alert('Please enter restaurant name.');
        $('#restName').focus();
        return false;
    }else if(restAddress.trim() == '' ){
        alert('Please enter restaurant address.');
        $('#restAddress').focus();
        return false;
    }else if(restCuisine === ''){
        alert('Please select at least one cuisine type.');
        return false;
    }else{
        $.ajax({
            type:'POST',
            url:'https://www.brfoodapp.com/form/add_rest_form.php',
            data:'addRestFrmSubmit=1&restName='+restName+'&restAddress='+restAddress+'&restCuisine='+restCuisine,
            beforeSend: function () {
                $('.submitBtn').attr("disabled","disabled");
                $('.modal-body').css('opacity', '.5');
            },
            
            success:function(msg){
                if(msg == 'ok'){
                    $('#restaurantName').val('');
                    $('#restAddress').val('');
                    $('#restMessage').val('');
                    for(var i = 0; i < cuisineClassChecked.length; i++){
                        cuisineClassChecked[i]['checked']= false;
                    }
                    document.getElementById('addRestSuccessText').style.display = 'block';
                    setTimeout(function() {messageOff('addRestSuccessText')}, 3000);
                }else{
                    document.getElementById('addRestErrorText').style.display = 'block';
                    setTimeout(function() {messageOff('addRestErrorText')}, 3000);
                }
                $('.submitBtn').removeAttr("disabled");
                $('.modal-body').css('opacity', '');
            }
        });
    }
}