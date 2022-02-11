#!/usr/bin/env python
# coding: utf-8

# In[1]:


import numpy as np
from scipy.io import wavfile
from scipy.fft import fft, fftfreq, rfft, rfftfreq
import matplotlib.pyplot as plt
#%matplotlib notebook
get_ipython().run_line_magic('matplotlib', 'inline')
import pyaudio
import wave
import sys
import math
from mpl_toolkits import mplot3d


# # Load audio file

# In[3]:


def load_recording(fileName, start=None, end=None):
    if fileName[-4:] != ".wav": #Za enostavnejšo uporabniško izkušnjo končnico dodamo samodejno.
        fileName += ".wav"
    filePath = './posnetki/'
    Fv, data = wavfile.read(filePath + fileName) #Naložimo .wav datoteko
    posnetek = data.T[0] #Dobimo le prvi kanal.
    L = len(posnetek)
    T = round(L / Fv)
    if not start:
        start = 0
    if not end:       
        end = T   
    x = posnetek[round(start*Fv):round(end*Fv):1]
    params = {'L': L, 'T': T, 'Fv': Fv, 'start': start, 'end': end}
    return x, params


# ## Implementacija ST-DFT

# In[207]:


def framming(x, window_length=25, window_overlap = 0.5, Fv=16000):
    window_overlap = 1 - window_overlap 
    if window_overlap == 0:
        window_overlap = 0.01
    frame_length = int(window_length/1000*Fv) #Dolžina okna v vzorcev
    frame_step = int(np.ceil(frame_length * window_overlap)) #Koliko vzorcev se prekriva
    frames_count = int(np.ceil(float(len(x) - frame_length) / frame_step)) #Končno število okvirjev 
    
    padding_count = round(abs(len(x) - (frames_count * frame_step + frame_length))) #Padding za zadnji okvir
    padding = np.zeros(padding_count)
    x_padded = np.append(x, padding)
    
    indices1 = np.tile(np.arange(0, frame_length), (frames_count, 1))
    indices2 = np.tile(np.arange(0, frames_count*frame_step, frame_step), (frame_length, 1)).T
    indices = indices1 + indices2
    frames = x_padded[indices.astype(np.int32, copy=False)] #Signal razdelimo na okvirje
    return frames, indices

