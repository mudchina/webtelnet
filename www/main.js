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

function writeToScreen(message) {
    var pre = document.createElement("p"); 
    pre.style.wordWrap = "break-word"; 
    // pre.style.wordBreak = "break-all"
    // pre.style.fontSize = "small";
    pre.innerHTML = message; 
    output.appendChild(pre); 
    output.scrollTop = output.scrollHeight;
}

function writeToScreenA(message) {
    var pre = document.createElement("p"); 
    pre.style.wordWrap = "break-word"; 
    // pre.style.wordBreak = "break-all"
    // pre.style.fontSize = "small";
    var msg = ansi_up.ansi_to_html(message);
    pre.innerHTML = msg//.replace(/\s/g, "&nbsp;")
    output.appendChild(pre);
    output.scrollTop = output.scrollHeight;
}

var lastMsg = ""

function writeServerDataToScreen(msg) {
  var data = new Uint8Array(msg);
  var data2 = lastMsg + binayUtf8ToString(data, 0)
  if (lastMsg != "") {
      //移除上一个
      output.removeChild(output.childNodes[output.childNodes.length-1])
  }
  var msgs = data2.split("\r\n")
  for (var i=0; i < msgs.length; i++) {
      var msg = msgs[i].replace(/\s\s/g,'&nbsp;')
      if(!msg) msg = '&nbsp;';
      writeToScreenA('<span class="output">' + msg +'</span>');
  }
  if (data2.charAt(data2.length-1) == '\n' && data2.charAt(data2.length-2) == '\r') {
      lastMsg = ""
  } else {
      lastMsg = msgs[msgs.length-1]
      if (lastMsg == "> " || lastMsg == ">") {
        lastMsg = ""
      }
  }
}

var sock = null;

function send(message) {
  writeToScreenA('<span class="cmd">' + message +'</span>');
  if(sock) sock.emit('message', message);
}

$(document).ready(function(){
  sock = io.connect();

  sock.on('message', function(msg){
    console.log(msg.toString());
    writeServerDataToScreen(msg);
  });

  sock.on('connected', function(){
    console.log('connected');
    writeToScreen("CONNECTED");
  });
  sock.on('disconnect', function(){
    console.log('disconnected');
    writeToScreen("DISCONNECTED");
  });

  $('button#send').click(function(e) {
    var str = $('input#command').val();
    send(str + '\n');
  });
  $('button#clear').click(function(e) {
    $('div#output').html('');
  });
  $('input#command').keypress(function(e) {
    if(e.keyCode == 13) {
      var str = $('input#command').val();
      send(str + '\n');
      var me = e.currentTarget;
      me.setSelectionRange(0, str.length);
    }
  });
});
