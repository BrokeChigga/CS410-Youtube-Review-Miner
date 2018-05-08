# CS410 Project - Youtube Reivew Miner
A Chrome Extension application that analyzes and mines YouTube reviews.
Create by Herbert Wang (rwang67@illinois.edu), Dorothy Yu (jyu65@illinois.edu), Ruoxi Yang (ryang28@illinois.edu)

## To Use Chrome Apps
###### The server is hosted on http://kite.cs.illinois.edu:5353/, if you are outside of UIUC campus, please be sure to securely connect to the UIUC campus network using VPN.
+ Demo video that shows how to use our application: [https://www.youtube.com/watch?v=yUv-jiRFoPw&feature=youtu.be](https://www.youtube.com/watch?v=yUv-jiRFoPw&feature=youtu.be)
+ Open Chrome and type chrome://extensions/ in the URL box. Make sure the developer mode is turned on. 
+ Unzip the ng-dashboard.zip and drag the unziped ng-dashboard folder onto the chrome://extensions/ page. 
+ Open a youtube page and click on our Chrome Extension button. If you have any question about Chrome extention, you can check-out here: [https://support.google.com/chrome/a/answer/2714278?hl=en](https://support.google.com/chrome/a/answer/2714278?hl=en).


#### If you would like to run the server locally:
To install requirements, go to Core directory and run:
```python
pip3 install -r requirement.txt
```
To run server, go to Core directory and run: 
```python
python3 chat.py
```
## Supported Functions
#### 1.	Sentiment graph:
###### Major Functionality: 
- Generate a graph displaying keys words appeared in the top most comments.
###### Method: 
- We pass the extracted comments in the right form to WordCloud which helps us to generate a picture. Then we display it in the front-end.
###### Example:
- (a). Open a Youtube video page;
- (b). Open our Chrome extension app;
- (c). Input a number of comments;
- (d). Click “Keywords Graph” button, and wait a few seconds while’s analyzing;
- (e). Click “Show Graph” button to see the graph.

#### 2.	Sentiment analysis:
###### Major Functionality: 
- Display a percentage of positive and negative comments.
###### Method: 
- We use a training dataset to train a Naïve Bayes classifier. This training dataset includes a positive words file, a negative words file, and an emoji data file. We then use the trained NB model to classify the comments, and each display an overall positive/negative tag. We also display a percentage of positive/negative comments w.r.t the number of comments specified by the user. During training and testing, we use Chi_square and bigram to tokenize the comments.
###### Example:
- (a). Open a Youtube video page;
       (b). Open our Chrome extension app;
- (c). Input number of comments to do sentiment analysis;
- (d). Click “See Comment Trend” button, and wait a few seconds while it’s analyzing;
- (f). Then you’ll see the display of the percentage of positive and negative comments.

#### 3.	Similar comments:
###### Major Functionality: 
- Display at most 10 most similar comments to a user selected comment.
###### Method: 
- We apply a machine learning algorithm to learn the similarity pattern among comments and display a number of most similar comments to the original one. We use the Sk-learn library to do machine learning, and use the Euclidean distance to calculate the similarity assuming all the comments are in the same vector space. (We think this assumption is reasonable because our App extracts a monotonous language (default: English) in each turn of analysis. User can specify other languages.)
###### Example:
- (a). Open a Youtube video page;
- (b). Scroll down to the comment block;
- (c). After the comments loaded, open our Chrome extension;
- (d). Click a comment that you’re interested in, and a bar showing “Find Top Similar Comments” will appear;
- (e). Use the dropdown menu to select the number of similar comments you’d like to see;
- (f). Check the box in front of the text bar, and wait a few seconds while it’s analyzing;
- (g). A list of similar comments will appear at the bottom of the text bar.

#### 4.	Bi-lingual sentiment analysis:
###### Major Functionality: 
Display the percentage of positive and negative comments where the comments are written in Chinese.
###### Method: 
We apply the same method we did for default (English) sentiment analysis. The differences are: (a). We use a Chinese training dataset including positive, negative, and emoji files; (b). We use UTF-8 to encode the words.
###### Example:
- (a). Open a Youtube video page;
- (b). Click “查看评论趋势”(translated as: “See Comment Trend”) button, and wait a few seconds while it’s analyzing;
- (c). Then you’ll see the display of the percentage of positive and negative comments.

#### 5.	Topic conclusion: 
###### Major Functionality: 
- Display comment-related topics.
###### Method: 
- We treat each extracted comment as a document and apply IDA model to generate a user specified number of summarized topics. Each topic has a default number of words. By observing these words, user will be able to know the main topics which are discussed in the comments.
###### Example:
- (a). Open a Youtube video page;
- (b). Open our Chrome extension;
- (c). Input the number of topics to conclude;
- (d). From the dropdown menu of the “Summarize …”, and click “Submit” button;
- (e). Wait a few seconds while it’s analyzing;
- (f). Then you’ll see the display of summarized topics below.

#### 6.	Thumbs up:
###### Major Functionality: 
- Display the most liked comment and the number of likes it received.
###### Method: 
- Simple Filter
###### Example:
- (a). Open a Youtube video page;
- (b). Scroll down to the comment block;
- (c). After the comments loaded, open our Chrome extension;
- (d). The most liked comment and its number of likes will display in the extension window.

