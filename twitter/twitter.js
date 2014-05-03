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

var crypto=require("crypto");var qs=require("querystring");function Twitter(apiKey,apiSecret,accessToken,accessSecret){this.apiKey=apiKey;this.apiSecret=apiSecret;this.accessToken=accessToken;this.accessSecret=accessSecret}Twitter.prototype.create=function(obj){var keys=Object.keys(obj);var length=keys.length;var builder=[];keys.sort();for(var i=0;i<length;i++){var key=keys[i];builder.push(key+'="'+escape(obj[key])+'"')}return builder.join(", ")};Twitter.prototype.signature=function(method,url,params){var self=this;var keys=Object.keys(params);var builder=[];var key=encodeURIComponent(self.apiSecret)+"&"+encodeURIComponent(self.accessSecret);keys.sort();var length=keys.length;for(var i=0;i<length;i++)builder.push(keys[i]+"%3D"+encodeURIComponent(params[keys[i]]));var signature=method+"&"+encodeURIComponent(url)+"&"+builder.join("%26");return crypto.createHmac("sha1",key).update(signature).digest("base64")};Twitter.prototype.request=function(method,url,params,callback,redirect){var headers={};var oauth={};var self=this;var data="";oauth["oauth_consumer_key"]=self.apiKey;if(redirect)oauth["oauth_callback"]=redirect;oauth["oauth_token"]=self.accessToken;oauth["oauth_signature_method"]="HMAC-SHA1";oauth["oauth_timestamp"]=Math.floor((new Date).getTime()/1e3).toString();oauth["oauth_nonce"]=Utils.GUID(32);oauth["oauth_version"]="1.0";if(!params)params={};else data=qs.stringify(params);var keys=Object.keys(params);var length=keys.length;for(var i=0;i<length;i++)params[keys[i]]=encodeURIComponent(params[keys[i]]);params["oauth_consumer_key"]=oauth["oauth_consumer_key"];params["oauth_nonce"]=oauth["oauth_nonce"];params["oauth_signature_method"]=oauth["oauth_signature_method"];params["oauth_timestamp"]=oauth["oauth_timestamp"];params["oauth_version"]=oauth["oauth_version"];params["oauth_token"]=oauth["oauth_token"];oauth["oauth_signature"]=self.signature(method,url,params);headers["Authorization"]="OAuth "+self.create(oauth);Utils.request(url,method,data,function(err,data){if(callback)callback(err,JSON.parse(data))},headers)};module.exports.Twitter=Twitter;module.exports.create=function(apiKey,apiSecret,accessToken,accessSecret){return new Twitter(apiKey,apiSecret,accessToken,accessSecret)};