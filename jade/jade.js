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

global.jade=require("jade");var definition=function(){Controller.prototype.view=function(name,model,headers,isPartial){var self=this;var first=name[0];var skip=first==="~";if(!self.isLayout&&first!=="/"&&!skip){if(self.name!=="default"&&self.name[0]!=="#")name="/"+self.name+"/"+name}if(skip)name=name.substring(1);if(typeof isPartial===UNDEFINED&&typeof headers===BOOLEAN){isPartial=headers;headers=null}var filename=name;var prefix=self.prefix;var key="jade_"+name+"#"+prefix;var fn=self.cache.read(key);if(fn===null){var fs=require("fs");var ext=".jade";var isPrefix=prefix.length>0;var exists=fs.existsSync(self.path.views(filename+(isPrefix?"#"+prefix:"")+ext));if(!exists){if(isPrefix)exists=fs.existsSync(self.path.views(filename+ext))}else filename+=isPrefix?"#"+prefix:"";if(!exists){self.view500('View "'+name+'" not found.');return}var path=self.path.views(filename+ext);var options=utils.extend({filename:path},exports.options);var fn=jade.compile(fs.readFileSync(path).toString("utf8"),options);if(!self.config.debug&&fn!==null)self.cache.add(key,fn,(new Date).add("m",4));if(fn===null){self.view500('View "'+name+'" not found.');return}}if(isPartial)return fn(model);self.subscribe.success();if(self.isConnected){self.framework.responseContent(self.req,self.res,self.status,fn(model),"text/html",true,headers);self.framework.stats.response.view++}return self}};setTimeout(function(){framework.eval(definition)},100);