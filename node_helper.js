var NodeHelper = require("node_helper");
const spawn = require("child_process").spawn;
const once = require("events").once
const path = require("path")
const exec = require('child_process').exec

module.exports = NodeHelper.create({

    init() {
    },

    start() {
    },

    stop() {
    },

    // If notification of the main.js file is received, the node_helper will do this here:
    socketNotificationReceived(notification, payload) {
        if (notification === "DO_PYTHON") {
            //payload.config = payload
            this.api(payload);
        } else {
            console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
        }
    },

	api(payload) {
	    var self = this;
		let hand
		hand = exec(payload.config.python + " --version");
		hand.stdout.on('data', (data) => {
			var py_version_main = data.match(/[0-9]+/sg)[0]
			var py_version_second = data.match(/[0-9]+/sg)[1]
    		if (py_version_main >= 3 && py_version_second >= 9){
    			let handler
	    		if (payload.config.googleAPI === ""){
					handler = spawn(payload.config.python, ["-u",__dirname+path.sep+"api.py",payload.config.username,payload.config.password,payload.config.vin,__dirname+path.sep+"Pictures"]);
				} else {
					handler = spawn(payload.config.python, ["-u",__dirname+path.sep+"api.py",payload.config.username,payload.config.password,payload.config.vin,__dirname+path.sep+"Pictures",payload.config.googleAPI]);
				}
				handler.stdout.on('data', (data) => {
					console.log("Got data from weconnectid for VIN " + payload.config.vin)
					// send the request ID back on the response, so the right modules instance can tell which response goes with its request
					this.sendSocketNotification("PYTHON_DONE", { id: payload.id, data: data.toString() })
				})
    		} else {
				this.sendSocketNotification("PYTHON_DONE", { id: payload.id, data: "{'status': 0,'error': 'You need to have Python 3.9 or higher. Current Version: " + py_version_main + "." + py_version_second + "'}" })
    		}
		});
	}
});
