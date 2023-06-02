import json, time
import sys
from valclient.client import Client

#Using Valclient api to bypass ratelimits

#Collecting arguements from main.js
arguments = sys.argv[1:]
valid = False
agents = {}
seenMatches = []
region = "na"
maps = json.loads(arguments[0])
loopDelay = float(arguments[1])
hoverDelay = float(arguments[2])
lockDelay = float(arguments[3])
agents = None

#Collecting agent IDS from data.json
with open('data.json', 'r') as f:
    data = json.load(f)
    agents = data['agents']
    f.close()
    
#Initializing Valclient
client = Client(region=region)
print("Client session grabbed!")
client.activate()

#Monitor and Lock
while True:
    try:
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