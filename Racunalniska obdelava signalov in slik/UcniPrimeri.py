#!/usr/bin/env python
# coding: utf-8

# In[1]:


import numpy as np
from scipy.io import wavfile
from scipy.signal import hilbert, tf2zpk
from scipy.fft import fft, fftfreq, rfft, rfftfreq
import matplotlib.pyplot as plt
#matplotlib notebook
get_ipython().run_line_magic('matplotlib', 'inline')
import pyaudio
import wave
import sys
import math


# # Test spremembe frekvence vzorčenja

# In[2]:


fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
Fv1 = 512 #Frekvenca vzorčenja prvega primer v Hz
Fv2 = 2048 #Frekvenca vzorčenja prvega primer v Hz
T = 3
t1 = np.linspace(0, T, num=T*Fv1)
t2 = np.linspace(0, T, num=T*Fv2)
s1 = np.sin(2*np.pi*t1) #Realna običajna sinusoida
s2 = np.sin(2*np.pi*t2) #Realna običajna sinusoida2


ax1.plot(t1, s1)
ax1.set(xlabel='čas', ylabel='amplituda')
ax1.set_title('Sinusoida pri frekvenci vzorčenja 512')

ax2.plot(t2, s2)
ax2.set(xlabel='čas', ylabel='amplituda')
ax2.set_title('Sinusoida pri frekvenci vzorčenja 2048')

print('Dolžina t1: ' + str(len(t1))) #Število vzorcev T*Fvz
print('Korak pri t1: ' + str(t1[2] - t1[1])) #razlika med drugim in tretjim elementom po X-osi.
print('---------------------------------------')
print('Dolžina t1: ' + str(len(t2)))
print('Korak pri t1: ' + str(t2[2] - t2[1]))
#Vidimo, da se funkcija ne spremeni pri spremembi frekvence vzorčenja
#Razlika je le v tem, koliko vzorcev želimo za kasnejšo analiziranje funkcij.


# # Test spremembe parametrov sinusoide (amplituda, frekvenca, faza)

# In[3]:


Fv = 512 #Frekvenca vzorčenja
T = 3 #Čas trajanja sinusoide
t = np.linspace(0, T, num=Fv*T) #Vektor časovnih vzorcev

#PRIVZETI PARAMETRI SINUSOIDE
A = 1 #Amplituda: 'od koliko do koliko' niha funkcija po Y-osi
f = 1 #Frekvenca: 'kolikokrat' zaniha funkcija v 1s... Pomen herza (!= Frekvenca vzorčenja)!!!
faz = 0 #Zamik?? Faza se izraža v RADIANIH!

fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))

s = A * np.sin(2*np.pi*f*t + faz) #Realna sinusoida
ax1.set_title('Sinusoida pri privzetih parametrih.')
ax1.set(xlabel='čas', ylabel='amplituda')
ax1.plot(t, s)

s = (A*5) * np.sin(2*np.pi*f*t + faz) #Realna sinusoida za drugi primer
ax2.set_title('Sinusoida pri amplitudi *= 5.')
ax2.set(xlabel='čas', ylabel='amplituda')
ax2.plot(t, s)

s = A * np.sin(2*np.pi*(f+2)*t + faz) #Realna sinusoida za tretji primer
ax3.set_title('Sinusoida pri frekvenci sinusoide += 2.')
ax3.set(xlabel='čas', ylabel='amplituda')
ax3.plot(t, s)

s = A * np.sin(2*np.pi*f*t + (faz+1)) #Realna sinusoida za četrti primer
ax4.set_title('Sinusoida pri fazi += 1.') 
ax4.set(xlabel='čas', ylabel='amplituda')
ax4.plot(t, s)


# # Ortogonalnosti realnih sinusoid
# 
# Ortogonalnost pomeni <b>pravokotnost</b>.<br>
# Če je rezultat <b>skalarnega produkta enak 0</b>, sta vektorja <b>pravokotna</b>.<br>
# Trditev drži neodvisno od dimenzionalnosti vektorja.<br>
# Pravokotna projekcija pravokotnih vektorjev drug na drugega ima dolžino 0<br>

