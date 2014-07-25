// script.js
function newSticky() {
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
	console.log(this);
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
			console.log('lmo');
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
				console.log("mosueup");
				document.body.removeEventListener('mousemove', this);
				if (this.isBeingDragged) {
					this.isBeingDragged = false;
					this.sticky = new sticky(this.element);
					this.element.removeEventListener('mousedown', this);
					this.element.removeEventListener('mouseup', this);
				}
				break;
			case "mousemove":
				if (this.element.className != "sticky") this.element.className = "sticky";
				if (!this.isBeingDragged) {
					this.initialX = e.clientX - this.element.getBoundingClientRect().left;
					this.initialY = e.clientY - this.element.getBoundingClientRect().top;
					document.body.appendChild(new newSticky().element);
					this.isBeingDragged = true;
				}
				this.element.style.left = (e.clientX - this.initialX) + "px";
				this.element.style.top = (e.clientY - this.initialY) + "px";
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

function sticky(stickyElement) {
	this.element = stickyElement;
	this.isBeingDragged = false;

	this.handleEvent = function (e) {
		switch (e.type) {
			case "mousedown":
				if (e.toElement == this.element) document.body.addEventListener('mousemove', this);
				break;
			case "mouseup":
				console.log("mosueup");
				document.body.removeEventListener('mousemove', this);
				if (this.isBeingDragged) {
					this.isBeingDragged = false;
				}
				break;
			case "mousemove":
				if (this.element.className != "sticky") this.element.className = "sticky";
				if (!this.isBeingDragged) {
					this.initialX = e.clientX - this.element.getBoundingClientRect().left;
					this.initialY = e.clientY - this.element.getBoundingClientRect().top;
					this.isBeingDragged = true;
				}
				this.element.style.left = (e.clientX - this.initialX) + "px";
				this.element.style.top = (e.clientY - this.initialY) + "px";
				// console.log(e);
				break;
		}
	};

	this.element.addEventListener('mousedown', this);
	this.element.addEventListener('mouseup', this);
}