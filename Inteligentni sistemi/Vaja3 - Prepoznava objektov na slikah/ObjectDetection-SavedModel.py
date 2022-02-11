#!/usr/bin/env python
# coding: utf-8

# In[1]:


import tensorflow as tf
import numpy as np
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import pathlib
from object_detection.utils import label_map_util
from object_detection.utils import visualization_utils as viz_utils
from PIL import Image
import matplotlib.pyplot as plt
get_ipython().run_line_magic('matplotlib', 'inline')
import warnings
import cv2
warnings.filterwarnings('ignore')


# ### Tensorflow error settings

# In[2]:


tf.get_logger().setLevel('ERROR')


# In[3]:


gpus = tf.config.experimental.list_physical_devices('GPU')
for gpu in gpus:
    tf.config.experimental.set_memory_growth(gpu, True)


# ### Path definitions

# In[4]:


path_to_tf_workspace = 'C:/Users/Tomaz/Tensorflow/workspace/'
workspace_folder = 'training_demo/'
model_name = 'centernet_hg104_1024x1024_coco17_tpu-32'
#model_name = 'my_model'


# In[5]:


path_to_saved_model = path_to_tf_workspace + workspace_folder + 'exported-models/' + model_name + '/saved_model/'
print(path_to_saved_model)


# In[6]:


#If using own model, load my labels
PATH_TO_LABELS = path_to_tf_workspace + workspace_folder + 'annotations/label_map.pbtxt'


# In[7]:


#If using downloaded model, download labels aswell
def download_labels(filename):
    base_url = 'https://raw.githubusercontent.com/tensorflow/models/master/research/object_detection/data/'
    label_dir = tf.keras.utils.get_file(fname=filename,
                                        origin=base_url + filename,
                                        untar=False)
    label_dir = pathlib.Path(label_dir)
    return str(label_dir)

LABEL_FILENAME = 'mscoco_label_map.pbtxt'
PATH_TO_LABELS = download_labels(LABEL_FILENAME)


# In[8]:


print(PATH_TO_LABELS)


# ### Load model

# In[9]:


detect_fn = tf.saved_model.load(path_to_saved_model)


# ### Load labels

# In[12]:


category_index = label_map_util.create_category_index_from_labelmap(PATH_TO_LABELS, use_display_name=True)


# ### Load img and inference functions

# In[13]:


def load_image_as_np(path):
    img = Image.open(path)
    if path[-4:] == '.png':
        return cv2.cvtColor(np.array(img), cv2.COLOR_BGRA2BGR)
    else:       
        return np.array(img)
    
def do_inference(image_np):
    input_tensor = tf.convert_to_tensor(image_np)
    input_tensor = input_tensor[tf.newaxis, ...]
    detections = detect_fn(input_tensor)
    
    num_detections = int(detections.pop('num_detections'))
    detections = {key: value[0, :num_detections].numpy()
                 for key, value in detections.items()}
    detections['num_detections'] = num_detections
    detections['detection_classes'] = detections['detection_classes'].astype(np.int64)
    
    image_np_with_detections = image_np.copy()
    
    viz_utils.visualize_boxes_and_labels_on_image_array(
          image_np_with_detections,
          detections['detection_boxes'],
          detections['detection_classes'],
          detections['detection_scores'],
          category_index,
          use_normalized_coordinates=True,
          max_boxes_to_draw=10,
          min_score_thresh=.3,
          agnostic_mode=False)
    return image_np_with_detections


# ### Test on 4 images

# In[14]:


images = ['1_1002.png', '1_1008.png', '1_1012.png', 'Screenshot_1.png']
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(10, 10))
axes = [ax1, ax2, ax3, ax4]
for i, img in enumerate(images):
    print('Running inference for {}... '.format(img))
    image_np = load_image_as_np('./TestImages/' + img)  
   
    image_np_with_detections = do_inference(image_np)

    axes[i].imshow(image_np_with_detections)
    
plt.show()


# ### Test on video

# In[15]:


video_name="Object_detection_test2.mp4"
video = cv2.VideoCapture('./TestVideos/' + video_name)
if (video.isOpened()==False):
    print("Error")

render_every_nth_frame = 2
frame_counter = 0
while(video.isOpened()):
    ret, frame = video.read()
    if ret == True:
        if frame_counter%render_every_nth_frame==0:
            frame_with_detections = do_inference(np.array(frame))
            cv2.imshow(video_name, cv2.resize(frame_with_detections, (800,600)))
            
            if cv2.waitKey(25) & 0xFF == ord('q'):
                break
        frame_counter += 1
    else:
        break
        
video.release()
cv2.destroyAllWindows()


# In[ ]:




