// ==UserScript==
// @name         HF Group Manager
// @namespace    http://meshcollider.github.io/
// @version      0.1
// @description  A userscript to assist group leaders on hackforums.net
// @author       MeshCollider
// @include      *hackforums.net/*
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

var groupNotice = [
    ".group_alert {",
    "background: #333333;",
    "border-top: 1px solid #03e103;",
    "border-bottom: 1px solid #03e103;",
    "text-align: center;",
    "padding: 5px 20px;",
    "font-size: 11px;",
    "margin-bottom: 15px;}",
    ].join("");
    
function injectCSS(){
  GM_addStyle(groupNotice);
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function decodeHtmlNumeric(str) {
    return str.replace( /&#([0-9]{1,7});/g, function( g, m1 ){
        return String.fromCharCode( parseInt( m1, 10 ) );
    }).replace( /&#[xX]([0-9a-fA-F]{1,6});/g, function( g, m1 ){
        return String.fromCharCode( parseInt( m1, 16 ) );
    });
}

function replaceAllMap(str,mapObj){
    var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
    
    return str.replace(re, function(matched){
        return mapObj[matched];
    });
}
    
function trimString (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function addGroupLink() {
  if(document.URL.indexOf("misc.php?action=buddypopup") != -1) {
        return;
  }
  bodyList = document.getElementById('panel').innerHTML.split('\n');
  for(i = 0; i < bodyList.length; i++){
    if(bodyList[i].indexOf('buddypopup') != -1){
      bodyList[i] = '<a href="/showgroups.php">Show Groups</a> | <a href="javascript:void(0);" id="buddylist">Buddy List</a>';
      $("#buddylist").live("click", function(){window.open('/misc.php?action=buddypopup','HF Buddy List', 'height=350,width=350,resizable=0,location=0,left=0,top=0')});
      document.getElementById('panel').innerHTML = bodyList.join('\n');
    }
  }
}

function groupMessage(){
    try{
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://MeshCollider.github.io/data/hfgm/message.html",
            onload: function(response){
                var groupHTML, groupMessageText, elementzLink, res, newres = [], i;
              
                if(GM_getValue("previousGroupMessage", "\n") == response.responseText && GM_getValue("hideGroupMsg", true)){
                    return;
                }
                res = trimString(response.responseText);
                newres = res.split('\n');

                GM_setValue("previousGroupMessage", response.responseText);
                GM_setValue("hideGroupMsg", false);
                hideButton = '<div class="float_right"><a href="javascript:void(0);" title="Dismiss this notice" id="hider"><img src="http://x.hackforums.net/images/modern_bl/dismiss_notice.gif" alt="Dismiss this notice" title="[x]"></a></div>';
                groupHTML = '<br><div class="group_alert" id="group_msg"><div><strong>Group Manager Notice: </strong>' + newres.join(" | ") + hideButton + '</div></div>';
                if(response.responseText != "\n"){
                    $("#header").append(groupHTML);
                    $("#hider").live("click",function(){hideGroupMessage();});
                }
            },
        });
    }catch(err){
      //die quietly
    }
}

function hideGroupMessage(){
    $(".group_alert").fadeOut();
    GM_setValue("hideGroupMsg", true);
}

function groupMemberGen(leaders, members, groupName, method){
    var finalBB = [], i, delim = '|!@|';
    if(method == 'standard'){
        // Standard, for creating generic lists
        finalBB.push('[size=x-large][b]'+groupName+' Member List[/b][/size]');
        finalBB.push('[b]Leaders:[/b]');
        finalBB.push('[list]');
        for(i=0; i<leaders.length; i++){
            finalBB.push('[*] [url=http://'+document.URL.split('/')[2]+'/member.php?action=profile&uid='+leaders[i].split(delim)[0]+']'+leaders[i].split(delim)[1]+'[/url]');
        }
        finalBB.push('[/list]');
        
        finalBB.push('[b]Members:[/b]');
        finalBB.push('[list]');
        for(i=0; i<members.length; i++){
            finalBB.push('[*] [url=http://'+document.URL.split('/')[2]+'/member.php?action=profile&uid='+members[i].split(delim)[0]+']'+members[i].split(delim)[1]+'[/url]');
        }
        finalBB.push('[/list]');
        finalBB = finalBB.join('\n');
    }else if(method == 'standardnolink'){
        // Standard, without BB list
        finalBB.push('[size=x-large][b]'+groupName+' Member List[/b][/size]');
        finalBB.push('[b]Leaders:[/b]');
        for(i=0; i<leaders.length; i++){
            finalBB.push('[url=http://'+document.URL.split('/')[2]+'/member.php?action=profile&uid='+leaders[i].split(delim)[0]+']'+leaders[i].split(delim)[1]+'[/url]');
        }
        finalBB.push('[b]Members:[/b]');
        for(i=0; i<members.length; i++){
            finalBB.push('[url=http://'+document.URL.split('/')[2]+'/member.php?action=profile&uid='+members[i].split(delim)[0]+']'+members[i].split(delim)[1]+'[/url]');
        }
        finalBB = finalBB.join('\n');
    }else if(method == 'nolistnolink'){
        // No list, for use with PM's, no links
        for(i=0; i<leaders.length; i++){
            finalBB.push(leaders[i].split(delim)[1]);
        }
        for(i=0; i<members.length; i++){
            finalBB.push(members[i].split(delim)[1]);
        }
        finalBB = finalBB.join(', ');
    }else if(method == 'nolistwithlink'){
        // No list, with links
        for(i=0; i<leaders.length; i++){
            finalBB.push('[url=http://'+document.URL.split('/')[2]+'/member.php?action=profile&uid='+leaders[i].split(delim)[0]+']'+leaders[i].split(delim)[1]+'[/url]');
        }
        for(i=0; i<members.length; i++){
            finalBB.push('[url=http://'+document.URL.split('/')[2]+'/member.php?action=profile&uid='+members[i].split(delim)[0]+']'+members[i].split(delim)[1]+'[/url]');
        }
        finalBB = finalBB.join(', ');
    }else{
        finalBB = '';
    }
    return finalBB;
}

function listMembers(){
    var trowls, i, members = [], leaders = [], groupName, uid, delim = '|!@|', nameList, textboxHTML, tableHTML, docSplit;
    trowls = document.getElementsByClassName("tborder")[0].innerHTML.split("\n");
    for(i=0; i<trowls.length; i++){
        if(trowls[i].indexOf('action=profile') != -1){
            uid = trowls[i].split('uid=')[1].split('">')[0]+delim;
            if(trowls[i].indexOf('</a> (Leader)') != -1){
                leaders.push(uid+trimString(trowls[i].replace(/<(?:.|\n)*?>/gm, '').replace(' (Leader)','')));
                //alert(trowls[i]+" is a leader");
            }else{
                members.push(uid+trimString(trowls[i].replace(/<(?:.|\n)*?>/gm, '')));
                //alert(trowls[i]+" is a member");
            }
        }
    }
    groupName = getThreadTitle(document.getElementsByClassName('navigation')[0].innerHTML, document.URL).split('[b]')[1].split('[/b]')[0];
    groupName = groupName.replace(" Group Management", '');
    nameList = groupMemberGen(leaders, members, groupName, GM_config.get('groupLeaderUserList', 'standard'));
    textboxHTML = '<textarea rows="5" cols=100%>'+nameList+'</textarea>';
    tableHTML = '<table border="0" cellspacing="1" cellpadding="4" class="tborder" id="HFESlist"><tbody><tr><td class="thead" colspan="6"><strong>[HFES] Easy Member List</strong></td></tr><tr><td class="trow1">Userlist:      </td><td class="trow1">'+textboxHTML+'</td></tr></tbody></table><br><br>';

    docSplit = document.getElementById('content').innerHTML.split('\n');
    for(i=0; i< docSplit.length; i++){
        if(docSplit[i].indexOf('end: managegroup_leaders ') != -1){
            docSplit[i] = docSplit[i]+tableHTML;
            document.getElementById('content').innerHTML = docSplit.join('\n');
            return;
        }
    }
}

function getProfileName(){
    var namecolorString, usernameColor, usernameClass, username, profileGenerator, profileStatsHTML;
    if($(".largetext strong span").length == 3){
        namecolorString = $($(".largetext strong span")[0]);
    }else if($(".largetext strong span").length == 4){
        namecolorString = $($(".largetext strong span")[1]);
    }
    username = namecolorString.html();
    usernameClass = namecolorString.attr('class');
    if(!usernameClass){
        usernameColor = '#383838'; // Closed Accounts
    }else if(usernameClass=="group4"){
        usernameColor = '#FF66FF'; // Admins
    }else if(usernameClass == "group3"){
        usernameColor = '#9999FF';  // Staff
    }else if(usernameClass == "group9"){
        usernameColor = '#99FF00'; // L33T
    }else if(usernameClass == "group29"){
        usernameColor = '#00AAFF';  // Ub3r
    }else if(usernameClass == "group7"){
        usernameColor = 'black'; // Banned
    }else{
        usernameColor = '#EFEFEF';
    }
    profileGenerator = '[url='+document.URL+']';
    if(usernameColor != ''){
        profileGenerator = profileGenerator+'[color='+usernameColor+'][b]'+username+'[/b][/color][/url]';
    }else{
        profileGenerator = profileGenerator+'[b]'+username+'[/b][/url]';
    }
    window.prompt("Press Ctrl+C to copy profile citation!",profileGenerator);
}

function main(){
    injectCSS();
    groupMessage();
    addSpecialLinks();
    
    if(document.URL.indexOf('showgroups.php') != -1){
      //update group page
      //get all member UID and submit to server
      // add "PM all" button
      //add "PM leaders" button
      // add blacklist thread button
    }
    if(document.URL.indexOf("member.php?action=profile") != -1){
        //add "Add to group" / "Remove from group" button
        //add "Blacklist from group" button
    }
}

main();
