// Copyright 2012-2014 (c) Peter Širka <petersirka@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var counter=0;var ip={};var ban={};var ban_length=0;var interval=0;exports.install=function(){framework.onRequest=function(req,res){if(ban_length>0&&ban[req.ip]){req.connection.destroy();return true}var count=(ip[req.ip]||0)+1;ip[req.ip]=count;if(count===1)counter++;if(count<exports.options.maximum)return false;ban[req.ip]=exports.options.minutes+1;ban_length++;return true};setInterval(function(){interval++;var keys;var length;var count;if(ban_length>0&&interval%60===0){keys=Object.keys(ban);length=keys.length;count=0;for(var i=0;i<length;i++){var key=keys[i];if(ban[key]-->0)continue;ban_length--;delete ban[key]}if(ban_length<0)ban_length=0}if(counter<=0)return;keys=Object.keys(ip);length=keys.length;counter=length;for(var i=0;i<length;i++){var key=keys[i];var count=ip[key]--;if(count>0)continue;counter--;delete ip[key]}if(counter<0)counter=0},1e3)};exports.usage=function(){return{bans:ban_length}};exports.options={maximum:1e3,minutes:5};