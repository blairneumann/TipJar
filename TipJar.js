var maxCharCount = 140;

var listOfPlaceholderTips = [
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

function buildAlertString (alertClass, alertContent) {
    return " \
        <div class='container $class$'> \
            <div class='row'> \
                <div class='col text-center align-self-center py-3'> \
                    $content$ \
                </div> \
            </div> \
        </div>".replace("$class$", alertClass).replace("$content$", alertContent);
}

var $alertSuccess = $(buildAlertString("alert-success",
    "<h2>Thanks for the tip!</h2>"));
var $alertError = $(buildAlertString("alert-error",
    "<h2>Uh-oh, something went wrong. :-(</h2><h2>Please try again.</h2>"));

$(document).ready(function() {
    var $input = $('#input-tip');

    // Setup the input field
    $input.attr('maxlength', maxCharCount);
    doResetInput($input);

    // Update the character count UI with each keystroke
    $input.keyup(function(event) {
        doCharCount($input);
    });

    // Submit on Enter
    $input.keydown(function(event) {
        if (10 == event.which || 13 == event.which) {
            doTipJar();
            return false;
        } 
    });
});

// Reset the input field
function doResetInput($input) {
    $input.removeAttr('disabled');
    doRandomTipPlaceholder($input);
    $input.val('');
    doCharCount($input);
    $input.focus();
}

// Update the random tip placeholder
function doRandomTipPlaceholder($input) {
    $input.attr('placeholder',
        listOfPlaceholderTips[Math.floor(Math.random() * listOfPlaceholderTips.length)]);
}

// Update the character count UI
function doCharCount($input) {
    var $charCount = $('#char-count');
    var charCount = $input.val().length;

    $charCount.text(maxCharCount - charCount);

    if (charCount >= maxCharCount * 0.80) {
        $charCount.css('color', 'red');
    } else if (charCount >= maxCharCount * 0.50) {
        $charCount.css('color', 'orange');
    } else {
        $charCount.css('color', 'green');
    }
}

// Update the progress bar
function doProgressBar(percent) {
    $('#progress-bar').css('width', percent +'%');
}

// Update the progress bar as upload progresses
function xhr() {
    var xhr = new window.XMLHttpRequest();

    xhr.upload.addEventListener("progress", function(event) {
        if (event.lengthComputable) {
            doProgressBar(event.loaded / event.total * 100);
        }
    }, false);

    return xhr;
}

// Show a UI alert
function doShowAlert($alert) {
    var $input = $('#input-tip');
    var duration = 1000; // 1 second

    $('body').append($alert);
    $alert.hide();
    $alert.css('top', -1 * $(window).height() / 2 - $alert.height() / 2);
    $alert.fadeIn(duration, function() {
        $('#progress-bar').css('width', 0);
    });
    
    $alert.delay(duration);

    $alert.fadeOut(duration, function() {
        doResetInput($input);        
        $alert.detach();
    });
}

// On AJAX Success
function onSuccess(result, status, xhr) {
    doShowAlert($alertSuccess);
}

// On AJAX Error
function onError(xhr, status, error) {
    doShowAlert($alertError);
}

// Submit 
function doTipJar() {
    var $input = $('#input-tip');
    var tip = $input.val().trim();

    if (!tip.length) {
        doResetInput($input);
        return;
    }

    $input.blur();
    $input.attr('disabled', 'disabled');

    doProgressBar(0);

    $.ajax({
        type: 'POST',
        url: 'https://pmrv6ztoi5.execute-api.us-west-2.amazonaws.com/prod',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ tip : tip }),
        xhr: xhr,
        success: onSuccess,
        error: onError,
    });
}