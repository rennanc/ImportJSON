function test() {
  getAppsInfoBuild("<appSlug>");
};

function getUserInfo() { 
  return ImportJSONBasicAuthentication("https://api.bitrise.io/v0.1/me","", "noInherit, noTruncate", "<userToken>");
};

function getApps() { 
  return ImportJSONBasicAuthentication("https://api.bitrise.io/v0.1/me/apps?limit=50","", "noInherit, noTruncate", "<userToken>");
};

function getAppInfo(slug) { 
  return ImportJSONBasicAuthentication("https://api.bitrise.io/v0.1/apps/"+slug,"", "noInherit, noTruncate", "<userToken>");
};

/**
*TODO - This function need refactoring
**/
function getAppsInfoBuild() {
  var infoApps = [];
  
  var apps = getApps();
  var item = "";
  for (var row=0; row<apps.length; row++) {
    var rowArray = apps[row];
    if((rowArray[0].match("Slug")>-1) && rowArray[0]){
      var objectItem = {
                  slug: rowArray[0],
                  name: rowArray[1],
                  type: rowArray[2]
                  };
      infoApps.push(objectItem); 
    }
  }
  var allItens = [];
  for (var i=0; i<infoApps.length; i++) {
    var returnBuildsJson = ImportJSONTokenAuthentication("https://api.bitrise.io/v0.1/apps/"+infoApps[i].slug+"/builds?limit=50","", "noInherit, noTruncate", "<userToken>")
    //remove the first and last item
    returnBuildsJson.pop();
    //TODO - replace this "if" for regex
    if(i > 0 || returnBuildsJson[0][0] == "Data Slug"){
      returnBuildsJson.shift();
    }
    
    //add appSlug, name and type for each line
    for (var c=0; c<returnBuildsJson.length; c++) {
      returnBuildsJson[c].unshift(infoApps[i].type);
      returnBuildsJson[c].unshift(infoApps[i].name);
      returnBuildsJson[c].unshift(infoApps[i].slug);
    }
    
    //join with other arrays
    allItens = allItens.concat(returnBuildsJson);
  }
  return allItens;
};
