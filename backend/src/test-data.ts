import mongoose from 'mongoose';
import Path from './models/path.model';
import Step from './models/step.model';
import User from './models/user.model';
import connectDB from './config/db';

const createTestData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Path.deleteMany({});
    await Step.deleteMany({});
    await User.deleteMany({});
    
    console.log('Creating test data...');
    
    // Create test user
    const testUser = new User({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'demo123'
    });
    await testUser.save();
    console.log('Test user created:', testUser.email);
    
    // Create test paths
    const webDevPath = new Path({
      title: 'Full Stack Web Development',
      description: 'Learn to build complete web applications from frontend to backend',
      category: 'web-development',
      difficulty: 'intermediate'
    });
    await webDevPath.save();
    
    const reactPath = new Path({
      title: 'React Fundamentals',
      description: 'Master React.js for building modern user interfaces',
      category: 'web-development',
      difficulty: 'beginner'
    });
    await reactPath.save();
    
    const nodeJSPath = new Path({
      title: 'Node.js Backend Development',
      description: 'Build scalable backend applications with Node.js and Express',
      category: 'web-development',
      difficulty: 'intermediate'
    });
    await nodeJSPath.save();
    
    const mobileDevPath = new Path({
      title: 'React Native Mobile Development',
      description: 'Create cross-platform mobile apps with React Native',
      category: 'mobile-development',
      difficulty: 'advanced'
    });
    await mobileDevPath.save();
    
    console.log('Test paths created');
    
    // Create test steps for Full Stack Web Development
    const webDevSteps = [
      {
        name: 'HTML Fundamentals',
        description: 'Learn the structure and semantics of HTML',
        path: webDevPath._id,
        order: 1,
        resourceLinks: ['https://developer.mozilla.org/en-US/docs/Web/HTML']
      },
      {
        name: 'CSS Styling',
        description: 'Master CSS for beautiful and responsive designs',
        path: webDevPath._id,
        order: 2,
        resourceLinks: ['https://developer.mozilla.org/en-US/docs/Web/CSS']
      },
      {
        name: 'JavaScript Basics',
        description: 'Learn JavaScript programming fundamentals',
        path: webDevPath._id,
        order: 3,
        resourceLinks: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript']
      },
      {
        name: 'React Introduction',
        description: 'Get started with React.js for building UIs',
        path: webDevPath._id,
        order: 4,
        resourceLinks: ['https://react.dev/']
      },
      {
        name: 'Node.js Backend',
        description: 'Build server-side applications with Node.js',
        path: webDevPath._id,
        order: 5,
        resourceLinks: ['https://nodejs.org/']
      }
    ];
    
    // Create test steps for React Fundamentals
    const reactSteps = [
      {
        name: 'React Setup',
        description: 'Set up your React development environment',
        path: reactPath._id,
        order: 1,
        resourceLinks: ['https://react.dev/learn/installation']
      },
      {
        name: 'Components and JSX',
        description: 'Learn about React components and JSX syntax',
        path: reactPath._id,
        order: 2,
        resourceLinks: ['https://react.dev/learn/writing-markup-with-jsx']
      },
      {
        name: 'State and Props',
        description: 'Understand state management and component props',
        path: reactPath._id,
        order: 3,
        resourceLinks: ['https://react.dev/learn/managing-state']
      }
    ];
    
    // Create test steps for Node.js
    const nodeSteps = [
      {
        name: 'Node.js Introduction',
        description: 'Understanding Node.js runtime and its capabilities',
        path: nodeJSPath._id,
        order: 1,
        resourceLinks: ['https://nodejs.org/en/docs/']
      },
      {
        name: 'Express.js Framework',
        description: 'Build web servers with Express.js',
        path: nodeJSPath._id,
        order: 2,
        resourceLinks: ['https://expressjs.com/']
      },
      {
        name: 'Database Integration',
        description: 'Connect your app to MongoDB database',
        path: nodeJSPath._id,
        order: 3,
        resourceLinks: ['https://mongoosejs.com/']
      }
    ];
    
    // Create test steps for Mobile Development
    const mobileSteps = [
      {
        name: 'React Native Setup',
        description: 'Set up React Native development environment',
        path: mobileDevPath._id,
        order: 1,
        resourceLinks: ['https://reactnative.dev/docs/environment-setup']
      },
      {
        name: 'Navigation',
        description: 'Implement navigation in React Native apps',
        path: mobileDevPath._id,
        order: 2,
        resourceLinks: ['https://reactnavigation.org/']
      }
    ];
    
    // Insert all steps
    const allSteps = [...webDevSteps, ...reactSteps, ...nodeSteps, ...mobileSteps];
    const createdSteps = await Step.insertMany(allSteps);
    
    // Update paths with step references
    const webDevStepIds = createdSteps.slice(0, 5).map(step => step._id);
    const reactStepIds = createdSteps.slice(5, 8).map(step => step._id);
    const nodeStepIds = createdSteps.slice(8, 11).map(step => step._id);
    const mobileStepIds = createdSteps.slice(11, 13).map(step => step._id);
    
    await Path.findByIdAndUpdate(webDevPath._id, { steps: webDevStepIds });
    await Path.findByIdAndUpdate(reactPath._id, { steps: reactStepIds });
    await Path.findByIdAndUpdate(nodeJSPath._id, { steps: nodeStepIds });
    await Path.findByIdAndUpdate(mobileDevPath._id, { steps: mobileStepIds });
    
    console.log('Test steps created and linked to paths');
    console.log(`Created ${createdSteps.length} steps across ${4} paths`);
    
    console.log('✅ Test data creation completed successfully!');
    console.log('You can now test the application with:');
    console.log('- Email: demo@example.com');
    console.log('- Password: demo123');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestData();