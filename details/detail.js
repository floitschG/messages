var url = window.location.pathname
var id = /\/([^\/]+)\.html$/.exec(url)[1];
document.title = id;

var dbUrl = 'https://raw.githubusercontent.com/dart-lang/sdk/master/pkg/compiler/lib/src/diagnostics/dart2js_messages.dart';

function reqListener () {
  var data = parseMessages(this.responseText);
  var names = Object.keys(data);
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    if (data[name].id == id) {
      var details = data[name];
      document.title = id + " - " + name;
      var templateDiv = document.querySelector('#template');
      templateDiv.textContent = details.template;
      if (details.howToFix) {
        var howToFixDiv = document.querySelector('#howToFix');
        howToFixDiv.textContent = details.howToFix;
      }
      break;
    }
  }
}
var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", dbUrl);
oReq.send();
