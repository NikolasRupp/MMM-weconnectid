import PIL
from weconnect import weconnect, addressable
import json
from sys import argv
import requests
from datetime import datetime, timezone

def saveElement(element, flags):
    """Simple callback for saving the pictures
    Args:
        element (AddressableObject): Object for which an event occured
        flags (AddressableLeaf.ObserverEvent): Information about the type of the event
    """
    del flags
    if isinstance(element, addressable.AddressableAttribute) and element.valueType == PIL.Image.Image:
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
    "error": str(e),
  }
  print(output)
  exit()

# try:
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
        output = {"access":
                      {"doors":
                           {"bonnet": vehicle["domains"]["access"]["accessStatus"]["doors"]["bonnet"]["openState"],
                            "trunk": vehicle["domains"]["access"]["accessStatus"]["doors"]["trunk"]["openState"],
                            "rearRight": vehicle["domains"]["access"]["accessStatus"]["doors"]["rearRight"]["openState"],
                            "rearLeft": vehicle["domains"]["access"]["accessStatus"]["doors"]["rearLeft"]["openState"],
                            "frontRight": vehicle["domains"]["access"]["accessStatus"]["doors"]["frontRight"]["openState"],
                            "frontLeft": vehicle["domains"]["access"]["accessStatus"]["doors"]["frontLeft"]["openState"],
                            },
                       "windows":
                           {
                                "rearRight": vehicle["domains"]["access"]["accessStatus"]["windows"]["rearRight"]["openState"],
                                "rearLeft": vehicle["domains"]["access"]["accessStatus"]["windows"]["rearLeft"]["openState"],
                                "frontRight": vehicle["domains"]["access"]["accessStatus"]["windows"]["frontRight"]["openState"],
                                "frontLeft": vehicle["domains"]["access"]["accessStatus"]["windows"]["frontLeft"]["openState"],
                           },
                       "overallStatus": vehicle["domains"]["access"]["accessStatus"]["overallStatus"],
                       },
                  "lights":
                      {
                        "right": vehicle["domains"]["vehicleLights"]["lightsStatus"]["lights"]["right"]["status"],
                        "left": vehicle["domains"]["vehicleLights"]["lightsStatus"]["lights"]["left"]["status"],
                       },
                  "charging":
                      {
                        "remainingKm": vehicle["domains"]["charging"]["batteryStatus"]["cruisingRangeElectric_km"],
                        "remainingSoC": vehicle["domains"]["charging"]["batteryStatus"]["currentSOC_pct"],
                        "chargingState": vehicle["domains"]["charging"]["chargingStatus"]["chargingState"],
                        "chargePower": vehicle["domains"]["charging"]["chargingStatus"]["chargePower_kW"],
                        "targetSoC": vehicle["domains"]["charging"]["chargingSettings"]["targetSOC_pct"],
                        "kmph": vehicle["domains"]["charging"]["chargingStatus"]["chargeRate_kmph"]
                       },
                  "measurements":
                      {
                        "odometer": f'{vehicle["domains"]["measurements"]["odometerStatus"]["odometer"]:,}'.replace(
                          ",", "."),
                        "timestamp": f'{timestamp} - ({datetime.now().strftime("%H:%M")})',
                       },
                  "climatisation":
                      {
                        "status": vehicle["domains"]["climatisation"]["climatisationStatus"]["climatisationState"],
                        "temperature": vehicle["domains"]["climatisation"]["climatisationSettings"][
                           "targetTemperature_C"],
                       },
                  "parking":
                      {
                        "latitude": latitude,
                        "longitude": longitude,
                        "position": position,
                      },
                  "model": vehicle["model"],
                  "status": 1,
                  "error": "",
                  }
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

# except Exception as e:
#     output = {
#         "status": 0,
#         "error": "Unknown Error,
#     }
#     print(output)
#     exit()

