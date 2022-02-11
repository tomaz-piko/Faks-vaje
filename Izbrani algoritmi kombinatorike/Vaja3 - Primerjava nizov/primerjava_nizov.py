#!/usr/bin/env python
# coding: utf-8

# In[1]:


import numpy as np
from timeit import default_timer as timer


# ## Read from file

# In[2]:


def read_file(fileNum):
    filePath = '../Data/'
    fileR = open(filePath + 'DNK' + str(fileNum) + '.txt', 'r', encoding='utf-8')
    return fileR.read()


# ## Node class

# In[3]:


class Node:
    def __init__(self, currToken):
        self.token = currToken
        self.children = []
        
    def hasChild(self, token):
        for i, n in enumerate(self.children):
            if n.token == token:
                return i
        return -1
    
    def toString(self):
        if self.children:
            for nt in self.children:
                print(nt.token + ' -> ', end='')
                nt.toString()
                
        else:
            print()
    
    def isLeafNode(self):
        if self.children:
            return False
        else:
            return True
    
    def compressNode(self):
        if not self.children:
            return
        if len(self.children) == 1:
            nextNode = self.children[0]
            self.token += nextNode.token
            self.children = nextNode.children
            self.compressNode()
        elif len(self.children) > 1:
            for nt in self.children:
                nt.compressNode()
            
            


# ## Tree class

# In[4]:


def addToMatches(matches, match, position):
    if match in matches:
        matches[match]['count'] += 1
        matches[match]['positions'].append(position)
    else: #If match missing in dict add new gram to dict
        matches[match] = {'count': 1, 'positions': [position]}

class Tree:
    def __init__(self):
        self.root = Node(None)
        self.compressed = False
    
    def addKeyword(self, word):
        currNode = self.root
        for c in word:
            index = currNode.hasChild(c)
            if index == -1:
                newNode = Node(c)
                currNode.children.append(newNode)
                currNode = newNode
            else:
                currNode = currNode.children[index]
                
    def addKeywords(self, words):
        for word in words:
            self.addKeyword(word)
    
    def suffixesFromKeyword(self, word):
        for i in range(len(word)):
            self.addKeyword(word[i:len(word)])
    
    def suffixesFromKeywords(self, words):
        for word in words:
            self.sufficesFromKeyword(word)
    
    def toString(self):
        self.root.toString()
      
    def suffixSearch(self, text):
        matches = {}
        for i in range(len(text)):
            currNode = self.root
            match = ''
            match_length = 0
            while True:
                if currNode.isLeafNode():
                    addToMatches(matches, match, i)
                    break
                for j in range(len(currNode.children)):
                    no_match = True
                    nextNode = currNode.children[j]
                    token_length = len(nextNode.token)
                    if text[(i+match_length):(i+match_length+token_length)] == nextNode.token:
                        match += nextNode.token
                        match_length += token_length
                        currNode = nextNode
                        no_match = False
                        break
                if no_match:
                    break

            
                    
        return matches
    
    def keywordSearch(self, text):
        matches = {}
        for i in range(len(text)):
            currNode = self.root
            match = ''
            match_length = 0
            while True:
                if currNode.isLeafNode():
                    addToMatches(matches, match, i)
                    i += match_length
                    break
                if i + match_length >= len(text):
                    index = currNode.hasChild(text[i:])
                else:
                    index = currNode.hasChild(text[i+match_length])
                if index > -1:
                    currNode = currNode.children[index]
                    match += currNode.token #[i + match_length]
                    match_length += 1
                else:
                    break        
        return matches
    
    def findMatchesInText(self, text):                           
        if self.compressed:
            return self.suffixSearch(text)
        else:
            return self.keywordSearch(text)
    
    def compress(self):
        currNode = self.root
        for nt in currNode.children:
            nt.compressNode()
        self.compressed = True
            
        


# ## Keywords test example

# In[5]:


a = "mr and mrs dursley of number 4 perf privet drive were proud "
print(a)
b = "to say that they were perfectly normal thank you very much"
print(b)
test_text = a + b
print("--------------------------------")
keywords = ['proud', 'perfect', 'ugly', 'rivet', 'muggle']
KeywordTree = Tree()
KeywordTree.addKeywords(keywords)
KeywordTree.toString()
print("--------------------------------")
matches = KeywordTree.findMatchesInText(test_text)
for match in matches:
    print(match, '->', matches[match])


# ## Suffixes test example
# text = ACATGCATACATGG <br>
# word = ATCATG

# In[6]:


INCLUDE_KEYWORD_COMPARISON = True
if INCLUDE_KEYWORD_COMPARISON:
    print("KEYWORDS COMPARISON")
    keywords = ['ATCATG', 'TCATG', 'CATG', 'ATG', 'TG', 'G']
    KeywordTree = Tree()
    KeywordTree.addKeywords(keywords)
    print("--------------------------------")
    KeywordTree.toString()
    print("--------------------------------")
    matches = KeywordTree.findMatchesInText('ACATGCATACATGG')
    for match in matches:
        print(match, '->', matches[match])
print("============================================")
print("SUFFIX TREE EXAMPLE")
SuffixTree = Tree()
SuffixTree.suffixesFromKeyword('ATCATG')
SuffixTree.compress() #STRNE DREVO V DREVO KONČNIC
print("--------------------------------")
SuffixTree.toString()
print("--------------------------------")
matches = SuffixTree.findMatchesInText('ACATGCATACATGG')
for match in matches:
    print(match, '->', matches[match])


# ## Other examples

# ##### DNK1 file

# In[7]:


#PRIMER 1
text = read_file(1) #DNK1
tree = Tree()
tree.addKeywords(['GCGC', 'CACTAC', 'AATT'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[8]:


#PRIMER 2
text = read_file(1) #DNK1
tree = Tree()
tree.addKeywords(['CCGCGC', 'CACAGC', 'CCGCGA'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[9]:


#PRIMER 3
text = read_file(1) #DNK1
tree = Tree()
tree.addKeywords(['TGG', 'AAG', 'ACG'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[10]:


#PRIMER 4
text = read_file(1) #DNK1
tree = Tree()
tree.addKeywords(['GGGTTT', 'TTTAAGG', 'GGGCCT'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[11]:


#PRIMER 5
text = read_file(1) #DNK1
tree = Tree()
tree.addKeywords(['CACT', 'CACG', 'CCGCG', 'CATTCT'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# ##### DNK2 file

# In[12]:


#PRIMER 1
text = read_file(2) #DNK2
tree = Tree()
tree.addKeywords(['GCGC', 'CACTAC', 'AATT'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[13]:


#PRIMER 2
text = read_file(2) #DNK2
tree = Tree()
tree.addKeywords(['CCGCGC', 'CACAGC', 'CCGCGA'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[14]:


#PRIMER 3
text = read_file(2) #DNK2
tree = Tree()
tree.addKeywords(['TGG', 'AAG', 'ACG'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[15]:


#PRIMER 4
text = read_file(2) #DNK2
tree = Tree()
tree.addKeywords(['GGGTTT', 'TTTAAGG', 'GGGCCT'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[16]:


#PRIMER 5
text = read_file(2) #DNK2
tree = Tree()
tree.addKeywords(['CACT', 'CACG', 'CCGCG', 'CATTCT'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# ##### DNK3 file

# In[17]:


#PRIMER 1
text = read_file(3) #DNK1
tree = Tree()
tree.addKeywords(['GCGC', 'CACTAC', 'AATT'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[18]:


#PRIMER 2
text = read_file(3) #DNK3
tree = Tree()
tree.addKeywords(['CCGCGC', 'CACAGC', 'CCGCGA'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[19]:


#PRIMER 3
text = read_file(3) #DNK3
tree = Tree()
tree.addKeywords(['TGG', 'AAG', 'ACG'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[20]:


#PRIMER 4
text = read_file(3) #DNK3
tree = Tree()
tree.addKeywords(['GGGTTT', 'TTTAAGG', 'GGGCCT'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[21]:


#PRIMER 5
text = read_file(3) #DNK3
tree = Tree()
tree.addKeywords(['CACT', 'CACG', 'CCGCG', 'CATTCT'])
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Keyword search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])
print("===========================================================================================")
tree.compress()
start = timer()
matches = tree.findMatchesInText(text)
end = timer()
elapsed_time = (end-start)*1000
print("Suffix search results in {} ms".format(round(elapsed_time, 4)))
for match in matches:
    print(match, '->', matches[match])


# In[ ]:




