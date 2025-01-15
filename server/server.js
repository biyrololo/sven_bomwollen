import {WebSocketServer} from "ws";
import Game from "./game.js";
import Player from "./game/Player.js";

(function () {
    if(!Array.shuffle){
        Array.prototype.shuffle = function () {
            for (let i = this.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this[i], this[j]] = [this[j], this[i]];
            }
            return this;
        }
    }
})();

// Создаем WebSocket-сервер, который прос listens на порту 8080
const wss = new WebSocketServer({ port: 8080 });

const games = new Map();

const roomlistClients = [];

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Отправляем приветственное сообщение новому клиенту
    ws.send(JSON.stringify({message: 'connected_to_server'}));

    // Обработка сообщений от клиента
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(`received`, data);
        if(data.event === 'get_rooms'){
            ws.send(JSON.stringify({event: 'rooms', payload: Array.from(games.values()).map(game => game.id)}));
            return;
        }
        if(data.event === 'create_game'){
            // Проверяем, есть ли уже это соединение в какой-либо игре
            for(const game of games.values()){
                if(game.players.find(player => player.ws === ws)){
                    ws.send(JSON.stringify({event: 'already_in_game'}));
                    return;
                }
            }
            const game = new Game((g) => {
                games.delete(g._id);
                roomlistClients.forEach(c => c.send(JSON.stringify({event: 'deleted_game', payload: {id: g.id}})));
            });
            games.set(game.id, game);
            game.startUpdating();
            const player_id = game.addEntity(new Player({x: 0, y: 0}), ws, true);
            ws.send(JSON.stringify({event: 'connected', payload: {id: game.id, player_id: player_id}}));
            // console.log(game.json());
            ws.send(JSON.stringify({event: 'game_config', payload: game.json()}));
            roomlistClients.forEach(c => c.send(JSON.stringify({event: 'created_game', payload: {id: game.id, players: game.players.length}})));
            return;
        }

        if(data.event === 'join_game'){
            // проверяем, есть ли уже это соединение в какой-либо игре
            for(const game of games.values()){
                if(game.players.find(player => player.ws === ws)){
                    ws.send(JSON.stringify({event: 'already_in_game'}));
                    return;
                }
            }
            const game = games.get(data.id);
            if(!game){
                ws.send(JSON.stringify({event: 'game_not_found'}));
                return;
            }
            const player_id = game.addEntity(new Player({x: 0, y: 0}), ws, true);
            ws.send(JSON.stringify({event: 'connected', payload: {id: game.id, player_id: player_id}}));
            ws.send(JSON.stringify({event: 'game_config', payload: game.json()}));
            return;
        }

        // in-game события

        // проверка, есть ли игрок в игре
        let flag = false;
        for(const game of games.values()){
            if(game.players.find(player => player.ws === ws)){
                flag = true;
                break;
            }
        }
        if(!flag){
            ws.send(JSON.stringify({event: 'not_in_game'}));
            return;
        }
    });

    // Обработка отключения клиента
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

const roomlistws = new WebSocketServer({ port: 8081 });

roomlistws.on('connection', (ws) => {
    ws.send(JSON.stringify({message: 'connected_to_server'}));
    ws.send(JSON.stringify({event: 'rooms', payload: Array.from(games.values()).map(game => ({id:game.id, players: game.players.length}))}));
    roomlistClients.push(ws);
    ws.on('close', () => {
        roomlistClients.splice(roomlistClients.indexOf(ws), 1);
    })
});

console.log('Roomlist server is running on ws://localhost:8081');
