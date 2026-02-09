import sequelize from './db/index.js';
import { seedPosts } from './db/seeders/seed-posts.js';

const runSeed = async () => {
    try {
        // Connect and init models
        await sequelize.authenticate();
        console.log('📦 Database connected');

        // Run seeders
        await seedPosts();

        console.log('✅ Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

runSeed();
