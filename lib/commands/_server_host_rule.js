// Generated by CoffeeScript 1.4.0

/*
# 指定 http 代理端口
http_port 10180
# 指定 https 代理端口
https_port 10430
# 指定 host 
127.0.0.1 qunarzz.com
# rewrite host 目录 
proxy_pass http://qunarzz.com/home/(.*)   http://119.254.124.13/$1
*/


(function() {
  var Matcher, Rule, sysurl, utils;

  utils = require('../util');

  sysurl = require('url');

  Rule = (function() {

    function Rule(_list) {
      var h, ip, line, _i, _j, _len, _len1, _ref;
      this._list = _list;
      this.config = {};
      this.proxy_pass_hosts = {};
      this.ip_hosts = {};
      _ref = this._list;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        line = line.trim();
        if (line.charAt(0) === "#") {
          continue;
        }
        line = line.replace(/\s+/g, ' ').split(' ');
        switch (line[0]) {
          case "https_port" || "http_port":
            this.config[line[0]] = line[1];
            break;
          case "proxy_pass":
            this.proxy_pass_hosts[line[1]] = line[2];
            break;
          default:
            ip = line.shift();
            for (_j = 0, _len1 = line.length; _j < _len1; _j++) {
              h = line[_j];
              this.ip_hosts[h] = this.ip_hosts[h] || [];
              this.ip_hosts[h] = ip;
            }
        }
      }
    }

    Rule.prototype.match = function(uri) {
      var m, reg_host, rep_host, _m, _ref, _u;
      _m = new Matcher(uri);
      _m.to = "http://" + this.ip_hosts[uri.host];
      _ref = this.proxy_pass_hosts;
      for (reg_host in _ref) {
        rep_host = _ref[reg_host];
        m = uri.href.match(reg_host);
        if (m) {
          _m.regmatcher = m;
          _m.ret = rep_host;
          _u = sysurl.parse(rep_host);
          _m.to = _u.protocol + "//" + _u.host;
          break;
        }
      }
      return _m;
    };

    return Rule;

  })();

  Rule.load = function(path) {
    var host_config_path;
    host_config_path = utils.path.join(utils.path.get_user_home(), "fekit.hosts");
    if (utils.path.exists(path)) {
      return new Rule(utils.file.io.readlines(path));
    } else if (utils.path.exists(host_config_path)) {
      return new Rule(utils.file.io.readlines(host_config_path));
    } else {
      utils.logger.error("找不到 fekit.hosts 配置文件, 它应该存在于 " + host_config_path);
      return null;
    }
  };

  Matcher = (function() {

    function Matcher(uri) {
      this.uri = uri;
    }

    Matcher.prototype.getURL = function() {
      var $, idx, ret, val, _i, _len;
      ret = null;
      if (this.regmatcher && this.ret) {
        $ = this.regmatcher.slice(1);
        ret = this.ret;
        for (idx = _i = 0, _len = $.length; _i < _len; idx = ++_i) {
          val = $[idx];
          ret = ret.replace(new RegExp("\\$" + (idx + 1)), val);
        }
      }
      return ret;
    };

    Matcher.prototype.getFullHost = function() {
      return this.to;
    };

    return Matcher;

  })();

  module.exports = Rule;

}).call(this);