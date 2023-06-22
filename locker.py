import json, time
import sys
from valclient.client import Client
import os

def resource_path(relative):
    return os.path.join(
        os.environ.get(
            "_MEIPASS2",
            os.path.abspath(".")
        ),
        relative
    )
#Using Valclient api to bypass ratelimits

#Collecting arguments from main.js
arguments = sys.argv[1:]
valid = False
agents = {}
seenMatches = []
geomap = {}
maps = json.loads(arguments[0])
loopDelay = float(arguments[1])
hoverDelay = float(arguments[2])
lockDelay = float(arguments[3])
agents = None

#Collecting IDS from data.json
with open(resource_path('resources/app/data.json'), 'r') as f:
    data = json.load(f)
    agents = data['agents']
    geomap = data['GeoServer']
    f.close()
Region = geomap[maps["region"]]

#Monitor and Lock
while True:
    try:
        #Initializing Valclient
        client = Client(region=Region)
        print("Client session grabbed!")
        client.activate()
        time.sleep(loopDelay)
        sessionState = client.fetch_presence(client.puuid)['sessionLoopState']
        matchID = client.pregame_fetch_match()['ID']
        if (sessionState == "PREGAME" and matchID not in seenMatches):
            seenMatches.append(matchID)
            matchInfo = client.pregame_fetch_match(matchID)
            print(matchInfo)
            mapName = matchInfo["MapID"].split('/')[-1].lower()
            side = lambda teamID: "Defending" if teamID == "Blue" else "Attacking"
            if (maps[mapName] != None):
                pick = maps[mapName].lower()
                choice = agents[pick]
                time.sleep(hoverDelay)
                client.pregame_select_character(choice)
                time.sleep(lockDelay)
                client.pregame_lock_character(choice)
                print('Agent Locked - ' + list(agents.keys())[list(agents.values()).index(maps[mapName])].capitalize())
    except Exception as e:
        if "pre-game" not in str(e):
            print("An error occurred:", e)
    time.sleep(loopDelay)