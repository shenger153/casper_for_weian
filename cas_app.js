/*
  用法：
  默认首页： casperjs cas_app.js
  指定地址： casperjs cas_app.js YOUR_URL 
*/

var fs = require('fs');
var casper = require('casper').create();
var args = casper.cli.args; 

var links = [];
var address = args;
var file = 'timelist_' + (new Date()).getTime() + '.txt';
var txtData = '';

// 生成txt函数
function fsWrite() {
  fs.write(file, txtData, function(err) {
    if (err) return err;
  });
}

// 获取项目指定页面的url并过滤空连接和登出链接的url
function getLinks() {
  links = document.querySelectorAll('a');
  var aAray = [];

  Array.prototype.map.call(links, function(e) {
      var href = e.getAttribute('href') ? e.getAttribute('href') : "";
      aAray.push(href);
  });

  var aAray = aAray.filter(function(value) {
    return value != "/CRM/signout"
  }).filter(function(value) {
    return value != "#"
  }).filter(function(value) {
    return value != "javascript:void(0);"
  }).filter(function(value) {
    return value != "javascript:void(0)"
  }).filter(function(value) {
    return value != "";
  }).filter(function(value) {
    return value.slice(0,1) == "/"
  });

  aAray = aAray.map(function(item) {
    return item = "http://10.1.1.109"+item;
  });

  return aAray;
};

casper.start('http://10.1.1.109/auth/realms/iosp/protocol/openid-connect/auth?response_type=code&client_id=iosp&redirect_uri=http%3A%2F%2F10.1.1.109%2FCRM%2Fsso%2Flogin&state=263%2F23f8df7a-ce0b-48e6-a2f1-2ba45baf51b4&login=true');

casper.then(function() {
  this.fill('div[id="kc-form-wrapper"]', {
    'username': 'elva',
    'password': '123456'
  }, false);
});

casper.then(function() {  
  this.click('input[id="kc-login"]');  
  this.echo('login...'); 
  this.wait(1000,function() {  
    this.echo('Login Successfully.'); 
  });
  console.log('isNoAddress: ' + (address == ''));
});

// 默认不传参数会进入登录后的首页，这里也可以给定另一个地址
casper.thenOpen(''+address+'', function() {
  this.echo('应该是登陆了');
  this.echo('html the url: ' + this.getCurrentUrl());
  this.echo('this title is: ' + this.getTitle());
  this.echo('<=======================start========================>');

  txtData = (new Date()).toLocaleString() + '\r\n' 
          + '<=======================start========================>\r\n' 
          + 'html the url: ' + this.getCurrentUrl() + '\r\n';
  fsWrite();
});


casper.then(function() {
  var index = 0;
  links = this.evaluate(getLinks);

  console.log('the links length: ' + links.length);
  txtData += 'the links length: ' + links.length + '\r\n';

  casper.repeat(links.length, function() {
    var timestart = Date.now();
    this.thenOpen(links[index], function() {

      var timend = Date.now() - timestart;
      this.echo('Page url is ' + this.getCurrentUrl());
      this.echo('Page title is ' + this.getTitle() + ' index: ' + index);
      if (timend > 800) {
        
        txtData += 'Page url is ' + this.getCurrentUrl() + '\r\n'
          + 'Page title is ' + this.getTitle() + ' index: ' + index + '\r\n'
          + 'Page Times is ' + timend + ' is timeout 800\r\n'
          + '-----------------------------------------------------\r\n';

        this.warn('Page Times is ' + timend + ' is timeout 800');
      } else {
        this.echo('Page Times is ' + timend);
      }
      this.echo('-----------------------------------------------------')
      index++;

      fsWrite();

    }); 
  });

})

casper.then(function() {
  this.echo('<========================end=========================>');

  txtData += '<========================end=========================>';
  fsWrite();

  this.exit();
});

casper.run();  
