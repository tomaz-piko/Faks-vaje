#!/usr/bin/env python
# coding: utf-8

# In[29]:


from python_speech_features.base import hz2mel, mel2hz, delta, mfcc
from scipy import signal
from scipy.io import wavfile
from scipy.fft import rfft, rfftfreq, dct
import numpy as np
import matplotlib.pyplot as plt


# ## Testni primer

# In[106]:


#Osnovni parametri
Fv_test = 1600
T_test = 1
t = np.linspace(0, T_test, num=T_test*Fv_test)
#Parametri sinusoid
f1 = 100
faz1 = 0
A1 = 1
f2 = 5
faz2 = 0
A2 = 1
#Generiranje sinusoid
s1 = A1*np.sin(2*np.pi*f1*t + faz1)
s2 = A2*np.sin(2*np.pi*f2*t + faz2)
#Generiranje signala
x = s1 + s2
#Izris
plt.figure(figsize=(15, 3))
plt.title('Sinusoida uporabljena pri testiranju implementacije')
plt.xlabel('Čas')
plt.ylabel('Amplituda')
plt.plot(t, x, 'r')


# ### Koraki
# 
# 1.) Zvočni posnetek najprej z izbrano okensko funkcijo razdelimo v posamezne odseke <br>
# 2.) Za vsak odseke izračunamo DFT. <br>
# 3.) Celotno frekvenčno os razdelimo na posamezne frekvenčne pasove (banke filtrov). <br>
# 4.) Na vsakem frekvenčnem pasu izračunamo vsoto dobljenih filtriranih amplitud frekvenc. <br>
# 5.) Dobljene vrednosti nelinearno rektificiramo. <br>
# 6.) Rektificirane vrednosti vstavimo DFT in s tem zmanjšamo korelacijo (redundanco med njimi). <br>

# In[31]:


#1.) Delitev na posamezne odseke. (uporaba hammingove okenske funkcije s scipy v naslednjem koraku)
def framming(x, window_length=25, window_overlap = 0.5, Fv=16000):
    window_overlap = 1 - window_overlap
    if window_overlap == 0:
        window_overlap = 0.001
    frame_length = int(window_length/1000*Fv)
    frame_step = int(np.ceil(frame_length * window_overlap))
    frames_count = int(np.ceil(float(len(x) - frame_length) / frame_step))
    
    padding_count = round(abs(len(x) - (frames_count * frame_step + frame_length)))
    padding = np.zeros(padding_count)
    x_padded = np.append(x, padding)
    
    indices1 = np.tile(np.arange(0, frame_length), (frames_count, 1)) #A, reps
    indices2 = np.tile(np.arange(0, frames_count*frame_step, frame_step), (frame_length, 1)).T
    indices = indices1 + indices2
    frames = x_padded[indices.astype(np.int32, copy=False)]
    return frames
    
window_length = 50 #Dolžina okna v ms
window_overlap = 0.25
frames = framming(x, window_length=window_length, window_overlap=window_overlap, Fv=Fv_test)
print(frames.shape)


# In[32]:


#2.) Uporaba hammingovega okna in DFT.
def frames_DFT(frames, window, NFFT=512):
    frames = np.multiply(frames, window)
    X = rfft(frames, n=NFFT)
    pow_X = ((1.0 / NFFT) * ((np.abs(X)) ** 2))
    return X, pow_X

nfft=512
window = signal.hamming(frames.shape[1])
X, pow_X = frames_DFT(frames, window, NFFT=nfft)


# In[33]:


plt.plot(window)
plt.title("Hammingovo okno")
plt.ylabel("Amplituda")
plt.xlabel("Vzorec")


# #### Izračun bank filtrov

# ![image.png](attachment:image.png)
# 
# M => number if filters we want <br>
# f() => list of M+2 Mel-spaced frequencies <br>
# 
# (na zgornji enačbi spodnji in zgornji izračun lahko izpustimo saj so banke filtrov že sestavljene iz samih ničel (np.zeros))
# 
# ![image-2.png](attachment:image-2.png)
# 
# Pretvorba med meli in herzi.

# In[34]:


#3.) Celotno frekvenčno os razdelimo na posamezne frekvenčne pasove (banke filtrov).
def get_filter_banks(filters_count = 40, low_freq = 0, high_freq = 8000, Fv=16000, NFFT=512):
    if low_freq >= high_freq:
        print('get_filter_banks: Error with frequency values')
        return
    low_freq_mel = hz2mel(low_freq)
    high_freq_mel = hz2mel(high_freq)
    
    mel_pts = np.linspace(low_freq_mel, high_freq_mel, filters_count + 2)
    hz_pts = mel2hz(mel_pts)
    indices = np.floor((NFFT+1) * hz_pts / Fv)
    filter_banks = np.zeros((filters_count, int(np.floor(NFFT/2)) + 1))
    for m in range(1, len(indices)-1):
        m_left = indices[m - 1]
        m_center = indices[m]
        m_right = indices[m + 1]

        for k in range(int(m_left), int(m_center)):
            filter_banks[m - 1, k]= (k - m_left) / (m_center - m_left)
        for k in range(int(m_center), int(m_right)):
            filter_banks[m - 1, k]= (m_right - k) / (m_right - m_center)
    return filter_banks
    
filters_count = 26
low_freq = 0
high_freq = Fv_test//2
filter_banks = get_filter_banks(filters_count=filters_count,
                               low_freq=low_freq,
                               high_freq=high_freq,
                               Fv=Fv_test,
                               NFFT=nfft)

plt.figure(figsize=(15, 3))
plt.title('Banke filtrov')
plt.xlabel('Frekvenca')
plt.ylabel('Amplituda')

t = np.linspace(low_freq, high_freq, num=nfft//2 + 1)
for fb in filter_banks:
    plt.plot(t, fb)
plt.show()


# In[35]:


def get_mfcc(filter_banks, pow_frames, coef_count=12):
    #4.) Na vsakem frekvenčnem pasu izračunamo vsoto dobljenih filtriranih aplitud frekvenc
    fb = np.dot(pow_frames, filter_banks.T) 
    fb = np.where(fb == 0, #Ničle zamenjamo z najmanjšo možno vrednostjo float
                np.finfo(float).eps, #To naredimo da se izognemo deljenjo z ničlo v naslednjem koraku
                fb)
    
    #5.) Dobljene vrednosti nelinearno rektificiramo (npr. uporabimo logaritemsko funkcijo).
    fb = 20*np.log10(fb)
    
    #6.) Rektificirane vrednosti vstavimo DFT in s tem zmanjšamo korelacijo (redundanco med njimi). 
    mfcc = dct(fb, type=2, axis=1, norm='ortho')
    mfcc = mfcc[:, 1 : (coef_count + 1)] #Obdržimo nekaj spodnjih koef. MFCC ostale zavržemo.
    return fb, mfcc
    
coef_count = 12
fb, _ = get_mfcc(filter_banks, pow_X, coef_count=coef_count)


# In[36]:


osX = np.linspace(0, T_test, num=fb.shape[0])
osY = np.linspace(0, Fv_test, num=fb.shape[1])

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 3))

ax1.set_title('Sinusoida uporabljena pri testiranju implementacije')
ax1.set(xlabel='Čas (s)', ylabel='Amplituda')
ax1.plot(np.linspace(0, T_test, num=T_test*Fv_test), x, 'r')

ax2.set_title('MFCC')
ax2.set(xlabel='Čas (s)', ylabel='Frekvenca (Hz)')
ax2.pcolormesh(osX, osY, np.transpose(fb), shading='auto')


# ## Primeri iz vaj

# In[37]:


recording = 'posnetki/eva_in_olu.wav'
Fv, data = wavfile.read(recording)
x = data.T[0]
T = round(len(x) / Fv) #Trajanje posnetka
samples_per_second = int(len(x) / T)
t = np.linspace(0, T, num=T*samples_per_second)

print('Frekvenca vzorčenja posnetka: ' + str(Fv))
print('Dolžina posnetka v s: ' + str(T))
print('Dolžina posnetka v vzorcih: ' + str(len(x)))
print('Število vzorcev na sekundo: ' + str(samples_per_second))


# In[38]:


plt.figure(figsize=(15, 3))
plt.plot(t, x)
plt.ylabel("Amplituda", fontsize=14) #Oznaka y osi
plt.title(recording, fontsize=18) #Naslov grafa
plt.xlabel("Frekvenca", fontsize=14) #Oznaka x osi
plt.show()


# In[39]:


