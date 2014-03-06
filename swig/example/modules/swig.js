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

global.swig=require("swig");var definition=function(){swig.setDefaults({cache:!framework.config.debug});Controller.prototype.view=function(name,model,headers,isPartial){var self=this;var first=name[0];var skip=name[0]==="~";if(!self.isLayout&&!skip)name=self._currentView+name;if(skip)name=name.substring(1);if(typeof isPartial===UNDEFINED&&typeof headers===BOOLEAN){isPartial=headers;headers=null}var output=swig.renderFile(directory+self.path.views(name+".html").substring(1),model);if(isPartial)return output;if(!self.isConnected)return self;self.subscribe.success();self.framework.responseContent(self.req,self.res,self.status,output,"text/html",true,headers);self.framework.stats.response.view++;return self}};setTimeout(function(){framework.eval(definition)},100);