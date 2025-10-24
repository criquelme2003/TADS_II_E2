import { z } from 'zod';

const stringField = (min: number, max?: number) => {
    let schema = z.string().trim().min(min, {
        message: `Too small: expected string to have >=${min} characters`
    });

    if (typeof max === 'number') {
        schema = schema.max(max, {
            message: `Too big: expected string to have <=${max} characters`
        });
    }

    return schema;
};

const positiveInteger = z.coerce
    .number()
    .int({ message: 'Value must be an integer' })
    .min(1, { message: 'Value must be positive' });

const nonNegativeInteger = z.coerce
    .number()
    .int({ message: 'Value must be an integer' })
    .min(0, { message: 'Value cannot be negative' });

const positiveNumber = z.coerce
    .number()
    .min(0.0000001, { message: 'Value must be greater than 0' });

const categorySchema = z.object({
    id: positiveInteger,
    name: stringField(1, 120),
    description: stringField(1, 500)
});

const subcategorySchema = z.object({
    id: positiveInteger,
    name: stringField(1, 120),
    description: stringField(1, 500),
    category: categorySchema
});

const productBaseSchema = z.object({
    name: stringField(3, 120),
    description: stringField(5, 1000),
    price: positiveNumber,
    stock: nonNegativeInteger,
    size: stringField(1, 50),
    color: stringField(1, 50),
    brand: stringField(1, 120),
    subcategory: subcategorySchema
});

export const createProductSchema = productBaseSchema;

export const updateProductSchema = productBaseSchema;

export const partialProductSchema = z.object({
    name: stringField(3, 120).optional(),
    description: stringField(5, 1000).optional(),
    price: positiveNumber.optional(),
    stock: nonNegativeInteger.optional(),
    size: stringField(1, 50).optional(),
    color: stringField(1, 50).optional(),
    brand: stringField(1, 120).optional(),
    subcategory: z
        .object({
            id: positiveInteger,
            name: stringField(1, 120).optional(),
            description: stringField(1, 500).optional(),
            category: categorySchema.optional()
        })
        .optional()
});

export const idParamSchema = z.object({
    id: z
        .string()
        .trim()
        .regex(/^\d+$/, 'id must be a positive integer')
});
