const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // MIDDLEWARE
  const {username} = request.headers;

  const user = users.find(user => user.username === username)

  if(!user){
    return response.status(404).json({error: "User not found"})
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  //recebendo dados de name e username;
  const {name, username} = request.body;

  //valiando se ja existe um username cadastrado
  const checksExistsUserAccount = users.some((user)=> user.username === username)
  
  if(checksExistsUserAccount){
    return response.status(400).json({error: 'Username already exists!'})
  }

  //se tudo estiver correto, ele vai fazer um push dessar informacoes no array users

  const user = { 
      id: uuidv4(),
      name, 
      username, 
      todos: []
    }

  users.push(user)
  return response.status(201).json(user)

});

app.get('/todos', checksExistsUserAccount,(request, response) => {
  const {user} = request;

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;
  
  const todo = { 
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  //recebenodo recursos pelo corpo da request
  const {title, deadline} = request.body;
  //recebendo o user pelo middleware
  const {user} = request
  //recebeno parametros pelos parametros a url
  const {id} = request.params


  //encontrando a todo dentro do array e validando pelo id
  const todo = user.todos.find(todo => todo.id === id)
  
  if(!todo){
    return response.status(404).json({error: "Todo not exists!"})
  }
  //alterando dados da todo selecionada
    todo.title = title
    todo.deadline = new Date(deadline)

    const resp = {
      id,
      title,
      done: todo.done,
      deadline,
      created_at: todo.created_at
    }

  return response.status(200).json(resp)  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({error: "Todo not exists!"})
  }

  todo.done = true
   
  return response.status(201).json(todo);
});

///////

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({error: "Todo not exists!"})
  }

  user.todos.splice(user.todos.indexOf(todo),1)

  return response.status(204).send()

});

module.exports = app;