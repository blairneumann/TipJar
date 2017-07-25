# TipJar
> "You can't put money in this Tip Jar, but you can use it to provide the website author with tweet-length pieces of advice."

## Overview
Tip Jar is a simple full-stack web development exercise. The front-end web site is hosted on [**AWS S3**][S3.static] and designed to be _responsive_ and _mobile-first_, while the back-end is implemented using [**Node.js** on **AWS Lambda**][Lambda.Node]. Tips that are successfully submitted are delivered immediately to the website author via email. Functionality is simple so that I can focus on engineering first.

**_Note:_** *Code samples in this file may be simplified from their actual implementations for clarity.*

## Front-End
The front-end consists of three pages: the [`Main Page`][index.html], the [`Error Page`][error.html], and the [`Readme Page`][readme.html].

### Main Page
The front-end main page itself is straightforward, with just a few lines of static text, a textbox for user input, character count UI, and a couple of dynamic overlays to report the success or failure of submitted tips.

The main page is implemented using [**Bootstrap 4**][bootstrap] for responsiveness with custom [**SCSS**][scss] and [**jQuery**][jquery] in support. The **Bootstrap** grid is used sparingly. I used the [**Device Mode**][chrome.device] emulators in the [**Chrome**][chrome.browser] browser's [**developer tools**][chrome.devtools] to simulate various practical displays.

A couple [**Font Awesome**][font-awesome] icons add a little flourish to the page. Surprisingly, **Font Awesome** doesn't include a glyph for the Enter key, so I improvised by rotating another glyph to play the part.

```html
<span class="fa fa-level-down fa-rotate-90"></span>
```

[**CSS**][css] is used to space the page vertically to always occupy the full viewport. An [**SCSS**][scss] mixin is used to enforce a consistent look and feel between the `Success` and `Error` alert overlays as follows.

```scss
@mixin alert-box($background-color, $border-color) {
    position: relative;
    background-color: $background-color;
    border: 2px solid $border-color;
    border-radius: 8px;
}

.container.alert-success {
    @include alert-box(lightgreen, green);
}

.container.alert-error {
    @include alert-box(lightcoral, red);
}
```
### jQuery

[**jQuery**][jquery] implements all dynamic features of the site, including the character count UI, "Hit Enter to Submit" behavior, AJAX POST, progress bar, and reporting `Success` and `Error` through the alert overlays.

#### Character Count UI
The maximum number of characters for our tips is 140 (the same number of characters as a tweet, for no particular reason). We recalculate the character count with each keystroke, including color coding as we approach the max length.

```javascript
var maxCharCount = 140;

$(document).ready(function() {
	$('#input-tip').attr('maxlength', maxCharCount);
	doCharCount();
	
	$('#input-tip').keyup(function(event) {
		doCharCount();
	});
});

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
```

#### "Hit Enter to Submit"
We test every keystroke to see if it's the Enter or Return key that's being pressed. (Technically, we test for `newline` and `carriage return`: because this is a single-line input field, `newline` should submit the same as `carriage return` should.) We call our workhorse `doTipJar` function and `return false`, which tells the **jQuery** runtime to both stop processing this event and suppress its default behavior.

```javascript
$(document).ready(function() {
	$('#input-tip').keydown(function(event) {
		if (10 == event.which || 13 == event.which) {
			doTipJar();
			return false;
		} 
	});
});
```

#### AJAX POST
`doTipJar()` is the workhorse function that's invoked every time you "Hit Enter to Submit". We test to make sure that we have meaningful input, then disable the input field and initialize our progress bar before using `AJAX` to `POST` the tip to an [**AWS API Gateway**][API-Gateway] endpoint.

```javascript
function doTipJar() {
  var tip = $('#input-tip').val().trim();

  if (!tip.length) {
      doResetInput();
      return;
  }

  $('#input-tip').blur();
  $('#input-tip').attr('disabled', 'disabled');

  doProgressBar(0);
	
  $.ajax({
    type: 'POST',
    url: '<AWS API Gateway URL>',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({ tip : tip }),
    success: onSuccess,
    error: onError,
  });
}
```

#### Progress Bar
A simple progress bar indicates to the user where we are in the process of submitting their tip. The input field is disabled while the tip submission is in-process, and this process can sometimes take a few seconds, so it's important to give the user some kind of indication of what's happening so that they know what to expect. 

