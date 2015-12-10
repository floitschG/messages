// Copyright (c) 2015, the Dart project authors.  Please see the AUTHORS file
// for details. All rights reserved. Use of this source code is governed by a
// BSD-style license that can be found in the LICENSE file.

function parseMessages(str) {
  var result = {};
  var i;

  function cc() { return str.charCodeAt(i); }

  var SPACE = 32;
  var NL = 10;
  var SLASH = 47;
  var SQUOTE = 39;
  var DQUOTE = 34;
  var LBRACE = 123; // {
  var RBRACE = 125; // }
  var SEMICOLON = 59;
  var COMMA = 44;
  var LBRACKET = 91;
  var RBRACKET = 93;
  var BACK_SLASH = 92;
  var $r = 114;

  // Avoid infinite loops with bad data.
  var lastNonWhite = -1;
  var encounteredSameNonWhite = 0;

  // Moves to the next non-white position (skipping over eol-comments).
  function moveToNextNonWhite() {
    for (; i < str.length; i++) {
      var charCode = cc();
      if (charCode == NL || charCode == SPACE) {
        // Do nothing.
      } else if (charCode == SLASH && str.charCodeAt(i + 1) == SLASH) {
        // Consume until eol.
        while (cc() != NL) i++;
      } else {
        break;
      }
    }
    if (lastNonWhite == i) {
      if (encounteredSameNonWhite++ == 10)
      throw "bad input " + i;
    } else {
      encounteredSameNonWhite = 0;
      lastNonWhite = i;
    }
  }

  // Automatically concatenates adjacent string literals.
  function parseString() {
    var result;
    // str[i] == '"', str[i] == "'", or str[i] == "r".
    var allowEscapes = true;
    var startChar = cc();
    if (startChar == $r) {
      i++;
      startChar = cc();
      allowEscapes = false;
    }
    i++;
    if (cc() == startChar && str.charCodeAt(i + 1) != startChar) {
      // Empty string.
      result = '';
      i ++;
    } else {
      var isMultiline = false;
      if (cc() == startChar) {
        isMultiline = true;
        i += 2;
      }
      var startPos = i;
      for (; i < str.length; i++) {
        var charCode = cc();
        if (allowEscapes && charCode == BACK_SLASH) {
          // Ignore next character.
          i++;
          continue;
        }
        if (charCode == startChar &&
            (!isMultiline ||
             (str.charCodeAt(i + 1) == startChar &&
              str.charCodeAt(i + 2) == startChar))) {
          result = str.substring(startPos, i);
          i += isMultiline ? 3 : 1;
          break;
        }
      }
    }
    moveToNextNonWhite();
    // Another string ?.
    charCode = cc();
    if (charCode == SQUOTE || charCode == DQUOTE || charCode == $r) {
      result += parseString();
    }
    return result;
  }


  function parseValue() {
    var charCode = cc();
    if (charCode == SQUOTE || charCode == DQUOTE ||
       (charCode == $r &&
          (str.charCodeAt(i + 1) == SQUOTE ||
           str.charCodeAt(i + 1) == DQUOTE))) {
      return parseString();
    } else if (charCode == LBRACE) {
      return parseMap();
    } else if (charCode == LBRACKET) {
      return parseList();
    } else {
      // Assume it's something we don't support (like DONT_KNOW_HOW_TO_FIX).
      // Ignore and move to the end of the map.
      while (true) {
        var charCode = cc();
        if (charCode == RBRACE) break;
        if (charCode == RBRACKET) break;
        if (charCode == COMMA) break;
        i++
      }
      return null;
    }
  }

  function parseList() {
    var result = [];
    // str[i] == '['.
    i++;
    moveToNextNonWhite();
    while (cc() != RBRACKET) {
      result.push(parseValue());
      moveToNextNonWhite();
      if (cc() == COMMA) {
        i++;
        moveToNextNonWhite();
      }
    }
    i++;
    return result;
  }

  // Parse { 'id': ... }
  function parseMap() {
    var result = {};
    // str[i] == '{'.
    i++;
    moveToNextNonWhite();
    while (cc() != RBRACE) {  // "}"
      var key = parseString();
      moveToNextNonWhite();
      i++;  // The ":".
      moveToNextNonWhite();
      result[key] = parseValue();
      moveToNextNonWhite();
      if (cc() == COMMA) {
        i++;
        moveToNextNonWhite();
      }
    }
    i++;
    return result;
  }

  // Skip header.
  var start = "\nfinal Map<String, Map> MESSAGES = {";
  var messagesPos = str.indexOf(start);
  for (i = messagesPos + start.length; i < str.length; moveToNextNonWhite()) {
    var charCode = cc();
    if (charCode == SQUOTE || charCode == DQUOTE) { // '"' or "'"
      var name = parseString();
      moveToNextNonWhite();
      i++; // The ":".
      moveToNextNonWhite();
      var data = parseMap();
      result[name] = data;
      moveToNextNonWhite();
      i++; // The trailing "," or the trailing "}".
    } else if (charCode == RBRACE || charCode == SEMICOLON) { // "}" or ";".
      break;
    }
  }
  return result;
}

var request = new XMLHttpRequest();
request.addEventListener("load", function() {
  console.log(parseMessages(this.responseText));
});
request.open("GET", "http://localhost:8000/dart2js_messages.dart");
request.send();
