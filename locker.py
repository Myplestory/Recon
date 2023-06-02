import json, time
import sys
from valclient.client import Client

arguments = sys.argv[1:]
print(arguments)
sys.stdout.flush()

valid = False
running = True
agents = {}
seenMatches = []
region = "na"
maps = json.loads(arguments[0])
loopDelay = arguments[1]
hoverDelay = arguments[2]
lockDelay = arguments[3]
agents = None
print(maps)


with open('data.json', 'r') as f:
    data = json.load(f)
    agents = data['agents']
    


client = Client(region=region)
print("Client session grabbed!")
client.activate()

while running:
    print("entered loop successfully!")
    time.sleep(loopDelay)
    try:
        sessionState = client.fetch_presence(client.puuid)['sessionLoopState']
        matchID = client.pregame_fetch_match()['ID']
        if (sessionState == "PREGAME" and matchID not in seenMatches):
            print("Entered pregame!")
            seenMatches.append(matchID)
            matchInfo = client.pregame_fetch_match(matchID)
            mapName = matchInfo["MapID"].split('/')[-1].lower()
            side = lambda teamID: "Defending" if teamID == "Blue" else "Attacking"
            if (maps[mapName] != None):
                time.sleep(hoverDelay)
                client.pregame_select_character(agents[maps[mapName].lower()])
                time.sleep(lockDelay)
                client.pregame_lock_character(agents[maps[mapName].lower()])
                print('Agent Locked - ' + list(agents.keys())[list(agents.values()).index(maps[mapName])].capitalize())
    except Exception as e:
        if "pre-game" not in str(e):
            print("An error occurred:", e)