There are two steps to every tip submission: upload of the submission and download of the response. We show progress from 0 to 50% on upload and 50% to 100% on download. There may be a pause while the [**AWS** back-end][AWS] is processing the submission, and the progress bar is sitting at 50% during that pause, establishing user expectation that more progress is forthcoming.

We show one of our alert overlays (`Success` or `Error`, see next) as soon as the progress bar hits 100% indicating response download complete.

```javascript
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
```

#### Alert Overlays: Success or Error
Two alert overlay elements are dynamically generated when the page loads to indicate whether a tip was submitted successfully or not. Both are initially detached from the document but live within the same **Bootstrap** context when displayed in order to help maintain the overall mobile-first, reponsive look and feel. We use **jQuery** to attach and detach these alerts, and to animate showing and hiding them.

```javascript
var baseAlertString =
        '<div class=\'container $class$\'>' +
            '<div class=\'row\'>' +
                '<div class=\'col text-center align-self-center py-3\'>' +
                    '$content$' +
                '</div>' +
            '</div>' +
        '</div>';

function buildAlertString(alertClass, alertContent) {
    return baseAlertString
        .replace('$class$', alertClass)
        .replace('$content$', alertContent);
}

var $alertSuccess = $(buildAlertString('alert-success',
    '<h2>Thanks for the tip!</h2>'));
var $alertError = $(buildAlertString('alert-error',
    '<h2>Uh-oh, something went wrong. :-(</h2><h2>Please try again.</h2>'));

function onSuccess() {
    doShowAlert($alertSuccess);
}

function onError() {
    doShowAlert($alertError);
}

function doShowAlert($alert) {
    $('#body').append($alert);
    $alert.hide();
    $alert.css('top', -1 * $(window).height() / 2 - $alert.height() / 2);
    $alert.fadeIn(alertDuration * 0.3, function() {
        $('#progress-bar').css('width', 0);
    });

    $alert.delay(alertDuration * 0.4);

    $alert.fadeOut(alertDuration * 0.3, function() {
        doResetInput();
        $alert.detach();
    });
}
```

### Error Page
The front-end [`Error Page`][error.html] is very simple, with just a few lines of static text, and is implemented with the same [**Bootstrap 4**][bootstrap] as our [`Main Page`][index.html] to maintain a consistent look and feel. 

[**Font Awesome**][font-awesome] adds a little flourish:

```html
<p>Did you mean to go <a href="/"><span class="fa fa-home"></span> here</a>?</p>
```

### Readme Page
Depending on where you are, you may be reading our [`Readme Page`][readme.html] right now. It's basically the same [README.md][github.readme] markdown from our [**GitHub** project][github.project] re-hosted as web page content. We use [**jQuery**][jquery] and [**markdown.js**][markdown] to dynamically convert from markdown to HTML markup as follows.

```html
<html>
  <head>
    <script src="jquery.min.js"></script>
    <script src="markdown.js"></script>
    <script>
      $(document).ready(function() {
        $.get('README.md', function(data, status) {
          $('#readme')[0].innerHTML = markdown.toHTML(data);
        });
      });
    </script>
    
    <title>Tip Jar &ndash; README.md</title>
  </head>
  <body>
    <div id="readme"></div>
  </body>
</html>
```

## Back-End
The Tip Jar back-end system is implemented entirely using [**Amazon Web Services (AWS)**][AWS], including [**S3 static website hosting**][S3.static], [**API gateway**][Lambda.Gateway] with [**Lambda and Node.js**][Lambda.Node], with support from **Simple Email Service (SES)** and **Identity Access Manager (IAM)**.

### API Gateway + AWS Lambda
[**API Gateway**][API-Gateway] defines the web services URL that we POST to from our AJAX call (see above). That URL is configured to invoke an [**AWS Lambda**][Lambda.Gateway] function with is implemented using [**Node.js**][Lambda.Node] as follows.

```javascript
var AWS = require('aws-sdk');
var SES = new AWS.SES;

exports.handler = function(event, context, callback) {
    var params = {
        Source: process.env.SOURCE,
        Destination: {
            ToAddresses: [ process.env.DESTINATION ],
        },
        Message: {
            Subject: {
                Charset: 'UTF-8',
                Data: 'Tip Jar: You have a new tip in the Tip Jar!',
            },
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: 'Tip: ' + event.tip,
                },
            },
        },
    };

    var email = SES.sendEmail(params, function(err, data) {
        if (err) {
            callback('Send Mail Failed', null);
        } else {
            callback(null, 'Send Mail Succeeded');
        }
    });
};
```

