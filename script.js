// script.js
function stickyController(containingElement, endpoint){
	this.containingElement = containingElement;
	this.endpoint = endpoint;
	this.addNewSticky();
	this.stickies = {};
	this.xButton = document.createElement('div');
	this.currentDrag = undefined;
	this.xButtonHover = false;

	this.xButton.className = "xButton";
	this.xButton.style.right = "8px";
	this.xButton.style.bottom = "8px";
	this.xButton.style.opacity = "0";
	this.xButton.appendChild(document.createElement('img'));
	this.xButton.children[0].src = "img/x.png";
	this.containingElement.appendChild(this.xButton);

	this.handleEvent = function(e) {
		// switch(e.toElement) {
		// 	case containingElement:
				switch(e.type) {
					case "mousemove":
						var xButtonRect = this.xButton.getBoundingClientRect();
						if (xButtonRect.left <= e.clientX && e.clientX <= xButtonRect.right
							&& xButtonRect.top <= e.clientY && e.clientY <= xButtonRect.bottom) {
							if (!this.xButtonHover) {
								this.xButtonHover = true;
								this.stickies[this.currentDrag].element.style.opacity = "0.5";
								this.xButton.style.backgroundColor = "#ff4444";
							}
						}
						else {
							if (this.xButtonHover) {
								this.xButtonHover = false;
								this.stickies[this.currentDrag].element.style.opacity = "1";
								this.xButton.style.backgroundColor = "#ff0000";
							}
						}
						break;
				}
				// break;
		// }
	}
}

stickyController.prototype.hitAPI = function(params){
	var controller = this;
	var xhr = new XMLHttpRequest();
	var query = "";
	for (key in params) query += (key + "=" + encodeURIComponent(params[key]) + "&");
	console.log(query);
	xhr.open("GET", this.endpoint + "?" + query + Date.now());
	xhr.onload = function(e) {
		controller.updateStickies(JSON.parse(this.responseText));
	}
	xhr.send();
}

stickyController.prototype.fetchStickies = function(){
	this.hitAPI({});
}

stickyController.prototype.updateStickies = function(newStickies) {
	//check for deletions
	for (stickyID in this.stickies) {
		if (newStickies[stickyID] === undefined) {
			this.deleteSticky(stickyID);
		}
	}

	for (stickyID in newStickies) {
		if (this.stickies[stickyID] === undefined) {
			this.createSticky(newStickies[stickyID].x, 
				newStickies[stickyID].y,
				newStickies[stickyID].content,
				stickyID);
		}
		else {
			// update sticky
			this.stickies[stickyID].x = newStickies[stickyID].x;
			this.stickies[stickyID].y = newStickies[stickyID].y;
			this.stickies[stickyID].content = newStickies[stickyID].content;
			console.log(newStickies[stickyID].content);
			this.stickies[stickyID].refreshElement();
		}
	}
}

stickyController.prototype.createSticky = function (x, y, content, id) {
	this.stickies[id] = new sticky(this.createStickyElement(x, y, content), this, id);
	this.stickies[id].x = x;
	this.stickies[id].y = y;
	this.stickies[id].content = content;
}

stickyController.prototype.createStickyElement = function(x, y, content) {
	var element = document.createElement('div');
	element.className = "sticky";
	element.style.opacity = "0";

	var contentBlock = document.createElement('div');
	contentBlock.className = "stickyContentBlock";
	contentBlock.textContent = content;
	contentBlock.setAttribute("contenteditable", "true");

	element.appendChild(contentBlock);
	this.containingElement.appendChild(element);

	rect = this.containingElement.getBoundingClientRect();

	element.style.left = rect.left;
	element.style.top = rect.top;

	element.style.webkitTransform = element.style.transform = "translate(" + (x * (rect.right - rect.left))
		+ "px, " + (y * (rect.bottom - rect.top)) + "px)";
	element.style.opacity = "1";
	return element;
}

stickyController.prototype.addSticky = function(element) {
	do {
		for(var l = ''; l.length < 5;) l+=alnumRandom();
	}
	while (this.stickies[l] !== undefined);

	this.stickies[l] = new sticky(element, this, l);

	this.hitAPI({r: 'new', x: this.stickies[l].x, y: this.stickies[l].y, c: this.stickies[l].content, id:l});

}

stickyController.prototype.addNewSticky = function() {
	this.newSticky = new newSticky(this);
	this.containingElement.appendChild(this.newSticky.element);
}

stickyController.prototype.editSticky = function(id, value) {

}

stickyController.prototype.stickyPickUp = function(id) {
	this.xButton.style.opacity = "1";
	this.currentDrag = id;
	this.containingElement.addEventListener('mousemove', this);
}

stickyController.prototype.stickyPutDown = function(id) {
	this.xButton.style.opacity = "0";
	this.containingElement.removeEventListener('mousemove', this);
	if (this.xButtonHover == true) {
		this.deleteSticky(id);
	}
	else {
		this.stickies[id].updateAttributes();
		this.hitAPI({r: 'move', x: this.stickies[id].x, y: this.stickies[id].y, 'id': id});
	}
	this.currentDrag = undefined;
}

stickyController.prototype.deleteSticky = function(id) {
	console.log(id);
	this.containingElement.removeChild(this.stickies[id].element);
	delete this.stickies[id];
	this.hitAPI({r: 'delete', 'id': id});
}

function newSticky(stickyController) {
	this.stickyController = stickyController;

	this.element = document.createElement('div');
	this.element.className = "newStickyButton";

	this.plusElement = document.createElement('img');
	this.plusElement.className = "plusIcon";
	this.plusElement.src = "img/plus.png";
	this.element.appendChild(this.plusElement);

	this.plusElement.addEventListener('mouseover', this.plusHandler.bind(this));
	this.plusElement.addEventListener('mouseout', this.plusHandler.bind(this));
	this.plusElement.addEventListener('mousedown', this.plusHandler.bind(this));
	this.plusElement.addEventListener('mouseup', this.plusHandler.bind(this));
	this.plusElement.addEventListener('click', this.plusHandler.bind(this));

	this.isBeingDragged = false;
}

newSticky.prototype.plusHandler = function(e) {
	switch(e.type) {
		case "mouseover":
			this.plusElement.src = "img/plus_h.png";
			break;
		case "mousedown":
			this.plusElement.src = "img/plus_c.png";
			break;
		case "mouseup":
			this.plusElement.src = "img/plus_h.png";
			break;
		case "mouseout":
			this.plusElement.src = "img/plus.png";
			break;
		case "click":
			this.expand();
			break;
		case "transitionend":
			this.plusElement.removeEventListener('transitionend', this.plusHandler);
			this.plusElement.removeEventListener('webkitTransitionEnd', this.plusHandler);
			this.element.removeChild(this.plusElement);
			break;
		case "webkitTransitionEnd":
			this.plusElement.removeEventListener('transitionend', this.plusHandler);
			this.plusElement.removeEventListener('webkitTransitionEnd', this.plusHandler);
			this.element.removeChild(this.plusElement);
			break;
	}
}

newSticky.prototype.expand = function() {
	this.handleEvent = function (e) {
		switch (e.type) {
			case "mousedown":
				if (e.toElement == this.element) {
					document.body.addEventListener('mousemove', this);
					document.body.addEventListener('mouseup', this);
				}
				break;
			case "mouseup":
				document.body.removeEventListener('mousemove', this);
				document.body.removeEventListener('mouseup', this);
				if (this.isBeingDragged) {
					this.isBeingDragged = false;
					// this.sticky = new sticky(this.element);
					this.stickyController.addSticky(this.element);
					this.element.removeEventListener('mousedown', this);
				}
				break;
			case "mousemove":
				console.log(e);
				if (this.element.className != "sticky") this.element.className = "sticky";
				if (!this.isBeingDragged) {
					this.initialX = e.clientX - (this.element.getBoundingClientRect().left 
						- this.stickyController.containingElement.getBoundingClientRect().left);
					this.initialY = e.clientY - (this.element.getBoundingClientRect().top
						- this.stickyController.containingElement.getBoundingClientRect().top);
					// document.body.appendChild(new newSticky().element);
					this.stickyController.addNewSticky();
					this.isBeingDragged = true;
				}
				// this.element.style.left = (e.clientX - this.initialX) + "px";
				// this.element.style.top = (e.clientY - this.initialY) + "px";
				// console.log("initialX: " + this.initialX + " clientX: " + e.clientX + " gBCR.left: " + this.element.getBoundingClientRect().left);
				this.element.style.webkitTransform = this.element.style.transform =  "translate(" + (e.clientX - this.initialX)
					+ "px, " + (e.clientY - this.initialY) + "px)";
				// console.log(e);
				break;
			case "webkitTransitionEnd":
			case 'transitionend':
				this.element.removeEventListener('transitionend', this);
				this.element.removeEventListener('webkitTransitionEnd', this);
				this.element.className = "newStickyButtonExpanded noTransition";
				this.contentBlockElement = document.createElement('div');
				this.contentBlockElement.className = "stickyContentBlock";
				this.contentBlockElement.setAttribute('contenteditable', 'true');
				this.element.appendChild(this.contentBlockElement);
				this.contentBlockElement.focus();
				this.element.className = "newStickyButtonExpanded";
				break;
		}

	};

	this.plusElement.removeEventListener('click', this.plusHandler.bind(this));
	this.plusElement.removeEventListener('mouseover', this.plusHandler.bind(this));
	this.plusElement.removeEventListener('mouseout', this.plusHandler.bind(this));
	this.plusElement.removeEventListener('mousedown', this.plusHandler.bind(this));
	this.plusElement.removeEventListener('mouseup', this.plusHandler.bind(this));

	this.plusElement.addEventListener('transitionend', this.plusHandler.bind(this));
	this.plusElement.addEventListener('webkitTransitionEnd', this.plusHandler.bind(this));

	this.plusElement.addEventListener('transitionend', this);
	this.plusElement.addEventListener('webkitTransitionEnd', this);

	this.element.className += " newStickyButtonExpanding";
	this.plusElement.className += " plusIconInvisible";

	this.element.addEventListener('mousedown', this);
	// this.element.addEventListener('mouseup', this);

}

