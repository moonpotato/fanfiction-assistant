document.addEventListener("DOMContentLoaded", function() {
    var buttons = document.getElementsByClassName("button");
    
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function() {
            var buttons = document.getElementsByClassName("button");
            var containers = document.getElementsByClassName("container");
            
            for (var i = 0; i < buttons.length; i++) {
                if (this === buttons[i]) {
                    buttons[i].classList.add("active");
                    containers[i].removeAttribute("hidden");
                } else {
                    buttons[i].classList.remove("active");
                    containers[i].setAttribute("hidden", "hidden");
                }
            }
        });
    }
    
    document.getElementById("save").addEventListener("click", function() {
        var store = {};
        var sid = document.getElementById("sid").innerHTML;
        var checked = document.getElementById("favtick").checked;
        var uinput = document.getElementById("comments").value;
        store[sid] = [checked, uinput];
        browser.storage.sync.set(store);
    });
    
    browser.tabs.query({active: true, currentWindow: true}).then(function(tabs) {
        browser.tabs.sendMessage(tabs[0].id, {"type": "ff-data"}).then(function(response) {
            document.getElementById("title").innerHTML = response["title"];
            document.getElementById("author").innerHTML = response["author"];
            document.getElementById("summary").innerHTML = response["summary"];
            document.getElementById("sid").innerHTML = response["id"];
            
            var sid = document.getElementById("sid").innerHTML;
            browser.storage.sync.get([sid]).then(function(items) {
                if (items[sid] !== undefined) {
                    document.getElementById("favtick").checked = items[sid][0];
                    document.getElementById("comments").value = items[sid][1];
                } else {
                    document.getElementById("favtick").checked = false;
                    document.getElementById("comments").value = "";
                }
            });
        });
    });
});