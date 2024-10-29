import "dotenv/config.js"
import mongoose from "mongoose"
import { Product, Category } from "./src/models/index.js";
import { categories, products } from "./seedData.js";


async function seedDataBase() {
    try {
        await mongoose.connect(process.env.MONGO_URL)

        await Product.deleteMany({});
        await Category.deleteMany({});

        const categoryDocs = await Category.insertMany(categories)

        const categoryMap = categoryDocs.reduce((map, category) => {
            map[category.name] = category._id;
            return map
        }, {})


        const productWithCategoryIds = products.map((product) => ({
            ...product,
            category: categoryMap[product.category],

        }))

        await Product.insertMany(productWithCategoryIds);

        console.log("Database seeded successfully")




    } catch (error) {
        console.log("error seeding database: ", error)
    } finally {
        mongoose.connection.close();
    }
}

seedDataBase();