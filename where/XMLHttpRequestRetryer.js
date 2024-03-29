////////////////
// Gabe Joseph
// 2012

//Wrapper for XMLHttpRequest to re-run a request a specified number of times until success
//Calls the onSuccess method with the response text as an argument; calls onFail when requests "time out"
function XMLHttpRequestRetryer(retries) {
	this.triesRemaining = (retries) ? retries : 3;
	this.onSuccess = null;
	this.onFail = null;
	//PRIVATE
	this.xmlhttp = new XMLHttpRequest();
	this.params = null; //save params passed with open() to make a new XMLHttpRequest on retry
}
XMLHttpRequestRetryer.prototype.setTries = function(num) {
	if (num > 0) this.triesRemaining = num;
}
XMLHttpRequestRetryer.prototype.open = function(method, url, async) {
	this.params = { method: method, url: url, async: async, tries: this.triesRemaining};
	this.xmlhttp.open(method, url, async);
}
XMLHttpRequestRetryer.prototype.send = function() {
	var retryer = this;	//so the onreadystatechange function can get back to the calling object
	this.xmlhttp.onreadystatechange = function() {
		if (retryer.xmlhttp.readyState == 4) {
			if (retryer.xmlhttp.status == 200) {
				retryer.triesRemaining = 0;
				if (retryer.onSuccess) retryer.onSuccess( retryer.xmlhttp.responseText );
			} else {
				if (retryer.triesRemaining > 0) {
					retryer.triesRemaining--;
					retryer.xmlhttp.open(retryer.params.method, retryer.params.url, retryer.params.async);
					retryer.xmlhttp.send();
				}
				else if (retryer.onFail) retryer.onFail();
			}
		}
	};
	this.xmlhttp.send();
}
XMLHttpRequestRetryer.prototype.retry = function() {
	if (this.params) {
		this.xmlhttp.open(this.params.method, this.params.url, this.params.async);
		this.triesRemaining = this.params.triesRemaining;
		this.xmlhttp.send();
	} else
		console.log('XMLHttpRequestRetryer must be opened before it can be retried');
}

//TODO: null checking for functions