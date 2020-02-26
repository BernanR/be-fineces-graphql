const { GraphQLServer } = require('graphql-yoga')
const Binding = require('prisma-binding')
const { prisma } = require('./generated/prisma-client')

const resolvers = require('./resolvers')

const server = new GraphQLServer({
  typeDefs: `${__dirname}/schema.graphql`,
  resolvers,
  context: request => ({
    ...request,  //essa funcionalidade (spread oparator) serve para pegar todas as propriedade de um objeto 
    db: new Binding.Prisma({
      typeDefs: `${__dirname}/generated/graphql-schema/prisma.graphql`,
      endpoint: process.env.PRISMA_ENDPOINT
    }),
    prisma
  })
})

server.start().then(() => console.log('Server running: http://localhost:4000...'))