# In[4]:


Fv = 1000 #Frekvenca vzorčenja
T = 1 #Dolžina časvonega intervala
t = np.linspace(0, T, num=T*Fv) #Vektor časovnih vzorcev

"""
Zgled2 iz: Zgledi_ROSiS_26_2_2021 (line 37)
Parametri sinusoid
Ali so ortogonalne naslednje sinusoide?
    1) f1=5, faz1=0 in f2=6, faz2=0
    2) f1=5, faz1=0 in f2=5.1, faz2=0
    3) f1=5, faz1=0 in f2=5, faz2 = pi/2
"""

f1=5 #Parametri prve sinusoide so pri vseh primerih enaki
faz1=0
s1 = np.sin(2*np.pi*t*f1  + faz1)

#s2_1 => sinusoida 2 primer 1
s2_1 = np.sin(2*np.pi*t*6 + 0)
s2_2 = np.sin(2*np.pi*t*5.1 + 0)
s2_3 = np.sin(2*np.pi*t*5 + np.pi//2)

print('Skalarni produkti vseh treh primerov:')
print('1) ' + str(np.dot(s1, s2_1)))
print('2) ' + str(np.dot(s1, s2_2)))
print('3) ' + str(np.dot(s1, s2_3)))
#Skalarni produkt ni nikoli  0??? 
print('---------------------------------------')
#Skalarni produkt zaokrožimo ali pa določimo nizek prag.
print('1) ' + str(round(np.dot(s1, s2_1))))
print('2) ' + str(round(np.dot(s1, s2_2))))
print('3) ' + str(round(np.dot(s1, s2_3))))

#Narišimo še primerjave vseh funkcij
fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(15, 10))
fig.suptitle("Prikaz funkcij iz primerov: Modra = osnovna, Oranžna = primerjalna.", fontsize=18)
fig.subplots_adjust(hspace = 0.3)

ax1.plot(t, s1)
ax1.plot(t, s2_1)
ax1.set_title('Primer 1.')

ax2.plot(t, s1)
ax2.plot(t, s2_2)
ax2.set(ylabel='Amplituda')
ax2.set_title('Primer 2.')

ax3.plot(t, s1)
ax3.plot(t, s2_3)
ax3.set(xlabel='Čas')
ax3.set_title('Primer 3.')


# <b>Odgovor:</b> Ortogonalni nista sinusoidi iz primera 2... f1=5, faz1=0 in f2=5.1, faz2=0<br>
# <b>Ugotovitev:</b> Sinusoide so ortogonalne pri različnih frekvencah in fazah. <b>V kolikor so frekvence cela števila in faza enaka pi/2</b><br>
# Kaj pa amplitude? Kaj pa dve realni frekvenci (na primer 5.1 in 5.3)?

# In[5]:


#Bonus primeri
#1) Različna amplituda a enaka funkcija
s1_1 = 2*np.sin(2*np.pi*t*1 + 0)
s1_2 = 5*np.sin(2*np.pi*t*1 + 0)

#2) Različna amplituda in različna frekvenca
s2_1 = 2*np.sin(2*np.pi*t*1 + 0)
s2_2 = 5*np.sin(2*np.pi*t*2 + 0)

#3) Primer iz zapiskov vendar faza != pi/2
s3_1 = np.sin(2*np.pi*t*5 + 0)
s3_2 = np.sin(2*np.pi*t*5 + np.pi/3)

#4) Dve realni a različni frekvenci
s4_1 = np.sin(2*np.pi*t*5.1 + 0)
s4_2 = np.sin(2*np.pi*t*5.3 + 0)

print('Skalarni produkti bonus primerov:')
print('1) ' + str(round(np.dot(s1_1, s1_2))))
print('2) ' + str(round(np.dot(s2_1, s2_2))))
print('3) ' + str(round(np.dot(s3_1, s3_2))))
print('4) ' + str(round(np.dot(s4_1, s4_2))))


# <b>Dodatne ugotovitve:</b><br>
# Funkcija ni ortogonalna sama s sabo. Razen pri fazi pi/2!.<br>
# Amplituda nima vpliva na ortogonalnost funkcij.<br>
# 
# ### Kaj pa pri kompleksnih sinusoidah???

# # Začetek Fourierove analize

# In[6]:


Fv = 1000
T = 1
t = np.linspace(0, T, num=T*Fv)

#Parametri sinusoid
f1 = 5
faz1 = 0
A1 = 1
f2 = 6
faz2 = 0
A2 = 1

s1 = A1*np.sin(2*np.pi*f1*t + faz1)
s2 = A2*np.sin(2*np.pi*f2*t + faz2)
x = s1 + s2

SP1 = np.dot(x, s1) # == s1*s1' + s2*s1' => amplitudo s katero v signalu x nastopa s1
SP2 = np.dot(x, s2) # == s1*s2' + s2*s2' => amplitudo s katero v signalu x nastopa s2
print(SP1) #499.5
print(SP2) #499.5
print(SP1 + SP2) #999.0...01 (Sorazmerno s Fv*T... frekvenca funkcij ne vpliva vendar pazi na 
                                                    #spremembo amplitud in faznih zamikov funkcij)

plt.figure(figsize=(15, 5))
plt.plot(t, s1) #Modra
plt.plot(t, s2) #Oranžna
plt.plot(t, x, 'r') #Rdeča
plt.xlabel('Čas')
plt.ylabel('Amplituda')


# # Kompleksne sinusoide
# (v resnici kompleksne eksponentne funkcije pri konstantni amplitudi) 

# In[8]:


Fv = 1000
T = 1
t = np.linspace(0, T, num=T*Fv)

f1 = 5 #Frekvenca sinusoide
faz1 = 0 #Faza sinusoide
A1 = 1 #Amplituda sinusoide

s1 = A1*np.exp(1j*(2*np.pi*f1*t + faz1))

plt.figure(figsize=(8, 4))
plt.plot(t, np.real(s1))

fig = plt.figure(figsize=(12, 8))
ax = plt.axes(projection="3d")
ax.plot3D(t, np.real(s1), np.imag(s1))
plt.show()


# ### Ortogonalnost kompleksnih sinusoid

# In[9]:


# NAMIGI: Igrajte se z vrednostmi faz, amplitud in frekvenc obeh sinusoid. 
# 1. Kaj se dogaja, ko sta f1 in f2 enaki, fazi sinusoid pa sta razlièni?
# 2. Kaj se dogaja, ko sta f1 in f2 razlièni za en nihaj na opazovanem intervalu 
        #in kako na to vpliva faza sinusoid? 
# 3. Kaj se dogaja, ko sta f1 in f2 razlièni za veèkratnik nihaja na opazovanem intervalu 
        #in kako na to vpliva faza sinusoid?
# 4. Kaj se dogaja, ko sta f1 in f2 razlièni za poljuben del nihaja na opazovanem intervalu 
        #in kako na to vpliva faza sinusoid?
A1 = 1
A2 = 1
#Primer 1:
faza1 = 0
faza2 = 0
s1_1 = A1*np.exp(1j*(2*np.pi*7*t + faza1))
s1_2 = A2*np.exp(1j*(2*np.pi*21*t + faza2))
rez = np.abs(np.dot(s1_1, np.conj(s1_2)))
print("1) " + str(rez))

#Primer 2:
f1 = 5
f2 = 5
s2_1 = A1*np.exp(1j*(2*np.pi*f1*t + 0))
s2_2 = A2*np.exp(1j*(2*np.pi*f2*t + 0.7854))
rez = np.abs(np.dot(s2_1, np.conj(s2_2)))
print("2) " + str(rez))

