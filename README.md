# API de Productos

## 1. GET ALL - Obtener todos los productos

**Endpoint:**
```
GET http://localhost:3000/api/products/
```

---

## 2. GET BY ID - Obtener un producto por su ID

**Endpoint:**
```
GET http://localhost:3000/api/products/1
```

---

## 3. POST - Crear un nuevo producto

**Endpoint:**
```
POST http://localhost:3000/api/products/
```

**Headers obligatorios:**
```
Content-Type: application/json
Authorization: Bearer secreto123
```

**Body (raw - JSON):**
```json
{
  "name": "Zapatilla Running Pro",
  "description": "Zapatilla profesional para running",
  "price": 89.99,
  "stock": 25,
  "size": "42",
  "color": "Negro/Rojo",
  "brand": "SportMax",
  "subcategory": {
    "id": 101,
    "name": "Running",
    "description": "Calzado especializado para correr",
    "category": {
      "id": 1001,
      "name": "Deportivo",
      "description": "Calzado para actividades deportivas"
    }
  }
}
```

---

## 4. PUT - Actualizar producto completo

**Endpoint:**
```
PUT http://localhost:3000/api/products/1
```

**Body (JSON - mismo formato que POST):**
```json
{
  "name": "Zapatilla Running Pro ACTUALIZADA",
  "description": "Nueva descripción actualizada",
  "price": 99.99,
  "stock": 50,
  "size": "43",
  "color": "Azul/Blanco",
  "brand": "SportMax Pro",
  "subcategory": {
    "id": 101,
    "name": "Running",
    "description": "Calzado especializado para correr",
    "category": {
      "id": 1001,
      "name": "Deportivo",
      "description": "Calzado para actividades deportivas"
    }
  }
}
```

---

## 5. PATCH - Actualizar campos específicos de un producto

**Endpoint:**
```
PATCH http://localhost:3000/api/products/1
```

**Body (JSON - solo los campos a actualizar):**
```json
{
  "price": 79.99,
  "stock": 30,
  "color": "Verde"
}
```

---

## 6. DELETE - Eliminar un producto por su ID

**Endpoint:**
```
DELETE http://localhost:3000/api/products/1
```

---

## GraphQL

**Endpoint:**
```
http://localhost:3000/graphql
```

### Query para obtener todos los productos:

```graphql
query {
  products {
    id
    name
    description
    price
    stock
    size
    color
    brand
    subcategory {
      id
      name
      category {
        name
      }
    }
  }
}
```

### Query solo campos específicos:

```graphql
query {
  products {
    id
    name
    price
    brand
  }
}
```

### Mutation - Crear producto:

```graphql
mutation {
  createProduct(input: {
    name: "Producto desde GraphQL"
    description: "Creado usando GraphQL"
    price: 199.99
    stock: 15
    size: "42"
    color: "Negro"
    brand: "GraphQL Brand"
    subcategory: {
      id: 1
      name: "Running"
      description: "Calzado para correr"
      category: {
        id: 1
        name: "Deportivo"
        description: "Calzado deportivo"
      }
    }
  }) {
    id
    name
    price
    brand
  }
}
```