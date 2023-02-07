[![PyPI - Python Version](https://img.shields.io/pypi/pyversions/weconnect)](https://pypi.org/project/weconnect/)
[![GitHub](https://img.shields.io/github/license/NikolasRupp/MMM-weconnectid)](https://github.com/NikolasRupp/MMM-weconnectid/blob/master/LICENSE)

# MMM-weconnectid

A module to integrale informations from  [We Connect ID](https://www.volkswagen.de/de/besitzer-und-nutzer/myvolkswagen.html) into the [MagicMirror](https://github.com/MichMich/MagicMirror).

- [Alternative](#alternative)
- [Usage](#usage)
- [Credits](#credits)
- [Tested with](#tested-with)
- [Pictures](#pictures)

## I'am a beginner at Programming so I think there are a lot of better ways to implement it. Feel free to send an merge request.

## Alternative
This Module:

Advantage:
- Will use the Pictures provided by the API
- Location of your Car

Disadvantage:
- Only works with Python 3.9 or higher

[Alternative Module](https://github.com/NikolasRupp/MMM-weconnectid-alt):

Advantage:
- Works with nearly every Python Version

Disadvantage:
- No Pictures of your own car (Always a white ID.3)
- No Location of the Car

## Usage

### Installation

- You have to register your VW ID at [MyVolkswagen](https://www.volkswagen.de/de/besitzer-und-nutzer/myvolkswagen.html) and have a valid WE Connect ID subscription

- You need Python 3.9 or higher to connect to the Api. You can have a look [here](https://raspberrytips.com/install-latest-python-raspberry-pi/) on how to install it. Short it works like this:

```
cd ~
wget https://www.python.org/ftp/python/3.9.15/Python-3.9.15.tgz
tar -zxvf Python-3.9.15.tgz
cd Python-3.9.15
./configure --enable-optimizations
sudo make altinstall
```

If you use this description you need to set the python Parameter in the config to 3.9 and use python3.9 -m ... to install the packages.

- If not done you have to install some Packages via Pip.

```
pip install Pillow
pip install weconnect[Images]
```

If Python 3.9 is not your default Python Version your command should look something like this.

```
python3.9 -m pip install Pillow
python3.9 -m pip install weconnect[Images]
```

Have a look at the config Table to see how you set the Python version in the module.

- To use this module, clone this repository to your __modules__ folder of your MagicMirror:

```
cd ~/MagicMirror/modules
git clone https://github.com/NikolasRupp/MMM-weconnectid.git
```

- Now just add the module to your config.js file ([config entries](#configuration)).

### Configuration

The module needs the default configuration block in your config.js to work.

```javascript
{
  module: 'MMM-weconnectid',
  position: "top_left",
  config: {
    username: "",
    password: "",
    vin: "",
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
    positions: [],
  }
},
```

The following properties can be configured:

|Option|Description|Options|Default|Required|Type|
|---|---|---|---|---|---|
|username|Your Login E-Mail|-|-|yes|Text|
|password|Your Login Password|-|-|yes|Text|
|vin|The VIN of your Vehicle|-|-|yes|Text|
|fields|Fields that should be shown [More Information](#fields)|-|'{"SOC":"remainingSoC","RANGE":"remainingKm","CLIMATE":"climatisation","ODOMETER":"odometer","LOADING TIME":"remainingTime","TARGET SOC":"targetSoC","LOADING POWER":"chargePower","KMPH":"chargekmph","POSITION":"position"}'|no|Text|
|fields_charging|Fields that should be shown during charging [More Information](#fields)|-|["LOADING TIME","TARGET SOC","LOADING POWER","KMPH"]|no|List|
|number|Number of fields in each row|Any Number|4|no|Number|
|python|Python u want to use|Any Python higher than 3.9|"python3"|no|Text|
|maxHeight|Max Height of the Pictures|Any px or % value|"300px"|no|Text|
|maxWidth|Max Width of the Pictures|Any px or % value|"800px"|no|Text|
|remainingSOCyellow|Percentage when the Progress Bar of the Battery should be yellow|0-100|70|no|Number|
|remainingSOCred|Percentage when the Progress Bar of the Battery should be red|0-100|20|no|Number|
|barstyle|Style of the Progress Bar|"fluent", "strict"|"fluent"|no|Text|
|updateFrequency|Update Frequency|Any Value|600000|no|Number|
|timestamp|If the Timestamp should be shown. It shows the Date and time when the last update from the car was sent to the VW Server and the Time of the last Update of the Widget|true, false|true|no|Boolean|
|googleAPI|Googel Maps API Key if you want to convert the Position of the Vehicle to an Adress [More Information](#google-api)|-|-|no|Text|
|positions|Custom Names for the Parking Position of the Car [More Information](#positions)|-|-|no|List|

#### Fields

You can define which fields you want to see. The Format hast to be valid Json.
The key will be used as the Header in the Table. You can Name that whatever you like. If you name them like in the default they will be translated vie the translation file.

The following Attributes are available:

|Value|Description|
|---|---|
|bonnetDoor|Status of the Bonnet Door (Will also be shown in the Image, so not really necessary)|
|trunkDoor|Status of the Trunk Door (Will also be shown in the Image, so not really necessary)|
|frontLeftDoor|Status of the Front Left Door (Will also be shown in the Image, so not really necessary)|
|frontRightDoor|Status of the Front Right Door (Will also be shown in the Image, so not really necessary)|
|rearLeftDoor|Status of the Rear Left Door (Will also be shown in the Image, so not really necessary)|
|rearRightDoor|Status of the Rear Right Door (Will also be shown in the Image, so not really necessary)|
|overallStatus|If the Vehicle is locked (Will also be shown in the Image, so not really necessary)|
|frontLeftWindow|Status of the Front Left Window (Will also be shown in the Image, so not really necessary)|
|frontRightWindow|Status of the Front Right Window (Will also be shown in the Image, so not really necessary)|
|rearLeftWindow|Status of the Rear Left Window (Will also be shown in the Image, so not really necessary)|
|rearLRightWindow|Status of the Rear Right Window (Will also be shown in the Image, so not really necessary)|
|chargePower|Current Charging Power in kWh|
|chargingState|Current Charging State|
|remainingSoC|Remaining SoC in %|
|remainingTime|Remaining Charging Time in h:mm|
|remainingKm|Remaining km|
|targetSoC|Target SoC in %|
|chargekmph|Charging ... km/h|
|leftLight|Status of left Light|
|rightLight|Status of Right Light|
|odometer|Odometer in km|
|climatisation|Status of Climatisation (Will show the selected Temperature in °C if On|
|latitude|Latitude of the Car if parked|
|longitude|Longitude of the Car if parked|
|position|Position of the Car if parked|

If you want, that some Values like the remaining charging time will only be displayed during charging you can add the header to the list of the fields_charging Parameter.

#### Google Api

You can get your Google API Key [here](https://developers.google.com/maps/documentation/javascript/get-api-key?hl=de)

Unfortunately you need a Credit Card, even though you don't have to pay anything.

If you have logged in you can create an Project and call it whatever you like. In that Project you have to activate the Geocoding API and copy the API Key in the config file.

There is a Price for the API but you get 200$ every moth for free what are about 40.000 API requests, which are about 1 every Minute, which should be enough. You can read more about it [here](https://mapsplatform.google.com/intl/de/pricing/).

If you don't enter an API key the Location, if not defined in [Positions](#positions) will be shown as __unkown__.

#### Positions

Note: This also works without Google API Key

You can define Positions where your car is parked often. You can Enter as many locations as you want. To get the Latitude and Longitude you can use any website like [gps-coordinates.net](https://www.gps-coordinates.net/).

Each Position has to have the following Parameter

|Paramter|Description|Type|
|---|---|---|
|Name|Name of the description that should be shown|Text|
|Latitude|Latitude of the Postion|Number|
|Longitude|Longitude of the Position|Number|
|Radius|Radius around the Coordinates|Number|


An Example would be
```
[["Home",38.8796005249,-76.983428955,50],["Work",52.51385794,13.35827382,300]]
```

## Credits
This module uses [tillsteinbach/WeConnect-python](https://github.com/tillsteinbach/WeConnect-python) to connect to the API. Many thanks for that

## Tested with
- Volkswagen ID.3 Modelyear 2023

## Pictures
Fluent Progress Bar
![ProgressBarFluent](git/ProgressBar_fluent.png)

Strict Progress Bar
![ProgressBarStrict](git/ProgressBar_strict.png)

Normal View
![View](git/normal.png)

Unlocked Car
![Unlocked](git/normal_unlocked.png)

Open Door and Trunk
![Doors](git/normal_doors.png)

Open Door and Windows
![Window](git/normal_window.png)

Charging View
![ChargingView](git/charging.gif)
