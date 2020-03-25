const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const multer = require('multer')
const { resolve, join } = require('path')
const upload = multer()

let app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

const path_images = resolve(__dirname, '../', 'images')

const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('toshokan_db', 'toshokan', 'toshokan', {
  host: 'localhost',
  dialect: 'mariadb'
})

class User extends Model {}
class Book extends Model {}
class Category extends Model {}
class Sale extends Model {}

User.init({
  name: DataTypes.STRING,
		username: {
			type: DataTypes.STRING,
			unique: true
		},
		email: {
			type: DataTypes.STRING,
			unique: true
		},
		password: DataTypes.STRING,
		permissions: {
			type: DataTypes.ENUM,
			values: ['admin', 'user']
		}
}, { sequelize, modelName: 'users' })

Book.init(
  {
    name: DataTypes.STRING,
    img: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    sinopse: DataTypes.STRING(5000)
  }, { sequelize, modelName: 'books' }
)

Category.init(
  {
    name: {
      type: DataTypes.STRING,
      unique: true
    }
  }, { sequelize, modelName: 'categories' }
)

Sale.init(
  {
    total: DataTypes.DOUBLE
  }, { sequelize, modelName: 'sales' }
)

User.belongsToMany(Book, { through: 'userbook' })
Book.belongsToMany(User, { through: 'userbook' })

Book.belongsToMany(Category, { through: 'bookcategory' })
Category.belongsToMany(Book, { through: 'bookcategory' })

User.hasMany(Sale, { as: 'sales' })

Sale.belongsToMany(Book, { through: 'salebook' })
Book.belongsToMany(Sale, { through: 'salebook' })

User.sync()
Book.sync()
Category.sync()
Sale.sync()

app.options('*', cors())

app.get('/download/images/:name', function(req, res, next) {
	let { name } = req.params

	fs.readFile(join(path_images, name), function(err, data) {
		if (err) {
			err.message = 'Erro ao ler o arquivo: ' + err.message
			return next({ status: 500, err })
		}
		res.status(200).send(data)
	})
})

app.post('/images/:name', upload.single('file'), function (req, res, next) {
	let file = req.file
	let { name } = req.params

	fs.writeFile(join(path_images, name), file.buffer, 'binary', function (err) {
		if (err) return next({ status: 500, err })
		res.status(201).end()
	})
})

app.get('/', function (req, res) {
  res.send('<h1>Bem vindo ao backend do sistema Toshokan!</h1>')
})

app.get('/users', function (req, res) {
  sequelize.sync()
  .then(() => User.findAll().then(users => {
    res.send(users)
  }))
})

app.get('/users/:id', function (req, res) {
  sequelize.sync()
  .then(() => User.findOne({ where: { id: req.params.id } }).then(users => {
    res.send(users)
  }))
})

app.post('/users', function (req, res) {
  let user = req.body
  sequelize.sync()
  .then(() => User.create(user).then(data => {
    res.status(201).send('User created - ' + data)
  }).catch(err => {
    res.status(500).send('Error - ' + err)
  }))
})

app.post('/users/login', function (req, res) {
  let user = req.body
  sequelize.sync()
  .then(() => User.findOne({ where: { username: user.username, password: user.password } }).then(data => {
    res.status(200).send(data.toJSON())
  }).catch(err => {
    res.status(500).send('Error - ' + err)
  }))
})

app.patch('/users/:id', function (req, res) {
  let user = req.body
  sequelize.sync()
  .then(() => User.update(user, { where: { id: req.params.id} })
  .then(data => {
    res.send('Updated - ' + data)
  }).catch(err => {
    res.status(500).send('Error - ', err)
  }))
})

app.delete('/users/:id', function (req, res) {
  sequelize.sync()
  .then(() => User.destroy({ where: { id: req.params.id } })
  .then(() => {
    res.send('Deleted')
  }).catch(err => {
    res.status(500).send('Error - ' + err)
  }))
})

app.get('/books', function (req, res) {
  sequelize.sync()
  .then(() => Book.findAll().then(books => {
    res.send(books)
  }))
})

app.get('/books/:id', function (req, res) {
  sequelize.sync()
  .then(() => Book.findOne({ where: { id: req.params.id } }).then(book => {
    res.send(book)
  }))
})

app.post('/books', function (req, res) {
  let book = req.body
  console.log(book)
  sequelize.sync()
  .then(() => Book.create(book).then(data => {
    res.status(201).send('Book created - ' + data)
  }).catch(err => {
    res.status(500).send('Error - ' + err)
  }))
})

app.patch('/books/:id', function (req, res) {
  let book = req.body
  sequelize.sync()
  .then(() => Book.update(book, { where: { id: req.params.id} })
  .then(data => {
    res.send('Updated - ' + data)
  }).catch(err => {
    res.status(500).send('Error - ', err)
  }))
})

app.delete('/books/:id', function (req, res) {
  sequelize.sync()
  .then(() => Book.destroy({ where: { id: req.params.id } })
  .then(() => {
    res.send('Deleted')
  }).catch(err => {
    res.status(500).send('Error - ' + err)
  }))
})

app.get('/categories', function (req, res) {
  sequelize.sync()
  .then(() => Book.findAll().then(categories => {
    res.send(categories)
  }))
})

app.get('/categories/:id', function (req, res) {
  sequelize.sync()
  .then(() => Category.findOne({ where: { id: req.params.id } }).then(category => {
    res.send(category)
  }))
})

app.post('/categories', function (req, res) {
  let category = req.body
  sequelize.sync()
  .then(() => Category.create(category).then(data => {
    res.status(201).send('Category created - ' + data)
  }).catch(err => {
    res.status(500).send('Error - ' + err)
  }))
})

app.patch('/categories/:id', function (req, res) {
  let category = req.body
  sequelize.sync()
  .then(() => Category.update(category, { where: { id: req.params.id} })
  .then(data => {
    res.send('Updated - ' + data)
  }).catch(err => {
    res.status(500).send('Error - ', err)
  }))
})

app.delete('/categories/:id', function (req, res) {
  sequelize.sync()
  .then(() => Category.destroy({ where: { id: req.params.id } })
  .then(() => {
    res.send('Deleted')
  }).catch(err => {
    res.status(500).send('Error - ' + err)
  }))
})

app.get('/sales', function (req, res) {
  sequelize.sync()
  .then(() => Book.findAll().then(sales => {
    res.send(sales)
  }))
})

app.get('/sales/:id', function (req, res) {
  sequelize.sync()
  .then(() => Sale.findOne({ where: { id: req.params.id } }).then(sale => {
    res.send(sale)
  }))
})

app.post('/sales', function (req, res) {
  let sale = req.body
  sequelize.sync()
  .then(() => Sale.create(sale).then(data => {
    res.status(201).send('Sale created - ' + data)
  }).catch(err => {
    res.status(500).send('Error - ' + err)
  }))
})

app.patch('/sales/:id', function (req, res) {
  let sale = req.body
  sequelize.sync()
  .then(() => Sale.update(sale, { where: { id: req.params.id} })
  .then(data => {
    res.send('Updated - ' + data)
  }).catch(err => {
    res.status(500).send('Error - ', err)
  }))
})

app.delete('/sales/:id', function (req, res) {
  sequelize.sync()
  .then(() => Sale.destroy({ where: { id: req.params.id } })
  .then(() => {
    res.send('Deleted')
  }).catch(err => {
    res.status(500).send('Error - ' + err)
  }))
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})