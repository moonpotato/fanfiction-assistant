var mousePosX = 0;
var mousePosY = 0;

document.addEventListener("mousemove", function(event) {
    mousePosX = event.clientX;
    mousePosY = event.clientY;
});

document.addEventListener("click", function() {
    var dropdowns = document.getElementsByClassName("dropdown");
    for (var i = 0; i < dropdowns.length; ++i) {
        dropdowns[i].setAttribute("hidden", "hidden");
    }
});

var update_list = function() {
    browser.storage.sync.get(null).then(function(items) {
        var storylist = document.getElementById("storylist");
        while (storylist.firstChild) {
            storylist.removeChild(storylist.firstChild);
        }
        
        for (var sid in items) {
            if (items.hasOwnProperty(sid) && sid) {
                var row = document.createElement("tr");
                var item = document.createElement("td");
                row.appendChild(item)
                item.classList.add("storyitem");
                
                // Skip this story if it doesn't match a filter
                if (document.getElementById("favfilter").checked && !items[sid]["favoured"]) {
                    continue;
                }
                if (document.getElementById("readfilter").checked && !items[sid]["read"]) {
                    continue;
                }
                if (document.getElementById("pendingfilter").checked && !items[sid]["pending"]) {
                    continue;
                }
                if (document.getElementById("completefilter").checked && (items[sid]["status"] !== 1)) {
                    continue;
                }
                
                var searchtext = document.getElementById("searchfilter").value;
                if (searchtext != "") {
                    searchtext = new RegExp(searchtext, 'i');
                    if ((items[sid]["title"].search(searchtext) === -1)
                        && (items[sid]["author"].search(searchtext) === -1)) {
                        continue;
                    }
                }
                
                var extrainfo = [];
                if (items[sid]["favoured"]) {
                    extrainfo.push("Favoured");
                }
                if (items[sid]["read"]) {
                    extrainfo.push("Read");
                }
                if (items[sid]["pending"]) {
                    extrainfo.push("Pending");
                }
                if (typeof items[sid]["status"] == "number") {
                    extrainfo.push(["In-Progress", "Complete", "Abandoned"][items[sid]["status"]]);
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
                };
                
                var createRightClickCallback = function(s) {
                    return function() {
                        var dropdown = document.getElementById("storymenu");
                        dropdown.style.left = mousePosX + "px";
                        dropdown.style.top = mousePosY + "px";
                        
                        
                        
                        dropdown.removeAttribute("hidden");
                    };
                };
                
                item.addEventListener("click", createClickCallback(sid));
                item.addEventListener("contextmenu", createRightClickCallback(sid));
                
                storylist.appendChild(row);
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
        store[sid]["pending"] = document.getElementById("pendingtick").checked;
        store[sid]["rating"] = document.getElementById("userrating").value;
        store[sid]["comments"] = document.getElementById("comments").value;
        store[sid]["status"] = document.getElementById("status").selectedIndex;
        
        browser.storage.sync.set(store).then(function() {
            document.getElementById("delete").disabled = false;
            update_list();
        });
    });
    
    document.getElementById("delete").addEventListener("click", function() {
        var sid = document.getElementById("sid").innerHTML;
        browser.storage.sync.remove([sid]).then(update_list);
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
                    document.getElementById("pendingtick").checked = items[sid]["pending"];
                    document.getElementById("userrating").value = items[sid]["rating"];
                    document.getElementById("comments").value = items[sid]["comments"];
                    document.getElementById("status").selectedIndex = items[sid]["status"];
                    document.getElementById("delete").disabled = false;
                } else {
                    document.getElementById("favtick").checked = false;
                    document.getElementById("readtick").checked = false;
                    document.getElementById("pendingtick").checked = false;
                    document.getElementById("userrating").value = "";
                    document.getElementById("comments").value = "";
                    document.getElementById("status").selectedIndex = response["status"];
                }
            });
        });
        
        browser.tabs.sendMessage(tabs[0].id, {"type": "get-user"}).then(function(response) {
            if (response["loggedin"]) {
                document.getElementById("notloggedin").hidden = true;
                document.getElementById("areloggedin").hidden = false;
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
    
    var filterinputs = document.getElementById("filters").childNodes;
    
    for (var i = 0; i < filterinputs.length; ++i) {
        if (filterinputs[i].tagName == "INPUT") {
            if (filterinputs[i].type == "checkbox") {
                filterinputs[i].addEventListener("click", update_list);
            }
            else if (filterinputs[i].type == "search") {
                filterinputs[i].addEventListener("keydown", update_list);
            }
        }
    }
    
    inbutton.addEventListener("click", function() {
        browser.storage.sync.clear().then(function(items) {
            browser.storage.sync.set(JSON.parse(databox.value)).then(function() {
                update_list();
            });
        });
    });
    
    update_list();
});
