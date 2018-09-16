const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList
  } = require("graphql");

const dataFetch = require("node-fetch");

const util = require("util");
const parseXML = util.promisify(require("xml2js").parseString);


const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "...",

    fields: () => ({
        name: {
            type: GraphQLString
        }
    })
});

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "Query",
        description: "...",

        fields: () => ({
            author: {
                type: AuthorType,
                args: {
                    id: { type: GraphQLInt }
                },
                resolve: (root: any, args: any) => dataFetch(
                    `https://www.goodreads.com/author/show.xml?id=${args.id}&key=da63o925A7lKWVmHfPvOA`
                )
                .then((response: any) => response.text())
                .then(parseXML)
            }
        })
    })
});