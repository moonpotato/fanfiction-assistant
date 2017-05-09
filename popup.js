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
        store[sid] = {};
        
        store[sid]["title"] = document.getElementById("title").innerHTML;
        store[sid]["author"] = document.getElementById("author").innerHTML;
        store[sid]["summary"] = document.getElementById("summary").innerHTML;
        store[sid]["favoured"] = document.getElementById("favtick").checked;
        store[sid]["comments"] = document.getElementById("comments").value;
        
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
                    document.getElementById("favtick").checked = items[sid]["favoured"];
                    document.getElementById("comments").value = items[sid]["comments"];
                } else {
                    document.getElementById("favtick").checked = false;
                    document.getElementById("comments").value = "";
                }
            });
        });
    });
    
    browser.storage.sync.get(null).then(function(items) {
        for (var sid in items) {
            if (items.hasOwnProperty(sid) && items[sid]["favoured"] === true) {
                var row = document.createElement("tr");
                
                row.innerHTML = "<em><strong>" + items[sid]["title"] +
                                "</strong></em> by <em>" + items[sid]["author"] +
                                "</em><br>" + items[sid]["summary"] + "<br>" +
                                "<strong>User Comments:</strong> " + items[sid]["comments"];
                
                document.getElementById("favlist").appendChild(row);
            }
        }
    });
});