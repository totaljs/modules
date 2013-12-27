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

var fs=require("fs");function Storage(){this.framework=null;this.repository={};this.repositoryTimeout=null}Storage.prototype.onLoad=function(){var self=this;fs.readFile(self.framework.path.root("storage"),function(err,data){if(err)return;try{self.repository=JSON.parse(data)}catch(err){}})};Storage.prototype.onSave=function(){var self=this;fs.writeFile(self.framework.path.root("storage"),JSON.stringify(self.repository),utils.noop)};Storage.prototype.set=function(name,value){var self=this;if(typeof value!=="function"){self.repository[name]=value;self._save();return}self.repository[name]=value(self.repository[name]);return self};Storage.prototype.get=function(name,def){return this.repository[name]||def};Storage.prototype.remove=function(name){var self=this;delete self.repository[name];self._save();return self};Storage.prototype.clear=function(){var self=this;self.repository={};self._save();return self};Storage.prototype.refresh=function(){var self=this;clearTimeout(self.repositoryTimeout);self.onLoad();return self};Storage.prototype._save=function(){var self=this;clearTimeout(self.repositoryTimeout);self.repositoryTimeout=setTimeout(function(){self.onSave();if(typeof process.send==="function"){setTimeout(function(){process.send("storage")},1e3)}},500)};framework.helpers.storage=function(name,def){return this.framework.module("framework").get(name,def)||""};module.exports=new Storage;module.exports.install=function(framework){this.framework=framework;this.refresh()};