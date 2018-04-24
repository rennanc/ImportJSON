function teste() {
  getAppsInfoBuild();
};

function teste2() {
  getAllBuilds("<appSlug>");
};

function getUserInfo() { 
  return ImportJSONTokenAuthentication("https://api.bitrise.io/v0.1/me","", "noInherit, noTruncate", "<userToken>");
};

function getApps() { 
  return ImportJSONTokenAuthentication("https://api.bitrise.io/v0.1/me/apps?limit=50","", "noInherit, noTruncate", "<userToken>");
};

function getAppInfo(slug) { 
  return ImportJSONTokenAuthentication("https://api.bitrise.io/v0.1/apps/"+slug,"", "noInherit, noTruncate", "<userToken>");
};


/**
*TODO - This function need refactoring
**/
function getAppsInfoBuild() {
  var infoApps = [];
  
  var apps = getApps();
  var item = "";
  //all list of apps
  for (var row=0; row<apps.length; row++) {
    var rowArray = apps[row];
    //Getting details of slug, name and type of each app
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
  for (var i = parseInt(0); i < infoApps.length; i++) {
  
    var returnBuildsJson = getAllBuilds(infoApps[i].slug);
    
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
  
  //It's changing the header name of 3 firsts itens
  allItens[0][0] = "App Slug";
  allItens[0][1] = "App Name";
  allItens[0][2] = "App Type";
  
  
  return allItens;
};

function getAllBuilds(appSlug){
    var listOldBuilds = [];
    var buildOfFirstPage = ImportJSONTokenAuthentication("https://api.bitrise.io/v0.1/apps/"+appSlug+"/builds","", "noInherit, noTruncate", "<userToken>");
    var header = buildOfFirstPage[0];
    //remove build data is on hold
    if(header[8] === 'Data Is On Hold'){
      header.splice(8,1);
    }
    var paggingDetails = buildOfFirstPage[buildOfFirstPage.length - 1];
    var nextBuildSlug = paggingDetails[paggingDetails.length -1];
    
    //remove pagginDetails
    buildOfFirstPage.shift();
    buildOfFirstPage.pop();
    listOldBuilds[0] = header;
    buildOfFirstPage = cleanBuildList(buildOfFirstPage);
    listOldBuilds = listOldBuilds.concat(buildOfFirstPage);
    
    while(nextBuildSlug != "50"){
      var builds = ImportJSONTokenAuthentication("https://api.bitrise.io/v0.1/apps/"+appSlug+"/builds?next=" + nextBuildSlug,"", "noInherit, noTruncate", "<userToken>");
      paggingDetails = builds[builds.length - 1];
      nextBuildSlug = paggingDetails[paggingDetails.length -1];
      builds = cleanBuildList(builds);
      listOldBuilds = listOldBuilds.concat(builds);
    }
    
    return listOldBuilds;
};

function cleanBuildList(builds){
    //TODO - replace this "if" for regex
    builds.shift();
    builds.pop();
  
  for (var i = parseInt(0); i < builds.length; i++) {
    if(isNaN(builds[i][5]) || builds[i][5] === ""){
      if(builds[i][2] !== ""){ //fix date with wrong column
        builds[i].splice(3,0,"",builds[i][2]);
        builds[i][2] = "";
      }else{
        builds[i].splice(3,0,"","");
      }
    }
    
    builds[i] = clearAbortedComment(builds[i]);
  }
  return builds;
}

//remove comments of aborted build
function clearAbortedComment(buildItem){
   if((buildItem[6] === "aborted" || buildItem[6] === "success" || buildItem[6] === "error") && typeof(buildItem[8]) === "boolean"){ 
      buildItem.splice(7,1);
    }
    return buildItem
}
