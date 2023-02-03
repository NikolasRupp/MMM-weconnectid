const Vehicle = {
	bonnetDoor: "open",
	trunkDoor: "open",
	frontLeftDoor: "open",
	frontRightDoor: "open",
	rearRightDoor: "open",
	rearLeftDoor: "open",
	overallStatus: "safe",
	frontLeftWindow: "open",
	frontRightWindow: "open",
	rearRightWindow: "open",
	rearLeftWindow: "open",
	chargePower: 0,
	chargingState: "",
	remainingSoC: 0,
	remainingKm: 0,
	chargekmph: 0,
	targetSoC: 0,
	leftLight: "off",
	rightLight: "off",
	odometer: 0,
	climatisation: "off",
	temperature: 0,
	timestamp: "",
	latitude: 0,
	longitude: 0,
	position: "",
	status: -1,
	error: "",
}


Module.register("MMM-weconnectid", {
  	// Default module config.
  	defaults: {
    	username: "test@test.com",
    	password: "password",
    	vin: "WV00000000000000",
    	python: "python3",
    	maxHeight: "300px",
    	maxWidth: "800px",
    	remainingSOCyellow: 70,
    	remainingSOCred: 20,
    	barstyle: "fluent",
    	updateFrequency: 600000,
    	timestamp: true,
    	googleAPI: "",
    	positions: []
	},

	getStyles: function() {
		return [
			'font-awesome.css',
			this.file('MMM-weconnectid.css'),
		]
	},

	getTranslations: function() {
		return {
			de: "translations/de.json"
		}
	},

  	// Override dom generator.
  	getDom: function () {
    	var wrapper = document.createElement("table");
    	wrapper.style.maxWidth = this.config.maxWidth;
    	var tr = document.createElement("tr");
    	wrapper.appendChild(tr);
    	var td = document.createElement("td");
    	td.style.Width = this.config.maxWidth;
		td.style.Height = this.config.maxHeight;
		td.style.position = "relative"
    	tr.appendChild(td);

		if (Vehicle.status == 1 || (Vehicle.status == 0 && Vehicle.odometer != 0)) {
    		var img = document.createElement("img");
			img.src = 'modules/MMM-weconnectid/Pictures/car.png';
			img.style.maxWidth = "50%";
			img.style.maxHeight = this.config.maxHeight;
			img.id = "picture0";
			td.appendChild(img);
			var img = document.createElement("img");
			img.src = 'modules/MMM-weconnectid/Pictures/status.png';
			img.style.maxWidth = "50%";
			img.style.maxHeight = this.config.maxHeight;
			img.id = "picture0";
			td.appendChild(img);

			var text = document.createElement("p");
			if (Vehicle.overallStatus === "safe"){
    			text.innerHTML = '<i class="fa-solid fa-lock" style="color:#84dd63">'
    		} else {
    			text.innerHTML = '<i class="fa-solid fa-lock-open" style="color:#ee6352">'
    		}
    		if (Vehicle.chargingState === "readyForCharging" || Vehicle.chargingState === "charging"){
    			text.innerHTML = text.innerHTML + ' <i class="fa-solid fa-bolt" style="color:#84dd63">'
    		}
    		text.id = "lock"
    		td.append(text)

			var tr = document.createElement("tr");
    		wrapper.appendChild(tr);
    		var td = document.createElement("td");
			tr.appendChild(td);
			if (Vehicle.chargingState === "charging"){
				var div = document.createElement("div");
				div.classList.add("progress2");
				div.style.background = "linear-gradient(to right,white "+ Vehicle.targetSoC + "%,transparent "+ Vehicle.targetSoC + "%,transparent)"
				td.appendChild(div);
				var div2 = document.createElement("div");
				div2.classList.add("progress-bar2-charging");
				div2.style.animation = "progress "+ (1000+(4000*Vehicle.remainingSoC/100)) + "ms infinite linear";
				div2.style.setProperty('--my-middle-width', (Vehicle.remainingSoC/2) + "%" );
				div2.style.setProperty('--my-end-width', Vehicle.remainingSoC + "%" );
				div.appendChild(div2);
			} else {
				var div = document.createElement("div");
				div.classList.add("progress2");
				if (this.config.barstyle === "fluent"){
					div.style.background = "linear-gradient(to right,#ee6352 " + this.config.remainingSOCred + "%,#f5b700 " + this.config.remainingSOCyellow + "%,#84dd63 100%)"
				} else {
					div.style.background = "linear-gradient(to right,#ee6352 " + this.config.remainingSOCred + "%,#f5b700 " + this.config.remainingSOCred + "%,#f5b700 " + this.config.remainingSOCyellow + "%,#84dd63 " + this.config.remainingSOCyellow + "%,#84dd63 100%)"
				}
				td.appendChild(div);
				var div2 = document.createElement("div");
				div2.classList.add("progress-bar2");
				div2.style.width = (100 - Vehicle.remainingSoC)+ "%"
				div.appendChild(div2);
			}

			var tr = document.createElement("tr");
    		wrapper.appendChild(tr);
    		var table = document.createElement("table");
    		tr.append(table)

			var tr = document.createElement("tr");
    		table.appendChild(tr);
    		var th = document.createElement("th");
    		th.id = "text-table"
    		var text = document.createElement("p");
    		text.innerHTML = this.translate("SOC")
    		text.id = "info-header";
			th.appendChild(text);
    		tr.appendChild(th);
    		var th = document.createElement("th");
    		th.id = "text-table"
    		var text = document.createElement("p");
    		text.innerHTML = this.translate("RANGE")
    		text.id = "info-header";
    		th.appendChild(text);
    		tr.appendChild(th);
    		var th = document.createElement("th");
    		th.id = "text-table"
    		var text = document.createElement("p");
    		text.innerHTML = this.translate("CLIMATE")
    		text.id = "info-header";
    		th.appendChild(text);
    		tr.appendChild(th);
    		var th = document.createElement("th");
    		th.id = "text-table"
    		var text = document.createElement("p");
    		text.innerHTML = this.translate("ODOMETER")
    		text.id = "info-header";
    		th.appendChild(text);
    		tr.appendChild(th);

    		var tr = document.createElement("tr");
    		table.appendChild(tr);
    		var td = document.createElement("td");
    		td.id = "text-table"
    		var text = document.createElement("p");
    		text.innerHTML = Vehicle.remainingSoC + " %";
    		text.id = "info";
    		td.appendChild(text);
			tr.appendChild(td);
    		var td = document.createElement("td");
    		td.id = "text-table"
    		var text = document.createElement("p");
    		text.innerHTML = Vehicle.remainingKm + " km";
    		text.id = "info";
    		td.appendChild(text);
			tr.appendChild(td);
			var td = document.createElement("td");
    		td.id = "text-table"
    		var text = document.createElement("p");
    		if (Vehicle.climatisation === "off"){
    			text.innerHTML = this.translate("OFF")
    		} else {
    			text.innerHTML = Vehicle.temperature + " °C"
    		}
    		text.id = "info";
    		td.appendChild(text);
			tr.appendChild(td);
			var td = document.createElement("td");
    		td.id = "text-table"
    		var text = document.createElement("p");
    		text.innerHTML = Vehicle.odometer + " km";
    		text.id = "info";
    		td.appendChild(text);
			tr.appendChild(td);


			var tr = document.createElement("tr");
    		table.appendChild(tr);
    		var th = document.createElement("th");
    		th.id = "text-table"
    		var text = document.createElement("p");
    		text.innerHTML = this.translate("POSITION")
    		text.id = "info-header";
			th.appendChild(text);
    		tr.appendChild(th);

    		if (Vehicle.chargingState === "charging"){
    			var th = document.createElement("th");
    			th.id = "text-table"
    			var text = document.createElement("p");
    			text.innerHTML = this.translate("TARGET SOC")
    			text.id = "info-header";
				th.appendChild(text);
    			tr.appendChild(th);
    			var th = document.createElement("th");
    			th.id = "text-table"
    			var text = document.createElement("p");
    			text.innerHTML = this.translate("LOADING CURRENT")
    			text.id = "info-header";
    			th.appendChild(text);
    			tr.appendChild(th);
    			var th = document.createElement("th");
    			th.id = "text-table"
    			var text = document.createElement("p");
    			text.innerHTML = this.translate("KMPH")
    			text.id = "info-header";
    			th.appendChild(text);
    			tr.appendChild(th);
			}

    		var tr = document.createElement("tr");
    		table.appendChild(tr);
    		var td = document.createElement("td");
    		td.id = "text-table"
    		var text = document.createElement("p");
    		text.innerHTML = this.translate(Vehicle.position);
    		text.id = "info";
    		td.appendChild(text);
			tr.appendChild(td);

			if (Vehicle.chargingState === "charging"){
    			var td = document.createElement("td");
    			td.id = "text-table"
    			var text = document.createElement("p");
    			text.innerHTML = Vehicle.targetSoC + " %";
    			text.id = "info";
    			td.appendChild(text);
				tr.appendChild(td);
				var td = document.createElement("td");
    			td.id = "text-table"
    			var text = document.createElement("p");
    			text.innerHTML = Vehicle.chargePower + " kWh";
    			text.id = "info";
    			td.appendChild(text);
				tr.appendChild(td);
				var td = document.createElement("td");
    			td.id = "text-table"
    			var text = document.createElement("p");
    			text.innerHTML = Vehicle.chargekmph;
    			text.id = "info";
    			td.appendChild(text);
				tr.appendChild(td);
    		}

		}

		if (this.config.timestamp === true || Vehicle.status === 0 || Vehicle.status === -1){
			var tr = document.createElement("tr");
    		wrapper.appendChild(tr);
    		var td = document.createElement("td");
    		td.id = "text-table"
    		tr.appendChild(td);

			var text = document.createElement("p");
			if (Vehicle.status === -1){
    			text.innerHTML = this.translate("LOADING");
    		} else if (Vehicle.status === 1){
    			text.innerHTML = Vehicle.timestamp;
    		} else {
    			text.innerHTML = Vehicle.error;
    		}
    		text.id = "status";
    		td.appendChild(text);
    	}

    	return wrapper;
  },

  	start: function() {
		var self = this;
		var config = this.config
		self.sendSocketNotification("DO_PYTHON", config);
		setInterval(function() {
            self.sendSocketNotification("DO_PYTHON", config);
    	}, this.config.updateFrequency);
  	},

  	socketNotificationReceived: function(notification, payload) {
  		var self = this;
		if (notification === "PYTHON_DONE") {
			Log.log(notification);
			payload = payload.replace(/'/g, '"');
			const obj = JSON.parse(payload)
			if (obj["status"] === 1) {
				Vehicle.bonnetDoor = obj["access"]["doors"]["bonnet"]
				Vehicle.trunkDoor = obj["access"]["doors"]["trunk"]
				Vehicle.frontLeftDoor = obj["access"]["doors"]["frontLeft"]
				Vehicle.frontRightDoor = obj["access"]["doors"]["frontRight"]
				Vehicle.rearRightDoor = obj["access"]["doors"]["rearRight"]
				Vehicle.rearLeftDoor = obj["access"]["doors"]["rearLeft"]
				Vehicle.overallStatus = obj["access"]["overallStatus"]
				Vehicle.frontLeftWindow = obj["access"]["windows"]["frontLeft"]
				Vehicle.frontRightWindow = obj["access"]["windows"]["frontRight"]
				Vehicle.rearRightWindow = obj["access"]["windows"]["rearRight"]
				Vehicle.rearLeftWindow = obj["access"]["windows"]["rearLeft"]
				Vehicle.chargePower = obj["charging"]["chargePower"]
				Vehicle.chargingState = obj["charging"]["chargingState"]
				Vehicle.remainingSoC = obj["charging"]["remainingSoC"]
				Vehicle.remainingKm = obj["charging"]["remainingKm"]
				Vehicle.targetSoC = obj["charging"]["targetSoC"]
				Vehicle.chargekmph = obj["charging"]["kmph"]
				Vehicle.leftLight = obj["lights"]["left"]
				Vehicle.rightLight = obj["lights"]["right"]
				Vehicle.odometer = obj["measurements"]["odometer"]
				Vehicle.climatisation = obj["climatisation"]["status"]
				Vehicle.temperature = obj["climatisation"]["temperature"]
				Vehicle.timestamp = obj["measurements"]["timestamp"]
				Vehicle.latitude = obj["parking"]["latitude"]
				Vehicle.longitude = obj["parking"]["longitude"]
				Vehicle.position = ""
				for (i=0; i<this.config.positions.length; i++){
					distance = Math.acos(Math.sin((this.config.positions[i][1])*Math.PI/180) * Math.sin(Vehicle.latitude*Math.PI/180) + Math.cos((this.config.positions[i][1])*Math.PI/180) * Math.cos(Vehicle.latitude*Math.PI/180) * Math.cos(((this.config.positions[i][2])*Math.PI/180) - (Vehicle.longitude*Math.PI/180))) * 6371000
					if (distance <= this.config.positions[i][3]){
						Vehicle.position = this.config.positions[i][0]
					}
				}
				if (Vehicle.position === ""){
					Vehicle.position = obj["parking"]["position"]
     			}
				Vehicle.status = obj["status"]
			} else {
				Vehicle.status = obj["status"]
				Vehicle.error = this.translate(obj["error"])
			}
			self.updateDom();
		} else {
			Log.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
		}
  	},
});