def STDFT(x, window_length=25, window_overlap=0.01, Fv=16000, NFFT=None, prints=True):
    frames, ind = framming(x, #Signal razdelimo na okvirje
                     window_length=window_length,
                     window_overlap=window_overlap,
                     Fv=Fv) 
    if not NFFT:
        NFFT = frames.shape[1]
    
    if prints:
        print('Signal split into ' + str(frames.shape[0]) + ' frames of ' + str(frames.shape[1]) + ' samples.')
        if frames.shape[1] > NFFT:
            print('Frames (' + str(frames.shape[1]) + ') are longer than NFFT... May cause problems!')
            print('Try decreasing \'window_length (' + 
                  str(window_length) + ')\' or increasing \'NFFT (' + str(NFFT) + ')\'')
    resX = rfft(frames, NFFT) #FFT nad vsakem okvirju
    resF = np.arange(0, NFFT//2 +1) #Frekvence
    #resF = np.arange(0, len(resX[0]))
    resT = ind[:, 0] #Časovni indeksi okvirjev
    return resX, resT, resF


# # TESTNI PROBLEM

# In[208]:


Fv = 44100
T = 1
t = np.linspace(0, T, num=T*Fv)

#Parametri sinusoid
f1 = 5
faz1 = 0
A1 = 1
f2 = 100
faz2 = 0
A2 = 1

s1 = A1*np.sin(2*np.pi*f1*t + faz1)
s2 = A2*np.sin(2*np.pi*f2*t + faz2)
x = s1 + s2
#x = s1
plt.figure(figsize=(15, 5))
plt.title('Sinusoida uporabljena pri testiranju implementacije')
plt.xlabel('Čas')
plt.ylabel('Amplituda')
plt.plot(t, x, 'r')


# In[209]:


window_length = 100
window_overlap = 0.01
resX, resT, resF = STDFT(x, 
                         window_length=window_length, 
                         window_overlap=window_overlap,
                         Fv=Fv,
                         NFFT=Fv
                        )


# In[210]:


print(resX.shape)
print(resT.shape)
print(resF.shape)
print(resT)


# In[211]:


plt.figure(figsize=(15, 5))
plt.pcolormesh(resT, resF, np.transpose(np.abs(resX)), shading='auto')
plt.title("Colormesh testnega primer pri dolzini okna: " + str(window_length)
          + "ms in odstotku prekrivanja: " + str(window_overlap*100) + "%.")
plt.ylabel("Frekvenca")
plt.xlabel("Čas (ms)")
plt.axis([0, 512, 0, 150]) #Uporabljeno za sliko sinusne funkcije pri žvižgu


# ## Primeri za vaje

# In[212]:


#recording = RECORD(CHUNK=1024, CHANNELS=2, RATE=Fv, DURATION=1)
recording = 'posnetki/eva_in_olu.wav'
Fv, data = wavfile.read(recording)
x = data.T[0]
T = round(len(x) / Fv)
t = np.linspace(0, T, num=T*(len(x)//T))


# In[215]:


window_length = 50
window_overlap = 0.5
resX, resT, resF = STDFT(x, 
                         window_length = window_length, 
                         window_overlap=window_overlap, 
                         Fv=Fv,
                         NFFT=4112)


# In[216]:


fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 3))
t = np.linspace(0, 3, num=len(x))
ax1.plot(t, x)
ax1.set(xlabel='Čas (s)', ylabel='Amplituda')
ax1.set_title(recording)

X = rfft(x)
xf = np.arange(0, len(X))
ax2.plot(xf, np.abs(X))
ax2.set(xlabel='Frekvenca', ylabel='Amplituda')
ax2.set_title('FFT celotnega posnetka.')
plt.axis([0, 200, 0, max(np.abs(X[:200]))])

plt.figure(figsize=(15, 5))
osX = np.linspace(0, T, num=len(resT))
plt.pcolormesh(osX, resF, np.transpose(np.abs(resX)), shading='auto')
plt.title("Colormesh testnega primer pri dolzini okna: " + str(window_length)
          + "ms in odstotku prekrivanja: " + str(window_overlap))
plt.ylabel("Frekvenca")
plt.xlabel("Čas")
plt.axis([0.5, 3, 0, 200]) #Uporabljeno za sliko sinusne funkcije pri žvižgu"""


# # Vprašanja iz vaj

# ### VPRAŠANJE 1
# 
# Kako je nestacionarnost signalov odvisna od hitrosti izgovorjave oz. ali se optimalna izbira dolžine intervalov za DFT in stopnje njihovega prekrivanja razlikuje od hitrosti izgovorjave? <br>
# 
# <b>Odgovor:</b><br>
# Hitrejša kot je izgovorjava beseda bolj je signal nestacionaren oziroma pri počasnejši izgovorjavi imamo intervale posnetke, kjer je signal dokaj stacionaren (naprimer interval izgovorjave enega samoglasnika).<br><br>
# Temu primerno moramo izbrati tudi dolžine intervalov za DFT:
# - Počasnejša izgovorjave => daljši intervali
# - Hitrejša izgovorjava => manjši intervali
# 
# <br>
# <b>Testi:</b><br>
# Na posnetkih počasne in hitre besede utica 8 testov.<br>
# Za velikosti okna (10, 25, 50, 100) in stopnje prekrivanja (0 in 50%)

# In[236]:


#GRAFI IZGOVORJENE BESEDE V DVEH RAZLIČNIH HITROSTIH
posnetek1 = 'utica_slow.wav'
posnetek3 = 'utica_fast.wav'

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(15, 6))
fig.suptitle("GRAFI IZGOVORJENE BESEDE V DVEH RAZLIČNIH HITROSTIH", fontsize=18)
fig.subplots_adjust(hspace = 0.3)

#Počasna izgovorjava
x, params = load_recording(posnetek1)
t = np.linspace(params['start'], params['end'], num=len(x))
ax1.plot(t, x)
ax1.set_title(posnetek1)

#Hitra izgovorjava
x, params = load_recording(posnetek3)
t = np.linspace(params['start'], params['end'], num=len(x))
ax2.plot(t, x)
ax2.set(xlabel='Čas')
ax2.set_title(posnetek3)


# #### TESTI NA POČASNEM POSNETKU

# In[237]:


x, params = load_recording(posnetek1, start=0.5, end=3) #Hitra izgovorjava
NFFT = 8224 #4112, 8224

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 3))

t = np.linspace(params['start'], params['end'], num=len(x))
ax1.plot(t, x)
ax1.set(xlabel='Čas (s)', ylabel='Amplituda')
ax1.set_title(posnetek1)

X = rfft(x)
xf = np.arange(0, len(X))
ax2.plot(xf, np.abs(X))
ax2.set(xlabel='Frekvenca', ylabel='Amplituda')
ax2.set_title('FFT celotnega posnetka.')
plt.axis([0, 200, 0, max(np.abs(X[:200]))])