This **Node.js** **Lambda** function sends each tip to the website author using the [**AWS Simple Email Service (SES)**][SES]. The To and From on that email are set via environment variables for privacy. The **Lambda** function is granted permission to send email (and to log, not shown above) via [**IAM**][IAM], and **SES** has permission to use my email address because I verified that I own that address.

## Engineering System
The engineering system for the [Tip Jar][index.html] website is perhaps what I'm most proud of. I had never published a production website prior to this exercise, and I had a lot to learn to get there, which I managed to do in what I consider pretty good time (1-2 weeks). 

I used [**Node Package Manager (NPM)**][NPM.script] scripts to drive website development overall. Significant dependencies include the following. You can find this project's complete [package.json][github.package.json] on our [project **GitHub** page][github.project].

| Front-End | Runtime | Validation | Deployment |
|:---:|:---:|:---:|:---:|
| [bootstrap] | [lite-server] | [mocha] | [rimraf] |
| [jquery][jquery.npm] | [node-sass] | [chai] | [copyfiles] |
| [font-awesome] | [onchange] | [eslint] | [usemin] |
| [markdown] | | [w3cjs] | [htmlmin] |
| | | | [cssmin] |

## Hosting & Deployment
The [Tip Jar][index.html] website, including its main page and all support files, is hosted on [**AWS S3**][S3.static], which doubles as a cost-effective web hosting service for static websites like ours. Nevermind that our page includes dynamic content, it is served as static content, with all dynamic behaviors performed on the client-side or via subsequent web services calls.

The site consists of one S3 bucket with Static Website Hosting enabled. I use the [**AWS S3 CLI**][S3.CLI] to deploy the site with public read-only permissions.

## Conclusion
This project provided me with an opportunity to exercise some basic full-stack web development best practices within a limited but practical scope. I was forced to work through a number of relatively minor issues at various stages of the project, which helped me learn and build confidence as a full-stack web developer.

[github.project]: https://github.com/blairneumann/TipJar
[github.package.json]: https://github.com/blairneumann/TipJar/blob/master/package.json
[github.readme]: https://github.com/blairneumann/TipJar/blob/master/README.md
[index.html]: http://blairneumann-tipjar.s3-website-us-west-2.amazonaws.com/index.html
[error.html]: http://blairneumann-tipjar.s3-website-us-west-2.amazonaws.com/error.html
[readme.html]: http://blairneumann-tipjar.s3-website-us-west-2.amazonaws.com/readme.html
[Bootstrap]: https://v4-alpha.getbootstrap.com/getting-started/introduction/
[jQuery]: http://api.jquery.com/
[CSS]: https://www.w3.org/Style/CSS/Overview.en.html
[SCSS]: http://sass-lang.com/
[AWS]: https://aws.amazon.com/
[S3.static]: http://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html
[Lambda.Gateway]: http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html
[Lambda.Node]: http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html
[S3.CLI]: http://docs.aws.amazon.com/cli/latest/userguide/using-s3-commands.html
[API-Gateway]: https://aws.amazon.com/api-gateway/
[SES]: https://aws.amazon.com/ses/
[IAM]: https://aws.amazon.com/iam/
[NPM.script]: https://docs.npmjs.com/misc/scripts
[bootstrap]: https://v4-alpha.getbootstrap.com/getting-started/introduction/
[jquery.npm]: https://www.npmjs.com/package/jquery
[lite-server]: https://github.com/johnpapa/lite-server
[mocha]: https://mochajs.org/
[rimraf]: https://github.com/isaacs/rimraf
[font-awesome]: http://fontawesome.io/
[node-sass]: https://github.com/sass/node-sass
[chai]: http://chaijs.com/
[copyfiles]: https://www.npmjs.com/package/copyfiles
[markdown]: https://www.npmjs.com/package/markdown
[onchange]: https://www.npmjs.com/package/onchange
[eslint]: http://eslint.org/
[usemin]: https://www.npmjs.com/package/usemin
[w3cjs]: https://github.com/thomasdavis/w3cjs
[htmlmin]: https://www.npmjs.com/package/htmlmin
[cssmin]: https://www.npmjs.com/package/cssmin
[chrome.browser]: https://www.google.com/chrome/index.html
[chrome.devtools]: https://developer.chrome.com/devtools
[chrome.device]: https://developers.google.com/web/tools/chrome-devtools/device-mode/
