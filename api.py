try:
  from PIL import Image
  from weconnect import weconnect, addressable
  import json
  from sys import argv
  import requests
  from datetime import datetime, timezone
  import time
  import os
except ModuleNotFoundError as e:
  output = {
    "status": 0,
    "error": str(e).replace("'","") + '. Please install it via Pip',
  }
  print(output)
  exit()

def saveElement(element, flags):
    """Simple callback for saving the pictures
    Args:
        element (AddressableObject): Object for which an event occured
        flags (AddressableLeaf.ObserverEvent): Information about the type of the event
    """
    del flags
    if isinstance(element, addressable.AddressableAttribute) and element.valueType == Image.Image:
        if element.localAddress == "car" or element.localAddress == "status":
          if os.path.exists(f'{argv[4]}/{element.localAddress}.png'):
            os.remove(f'{argv[4]}/{element.localAddress}.png')
          element.saveToFile(f'{argv[4]}/{element.localAddress}.png')

found_vin = ""
timestamp = 0
try:
  weConnect = weconnect.WeConnect(username=argv[1], password=argv[2], updateAfterLogin=False, loginOnInit=False)
  weConnect.login()
  weConnect.addObserver(saveElement, addressable.AddressableLeaf.ObserverEvent.VALUE_CHANGED)
  weConnect.update()
except Exception as e:
  output = {
    "status": 0,
    "error": str(e).replace("'",""),
  }
  print(output)
  exit()

try:
  for vin, vehicles in weConnect.vehicles.items():
      if vin == argv[3]:
          # print(vehicles)
          vehicle = json.loads(vehicles.toJSON())
          # print(vehicle)
          if vehicle["role"] != "PRIMARY_USER":
            output = {
              "status": 0,
              "error": f"User must be Main User not {vehicle['role']}",
            }
            print(output)
            exit()
          if "domains" not in vehicle.keys():
            output = {
              "status": 0,
              "error": "Connection not available. Try again later",
            }
            print(output)
            exit()
          for key1 in vehicle["domains"].keys():
            for key2 in vehicle["domains"][key1].keys():
              if "carCapturedTimestamp" in vehicle["domains"][key1][key2].keys():
                temp_timestamp = datetime.timestamp(datetime.strptime(vehicle["domains"][key1][key2]["carCapturedTimestamp"],'%Y-%m-%dT%H:%M:%S+00:00'))
                if temp_timestamp > timestamp:
                  timestamp = temp_timestamp
          timestamp = datetime.fromtimestamp(timestamp).replace(tzinfo=timezone.utc).astimezone(tz=None).strftime("%d.%m.%Y %H:%M")
          if "parking" in vehicle['domains']:
            latitude = vehicle['domains']['parking']['parkingPosition']['latitude']
            longitude = vehicle['domains']['parking']['parkingPosition']['longitude']
            if len(argv) == 6:
              r = requests.get(f"https://maps.googleapis.com/maps/api/geocode/json?latlng={latitude},{longitude}&key={argv[5]}")
              if r.status_code not in range(200, 299):
                position = "UNKNOWN"
              else:
                result = r.json()
                if "error_message" in result.keys():
                  output = {
                    "status": 0,
                    "error": result["error_message"],
                  }
                  print(output)
                  exit()
                else:
                  result = r.json()
                  if result["results"][0]["address_components"][0]["types"][0] == "premise":
                    position = f'{result["results"][0]["address_components"][0]["long_name"]}, {result["results"][0]["address_components"][3]["long_name"]}'
                  else:
                    position = result["results"][0]["formatted_address"]
            else:
              position = "UNKNOWN"
          else:
            latitude = 0
            longitude = 0
            position = "DRIVING"
          fields = {"bonnetDoor":["domains","access","accessStatus","doors","bonnet","openState"],
                    "trunkDoor":["domains","access","accessStatus","doors","trunk","openState"],
                    "rearRightDoor":["domains","access","accessStatus","doors","rearRight","openState"],
                    "rearLeftDoor":["domains","access","accessStatus","doors","rearLeft","openState"],
                    "frontRightDoor":["domains","access","accessStatus","doors","frontRight","openState"],
                    "frontLeftDoor":["domains","access","accessStatus","doors","frontLeft","openState"],
                    "rearRightWindow":["domains","access","accessStatus","windows","rearRight","openState"],
                    "rearLeftWindow":["domains","access","accessStatus","windows","rearLeft","openState"],
                    "frontRightWindow":["domains","access","accessStatus","windows","frontRight","openState"],
                    "frontLeftWindow":["domains","access","accessStatus","windows","frontLeft","openState"],
                    "overallStatus": ["domains","access","accessStatus","overallStatus"],
                    "rightLight": ["domains","vehicleLights","lightsStatus","lights","right","status"],
                    "leftLight": ["domains","vehicleLights","lightsStatus","lights","left","status"],
                    "remainingKm": ["domains","charging","batteryStatus","cruisingRangeElectric_km"],
                    "remainingSoC": ["domains","charging","batteryStatus","currentSOC_pct"],
                    "remainingChargingTime": ["domains", "charging", "chargingStatus", "remainingChargingTimeToComplete_min"],
                    "chargingState": ["domains","charging","chargingStatus","chargingState"],
                    "chargePower": ["domains","charging","chargingStatus","chargePower_kW"],
                    "targetSoC": ["domains","charging","chargingSettings","targetSOC_pct"],
                    "kmph": ["domains","charging","chargingStatus","chargeRate_kmph"],
                    "odometer": ["domains", "measurements", "odometerStatus", "odometer"],
                    "climatisation": ["domains","climatisation","climatisationStatus","climatisationState"],
                    "temperature": ["domains","climatisation","climatisationSettings","targetTemperature_C"],
                    "model": ["model"]
                    }
          output = {}
          for key in fields.keys():
            value = vehicle
            for field in fields.get(key):
              try:
                value = value[field]
              except:
                value = 0
                break
            output[key] = value
          output["timestamp"] = f'{timestamp} - ({datetime.now().strftime("%H:%M")})'
          output["remainingChargingTime"] = time.strftime("%H:%M", time.gmtime(output.get("remainingChargingTime",0) * 60))
          output["odometer"] = f'{output.get("odometer",0):,}'.replace(",", ".")
          output["latitude"] = latitude
          output["longitude"] = longitude
          output["position"] = position
          output["status"] = 1
          output["error"] = ""
          print(output)
          exit()
      else:
        found_vin += f" {vin}"
  output = {
    "status": 0,
    "error": f"Vin not found. Found:{found_vin}",
  }
  print(output)
  exit()

except Exception as e:
    output = {
        "status": 0,
        "error": str(e).replace("'",""),
    }
    print(output)
    exit()

