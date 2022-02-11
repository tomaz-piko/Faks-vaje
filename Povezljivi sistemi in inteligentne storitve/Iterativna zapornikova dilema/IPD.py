#!/usr/bin/env python
# coding: utf-8

# In[1]:


import numpy as np
import random
import matplotlib.pyplot as plt
get_ipython().run_line_magic('matplotlib', 'inline')


# In[2]:


SODELUJ = 0
PRIZNAJ = 1


# In[3]:


class Tournament:
    def __init__(self, score_table, format_type="ROUND-ROBIN", round_count=200, round_end_probability=0.0):
        self.format_type = format_type
        self.round_count = round_count
        self.round_end_probability = round_end_probability
        self.players = []
        self.score_table = score_table
    
    def set_players(self, player_strats):
        self.players = player_strats
    
    def start(self):
        #print("Tournament -- " + str(self.format_type) + " -- " + str(self.round_count) + " rounds STARTING")
        #print("Players: " + str(self.players))
        if self.format_type=="ROUND-ROBIN":
            return self.round_robin_format()
        elif self.format_type=="ROUND-ROBIN-ELIM":
            return self.round_robin_elimination_format()
    
    def round_robin_elimination_format(self):
        def ADD_RESULT(results_dict, strat, result):
            if strat in results_dict:
                results_dict[strat] = results_dict[strat] + result
            else:
                results_dict[strat] = result 
                
        players = self.players.copy()
        round_results = []
        while True:
            results = {}
            for i, player1 in enumerate(players):                
                for player2 in players[(i+1):]:
                    g = Game(player_strats=[player1, player2],
                             score_table=self.score_table,
                             round_count=self.round_count,
                             round_end_probability=self.round_end_probability
                            )
                    scores, history = g.play()
                    ADD_RESULT(results, player1, scores[0])
                    ADD_RESULT(results, player2, scores[1])               
            if len(players) == 2:
                round_results.append(results)
                break;
            loser = max(results, key=results.get)
            results['LOSER'] = loser
            players.remove(loser)
            round_results.append(results)
        return round_results

    def round_robin_format(self):
        def ADD_RESULT(results_dict, strat, result):
            if strat in results_dict:
                results_dict[strat] = results_dict[strat] + result
            else:
                results_dict[strat] = result 
                
        players = self.players.copy()
        results = {}
        for i, player1 in enumerate(players): 
            for player2 in players[(i+1):]:
                g = Game(player_strats=[player1, player2],
                         score_table=self.score_table,
                         round_count=self.round_count,
                         round_end_probability=self.round_end_probability
                        )
                scores, history = g.play()
                ADD_RESULT(results, player1, scores[0])
                ADD_RESULT(results, player2, scores[1]) 
        winner = min(results, key=results.get)
        results['WINNER'] = winner
        return results


# In[4]:


class Game:
    def __init__(self, player_strats, score_table, round_count=200, round_end_probability=0.0, additional_params=None):
        self.player1_strat = player_strats[0]
        self.player2_strat = player_strats[1]
        self.round_count = round_count
        self.round_end_probability = round_end_probability #Verjetnost naključnega zaključka igre
        self.score_table = score_table #Tabela točkovanja I = ???, S = ???
        self.history = []
        self.additional_params = additional_params
        
    def player_action(self, strategy="RANDOM", playerIdx=1):
        """
        Decide players action for current round.
        Output:
            0 => Igralec SODELUJE
            1 => Igralec IZDA / PRIZNA

        Param description:
            strategy => string name of strategy... 'RANDOM', 'ALL-D' etc.
            history = [[ACTIONS], [POINTS GAINED], [TOTAL POINTS]]
            playerIdx:
                1 => player1
                2 => player2
        """

        opponentIdx = 2 if playerIdx == 1 else 1
        if strategy=="RANDOM": #Each round random outcome 0 or 1
            return round(random.uniform(SODELUJ, PRIZNAJ))
        if strategy=="ALL-D": #Each round defer => 1
            return PRIZNAJ
        if strategy=="ALL-C": #Each round defer => 1
            return SODELUJ
        if strategy=="TIT-FOR-TAT": #First round comply that repeat after opponent
            if not self.history: #First round
                return SODELUJ
            prev_round = self.history[-1]
            prev_round_actions = prev_round[0]
            opponent_action = prev_round_actions[opponentIdx-1]
            return PRIZNAJ if opponent_action == PRIZNAJ else SODELUJ
        if strategy=="TESTER": #V prvi igri priznaj. Če je tvoj nasprotnik maščevalen in vrne s priznanjem, 
                                #igraj MILO-ZA-DRAGO, drugače uporabi 2-krat sodelovanje in potem zanikanje.
            if not self.history: #First round
                return PRIZNAJ #Prva runda.
            if len(self.history) == 1:
                return SODELUJ
            first_round = self.history[1]
            first_round_actions = first_round[1]
            opponent_first_action = first_round_actions[opponentIdx-1]
            if opponent_first_action == PRIZNAJ: #igraj MILO-ZA-DRAGO
                prev_round = self.history[-1]
                prev_round_actions = prev_round[0]
                opponent_action = prev_round_actions[opponentIdx-1]
                return PRIZNAJ if opponent_action == PRIZNAJ else SODELUJ
            else:  #uporabi 2-krat sodelovanje in potem zanikanje.
                prev_2_rounds = np.array(self.history[-2:])
                prev_2_actions = prev_2_rounds[:, 0]
                player_prev_2_actions = prev_2_actions[:, playerIdx-1]
                return 1 if sum(player_prev_2_actions) == 0 else SODELUJ
                
        if strategy=="JOSS": #Podobno kot MILO-ZA-DRAGO, vendar namesto sodelovanjav prvi igri uporabimo nesodelovanje.
            if not self.history: #First round
                return PRIZNAJ
            prev_round = self.history[-1]
            prev_round_actions = prev_round[0]
            opponent_action = prev_round_actions[opponentIdx-1]
            return PRIZNAJ if opponent_action == PRIZNAJ else SODELUJ       
        if strategy=="BIPOLAR TIT-FOR-TAT":
            if not self.additional_params:
                BIPOLAR_TRESHOLD_BAD = 0.3
                BIPOLAR_TRESHOLD_GOOD = 0.9
            else:
                BIPOLAR_TRESHOLD_BAD = self.additional_params['BIPOLAR_TRESHOLD_BAD']
                BIPOLAR_TRESHOLD_GOOD = self.additional_params['BIPOLAR_TRESHOLD_GOOD']
                
            temper = random.random()
            if temper < BIPOLAR_TRESHOLD_BAD: #Nihanje počutja na slabo.
                return PRIZNAJ
            elif temper > BIPOLAR_TRESHOLD_GOOD: #Nihanje počutja na dobro.
                return SODELUJ
            else:
                if not self.history:
                    return SODELUJ #Prvo rundo sodeluj
                prev_round = self.history[-1]
                prev_round_actions = prev_round[0]
                opponent_action = prev_round_actions[opponentIdx-1]
                return PRIZNAJ if opponent_action == PRIZNAJ else SODELUJ 
                
                
    def print_history(self):        
        """
        Print readable results of the game.
        Output example:
            Player1 | Player2
            -------------------
            I       | S
            0(+0)	| 5(+5)
            -------------------

        Param description:
            history = [[ACTIONS], [POINTS GAINED], [TOTAL POINTS]]
            strategies = [stategy1, strategy2]
            ACTIONS: 0 => 'S', 1 => 'I'
        """

        print("Player1 strat: " + self.player1_strat)
        print("Player2 strat: " + self.player2_strat)
        print("")
        print("Player1 | Player2")
        print("-------------------")
        for iteration in self.history:
            actions = iteration[0]
            points_gained = iteration[1]
            total_points = iteration[2]

            p1_action = 'S' if actions[0] == SODELUJ else 'P'
            p2_action = 'S' if actions[1] == SODELUJ else 'P'

            p1_score = str(total_points[0]) + "(+" + str(points_gained[0]) + ")"
            p2_score = str(total_points[1]) + "(+" + str(points_gained[1]) + ")"

            print(p1_action + "\t| " + p2_action)
            print(p1_score + "\t| " + p2_score)
            print("-------------------")
    
    def play(self, print_results=False):
        p1_total_score = 0 
        p2_total_score = 0
        for i in range(self.round_count):
            p1_action = self.player_action(strategy=self.player1_strat, playerIdx=1)
            p2_action = self.player_action(strategy=self.player2_strat, playerIdx=2)

            round_scores = self.score_table[p1_action, p2_action]

            p1_total_score += round_scores[0]
            p2_total_score += round_scores[1]

            self.history.append([
                            [p1_action, p2_action], #Actions
                            [round_scores[0], round_scores[1]], #Points gained
                            [p1_total_score, p2_total_score], #Current total score
            ])
            if self.round_end_probability > 0:
                rnd = random.random()
                if rnd < self.round_end_probability:
                    break
        if print_results:
            print("Game finished at round " + str(len(self.history)) + " " + self.player1_strat + " " + str(p1_total_score)
                + " --- " + str(p2_total_score) + " " + self.player2_strat)
        return [p1_total_score, p2_total_score], self.history
            


# ## Tabela točkovanja / kazni

# In[5]:


COMPLY_SCORE = 1
WINNER_SCORE = 5
LOSER_SCORE = 0
DEFER_SCORE = 3
score_table = np.array([
            [[COMPLY_SCORE, COMPLY_SCORE], [WINNER_SCORE, LOSER_SCORE]],
            [[LOSER_SCORE, WINNER_SCORE], [DEFER_SCORE, DEFER_SCORE]]
])


# <img src="IPD_table.png" width="350" height="250" style="float:left;">

# ## Primer igre

# In[6]:


#def __init__(self, player_strats, score_table, round_count=200, round_end_probability=0.0)
#BIPOLAR TIT-FOR-TAT
#["TESTER", "TIT-FOR-TAT"]
g = Game(player_strats=["ALL-C", "BIPOLAR TIT-FOR-TAT"],
         score_table=score_table,
         round_count=20,
         round_end_probability=0.0,
         additional_params={'BIPOLAR_TRESHOLD_BAD': 0.45, 'BIPOLAR_TRESHOLD_GOOD': 0.92}
        )
scores, history = g.play(print_results=True)
print()
g.print_history()


# ## Primer turnirja

# #### Axelrod 1

# In[7]:


#def __init__(self, score_table, format_type="ROUND-ROBIN", round_count="200", round_end_probability=0.0):
t = Tournament(score_table=score_table,
               format_type="ROUND-ROBIN",
               round_count=200
              )
player_strats = ["RANDOM", "ALL-D", "ALL-C", "TIT-FOR-TAT", "JOSS", "TESTER", "BIPOLAR TIT-FOR-TAT"]
t.set_players(player_strats=player_strats)
results = t.start()
print(results)


# In[8]:


iterations = 5
final_results = np.zeros(len(player_strats), dtype=float)
for i in range(iterations):
    t = Tournament(score_table=score_table,
                   format_type="ROUND-ROBIN",
                   round_count=200,
                   round_end_probability=0.00346
                  )
    player_strats = ["RANDOM", "ALL-D", "ALL-C", "TIT-FOR-TAT", "JOSS", "TESTER", "BIPOLAR TIT-FOR-TAT"]
    t.set_players(player_strats=player_strats)
    results = t.start()
    print(results)
    for j, ps in enumerate(player_strats):
        final_results[j] += results[ps]
final_results = final_results / iterations
player_strats = ["RANDOM", "ALL-D", "ALL-C", "TIT-FOR-TAT", "JOSS", "TESTER", "BIPOLAR TFT"]
sorted_pairs = sorted(zip(final_results, player_strats), reverse=False)
tuples = zip(*sorted_pairs)
results, strats = [list(t) for t in tuples]
print(final_results)
print(strats)
print(results)


# In[9]:


width = 0.5
plt.figure(figsize=(8, 5))
plt.bar(strats, results, width=width)
#plt.bar(x + width, results[:, 0, 0], width=width)
plt.xticks(rotation=45)
plt.ylabel("Točke")
plt.title('Povprečen rezultat ' + str(iterations) + ' iger z vsakim nasprotnikom.', fontsize=14)


# #### Axelrod 2

# In[10]:


t = Tournament(score_table=score_table,
               format_type="ROUND-ROBIN",
               round_count=200,
               round_end_probability=0.00346
              )
player_strats = ["RANDOM", "ALL-D", "ALL-C", "TIT-FOR-TAT", "JOSS", "TESTER", "BIPOLAR TIT-FOR-TAT"]
t.set_players(player_strats=player_strats)
results = t.start()
print(results)


# #### Additional tournament

# In[11]:


t = Tournament(score_table=score_table,
               format_type="ROUND-ROBIN-ELIM",
               round_count=200,
               round_end_probability=0.0
              )
player_strats = ["RANDOM", "ALL-D", "ALL-C", "TIT-FOR-TAT", "JOSS", "TESTER", "BIPOLAR TIT-FOR-TAT"]
player_population = []
pop_count=10
for ps in player_strats:
    for i in range(pop_count):
        player_population.append(ps)
t.set_players(player_strats=player_population)
results = t.start()
print(results[-1])


# #### Elimination tournament

# In[13]:


t = Tournament(score_table=score_table,
               format_type="ROUND-ROBIN-ELIM",
               round_count=200
               #round_end_probability=0.00346
              )
player_strats = ["RANDOM", "ALL-D", "ALL-C", "TIT-FOR-TAT", "JOSS", "TESTER", "BIPOLAR TIT-FOR-TAT"]
t.set_players(player_strats=player_strats)
results = t.start()
print(results[-1])
print('---------------')
for r in results[:-1]:
    print(r['LOSER'])


# #### BIPOLAR TIT-FOR-TAT TESTING
# 
# ##### More vengeful mood swings 

# In[14]:


player1_strat = "ALL-D"#"BIPOLAR TIT-FOR-TAT"
player2_strats = ["RANDOM", "ALL-D", "ALL-C", "TIT-FOR-TAT", "JOSS", "TESTER"]
results = np.zeros(shape=(len(player2_strats), 2, 2), dtype=float)
end_probabilities = [0.0, 0.00346]
iterations = 100 #Z vsakemu igra n-krat, rezultat prikazan kot povprečje
for p, player2_strat in enumerate(player2_strats):
    for i in range(iterations):
        for j, end_probability in enumerate(end_probabilities):
            g = Game(player_strats=[player1_strat, player2_strat],
             score_table=score_table,
             round_count=200,
             round_end_probability=end_probability,
             additional_params={'BIPOLAR_TRESHOLD_BAD': 0.42, 'BIPOLAR_TRESHOLD_GOOD': 0.88}
            )       
            scores, _ = g.play()
            results[p, j, 0] += scores[0]
            results[p, j, 1] += scores[1]
results = results/iterations #Dobimo povprečje
width = 0.3
x = np.arange(len(player2_strats))
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(6, 10))
fig.suptitle('Bolj maščevalni Bipolarni tit-for-tat.', fontsize=16)
plt.subplots_adjust(hspace = 1)
plt.rc('axes', labelsize=12)
#fig.subplots_adjust(top=0.5)
#fig.tight_layout(pad=8.0)

ax1.bar(player2_strats, results[:, 0, 1], width=width, label="Nasprotnik")
ax1.bar(x + width, results[:, 0, 0], width=width, label="Bipolar TFT")
ax1.set(ylabel="Točke")
ax1.set_title('Povprečen rezultat ' + str(iterations) + ' iger z vsakim nasprotnikom.', fontsize=14)

ax2.bar(player2_strats, results[:, 1, 1], width=width)
ax2.bar(x + width, results[:, 1, 0], width=width)
ax2.set(xlabel="Nasprotnikova strategija", ylabel="Točke")
ax2.set_title('Povprečen rezultat ' + str(iterations) + ' iger z vsakim nasprotnikom \n in omogočenemu predčasnemu koncu.')
fig.legend(bbox_to_anchor=(0.91, 0.877), loc='upper left', borderaxespad=0.)


# ##### More friendly mood swings 

# In[15]:


player1_strat = "BIPOLAR TIT-FOR-TAT"
player2_strats = ["RANDOM", "ALL-D", "ALL-C", "TIT-FOR-TAT", "JOSS", "TESTER"]
results = np.zeros(shape=(len(player2_strats), 2, 2), dtype=float)
end_probabilities = [0.0, 0.00346]
iterations = 100 #Z vsakemu igra n-krat, rezultat prikazan kot povprečje
for p, player2_strat in enumerate(player2_strats):
    for i in range(iterations):
        for j, end_probability in enumerate(end_probabilities):
            g = Game(player_strats=[player1_strat, player2_strat],
             score_table=score_table,
             round_count=200,
             round_end_probability=end_probability,
             additional_params={'BIPOLAR_TRESHOLD_BAD': 0.1, 'BIPOLAR_TRESHOLD_GOOD': 0.7}
            )       
            scores, _ = g.play()
            results[p, j, 0] += scores[0]
            results[p, j, 1] += scores[1]
results = results/iterations #Dobimo povprečje
width = 0.3
x = np.arange(len(player2_strats))
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(6, 10))
fig.suptitle('Prijaznejši Bipolarni tit-for-tat.', fontsize=16)
plt.subplots_adjust(hspace = 1)
plt.rc('axes', labelsize=12)
#fig.subplots_adjust(top=0.5)
#fig.tight_layout(pad=8.0)

ax1.bar(player2_strats, results[:, 0, 1], width=width, label="Nasprotnik")
ax1.bar(x + width, results[:, 0, 0], width=width, label="Bipolar TFT")
ax1.set(ylabel="Točke")
ax1.set_title('Povprečen rezultat ' + str(iterations) + ' iger z vsakim nasprotnikom.', fontsize=14)

ax2.bar(player2_strats, results[:, 1, 1], width=width)
ax2.bar(x + width, results[:, 1, 0], width=width)
ax2.set(xlabel="Nasprotnikova strategija", ylabel="Točke")
ax2.set_title('Povprečen rezultat ' + str(iterations) + ' iger z vsakim nasprotnikom \n in omogočenemu predčasnemu koncu.')
fig.legend(bbox_to_anchor=(0.91, 0.877), loc='upper left', borderaxespad=0.)


# ##### Balanced mood swings 

# In[16]:


player1_strat = "BIPOLAR TIT-FOR-TAT"
player2_strats = ["RANDOM", "ALL-D", "ALL-C", "TIT-FOR-TAT", "JOSS", "TESTER"]
results = np.zeros(shape=(len(player2_strats), 2, 2), dtype=float)
end_probabilities = [0.0, 0.00346]
iterations = 100 #Z vsakemu igra n-krat, rezultat prikazan kot povprečje
for p, player2_strat in enumerate(player2_strats):
    for i in range(iterations):
        for j, end_probability in enumerate(end_probabilities):
            g = Game(player_strats=[player1_strat, player2_strat],
             score_table=score_table,
             round_count=200,
             round_end_probability=end_probability,
             additional_params={'BIPOLAR_TRESHOLD_BAD': 0.2, 'BIPOLAR_TRESHOLD_GOOD': 0.2}
            )       
            scores, _ = g.play()
            results[p, j, 0] += scores[0]
            results[p, j, 1] += scores[1]
results = results/iterations #Dobimo povprečje
width = 0.3
x = np.arange(len(player2_strats))
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(6, 10))
fig.suptitle('Uravnotežen Bipolarni tit-for-tat.', fontsize=16)
plt.subplots_adjust(hspace=1)
plt.rc('axes', labelsize=12)
#fig.subplots_adjust(top=0.5)
#fig.tight_layout(pad=8.0)

ax1.bar(player2_strats, results[:, 0, 1], width=width, label="Nasprotnik")
ax1.bar(x + width, results[:, 0, 0], width=width, label="Bipolar TFT")
ax1.set(ylabel="Točke")
ax1.set_title('Povprečen rezultat ' + str(iterations) + ' iger z vsakim nasprotnikom.', fontsize=14)

ax2.bar(player2_strats, results[:, 1, 1], width=width)
ax2.bar(x + width, results[:, 1, 0], width=width)
ax2.set(xlabel="Nasprotnikova strategija", ylabel="Točke")
ax2.set_title('Povprečen rezultat ' + str(iterations) + ' iger z vsakim nasprotnikom \n in omogočenemu predčasnemu koncu.')
fig.legend(bbox_to_anchor=(0.91, 0.877), loc='upper left', borderaxespad=0.)


# In[17]:


results[:, 1, 0]


# In[ ]:




