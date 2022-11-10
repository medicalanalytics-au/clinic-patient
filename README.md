Author: Zulkarnain Shariff

# Patient's portal for clinic usage

## Project Overview

### History
Project started with a design that is similar to Uber/Ride sharing concept of matching Doctors and Patients online.
A scheduling system, with internal messaging and news updates were added to the capabilities.

However, project backers requested that it is used in their own local clinic.
Scheduling, messaging and news functions were removed (hidden, but implementation codes remains) to accommodate.

### Current implementation

Application now starts with a Dashboard that loads the Doctor's/Patient's appointments immediately on start. 

### System Implementation and Structure
There are two front facing interfaces (Doctor's and Patient's portals) developed completely separate, but with similar structure and theme to 
ensure consistency. Both frontend interfaces are written in ReactJs, and hosted on a server running NodeJs, which serves the built static
pages for both apps individually.

#### Backend
Backend is hosted on an Ubuntu server running NGINX proxy/webserver with TLS.

All requests are directed to a NodeJs/Express application, with MongoDB/Mongoose as the database.

Communication between client to host utilises a XHR fetch() for CRUD operations, and Socket.io for messaging and notifications.

Video handshakes are conducted through a PeerJs module, which negotiates ICE candidates with a COTURN turnserver. Video transmission is conducted 
through a WebRTC module.

Emails are sent through a commercial package called Twilio SendGrid

