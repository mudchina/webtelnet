function binayUtf8ToString(buf, begin){
  var i = 0;
  var pos = 0;
  var str ="";
  var unicode = 0 ;
  var flag = 0;
  for (pos = begin; pos < buf.length;){
    flag= buf[pos];
    if ((flag >>>7) === 0 ) {
      str+= String.fromCharCode(buf[pos]);
      pos += 1;

    }
    else if ((flag &0xFC) === 0xFC ){
      unicode = (buf[pos] & 0x3) << 30;
      unicode |= (buf[pos+1] & 0x3F) << 24; 
      unicode |= (buf[pos+2] & 0x3F) << 18; 
      unicode |= (buf[pos+3] & 0x3F) << 12; 
      unicode |= (buf[pos+4] & 0x3F) << 6;
      unicode |= (buf[pos+5] & 0x3F);
      str+= String.fromCharCode(unicode) ;
      pos += 6;

    }else if ((flag &0xF8) === 0xF8 ){
      unicode = (buf[pos] & 0x7) << 24;
      unicode |= (buf[pos+1] & 0x3F) << 18; 
      unicode |= (buf[pos+2] & 0x3F) << 12; 
      unicode |= (buf[pos+3] & 0x3F) << 6;
      unicode |= (buf[pos+4] & 0x3F);
      str+= String.fromCharCode(unicode) ;
      pos += 5;

    }
    else if ((flag &0xF0) === 0xF0 ){
      unicode = (buf[pos] & 0xF) << 18;
      unicode |= (buf[pos+1] & 0x3F) << 12; 
      unicode |= (buf[pos+2] & 0x3F) << 6;
      unicode |= (buf[pos+3] & 0x3F);
      str+= String.fromCharCode(unicode) ;
      pos += 4;

    }

    else if ((flag &0xE0) === 0xE0 ){
      unicode = (buf[pos] & 0x1F) << 12;;
      unicode |= (buf[pos+1] & 0x3F) << 6;
      unicode |= (buf[pos+2] & 0x3F);
      str+= String.fromCharCode(unicode) ;
      pos += 3;

    }
    else if ((flag &0xC0) === 0xC0 ){ //110
      unicode = (buf[pos] & 0x3F) << 6;
      unicode |= (buf[pos+1] & 0x3F);
      str+= String.fromCharCode(unicode) ;
      pos += 2;

    }
    else{
      str+= String.fromCharCode(buf[pos]);
      pos += 1;
    }
 } 
 return str;
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function writeToScreen(str) {
  var out = $('div#out');
  out.append('<span class="out">' + str + '</span>');
  out.scrollTop(out.prop("scrollHeight"));
}

function writeServerData(buf) {
  var data = new Uint8Array(buf);
  var str = binayUtf8ToString(data, 0);

  var lines = str.split('\r\n');
  for(var i=0; i<lines.length; i++) {
    var line = lines[i].replace(/\s\s/g, '&nbsp;');
    if(i < lines.length-1) line += '<br/>';

    // replace the prompt "> " with a empty line
    var len = line.length;
    if(len>=2 && line.substr(len-2) == '> ') line = line.substr(0, line-2) + '<br/>';

    line = ansi_up.ansi_to_html(line);

    writeToScreen(line);
  }
}

function adjustLayout() {
  var w = $(window).width(), h = $(window).height();
  var w0 = $('div#cmd').width();
  var w1 = $('button#send').outerWidth(true);
  var w2 = $('button#clear').outerWidth(true);
  $('input#cmd').css({
    width: (w0 - (w1+w2+14)) + 'px',
  });
  var h0 = $('div#cmd').outerHeight(true);
  $('div#out').css({
    width: (w-2) + 'px',
    height: (h - h0 -2) + 'px',
  });
}

$(window).resize(adjustLayout);

$(document).ready(function(){
  //$.cookie('lang', 'zh');
  //hotjs.i18n.setLang('zh');
  //hotjs.i18n.translate();

  // websocket
  var sock = io.connect();
  sock.on('data', function(buf){
    writeServerData(buf);
  });
  sock.on('status', function(str){
    writeToScreen(str);
  });
  sock.on('connected', function(){
    console.log('connected');
  });
  sock.on('disconnect', function(){
    console.log('disconnected');
  });

  // send
  var send = function(str) {
    writeToScreen(str);
    if(sock) sock.emit('data', str);
  }
  var sendInput = function() {
    var cmd = $('input#cmd');
    send(cmd.val().trim() + '\n');
    cmd.val('');
  }

  // UI events
  $('input#cmd').keypress(function(e) {
    if(e.keyCode == 13) sendInput();
  });
  $('button#send').click(function(e) {
    sendInput();
  });
  $('button#clear').click(function(e) {
    $('div#out').html('');
  });

  setTimeout(function(){
    adjustLayout();
  },200)
});