#Primer 3:
f1 = 2
f2 = 3*f1
s3_1 = A1*np.exp(1j*(2*np.pi*f1*t + 0))
s3_2 = A2*np.exp(1j*(2*np.pi*f2*t + 0))
rez = np.abs(np.dot(s3_1, np.conj(s3_2)))
print("3) " + str(rez))

#Primer 4:
f1 = 5
f2 = 19
s4_1 = A1*np.exp(1j*(2*np.pi*f1*t + 2))
s4_2 = A2*np.exp(1j*(2*np.pi*f2*t + 4))
rez = np.abs(np.dot(s4_1, np.conj(s4_2)))
print("4) " + str(rez))


# In[10]:


def load_partial_recording(fileName, Fs, start, end):
    fs, data = wavfile.read(fileName) #Naložimo .wav datoteko
    posnetek = data.T[0] #Dobimo le prvi kanal.     
    x = posnetek[round(start*Fs):round((start+end)*Fs):1]
    return x

Fs = 44100
x = load_partial_recording("./posnetki/e_mid.wav", Fs, 0, 5)
t = np.linspace(0, len(x) / Fs, num=len(x))


# ## Filtri itd

# In[11]:


plt.figure(figsize=(15, 5))
plt.plot(t, x, 'b') #Modra
plt.plot(t, np.abs(x), 'r') #Rdeča
plt.plot(t, np.abs( hilbert(x) ), 'g') #Zelena
plt.xlabel('Čas')
plt.ylabel('Amplituda')


# In[12]:


#DFT neanalitičnega signala
x = load_partial_recording("./posnetki/e_mid.wav", Fs, 0, 1)
X = fft(x)
f = np.arange(len(X))/len(X)*Fs
plt.plot(f, np.abs(X)) #Modra
plt.xlabel('Frekvenca')
plt.ylabel('Amplituda')


# In[13]:


#DFT analitičnega signala
x = hilbert(load_partial_recording("./posnetki/e_mid.wav", Fs, 0, 1))
X = fft(x)
f = np.arange(len(X))/len(X)*Fs
plt.plot(f, np.abs(X)) #Modra
plt.xlabel('Frekvenca')
plt.ylabel('Amplituda')


# ## Neanalitični signali in Nyquistov teorem...

# In[14]:


#Zgled 2a
Fs = 44100
L = 5
f1 = 30000 #Frekvenca sinusoide (v Hz).... Krepko nad Nyquistovo frekvenco
A = 1 #Amplituda sinusoide
t = np.arange(L*Fs)/Fs
umetnaSinusoida = A*np.sin(2*np.pi*f1*t + 0) #Realna sinusoida -> Neanalitična
x = umetnaSinusoida
X = fft(x)
f = np.arange(len(X))/len(X)*Fs
plt.plot(f, np.abs(X)) #Modra
plt.xlabel('Frekvenca')
plt.ylabel('Amplituda')


# ## Analitični signal in Nyquistov teorem...

# In[15]:


#Zgled 2b
Fs = 44100
L = 5
f1 = 30000
A = 1
t = np.arange(L*Fs)/Fs
umetnaSinusoida = A*np.sin(2*np.pi*f1*t + 0) #Realna sinusoida -> Neanalitična
x = hilbert(umetnaSinusoida)
X = fft(x)
f = np.arange(len(X))/len(X)*Fs
plt.plot(f, np.abs(X)) #Modra
plt.xlabel('Frekvenca')
plt.ylabel('Amplituda')


# In[16]:


Fs = 44100
L = 5
f1 = 30000
A = 1
t = np.arange(L*Fs)/Fs
umetnaSinusoida = A*np.exp(1j*(2*np.pi*f1*t + 0))#Kompleksna sinusoida -> Analitična
x = umetnaSinusoida
X = fft(x)
f = np.arange(len(X))/len(X)*Fs
plt.plot(f, np.abs(X)) #Modra
plt.xlabel('Frekvenca')
plt.ylabel('Amplituda')


# ## Analitični signal in spektralno prepuščanje
# FFT pretvori signal iz časovnega v frekvenčni prostor. Kljub temu, da ima signal končno dolžino ga z diskretno Fourierovo transformacijo obravnavamo kot periodičnega in neskončnega.
# 
# Če s FFT pretvorimo signal z dolžino 1024 vzorcev bomo dobili signal v frekvenčnem prostoru razdeljen na 1024 frekvenčnih razdelkov. Vsaka frekvenčna komponenta doda vrednost v posamezen frekvenčni razdelek. Če frekvenčna komponenta ni popolnoma poravnana s sredino frekvenčnega razdelka gre nekaj njene energije (amplitude)  tudi v sosednje razdelke. To imenujemo spektralno prepuščanje.

# In[17]:


Fs = 44100
L = 5
f1 = 1026.5
#f1 = 1000.1
A = 1
t = np.arange(L*Fs)/Fs
#umetnaSinusoida = A*np.sin(2*np.pi*f1*t + 0) #OPCIJA 1 
umetnaSinusoida = hilbert(A*np.sin(2*np.pi*f1*t + 0)) #OPCIJA 2
#umetnaSinusoida = A*np.exp(1j*(2*np.pi*f1*t + 0)) #OPCIJA 3

fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))

zacetekOdseka = 0
dolzinaOdseka = 5
x = umetnaSinusoida[zacetekOdseka*Fs : (zacetekOdseka + dolzinaOdseka)*Fs]
X = fft(x)
f = np.arange(len(X))/len(X)*Fs
ind = np.where(f < 1500)
ax1.set_title('Frekvenčna slika pri dolžini odseka ' + str(dolzinaOdseka) + ' s in začetku odseka ' + str(zacetekOdseka) + ' s')
ax1.set(xlabel='Frekvenca (Hz)', ylabel='Amplituda')
ax1.plot(f[ind], np.abs(X[ind]))

zacetekOdseka = 0
dolzinaOdseka = 3
x = umetnaSinusoida[zacetekOdseka*Fs : (zacetekOdseka + dolzinaOdseka)*Fs]
X = fft(x)
f = np.arange(len(X))/len(X)*Fs
ind = np.where(f < 1500)
ax2.set_title('Frekvenčna slika pri dolžini odseka ' + str(dolzinaOdseka) + ' s in začetku odseka ' + str(zacetekOdseka) + ' s')
ax2.set(xlabel='Frekvenca (Hz)', ylabel='Amplituda')
ax2.plot(f[ind], np.abs(X[ind]))

zacetekOdseka = 0
dolzinaOdseka = 1
x = umetnaSinusoida[zacetekOdseka*Fs : (zacetekOdseka + dolzinaOdseka)*Fs]
X = fft(x)
f = np.arange(len(X))/len(X)*Fs
ind = np.where(f < 1500)
ax3.set_title('Frekvenčna slika pri dolžini odseka ' + str(dolzinaOdseka) + ' s in začetku odseka ' + str(zacetekOdseka) + ' s')
ax3.set(xlabel='Frekvenca (Hz)', ylabel='Amplituda')
ax3.plot(f[ind], np.abs(X[ind]))

zacetekOdseka = 0
dolzinaOdseka = 0.02
x = umetnaSinusoida[zacetekOdseka*Fs : round((zacetekOdseka + dolzinaOdseka)*Fs)]
X = fft(x)
f = np.arange(len(X))/len(X)*Fs
ind = np.where(f < 1500)
ax4.set_title('Frekvenčna slika pri dolžini odseka ' + str(dolzinaOdseka) + ' s in začetku odseka ' + str(zacetekOdseka) + ' s')
ax4.set(xlabel='Frekvenca (Hz)', ylabel='Amplituda')
ax4.plot(f[ind], np.abs(X[ind]))


# Do spektralnega prepuščanja pride pri vseh treh različnih opcijah

# In[ ]:




