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

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "...",

    fields: () => ({
        title: {
            type: GraphQLString,
            resolve: (xml: any): any =>
                xml.title[0]
        },
        isbn: {
            type: GraphQLString,
            resolve: (xml: any): any =>
                xml.isbn[0]
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "...",

    fields: () => ({
        name: {
            type: GraphQLString,
            resolve: (xml: any): any =>
                xml.GoodreadsResponse.author[0].name[0]
        },
        books: {
            type: new GraphQLList(BookType),
            resolve: (xml: any): any =>
                xml.GoodreadsResponse.author[0].books[0].book
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