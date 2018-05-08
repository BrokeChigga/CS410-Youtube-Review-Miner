# YouTube Review Miner Server
# Create by Herbert Wang (rwang67@illinois.edu)
using Flask-socketio with eventlet to allow mixed content http + wss
To install requirements:
```python
pip3 install -r requirement.txt
```
To run server: 
```python
python3 chat.py
```
If you would to run the server locally, you can change the WebSocket connection code which is the “if” statement at the bottom of the chat.py, the first two lines are for eventlet localhost and 2 lines below are for Kite server.  
```python
app = socketio.Middleware(sio, app)
    # deploy as an eventlet WSGI server
    # eventlet.wsgi.server(eventlet.listen(('127.0.0.1', 5353)), app) # Localhost
    # eventlet.wsgi.server(eventlet.wrap_ssl(eventlet.listen(('127.0.0.1', 5353)), certfile='cert.crt',keyfile='private.key',server_side=True), app) # Localhost
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 5353)), app) # kite Server
    eventlet.wsgi.server(eventlet.wrap_ssl(eventlet.listen(('0.0.0.0', 5353)), certfile='cert.crt',keyfile='private.key',server_side=True), app) # Kite Server
```
Also make sure to change the connection option in Chrome extension under background.js: 
```python
 # socket = io.connect('http://127.0.0.1:5353/');
   socket = io.connect('http://kite.cs.illinois.edu:5353/');
```