#Parametri
WINDOW_LENGTH = 50 #Dolžina okna v ms
WINDOW_OVERLAP = 0.25
NFFT = 2048 #FFT 
FILTERS_COUNT = 26 #Število filtrov v bankah
LOW_FREQ = 0
HIGH_FREQ = Fv//2
MFCC_COEF_COUNT = 12 #Število obdržanih MFCC koeficientov


# In[40]:


#Korak 1
print('Framming signal...')



print('Signal split into ' + str(frames.shape[0]) + ' frames of ' + str(frames.shape[1]) + ' samples.')

#Korak 2
window = signal.hamming(frames.shape[1])
print('Hamming and applying DFT...')
X, pow_X = frames_DFT(frames, window, NFFT=NFFT)

#Korak 3
print('Calculating filter banks...')
filter_banks = get_filter_banks(filters_count=FILTERS_COUNT,
                               low_freq=LOW_FREQ,
                               high_freq=HIGH_FREQ,
                               Fv=Fv,
                               NFFT=NFFT)

#Koraki 4, 5, 6
print('Applying filter banks to power of signal & calculating MFCC coef\'s...')
fb, _mfcc = get_mfcc(filter_banks, pow_X, coef_count=MFCC_COEF_COUNT)

osX = np.linspace(0, T, num=fb.shape[0])
osY = np.linspace(0, Fv, num=fb.shape[1])
plt.figure(figsize=(15, 3))
plt.xlabel('Čas (s)')
plt.ylabel('Frekvenca (Hz)')
plt.pcolormesh(osX, osY, np.transpose(fb), shading='auto')


# In[44]:


DELTAS_LOOKAHEAD = 5
deltas = delta(_mfcc, DELTAS_LOOKAHEAD)
delta_deltas = delta(deltas, DELTAS_LOOKAHEAD)

fig, (ax1, ax2, ax3, ax4) = plt.subplots(4, 1, figsize=(15, 12))
fig.subplots_adjust(hspace = 0.5)

osX = np.linspace(0, T, num=_mfcc.shape[0])
osY = np.linspace(1, _mfcc.shape[1]+1, num=_mfcc.shape[1])

ax1.set_title(recording)
ax1.set(xlabel='Čas (s)', ylabel='Amplituda')
ax1.plot(t, x)

ax2.set_title('MFCC')
ax2.set(xlabel='Čas (s)', ylabel='Koeficienti')
ax2.pcolormesh(osX, osY, np.transpose(_mfcc), shading='auto')

ax3.set_title('Deltas')
ax3.set(xlabel='Čas (s)', ylabel='Koeficienti')
ax3.pcolormesh(osX, osY, np.transpose(deltas), shading='auto')

ax4.set_title('Delta-deltas')
ax4.set(xlabel='Čas (s)', ylabel='Koeficienti')
ax4.pcolormesh(osX, osY, np.transpose(delta_deltas), shading='auto')


# In[23]:


plt.figure(figsize=(15, 3))
plt.title('Banke filtrov')
plt.xlabel('Frekvenca')
plt.ylabel('Amplituda')
t = np.linspace(LOW_FREQ, HIGH_FREQ, num=NFFT//2 + 1)
for fb in filter_banks:
    plt.plot(t, fb)
plt.show()


# ## Izračun s knjižnico za primerjavo

# In[51]:


_mfcc = mfcc(signal=x,
             samplerate=Fv,
             winlen=WINDOW_LENGTH/1000,
             winstep=0.01,
             numcep=MFCC_COEF_COUNT,
             nfilt=FILTERS_COUNT,
             nfft=4096,
             lowfreq=LOW_FREQ,
             highfreq=HIGH_FREQ)


# In[52]:


deltas = delta(_mfcc, DELTAS_LOOKAHEAD)
delta_deltas = delta(deltas, DELTAS_LOOKAHEAD)

fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(15, 9))
fig.subplots_adjust(hspace = 0.5)

osX = np.linspace(0, T, num=_mfcc.shape[0])
osY = np.linspace(1, _mfcc.shape[1], num=_mfcc.shape[1])

ax1.set_title('MFCC')
ax1.set(xlabel='Čas (s)', ylabel='Koeficienti')
ax1.pcolormesh(osX, osY, np.transpose(_mfcc), shading='auto')

ax2.set_title('Deltas')
ax2.set(xlabel='Čas (s)', ylabel='Koeficienti')
ax2.pcolormesh(osX, osY, np.transpose(deltas), shading='auto')

ax3.set_title('Delta-deltas')
ax3.set(xlabel='Čas (s)', ylabel='Koeficienti')
ax3.pcolormesh(osX, osY, np.transpose(delta_deltas), shading='auto')


# In[54]:


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


# ### VPRAŠANJA IZ VAJ

# #### VPRAŠANJE 1
# 
# Analizirajte ponovljivost vrednosti koeficientov MFCC, delta in delta-delta posameznega govorca pri ponovljeni izgovorjavi iste fraze z isto intonacijo (višino tona) in ob različnih intonacijah. <br>
# 
# <b>Odgovor:</b><br>
# neki

# In[66]:


#Posnetki fraze 'kajmak in marmelada' pri istem govorcu z različnimi intonacijami
posnetki = ['kinm', 'kinm_low', 'kinm_high']
titles = ['Kajmak in marmelada - normalno', 'Kajmak in marmelada - nizko', 'Kajmak in marmelada - visoko']
cuts = [[0.4, 2.4], [0.5, 2.5], [0.5, 2.5]]
fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(15, 10))
fig.subplots_adjust(hspace = 0.3)
axes = [ax1, ax2, ax3]
for i, p in enumerate(posnetki):
    c = cuts[i]
    x, params = load_recording(p, start=c[0], end=c[1])
    t = np.linspace(params['start'], params['end'], num=len(x))
    axes[i].plot(t, x)
    axes[i].set_title(titles[i])
ax2.set(ylabel='amplituda')
ax3.set(xlabel='čas (s)')


# In[123]:


#Parametri
WINDOW_LENGTH = 50 #Dolžina okna v ms
WINDOW_OVERLAP = 0.01
NFFT = 2048 #FFT 
FILTERS_COUNT = 26 #Število filtrov v bankah
LOW_FREQ = 0
HIGH_FREQ = Fv//2
MFCC_COEF_COUNT = 12 #Število obdržanih MFCC koeficientov
DELTAS_LOOKAHEAD = 5


# In[124]:


#MFCC KOEFICIENTI fraze 'kajmak in marmelada' pri istem govorcu z različnimi intonacijami
posnetki = ['kinm', 'kinm_low', 'kinm_high']
titles = ['MFCC', 'Delta', 'Delta-Delta ']
cuts = [[0.4, 2.4], [0.5, 2.5], [0.5, 2.5]]
fig, ((ax1, ax2, ax3), (ax4, ax5, ax6), (ax7, ax8, ax9)) = plt.subplots(3, 3, figsize=(15, 10))
fig.subplots_adjust(hspace = 0.5)
axes = [[ax1, ax2, ax3], [ax4, ax5, ax6], [ax7, ax8, ax9]]
for i, p in enumerate(posnetki):
    c = cuts[i]
    x, params = load_recording(p, start=c[0], end=c[1])
    frames = framming(x, window_length=WINDOW_LENGTH, window_overlap=WINDOW_OVERLAP, Fv=Fv)
    window = signal.hamming(frames.shape[1])
    X, pow_X = frames_DFT(frames, window, NFFT=NFFT)
    filter_banks = get_filter_banks(filters_count=FILTERS_COUNT,
                               low_freq=LOW_FREQ,
                               high_freq=HIGH_FREQ,
                               Fv=Fv,
                               NFFT=NFFT)
    fb, _mfcc = get_mfcc(filter_banks, pow_X, coef_count=MFCC_COEF_COUNT)
    deltas = delta(_mfcc, DELTAS_LOOKAHEAD)
    delta_deltas = delta(deltas, DELTAS_LOOKAHEAD)
    osX = np.linspace(params['start'], params['end'], num=_mfcc.shape[0])
    osY = np.linspace(1, _mfcc.shape[1], num=_mfcc.shape[1])
    
    ax = axes[i]
    ax[0].pcolormesh(osX, osY, np.transpose(_mfcc), shading='auto')
    ax[1].pcolormesh(osX, osY, np.transpose(deltas), shading='auto')
    ax[2].pcolormesh(osX, osY, np.transpose(delta_deltas), shading='auto')
ax1.set_title('MFCC')
ax4.set_title('MFCC')
ax7.set_title('MFCC')
ax2.set_title('Normalna izgovorjava \n Deltas')
ax5.set_title('Nizka izgovorjava \n Deltas')
ax8.set_title('Visoka izgovorjava \n Deltas')
ax3.set_title('Delta-Deltas')
ax6.set_title('Delta-Deltas')
ax9.set_title('Delta-Deltas')
ax4.set(ylabel='Koeficienti')
ax8.set(xlabel='Čas (s)')


# #### VPRAŠANJE 2
# 
# Analizirajte razlike v koeficientih MFCC, delta in delta-delta vsaj dveh govorcev pri ponovljeni izgovorjavi iste fraze z isto intonacijo (višino tona).  <br>
# 
# <b>Odgovor:</b><br>
# neki

# In[125]:


#Posnetki fraze 'kajmak in marmelada' pri istem govorcu z različnimi intonacijami
posnetki = ['kinm', 'kinm_mama']
titles = ['Kajmak in marmelada - Jaz', 'Kajmak in marmelada - Mama']
cuts = [[0.4, 2.4], [0.6, 2.6]]
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(15, 6))
fig.subplots_adjust(hspace = 0.3)
axes = [ax1, ax2]
for i, p in enumerate(posnetki):
    c = cuts[i]
    x, params = load_recording(p, start=c[0], end=c[1])
    t = np.linspace(params['start'], params['end'], num=len(x))
    axes[i].plot(t, x)
    axes[i].set_title(titles[i])
ax1.set(ylabel='amplituda')
ax2.set(xlabel='čas (s)')


# In[126]:


#MFCC KOEFICIENTI fraze 'kajmak in marmelada' pri raličnem govorcu z enako intonacijo
posnetki = ['kinm', 'kinm_mama']
titles = ['Kajmak in marmelada - Jaz', 'Kajmak in marmelada - Mama']
cuts = [[0.4, 2.4], [0.6, 2.6]]
fig, ((ax1, ax2, ax3), (ax4, ax5, ax6)) = plt.subplots(2, 3, figsize=(15, 6))
fig.subplots_adjust(hspace = 0.5)
axes = [[ax1, ax2, ax3], [ax4, ax5, ax6], [ax7, ax8, ax9]]
for i, p in enumerate(posnetki):
    c = cuts[i]
    x, params = load_recording(p, start=c[0], end=c[1])
    frames = framming(x, window_length=WINDOW_LENGTH, window_overlap=WINDOW_OVERLAP, Fv=Fv)
    window = signal.hamming(frames.shape[1])
    X, pow_X = frames_DFT(frames, window, NFFT=NFFT)
    filter_banks = get_filter_banks(filters_count=FILTERS_COUNT,
                               low_freq=LOW_FREQ,
                               high_freq=HIGH_FREQ,
                               Fv=Fv,
                               NFFT=NFFT)
    fb, _mfcc = get_mfcc(filter_banks, pow_X, coef_count=MFCC_COEF_COUNT)
    deltas = delta(_mfcc, DELTAS_LOOKAHEAD)
    delta_deltas = delta(deltas, DELTAS_LOOKAHEAD)
    osX = np.linspace(params['start'], params['end'], num=_mfcc.shape[0])
    osY = np.linspace(1, _mfcc.shape[1], num=_mfcc.shape[1])
    
    ax = axes[i]
    ax[0].pcolormesh(osX, osY, np.transpose(_mfcc), shading='auto')
    ax[1].pcolormesh(osX, osY, np.transpose(deltas), shading='auto')
    ax[2].pcolormesh(osX, osY, np.transpose(delta_deltas), shading='auto')
ax1.set_title('MFCC')
ax4.set_title('MFCC')
ax2.set_title('Jaz \n Deltas')
ax5.set_title('Mama \n Deltas')
ax3.set_title('Delta-Deltas')
ax6.set_title('Delta-Deltas')
ax1.set(ylabel='Koeficienti')
ax4.set(ylabel='Koeficienti')
ax5.set(xlabel='Čas (s)')


# In[107]:


plt.figure(figsize=(15, 3))
plt.title('Banke filtrov')
plt.xlabel('Frekvenca')
plt.ylabel('Amplituda')
t = np.linspace(LOW_FREQ, HIGH_FREQ, num=NFFT//2 + 1)
for fb in filter_banks:
    plt.plot(t, fb)
plt.show()


# In[108]:


plt.plot(window)
plt.title("Hammingovo okno")
plt.ylabel("Amplituda")
plt.xlabel("Vzorec")


# In[ ]:




