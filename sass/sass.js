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

var sass=require("node-sass");exports.install=function(framework){framework.file("SCSS",scss_compiler);var accept=framework.config["static-accepts"];if(accept.indexOf(".scss")===-1)accept.push(".scss");framework.onCompileCSS=function(filename,content){return sass.renderSync({data:content,outputStyle:"compressed"})};framework.helpers.sass=function(name,tag){var self=this;var url=self.framework._routeStatic(name,self.config["static-url-css"]);return tag||true?'<link type="text/css" rel="stylesheet" href="'+url+'" />':url}};function scss_compiler(req,res,isValidation){if(isValidation)return req.url.indexOf(".scss")!==-1||req.url.indexOf(".sass")!==-1;var self=this;var filename=self.path.temp(req.url.replace(/\//g,"-").substring(1));if(framework.isProcessed(filename)){self.responseFile(req,res,filename);return}fs.readFile(self.path.public(req.url),function(err,data){if(err){self.response404(req,res);return}var css=sass.renderSync({data:content,outputStyle:"compressed"});fs.writeFileSync(filename,css);self.responseFile(req,res,filename)})}