function sticky(stickyElement, stickyController, id) {
	this.element = stickyElement;
	this.contentBlockElement = this.element.children[0];
	this.stickyController = stickyController;

	this.updateAttributes();

	this.isBeingDragged = false;

	this.id = id;
	this.element.setAttribute('sticky-id', id);

	this.handleEvent = function (e) {
		switch (e.type) {
			case "mousedown":
				if (e.toElement == this.element) {
					document.body.addEventListener('mousemove', this);
					document.body.addEventListener('mouseup', this);
				}
				break;
			case "mouseup":
				document.body.removeEventListener('mousemove', this);
				document.body.removeEventListener('mouseup', this);
				if (this.isBeingDragged) {
					this.stickyController.stickyPutDown(this.id);
					this.isBeingDragged = false;
					this.element.className = "sticky";
					this.updateAttributes();
				}
				break;
			case "mousemove":
				if (!this.isBeingDragged) {
					if (this.element.className != "sticky unselectable") this.element.className = "sticky unselectable";
					this.stickyController.stickyPickUp(this.id);
					this.initialX = e.clientX - (this.element.getBoundingClientRect().left 
						- this.stickyController.containingElement.getBoundingClientRect().left);
					this.initialY = e.clientY - (this.element.getBoundingClientRect().top
						- this.stickyController.containingElement.getBoundingClientRect().top);
					this.isBeingDragged = true;
				}
				// this.element.style.left = (e.clientX - this.initialX) + "px";
				// this.element.style.top = (e.clientY - this.initialY) + "px";
				// console.log("initialX: " + this.initialX + " clientX: " + e.clientX + " gBCR.left: " + this.element.getBoundingClientRect().left);
				this.element.style.webkitTransform = this.element.style.transform = "translate(" + (e.clientX - this.initialX)
					+ "px, " + (e.clientY - this.initialY) + "px)";
				// console.log(e);
				break;
			case "webkitTransitionEnd":
			case "transitionend":
				this.element.removeEventListener("webkitTransitionEnd", this);
				this.element.removeEventListener("transitionend", this);

				this.element.className = "sticky";
				break;
		}
	};

	this.element.addEventListener('mousedown', this);
}


sticky.prototype.refreshElement = function() {
	rect = this.stickyController.containingElement.getBoundingClientRect();

	this.contentBlockElement.textContent = this.content;

	this.element.className = "sticky moveTransition";

	this.element.addEventListener('webkitTransitionEnd', this);
	this.element.addEventListener('transitionend', this);

	this.element.style.left = rect.left;
	this.element.style.top = rect.top;

	this.element.style.webkitTransform = this.element.style.transform = "translate(" + (this.x * (rect.right - rect.left))
		+ "px, " + (this.y * (rect.bottom - rect.top)) + "px)";
}

sticky.prototype.updateAttributes = function() {
	var cRect = this.stickyController.containingElement.getBoundingClientRect();
	var rect = this.element.getBoundingClientRect();

	this.x = (rect.left / (cRect.right - cRect.left));
	this.y = (rect.top / (cRect.bottom - cRect.top));
	this.content = this.contentBlockElement.textContent;
}

function alnumRandom() {
	return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'][Math.floor(Math.random() * 62)];
}