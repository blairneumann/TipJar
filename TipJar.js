var maxCharCount = 140;

var listOfTips = [
    "Don't run with scissors.",
    "Look both ways before crossing the street.",
    "Don't forget to feet the cat.",
    "Wear a jacket or you'll catch a cold.",
    "Stay in school.",
    "Wait at least one hour after eating before you swim.",
    "Always wear underwear.",
    "Cover your mouth when you sneeze.",
    "Make new friends, but keep the old.",
    "Always treat others the way you want to be treated.",
];

$(document).ready(function() {

    // Setup our Success and Error elements
    doHide($('#success'));
    doHide($('#error'));

    // Set a random tip placeholder
    doTipPlaceholder();

    // Setup the character count UI
    $('#input-tip').attr('maxlength', maxCharCount);
    doCharCount();

    // Update the character count UI with each keystroke
    $('#input-tip').keyup(function(event) {
        doCharCount();
    });

    // Submit on Enter
    $('#input-tip').keydown(function(event) {
        if (10 == event.which || 13 == event.which) {
            doTipJar();
            return false;
        } 
    });
});

// Update the random tip placeholder
function doTipPlaceholder() {
    $('#input-tip').attr('placeholder', listOfTips[Math.floor(Math.random() * listOfTips.length)]);
}

// Update the character count UI
function doCharCount() {
    var charCount = $('#input-tip').val().length;

    $('#char-count').text(maxCharCount - charCount);

    if (charCount >= maxCharCount * 0.80) {
        $('#char-count').css('color', 'red');
    } else if (charCount >= maxCharCount * 0.50) {
        $('#char-count').css('color', 'orange');
    } else {
        $('#char-count').css('color', 'green');
    }
}

// Hide an element
function doHide(element) {
    element.hide();
}

// Position element
function doPosition(element) {
    element.css('top', -1 * $(window).height() / 2 - element.height() / 2);
}

// Show an element
function doShow(element) {
    doPosition(element);

    element.fadeIn("slow");
    element.delay(2000);
    element.fadeOut("slow");   
}

// On AJAX Success
function onSuccess() {
    doShow($('#success'));
}

// On AJAX Error
function onError() {
    doShow($('#error'));
}

// Submit 
function doTipJar() {
    var tip = $('#input-tip').val().trim();

    $('#input-tip').val('');
    doTipPlaceholder();
    doCharCount();
    
    if (!tip.length)
        return;

    $.ajax({
        type: 'POST',
        url: 'https://pmrv6ztoi5.execute-api.us-west-2.amazonaws.com/prod',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ tip : tip }),
        success: onSuccess,
        error: onError,
    });
}