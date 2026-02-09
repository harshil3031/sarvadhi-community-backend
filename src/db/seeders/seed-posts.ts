import { Channel, Post, User } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

export const seedPosts = async () => {
    try {
        console.log('🌱 Seeding Posts...');

        // Get the General channel
        const generalChannel = await Channel.findOne({ where: { name: 'General' } });
        if (!generalChannel) {
            console.error('❌ General channel not found! Run initial seed first.');
            return;
        }

        // Get the Admin user
        const adminUser = await User.findOne({ where: { email: 'admin@sarvadhi.com' } });
        if (!adminUser) {
            console.error('❌ Admin user not found!');
            return;
        }

        // Check if welcome post already exists
        const existingWelcomePost = await Post.findOne({
            where: {
                channelId: generalChannel.id,
                isPinned: true
            }
        });

        if (!existingWelcomePost) {
            // Create a pinned welcome post
            await Post.create({
                id: uuidv4(),
                content: 'Welcome to the new Sarvadhi Community App! 🎉\n\nThis is the beginning of our new digital workspace. Feel free to explore channels, join groups, and start conversations.',
                authorId: adminUser.id,
                channelId: generalChannel.id,
                isPinned: true,
                isDeleted: false
            });
            console.log('📌 Created welcome post');
        } else {
            console.log('ℹ️ Welcome post already exists');
        }

        // Check if update post already exists
        const existingUpdatePost = await Post.findOne({
            where: {
                channelId: generalChannel.id,
                content: 'We represent a major update to our internal tools. The backend is now powered by Node.js and the mobile app is built with React Native and Expo.'
            }
        });

        if (!existingUpdatePost) {
            // Create a regular update post
            await Post.create({
                id: uuidv4(),
                content: 'We represent a major update to our internal tools. The backend is now powered by Node.js and the mobile app is built with React Native and Expo.',
                authorId: adminUser.id,
                channelId: generalChannel.id,
                isPinned: false,
                isDeleted: false
            });
            console.log('📝 Created update post');
        } else {
            console.log('ℹ️ Update post already exists');
        }
        console.log('✅ Posts seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding posts:', error);
    }
};
