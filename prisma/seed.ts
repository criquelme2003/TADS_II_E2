import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Crear categorías
    const deportivo = await prisma.category.upsert({
        where: { name: 'Deportivo' },
        update: {},
        create: {
            name: 'Deportivo',
            description: 'Calzado para actividades deportivas',
        },
    });

    const formal = await prisma.category.upsert({
        where: { name: 'Formal' },
        update: {},
        create: {
            name: 'Formal',
            description: 'Calzado para ocasiones formales',
        },
    });

    console.log('✅ Categories created');

    // Crear subcategorías
    const running = await prisma.subcategory.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Running',
            description: 'Calzado especializado para correr',
            categoryId: deportivo.id,
        },
    });

    const botines = await prisma.subcategory.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Botines',
            description: 'Botines para uso formal y casual',
            categoryId: formal.id,
        },
    });

    console.log('✅ Subcategories created');

    // Crear productos
    await prisma.product.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Zapatilla Running Pro',
            description: 'Zapatilla profesional para running',
            price: 89.99,
            stock: 25,
            size: '42',
            color: 'Negro/Rojo',
            brand: 'SportMax',
            subcategoryId: running.id,
            createdBy: 'system',
            updatedBy: 'system',
        },
    });

    await prisma.product.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Botín Clásico Premium',
            description: 'Botín de cuero para uso formal',
            price: 129.99,
            stock: 15,
            size: '41',
            color: 'Marrón',
            brand: 'ElegantShoes',
            subcategoryId: botines.id,
            createdBy: 'system',
            updatedBy: 'system',
        },
    });

    console.log('✅ Products created');
    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });