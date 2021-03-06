/*
 *  QCLean - experiment
 */

var qclean = qclean || {};
// TODO: support safari/opera
var extensionInfo = undefined;
if (self.options) {
    //console.log("Firefox");
    //console.log(self.options);
    extensionInfo = {
        "version": self.options.version
    };
} else if (chrome) {
    //console.log("Chrome");
    var manifest = chrome.runtime.getManifest();
    extensionInfo = {
        "version": manifest.version
    };
}

qclean.version = extensionInfo.version;

console.log("Load qclean.js ("+qclean.version+")");

/* QCLean judge functions */
qclean.hiding = qclean.hiding || {};

qclean.hiding.isSponsoredStoryOnNewsFeed = function(element) {
    if(element.dataset.ft && JSON.parse(element.dataset.ft).mf_story_key){
        return true;
    }
    return false;
};

qclean.hiding.isSponsoredADs = function(element){
    if(element.className=="ego_section"){
        return true;
    }
    return false;
};

qclean.hiding.isGameInChatBar = function (element) {
    return (element.id == "pagelet_canvas_nav_content"); 
};

/* QCLean collaspe header and container functions */
qclean.collaspe = qclean.collaspe || {};

qclean.collaspe.contentComponentFinder = function (element) {
    var header = element.querySelector(".uiHeaderTitle");
    var container = element.querySelector(".ego_unit_container");

    if (header && container) {
        return {
            "header"    : header,
            "container" : container,
            "title"     : header
        };
    }

    return undefined;
};

qclean.collaspe.contentHandler = function (event) {
    // no-op
};

/* QCLean */

qclean.feature = qclean.feature || {};

// Feature: hide sponsored story on news feed
qclean.feature.hideSponsoredStoryOnNewsFeed = {
    "type"          : "hide",
    "judgeFunction" : qclean.hiding.isSponsoredStoryOnNewsFeed,
    "name"          : "hideSponsoredStoryOnNewsFeed",
    "description"   : "Hide sponsored story on news feed"
};

// Feature: hide sponsored ADs
qclean.feature.hideSponsoredADs = {
    "type"          : "hide",
    "judgeFunction" : qclean.hiding.isSponsoredADs,
    "name"          : "hideSponsoredADs",
    "description"   : "Hide sponsored AD on photo view and persional view"
};

// Feature: hide recommended game in chat bar
qclean.feature.hideRecommendedGameInChatBar = {
    "type"          : "hide",
    "judgeFunction" : qclean.hiding.isGameInChatBar,
//  "afterHidingHandler" : qclean.hiding.adjustChatBodyHeight,
    "name"          : "hideRecommendedGameInChatBar",
    "description"   : "Hide recommended game in chat bar"
};

// Feature: collaspe contnet
qclean.feature.collaspeSidebarContent = {
    "type"          : "collaspe",
    "componentFinder" : qclean.collaspe.contentComponentFinder,
    "collaspeHandler" : qclean.collaspe.contentHandler,
    "name"          : "collaspeSidebarContent",
    "description"   : "Collaspe sidebar content"
};

// Feature: collaspe recommended games
// TODO
qclean.feature.collaspeRecommendedGame = {
    "type"          : "collaspe",
    "componentFinder" : undefined,
    "collaspeHandler" : undefined,
    "name"          : "collaspeRecommendedGame",
    "description"   : "Collaspe recommended game"
};

/* QCLean hide element framework */

qclean.framework = qclean.framework || {};

qclean.framework._hideElementByTargetChild = function(target, featureDesc){
    var element = target;
    if(!target.dataset.qclean){
        while(element!=null&&element!=undefined){
            if(featureDesc.judgeFunction(element)){
                element.style.display = "none";
                target.dataset.qclean = "done";
                console.log("Hide something ("+featureDesc.name+")");
                //if (featureDesc.afterHidingHandler) {
                //    featureDesc.afterHidingHandler();
                //}
                break;
            }
            element = element.parentElement;
        }
    }
    /*
    if(!target.dataset.qclean){
        //here means qclean didn't hide our target element.
        //TODO I13N
    }
    */
};

qclean.framework.hideElementsByTargetChildSelector = function(selectors, featureDesc){
    var targetChilds = document.querySelectorAll(selectors);
    for(var i=0; i<targetChilds.length; i++){
        if(!targetChilds[i].dataset.qclean){
            qclean.framework._hideElementByTargetChild(targetChilds[i], featureDesc);
        }
    }
};

qclean.framework._setupCollaspeComponent = function(component, handler) {
    var header = component.header;
    var container = component.container;
    var title = component.title;

    if (!header.dataset.qcleanCollaspe) {
        console.log("add new collaspe area");
        header.classList.add("qcleanClickable");
        container.classList.add("qcleanHide");
        if (title) {
            title.innerHTML = title.innerHTML + " ...";
        }
        header.dataset.qcleanCollaspe = "true";
        header.qcleanCollaspeContainer = container;
        header.onclick = function (event) {
            handler(event);
            if (this.dataset.qcleanCollaspe == "true") {
                this.qcleanCollaspeContainer.classList.remove("qcleanHide");
                this.dataset.qcleanCollaspe = "false";
            } else {
                this.qcleanCollaspeContainer.classList.add("qcleanHide");
                this.dataset.qcleanCollaspe = "true";
            }
            //TODO: i13n
        }
    }
};

qclean.framework._collaspeElement = function(element, featureDesc) {
    var component = featureDesc.componentFinder(element);
    if (component) {
        qclean.framework._setupCollaspeComponent(component, featureDesc.collaspeHandler);
        element.dataset.qclean = "done";
    }
};

qclean.framework.collaspeElementsBySelector = function(selector, featureDesc) {
    var targetAreas = document.querySelectorAll(selector);
    for (var i = 0; i < targetAreas.length; i++) {
        if (!targetAreas[i].dataset.qclean) {
            qclean.framework._collaspeElement(targetAreas[i], featureDesc); 
        }
    }
};

/* Mutation observer */

var qcleanObserver = new window.MutationObserver(function(mutation, observer){
    //console.log("Observer triggered");

    // hide sponsored story on newsfeed
    qclean.framework.hideElementsByTargetChildSelector(".uiStreamAdditionalLogging:not([data-qclean])", qclean.feature.hideSponsoredStoryOnNewsFeed);

    // hide sponsored ADs
    qclean.framework.hideElementsByTargetChildSelector(".adsCategoryTitleLink:not([data-qclean])", qclean.feature.hideSponsoredADs);

    // collaspe sidebar content
    qclean.framework.collaspeElementsBySelector(".ego_section:not([data-qclean]):not([style])", qclean.feature.collaspeSidebarContent); 

    // hide recommended game in chat bar
    qclean.framework.hideElementsByTargetChildSelector("#pagelet_canvas_nav_content:not([data-qclean])", qclean.feature.hideRecommendedGameInChatBar);
});

qcleanObserver.observe(document, {
    subtree: true,
    childList: true
});
