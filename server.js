const jsonServer = require('json-server')
const url = require('url')

const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()



function format(data, meta) {
	const newData = Object.assign({}, {data}, {meta})
	return newData
}

function parseQueryStringToJson(query) {
	const pairs = query.split('&')
	return pairs.reduce((c, p) => {
		const [key, value] = p.split('=')
		c[key] = value
		return c
	}, {})
}

router.render = function (req, res) {
  if (req.method === 'GET' && res.get('X-Total-Count')) {
  	const query = url.parse(req.url).query
  	const obj = parseQueryStringToJson(query)

    const newData = format(res.locals.data, {total: res.get('X-Total-Count'), page: parseInt(obj['_page']), size: parseInt(obj['_limit'])})
    res.json(newData)
  } else {
    res.json(res.locals.data)
  }
}

server.use(middlewares)
server.use(jsonServer.bodyParser)

server.use(router)
server.listen(8080, () => {
  console.log('JSON Server is running')
})


