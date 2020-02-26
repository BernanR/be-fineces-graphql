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


module.exports = {
  accounts,
  categories,
  user
}