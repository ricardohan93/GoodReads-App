const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList
  } = require("graphql");

const dataFetch = require("node-fetch");
const DataLoader = require("dataloader");

const util = require("util");
const parseXML = util.promisify(require("xml2js").parseString);

const fetchAuthor = (id: any) => (
    dataFetch(`https://www.goodreads.com/author/show.xml?id=${id}&key=da63o925A7lKWVmHfPvOA`)
        .then((response: any) => response.text())
        .then(parseXML)
);

const fetchBook = (id: any): any =>
    dataFetch(`https://www.goodreads.com/book/show/${id}.xml?key=da63o925A7lKWVmHfPvOA`)
        .then((response: any): any => response.text())
        .then(parseXML);

const authorLoader = new DataLoader((keys: any) =>
    Promise.all(keys.map(fetchAuthor)));

const bookLoader = new DataLoader((keys: any) =>
Promise.all(keys.map(fetchBook)));

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "...",

    fields: () => ({
        title: {
            type: GraphQLString,
            resolve: (xml: any): any =>
                xml.GoodreadsResponse.book[0].title[0]
        },
        isbn: {
            type: GraphQLString,
            resolve: (xml: any): any =>
                xml.GoodreadsResponse.book[0].isbn[0]
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve: (xml: any): any => {
                const authorElements = xml.GoodreadsResponse.book[0].authors[0].author;
                const ids = authorElements.map((elem: any) => elem.id[0]);

                return authorLoader.loadMany(ids);
            }
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
            resolve: (xml: any): any => {
                const ids = xml.GoodreadsResponse.author[0].books[0].book.map((elem: any): any => elem.id[0]._);
                return bookLoader.loadMany(ids);
            }
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
                resolve: (root: any, args: any) => authorLoader.load(args.id)
            }
        })
    })
});