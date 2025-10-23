export const typeDefs = `
  type Category {
    id: Int!
    name: String!
    description: String!
  }

  type Subcategory {
    id: Int!
    name: String!
    description: String!
    category: Category!
  }

  type Product {
    id: Int
    name: String!
    description: String!
    price: Float!
    stock: Int!
    size: String!
    color: String!
    brand: String!
    subcategory: Subcategory!
    createdAt: String
    updatedAt: String
    createdBy: String
    updatedBy: String
    version: Int
  }

  input CategoryInput {
    id: Int!
    name: String!
    description: String!
  }

  input SubcategoryInput {
    id: Int!
    name: String!
    description: String!
    category: CategoryInput!
  }

  input ProductInput {
    name: String!
    description: String!
    price: Float!
    stock: Int!
    size: String!
    color: String!
    brand: String!
    subcategory: SubcategoryInput!
  }

  type Query {
    products: [Product!]!
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
  }
`;