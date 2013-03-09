/* 
    Remove Facebook Suggested Pages & Posts 

    Qing-Cheng Li

*/
console.log('Load remove.js');

/* 
    In order to override the HTMLUlistElement.appendChild function for 
    removing <li> of suggested pages/posts, so inject the script kerker.js
    into page. After overriding the function, everytime when a ajax call
    done, facebook add new <li> into news feed will call appendChild,
    at that time, my script will check if the <li> is a suggested post or 
    not.
*/
var rfbspScript = document.createElement("script");
rfbspScript.src = chrome.extension.getURL("kerker.js");
(document.head||document.documentElement).appendChild(rfbspScript);
