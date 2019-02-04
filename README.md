Node-redis echo

Hi,

Covering words:
Because I didn't quite understand "logic of printing message behind the load balancer" but wanted to do over the weekend,
I implemented logic like described in p 4. "Notices", but I can re-implement in absolutely any approach.


1. Used tools:
-node 10
-pm2
-docker to spin up architecture.
-express
-redis
-redis pub/sub *please look at Notices, point 3

2. Launch:
npm i # because we are using volumes, so our folder (inc. node_modules) will be mounted to container,  if I would develop production mode I would move it to the image

docker-compose up

3. Swagger has been added
http://localhost:8080/public/swagger-ui.html/


4. Notices:
1. Used HASH like storage type, but I aware that LIST also actually can be used.
2. Because I didn't quite understand "logic of printing message" I implemented like this: 
	--The server under "load balancer" who is first catch message: will print it and remove from HASH structure.
	
3. Detail cases description:	
3.1 When message is coming to the on of load-balanced servers from API endpoint: server publish message to the redis-channel; 
    for ensuring subscription of all sibling load-balanced servers to this message and also subscribe itself, because
    if this server then go down before the time has come: one of the sibling servers can proccess out/print this message instead of died server.
3.2 If all servers suddenly died, then upon starting back: 
    each of them will check the HASH of messages and will print messages which should have been already processed out during "down-time".	
    Also will do setTimeout for all future messages: 
	Here we have an option to optimize a little - set only one "closest in time" timeout and after it was processed, set next one. 
	But to simplify things I set up all.
3.3 Output: So if server died, one of sibling servers will print message instead, if all servers died, than each of them will set Timeouts back upon starting.
    So we minimize chance to lost all records.
	




