var update_favs = function() {
    browser.storage.sync.get(null).then(function(items) {
        var favlist = document.getElementById("favlist");
        while (favlist.firstChild) {
            favlist.removeChild(favlist.firstChild);
        }
        
        for (var sid in items) {
            if (items.hasOwnProperty(sid) && items[sid]["favoured"] === true) {
                var row = document.createElement("tr");
                var item = document.createElement("td");
                row.appendChild(item)
                item.classList.add("storyitem");
                
                var extrainfo = [];
                if (typeof items[sid]["status"] == "number") {
                    extrainfo.push(document.getElementById("status").childNodes[items[sid]["status"]*2+1].innerHTML);
                }
                if (items[sid]["read"]) {
                    extrainfo.push("Read");
                }
                if (items[sid]["rating"]) {
                    extrainfo.push("Rated: " + items[sid]["rating"]);
                }
                
                var itemtext = "<em><strong>" + items[sid]["title"] +
                                "</strong></em> by <em>" + items[sid]["author"] + "</em>";
                if (extrainfo.length !== 0) {
                    itemtext += '<em class="annotation">' + extrainfo.join(", ") + "</em>";
                }
                itemtext += "<br>" + items[sid]["summary"] + "<br><em>" + items[sid]["comments"] + "</em>";
                
                item.innerHTML = itemtext;
                
                var createClickCallback = function(s) {
                    return function() {
                        browser.tabs.create({
                            url: "https://www.fanfiction.net/s/" + s,
                            active: false
                        });
                    };
                }
                
                item.addEventListener("click", createClickCallback(sid));
                
                favlist.appendChild(row);
            }
        }
    });
};

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
        store[sid]["read"] = document.getElementById("readtick").checked;
        store[sid]["rating"] = document.getElementById("userrating").value;
        store[sid]["comments"] = document.getElementById("comments").value;
        store[sid]["status"] = document.getElementById("status").selectedIndex;
        
        browser.storage.sync.set(store).then(update_favs);
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
                    document.getElementById("readtick").checked = items[sid]["read"];
                    document.getElementById("userrating").value = items[sid]["rating"];
                    document.getElementById("comments").value = items[sid]["comments"];
                    document.getElementById("status").selectedIndex = items[sid]["status"];
                } else {
                    document.getElementById("favtick").checked = false;
                    document.getElementById("readtick").checked = false;
                    document.getElementById("userrating").value = "";
                    document.getElementById("comments").value = "";
                }
            });
        });
        
        browser.tabs.sendMessage(tabs[0].id, {"type": "get-user"}).then(function(response) {
            if (response["loggedin"]) {
                document.getElementById("account").hidden = false;
                document.getElementById("username").innerHTML = response["username"];
            }
        });
    });
    
    var databox = document.getElementById("internaldata");
    var exbutton = document.getElementById("export");
    var inbutton = document.getElementById("import");
    
    databox.addEventListener("paste", function() {
        inbutton.disabled = false;
    });
    
    exbutton.addEventListener("click", function() {
        browser.storage.sync.get(null).then(function(items) {
            databox.value = JSON.stringify(items, null, 1);
            inbutton.disabled = false;
        });
    });
    
    inbutton.addEventListener("click", function() {
        browser.storage.sync.set(JSON.parse(databox.value));
    });
    
    update_favs();
});
