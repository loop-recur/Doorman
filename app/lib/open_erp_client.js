//+ @deftype OpenErpConfig = {uid: String, username: String, pwd: String}

var xmlrpc = require('/xmlrpc')
    , base_url = 'http://206.251.242.138:8069/xmlrpc/'
    , dbname = 'GreenCross'
    , cfg = {}
		;

//+ setUp :: OpenErpConfig -> StateChange(OpenErpConfig)
var setUp = function(config) {
      cfg = config;
    }.toIO(StateChange)

//+ makeClient :: String -> XmlRpcClient
  , makeClient = function(endpoint) {
      return xmlrpc.createClient({
          url: base_url+endpoint
        , username: cfg.username
        , password: cfg.pwd
      });
    }

//+ getXmlResponse :: Xml -> String
  , getXmlResponse = function(res) {
      var xmldata = Ti.XML.parseString(res.text)
        , val = xmldata.documentElement.getElementsByTagName("int")
        , result = null
        ;

      if(val.item(0)) return val.item(0).text;
    }

//+ exec :: String -> String -> [[String]] -> (Int -> b) -> undefined
  , exec = function(service, name, args, cb) {  
      var client = makeClient('object');

    	client
        .call('execute')
        .param(dbname)
        .param(Number(cfg.uid))
        .param(cfg.pwd)
        .param(name)
        .param(service)
        .param(args)
        .end(compose(cb, getXmlResponse));
    }

//+ login :: String -> String -> (OpenErpConfig -> b) -> undefined
  , login = function(usernm, pass, cb) {  
      var client = makeClient('common');

      client
        .call('login')
        .param(dbname)
        .param(usernm)
        .param(pass)
        .end(function(res) {
          uid = getXmlResponse(res);
          setUp({uid: uid, username: usernm, pwd: pass});
          var result = uid ? cfg : null;
          cb(result);
        });
    }


module.exports = {setUp: setUp, exec: exec, login: login};
