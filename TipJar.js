// The maximum length of a tip.
var maxCharCount = 140;

// A list of banal placeholder tips to help liven up the UI.
// We'll show random ones as placeholder text in our input field.
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

// The HTML for our alert elements, parameterized.
var baseAlertString = " \
        <div class='container $class$'> \
            <div class='row'> \
                <div class='col text-center align-self-center py-3'> \
                    $content$ \
                </div> \
            </div> \
        </div>";

// The HTML for our alert elements, with parameters replaced.
function buildAlertString (alertClass, alertContent) {
    return baseAlertString.replace('$class$', alertClass).replace('$content$', alertContent);
}

// Our alert elements, originally detached from the DOM.
var $alertSuccess = $(buildAlertString('alert-success',
    '<h2>Thanks for the tip!</h2>'));
var $alertError = $(buildAlertString('alert-error',
    '<h2>Uh-oh, something went wrong. :-(</h2><h2>Please try again.</h2>'));

// Cached jQuery objects of general interest in this script.
var $body, $input, $charCount, $progressBar;

// Run this when the document is finished loading.
// Factored this way for testability.
function onReady() {

    // Populate our cached jQuery objects, or use test-doubles.
    $body = $('#body').length ? $('#body') : $('<body></body>');
    $input = $('#input-tip').length ? $('#input-tip') : $('<input />');
    $charCount = $('#char-count').length ? $('#char-count') : $('<div></div>');
    $progressBar = $('#progress-bar').length ? $('#progress-bar') : $('<div></div>');

    // Setup the input field.
    $input.attr('maxlength', maxCharCount);
    doResetInput();

    // Update the character count UI with each keystroke.
    $input.keyup(function(event) {
        doCharCount();
    });

    // Submit on Enter. This is a single-line input field, so both LF and CR should submit.
    $input.keydown(function(event) {
        if (10 == event.which || 13 == event.which) {
            doTipJar();
            return false;
        } 
    });
} $(document).ready(onReady);

// Reset the input field to its enabled state.
function doResetInput() {
    $input.removeAttr('disabled');
    doRandomTipPlaceholder();
    $input.val('');
    doCharCount();
    $input.focus();
}

// Update the random tip placeholder.
function doRandomTipPlaceholder() {
    $input.attr('placeholder',
        listOfPlaceholderTips[Math.floor(Math.random() * listOfPlaceholderTips.length)]);
}

// Update the character count UI.
function doCharCount() {
    var charCount = $input.val() ? $input.val().length : 0;

    $charCount.text(maxCharCount - charCount);

    if (charCount >= maxCharCount * 0.80) {
        $charCount.css('color', 'red');
    } else if (charCount >= maxCharCount * 0.50) {
        $charCount.css('color', 'orange');
    } else {
        $charCount.css('color', 'green');
    }
}

// Update the progress bar.
function doProgressBar(percent) {
    $progressBar.css('width', percent +'%');
}

// Update the progress bar as upload and download progress.
function xhr() {
    var xhr = new window.XMLHttpRequest();

    xhr.upload.addEventListener('progress', function(event) {
        if (event.lengthComputable) {
            doProgressBar(event.loaded / event.total * 50);
        }
    }, false);

    xhr.addEventListener('progress', function(event) {
        if (event.lengthComputable) {
            doProgressBar(50 + event.loaded / event.total * 50);
        }
    }, false);

    return xhr;
}

// Show a UI alert.
function doShowAlert($alert) {
    var duration = 1000; // 1 second

    $body.append($alert);
    $alert.hide();
    $alert.css('top', -1 * $(window).height() / 2 - $alert.height() / 2);
    $alert.fadeIn(duration, function() {
        $progressBar.css('width', 0);
    });
    
    $alert.delay(duration);

    $alert.fadeOut(duration, function() {
        doResetInput();        
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