---
title: Error messages in Dart tools.
layout: page
---

<div id='list'></div>

<script src="parser.js"></script>
<script>
var dbUrl = 'https://raw.githubusercontent.com/dart-lang/sdk/master/pkg/compiler/lib/src/diagnostics/dart2js_messages.dart';

function reqListener () {
  var data = parseMessages(this.responseText);
  var target = document.querySelector('#list');
  var list = document.createElement('ul');
  target.appendChild(list);
  var names = Object.keys(data);
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var id = data[name].id;
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.href = 'details/' + id + '.html';
    link.textContent = id + ": " + data[name].template;
    item.appendChild(link);
    list.appendChild(item);
  }
}
var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", dbUrl);
oReq.send();
</script>
