import express, { Request, Response } from 'express'
import neo4j from 'neo4j-driver'

interface Identity {low:number}
interface Relation {identity : Identity, type : string}
interface Node {identity : Identity, labels : string[], properties : {name : string}}
interface Dataset {identity : Identity, labels : string[], properties : {[key : string] : any}}
export const app:express.Application = express()
const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j', 'tony2003'))
const cors = require('cors')

app.use(cors())
app.use(express.static('/home/christo/Code/nasa-oinv/server/app'))

app.get('/Dataset/getAllRelations',
  // Request Body : {identity : <dataset-id>}
  // Response Bode : [{relation : {identity : number, type : string}, node : {identity : number, name : string, type : string}}]
  async (req : Request, res : Response) => {
    const identity : number = JSON.parse(req.query.identity as string)
    const session = driver.session()
    try {
      const result = await session.run(
        'MATCH (d:Dataset)-[relation]-(node) WHERE id(d) = $identity return relation, node',
        { identity: identity }
      )
      console.log('Sending Query Result')

      const dat = []
      for (const record of result.records) {
        const relation : Relation = record.get('relation')
        const node : Node = record.get('node')
        dat.push({ relation: { identity: relation.identity.low, type: relation.type }, node: { identity: node.identity.low, name: node.properties.name, type: node.labels[0] } })
      }
      console.log(`Query for relations to ${identity} done, sending response`)

      res.send(dat)
    } catch (error) {
      console.log('Query Failed !')
      console.log(error)

      res.status(400)
      res.send(error)
    } finally {
      await session.close()
    }
  })

app.get('/Node/getAllRelations',
  // Request Body : {identity : number}
  // Response Body : [{relation : {identity : number, type : string}, node : {identity : number, type : string, name}}]
  async (req : Request, res : Response) => {
    console.log(req.query.identity, req.query.type)
    const identity : number = Number(req.query.identity as string)
    const session = driver.session()
    try {
      const result = await session.run(
        'MATCH (d)-[relation]-(node) WHERE id(d) = $identity RETURN relation, node LIMIT 100',
        { identity: identity }
      )
      const dat = []
      for (const record of result.records) {
        const relation : Relation = record.get('relation')
        const node : Node = record.get('node')
        dat.push({ relation: { identity: relation.identity.low, type: relation.type }, node: { identity: node.identity.low, name: node.properties.name, type: node.labels[0] } })
      }
      console.log(`Query for relations to ${identity} done, sending response`)

      res.send(dat)
    } catch (error) {
      console.log('Query Failed !')
      console.log(error)

      res.status(400)
      res.send(error)
    } finally {
      await session.close()
    }
  })
// Depreceated
app.get('/Dataset/info',
  // Request Body : {identity : number}
  // Response Body : {identity : number, properties : {name : string, identifier : string, landingPage : string, accrualPeriodicity :string, description : string,  dataQuality : string , license :string, issued:string, distribution : object}}
  async (req : Request, res : Response) => {
    const identity : number = Number(req.query.identity as string)
    const session = driver.session()
    try {
      const result = await session.run(
        'MATCH (d:Dataset) WHERE id(d) = $identity return d',
        { identity: identity }
      )
      console.log('Sending Query Result')

      const dat = []
      for (const record of result.records) {
        console.log(record.toObject())
        const dataset : Dataset = record.get('d')
        dat.push({ identity: dataset.identity.low, type: dataset.labels[0], properties: dataset.properties })
      }
      console.log(`Query for relations to ${identity} done, sending response `)

      res.send(dat[0])
    } catch (error) {
      console.log('Query Failed !')
      console.log(error)

      res.status(400)
      res.send(error)
    } finally {
      await session.close()
    }
  }
)

app.get('/Node/info',
  // Request Body : {identity : number}
  // Response Body : {identity : number, type: string, properties : {name: string, ...}}
  async (req : Request, res : Response) => {
    const identity : number = Number(req.query.identity as string)
    const session = driver.session()
    try {
      const result = await session.run(
        'MATCH (node) WHERE id(node) = $identity return node',
        { identity: identity }
      )

      const dat = []
      for (const record of result.records) {
        console.log(record.toObject())
        const dataset : Dataset = record.get('node')
        dat.push({ identity: dataset.identity.low, type: dataset.labels[0], properties: dataset.properties })
      }
      console.log(`Query for info about ${identity} done, sending response `)

      res.send(dat[0])
    } catch (error) {
      console.log('Query Failed !')
      console.log(error)

      res.status(400)
      res.send(error)
    } finally {
      await session.close()
    }
  }
)
// Depreceated
app.get('/Dataset/get', 
  async (req: Request, res : Response) =>{
    const session = driver.session()
    try {
      const result = await session.run(
        'MATCH (node : Dataset) RETURN node LIMIT  25',
      )

      const dat = []
      for (const record of result.records) {
        console.log(record.toObject())
        const dataset : Dataset = record.get('node')
        dat.push({ identity: dataset.identity.low, type: dataset.labels[0], properties: {name : dataset.properties.name} })
      }
      console.log(`Query to get some datasets `)

      res.send(dat)
    } catch (error) {
      console.log('Query Failed !')
      console.log(error)

      res.status(400)
      res.send(error)
    } finally {
      await session.close()
    }
  })

app.get('/Node/search',
// request body : { term : string }
// response body : [{identity : number, type : stiring, name : string}]
  async (req: Request, res:Response)=> {
    const term : string = req.query.term as string
    console.log('Searching for a node with term : '+ term);
    const session = driver.session()
    try {
      const result = await session.run(
        'CALL db.index.fulltext.queryNodes("SearchAll",  $term) YIELD node, score RETURN id(node), labels(node)[0], node.name LIMIT  25',
        {term : term}
      )

      const dat = []
      for (const record of result.records) {
        dat.push({ identity: record.get('id(node)'), type: record.get('labels(node)[0]'), name: record.get('node.name')} )
      }

      res.send(dat)
    } catch (error) {
      console.log('Query Failed !')
      console.log(error)

      res.status(400)
      res.send(error)
    } finally {
      await session.close()
    }

  }
)

app.get('/query', async (req : Request, res : Response) => {
  const query : string = req.query.string as string
  const data : any = JSON.parse(req.query.data as string)
  const session = driver.session()
  try {
    const result = await session.run(
      query,
      data
    )
    console.log('Sending Query Result')
    console.log(typeof (result.records))

    res.send(result.records)
  } catch (error) {
    console.log('Query Failed !')
    res.status(400)
    res.send(error)
  } finally {
    await session.close()
  }
})

app.get('/app', (req :Request, res: Response) =>{
  console.log('app visited');
  
  res.sendFile('/home/christo/Code/nasa-oinv/server/app/index.html')

})
