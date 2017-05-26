browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request["type"] == "get-user") {
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