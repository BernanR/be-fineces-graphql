const moment = require('moment')
/*
  obs: Todas as querys utilizadas aqui, devem ser referenciadas primeiramente no arquivo
  schema.graphql, nesse arquivo serão expostos somente as querys que serão utilizadas no projeto,
  essa medida evita vunerabilidade no sistema.

  * Estudar schema delegation, que é referente esse parametro info passado nas funçẽs.

*/

const { getUserId } = require('./../utils')

function user(_, args, ctx, info){
  const userId = getUserId(ctx)
  return ctx.db.query.user({ where: {id: userId }}, info)
}

/*
  obj: Listar as contas cadastradas no banco
  regra:  Lista todas as contas de um usuário passando o id, 
          ou tráz todas as contas que não possui id 
*/
function accounts(_, args, ctx, info){
  const userId = getUserId(ctx)
  return ctx.db.query.accounts({ 
    where: {
      OR : [
        {
          user: {
            id: userId
          }
        },
        {
          user : null
        }
      ]
    },
    orderBy: 'description_ASC'
  },info)
}

/*
  obj: Listar todas as categorias de um usuário permitindo passar alguns parâmetros adicionais
  *obs: Nota que na variavel AND vai existir um operador ternario para eles, eis aqui uma breve explicação de como isso funciona.
  primeiramente vai notar que existe um spread operator que serve para copiar todas as propriedade de um objeto e a condição é a seguinte:
  (se houver operation) ? recebe ela mesma sem nenhuma alteração : faz uma cópia dela mesma e adiciona o operator
*/

function categories(_, { operation }, ctx, info){
  const userId = getUserId(ctx)

  let AND = [
    {
      OR : [
        { user: { id: userId } },
        { user : null }
      ]
    }
  ]

  AND = !operation ? AND : [ ...AND, { operation } ]

  return ctx.db.query.categories({ 
    where: { 
      AND
    },
    orderBy: 'description_ASC'
  },info)
}

function records(_, { month, type, accountsIds, categoriesIds }, ctx, info){
  const userId = getUserId(ctx)

  let AND = [ { user: { id: userId } } ]
  AND = !type ? AND : [ ...AND , { type } ]

  AND = !accountsIds || accountsIds.length === 0
  ? AND
  : [ 
    ...AND,
    { OR: accountsIds.map( id => ({ account: { id } })) }
  ]

  AND = !categoriesIds || categoriesIds.length === 0
  ? AND
  : [ 
    ...AND,
    { OR: categoriesIds.map(id => ({ category: { id } })) }
  ]

  if(month) {
    const date = moment(month, 'MM-YYYY') //06-2019
    const startDate = date.startOf('month').toISOString()
    const endDate = date.endOf('month').toISOString()
    AND = [
      ...AND,
      {date_gte: startDate},
      {date_lte: endDate},
    ]
  }

  return ctx.db.query.records({
    where: { AND },
    orderBy: 'date_ASC'
  }, info )

}

function totalBalance(_, {date}, ctx, info){
  const userId = getUserId(ctx)
  const dateISO = moment(date, 'YYYY-MM-DD').endOf('day').toISOString()
  const pgSchema =  `${process.env.PRISMA_SERVICE}$${process.env.PRISMA_STAGE}`
  const mutation = `
    mutation TotalBalance($database: PrismaDatabase, $query: String!){
      executeRaw(database: $database, query: $query)
    }
  `
  const variables = {
    database: 'default',
    query: `
      select 
      sum(rec.amount) as totalbalance
      from "${pgSchema}"."Record" rec
        inner join "${pgSchema}"."_RecordToUser" use
          on use."A" = rec."id"        
        where use."B" = '${userId}'
        and rec."date" <= '${dateISO}'
    `
  }

  /* 
    não foi possível utilizar o prisma bilding, para trabalhar com querys personalizadas
    por isso o uso do prisma client, que no caso não há problemas, já que estamos trazendo 
    somentes alguns campos em espeficifo.
  */

  return ctx.prisma.$graphql(mutation, variables)
    .then(response => {
      const totalBalance = response.executeRaw[0].totalbalance;
      return totalBalance ? totalBalance : 0 ;
    })

}

module.exports = {
  accounts,
  categories,
  user,
  records,
  totalBalance
}
