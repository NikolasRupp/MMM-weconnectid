const Vehicle = {
	bonnetDoor: "closed",
	trunkDoor: "closed",
	frontLeftDoor: "closed",
	frontRightDoor: "closed",
	rearRightDoor: "closed",
	rearLeftDoor: "closed",
	overallStatus: "safe",
	frontLeftWindow: "closed",
	frontRightWindow: "closed",
	rearRightWindow: "closed",
	rearLeftWindow: "closed",
	chargePower: "0 kWh",
	chargingState: "",
	remainingSoC: "0 %",
	remainingKm: "0",
	remainingTime: "00:00",
	chargekmph: 0,
	targetSoC: "0 %",
	leftLight: "off",
	rightLight: "off",
	odometer: "0 km",
        electricRange: "0 km",
        gasolineRange: "0 km",
	climatisation: "off",
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
    	fields: '{"SOC":"remainingSoC","RANGE":"remainingKm","CLIMATE":"climatisation","ODOMETER":"odometer","LOADING TIME":"remainingTime","TARGET SOC":"targetSoC","LOADING POWER":"chargePower","KMPH":"chargekmph","POSITION":"position"}',
    	fields_charging : ["LOADING TIME","TARGET SOC","LOADING POWER","KMPH"],
    	number: 4,
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
                        en: "translations/en.json",
			de: "translations/de.json",
			fr: "translations/fr.json"
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
				div.style.background = "linear-gradient(to right,white "+ Vehicle.targetSoC.replace(/\D/g, '') + "%,transparent "+ Vehicle.targetSoC.replace(/\D/g, '') + "%,transparent)"
				td.appendChild(div);
				var div2 = document.createElement("div");
				div2.classList.add("progress-bar2-charging");
				div2.style.animation = "progress "+ (1000+(4000*Vehicle.remainingSoC.replace(/\D/g, '')/100)) + "ms infinite linear";
				div2.style.setProperty('--my-middle-width', (Vehicle.remainingSoC.replace(/\D/g, '')/2) + "%" );
				div2.style.setProperty('--my-end-width', Vehicle.remainingSoC.replace(/\D/g, '') + "%" );
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
				div2.style.width = (100 - Vehicle.remainingSoC.replace(/\D/g, ''))+ "%"
				div.appendChild(div2);
			}

			var tr = document.createElement("tr");
    		wrapper.appendChild(tr);
    		var table = document.createElement("table");
    		tr.append(table)

			var counter = 0
			var fieldJSON = JSON.parse(this.config.fields)
			for (const x in fieldJSON) {
				if ((Vehicle.chargingState === "charging" && this.config.fields_charging.includes(x)) || !this.config.fields_charging.includes(x)) {
					if (counter === 0){
						var tr_header = document.createElement("tr");
    					table.appendChild(tr_header);
    					var tr_text = document.createElement("tr");
    					table.appendChild(tr_text);
					}

					var th = document.createElement("th");
    				th.id = "text-table"
    				th.style.width = (100/this.config.number) + "%";
    				var text = document.createElement("p");
    				text.innerHTML = this.translate(x)
    				text.id = "info-header";
					th.appendChild(text);
    				tr_header.appendChild(th);

					var td = document.createElement("td");
    				td.id = "text-table"
    				td.style.width = (100/this.config.number) + "%";
    				var text = document.createElement("p");
    				text.innerHTML = this.translate(Vehicle[fieldJSON[x]]);
    				text.id = "info";
    				td.appendChild(text);
					tr_text.appendChild(td);

					if (counter+1 < this.config.number){
						counter = counter+1
					} else {
						counter = 0
					}
				}
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
				Vehicle.bonnetDoor = obj["bonnetDoor"]
				Vehicle.trunkDoor = obj["trunkDoor"]
				Vehicle.frontLeftDoor = obj["frontLeftDoor"]
				Vehicle.frontRightDoor = obj["frontRightDoor"]
				Vehicle.rearRightDoor = obj["rearRightDoor"]
				Vehicle.rearLeftDoor = obj["rearLeftDoor"]
				Vehicle.overallStatus = obj["overallStatus"]
				Vehicle.frontLeftWindow = obj["frontLeftWindow"]
				Vehicle.frontRightWindow = obj["frontRightWindow"]
				Vehicle.rearRightWindow = obj["rearRightWindow"]
				Vehicle.rearLeftWindow = obj["rearLeftWindow"]
				Vehicle.chargePower = obj["chargePower"] + " kWh"
				Vehicle.chargingState = obj["chargingState"]
				Vehicle.remainingSoC = obj["remainingSoC"] + " %"
				Vehicle.remainingTime = obj["remainingChargingTime"]
				Vehicle.remainingKm = obj["remainingKm"] + " km"
				Vehicle.targetSoC = obj["targetSoC"] + " %"
				Vehicle.chargekmph = obj["kmph"]
				Vehicle.leftLight = obj["leftLight"]
				Vehicle.rightLight = obj["rightLight"]
				Vehicle.odometer = obj["odometer"] + " km"
                                Vehicle.electricRange = obj["electricRange"] + " km"
                                Vehicle.gasolineRange = obj["gasolineRange"] + " km"
				if (obj["climatisation"] === "off") {
					Vehicle.climatisation = obj["climatisation"]
				} else {
					Vehicle.climatisation = obj["temperature"] + " °C"
				}
				Vehicle.timestamp = obj["timestamp"]
				Vehicle.latitude = obj["latitude"]
				Vehicle.longitude = obj["longitude"]
				Vehicle.position = ""
				for (i=0; i<this.config.positions.length; i++){
					distance = Math.acos(Math.sin((this.config.positions[i][1])*Math.PI/180) * Math.sin(Vehicle.latitude*Math.PI/180) + Math.cos((this.config.positions[i][1])*Math.PI/180) * Math.cos(Vehicle.latitude*Math.PI/180) * Math.cos(((this.config.positions[i][2])*Math.PI/180) - (Vehicle.longitude*Math.PI/180))) * 6371000
					if (distance <= this.config.positions[i][3]){
						Vehicle.position = this.config.positions[i][0]
					}
				}
				if (Vehicle.position === ""){
					Vehicle.position = obj["position"]
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
