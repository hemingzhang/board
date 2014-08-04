// script.js
function stickyController(containingElement){
	this.containingElement = containingElement;
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

stickyController.prototype.addSticky = function(element) {
	do {
		for(var l = ''; l.length < 5;) l+=alnumRandom();
	}
	while (this.stickies[l] !== undefined);

	this.stickies[l] = new sticky(element, this, l);
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
	this.currentDrag = undefined;
}

stickyController.prototype.deleteSticky = function(id) {
	this.containingElement.removeChild(this.stickies[id].element);
	delete this.stickies[id];
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
				if (e.toElement == this.element) document.body.addEventListener('mousemove', this);
				break;
			case "mouseup":
				document.body.removeEventListener('mousemove', this);
				if (this.isBeingDragged) {
					this.isBeingDragged = false;
					// this.sticky = new sticky(this.element);
					this.stickyController.addSticky(this.element);
					this.element.removeEventListener('mousedown', this);
					this.element.removeEventListener('mouseup', this);
				}
				break;
			case "mousemove":
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
	this.element.addEventListener('mouseup', this);

}

function sticky(stickyElement, stickyController, id) {
	this.element = stickyElement;
	this.stickyController = stickyController;

	this.isBeingDragged = false;

	this.id = id;
	this.element.setAttribute('sticky-id', id);

	this.handleEvent = function (e) {
		switch (e.type) {
			case "mousedown":
				if (e.toElement == this.element) {
					document.body.addEventListener('mousemove', this);
				}
				break;
			case "mouseup":
				document.body.removeEventListener('mousemove', this);
				if (this.isBeingDragged) {
					this.stickyController.stickyPutDown(this.id);
					this.isBeingDragged = false;
				}
				break;
			case "mousemove":
				if (this.element.className != "sticky") this.element.className = "sticky";
				if (!this.isBeingDragged) {
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
		}
	};

	this.element.addEventListener('mousedown', this);
	this.element.addEventListener('mouseup', this);
}

function alnumRandom() {
	return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'][Math.floor(Math.random() * 62)];
}