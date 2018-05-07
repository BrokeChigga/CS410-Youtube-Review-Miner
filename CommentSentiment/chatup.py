from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect, send
try:
    from urllib.parse import urlparse
except ImportError:
    from urlparse import urlparse
from io import StringIO
import comment_extract as CE
import sentimentYouTube as SYT
import fancySentiment as FS
import sklearn_similarity as SS
import test_lda as TL

import json
import socketio
from socketio import Middleware
import eventlet
eventlet.sleep()
import eventlet.wsgi
eventlet.monkey_patch()

eventlet.listen(("localhost", 5353))

app = Flask(__name__)

sio = socketio.Server()

# app = Flask(__name__)
app.config[ 'SECRET_KEY' ] = 'jsbcfsbfjefebw237u3gdbdc'

users = {}
connections = []
dic = {}
storage = {}
youtube_id = None
count = 0
comments = None
comment_list = None

@app.route( '/' )
def hello():
  return render_template( './ChatApp.html' )

# @app.route('/', methods=['POST'])
# def public_data():
#     return flask.Response("foo" * 10, mimetype='text/plain')

@sio.on('connect')
def on_connect(sid, environ):
    print("connect ", sid) 
    sio.emit('hello', 'yes')


@sio.on( 'my event' )
def handle_my_custom_event(sid, json):
  print( 'recived my event: ' + str( json ) ) #user is the sid
  print ('current user id is: ' + sid)
  sio.emit( 'my response', json, callback=messageRecived )

@sio.on('join')
def on_join(sid, data):
    username = data['username']
    domain = data['domain_name']
    users[sid] = username;
    dic[sid] = domain
    join_room(domain)
    send(username + ' has entered your domain', room=domain)
    sio.emit('enter domain', 'You entered ' + domain + 'successfully!', room=sid)

def update_domain_user(cur_domain):
    roomuser = []
    roomsid = []
    for key in dic:
      if dic[key] == cur_domain:
          roomsid.append(key)
          roomuser.append(users[key])
    for ssid in roomsid:
        print(cur_domain)
        sio.emit('get users', roomuser, room=ssid)

@sio.on('exit')    
def on_exit(sid, data):
   pass

@sio.on('pre check')
def pre_check(sid, data):
    global youtube_id
    global comment_list
    print("Performing pre-check!!!!!!!")
    url = data['domain_name']
    youtube_id = url[url.find('=')+ 1: ]
    comment_list = CE.commentExtract(youtube_id, 200)
    f = open("sample_comment.txt", 'w')
    f_string = ''.join(str(e) for e in comment_list)
    f.write(f_string)
    f.close()

@sio.on('leave')    
def on_leave(sid, data):
    base_comment_str = data['base_comment_str']
    num_opt_scores = int(data['num_opt_scores'])
    output = SS.score_array(base_comment_str, comment_list, num_opt_scores)
    result = []
    for i in output:
        result.append(i.encode("utf-8"))
        
    sio.emit('sk_feedback', {'msg': result}, room=sid)

@sio.on('send message by desc')
def send_message_by_desc(sid, data):
   if data['commentCount'] == 0:
    return 
   global comments 
   global count

   count = data['commentCount']
   comments = CE.commentExtract(youtube_id, int(count))
   output = SYT.sentiment(comments)

   sio.emit('new message', {'msg': output}, room=sid)

@sio.on('send message')
def send_message(sid, data):
    global comments
    global count
    if data['commentCount'] == 0:
        return
    if data['commentCount'] != count:
        count = data['commentCount']
        comments = CE.commentExtract(youtube_id, int(count))

    encoded_string = FS.fancySentiment(comments)
    sio.emit('get users', {'msg': encoded_string}, room=sid)
    
@sio.on('new user')
def new_user(sid, data):
    topic_num = int(data['topic_num'])
    result = TL.lda("sample_comment.txt", topic_num, 15)
    sio.emit('feedback', {'msg': result}, room=sid)

if __name__ == '__main__':
    app = socketio.Middleware(sio, app)
    # deploy as an eventlet WSGI server
    # eventlet.wsgi.server(eventlet.listen(('127.0.0.1', 5353)), app) # Localhost
    # eventlet.wsgi.server(eventlet.wrap_ssl(eventlet.listen(('127.0.0.1', 5353)), certfile='cert.crt',keyfile='private.key',server_side=True), app) # Localhost
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 5353)), app) # kite Server
    eventlet.wsgi.server(eventlet.wrap_ssl(eventlet.listen(('0.0.0.0', 5353)), certfile='cert.crt',keyfile='private.key',server_side=True), app) # Kite Server
