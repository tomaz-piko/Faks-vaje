#!/usr/bin/env python
# coding: utf-8

# In[2]:


import numpy as np
from scipy.io import wavfile
from scipy.fft import fft, fftfreq
import matplotlib.pyplot as plt
get_ipython().run_line_magic('matplotlib', 'notebook')
#%matplotlib inline
import pyaudio
import wave
import sys
import math
from mpl_toolkits import mplot3d


# # Play audio file

# In[3]:


def PLAY(FILE_IN=''):
    CHUNK=1024
    if recording == '':
        print("Input file name: ")
        FILE_IN = input()
        if FILE_IN[-4:] != ".wav":
            FILE_IN += ".wav"
    
    wf = wave.open(FILE_IN, 'rb')
    p = pyaudio.PyAudio()
    
    stream = p.open(format=p.get_format_from_width(wf.getsampwidth()),
                    channels=wf.getnchannels(),
                    rate=wf.getframerate(),
                    output=True)
    
    data = wf.readframes(CHUNK)
    
    while data != '':
        stream.write(data)
        data = wf.readframes(CHUNK)
        
    stream.stop_stream()
    stream.close()
    
    p.terminate


# # Record audio file

# In[4]:


#RATE = Frekvenca vzorčenja
#DURATION = dolžina posnetka v sekundah
#CHANNELS = število kanalov
def RECORD(CHUNK=1024, CHANNELS=2, RATE=44100, DURATION=3):
    FORMAT = pyaudio.paInt16
    
    print("Output file name: ") #Vnesemo željeno ime izhodne zvočne datoteke.
    FILE_OUT = input()
    if FILE_OUT[-4:] != ".wav": #Za enostavnejšo uporabniško izkušnjo končnico dodamo samodejno.
        FILE_OUT += ".wav"
    
    p = pyaudio.PyAudio() #Inicializiramo snemalnik in podamo parametre v snemalni tok.
    stream = p.open(format=FORMAT,
                   channels=CHANNELS,
                   rate=RATE,
                   input=True,
                   frames_per_buffer=CHUNK)

    print("Recording...")

    frames = []
    for i in range(0, int(RATE / CHUNK * DURATION)): #Snemanje zvoka.
        data = stream.read(CHUNK)
        frames.append(data)

    print("Recording finished!")

    stream.stop_stream()
    stream.close()
    p.terminate()

    wf = wave.open(FILE_OUT, 'wb') #Shranjevanje .wav datoteke.
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(p.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))
    wf.close()
    print("File saved as: '" + FILE_OUT + "'")
        
    return FILE_OUT

def load_partial_recording(fileName, Fs, start, end):
    fs, data = wavfile.read(fileName) #Naložimo .wav datoteko
    posnetek = data.T[0] #Dobimo le prvi kanal.     
    x = posnetek[round(start*Fs):round((start+end)*Fs):1]
    return x


# In[5]:


def gen_sin(A, k, N, f, complexSin=True):
    n = np.arange(N)
    if complexSin:
        return A*np.exp(1j*(2*np.pi*k*n/N + f))
    else:
        return A*np.sin(2*np.pi*k*n/N + f)
    
def myDFT(x): 
    N = len(x)
    X = np.zeros(N, dtype=np.complex128)
    for k in range(N):
        for n in range(N):
            X[k] += x[n] * np.exp(-2j*np.pi*k*n/N) 
    return X

def myDFT2(x, complexSin=False): #x => signal
    N = len(x)
    if complexSin:
        X = np.zeros(N, dtype=np.complex128)
    else:
        X = np.zeros(N)  
    
    for k in range(len(X)):
        e = gen_sin(7, k, N, 0.5, complexSin=complexSin)
        X[k] = sum(e[:]*x[:])
    return X


# In[6]:


#recording = RECORD()


# In[8]:


Fs = 44100
num_samples = 4096

x = load_partial_recording("posnetki/a.wav", Fs, 0, 0.1)
#x = load_partial_recording(recording, Fs, 0, 0.1)
if num_samples > 0 and num_samples < len(x):
    x = x[:num_samples]

plt.plot(x)
plt.ylabel("Amplituda", fontsize=14) #Oznaka y osi
plt.title("Odsek posnetka izgovorjave 'a'.", fontsize=18) #Naslov grafa
plt.xlabel("Frekvenca", fontsize=14) #Oznaka x osi
plt.show()


# In[8]:


print("Run tests for different DFT implementations? (y / n)")
run_test = input()

if(run_test == 'y'):
    print("Input sample size. (int)")
    num_samples = int(input())
    
    test_samples = x
    if num_samples > 0 and num_samples < len(x):
        test_samples = test_samples[:num_samples]
    
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle("Primerjava rezultatov različnih furierjevih transformacij.", fontsize=24)
    fig.subplots_adjust(hspace = 0.3)

    #Primer 1: scipy.fft
    ax1.set_title("Scipy.fft")
    ax1.set(xlabel='Frekvenca', ylabel='Amplituda')

    X = fft(test_samples)
    f1 = np.arange(len(X))/len(X)*Fs
    #f = fftfreq(len(X), 1 / Fs)
    ax1.stem(f1, abs(X), 'b',              markerfmt=" ", basefmt=" ")

    #Primer 2: Lastni DFT s standardno enačbo
    ax2.set_title("Lastna implementacija DFT")
    ax2.set(xlabel='Frekvenca', ylabel='Amplituda')

    X = myDFT(test_samples)
    ax2.stem(f1, abs(X), 'b',              markerfmt=" ", basefmt=" ")

    #Primer 3: Lastni DFT s poljubno realno sinusoido
    ax3.set_title("Lastni DFT s poljubno realno sinusoido")
    ax3.set(xlabel='Frekvenca', ylabel='Amplituda')

    X = myDFT2(test_samples, complexSin=False)
    ax3.stem(f1, abs(X), 'b',              markerfmt=" ", basefmt=" ")

    #Primer 3: Lastni DFT s poljubno kompleksno sinusoido
    ax4.set_title("Lastni DFT s poljubno kompleksno sinusoido")
    ax4.set(xlabel='Frekvenca', ylabel='Amplituda')

    X = myDFT2(test_samples, complexSin=True)
    ax4.stem(f1, abs(X), 'b',              markerfmt=" ", basefmt=" ")


# In[311]:


X = fft(x)
f = fftfreq(len(X), 1 / Fs)

N = len(X)
n = np.arange(N)

fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15,10))
fig.suptitle("Prikaz grafov iz zapiskov za vaje.", fontsize=24)
fig.subplots_adjust(hspace = 0.3)

#Narišemo amplitude kosinusov
ax1.set_title("Amplitude kosinusov.")
ax1.set(xlabel='Frekvenca', ylabel='Amplituda')
ax1.stem(n/len(n)*Fs, np.real(X), 'b',          markerfmt=" ", basefmt=" ")

#Narišemo amplitude sinusov
ax2.set_title("Amplitude sinusov.")
ax2.set(xlabel='Frekvenca', ylabel='Amplituda')
ax2.stem(n/len(n)*Fs, -1*np.imag(X), 'b',          markerfmt=" ", basefmt=" ")


M = abs(X) #Dobimo amplitude
P = np.array([math.atan2(np.real(x), np.imag(x)) for x in X]) #Dobimo faze
ax3.set_title("Amplitude faz.")
ax3.set(xlabel='Frekvenca', ylabel='Amplituda')
ax3.stem(n/len(n)*Fs, M, 'b',          markerfmt=" ", basefmt=" ")

#ax4.plot(P, 'b')

P1 = P*M[np.where(M > 0.1)]
ax4.set_title("Faze frekvenc.")
ax4.set(xlabel='Frekvenca', ylabel='Faza')
ax4.stem((n/len(n))*Fs, P1, 'b',         markerfmt=" ", basefmt=" ")
                               


# In[101]:


recording = RECORD()
Fs = 44100
num_samples = 3000

#x = load_partial_recording("e_mid.wav", Fs, 0, 0.1)
x = load_partial_recording(recording, Fs, 0, 0.1)
#if num_samples > 0 and num_samples < len(x):
x = x[:num_samples]

X = myDFT2(x, complexSin=True)
N = len(X)
n = np.arange(N)
frqs = n/len(n)*Fs
frqs = frqs[:len(frqs)//2]
X = X[:len(X)//2]


# In[102]:


plt.figure(figsize=(10,5))
plt.plot(frqs, np.abs(X))
plt.title("Frekvence v visoki izgovorjavi samoglasnika 'u'.", fontsize=18) #Naslov grafa
plt.ylabel("Amplituda", fontsize=14) #Oznaka y osi
plt.xlabel("Frekvenca", fontsize=14) #Oznaka x osi

frqs1 = frqs
amps1 = np.abs(X)

highs = []
#highCounter = 0
while len(highs) != 10:
    ind = np.argmax(amps1)    
    amps1[ind] = 0
    highs.append(ind)

for h in highs:
    print(round(frqs[h]))


# In[ ]:




