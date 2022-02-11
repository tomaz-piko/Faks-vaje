#!/usr/bin/env python
# coding: utf-8

# In[1]:


import numpy as np
from timeit import default_timer as timer
import itertools


# ## Iskanje poljubnih nukleotidov in izračun multimnožice

# In[2]:


def find_nukleotids(dnk, nukleotidi):
    if type(nukleotidi) != list:
        nukleotidi = [nukleotidi]
    longest = len(max(nukleotidi, key=len))
    dnk_len = len(dnk) - 1
    
    positions = [0, dnk_len]
    multiset = []

    #Iskanje poljubnih nukleotidov
    i = 0
    while i < len(dnk)-longest+1:
        for nukleotid in nukleotidi:
            if dnk[i] == nukleotid[0]:
                flag = True
                for j in range(len(nukleotid)):
                    if dnk[i+j] != nukleotid[j]:
                        flag = False
                        break;
                if flag:
                    positions.append(i)
                    i += len(nukleotid)
        i += 1
    positions = sorted(positions)

    #Izračun razdalj:
    for i in range(len(positions)):
        for j in range(i, len(positions), 1):
            if i != j:
                multiset.append(abs(positions[i]-positions[j]))
    multiset = sorted(multiset)
    
    return positions, multiset


# ## Naivni pristop

# In[3]:


def calc_delta(x):
    delta_x = []
    L = len(x)
    for i in range(L):
        for j in range(i, L, 1):
            if i != j:
                delta_x.append(abs(x[i] - x[j]))
    return sorted(delta_x)

def ANOTHER_BRUTE_FORCE(L, n):
    data = itertools.combinations(L[:-1], n) #n-2
    mnozice = list(data)
    results = []
    for m in mnozice:
        x = [0, L[-1]]
        x = x + list(m)
        if calc_delta(x) == L:
            results.append(sorted(x))
    return results


# ## Razveji in omeji

# In[4]:


def calc_deltas2(y, L, X):
    deltas = []
    for x in X:
        d = abs(x-y)
        if d in L and d not in deltas:
            deltas.append(d)
    return sorted(deltas)

def PARTIAL_DIGEST(multiset, maxLen):
    L = multiset.copy()
    W = max(L) #W => širina
    L.remove(W)
    X = [0, W]
    results = []
    PLACE(L, X, W, results, maxLen)
    return results

def PLACE(L, X, W, res, maxLen):
    if not L:
        if len(X) == maxLen:
            res.append(sorted(X))
        return
    y = max(L)
    deltas = calc_deltas2(y, L, X)
    if deltas:
        X.append(y) #Dodaj y v X in...
        [L.remove(d) for d in deltas] #briši razalje (y, X) iz L
        PLACE(L.copy(), X.copy(), W, res, maxLen)
        X.remove(y) #Briši y iz X in...
        L = L + deltas #dodaj razdalje (y, X) v L
    deltas = calc_deltas2(W-y, L, X)
    if deltas:
        X.append(W-y) #Dodaj širina - y v X in... 
        [L.remove(d) for d in deltas] #briši razdalje (širina-y, X) iz L
        PLACE(L.copy(), X.copy(), W, res, maxLen)
        X.remove(W-y) #Briši širina-y iz X in...
        L = L + deltas #dodaj razdalje (širina-y, X) v L
        


# ## PRIMERI

# In[7]:


#PARTIAL DIGEST PRIMER IZ NAVODIL
L = [2, 2, 3, 3, 4, 5, 6, 7, 8, 10]
results = PARTIAL_DIGEST(L, 5)
print(results)


# #### PRIMER 1

# In[8]:


#PRIMER DNK1: GTGTG(1)
#Branje iz datoteke.
filePath = '../Data/DNK1.txt'
fileR = open(filePath)
dnk = fileR.read()
#Iskanje nukleotidov.
nukleotidi='GTGTG'
positions, multiset = find_nukleotids(dnk, nukleotidi)

print('Positions: ' + str(positions))
print('Multiset: ' + str(multiset))
print('------------------------------------------------------------')

#Naivni pristop
results = ANOTHER_BRUTE_FORCE(multiset, 1)
print('Brute force results: ' + str(results))

#Partial-digest metoda
results = PARTIAL_DIGEST(multiset, len(positions))
print('Partial-digest results: ' + str(results))


# #### PRIMER 2
# !Reminder: Brute Force traja...

# In[9]:


#PRIMER DNK1: TTCC,CTCTCT(7)
#Branje iz datoteke.
filePath = '../Data/DNK1.txt'
fileR = open(filePath)
dnk = fileR.read()
#Iskanje nukleotidov.
nukleotidi=['TTCC', 'CTCTCT']
positions, multiset = find_nukleotids(dnk, nukleotidi)

print('Positions: ' + str(positions))
print('Multiset: ' + str(multiset))
print('------------------------------------------------------------')

#Naivni pristop
#results = ANOTHER_BRUTE_FORCE(multiset, len(positions))
print('Brute force results: ' + str(results))

#Partial-digest metoda
results = PARTIAL_DIGEST(multiset, len(positions))
print('Partial-digest results: ' + str(results))


# #### Dodatni poljubni primeri

# In[10]:


#PARAMETRI
nukleotidi=['GTGTG'] #DNK1
#nukleotidi=['TTCC', 'CTCTCT']# DNK1
#nukleotidi=['AAAA', 'CCCC', 'TTTT', 'GGGG'] #DNK1
#nukleotidi=['ACTACT', 'GGAGGA', 'GAGGCC', 'CTCTCT'] #DNK2
dnk_num = 1
method_num = 2 #1 => BRUTE; 2 => PD

filePath = '../Data/DNK' + str(dnk_num) + '.txt'
fileR = open(filePath)
dnk = fileR.read()
fileR.close()
positions, multiset = find_nukleotids(dnk, nukleotidi)
print('Positions: ' + str(positions))
print('Multiset: ' + str(multiset))
print('------------------------------------------------------------')

if method_num == 1: #BRUTE FORCE
    results = ANOTHER_BRUTE_FORCE(multiset, len(positions))
    print('Brute force results:')
elif method_num == 2:#PD
    results = PARTIAL_DIGEST(multiset, len(positions))
    print('Partial-digest results:')    
print(results)


# In[ ]:




