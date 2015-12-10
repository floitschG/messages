---
title: Error messages in Dart tools.
layout: page
---

<div id='list'></div>

<script src="parser.js">
<script>
var dbUrl = 'https://raw.githubusercontent.com/dart-lang/sdk/master/pkg/compiler/lib/src/diagnostics/dart2js_messages.dart';
document.title = id;

function reqListener () {
  var data = parseMessages(this.responseText);
  var target = document.querySelector('#list');
  var list = document.createElement('ul');
  target.addChild(list);
  var ids = Object.keys(data);
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    var item = document.createElement('li');
    var link = document.createElement('a');
    a.href = 'details/' + id + '.html';
    a.textContent = id + ": " + data[id].template;
    item.appendChild(a);
    list.appendChild(item);
  }
}
var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", "ids.json");
oReq.send();
</script>
