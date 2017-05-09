var m_div = document.createElement("div");
m_div.style.marginTop = "0.25em";

var update_usertext = function() {
    m_div.innerHTML = "User Comments: ";
    var sid = window.location.pathname.split('/')[2];
    chrome.storage.sync.get([sid], function(items) {
        if (items[sid] !== undefined) {
            m_div.innerHTML += items[sid][1];
        }
    });
};

update_usertext();
document.getElementById("profile_top").appendChild(m_div);

chrome.storage.onChanged.addListener(update_usertext);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request["type"] == "ff-data") {
            var response = {
                "url": window.location.toString(),
                "id": window.location.pathname.split('/')[2]
            };
            
            response["title"] = document.evaluate(
                '//*[@id="profile_top"]/b/text()',
                document,
                null,
                XPathResult.ANY_TYPE,
                null
            ).iterateNext().data;
            response["author"] = document.evaluate(
                '//*[@id="profile_top"]/a[1]/text()',
                document,
                null,
                XPathResult.ANY_TYPE,
                null
            ).iterateNext().data;
            response["summary"] = document.evaluate(
                '//*[@id="profile_top"]/div/text()',
                document,
                null,
                XPathResult.ANY_TYPE,
                null
            ).iterateNext().data;
            
            sendResponse(response);
        }
    }
);
