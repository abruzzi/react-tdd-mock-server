const jsonServer = require('json-server')
const url = require('url')

const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

const _ = require('lodash')

function format(data, meta) {
	const newData = Object.assign({}, {data}, {meta})
	return newData
}

function parseQueryStringToJson(query) {
  if(!query) {
    return {}
  }

	const pairs = query.split('&')
	return pairs.reduce((c, p) => {
		const [key, value] = p.split('=')
		c[key] = value
		return c
	}, {})
}

server.use((req, res, next) => {
  const query = url.parse(req.url).query
  req.query = parseQueryStringToJson(query)
  next()
})

server.use((req, res, next) => {
  const parts = req.path.split('/')

  if(!_.isNaN(_.toNumber(_.last(parts)))) {
    req.entity = _.nth(parts, -2)
  } else {
    req.entity = _.last(parts)
  }

  next()
})


server.use((req, res, next) => {
  if(req.method === 'DELETE' && req.query['_cleanup']) {
    const db = router.db
    db.set(req.entity, []).write()
    res.sendStatus(204)
  } else {
    next()  
  }
})

server.use(middlewares)
server.use(jsonServer.bodyParser)


server.use(router)
server.listen(8080, () => {
  console.log('JSON Server is running')
})


