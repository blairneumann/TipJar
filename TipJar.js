function doTipJar() {
    var data = {
        tip: $('#input-tip').val(),
    };
    
    $.ajax({
        type: 'POST',
        url: 'https://pmrv6ztoi5.execute-api.us-west-2.amazonaws.com/prod',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function () {
            $('#input-tip').val('');
        },
        error: function () {
            alert('Uh-oh, something went wrong putting a tip in the tip jar. :-(');
        }
    });
}