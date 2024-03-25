


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
	Vehicle : {
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

		if (this.Vehicle.status == 1 || (this.Vehicle.status == 0 && this.Vehicle.odometer != 0)) {
    		var img = document.createElement("img");
			img.src = 'modules/MMM-weconnectid/Pictures/' + this.identifier + '/car.png';
			img.style.maxWidth = "50%";
			img.style.maxHeight = this.config.maxHeight;
			img.id = "picture0";
			td.appendChild(img);
			var img = document.createElement("img");
			img.src = 'modules/MMM-weconnectid/Pictures/' + this.identifier +'/status.png';
			img.style.maxWidth = "50%";
			img.style.maxHeight = this.config.maxHeight;
			img.id = "picture0";
			td.appendChild(img);

			var text = document.createElement("p");
			if (this.Vehicle.overallStatus === "safe"){
    			text.innerHTML = '<i class="fa-solid fa-lock" style="color:#84dd63">'
    		} else {
    			text.innerHTML = '<i class="fa-solid fa-lock-open" style="color:#ee6352">'
    		}
    		if (this.Vehicle.chargingState === "readyForCharging" || this.Vehicle.chargingState === "charging"){
    			text.innerHTML = text.innerHTML + ' <i class="fa-solid fa-bolt" style="color:#84dd63">'
    		}
    		text.id = "lock"
    		td.append(text)

			var tr = document.createElement("tr");
    		wrapper.appendChild(tr);
    		var td = document.createElement("td");
			tr.appendChild(td);
			if (this.Vehicle.chargingState === "charging"){
				var div = document.createElement("div");
				div.classList.add("progress2");
				div.style.background = "linear-gradient(to right,white "+ this.Vehicle.targetSoC.replace(/\D/g, '') + "%,transparent "+ this.Vehicle.targetSoC.replace(/\D/g, '') + "%,transparent)"
				td.appendChild(div);
				var div2 = document.createElement("div");
				div2.classList.add("progress-bar2-charging");
				div2.style.animation = "progress "+ (1000+(4000*this.Vehicle.remainingSoC.replace(/\D/g, '')/100)) + "ms infinite linear";
				div2.style.setProperty('--my-middle-width', (this.Vehicle.remainingSoC.replace(/\D/g, '')/2) + "%" );
				div2.style.setProperty('--my-end-width', this.Vehicle.remainingSoC.replace(/\D/g, '') + "%" );
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
				div2.style.width = (100 - this.Vehicle.remainingSoC.replace(/\D/g, ''))+ "%"
				div.appendChild(div2);
			}

			var tr = document.createElement("tr");
    		wrapper.appendChild(tr);
    		var table = document.createElement("table");
    		tr.append(table)

			var counter = 0
			var fieldJSON = (typeof this.config.fields === 'string')?JSON.parse(this.config.fields):this.config.fields
			for (const x in fieldJSON) {
				if ((this.Vehicle.chargingState === "charging" && this.config.fields_charging.includes(x)) || !this.config.fields_charging.includes(x)) {
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
    				text.innerHTML = this.translate(this.Vehicle[fieldJSON[x]]);
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

		if (this.config.timestamp === true || this.Vehicle.status === 0 || this.Vehicle.status === -1){
			var tr = document.createElement("tr");
    		wrapper.appendChild(tr);
    		var td = document.createElement("td");
    		td.id = "text-table"
    		tr.appendChild(td);

			var text = document.createElement("p");
			if (this.Vehicle.status === -1){
    			text.innerHTML = this.translate("LOADING");
    		} else if (this.Vehicle.status === 1){
    			text.innerHTML = this.Vehicle.timestamp;
    		} else {
    			text.innerHTML = this.Vehicle.error;
    		}
    		text.id = "status";
    		td.appendChild(text);
    	}

    	return wrapper;
  },

  	start: function() {
		var self = this;
		var config = this.config
			self.sendSocketNotification("DO_PYTHON", { id: this.identifier, config: config });
		setInterval(() =>{
			self.sendSocketNotification("DO_PYTHON", { id: this.identifier, config: config });
    	}, config.updateFrequency);
  	},

  	socketNotificationReceived: function(notification, payload) {
  		var self = this;
			if (notification === "PYTHON_DONE") {
				// if this response is because of this modules request
				if (payload.id === this.identifier) {
					Log.log(notification);
					payload.data = payload.data.replace(/'/g, '"');
					const obj = JSON.parse(payload.data)
					//  this.Vehicle = obj  // quicker 
					if (obj["status"] === 1) {
						/* you could do this a quicker way, less code, most already set. += on string is append ) */
						/*
						this.Vehicle.chargePower  += " kWh"
						this.Vehicle.chargePower  += " kWh"
						this.Vehicle.remainingKm  += " km"
						this.Vehicle.targetSoC    += " %"
						this.Vehicle.odometer     += " km"
						this.Vehicle.electricRange  += " km"
						this.Vehicle.gasolineRange  += " km"
						// if climatisation has a value
						if (this.Vehicle.climatisation !== "off") {
							// append temp
							this.Vehicle.climatisation  += " °C"

						// save current value
						let tempPosition = this.Vehicle.position
						// recalc is possible
							for (i = 0; i < this.config.positions.length; i++) {
								distance = Math.acos(Math.sin((this.config.positions[i][1]) * Math.PI / 180) * Math.sin(this.Vehicle.latitude * Math.PI / 180) + Math.cos((this.config.positions[i][1]) * Math.PI / 180) * Math.cos(this.Vehicle.latitude * Math.PI / 180) * Math.cos(((this.config.positions[i][2]) * Math.PI / 180) - (this.Vehicle.longitude * Math.PI / 180))) * 6371000
								if (distance <= this.config.positions[i][3]) {
									tempPosition = this.config.positions[i][0]
								}
							}
						// if recalculated or original is set							
						if (tempPosition !== "") {
							// use it
							this.Vehicle.position = temPosition
						}
						*/
						/* if quicker all of this qould go away */
						this.Vehicle.bonnetDoor = obj["bonnetDoor"]
						this.Vehicle.trunkDoor = obj["trunkDoor"]
						this.Vehicle.frontLeftDoor = obj["frontLeftDoor"]
						this.Vehicle.frontRightDoor = obj["frontRightDoor"]
						this.Vehicle.rearRightDoor = obj["rearRightDoor"]
						this.Vehicle.rearLeftDoor = obj["rearLeftDoor"]
						this.Vehicle.overallStatus = obj["overallStatus"]
						this.Vehicle.frontLeftWindow = obj["frontLeftWindow"]
						this.Vehicle.frontRightWindow = obj["frontRightWindow"]
						this.Vehicle.rearRightWindow = obj["rearRightWindow"]
						this.Vehicle.rearLeftWindow = obj["rearLeftWindow"]
						this.Vehicle.chargePower = obj["chargePower"] + " kWh"
						this.Vehicle.chargingState = obj["chargingState"]
						this.Vehicle.chargePower = obj["chargePower"] + " kWh"
						this.Vehicle.remainingTime = obj["remainingChargingTime"]
						this.Vehicle.remainingKm = obj["remainingKm"] + " km"
						this.Vehicle.remainingSoC = obj["remainingSoC"] + " %"
						this.Vehicle.targetSoC = obj["targetSoC"] + " %"
						this.Vehicle.chargekmph = obj["kmph"]
						this.Vehicle.leftLight = obj["leftLight"]
						this.Vehicle.rightLight = obj["rightLight"]
						this.Vehicle.odometer = obj["odometer"] + " km"
						this.Vehicle.electricRange = obj["electricRange"] + " km"
						this.Vehicle.gasolineRange = obj["gasolineRange"] + " km"
						if (obj["climatisation"] === "off") {
							this.Vehicle.climatisation = obj["climatisation"]
						} else {
							this.Vehicle.climatisation = obj["temperature"] + " °C"
						}
						this.Vehicle.timestamp = obj["timestamp"]
						this.Vehicle.latitude = obj["latitude"]
						this.Vehicle.longitude = obj["longitude"]
						
						this.Vehicle.position = ""
						for (i = 0; i < this.config.positions.length; i++) {
							distance = Math.acos(Math.sin((this.config.positions[i][1]) * Math.PI / 180) * Math.sin(this.Vehicle.latitude * Math.PI / 180) + Math.cos((this.config.positions[i][1]) * Math.PI / 180) * Math.cos(this.Vehicle.latitude * Math.PI / 180) * Math.cos(((this.config.positions[i][2]) * Math.PI / 180) - (this.Vehicle.longitude * Math.PI / 180))) * 6371000
							if (distance <= this.config.positions[i][3]) {
								this.Vehicle.position = this.config.positions[i][0]
							}
						}
						if (this.Vehicle.position === "") {
							this.Vehicle.position = obj["position"]
						}
						this.Vehicle.status = obj["status"]
						/* if quicker end of go away */
					} else {
						// if quicker path, already set
						this.Vehicle.status = obj["status"]
						// if quicker , translate and replace
						this.Vehicle.error = this.translate(obj["error"])
					}
					self.updateDom();
				}
		} else {
			Log.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
		}
  	},
});
