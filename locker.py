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
region = "NA"
maps = json.loads(arguments[0])
loopDelay = arguments[1]
hoverDelay = arguments[2]
lockDelay = arguments[3]
print(maps)


with open('data.json', 'r') as f:
    data = json.load(f)
    agents = data['agents']
    print(agents)
    


# client = Client(region=region)
# client.activate()

# while running:
#     time.sleep(loopDelay)
#     try:
#         sessionState = client.fetch_presence(client.puuid)['sessionLoopState']
#         matchID = client.pregame_fetch_match()['ID']
#         if (sessionState == "PREGAME" and matchID not in seenMatches):
#             seenMatches.append(matchID)
#             matchInfo = client.pregame_fetch_match(matchID)
#             mapName = matchInfo["MapID"].split('/')[-1].lower()
#             side = lambda teamID: "Defending" if teamID == "Blue" else "Attacking"
#             print(f'Agent Select Found - {mapCodes[mapName].capitalize()} - ' + side(matchInfo['Teams'][0]['TeamID']) + ' first')
#             if (maps[mapName] != None):
#                 time.sleep(hoverDelay)
#                 client.pregame_select_character(maps[mapName])
#                 time.sleep(lockDelay)
#                 client.pregame_lock_character(maps[mapName])
#                 print('Agent Locked - ' + list(agents.keys())[list(agents.values()).index(maps[mapName])].capitalize())
#     except Exception as e:
#         if "pre-game" not in str(e):
#             print("An error occurred:", e)