try:
  from carconnectivity import carconnectivity
  import json
  from sys import argv
  import requests
  from datetime import datetime, timezone
  import time
  import os
  import argparse
  import tempfile
except ModuleNotFoundError as e:
  output = {
    "status": 0,
    "error": str(e).replace("'","") + '. Please install it via Pip',
  }
  print(output)
  exit()

def extract_upd(data, ref_ts):
  candidates = []

  def walk(x):
    if isinstance(x, dict):
      for k, v in x.items():
        if k == "upd":
          try:
            dt = datetime.strptime(v,'%Y-%m-%dT%H:%M:%S.%f+00:00').replace(tzinfo=timezone.utc)
            candidates.append(dt.timestamp())
          except Exception:
            pass
        else:
          walk(v)
    elif isinstance(x, list):
      for item in x:
        walk(item)

  walk(data)

  # nur Werte <= ref_ts
  past = [ts for ts in candidates if ts <= ref_ts]
  if not past:
    return None
  return max(past)

found_vin = ""
timestamp = 0
try:
  config_dict = {
    "carConnectivity": {
        "connectors": [
            {
                "type": argv[5],
                "config": {
                    "username": argv[1],
                    "password": argv[2],
                    "force_enable_access": False if argv[7] == "false" else True
                }
            }
        ]
    }
  }
  if argv[5] == "seatcupra":
      config_dict["carConnectivity"]["connectors"][0]["config"]["brand"] = argv[6]
  car_connectivity = carconnectivity.CarConnectivity(config=config_dict)
  car_connectivity.fetch_all()
  garage = car_connectivity.get_garage()
  vehicle = None
  if garage is not None:
      vehicle = garage.get_vehicle(argv[3])
      if vehicle is None:
          output = {
              "status": 0,
              "error": f"Vehicle with VIN {argv[3]} not found",
          }
          print(output)
          exit()
      else:
          for name, val in vehicle.images.as_dict().items():
              if os.path.exists(f'{argv[4]}/{name}.png'):
                  os.remove(f'{argv[4]}/{name}.png')
              val["val"].save(f'{argv[4]}/{name}.png')
          vehicle = json.loads(vehicle.as_json())
  car_connectivity.shutdown()
except Exception as e:
  output = {
    "status": 0,
    "error": str(e).replace("'",""),
  }
  print(output)
  exit()

try:
    now_timestamp = datetime.now(tz=timezone.utc).timestamp() - 60
    if vehicle:
      try:
        timestamp = extract_upd(vehicle, now_timestamp)
      except Exception as e:
        timestamp = "Not available"
      if timestamp != 0 and timestamp != "Not available":
        timestamp = datetime.fromtimestamp(timestamp).replace(tzinfo=timezone.utc).astimezone(tz=None).strftime("%d.%m.%Y %H:%M")
      if "position" in vehicle:
        latitude = vehicle['position']['latitude']["val"]
        longitude = vehicle['position']['longitude']["val"]
        if len(argv) == 9:
          r = requests.get(f"https://maps.googleapis.com/maps/api/geocode/json?latlng={latitude},{longitude}&key={argv[8]}")
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
      fields = {"bonnetDoor":["doors","bonnet","open_state","val"],
                "trunkDoor":["doors","trunk","open_state","val"],
                "rearRightDoor":["doors","rearRight","open_state","val"],
                "rearLeftDoor":["doors","rearLeft","open_state","val"],
                "frontRightDoor":["doors","frontRight","open_state","val"],
                "frontLeftDoor":["doors","frontLeft","open_state","val"],
                "rearRightWindow":["windows","rearRight","open_state","val"],
                "rearLeftWindow":["windows","rearLeft","open_state","val"],
                "frontRightWindow":["windows","frontRight","open_state","val"],
                "frontLeftWindow":["windows","frontLeft","open_state","val"],
                "overallStatus": ["doors", "lock_state","val"],
                "rightLight": ["lights","right","light_state","val"],
                "leftLight": ["lights","left","light_state","val"],
                "remainingKm": ["drives","total_range","val"],
                "remainingSoC": ["drives","{type:electric}","level","val"],
                "remainingChargingTime": ["charging","estimated_date_reached","val"],
                "chargingState": ["charging","state","val"],
                "chargePower": ["charging","power","val"],
                "targetSoC": ["charging","settings","target_level","val"],
                "kmph": ["charging","rate","val"],
                "odometer": ["odometer", "val"],
                "electricRange": ["drives", "{type:electric}", "range", "val"],
                "gasolineRange": ["drives", "{type:gasoline}", "range", "val"],
                "climatisation": ["climatization","state","val"],
                "temperature": ["climatization","settings","target_temperature","val"],
                "model": ["model","val"]
                }
      output = {}
      for key in fields.keys():
        value = vehicle
        for field in fields.get(key):
          try:
            if "{" in field:
              temp_key, val = field[1:-1].split(":")
              for i in value.values():
                  if temp_key in i:
                    if i[temp_key]["val"] == val:
                        value = i
                        break
            else:
              value = value[field]
          except:
            value = "UNKNOWN"
            break
        if type(value) == float and (key != "temperature" and key != "chargePower" and key != "kmph"):
            value = int(value)
        output[key] = value


      output["timestamp"] = f'{timestamp} - ({datetime.now().strftime("%H:%M")})'
      if output.get("remainingChargingTime"):
        if output.get("chargingState") == "off":
            output["remainingChargingTime"] = "00:00"
        else:
            now = datetime.now(timezone.utc)
            delta = datetime.fromisoformat(output.get("remainingChargingTime")) - now
            total_minutes = int(delta.total_seconds() // 60)
            hours = total_minutes // 60
            minutes = total_minutes % 60
            output["remainingChargingTime"] = f"{hours:02}:{minutes:02}"
      output["odometer"] = f'{output.get("odometer",0):,}'.replace(",", ".")
      output["latitude"] = latitude
      output["longitude"] = longitude
      output["position"] = position
      if output.get("odometer", "UNKNOWN") != "UNKNOWN":
        output["odometer_miles"] = f'{int(float(output.get("odometer", "0").replace(".","")) * 0.6214):,}'.replace(",",".")
      else:
        output["odometer_miles"] = output.get("odometer", "UNKNOWN")
      if type(output.get("kmph", "UNKNNOWN")) == int:
        output["miph"] = int(float(output.get("kmph", 0)) * 0.6214)
      else:
        output["miph"] = output.get("kmph", "UNKNNOWN")
      if type(output.get("electricRange", "UNKNNOWN")) == int:
        output["electricRange_miles"] = int(float(output.get("electricRange", 0)) * 0.6214)
      else:
        output["electricRange_miles"] = output.get("electricRange", "UNKNOWN")
      if type(output.get("gasolineRange", "UNKNNOWN")) == int:
        output["gasolineRange_miles"] = int(float(output.get("gasolineRange", 0)) * 0.6214)
      else:
        output["gasolineRange_miles"] = output.get("gasolineRange", "UNKNOWN")
      if type(output.get("remainingKm", "UNKNNOWN")) == int:
        output["remainingMiles"] = int(float(output.get("remainingKm", 0)) * 0.6214)
      else:
        output["remainingMiles"] = output.get("remainingKm", "UNKNOWN")
      output["status"] = 1
      output["error"] = ""
      print(output)
      exit()

except Exception as e:
    output = {
        "status": 0,
        "error": str(e).replace("'",""),
    }
    print(output)
    exit()