fig, ((ax1, ax2), (ax3, ax4), (ax5, ax6), (ax7, ax8)) = plt.subplots(4, 2, figsize=(15, 16))
fig.subplots_adjust(hspace = 0.3)
axes = [ax1, ax2, ax3, ax4, ax5, ax6, ax7, ax8]
window_lengths = [10, 25, 50, 100] #V ms
window_overlaps = [0.01, 0.5]
index = 0
for i, win_len in enumerate(window_lengths):
    for j, win_over in enumerate(window_overlaps):
        resX, resT, resF = STDFT(x, 
                             window_length=win_len,
                             window_overlap=win_over, 
                             Fv=params['Fv'],
                             NFFT=NFFT)
        osX = np.linspace(params['start'], params['end'], num=len(resT))
        axes[index].set_title('Dolžina okna: ' + str(win_len) + ' in stopnje prekrivanja: ' + str(win_over*100) + '%.')
        axes[index].set(xlabel='Čas (s))', ylabel='Frekvenca (Hz)')
        axes[index].pcolormesh(osX, resF, np.transpose(np.abs(resX)), shading='auto')
        axes[index].axis([params['start'], params['end'], 0, 200])
        index += 1


# #### TESTI NA HITREM POSNETKU

# In[238]:


x, params = load_recording(posnetek3, start=1, end=2) #Hitra izgovorjava
NFFT = 8224 #4112, 8224

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 3))

t = np.linspace(params['start'], params['end'], num=len(x))
ax1.plot(t, x)
ax1.set(xlabel='Čas (s)', ylabel='Amplituda')
ax1.set_title(posnetek3)

X = rfft(x)
xf = np.arange(0, len(X))
ax2.plot(xf, np.abs(X))
ax2.set(xlabel='Frekvenca', ylabel='Amplituda')
ax2.set_title('FFT celotnega posnetka.')
plt.axis([0, 250, 0, max(np.abs(X[:250]))])

fig, ((ax1, ax2), (ax3, ax4), (ax5, ax6), (ax7, ax8)) = plt.subplots(4, 2, figsize=(15, 16))
fig.subplots_adjust(hspace = 0.3)
axes = [ax1, ax2, ax3, ax4, ax5, ax6, ax7, ax8]
window_lengths = [10, 25, 50, 100] #V ms
window_overlaps = [0.01, 0.5]
index = 0
for i, win_len in enumerate(window_lengths):
    for j, win_over in enumerate(window_overlaps):
        resX, resT, resF = STDFT(x, 
                             window_length=win_len,
                             window_overlap=win_over, 
                             Fv=params['Fv'],
                             NFFT=NFFT)
        osX = np.linspace(params['start'], params['end'], num=len(resT))
        axes[index].set_title('Dolžina okna: ' + str(win_len) + ' in stopnje prekrivanja: ' + str(win_over*100) + '%.')
        axes[index].set(xlabel='Čas (s))', ylabel='Frekvenca (Hz)')
        axes[index].pcolormesh(osX, resF, np.transpose(np.abs(resX)), shading='auto')
        axes[index].axis([params['start'], params['end'], 0, 200])
        index += 1


# ### VPRAŠANJE 2
# 
# Kako se z izbiro dolžine intervalov spreminja zaznava višjih harmonikov v frekvenčni sliki posameznih intervalov? 
# 
# <b>Odgovor:</b><br>
# Pri daljši izbiri okna lažje enolično določimo višje harmonike v frekvenčni sliki. Pri manjših oknih so meje prehodov manj vidne (posebej pri prikazu s spektogramo.
# 
# (Glej spodnji sliki prikaza višjih harmonikov)
# 
# ![image-6.png](attachment:image-6.png)
# 
# ![image-5.png](attachment:image-5.png)
# 

# ### VPRAŠANJE 3
# 
# Kako izbira dolžine intervalov spreminja razlikovanje med samoglasniki slovenske abecede?
# 
# <b>Odgovor:</b><br>
# Zelo majhna okna (10ms) utežijo razlikovanje med samoglasniki. Večja okna (25, 50 in 100ms) omogočijo boljše razlikovanje in sicer, večje kot je okno lažje se prepoznajo različni samoglasniki. 

# #### STDFT za eno sekundni posnetek vsakega samoglasnika

# In[228]:


samoglasniki = ['a', 'e', 'i', 'o', 'u']
window_length=50
window_overlap=0.5
fig, ((ax1, ax2), (ax3, ax4), (ax5, ax6)) = plt.subplots(3, 2, figsize=(15, 12))
fig.subplots_adjust(hspace = 0.3)
axes = [ax1, ax2, ax3, ax4, ax5]
for i, samoglasnik in enumerate(samoglasniki):
    x, params = load_recording(samoglasnik, start=1, end=2)
    resX, resT, resF = STDFT(x,
                             window_length=window_length,
                             window_overlap=window_overlap, 
                             Fv=params['Fv'],
                             NFFT=NFFT)
    osX = np.linspace(params['start'], params['T'], num=len(resT))
    axes[i].set_title('(' + samoglasnik + ') Dolžina okna: ' + str(window_length) + ' in stopnje prekrivanja: ' + str(window_overlap*100) + '%.')
    axes[i].set(xlabel='Čas (s))', ylabel='Frekvenca (Hz)')
    axes[i].pcolormesh(osX, resF, np.transpose(np.abs(resX)), shading='auto')
    axes[i].axis([params['start'], params['end'], 0, 150])
ax6.axis('off')


# #### 3s posnetek, ki je sestavljen iz 0.6s posnetka vsakega samoglasnika 

# In[229]:


samoglasniki = ['a', 'e', 'i', 'o', 'u']
Fv = 44100
x = np.zeros(3*Fv)
for i, samoglasnik in enumerate(samoglasniki):
    _x, params = load_recording(samoglasnik, start=1, end=1.6)
    x[i*len(_x):(i+1)*len(_x)] = _x

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 3))
t = np.linspace(0, 3, num=len(x))
ax1.plot(t, x)
ax1.set(xlabel='Čas (s)', ylabel='Amplituda')
ax1.set_title('Posnetek petih samoglasnikov.')

X = rfft(x)
xf = np.arange(0, len(X))
ax2.plot(xf, np.abs(X))
ax2.set(xlabel='Frekvenca', ylabel='Amplituda')
ax2.set_title('FFT celotnega posnetka.')
plt.axis([0, 200, 0, max(np.abs(X[:200]))])

fig, ((ax1, ax2), (ax3, ax4), (ax5, ax6), (ax7, ax8)) = plt.subplots(4, 2, figsize=(15, 16))
fig.subplots_adjust(hspace = 0.3)
axes = [ax1, ax2, ax3, ax4, ax5, ax6, ax7, ax8]
window_lengths = [10, 25, 50, 100] #V ms
window_overlaps = [0.01, 0.5]
index = 0
for i, win_len in enumerate(window_lengths):
    for j, win_over in enumerate(window_overlaps):
        resX, resT, resF = STDFT(x, 
                             window_length=win_len,
                             window_overlap=win_over, 
                             Fv=params['Fv'],
                             NFFT=NFFT)
        osX = np.linspace(0, 3, num=len(resT))
        axes[index].set_title('Dolžina okna: ' + str(win_len) + ' in stopnje prekrivanja: ' + str(win_over*100) + '%.')
        axes[index].set(xlabel='Čas (s))', ylabel='Frekvenca (Hz)')
        axes[index].pcolormesh(osX, resF, np.transpose(np.abs(resX)), shading='auto')
        axes[index].axis([0, 3, 0, 150])
        index += 1


# ### VPRAŠANJE 4
# 
# Kako izbira dolžine intervalov spreminja razlikovanje med soglasnikoma "r" in "š"?

# In[230]:


soglasnika = ['sh', 'r']
window_length=50
window_overlap=0.01
fig, ((ax1, ax2)) = plt.subplots(1, 2, figsize=(15, 3))
fig.subplots_adjust(hspace = 0.3)
axes = [ax1, ax2, ax3, ax4, ax5]
for i, soglasnik in enumerate(soglasnika):
    x, params = load_recording(soglasnik, start=0, end=3)
    resX, resT, resF = STDFT(x,
                             window_length=window_length,
                             window_overlap=window_overlap, 
                             Fv=params['Fv'],
                             NFFT=NFFT)
    osX = np.linspace(params['start'], params['T'], num=len(resT))
    axes[i].set_title('(' + soglasnik + ') Dolžina okna: ' 
                      + str(window_length) + ' in stopnje prekrivanja: ' + str(window_overlap*100) + '%.')
    axes[i].set(xlabel='Čas (s))', ylabel='Frekvenca (Hz)')
    axes[i].pcolormesh(osX, resF, np.transpose(np.abs(resX)), shading='auto')
ax1.axis([params['start'], params['end'], 0, 1000])
ax2.axis([params['start'], params['end'], 0, 100])


# In[ ]:




