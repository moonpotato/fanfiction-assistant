var m_div = document.createElement("div");

m_div.style.marginTop = "0.25em";
m_div.classList.add("xcontrast_txt");
if (document.getElementsByClassName("xlight").length !== 0) {
    m_div.classList.add("xlight");
}

var fictitle;
if (document.getElementById("profile_top").childNodes[0].tagName === "SPAN") {
    fictitle = document.getElementById("profile_top").childNodes[2];
} else {
    fictitle = document.getElementById("profile_top").childNodes[1];
}

var update_usertext = function() {
    var sid = window.location.pathname.split('/')[2];
    browser.storage.sync.get([sid]).then(function(items) {
        if (items[sid] !== undefined) {
            m_div.innerHTML = "<strong>User Comments:</strong> ";
            m_div.innerHTML += items[sid]["comments"];
            if (items[sid]["favoured"]) {
                fictitle.style.cssText = "color: white !important; background-color: green !important;";
            } else {
                fictitle.style.cssText = "";
            }
        }
    });
};

update_usertext();
document.getElementById("profile_top").appendChild(m_div);

browser.storage.onChanged.addListener(update_usertext);

browser.runtime.onMessage.addListener(
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
            response["status"] = ((document.getElementById("profile_top").innerHTML.includes("Status: Complete"))
                                  ? 1
                                  : 0);
            
            sendResponse(response);
        }
        else if (request["type"] == "get-user") {
            var response = {};
            
            var signup = document.evaluate(
                '//*[@id="name_login"]/a[2]/text()',
                document,
                null,
                XPathResult.ANY_TYPE,
                null
            ).iterateNext();
            
            response["loggedin"] = signup === null;
            
            response["username"] = document.evaluate(
                '//*[@id="name_login"]/a[1]/text()',
                document,
                null,
                XPathResult.ANY_TYPE,
                null
            ).iterateNext().data;
            
            sendResponse(response);
        }
    }
);
