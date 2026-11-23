import { Server } from "socket.io";
import { db } from "#lib/server/db/client.ts";
import { websocketServerAuth } from './websocketServerAuth.ts';

export const websocketServer = {
        name: "ahah",
        configureServer: (serv: any) => {
			const io = new Server(serv.httpServer);

			io.use(websocketServerAuth);

			io.on('connection', (client) => {

				displayConnectedClients(io);

				client.on("send_message", async (data) => {
					handleIncomingConnection(data, client, io);
				});
			});
		},
};


function displayConnectedClients(io) {
	console.log("~~~~~~~~~~~~~~~~~~~~~~");
	for (let [id, socket] of io.of("/").sockets) {
		console.log(`socket.user.displayName: ${socket.user.displayName}`);
	}
	console.log("~~~~~~~~~~~~~~~~~~~~~~");
}

async function handleIncomingConnection(data, client, io) {

	if (!data.to) {
		return ;
	}

	// here, add a zod scheme to check if the message is of valid format !

	// check users as permissions to add the user !
	const userToSendMessage = await db.orm.public.User.select("id", "displayName").where({displayName: data.to}).first();
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

	// send message to both ends !
	// send message back to client
	client.emit("new_message", {
		timestamp: time,
		receiver: userToSendMessage.displayName, 
		sender: client.user.displayName, 
		content: data.content
	});
	// send message to corresponding friend !
	for (let [id, socket] of io.of("/").sockets) {
		if (socket.user.id === userToSendMessage.id) {
			socket.emit("new_message", {
				timestamp: time,
				reciever: socket.user.displayName, 
				sender: client.user.displayName, 
				content: data.content
			});
		}
	}
}
