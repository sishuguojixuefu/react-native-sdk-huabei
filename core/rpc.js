/**
 * Created by buhe on 16/4/12.
 */
import conf from './conf.js';

/**
 * 直传文件
 * formInput对象如何配置请参考七牛官方文档“直传文件”一节
 */
function uploadFile(uri, token, formInput, onprogress) {
  return new Promise((resolve, reject)=> {
    if (typeof uri != 'string' || uri == '' || typeof formInput.key == 'undefined') {
      reject && reject(null);
      return;
    }
    if (uri[0] == '/') {
      uri = "file://" + uri;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', formInput.region || conf.UP_HOST);
    
    xhr.timeout = conf.RPC_TIMEOUT;
    
    xhr.onload = () => {
      if (xhr.status !== 200) {
        reject && reject(xhr);
        return;
      }
      resolve && resolve(formInput.key);
    };
    
    xhr.ontimeout = (e) => {
      reject && reject(e);
      return;
    }
    
    xhr.onerror = (e)=>{            
        reject && reject(e);
        return;
    }
    
    var formdata = new FormData();
    formdata.append("key", formInput.key);
    formdata.append("token", token);
    if (typeof formInput.type == 'undefined')
      formInput.type = 'application/octet-stream';
    if (typeof formInput.name == 'undefined') {
      var filePath = uri.split("/");
      if (filePath.length > 0)
        formInput.name = filePath[filePath.length - 1];
      else
        formInput.name = "";
    }
    formdata.append("file", {uri: uri, type: formInput.type, name: formInput.name});
    xhr.upload.onprogress = (event) => {
      onprogress && onprogress(event, xhr);
    };
    xhr.send(formdata);
  });
}

//发送管理和fop命令,总之就是不上传文件
function post(uri, adminToken, content) {
  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  let payload = {
    headers: headers,
    method: 'POST',
    dataType: 'json',
    timeout: conf.RPC_TIMEOUT,
  };
  if (typeof content === 'undefined') {
    payload.headers['Content-Length'] = 0;
  } else {
    //carry data
    payload.body = content;
  }

  if (adminToken) {
    headers['Authorization'] = adminToken;
  }

  return fetch(uri, payload);
}

export default {uploadFile, post}
