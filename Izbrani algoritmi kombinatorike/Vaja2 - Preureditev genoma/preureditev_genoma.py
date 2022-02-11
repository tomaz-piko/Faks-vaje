#!/usr/bin/env python
# coding: utf-8

# In[1]:


import numpy as np
from timeit import default_timer as timer


# ## Helper functions

# In[2]:


def check_solution(arr):
    for i in range(len(arr) - 1):
        if not arr[i] + 1 == arr[i + 1]:
            print("Array is not sorted!")
            return False
    print("Array is sorted!")
    return True

def read_file(fileNum):
    filePath = '../Data/'
    fileName = 'G' + str(fileNum) + '.txt'
    fileR = open(filePath+fileName)
    text = fileR.read()
    lines = text.split('\n')
    genom = np.array(lines).astype(int)
    return genom


# ## Simple reversal sort

# In[3]:


def simple_reversal_sort(pi):
    n = len(pi)
    reversals = 0
    for i in range(1, n):
        j = np.array(np.where(pi == i))[0][0] + 1
        if i != j:
            a = pi[:i-1]
            b = pi[i-1:j]
            c = pi[j:]
            pi = np.concatenate([a, b[::-1], c])
            reversals += 1
    return pi, reversals


# ## Breakpoint reversal sort

# In[4]:


def index_of(num, arr):
    tmp = list(arr)
    idx = -1
    for i, n in enumerate(tmp):
        if n == num:
            return i
    return idx

def get_breakpoints(pi):
    pi_length = len(pi)
    order = 0
    orders = []
    strip = []
    all_strips = []
    all_strips.append([]) #Dummy value to prevent numpy idiotism
    orders.append(order) #Dummy value to prevent numpy idiotism
    for i in range(pi_length): #ASCENDING
        if i + 1 < pi_length and pi[i + 1] - pi[i] == 1:
            strip.append(pi[i])
            order = 1
        elif i + 1 < pi_length and pi[i] - pi[i + 1] == 1:
            strip.append(pi[i])
            order = 2
        elif strip:
            strip.append(pi[i])
            orders.append(order)
            all_strips.append(strip)
            strip = []

    return np.array(all_strips, dtype=object), np.array(orders)

def improved_breakpoint_reversal_sort(pi):
    breakpoints, orders = get_breakpoints(pi)
    reversals = 0
    while len(breakpoints) > 2: # > 2 because of dummy value
        if 2 in orders:
            descending_indexes = np.where(orders == 2)
            lowest_strip_index = np.argmin(breakpoints[descending_indexes]) #Kateri breakpoint ima najnižjo št.
            curr_breakpoint = breakpoints[descending_indexes[0][lowest_strip_index]] #Dejanske vrednosti breakpointa
            src = curr_breakpoint[-1]
            start = index_of(src, pi) + 1
            end = index_of(src - 1, pi) + 1
            if start > end:                
                start, end = end, start
            tmp = pi[start:end].copy()
            pi[start:end] = tmp[::-1]
            reversals += 1
        elif 1 in orders:
            ascending_indexes = np.where(orders == 1)
            lowest_strip_index = np.argmin(breakpoints[ascending_indexes]) #Kateri breakpoint ima najnižjo št.
            curr_breakpoint = breakpoints[ascending_indexes[0][lowest_strip_index]] #Dejanske vrednosti breakpointa
            src = curr_breakpoint[-1]
            start = index_of(src, pi) + 1
            end = index_of(src + 1, pi) + 1
            if start > end:
                start, end = end, start
            tmp = pi[start:end].copy()
            pi[start:end] = tmp[::-1]
            reversals += 1
        breakpoints, orders = get_breakpoints(pi)

    return pi, reversals
            


# ## Example tests

# In[5]:


genom1 = np.array([6, 8, 9, 1, 4, 7, 3, 2, 5])
print(genom1)
edited_genom, reversals = simple_reversal_sort(genom1)
print(edited_genom)
check_solution(edited_genom)
print("Simple_reversal_sort {} reversals".format(reversals))
print('----------------------------------------------------------------------')
genom1 = np.array([6, 8, 9, 1, 4, 7, 3, 2, 5])
print(genom1)
edited_genom, reversals = improved_breakpoint_reversal_sort(genom1)
print(edited_genom)
check_solution(edited_genom)
print("Improved_breakpoint_reversal_sort {} reversals".format(reversals))


# In[6]:


genom2 = np.array([0, 13, 2, 17, 1, 3, 20, 19, 11, 12, 4, 5, 16, 15, 10, 18, 14, 8, 7, 6, 9, 21])
print(genom2)
edited_genom, reversals = simple_reversal_sort(genom2)
print(edited_genom)
check_solution(edited_genom)
print("Simple_reversal_sort {} reversals".format(reversals))
print('----------------------------------------------------------------------')
print(genom2)
edited_genom, reversals = improved_breakpoint_reversal_sort(genom2)
print(edited_genom)
check_solution(edited_genom)
print("Improved_breakpoint_reversal_sort {} reversals".format(reversals))


# ## Timed tests

# #### G1 tests

# In[7]:


iterations = 10
result = 0
reversals = 0
for i in range(iterations):
    genom = read_file(1)
    start = timer()
    edited_genom, reversals = simple_reversal_sort(genom)
    end = timer()
    elapsed_time = (end-start)*1000
    result += elapsed_time
average = result / iterations
check_solution(edited_genom)
print("Simple_reversal_sort {} reversals in {} ms".format(reversals, round(average, 4)))


# In[8]:


iterations = 10
result = 0
reversals = 0
for i in range(iterations):
    genom = read_file(1)
    start = timer()
    edited_genom, reversals = improved_breakpoint_reversal_sort(genom)
    end = timer()
    elapsed_time = (end-start)*1000
    result += elapsed_time
average = result / iterations
check_solution(edited_genom)
print("Improved_breakpoint_reversal_sort {} reversals in {} ms".format(reversals, round(average, 4)))


# #### G2 tests

# In[9]:


iterations = 10
result = 0
reversals = 0
for i in range(iterations):
    genom = read_file(2)
    start = timer()
    edited_genom, reversals = simple_reversal_sort(genom)
    end = timer()
    elapsed_time = (end-start)*1000
    result += elapsed_time
average = result / iterations
check_solution(edited_genom)
print("Simple_reversal_sort {} reversals in {} ms".format(reversals, round(average, 4)))


# In[10]:


iterations = 10
result = 0
reversals = 0
for i in range(iterations):
    genom = read_file(2)
    start = timer()
    edited_genom, reversals = improved_breakpoint_reversal_sort(genom)
    end = timer()
    elapsed_time = (end-start)*1000
    result += elapsed_time
average = result / iterations
check_solution(edited_genom)
print("Improved_breakpoint_reversal_sort {} reversals in {} ms".format(reversals, round(average, 4)))


# #### G3 tests

# In[11]:


iterations = 10
result = 0
reversals = 0
for i in range(iterations):
    genom = read_file(3)
    start = timer()
    edited_genom, reversals = simple_reversal_sort(genom)
    end = timer()
    elapsed_time = (end-start)*1000
    result += elapsed_time
average = result / iterations
check_solution(edited_genom)
print("Simple_reversal_sort {} reversals in {} ms".format(reversals, round(average, 4)))


# In[12]:


iterations = 5
result = 0
reversals = 0
for i in range(iterations):
    genom = read_file(3)
    start = timer()
    edited_genom, reversals = improved_breakpoint_reversal_sort(genom)
    end = timer()
    elapsed_time = (end-start)*1000
    result += elapsed_time
average = result / iterations
check_solution(edited_genom)
print("Improved_breakpoint_reversal_sort {} reversals in {} ms".format(reversals, round(average, 4)))


# #### G4 tests

# In[13]:


iterations = 10
result = 0
reversals = 0
for i in range(iterations):
    genom = read_file(4)
    start = timer()
    edited_genom, reversals = simple_reversal_sort(genom)
    end = timer()
    elapsed_time = (end-start)*1000
    result += elapsed_time
average = result / iterations
check_solution(edited_genom)
print("Simple_reversal_sort {} reversals in {} ms".format(reversals, round(average, 4)))


# In[14]:


iterations = 1
result = 0
reversals = 0
for i in range(iterations):
    print(i)
    genom = read_file(4)
    start = timer()
    edited_genom, reversals = improved_breakpoint_reversal_sort(genom)
    end = timer()
    elapsed_time = (end-start)*1000
    result += elapsed_time
average = result / iterations
print("Improved_breakpoint_reversal_sort {} reversals in {} ms".format(reversals, round(average, 4)))


# #### G5 tests

# In[15]:


iterations = 10
result = 0
reversals = 0
for i in range(iterations):
    genom = read_file(5)
    start = timer()
    edited_genom, reversals = simple_reversal_sort(genom)
    end = timer()
    elapsed_time = (end-start)*1000
    result += elapsed_time
average = result / iterations
print("Simple_reversal_sort {} reversals in {} ms".format(reversals, round(average, 4)))


# In[ ]:




