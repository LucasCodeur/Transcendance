import { Server } from "socket.io";
import { db } from "#lib/server/db/client.ts";
import * as cookie from "cookie";
import { validateSession } from '#lib/server/auth/session.js';

export const websocketServer = {
        name: "ahah",
        configureServer: (serv: any) => {
			const io = new Server(serv.httpServer);

			io.use(async (socket, next) => {
				console.log("socket.request.headers:");
				console.log(socket.request.headers);
				console.log(socket.request.headers.cookie);
				console.log(typeof socket.request.headers.cookie);

				if (!socket.request.headers.cookie) {
				 	next(new Error('error while authentication of websocket'));
				}
				else {
					const provided_cookie = cookie.parseCookie(socket.request.headers.cookie);
					if (!provided_cookie.session)
						next(new Error('error while authentication of websocket'));
					else {
						const token = provided_cookie.session
						const result = await validateSession(token);
						if (!result) {
							next(new Error('error while authentication of websocket'));
						}
						else {
							if (!result.user)
								next(new Error('error while authentication of websocket'));
							socket.user = result.user;
						}
					}
				}
				// if (!token)
				// 	next(new Error('no token provided'));


				next();
					//const result = await validateSession(token);
			});

			io.on('connection', (client) => {
				// console.log(client);
				console.log("websocket connection received");
				console.log("client.user:");
				console.log(client.user);
				client.on("loadConversation", (data) => {
					// console.log(client);
					console.log("a client asked for a conversation");
					// console.dir(data, {depth: null});
				})

				console.log("~~~~~~~~~~~~~~~~~~~~~~");
				for (let [id, socket] of io.of("/").sockets) {
					console.log(`socket.user.displayName: ${socket.user.displayName}`);
					// console.dir(`socket:`, {depth: null});
					// console.dir(socket, {depth: null});

				}
				console.log("~~~~~~~~~~~~~~~~~~~~~~");
				/*
				client.on("data", (data) => {
					client.emit("data", data);
					client.broadcast.emit("data", data);
					// console.log("received from a client: ")
					// console.log(data);
				});
				*/
				client.on("send_message", async (data) => {
					console.log("receive send_message event");
					console.log("data:");
					console.log(data);
					console.log("client . user = ");
					console.log(client.user);
					if (!data.to) {
						return;
					}
					console.log(`client ${client.user.displayName} wants to send a message to ${data.to}`);
					// check if both are friend !
					// if that is the case then
					// add message to db,
					// if other end is connected, send him the message
					const userToSendMessage = await db.orm.public.User.select("id").where({displayName: data.to}).first();
					if (userToSendMessage === null)
						return;
					const friendship = await db.orm.public.Friend.where({userId: client.user.id}).where({friendId: userToSendMessage.id}).first();
					if (friendship === null || friendship.type !== "accepted")
						return;
					// add the message to the db
					let time = new Date();
					time = time.toISOString();
					await db.orm.public.User.where({id: client.user.id}).update({
						messages: (m) => m.create({
								receiverId: userToSendMessage.id,
								content: data.content,
								timestamp: time,	 
							}),
					});
					for (let [id, socket] of io.of("/").sockets) {
						if (socket.user.id === userToSendMessage.id) {
							socket.emit("new_message", {
								timestamp: time,
								reciever: socket.user.displayName, 
								sender: client.user.displayName, 
								content: data.content
							});
							client.emit("new_message", {
								timestamp: time,
								receiver: socket.user.displayName, 
								sender: client.user.displayName, 
								content: data.content
							});
						}
						// console.dir(`socket:`, {depth: null});
						// console.dir(socket, {depth: null});
					}
				});
			});
		},
};
